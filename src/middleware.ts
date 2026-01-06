import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define locales
const locales = ['ar', 'en'] as const;
const defaultLocale = 'ar' as const;

// Configure edge runtime for Cloudflare Pages compatibility
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
  runtime: 'experimental-edge',
}

const PROTECTED_ROUTES = ['/dashboard', '/users', '/products', '/allergies']
const AUTH_ROUTES = ['/auth/login']
const PUBLIC_ROUTES = ['/']

// Base64 URL decode helper (Edge runtime compatible - no Buffer)
function base64UrlDecode(str: string): string {
  try {
    // Replace URL-safe characters
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/')

    // Add padding if needed
    const padding = base64.length % 4
    if (padding) {
      base64 += '='.repeat(4 - padding)
    }

    // Decode using atob (available in edge runtime)
    const binString = atob(base64)

    // Convert to Uint8Array and decode using TextDecoder (standard & faster)
    const bytes = Uint8Array.from(binString, (c) => c.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return ''
  }
}

// Simple JWT decoder for validation (without verification, just parsing)
// Edge runtime compatible - uses atob instead of Buffer
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = parts[1]
    const decoded = base64UrlDecode(payload)

    if (!decoded) return null
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

// Check if token is expired
function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token)
  if (!decoded || !decoded.exp) return true

  const now = Math.floor(Date.now() / 1000)
  return decoded.exp < now
}

// Check if user has admin permissions
function hasAdminPermissions(token: string): boolean {
  const decoded = decodeJWT(token)
  if (!decoded) return false

  // Check for admin role
  if (decoded.user_role === 'admin') return true

  // Check for admin permissions
  const permissions = decoded.permissions || []
  const adminPermissions = [
    'system.analytics',
    'users.manage_roles',
    'admin.access',
  ]

  return adminPermissions.some((perm) => permissions.includes(perm))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Extract locale from pathname
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // If no locale in pathname, redirect to default locale
  if (!pathnameLocale) {
    const locale = defaultLocale
    const newUrl = new URL(`/${locale}${pathname}`, request.url)
    const response = NextResponse.redirect(newUrl)
    response.cookies.set('NEXT_LOCALE', locale, { path: '/', sameSite: 'lax' })
    return response
  }

  // Remove locale prefix for route checking
  const pathnameWithoutLocale = pathname.replace(`/${pathnameLocale}`, '') || '/'

  // Check if the route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  )
  const isAuthRoute = AUTH_ROUTES.some((route) => pathnameWithoutLocale.startsWith(route))
  const isPublicRoute = PUBLIC_ROUTES.includes(pathnameWithoutLocale)

  // Get token from cookie
  const token = request.cookies.get('admin_token')?.value

  // Handle root route - redirect to dashboard if authenticated, login if not
  if (isPublicRoute && pathnameWithoutLocale === '/') {
    if (token && !isTokenExpired(token) && hasAdminPermissions(token)) {
      return NextResponse.redirect(new URL(`/${pathnameLocale}/dashboard`, request.url))
    }
    return NextResponse.redirect(new URL(`/${pathnameLocale}/auth/login`, request.url))
  }

  // If protected route, check authentication
  if (isProtectedRoute) {
    if (!token) {
      // No token, redirect to login
      const loginUrl = new URL(`/${pathnameLocale}/auth/login`, request.url)
      loginUrl.searchParams.set('redirect', pathnameWithoutLocale)
      return NextResponse.redirect(loginUrl)
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      // Token expired, redirect to login
      const loginUrl = new URL(`/${pathnameLocale}/auth/login`, request.url)
      loginUrl.searchParams.set('redirect', pathnameWithoutLocale)
      loginUrl.searchParams.set('expired', 'true')
      return NextResponse.redirect(loginUrl)
    }

    // Check if user has admin permissions
    if (!hasAdminPermissions(token)) {
      // Not an admin, redirect to login with error
      const loginUrl = new URL(`/${pathnameLocale}/auth/login`, request.url)
      loginUrl.searchParams.set('redirect', pathnameWithoutLocale)
      loginUrl.searchParams.set('error', 'admin_required')
      return NextResponse.redirect(loginUrl)
    }
  }

  // If authenticated admin tries to access login page, redirect to dashboard
  if (isAuthRoute && token && !isTokenExpired(token) && hasAdminPermissions(token)) {
    return NextResponse.redirect(new URL(`/${pathnameLocale}/dashboard`, request.url))
  }

  // Create response with security headers
  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  // Set locale cookie
  response.cookies.set('NEXT_LOCALE', pathnameLocale, { path: '/', sameSite: 'lax' })

  return response
}
