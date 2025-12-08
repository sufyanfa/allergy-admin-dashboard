'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2, Shield } from 'lucide-react'
import { isValidEmail, sanitizeInput, loginRateLimiter, otpRateLimiter, setupCSP } from '@/lib/utils/security'
import { useTranslations, useLocale } from '@/lib/hooks/use-translations'

function LoginForm() {
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')
  const locale = useLocale()

  const ERROR_MESSAGES: Record<string, string> = {
    admin_required: t('accessDenied'),
    unauthenticated: t('pleaseLogin'),
    expired: t('sessionExpiredMessage'),
  }
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [remainingTime, setRemainingTime] = useState(0)

  const { login } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for error or expired parameters in URL
  useEffect(() => {
    const errorParam = searchParams.get('error')
    const expiredParam = searchParams.get('expired')

    if (errorParam && errorParam in ERROR_MESSAGES) {
      setError(ERROR_MESSAGES[errorParam as keyof typeof ERROR_MESSAGES])
    } else if (expiredParam === 'true') {
      setError(ERROR_MESSAGES.expired)
    }
  }, [searchParams])

  useEffect(() => {
    setupCSP()
  }, [])

  useEffect(() => {
    if (remainingTime > 0) {
      const timer = setTimeout(() => setRemainingTime(remainingTime - 1000), 1000)
      return () => clearTimeout(timer)
    }
  }, [remainingTime])

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate email
    const sanitizedEmail = sanitizeInput(email)
    if (!isValidEmail(sanitizedEmail)) {
      setError(t('invalidEmail'))
      return
    }

    // Check rate limiting
    if (!loginRateLimiter.isAllowed(sanitizedEmail)) {
      const timeRemaining = loginRateLimiter.getTimeUntilReset(sanitizedEmail)
      setRemainingTime(timeRemaining)
      const minutes = Math.ceil(timeRemaining / 60000)
      setError(t('tooManyAttempts').replace('{minutes}', minutes.toString()))
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'email',
          identifier: sanitizedEmail,
          language: 'ar'
        }),
      })

      const responseData = await response.json()

      if (responseData.success) {
        setEmail(sanitizedEmail) // Store sanitized email
        setStep('otp')
      } else {
        setError(responseData.message || t('failedSendOtp'))
      }
    } catch (error: unknown) {
      setError((error as { response?: { data?: { message?: string } } })?.response?.data?.message || t('failedSendOtp'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Sanitize OTP input
    const sanitizedOTP = sanitizeInput(otp).replace(/[^0-9]/g, '')
    if (sanitizedOTP.length !== 6) {
      setError(t('invalidOtp'))
      return
    }

    // Check rate limiting for OTP verification
    if (!otpRateLimiter.isAllowed(email)) {
      const timeRemaining = otpRateLimiter.getTimeUntilReset(email)
      setRemainingTime(timeRemaining)
      const minutes = Math.ceil(timeRemaining / 60000)
      setError(t('tooManyAttempts').replace('{minutes}', minutes.toString()))
      return
    }

    setIsLoading(true)

    try {
      await login(email, sanitizedOTP)
      router.push('/dashboard')
    } catch (error: unknown) {
      setError((error as Error)?.message || 'Invalid OTP')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-2xl font-bold text-center">
              {t('adminLogin')}
            </CardTitle>
          </div>
          <CardDescription className="text-center">
            {step === 'email'
              ? t('enterEmail')
              : t('enterOtp')
            }
          </CardDescription>
          {remainingTime > 0 && (
            <div className="text-center text-sm text-orange-600">
              {t('rateLimited').replace('{seconds}', Math.ceil(remainingTime / 1000).toString())}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('emailAddress')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || remainingTime > 0}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('sendingOtp')}
                  </>
                ) : remainingTime > 0 ? (
                  t('waitSeconds').replace('{seconds}', Math.ceil(remainingTime / 1000).toString())
                ) : (
                  t('sendOtp')
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">{t('otpCode')}</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder={t('otpPlaceholder')}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setStep('email')
                    setOtp('')
                    setError('')
                  }}
                  disabled={isLoading}
                >
                  {tCommon('back')}
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading || remainingTime > 0}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('verifying')}
                    </>
                  ) : remainingTime > 0 ? (
                    t('waitSeconds').replace('{seconds}', Math.ceil(remainingTime / 1000).toString())
                  ) : (
                    t('verifyLogin')
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}