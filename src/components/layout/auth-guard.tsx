'use client'

import { useEffect, useState } from 'react'
import { useRequireAuth } from '@/lib/hooks/use-auth'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isMounted, setIsMounted] = useState(false)
  const { isAuthenticated, isLoading, isAdmin } = useRequireAuth()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  console.log('AuthGuard status:', { isAuthenticated, isLoading, isAdmin })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // For debugging: allow access even if not authenticated
  // if (!isAuthenticated || !isAdmin) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
  //         <p className="text-gray-600 mt-2">Admin privileges required.</p>
  //       </div>
  //     </div>
  //   )
  // }

  return <>{children}</>
}