'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { useRequireAuth } from '@/lib/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from '@/lib/hooks/use-translations'
import type { LucideIcon } from 'lucide-react'
import { RefreshCw, Trophy, Plus, Minus, Compass, Medal, ShieldCheck, Crown } from 'lucide-react'
import apiClient from '@/lib/api/client'

interface BadgeDef {
  id: string
  nameKey: string
  descKey: string
  requiredPoints: number
  color: string
  Icon: LucideIcon
}

const BADGE_DEFINITIONS: BadgeDef[] = [
  { id: 'explorer',           nameKey: 'badgeExplorer',           descKey: 'badgeExplorerDesc',           requiredPoints: 0,    color: '#4CAF50', Icon: Compass    },
  { id: 'bronze_contributor', nameKey: 'badgeBronzeContributor',  descKey: 'badgeBronzeContributorDesc',  requiredPoints: 100,  color: '#CD7F32', Icon: Medal      },
  { id: 'silver_verifier',    nameKey: 'badgeSilverVerifier',     descKey: 'badgeSilverVerifierDesc',     requiredPoints: 500,  color: '#9E9E9E', Icon: ShieldCheck },
  { id: 'gold_guardian',      nameKey: 'badgeGoldGuardian',       descKey: 'badgeGoldGuardianDesc',       requiredPoints: 2000, color: '#FFD700', Icon: Crown      },
]

const POINTS_ACTIONS = [
  { key: 'contribution_created',  labelKey: 'actionContributionCreated',  points: 10  },
  { key: 'contribution_approved', labelKey: 'actionContributionApproved', points: 5   },
  { key: 'contribution_rejected', labelKey: 'actionContributionRejected', points: -10 },
  { key: 'experience_created',    labelKey: 'actionExperienceCreated',    points: 5   },
  { key: 'experience_deleted',    labelKey: 'actionExperienceDeleted',    points: -5  },
  { key: 'experience_vote',       labelKey: 'actionExperienceVote',       points: 2   },
]

const EARNERS_SHOW_LIMIT = 5

interface LeaderboardEntry {
  userId: string
  username: string | null
  fullName: string | null
  totalPoints: number
  rank: number
  transactionCount?: number
}

interface AdjustForm {
  userId: string
  points: number
  reason: string
}

const EMPTY_FORM: AdjustForm = { userId: '', points: 0, reason: '' }

