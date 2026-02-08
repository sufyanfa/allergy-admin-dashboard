'use client'

import { useRouter } from 'next/navigation'
import { useRequireAuth } from '@/lib/hooks/use-auth'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
}

function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, isAdmin } = useRequireAuth()
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const router = useRouter()

  // Show loading only while Zustand is hydrating from localStorage
  // or while the auth check is in progress — single loading state instead of three
  if (!isHydrated || isLoading) {
    return <LoadingScreen />
  }

  // Check if user is authenticated and has admin privileges
  if (!isAuthenticated || !isAdmin) {
    const errorParam = !isAuthenticated ? 'unauthenticated' : 'admin_required'
    router.push(`/auth/login?error=${errorParam}`)
    return <LoadingScreen message="Redirecting..." />
  }

  return <>{children}</>
}