import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

class ApiClient {
  private client: AxiosInstance
  private token: string | null = null
  private tokenExpiry: number | null = null

  constructor() {
    const baseURL = `${process.env.NEXT_PUBLIC_API_URL}/api/${process.env.NEXT_PUBLIC_API_VERSION}`
    console.log('API Client Base URL:', baseURL)
    console.log('Environment:', {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_API_VERSION: process.env.NEXT_PUBLIC_API_VERSION,
      NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY ? 'exists' : 'missing'
    })

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '',
      },
      withCredentials: true, // Important for CORS with credentials
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Debug: Log request details
        console.log('API Request:', {
          url: config.url,
          baseURL: config.baseURL,
          hasToken: !!this.token,
          tokenValid: this.token ? this.isTokenValid() : false
        })

        // Check if token is still valid
        if (this.token && this.isTokenValid()) {
          config.headers.Authorization = `Bearer ${this.token}`
        } else if (this.token && !this.isTokenValid()) {
          // Token is expired, clear it
          console.log('Token expired, clearing...')
          this.clearToken()
        } else if (!this.token) {
          // Try to get stored token
          const storedToken = this.getStoredToken()
          if (storedToken) {
            this.token = storedToken
            config.headers.Authorization = `Bearer ${storedToken}`
            console.log('Using stored token')
          } else {
            console.log('No token available for request')
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
        console.error('API Error Details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          fullURL: `${error.config?.baseURL}${error.config?.url}`,
          message: error.message,
          code: error.code,
          name: error.name,
          isNetworkError: !error.response,
          headers: error.config?.headers
        })

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
    }
  }

  clearToken() {
    this.token = null
    this.tokenExpiry = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_token_expiry')
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

  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config)
    return response.data
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(url, data, config)
    return response.data
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put(url, data, config)
    return response.data
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(url, config)
    return response.data
  }
}

export const apiClient = new ApiClient()
export default apiClient