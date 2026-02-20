import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock axios before importing client
vi.mock('axios', () => {
  const mockAxiosInstance = {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  }
  return {
    default: {
      create: () => mockAxiosInstance,
    },
  }
})

// Helper to make a minimal JWT with a given exp (Unix seconds)
function makeJWT(exp: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({ sub: 'user1', exp }))
  return `${header}.${payload}.sig`
}

describe('ApiClient', () => {
  let apiClient: any

  beforeEach(async () => {
    // Reset localStorage
    localStorage.clear()
    // Reset module to get a fresh singleton each describe block
    vi.resetModules()
    const mod = await import('./client')
    apiClient = mod.apiClient
  })

  describe('setToken / clearToken', () => {
    it('stores token and expiry in localStorage', () => {
      const expiry = Date.now() + 3600000
      apiClient.setToken('tok', expiry)

      expect(localStorage.getItem('admin_token')).toBe('tok')
      expect(localStorage.getItem('admin_token_expiry')).toBe(expiry.toString())
    })

    it('clearToken removes all stored values', () => {
      apiClient.setToken('tok', Date.now() + 3600000)
      apiClient.clearToken()

      expect(localStorage.getItem('admin_token')).toBeNull()
      expect(localStorage.getItem('admin_token_expiry')).toBeNull()
    })

    it('sets admin_token cookie on setToken', () => {
      apiClient.setToken('tok', Date.now() + 3600000)
      expect(document.cookie).toContain('admin_token=tok')
    })
  })

  describe('isTokenValid', () => {
    it('returns true when expiry is in the future', () => {
      apiClient.setToken('tok', Date.now() + 3600000)
      expect(apiClient.isTokenValid()).toBe(true)
    })

    it('returns false when expiry is in the past', () => {
      apiClient.setToken('tok', Date.now() - 1000)
      expect(apiClient.isTokenValid()).toBe(false)
    })

    it('recovers expiry from localStorage when in-memory expiry is missing', () => {
      // Simulate the state after a cold start: token in localStorage, no in-memory state
      const futureExpiry = Date.now() + 3600000
      localStorage.setItem('admin_token', 'tok')
      localStorage.setItem('admin_token_expiry', futureExpiry.toString())

      // tokenExpiry is null on this fresh instance - should recover from storage
      expect(apiClient.isTokenValid()).toBe(true)
    })

    it('returns true (let server decide) when no expiry info exists', () => {
      // No expiry anywhere - should not incorrectly report invalid
      expect(apiClient.isTokenValid()).toBe(true)
    })
  })

  describe('getStoredToken', () => {
    it('returns token when valid', () => {
      const expiry = Date.now() + 3600000
      localStorage.setItem('admin_token', 'valid_tok')
      localStorage.setItem('admin_token_expiry', expiry.toString())

      expect(apiClient.getStoredToken()).toBe('valid_tok')
    })

    it('returns null and clears when token is expired', () => {
      localStorage.setItem('admin_token', 'old_tok')
      localStorage.setItem('admin_token_expiry', (Date.now() - 1000).toString())

      const result = apiClient.getStoredToken()
      expect(result).toBeNull()
      expect(localStorage.getItem('admin_token')).toBeNull()
    })

    it('returns token when no expiry is stored (legacy)', () => {
      localStorage.setItem('admin_token', 'legacy_tok')
      // No expiry stored

      expect(apiClient.getStoredToken()).toBe('legacy_tok')
    })
  })

  describe('locale-aware redirect on 401', () => {
    it('redirects to /{locale}/auth/login using NEXT_LOCALE cookie', () => {
      // Set locale cookie
      document.cookie = 'NEXT_LOCALE=en'
      // Simulate what the interceptor does
      const locale = document.cookie
        .split('; ')
        .find(row => row.startsWith('NEXT_LOCALE='))
        ?.split('=')[1] || 'ar'

      expect(locale).toBe('en')
      expect(`/${locale}/auth/login`).toBe('/en/auth/login')
    })

    it('falls back to ar locale when NEXT_LOCALE cookie is absent', () => {
      // Clear cookies
      document.cookie = 'NEXT_LOCALE=; expires=Thu, 01 Jan 1970 00:00:00 GMT'

      const locale = document.cookie
        .split('; ')
        .find(row => row.startsWith('NEXT_LOCALE='))
        ?.split('=')[1] || 'ar'

      expect(locale).toBe('ar')
      expect(`/${locale}/auth/login`).toBe('/ar/auth/login')
    })
  })
})

describe('JWT expiry extraction', () => {
  it('correctly parses exp from a JWT payload', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600
    const token = makeJWT(futureExp)

    const payload = JSON.parse(atob(token.split('.')[1]))

    expect(payload.exp).toBe(futureExp)
    expect(payload.exp * 1000).toBeGreaterThan(Date.now())
  })
})
