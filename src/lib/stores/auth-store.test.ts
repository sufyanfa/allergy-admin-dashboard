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

describe('useAuthStore.getProfile()', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    localStorage.clear()

    // Reset module so store state is fresh
    vi.resetModules()

    // Re-apply mock after resetModules
    vi.mock('@/lib/api/client', () => ({
      default: mockApiClient,
      apiClient: mockApiClient,
    }))
  })

  it('clears auth state on 401 (genuine auth error)', async () => {
    const { useAuthStore } = await import('./auth-store')
    useAuthStore.getState()

    // Seed authenticated state
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: '1', email: 'a@b.com', role: 'admin' } as any,
      tokenExpiry: Date.now() + 3600000,
      isHydrated: true,
    })

    // API returns 401
    mockApiClient.get.mockRejectedValueOnce(makeApiError(401, 'Unauthorized'))

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

    // Network error — no status property
    const networkErr = new Error('Network Error')
    mockApiClient.get.mockRejectedValueOnce(networkErr)

    await useAuthStore.getState().getProfile()

    const state = useAuthStore.getState()
    // Should NOT clear auth
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toEqual(originalUser)
    expect(mockApiClient.clearToken).not.toHaveBeenCalled()
    // Should set an error message
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

describe('useAuthStore.initializeAuth() — access token missing but refresh token present', () => {
  beforeEach(() => {
    // Use resetAllMocks (not clearAllMocks) to also flush queued mockReturnValueOnce entries
    vi.resetAllMocks()
    localStorage.clear()
    vi.resetModules()
    vi.mock('@/lib/api/client', () => ({
      default: mockApiClient,
      apiClient: mockApiClient,
    }))
  })

  it('silently refreshes when admin_token is gone but refresh token exists', async () => {
    const { useAuthStore } = await import('./auth-store')

    // Simulates the broken state: zustand says authenticated, but access token was cleared
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: '1', email: 'a@b.com', role: 'admin' } as any,
      tokenExpiry: Date.now() + 3600000,
      isHydrated: true,
    })
    // No admin_token in localStorage — only refresh token survives
    localStorage.setItem('admin_refresh_token', 'valid_refresh_tok')
    mockApiClient.getStoredToken.mockReturnValueOnce(null)

    // Refresh call returns new tokens
    mockApiClient.post.mockResolvedValueOnce({
      success: true,
      data: {
        tokens: { access_token: 'new_access', refresh_token: 'new_refresh', expires_in: 3600 },
      },
    })
    // Note: getProfile is NOT called after refresh (user data already in zustand state)

    await useAuthStore.getState().initializeAuth()

    const state = useAuthStore.getState()
    // Should stay authenticated — refresh succeeded, no getProfile needed
    expect(state.isAuthenticated).toBe(true)
  })

  it('clears state when both access token and refresh token are missing', async () => {
    const { useAuthStore } = await import('./auth-store')

    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: '1', email: 'a@b.com', role: 'admin' } as any,
      tokenExpiry: Date.now() + 3600000,
      isHydrated: true,
    })
    // Neither token in localStorage
    mockApiClient.getStoredToken.mockReturnValueOnce(null)

    await useAuthStore.getState().initializeAuth()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
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

  it('clears all state regardless of API failure', async () => {
    const { useAuthStore } = await import('./auth-store')

    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: '1', email: 'a@b.com', role: 'admin' } as any,
    })

    // Logout API call fails
    mockApiClient.post.mockRejectedValueOnce(new Error('Server error'))

    await useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(mockApiClient.clearToken).toHaveBeenCalledTimes(1)
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

  it('falls back to localStorage expiry when state tokenExpiry is null', async () => {
    const { useAuthStore } = await import('./auth-store')

    const futureExpiry = Date.now() + 3600000
    localStorage.setItem('admin_token_expiry', futureExpiry.toString())

    useAuthStore.setState({ tokenExpiry: null, isHydrated: true })

    expect(useAuthStore.getState().validateToken()).toBe(true)
  })
})
