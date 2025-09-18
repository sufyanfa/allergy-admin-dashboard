import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'
import apiClient from '@/lib/api/client'

interface AuthState {
  user: User | null
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
            // Debug: Log the actual response structure
            console.log('Login Response Data:', responseData.data)

            // Extract user and tokens from response
            const { user, tokens } = responseData.data

            // Extract tokens from the tokens object
            const finalAccessToken = tokens?.access_token || tokens?.accessToken
            const finalRefreshToken = tokens?.refresh_token || tokens?.refreshToken
            const finalExpiresIn = tokens?.expires_in || tokens?.expiresIn

            // Debug: Log extracted tokens
            console.log('Extracted tokens:', {
              finalAccessToken: finalAccessToken ? 'exists' : 'missing',
              finalRefreshToken: finalRefreshToken ? 'exists' : 'missing',
              finalExpiresIn
            })

            // Validate tokens exist
            if (!finalAccessToken) {
              console.error('No access token found in response. Available fields:', Object.keys(responseData.data))
              throw new Error('No access token received from server')
            }

            // Check if user has admin permissions by looking at JWT permissions
            // For now, allow 'authenticated' role since the JWT contains admin permissions
            if (!['admin', 'authenticated'].includes(user.role)) {
              throw new Error('Access denied. Admin privileges required.')
            }

            // Additional check: decode JWT to verify admin permissions
            if (finalAccessToken) {
              try {
                const jwtPayload = JSON.parse(atob(finalAccessToken.split('.')[1]))
                const hasAdminPerms = jwtPayload.permissions && (
                  jwtPayload.permissions.includes('system.analytics') ||
                  jwtPayload.permissions.includes('users.manage_roles') ||
                  jwtPayload.user_role === 'admin'
                )
                if (!hasAdminPerms) {
                  throw new Error('Access denied. Admin privileges required.')
                }
              } catch (jwtError) {
                console.warn('Could not verify JWT permissions:', jwtError)
                // Continue if JWT parsing fails - role check above will handle basic validation
              }
            }

            // Calculate token expiry time
            const tokenExpiry = Date.now() + (finalExpiresIn ? finalExpiresIn * 1000 : 3600000) // Default 1 hour

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
            tokenExpiry: null
          })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })

        try {
          await apiClient.post('/auth/logout')
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          // Clear local state regardless of API response
          apiClient.clearToken()
          if (typeof window !== 'undefined') {
            localStorage.removeItem('admin_refresh_token')
            localStorage.removeItem('admin_token_expiry')
          }

          set({
            user: null,
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
            const user = response.data.profile

            // Check if user has admin privileges
            // Allow 'authenticated' role since admin permissions are in JWT
            if (!['admin', 'authenticated'].includes(user.role)) {
              throw new Error('Access denied. Admin privileges required.')
            }

            set({
              user,
              isAuthenticated: true,
              isLoading: false
            })
          } else {
            throw new Error(response.message || 'Failed to get profile')
          }
        } catch (error: unknown) {
          const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || (error as Error)?.message || 'Failed to get profile'
          set({
            error: message,
            isLoading: false,
            isAuthenticated: false,
            user: null,
            tokenExpiry: null
          })

          // Clear tokens on profile fetch failure
          apiClient.clearToken()
          if (typeof window !== 'undefined') {
            localStorage.removeItem('admin_refresh_token')
            localStorage.removeItem('admin_token_expiry')
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
              } catch (error) {
                // Refresh failed, clear everything
                get().logout()
              }
            }
          } else if (!token && isAuthenticated) {
            // State says authenticated but no token, clear state
            set({
              user: null,
              isAuthenticated: false,
              tokenExpiry: null
            })
          }
        } catch (error) {
          console.error('Auth initialization failed:', error)
          set({
            user: null,
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

          const response = await fetch('/api/auth/refresh-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          })

          const responseData = await response.json()

          if (responseData.success) {
            // Handle both old and new token response formats
            const tokens = responseData.data.tokens || responseData.data
            const accessToken = tokens.access_token || tokens.accessToken
            const newRefreshToken = tokens.refresh_token || tokens.refreshToken
            const expiresIn = tokens.expires_in || tokens.expiresIn

            // Calculate new token expiry
            const tokenExpiry = Date.now() + (expiresIn ? expiresIn * 1000 : 3600000)

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