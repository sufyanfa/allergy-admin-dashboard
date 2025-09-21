import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'

export function useAuth(requireAuth = true) {
  const {
    user,
    isAuthenticated,
    isLoading,
    isHydrated,
    initializeAuth,
    setHydrated
  } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Set hydrated flag when component mounts
    if (!isHydrated) {
      setHydrated(true)
    }
  }, [isHydrated, setHydrated])

  useEffect(() => {
    // Only run initialization logic after hydration is complete
    if (isHydrated) {
      initializeAuth()
    }
  }, [isHydrated, initializeAuth])

  useEffect(() => {
    // Only redirect after hydration is complete
    if (isHydrated && !isLoading) {
      if (requireAuth && !isAuthenticated && pathname !== '/auth/login') {
        router.push('/auth/login')
      } else if (isAuthenticated && pathname === '/auth/login') {
        router.push('/dashboard')
      }
    }
  }, [isAuthenticated, isLoading, isHydrated, router, pathname, requireAuth])

  return {
    user: isHydrated ? user : null,
    isAuthenticated: isHydrated ? isAuthenticated : false,
    isLoading: isHydrated ? isLoading : true,
    isAdmin: isHydrated && user?.role ? ['admin', 'authenticated'].includes(user.role) : false
  }
}

export function useRequireAuth() {
  return useAuth(true)
}

export function useOptionalAuth() {
  return useAuth(false)
}