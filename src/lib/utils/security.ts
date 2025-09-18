/**
 * Security utilities for the authentication system
 */

// Generate a secure random state for CSRF protection
export function generateSecureState(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>\"']/g, '')
    .trim()
    .slice(0, 1000) // Limit length
}

// Check if running in secure context
export function isSecureContext(): boolean {
  if (typeof window === 'undefined') return true
  return window.location.protocol === 'https:' || window.location.hostname === 'localhost'
}

// Rate limiting helper (client-side)
class RateLimiter {
  private attempts: Map<string, { count: number; firstAttempt: number }> = new Map()
  private readonly maxAttempts: number
  private readonly windowMs: number

  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) { // 5 attempts per 15 minutes
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  isAllowed(key: string): boolean {
    const now = Date.now()
    const attempt = this.attempts.get(key)

    if (!attempt) {
      this.attempts.set(key, { count: 1, firstAttempt: now })
      return true
    }

    // Reset if window has passed
    if (now - attempt.firstAttempt > this.windowMs) {
      this.attempts.set(key, { count: 1, firstAttempt: now })
      return true
    }

    if (attempt.count >= this.maxAttempts) {
      return false
    }

    attempt.count++
    return true
  }

  getTimeUntilReset(key: string): number {
    const attempt = this.attempts.get(key)
    if (!attempt) return 0

    const timeRemaining = this.windowMs - (Date.now() - attempt.firstAttempt)
    return Math.max(0, timeRemaining)
  }
}

export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000) // 5 attempts per 15 minutes
export const otpRateLimiter = new RateLimiter(3, 5 * 60 * 1000) // 3 attempts per 5 minutes

// Token validation utilities
export function isValidJWT(token: string): boolean {
  if (!token) return false

  const parts = token.split('.')
  if (parts.length !== 3) return false

  try {
    // Basic structure validation
    const header = JSON.parse(atob(parts[0]))
    const payload = JSON.parse(atob(parts[1]))

    return !!(header.alg && payload.exp)
  } catch {
    return false
  }
}

export function getJWTExpiry(token: string): number | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1]))
    return payload.exp ? payload.exp * 1000 : null // Convert to milliseconds
  } catch {
    return null
  }
}

// Session security
export function validateSession(): boolean {
  if (typeof window === 'undefined') return true

  // Check if session storage is available and secure
  try {
    const testKey = '__test_session__'
    sessionStorage.setItem(testKey, 'test')
    sessionStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

// Content Security Policy helpers
export function setupCSP(): void {
  if (typeof document !== 'undefined' && !document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
    const meta = document.createElement('meta')
    meta.httpEquiv = 'Content-Security-Policy'
    meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
    document.head.appendChild(meta)
  }
}

// Secure storage wrapper
export class SecureStorage {
  private static readonly prefix = 'secure_'

  static setItem(key: string, value: string): void {
    if (!isSecureContext()) {
      console.warn('Storing sensitive data in insecure context')
    }

    try {
      localStorage.setItem(this.prefix + key, value)
    } catch (error) {
      console.error('Failed to store secure item:', error)
    }
  }

  static getItem(key: string): string | null {
    try {
      return localStorage.getItem(this.prefix + key)
    } catch (error) {
      console.error('Failed to retrieve secure item:', error)
      return null
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key)
    } catch (error) {
      console.error('Failed to remove secure item:', error)
    }
  }

  static clear(): void {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.error('Failed to clear secure storage:', error)
    }
  }
}