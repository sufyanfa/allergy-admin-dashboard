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
      isLoading: false,
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
            const finalAccessToken = tokens?.access_token || tokens?.accessToken
            const finalRefreshToken = tokens?.refresh_token || tokens?.refreshToken
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

            // Store tokens securely
            apiClient.setToken(finalAccessToken, tokenExpiry)
            if (typeof window !== 'undefined') {
              // Store refresh token with httpOnly flag simulation
              if (finalRefreshToken) {
                localStorage.setItem('admin_refresh_token', finalRefreshToken)
              }
              localStorage.setItem('admin_token_expiry', tokenExpiry.toString())
            }

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
          await apiClient.post('/auth/logout')
        } catch {
          devError('Logout failed')
        } finally {
          // Clear local state regardless of API response
          apiClient.clearToken()
          if (typeof window !== 'undefined') {
            localStorage.removeItem('admin_refresh_token')
            localStorage.removeItem('admin_token_expiry')
          }

          set({
            user: null,
            permissions: [],
            isAuthenticated: false,
            isLoading: false,
            error: null,
            tokenExpiry: null
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
              tokenExpiry: null
            })
            apiClient.clearToken()
            if (typeof window !== 'undefined') {
              localStorage.removeItem('admin_refresh_token')
              localStorage.removeItem('admin_token_expiry')
            }
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
        const storedExpiry = typeof window !== 'undefined'
          ? localStorage.getItem('admin_token_expiry')
          : null

        // Use stored expiry if tokenExpiry from state is not available (during hydration)
        const expiryTime = tokenExpiry || (storedExpiry ? parseInt(storedExpiry, 10) : null)

        if (!expiryTime) return false
        return Date.now() < expiryTime
      },

      initializeAuth: async () => {
        const { isHydrated, isAuthenticated } = get()

        // Wait for hydration to complete
        if (!isHydrated) return

        set({ isLoading: true })

        try {
          const token = apiClient.getStoredToken()

          if (token && !isAuthenticated) {
            // Check if token is valid
            if (get().validateToken()) {
              // Set token and get profile
              const storedExpiry = typeof window !== 'undefined'
                ? localStorage.getItem('admin_token_expiry')
                : null

              if (storedExpiry) {
                const expiryTime = parseInt(storedExpiry, 10)
                apiClient.setToken(token, expiryTime)

                // Update tokenExpiry in state if it's missing
                if (!get().tokenExpiry) {
                  set({ tokenExpiry: expiryTime })
                }
              } else {
                apiClient.setToken(token)
              }

              await get().getProfile()
            } else {
              // Token expired, try to refresh
              try {
                await get().refreshTokens()
              } catch {
                // Refresh failed, clear everything
                get().logout()
              }
            }
          } else if (token && isAuthenticated) {
            // Token present and already marked authenticated — restore it into
            // the ApiClient in-memory state (lost on page reload) and keep going.
            const storedExpiry = typeof window !== 'undefined'
              ? localStorage.getItem('admin_token_expiry')
              : null
            const expiryTime = get().tokenExpiry || (storedExpiry ? parseInt(storedExpiry, 10) : undefined)
            apiClient.setToken(token, expiryTime)
          } else if (!token && isAuthenticated) {
            // Access token is gone from localStorage (e.g. cleared by a previous
            // session bug) but refresh token and zustand state are still valid.
            // Try a silent refresh before logging the user out.
            const refreshToken = typeof window !== 'undefined'
              ? localStorage.getItem('admin_refresh_token')
              : null

            if (refreshToken) {
              try {
                await get().refreshTokens()
                // Refresh succeeded — user data already in persisted zustand state.
                // No need to re-fetch profile; the new token is now in localStorage.
              } catch {
                // Refresh also failed — session is truly gone
                set({
                  user: null,
                  permissions: [],
                  isAuthenticated: false,
                  tokenExpiry: null
                })
              }
            } else {
              // No refresh token either — clear everything
              set({
                user: null,
                permissions: [],
                isAuthenticated: false,
                tokenExpiry: null
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
            error: 'Authentication initialization failed'
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
          const refreshToken = typeof window !== 'undefined'
            ? localStorage.getItem('admin_refresh_token')
            : null

          if (!refreshToken) {
            throw new Error('No refresh token available')
          }

          // Use apiClient directly — backend requires snake_case { refresh_token }
          const responseData = await apiClient.post<any>('/auth/refresh-token', {
            refresh_token: refreshToken,
          })

          if (responseData.success) {
            // Handle both old and new token response formats
            const tokens = responseData.data?.tokens || responseData.data
            const accessToken = tokens.access_token || tokens.accessToken
            const newRefreshToken = tokens.refresh_token || tokens.refreshToken
            const expiresIn = tokens.expires_in || tokens.expiresIn

            // Calculate new token expiry
            const tokenExpiry = Date.now() + (expiresIn ? expiresIn * 1000 : 604800000)

            // Update tokens
            apiClient.setToken(accessToken, tokenExpiry)
            if (typeof window !== 'undefined') {
              localStorage.setItem('admin_refresh_token', newRefreshToken)
              localStorage.setItem('admin_token_expiry', tokenExpiry.toString())
            }

            set({
              isLoading: false,
              tokenExpiry
            })
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
            tokenExpiry: null
          })

          // Clear invalid tokens
          apiClient.clearToken()
          if (typeof window !== 'undefined') {
            localStorage.removeItem('admin_refresh_token')
            localStorage.removeItem('admin_token_expiry')
          }

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
        tokenExpiry: state.tokenExpiry
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true)
        }
      },
    }
  )
)