import { describe, it, expect } from 'vitest'

// ---------------------------------------------------------------------------
// We test the pure helper logic of the middleware without importing Next.js
// server-only modules (NextRequest/NextResponse).
// ---------------------------------------------------------------------------

// ---- Copy the helpers from middleware.ts (kept in sync manually) ----------

function base64UrlDecode(str: string): string {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    const padding = base64.length % 4
    if (padding) base64 += '='.repeat(4 - padding)
    const binString = atob(base64)
    const bytes = Uint8Array.from(binString, (c) => c.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return ''
  }
}

function decodeJWT(token: string): any {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const decoded = base64UrlDecode(parts[1])
    if (!decoded) return null
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token)
  if (!decoded || !decoded.exp) return true
  const now = Math.floor(Date.now() / 1000)
  return decoded.exp < now
}

function hasAdminPermissions(token: string): boolean {
  const decoded = decodeJWT(token)
  if (!decoded) return false
  if (decoded.user_role === 'admin') return true
  const permissions = decoded.permissions || []
  const adminPermissions = ['system.analytics', 'users.manage_roles', 'admin.access']
  return adminPermissions.some((perm) => permissions.includes(perm))
}

const PROTECTED_ROUTES = [
  '/dashboard',
  '/users',
  '/products',
  '/allergies',
  '/trust',
  '/groups',
  '/contributions',
  '/gamification',
  '/analytics',
  '/reports',
  '/lists',
]

// ---- Test helpers ---------------------------------------------------------

function makeJWT(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  // Use URL-safe base64 without padding to mimic real JWTs
  const p = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `${header}.${p}.signature`
}

// ---------------------------------------------------------------------------
// PROTECTED_ROUTES coverage
// ---------------------------------------------------------------------------

describe('PROTECTED_ROUTES', () => {
  const expectedRoutes = [
    '/dashboard',
    '/users',
    '/products',
    '/allergies',
    '/trust',
    '/groups',
    '/contributions',
    '/gamification',
    '/analytics',
    '/reports',
    '/lists',
  ]

  it.each(expectedRoutes)('protects %s', (route) => {
    const isProtected = PROTECTED_ROUTES.some((r) => route.startsWith(r))
    expect(isProtected).toBe(true)
  })

  it('does not protect /auth/login', () => {
    const isProtected = PROTECTED_ROUTES.some((r) => '/auth/login'.startsWith(r))
    expect(isProtected).toBe(false)
  })

  it('protects nested routes like /trust/review', () => {
    const isProtected = PROTECTED_ROUTES.some((r) => '/trust/review'.startsWith(r))
    expect(isProtected).toBe(true)
  })

  it('protects nested routes like /users/123', () => {
    const isProtected = PROTECTED_ROUTES.some((r) => '/users/123'.startsWith(r))
    expect(isProtected).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// isTokenExpired
// ---------------------------------------------------------------------------

describe('isTokenExpired', () => {
  it('returns false for a future exp', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600
    const token = makeJWT({ sub: 'u1', exp: futureExp })
    expect(isTokenExpired(token)).toBe(false)
  })

  it('returns true for a past exp', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600
    const token = makeJWT({ sub: 'u1', exp: pastExp })
    expect(isTokenExpired(token)).toBe(true)
  })

  it('returns true when token has no exp', () => {
    const token = makeJWT({ sub: 'u1' })
    expect(isTokenExpired(token)).toBe(true)
  })

  it('returns true for a malformed token', () => {
    expect(isTokenExpired('not.a.token')).toBe(true)
    expect(isTokenExpired('')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// hasAdminPermissions
// ---------------------------------------------------------------------------

describe('hasAdminPermissions', () => {
  it('grants access when user_role is admin', () => {
    const token = makeJWT({ sub: 'u1', exp: 9999999999, user_role: 'admin' })
    expect(hasAdminPermissions(token)).toBe(true)
  })

  it('grants access when permissions include admin.access', () => {
    const token = makeJWT({ sub: 'u1', exp: 9999999999, user_role: 'user', permissions: ['admin.access'] })
    expect(hasAdminPermissions(token)).toBe(true)
  })

  it('grants access when permissions include system.analytics', () => {
    const token = makeJWT({ sub: 'u1', exp: 9999999999, user_role: 'user', permissions: ['system.analytics'] })
    expect(hasAdminPermissions(token)).toBe(true)
  })

  it('denies access when user_role is authenticated (not admin)', () => {
    const token = makeJWT({ sub: 'u1', exp: 9999999999, user_role: 'authenticated', permissions: [] })
    expect(hasAdminPermissions(token)).toBe(false)
  })

  it('denies access when user_role is user with no admin permissions', () => {
    const token = makeJWT({ sub: 'u1', exp: 9999999999, user_role: 'user', permissions: ['products.read'] })
    expect(hasAdminPermissions(token)).toBe(false)
  })

  it('denies access for a malformed token', () => {
    expect(hasAdminPermissions('bad.token')).toBe(false)
  })
})
