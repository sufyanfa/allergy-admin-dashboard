/**
 * Trust Overview Cards Component
 * 
 * Displays key trust metrics in card format
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Vote, TrendingUp, AlertTriangle, Lock, CheckCircle, Users } from 'lucide-react'
import { useTrustStore } from '@/lib/stores/trust-store'
import { useEffect } from 'react'
import { useTranslations } from '@/lib/hooks/use-translations'

export function TrustOverviewCards() {
    const t = useTranslations('trust.cards')
    const tCommon = useTranslations('common')
    const { overviewStats, loading, fetchOverviewStats } = useTrustStore()

    useEffect(() => {
        fetchOverviewStats()
    }, [fetchOverviewStats])

    if (loading && !overviewStats) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{tCommon('loading')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-muted animate-pulse rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    const stats = overviewStats || {
        totalVotes: 0,
        averageTrustScore: 0,
        contestedFields: 0,
        frozenFields: 0,
        verifiedFields: 0,
        activeVoters: 0,
    }

    const cards = [
        {
            title: t('totalVotes'),
            value: stats.totalVotes.toLocaleString(),
            icon: Vote,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: t('averageTrustScore'),
            value: stats.averageTrustScore.toFixed(1),
            icon: TrendingUp,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: t('contestedFields'),
            value: stats.contestedFields.toLocaleString(),
            icon: AlertTriangle,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
        },
        {
            title: t('frozenFields'),
            value: stats.frozenFields.toLocaleString(),
            icon: Lock,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
        {
            title: t('verifiedFields'),
            value: stats.verifiedFields.toLocaleString(),
            icon: CheckCircle,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
        },
        {
            title: t('activeVoters'),
            value: stats.activeVoters.toLocaleString(),
            icon: Users,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
        },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => {
                const Icon = card.icon
                return (
                    <Card key={card.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            <div className={`p-2 rounded-lg ${card.bgColor}`}>
                                <Icon className={`h-4 w-4 ${card.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
