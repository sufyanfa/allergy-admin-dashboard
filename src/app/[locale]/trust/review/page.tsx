'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { useRequireAuth } from '@/lib/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from '@/lib/hooks/use-translations'
import { RefreshCw, Shield, CheckCircle, XCircle, AlertTriangle, Eye } from 'lucide-react'
import { trustReviewApi } from '@/lib/api/trust'
import type { SuspiciousActivity, SuspiciousActivityAction } from '@/types/trust'

// ─── helpers ───────────────────────────────────────────────────────────────

function activityTypeLabel(type: string) {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

interface ResolveModal {
    activity: SuspiciousActivity
    notes: string
    action: SuspiciousActivityAction
    isSubmitting: boolean
    error: string | null
}

// ─── page ──────────────────────────────────────────────────────────────────

export default function TrustReviewPage() {
    const tCommon = useTranslations('common')
    const t = useTranslations('suspiciousActivity')
    const { isAdmin } = useRequireAuth()

    const [activities, setActivities] = useState<SuspiciousActivity[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [fetchError, setFetchError] = useState<string | null>(null)
    const [filterUserId, setFilterUserId] = useState('')
    const [modal, setModal] = useState<ResolveModal | null>(null)
    const [detailActivity, setDetailActivity] = useState<SuspiciousActivity | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    // Severity badge — defined inside page to access t()
    function severityBadge(score: number) {
        if (score >= 150) return <Badge variant="destructive">{t('critical')} ({score})</Badge>
        if (score >= 100) return <Badge className="bg-orange-500 text-white">{t('high')} ({score})</Badge>
        if (score >= 50) return <Badge className="bg-yellow-500 text-white">{t('medium')} ({score})</Badge>
        return <Badge variant="secondary">{t('low')} ({score})</Badge>
    }

    // Resolve actions built from translations
    const RESOLVE_ACTIONS: { value: SuspiciousActivityAction; label: string }[] = [
        { value: 'no_action', label: t('noAction') },
        { value: 'warned', label: t('warnUser') },
        { value: 'dismissed', label: t('dismiss') },
        { value: 'banned', label: t('banUser') },
    ]

    const fetchActivities = useCallback(async (userId?: string) => {
        setIsLoading(true)
        setFetchError(null)
        try {
            const params: { userId?: string; limit: number } = { limit: 100 }
            if (userId?.trim()) params.userId = userId.trim()
            const response = await trustReviewApi.getSuspiciousActivities(params)
            if (response.success) {
                setActivities(response.data)
            }
        } catch (err: any) {
            setFetchError(err?.message || t('failedToLoad'))
        } finally {
            setIsLoading(false)
        }
    }, [t])

    useEffect(() => {
        if (isAdmin) fetchActivities()
    }, [isAdmin, fetchActivities])

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault()
        fetchActivities(filterUserId)
    }

    const openResolveModal = (activity: SuspiciousActivity) => {
        setModal({
            activity,
            notes: '',
            action: 'no_action',
            isSubmitting: false,
            error: null,
        })
    }

    const submitResolve = async () => {
        if (!modal) return
        if (!modal.notes.trim()) {
            setModal(m => m ? { ...m, error: t('resolutionNotesRequired') } : null)
            return
        }
        setModal(m => m ? { ...m, isSubmitting: true, error: null } : null)
        try {
            await trustReviewApi.resolveActivity(modal.activity.id, {
                notes: modal.notes.trim(),
                action: modal.action,
            })
            setSuccessMsg(t('activityResolved', { id: modal.activity.id.slice(0, 8), action: modal.action }))
            setModal(null)
            // Remove resolved activity from list optimistically
            setActivities(prev => prev.filter(a => a.id !== modal.activity.id))
        } catch (err: any) {
            setModal(m => m ? { ...m, isSubmitting: false, error: err?.message || t('failedToResolve') } : null)
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
                            <Shield className="h-8 w-8 text-orange-500" />
                            {t('title')}
                        </h1>
                        <p className="text-muted-foreground">
                            {t('subtitle')}
                        </p>
                    </div>
                    <Button
                        onClick={() => fetchActivities(filterUserId || undefined)}
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        {tCommon('refresh')}
                    </Button>
                </div>

                {/* Filter */}
                <form onSubmit={handleFilter} className="flex gap-2 max-w-md">
                    <Input
                        placeholder={t('filterPlaceholder')}
                        value={filterUserId}
                        onChange={e => setFilterUserId(e.target.value)}
                        className="font-mono text-sm"
                    />
                    <Button type="submit" variant="outline" size="sm" disabled={isLoading}>
                        {t('filterBtn')}
                    </Button>
                    {filterUserId && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => { setFilterUserId(''); fetchActivities() }}
                        >
                            {t('clearBtn')}
                        </Button>
                    )}
                </form>

                {/* Feedback */}
                {fetchError && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-4 pb-4">
                            <p className="text-red-600 text-sm">{fetchError}</p>
                        </CardContent>
                    </Card>
                )}
                {successMsg && (
                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="pt-4 pb-4">
                            <p className="text-green-700 text-sm flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                {successMsg}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Activity Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            {t('unresolvedActivities')}
                            {!isLoading && (
                                <Badge variant="secondary" className="ml-2">
                                    {activities.length}
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">
                                {t('loadingActivities')}
                            </div>
                        ) : activities.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                                <CheckCircle className="h-8 w-8 text-green-500" />
                                {t('queueClear')}
                            </div>
                        ) : (
                            <div className="divide-y">
                                {activities.map(activity => (
                                    <div
                                        key={activity.id}
                                        className="flex items-center px-6 py-4 gap-4 hover:bg-muted/30 transition-colors"
                                    >
                                        {/* Severity */}
                                        <div className="w-36 shrink-0">
                                            {severityBadge(activity.severityScore)}
                                        </div>

                                        {/* Activity type */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium">
                                                {activityTypeLabel(activity.activityType)}
                                            </p>
                                            <p className="text-xs text-muted-foreground font-mono truncate">
                                                {t('userPrefix')}: {activity.userId}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(activity.detectedAt).toLocaleString()}
                                            </p>
                                        </div>

                                        {/* Current action */}
                                        {activity.actionTaken && (
                                            <Badge variant="outline" className="text-xs shrink-0">
                                                {activity.actionTaken}
                                            </Badge>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2 shrink-0">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-xs h-7 px-2"
                                                onClick={() => setDetailActivity(activity)}
                                            >
                                                <Eye className="h-3 w-3 mr-1" />
                                                {t('details')}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-xs h-7 px-3"
                                                onClick={() => openResolveModal(activity)}
                                            >
                                                {t('resolve')}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Evidence Detail Modal */}
                {detailActivity && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setDetailActivity(null)}
                    >
                        <Card
                            className="w-full max-w-lg max-h-[80vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                                    {t('activityEvidence')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="font-medium text-muted-foreground">{t('type')}</span>
                                        <p>{activityTypeLabel(detailActivity.activityType)}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-muted-foreground">{t('severity')}</span>
                                        <p>{detailActivity.severityScore}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-muted-foreground">{t('detection')}</span>
                                        <p>{detailActivity.detectionMethod || '—'}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-muted-foreground">{t('actionTaken')}</span>
                                        <p>{detailActivity.actionTaken || '—'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="font-medium text-muted-foreground">{t('userId')}</span>
                                        <p className="font-mono text-xs break-all">{detailActivity.userId}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="font-medium text-muted-foreground">{t('detectedAt')}</span>
                                        <p>{new Date(detailActivity.detectedAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div>
                                    <span className="font-medium text-muted-foreground text-sm">{t('evidenceData')}</span>
                                    <pre className="mt-1 text-xs bg-muted rounded p-3 overflow-x-auto whitespace-pre-wrap break-all">
                                        {JSON.stringify(detailActivity.evidenceData, null, 2)}
                                    </pre>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setDetailActivity(null)}
                                    >
                                        {tCommon('close')}
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            setDetailActivity(null)
                                            openResolveModal(detailActivity)
                                        }}
                                    >
                                        {t('resolve')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Resolve Modal */}
                {modal && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => !modal.isSubmitting && setModal(null)}
                    >
                        <Card
                            className="w-full max-w-md"
                            onClick={e => e.stopPropagation()}
                        >
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    {t('resolveActivity')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p>
                                        <span className="font-medium text-foreground">
                                            {activityTypeLabel(modal.activity.activityType)}
                                        </span>
                                        {' '}— {severityBadge(modal.activity.severityScore)}
                                    </p>
                                    <p className="font-mono text-xs truncate">
                                        {t('userPrefix')}: {modal.activity.userId}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">{t('action')}</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {RESOLVE_ACTIONS.map(({ value, label }) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setModal(m => m ? { ...m, action: value } : null)}
                                                className={`text-xs text-left px-3 py-2 rounded-md border transition-colors ${
                                                    modal.action === value
                                                        ? value === 'banned'
                                                            ? 'bg-red-100 border-red-400 text-red-800'
                                                            : 'bg-primary/10 border-primary text-primary'
                                                        : 'border-border hover:bg-muted/50'
                                                }`}
                                            >
                                                {value === 'banned' && <XCircle className="h-3 w-3 inline mr-1 text-red-500" />}
                                                {value === 'no_action' && <CheckCircle className="h-3 w-3 inline mr-1 text-green-500" />}
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">
                                        {t('resolutionNotes')} <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        className="w-full min-h-[80px] text-sm border rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                                        placeholder={t('resolutionNotesPlaceholder')}
                                        value={modal.notes}
                                        onChange={e => setModal(m => m ? { ...m, notes: e.target.value } : null)}
                                        disabled={modal.isSubmitting}
                                    />
                                </div>

                                {modal.error && (
                                    <p className="text-red-600 text-xs">{modal.error}</p>
                                )}

                                <div className="flex justify-end gap-2 pt-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setModal(null)}
                                        disabled={modal.isSubmitting}
                                    >
                                        {tCommon('cancel')}
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={submitResolve}
                                        disabled={modal.isSubmitting || !modal.notes.trim()}
                                        className={modal.action === 'banned' ? 'bg-red-600 hover:bg-red-700' : ''}
                                    >
                                        {modal.isSubmitting
                                            ? t('resolving')
                                            : t('confirmResolve', { action: modal.action.replace(/_/g, ' ') })
                                        }
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}
