import { describe, it, expect, beforeEach, vi } from 'vitest'

// --------------------------------------------------------------------------
// We test the auth-store logic in isolation by mocking apiClient.
// --------------------------------------------------------------------------

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  setToken: vi.fn(),
  clearToken: vi.fn(),
  getStoredToken: vi.fn(),
}

vi.mock('@/lib/api/client', () => ({
  default: mockApiClient,
  apiClient: mockApiClient,
}))

// Zustand persist uses localStorage — jsdom provides it.

// --------------------------------------------------------------------------
// Helper: build an auth error that looks like what the store receives
// --------------------------------------------------------------------------
function makeApiError(status: number, message = 'error'): Error {
  const e = new Error(message) as any
  e.status = status
  return e
}

// Helper: mock global.fetch for server-route calls
function mockFetch(response: { ok: boolean; status?: number; body: object }) {
  return vi.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok: response.ok,
    status: response.status ?? (response.ok ? 200 : 401),
    json: async () => response.body,
  } as Response)
}

describe('useAuthStore.getProfile()', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    localStorage.clear()

    vi.resetModules()
    vi.mock('@/lib/api/client', () => ({
      default: mockApiClient,
      apiClient: mockApiClient,
    }))
  })

  it('clears auth state on 401 (genuine auth error)', async () => {
    const { useAuthStore } = await import('./auth-store')
    useAuthStore.getState()

    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: '1', email: 'a@b.com', role: 'admin' } as any,
      tokenExpiry: Date.now() + 3600000,
      isHydrated: true,
    })

    mockApiClient.get.mockRejectedValueOnce(makeApiError(401, 'Unauthorized'))
    // getProfile calls /api/auth/logout on auth error (fire-and-forget)
    mockFetch({ ok: true, body: { success: true } })

    await useAuthStore.getState().getProfile()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(mockApiClient.clearToken).toHaveBeenCalledTimes(1)
  })

  it('clears auth state on 403 (forbidden)', async () => {
    const { useAuthStore } = await import('./auth-store')

    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: '1', email: 'a@b.com', role: 'admin' } as any,
      tokenExpiry: Date.now() + 3600000,
      isHydrated: true,
    })

    mockApiClient.get.mockRejectedValueOnce(makeApiError(403, 'Forbidden'))
    mockFetch({ ok: true, body: { success: true } })

    await useAuthStore.getState().getProfile()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(mockApiClient.clearToken).toHaveBeenCalledTimes(1)
  })

  it('preserves auth state on network error (no status code)', async () => {
    const { useAuthStore } = await import('./auth-store')

    const originalUser = { id: '1', email: 'a@b.com', role: 'admin' } as any
    useAuthStore.setState({
      isAuthenticated: true,
      user: originalUser,
      tokenExpiry: Date.now() + 3600000,
      isHydrated: true,
    })

    const networkErr = new Error('Network Error')
    mockApiClient.get.mockRejectedValueOnce(networkErr)

    await useAuthStore.getState().getProfile()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toEqual(originalUser)
    expect(mockApiClient.clearToken).not.toHaveBeenCalled()
    expect(state.error).toBe('Network Error')
  })

  it('preserves auth state on 500 server error', async () => {
    const { useAuthStore } = await import('./auth-store')

    const originalUser = { id: '1', email: 'a@b.com', role: 'admin' } as any
    useAuthStore.setState({
      isAuthenticated: true,
      user: originalUser,
      tokenExpiry: Date.now() + 3600000,
      isHydrated: true,
    })

    mockApiClient.get.mockRejectedValueOnce(makeApiError(500, 'Internal Server Error'))

    await useAuthStore.getState().getProfile()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(mockApiClient.clearToken).not.toHaveBeenCalled()
  })

  it('updates user on successful profile fetch', async () => {
    const { useAuthStore } = await import('./auth-store')

    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      isHydrated: true,
    })

    const profileUser = {
      id: '1',
      email: 'admin@test.com',
      role: 'admin',
      permissions: ['users.read', 'system.analytics'],
    }

    mockApiClient.get.mockResolvedValueOnce({
      success: true,
      data: { profile: profileUser },
    })
    mockApiClient.getStoredToken.mockReturnValueOnce(null)

    await useAuthStore.getState().getProfile()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user?.email).toBe('admin@test.com')
  })
})

