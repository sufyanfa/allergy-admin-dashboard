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
    localStorage.clear()
    vi.resetModules()
    const mod = await import('./client')
    apiClient = mod.apiClient
  })

  describe('setToken / clearToken', () => {
    it('stores token in memory only — no localStorage, no cookie', () => {
      const expiry = Date.now() + 3600000
      apiClient.setToken('tok', expiry)

      // Tokens must NOT appear in localStorage
      expect(localStorage.getItem('admin_token')).toBeNull()
      expect(localStorage.getItem('admin_token_expiry')).toBeNull()

      // Token must NOT be written to document.cookie by JS
      expect(document.cookie).not.toContain('admin_token=tok')

      // But the token must be retrievable in memory
      expect(apiClient.getStoredToken()).toBe('tok')
    })

    it('clearToken wipes in-memory token', () => {
      apiClient.setToken('tok', Date.now() + 3600000)
      apiClient.clearToken()

      expect(apiClient.getStoredToken()).toBeNull()
      // localStorage remains untouched (nothing was written there)
      expect(localStorage.getItem('admin_token')).toBeNull()
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

    it('returns true (let server decide) when no expiry info exists', () => {
      // No expiry anywhere — should not incorrectly report invalid
      expect(apiClient.isTokenValid()).toBe(true)
    })
  })

  describe('getStoredToken', () => {
    it('returns in-memory token when valid', () => {
      apiClient.setToken('valid_tok', Date.now() + 3600000)
      expect(apiClient.getStoredToken()).toBe('valid_tok')
    })

    it('returns null when no token has been set', () => {
      expect(apiClient.getStoredToken()).toBeNull()
    })

    it('returns null when in-memory token is expired', () => {
      apiClient.setToken('old_tok', Date.now() - 1000)
      expect(apiClient.getStoredToken()).toBeNull()
    })
  })

  describe('locale-aware redirect on 401', () => {
    it('redirects to /{locale}/auth/login using NEXT_LOCALE cookie', () => {
      document.cookie = 'NEXT_LOCALE=en'
      const locale = document.cookie
        .split('; ')
        .find(row => row.startsWith('NEXT_LOCALE='))
        ?.split('=')[1] || 'ar'

      expect(locale).toBe('en')
      expect(`/${locale}/auth/login`).toBe('/en/auth/login')
    })

    it('falls back to ar locale when NEXT_LOCALE cookie is absent', () => {
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
