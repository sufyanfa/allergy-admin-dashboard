'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useTranslations } from '@/lib/hooks/use-translations'

export default function Home() {
  const tCommon = useTranslations('common')
  // Login required - commented out for testing
  // const { isAuthenticated, isLoading } = useOptionalAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect directly to dashboard for testing (skip auth)
    router.push('/dashboard')
  }, [router])

  // useEffect(() => {
  //   if (!isLoading) {
  //     if (isAuthenticated) {
  //       router.push('/dashboard')
  //     } else {
  //       router.push('/auth/login')
  //     }
  //   }
  // }, [isAuthenticated, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{tCommon('redirecting')}</p>
      </div>
    </div>
  )
}