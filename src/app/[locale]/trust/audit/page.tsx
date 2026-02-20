'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrustEventTable } from '@/components/trust/trust-event-table'
import { AuditFilters } from '@/components/trust/audit-filters'
import { useTrustStore } from '@/lib/stores/trust-store'
import { Download, RefreshCw, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { AdminLayout } from '@/components/layout/admin-layout'
import { useTranslations } from '@/lib/hooks/use-translations'

export default function AuditTrailPage() {
    const t = useTranslations('trust.auditPage')
    const { trustEvents, loading, error } = useTrustStore()
    const [filters, setFilters] = useState<{
        eventType?: string
        productId?: string
        userId?: string
        fieldType?: string
        dateFrom?: string
        dateTo?: string
    }>({})

    // Get all events (flatten the record)
    const allEvents = Object.values(trustEvents).flat()

    // Apply filters
    const filteredEvents = allEvents.filter((event) => {
        if (filters.eventType && event.eventType !== filters.eventType) return false
        if (filters.productId && !event.productId.includes(filters.productId)) return false
        if (filters.userId && event.userId && !event.userId.includes(filters.userId)) return false
        if (filters.fieldType && event.fieldType !== filters.fieldType) return false
        if (filters.dateFrom && new Date(event.createdAt) < new Date(filters.dateFrom)) return false
        if (filters.dateTo && new Date(event.createdAt) > new Date(filters.dateTo)) return false
        return true
    })

    // Sort by most recent first
    const sortedEvents = [...filteredEvents].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    const handleRefresh = () => {
        // Refresh would require fetching all events - for now just show toast
        toast.info('Refreshing audit trail...')
        // In production, you'd call an API to fetch all events
    }

    const handleExport = () => {
        // Export filtered events to CSV
        const csv = [
            ['Event Type', 'Product ID', 'Field', 'User ID', 'Vote Type', 'Old Score', 'New Score', 'Reason', 'Time'],
            ...sortedEvents.map((event) => [
                event.eventType,
                event.productId,
                event.fieldType,
                event.userId || 'System',
                event.voteType || '',
                event.oldTrustScore?.toString() || '',
                event.newTrustScore?.toString() || '',
                event.reason || '',
                new Date(event.createdAt).toISOString(),
            ]),
        ]
            .map((row) => row.map((cell) => `"${cell}"`).join(','))
            .join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `trust-audit-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)

        toast.success('Audit trail exported successfully!')
    }

    const handleClearFilters = () => {
        setFilters({})
    }

    return (
        <AdminLayout>
            <div className="flex-1 space-y-6 pt-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <Shield className="h-8 w-8 text-primary" />
                            {t('title')}
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            {t('subtitle')}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleRefresh}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {t('refresh')}
                        </Button>
                        <Button onClick={handleExport} disabled={sortedEvents.length === 0}>
                            <Download className="h-4 w-4 mr-2" />
                            {t('export')}
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {t('stats.totalEvents')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{allEvents.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {t('stats.filteredEvents')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{sortedEvents.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {t('stats.adminActions')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {allEvents.filter((e) => e.eventType === 'admin_override').length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {t('stats.userVotes')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {allEvents.filter((e) => e.eventType === 'vote_cast').length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="grid gap-6 lg:grid-cols-4">
                    {/* Filters Sidebar */}
                    <div className="lg:col-span-1">
                        <AuditFilters
                            filters={filters}
                            onFilterChange={setFilters}
                            onClearFilters={handleClearFilters}
                        />
                    </div>

                    {/* Events Table */}
                    <div className="lg:col-span-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('table.title')}</CardTitle>
                                <CardDescription>
                                    {sortedEvents.length} event{sortedEvents.length !== 1 ? 's' : ''} found
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {error && (
                                    <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-4">
                                        Error loading events: {error}
                                    </div>
                                )}
                                <TrustEventTable events={sortedEvents} loading={loading} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
