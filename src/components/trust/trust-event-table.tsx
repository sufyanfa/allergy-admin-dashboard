'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { UserRankBadge } from './user-rank-badge'
import { formatDistanceToNow } from 'date-fns'
import type { TrustEvent } from '@/types/trust'
import { ThumbsUp, Flag, Shield, Lock, Unlock } from 'lucide-react'
import { useTranslations } from '@/lib/hooks/use-translations'

interface TrustEventTableProps {
    events: TrustEvent[]
    loading?: boolean
}

const eventTypeIcons: Record<string, any> = {
    vote_cast: ThumbsUp,
    admin_override: Shield,
    field_frozen: Lock,
    field_unfrozen: Unlock,
    time_decay: Flag,
}

const voteTypeColors: Record<string, string> = {
    approve: 'text-green-600 bg-green-50 border-green-200',
    reject: 'text-red-600 bg-red-50 border-red-200',
    flag: 'text-orange-600 bg-orange-50 border-orange-200',
}

export function TrustEventTable({ events, loading }: TrustEventTableProps) {
    const t = useTranslations('trust.auditPage.table')

    if (loading) {
        return (
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                ))}
            </div>
        )
    }

    if (events.length === 0) {
        return (
            <div className="text-center py-12">
                <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('noEvents')}</h3>
                <p className="text-muted-foreground">
                    {t('noEventsDesc')}
                </p>
            </div>
        )
    }

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('eventType')}</TableHead>
                        <TableHead>{t('product')}</TableHead>
                        <TableHead>{t('field')}</TableHead>
                        <TableHead>{t('user')}</TableHead>
                        <TableHead>{t('action')}</TableHead>
                        <TableHead>{t('details')}</TableHead>
                        <TableHead>{t('time')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {events.map((event) => {
                        const Icon = eventTypeIcons[event.eventType] || Flag
                        return (
                            <TableRow key={event.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">
                                            {event.eventType}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <code className="text-xs bg-muted px-2 py-1 rounded">
                                        {event.productId.slice(0, 8)}...
                                    </code>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{event.fieldType}</Badge>
                                </TableCell>
                                <TableCell>
                                    {event.userId ? (
                                        <div className="flex items-center gap-2">
                                            <code className="text-xs">{event.userId.slice(0, 8)}...</code>
                                            {event.userRank && (
                                                <UserRankBadge rank={event.userRank} size="sm" showIcon={false} />
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">System</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {event.voteType && (
                                        <Badge
                                            variant="outline"
                                            className={voteTypeColors[event.voteType]}
                                        >
                                            {event.voteType}
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        {event.oldTrustScore !== null && event.newTrustScore !== null && (
                                            <div className="text-xs">
                                                <span className="text-muted-foreground">Score: </span>
                                                <span className="font-mono">
                                                    {event.oldTrustScore.toFixed(1)} → {event.newTrustScore.toFixed(1)}
                                                </span>
                                            </div>
                                        )}
                                        {event.reason && (
                                            <div className="text-xs text-muted-foreground max-w-xs truncate">
                                                {event.reason}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