export default function GamificationPage() {
  const tCommon = useTranslations('common')
  const t = useTranslations('gamification')
  const { isAdmin } = useRequireAuth()

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<AdjustForm>(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get<{ success: boolean; data: { leaderboard: LeaderboardEntry[] } }>(
        '/points/leaderboard?limit=50'
      )
      if (response.success && response.data?.leaderboard) {
        setLeaderboard(response.data.leaderboard)
      }
    } catch (err: any) {
      setError(err?.message || t('failedFetchLeaderboard'))
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (isAdmin) {
      fetchLeaderboard()
    }
  }, [isAdmin, fetchLeaderboard])

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.userId.trim() || form.points === 0 || !form.reason.trim()) return

    setIsSubmitting(true)
    setError(null)
    setSuccessMsg(null)
    try {
      await apiClient.post('/points/admin/adjust', {
        userId: form.userId.trim(),
        points: form.points,
        reason: form.reason.trim(),
      })
      const delta = `${form.points > 0 ? '+' : ''}${form.points}`
      setSuccessMsg(t('pointsAdjusted', { delta, userId: form.userId }))
      setForm(EMPTY_FORM)
      await fetchLeaderboard()
    } catch (err: any) {
      setError(err?.message || t('failedAdjustPoints'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAdmin) {
    return (
      <AdminLayout>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">{tCommon('accessDenied')}</h2>
              <p className="text-muted-foreground">{tCommon('adminPrivilegesRequired')}</p>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              {t('title')}
            </h1>
            <p className="text-muted-foreground">{t('subtitle')}</p>
          </div>
          <Button onClick={fetchLeaderboard} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {tCommon('refresh')}
          </Button>
        </div>

        {/* Feedback messages */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4 pb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}
        {successMsg && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4 pb-4">
              <p className="text-green-700 text-sm">{successMsg}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaderboard */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">{t('top50ByPoints')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 text-center text-muted-foreground text-sm">{t('loadingLeaderboard')}</div>
              ) : leaderboard.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">{t('noUsersYet')}</div>
              ) : (
                <div className="divide-y max-h-[600px] overflow-y-auto">
                  {leaderboard.map((entry) => (
                    <div key={entry.userId} className="flex items-center px-6 py-3 gap-4">
                      <span className={`text-sm font-bold w-6 text-center ${entry.rank <= 3 ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                        #{entry.rank}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {entry.fullName || entry.username || tCommon('unknown')}
                        </p>
                        <p className="text-xs text-muted-foreground truncate font-mono">{entry.userId}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={entry.rank <= 3 ? 'default' : 'secondary'}>
                          {entry.totalPoints.toLocaleString()} pts
                        </Badge>
                        {entry.transactionCount !== undefined && (
                          <p className="text-xs text-muted-foreground mt-1">{entry.transactionCount} {t('transactions')}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-7 px-2"
                        onClick={() => setForm(f => ({ ...f, userId: entry.userId }))}
                      >
                        {t('select')}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          {/* Manual Point Adjustment */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">{t('adjustUserPoints')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdjust} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('userId')}</label>
                  <Input
                    placeholder={t('userIdPlaceholder')}
                    value={form.userId}
                    onChange={(e) => setForm(f => ({ ...f, userId: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('pointsLabel')}</label>
                  <Input
                    type="number"
                    placeholder={t('pointsPlaceholder')}
                    value={form.points || ''}
                    onChange={(e) => setForm(f => ({ ...f, points: parseInt(e.target.value) || 0 }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('reason')}</label>
                  <Input
                    placeholder={t('reasonPlaceholder')}
                    value={form.reason}
                    onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !form.userId || !form.points || !form.reason}
                >
                  {form.points >= 0
                    ? <><Plus className="h-4 w-4 mr-2" /> {t('awardPoints')}</>
                    : <><Minus className="h-4 w-4 mr-2" /> {t('deductPoints')}</>
                  }
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Badge Levels */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">{t('badgesTitle')}</h2>
            <p className="text-sm text-muted-foreground">{t('badgesSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BADGE_DEFINITIONS.map((badge) => {
              const earners = leaderboard.filter((e) => e.totalPoints >= badge.requiredPoints)
              return (
                <Card key={badge.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <badge.Icon className="h-5 w-5 shrink-0" style={{ color: badge.color }} />
                      <CardTitle className="text-sm font-semibold leading-tight">
                        {t(badge.nameKey)}
                      </CardTitle>
                    </div>
                    <Badge
                      variant="outline"
                      className="w-fit text-xs"
                      style={{ borderColor: badge.color + '60', color: badge.color }}
                    >
                      {badge.requiredPoints === 0
                        ? t('allUsersEligible')
                        : t('requiresPoints', { points: badge.requiredPoints.toLocaleString() })}
                    </Badge>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground mb-3">{t(badge.descKey)}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold">{earners.length} {t('earners')}</span>
                      <div
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: earners.length > 0 ? badge.color : '#D1D5DB' }}
                      />
                    </div>
                    <div className="space-y-1">
                      {earners.length === 0 ? (
                        <p className="text-xs text-muted-foreground">{t('noEarnersYet')}</p>
                      ) : (
                        <>
                          {earners.slice(0, EARNERS_SHOW_LIMIT).map((e) => (
                            <div key={e.userId} className="flex items-center gap-1.5 text-xs">
                              <span className="text-muted-foreground w-5 shrink-0">#{e.rank}</span>
                              <span className="flex-1 truncate font-medium">
                                {e.fullName || e.username || '—'}
                              </span>
                              <span className="text-muted-foreground shrink-0">
                                {e.totalPoints.toLocaleString()}
                              </span>
                            </div>
                          ))}
                          {earners.length > EARNERS_SHOW_LIMIT && (
                            <p className="text-xs text-muted-foreground pt-0.5">
                              +{earners.length - EARNERS_SHOW_LIMIT} {t('more')}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Points System */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('pointsSystemTitle')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('pointsSystemSubtitle')}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {POINTS_ACTIONS.map((action) => (
                <div
                  key={action.key}
                  className="flex items-center justify-between rounded-lg border px-3 py-2.5"
                >
                  <span className="text-sm">{t(action.labelKey)}</span>
                  <Badge
                    variant={action.points > 0 ? 'default' : 'destructive'}
                    className="ml-3 shrink-0 tabular-nums"
                  >
                    {action.points > 0 ? '+' : ''}{action.points} pts
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
