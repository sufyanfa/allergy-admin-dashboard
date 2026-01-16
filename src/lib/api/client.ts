import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// Development-only logger - completely silent in production
const isDev = process.env.NODE_ENV === 'development'
const devLog = isDev ? (...args: unknown[]) => console.log('[API]', ...args) : () => {}
const devError = isDev ? (...args: unknown[]) => console.error('[API]', ...args) : () => {}

class ApiClient {
  private client: AxiosInstance
  private token: string | null = null
  private tokenExpiry: number | null = null

  constructor() {
    const baseURL = `${process.env.NEXT_PUBLIC_API_URL}/api/${process.env.NEXT_PUBLIC_API_VERSION}`

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        'User-Agent': 'Allergy-Checker-Admin/1.0.0',
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
            // Redirect to login
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login'
            }
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  setToken(token: string, expiry?: number) {
    this.token = token
    this.tokenExpiry = expiry || null
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_token', token)
      if (expiry) {
        localStorage.setItem('admin_token_expiry', expiry.toString())
      }

      // Also set as cookie for server-side middleware validation
      const expiryDate = expiry ? new Date(expiry) : new Date(Date.now() + 3600000)
      document.cookie = `admin_token=${token}; path=/; expires=${expiryDate.toUTCString()}; secure; samesite=strict`
    }
  }

  clearToken() {
    this.token = null
    this.tokenExpiry = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_token_expiry')

      // Clear the cookie
      document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict'
    }
  }

  getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token')
      const expiry = localStorage.getItem('admin_token_expiry')

      if (token && expiry) {
        const expiryTime = parseInt(expiry, 10)
        if (Date.now() >= expiryTime) {
          // Token expired, clear it
          this.clearToken()
          return null
        }
        this.tokenExpiry = expiryTime
        return token
      } else if (token && !expiry) {
        // Token exists but no expiry, assume it's valid for now
        return token
      }

      return null
    }
    return null
  }

  isTokenValid(): boolean {
    if (!this.tokenExpiry) return false
    return Date.now() < this.tokenExpiry
  }

  private async refreshToken() {
    const refreshToken = typeof window !== 'undefined'
      ? localStorage.getItem('admin_refresh_token')
      : null

    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await this.client.post('/auth/refresh-token', {
      refreshToken,
    })

    const { accessToken } = response.data.data
    this.setToken(accessToken)
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