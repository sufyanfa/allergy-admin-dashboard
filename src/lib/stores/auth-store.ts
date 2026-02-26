import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, AppPermission } from '@/types'
import apiClient from '@/lib/api/client'

// Development-only logger - silent in production
const isDev = process.env.NODE_ENV === 'development'
const devWarn = isDev ? (...args: unknown[]) => console.warn('[Auth]', ...args) : () => {}
const devError = isDev ? (...args: unknown[]) => console.error('[Auth]', ...args) : () => {}

interface AuthState {
  user: User | null
  permissions: AppPermission[]
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  tokenExpiry: number | null
  isHydrated: boolean
}

interface AuthActions {
  login: (email: string, otp: string) => Promise<void>
  logout: () => Promise<void>
  getProfile: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  setError: (error: string | null) => void
  clearError: () => void
  validateToken: () => boolean
  refreshTokens: () => Promise<void>
  initializeAuth: () => Promise<void>
  setHydrated: (hydrated: boolean) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      permissions: [],
      isAuthenticated: false,
      isLoading: true, // true until initializeAuth() completes — blocks AuthGuard from showing children early
      error: null,
      tokenExpiry: null,
      isHydrated: false,

      // Actions
      login: async (email: string, otp: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              method: 'email',
              identifier: email,
              code: otp,
            }),
          })

          const responseData = await response.json()

          if (responseData.success) {
            // Extract user and tokens from response
            let { user } = responseData.data
            const { tokens } = responseData.data

            // Extract tokens from the tokens object
            // Note: refresh_token is stripped from the response by the server route
            // and stored as an httpOnly cookie — it never reaches this code.
            const finalAccessToken = tokens?.access_token || tokens?.accessToken
            const finalExpiresIn = tokens?.expires_in || tokens?.expiresIn

            // Validate tokens exist
            if (!finalAccessToken) {
              throw new Error('No access token received from server')
            }

            // Extract permissions from JWT token
            let extractedPermissions: AppPermission[] = []
            let userRole = user.role

            if (finalAccessToken) {
              try {
                const jwtPayload = JSON.parse(atob(finalAccessToken.split('.')[1]))

                // Extract permissions from JWT
                if (jwtPayload.permissions && Array.isArray(jwtPayload.permissions)) {
                  extractedPermissions = jwtPayload.permissions as AppPermission[]
                }

                // Extract role from JWT (prefer JWT role over user object role)
                if (jwtPayload.user_role) {
                  userRole = jwtPayload.user_role
                }

                // Update user object with JWT data
                user = {
                  ...user,
                  role: userRole,
                  permissions: extractedPermissions
                }
              } catch {
                devWarn('Could not parse JWT token')
              }
            }

            // Check if user has admin role or admin permissions
            const isAdmin = userRole === 'admin'
            const hasAdminPermissions = extractedPermissions.some(p =>
              p.startsWith('users.') || p.startsWith('system.')
            )

            if (!isAdmin && !hasAdminPermissions) {
              throw new Error('Access denied. Admin privileges required.')
            }

            // Calculate token expiry time
            const tokenExpiry = Date.now() + (finalExpiresIn ? finalExpiresIn * 1000 : 604800000) // Default 1 week

            // Store access token in memory only.
            // httpOnly cookies (access + refresh) are set by the verify-otp server route.
            apiClient.setToken(finalAccessToken, tokenExpiry)

            set({
              user,
              permissions: extractedPermissions,
              isAuthenticated: true,
              isLoading: false,
              tokenExpiry
            })
          } else {
            throw new Error(responseData.message || 'Login failed')
          }
        } catch (error: unknown) {
          const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || (error as Error)?.message || 'Login failed'
          set({
            error: message,
            isLoading: false,
            isAuthenticated: false,
            user: null,
            permissions: [],
            tokenExpiry: null
          })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })

        try {
          // Server route clears httpOnly cookies AND notifies the backend
          await fetch('/api/auth/logout', { method: 'POST' })
        } catch {
          devError('Logout failed')
        } finally {
          apiClient.clearToken()
          set({
            user: null,
            permissions: [],
            isAuthenticated: false,
            isLoading: false,
            error: null,
            tokenExpiry: null,
          })
        }
      },

      getProfile: async () => {
        set({ isLoading: true, error: null })

        try {
          const response = await apiClient.get<{
            success: boolean
            message?: string
            data: { profile: User }
          }>('/profiles/me')

          if (response.success) {
            let user = response.data.profile

            // Extract permissions from current token if available
            let extractedPermissions: AppPermission[] = user.permissions || []
            const token = apiClient.getStoredToken()

            if (token && !extractedPermissions.length) {
              try {
                const jwtPayload = JSON.parse(atob(token.split('.')[1]))
                if (jwtPayload.permissions && Array.isArray(jwtPayload.permissions)) {
                  extractedPermissions = jwtPayload.permissions as AppPermission[]
                }
                if (jwtPayload.user_role) {
                  user = { ...user, role: jwtPayload.user_role }
                }
              } catch {
                devWarn('Could not parse JWT token')
              }
            }

            // Check if user has admin role or admin permissions
            const isAdmin = user.role === 'admin'
            const hasAdminPermissions = extractedPermissions.some(p =>
              p.startsWith('users.') || p.startsWith('system.')
            )

            if (!isAdmin && !hasAdminPermissions) {
              throw new Error('Access denied. Admin privileges required.')
            }

            // Update user object with permissions
            user = { ...user, permissions: extractedPermissions }

            set({
              user,
              permissions: extractedPermissions,
              isAuthenticated: true,
              isLoading: false
            })
          } else {
            throw new Error(response.message || 'Failed to get profile')
          }
        } catch (error: unknown) {
          const status = (error as any)?.status
          const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || (error as Error)?.message || 'Failed to get profile'

          // Only clear auth state on genuine auth failures (401/403).
          // Network errors (CSP blocks, server down) must NOT log the user out —
          // they are transient and the tokens are still valid.
          const isAuthError = status === 401 || status === 403

          if (isAuthError) {
            set({
              error: message,
              isLoading: false,
              isAuthenticated: false,
              user: null,
              permissions: [],
              tokenExpiry: null,
            })
            apiClient.clearToken()
            // Clear httpOnly cookies via server route (best-effort)
            fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
          } else {
            // Transient error — keep existing auth state, just stop loading
            set({ error: message, isLoading: false })
          }
        }
      },

      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true, error: null })

        try {
          const response = await apiClient.put<{
            success: boolean
            message?: string
            data: { profile: User }
          }>('/profiles/me', data)

          if (response.success) {
            const updatedUser = response.data.profile
            set({
              user: { ...get().user, ...updatedUser },
              isLoading: false
            })
          } else {
            throw new Error(response.message || 'Failed to update profile')
          }
        } catch (error: unknown) {
          const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || (error as Error)?.message || 'Failed to update profile'
          set({
            error: message,
            isLoading: false
          })
          throw error
        }
      },

      setError: (error: string | null) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },

      validateToken: () => {
        const { tokenExpiry } = get()
        if (!tokenExpiry) return false
        return Date.now() < tokenExpiry
      },

      initializeAuth: async () => {
        const { isHydrated } = get()

        // Wait for Zustand persist rehydration to complete
        if (!isHydrated) {
          set({ isLoading: false })
          return
        }

        set({ isLoading: true })

        try {
          const token = apiClient.getStoredToken()

          if (token) {
            // In-memory token is still alive (same JS session, no page reload)
            await get().getProfile()
          } else {
            // No in-memory token (e.g. page reload) — try to restore the session
            // silently using the httpOnly refresh cookie via the server route.
            try {
              await get().refreshTokens()
              await get().getProfile()
            } catch {
              // Refresh failed: session is gone, clear persisted UI state
              set({
                user: null,
                permissions: [],
                isAuthenticated: false,
                tokenExpiry: null,
              })
            }
          }
        } catch {
          devError('Auth initialization failed')
          set({
            user: null,
            permissions: [],
            isAuthenticated: false,
            tokenExpiry: null,
            error: 'Authentication initialization failed',
          })
        } finally {
          set({ isLoading: false })
        }
      },

      setHydrated: (hydrated: boolean) => {
        set({ isHydrated: hydrated })
      },

      refreshTokens: async () => {
        set({ isLoading: true, error: null })

        try {
          // Server route reads the httpOnly refresh cookie — no body or token needed
          const response = await fetch('/api/auth/refresh-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })

          const responseData = await response.json()

          if (responseData.success) {
            const data = responseData.data
            const accessToken = data?.access_token || data?.accessToken
            const expiresIn = data?.expires_in || data?.expiresIn

            if (!accessToken) throw new Error('No access token in refresh response')

            const tokenExpiry = Date.now() + (expiresIn ? expiresIn * 1000 : 3600000)
            apiClient.setToken(accessToken, tokenExpiry)

            set({ isLoading: false, tokenExpiry })
          } else {
            throw new Error(responseData.message || 'Token refresh failed')
          }
        } catch (error: unknown) {
          const message = (error as Error)?.message || 'Token refresh failed'
          set({
            error: message,
            isLoading: false,
            isAuthenticated: false,
            user: null,
            permissions: [],
            tokenExpiry: null,
          })
          apiClient.clearToken()
          // Clear httpOnly cookies via server route (best-effort)
          fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
          throw error
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
        // tokenExpiry is intentionally NOT persisted — it belongs to the in-memory
        // token only and is always restored via the httpOnly refresh cookie on reload.
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true)
        }
      },
    }
  )
)