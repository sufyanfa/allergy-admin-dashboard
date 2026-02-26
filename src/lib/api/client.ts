import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// Development-only logger - completely silent in production
const isDev = process.env.NODE_ENV === 'development'
const devError = isDev ? (...args: unknown[]) => console.error('[API]', ...args) : () => {}

class ApiClient {
  private client: AxiosInstance
  private token: string | null = null
  private tokenExpiry: number | null = null
  private refreshPromise: Promise<string> | null = null

  constructor() {
    const baseURL = `${process.env.NEXT_PUBLIC_API_URL}/api/${process.env.NEXT_PUBLIC_API_VERSION}`

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        // The backend's consolidatedSecurityMiddleware requires x-api-key on all
        // non-auth endpoints. NEXT_PUBLIC_ variables are bundled into client JS,
        // but this is an admin-only dashboard so the key being visible to admins
        // is acceptable. The JWT Bearer token still enforces actual data access.
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
      },
      withCredentials: true, // Important for CORS with credentials
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Check if token is still valid
        if (this.token && this.isTokenValid()) {
          config.headers.Authorization = `Bearer ${this.token}`
        } else if (this.token && !this.isTokenValid()) {
          // Token is expired, clear it
          this.clearToken()
        } else if (!this.token) {
          // Try to get stored token
          const storedToken = this.getStoredToken()
          if (storedToken) {
            this.token = storedToken
            config.headers.Authorization = `Bearer ${storedToken}`
          }
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      async (error) => {
        // Log errors only in development
        devError('Request failed:', error.response?.status, error.config?.url)

        const original = error.config

        // Handle 401 errors
        if (error.response?.status === 401 && !original._retry) {
          original._retry = true

          try {
            await this.refreshToken()
            return this.client(original)
          } catch (refreshError) {
            this.clearToken()
            // Redirect to login (locale-aware)
            if (typeof window !== 'undefined') {
              const locale = document.cookie
                .split('; ')
                .find(row => row.startsWith('NEXT_LOCALE='))
                ?.split('=')[1] || 'ar'
              window.location.href = `/${locale}/auth/login`
            }
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  setToken(token: string, expiry?: number) {
    // Token lives in memory only.
    // httpOnly cookies are set server-side by /api/auth/ proxy routes — never by JS.
    this.token = token
    this.tokenExpiry = expiry || null
  }

  clearToken() {
    // Clear in-memory token only.
    // httpOnly cookies are cleared by calling /api/auth/logout server route.
    // Callers that end a session (logout, failed refresh) must call that route.
    this.token = null
    this.tokenExpiry = null
  }

  getStoredToken(): string | null {
    // Token is memory-only — no localStorage fallback.
    return this.token && this.isTokenValid() ? this.token : null
  }

  isTokenValid(): boolean {
    if (!this.tokenExpiry) {
      // No expiry recorded — let the server decide (will 401 if truly expired)
      return true
    }
    return Date.now() < this.tokenExpiry
  }

  private extractJWTExpiry(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp ? payload.exp * 1000 : null
    } catch {
      return null
    }
  }

  private async refreshToken() {
    // Deduplicate: if a refresh is already in-flight, reuse its promise.
    // This prevents multiple concurrent 401s from each consuming the rotating refresh token.
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = this._doRefresh().finally(() => {
      this.refreshPromise = null
    })

    return this.refreshPromise
  }

  private async _doRefresh(): Promise<string> {
    // Call the Next.js server route — it reads the httpOnly refresh cookie.
    // Using native fetch (not this.client) to avoid triggering interceptors again.
    const response = await fetch('/api/auth/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Token refresh failed')
    }

    const accessToken = data.data?.access_token || data.data?.accessToken
    const expiresIn = data.data?.expires_in || data.data?.expiresIn

    if (!accessToken) {
      throw new Error('No access token in refresh response')
    }

    const expiryMs = this.extractJWTExpiry(accessToken) || (Date.now() + (expiresIn ? expiresIn * 1000 : 3600000))
    this.setToken(accessToken, expiryMs)

    return accessToken
  }

  private handleApiError(error: any, method: string, url: string): never {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message
    const details = error.response?.data

    // Log only in development
    devError(`${method} ${url} failed:`, status, message)

    // Create a more informative error
    const apiError = new Error(`API ${method} ${url} failed: ${message}`)
    ;(apiError as any).status = status
    ;(apiError as any).details = details
    ;(apiError as any).originalError = error

    throw apiError
  }

  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get(url, config)
      return response.data
    } catch (error) {
      this.handleApiError(error, 'GET', url)
    }
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post(url, data, config)
      return response.data
    } catch (error) {
      this.handleApiError(error, 'POST', url)
    }
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.put(url, data, config)
      return response.data
    } catch (error) {
      this.handleApiError(error, 'PUT', url)
    }
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.patch(url, data, config)
      return response.data
    } catch (error) {
      this.handleApiError(error, 'PATCH', url)
    }
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete(url, config)
      return response.data
    } catch (error) {
      this.handleApiError(error, 'DELETE', url)
    }
  }
}

export const apiClient = new ApiClient()
export default apiClient