describe('useAuthStore.initializeAuth()', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
    vi.resetModules()
    vi.mock('@/lib/api/client', () => ({
      default: mockApiClient,
      apiClient: mockApiClient,
    }))
  })

  it('silently refreshes and fetches profile when no in-memory token (page reload)', async () => {
    const { useAuthStore } = await import('./auth-store')

    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: '1', email: 'a@b.com', role: 'admin' } as any,
      tokenExpiry: Date.now() + 3600000,
      isHydrated: true,
    })
    // No in-memory token (simulates page reload)
    mockApiClient.getStoredToken.mockReturnValue(null)

    // refreshTokens() calls /api/auth/refresh-token server route
    mockFetch({
      ok: true,
      body: { success: true, data: { access_token: 'new_access', expires_in: 3600 } },
    })

    // getProfile() is called after successful refresh
    mockApiClient.get.mockResolvedValueOnce({
      success: true,
      data: {
        profile: {
          id: '1',
          email: 'a@b.com',
          role: 'admin',
          permissions: ['system.analytics'],
        },
      },
    })
    mockApiClient.getStoredToken.mockReturnValue('new_access')

    await useAuthStore.getState().initializeAuth()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(mockApiClient.setToken).toHaveBeenCalledWith('new_access', expect.any(Number))
  })

  it('clears state when refresh token cookie is absent or expired', async () => {
    const { useAuthStore } = await import('./auth-store')

    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: '1', email: 'a@b.com', role: 'admin' } as any,
      tokenExpiry: Date.now() + 3600000,
      isHydrated: true,
    })
    mockApiClient.getStoredToken.mockReturnValue(null)

    // Server route returns 401 — no valid refresh cookie
    mockFetch({
      ok: false,
      status: 401,
      body: { success: false, message: 'No refresh token' },
    })

    await useAuthStore.getState().initializeAuth()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
  })

  it('uses in-memory token and fetches profile when token is already set', async () => {
    const { useAuthStore } = await import('./auth-store')

    useAuthStore.setState({
      isAuthenticated: true,
      user: null,
      isHydrated: true,
    })
    // In-memory token is still alive
    mockApiClient.getStoredToken.mockReturnValue('existing_token')

    mockApiClient.get.mockResolvedValueOnce({
      success: true,
      data: {
        profile: {
          id: '1',
          email: 'a@b.com',
          role: 'admin',
          permissions: ['system.analytics'],
        },
      },
    })
    mockApiClient.getStoredToken.mockReturnValue('existing_token')

    await useAuthStore.getState().initializeAuth()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
  })
})

describe('useAuthStore.logout()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.resetModules()
    vi.mock('@/lib/api/client', () => ({
      default: mockApiClient,
      apiClient: mockApiClient,
    }))
  })

  it('clears all state regardless of server route failure', async () => {
    const { useAuthStore } = await import('./auth-store')

    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: '1', email: 'a@b.com', role: 'admin' } as any,
    })

    // /api/auth/logout server route fails
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'))

    await useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(mockApiClient.clearToken).toHaveBeenCalledTimes(1)
  })

  it('calls /api/auth/logout server route (not backend directly)', async () => {
    const { useAuthStore } = await import('./auth-store')

    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: '1', email: 'a@b.com', role: 'admin' } as any,
    })

    const fetchSpy = mockFetch({ ok: true, body: { success: true } })

    await useAuthStore.getState().logout()

    expect(fetchSpy).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' })
    // apiClient.post should NOT have been called (no direct backend call)
    expect(mockApiClient.post).not.toHaveBeenCalled()
  })
})

describe('useAuthStore.validateToken()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.resetModules()
    vi.mock('@/lib/api/client', () => ({
      default: mockApiClient,
      apiClient: mockApiClient,
    }))
  })

  it('returns true when tokenExpiry is in the future', async () => {
    const { useAuthStore } = await import('./auth-store')

    useAuthStore.setState({
      tokenExpiry: Date.now() + 3600000,
      isHydrated: true,
    })

    expect(useAuthStore.getState().validateToken()).toBe(true)
  })

  it('returns false when tokenExpiry is in the past', async () => {
    const { useAuthStore } = await import('./auth-store')

    useAuthStore.setState({
      tokenExpiry: Date.now() - 1000,
      isHydrated: true,
    })

    expect(useAuthStore.getState().validateToken()).toBe(false)
  })

  it('returns false when tokenExpiry is null (no localStorage fallback)', async () => {
    const { useAuthStore } = await import('./auth-store')

    // tokenExpiry is not in Zustand persist anymore — null means unknown, treated as invalid
    useAuthStore.setState({ tokenExpiry: null, isHydrated: true })

    expect(useAuthStore.getState().validateToken()).toBe(false)
  })
})
