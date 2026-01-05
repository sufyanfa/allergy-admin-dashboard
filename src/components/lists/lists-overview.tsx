'use client'

import { useEffect, useState } from 'react'
import { useListsStore } from '@/lib/stores/lists-store'
import { StatsCard } from '../dashboard/stats-card'
import { DistributionChart } from '../dashboard/distribution-chart'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    RefreshCw,
    Download,
    Search,
    Filter,
    Plus,
    List,
    Users,
    Share2,
    Lock,
    Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from '@/lib/hooks/use-translations'
import { ListsTable } from '@/components/tables/lists-table'
import { ListForm } from '@/components/forms/list-form'
import { ListDetailModal } from './list-detail-modal'

interface ListsOverviewProps {
    className?: string
}

export function ListsOverview({ className }: ListsOverviewProps) {
    const tCommon = useTranslations('common')
    const t = useTranslations('lists')

    const {
        lists,
        overview,
        isLoading,
        error,
        filters,
        fetchListsOverview,
        setFilters,
        clearFilters,
        clearError,
    } = useListsStore()

    const [showForm, setShowForm] = useState(false)
    const [selectedListId, setSelectedListId] = useState<string | undefined>()
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [showMembersDialog, setShowMembersDialog] = useState(false)
    const [showSharingDialog, setShowSharingDialog] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        // Initial data fetch
        fetchListsOverview()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleSearch = async (query?: string) => {
        const searchTerm = query !== undefined ? query : searchQuery

        if (searchTerm.trim()) {
            setFilters({ search: searchTerm.trim() })
        } else {
            clearFilters()
        }
        await fetchListsOverview()
    }

    const handleRefresh = async () => {
        try {
            await fetchListsOverview()
        } catch (error) {
            console.error('Refresh failed:', error)
        }
    }

    const handleExport = () => {
        const csvData = lists.map((list) => ({
            id: list.id,
            nameAr: list.nameAr,
            nameEn: list.nameEn,
            privacy: list.privacy,
            productCount: list.productCount,
            shareEnabled: list.shareEnabled ? 'Yes' : 'No',
            createdAt: new Date(list.createdAt).toLocaleDateString(),
        }))

        const csv = [
            Object.keys(csvData[0] || {}).join(','),
            ...csvData.map((row) => Object.values(row).join(',')),
        ].join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `lists-${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        window.URL.revokeObjectURL(url)
    }

    const handleEdit = (listId: string) => {
        setSelectedListId(listId)
        setShowForm(true)
    }

    const handleViewMembers = (listId: string) => {
        setSelectedListId(listId)
        setShowMembersDialog(true)
    }

    const handleManageSharing = (listId: string) => {
        setSelectedListId(listId)
        setShowSharingDialog(true)
    }

    const handleViewDetails = (listId: string) => {
        setSelectedListId(listId)
        setShowDetailModal(true)
    }

    // Transform data for charts
    const privacyChartData = overview
        ? [
            {
                label: t('private'),
                value: overview.privateLists,
                percentage: overview.totalLists
                    ? (overview.privateLists / overview.totalLists) * 100
                    : 0,
                color: '#3B82F6',
            },
            {
                label: t('public'),
                value: overview.publicLists,
                percentage: overview.totalLists
                    ? (overview.publicLists / overview.totalLists) * 100
                    : 0,
                color: '#10B981',
            },
        ]
        : null

    const sharingChartData = overview
        ? [
            {
                label: t('notShared'),
                value: overview.totalLists - overview.sharedLists,
                percentage: overview.totalLists
                    ? ((overview.totalLists - overview.sharedLists) / overview.totalLists) * 100
                    : 0,
                color: '#6B7280',
            },
            {
                label: t('shared'),
                value: overview.sharedLists,
                percentage: overview.totalLists
                    ? (overview.sharedLists / overview.totalLists) * 100
                    : 0,
                color: '#F59E0B',
            },
        ]
        : null

    return (
        <div className={cn('space-y-6', className)}>
            {/* Header */}
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground">
                        {t('description')}
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button type="button" onClick={handleRefresh} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {tCommon('refresh')}
                    </Button>
                    <Button type="button" onClick={handleExport} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        {tCommon('export')}
                    </Button>
                    <Button type="button" onClick={() => setShowForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('createList')}
                    </Button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <p className="text-red-600">{error}</p>
                            <Button type="button" onClick={clearError} variant="ghost" size="sm">
                                {tCommon('close')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Overview Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title={t('totalLists')}
                    value={overview?.totalLists || 0}
                    icon="list"
                    description={t('allProductLists')}
                    loading={isLoading}
                />

                <StatsCard
                    title={t('totalProducts')}
                    value={overview?.totalProducts || 0}
                    icon="package"
                    description={t('acrossAllLists')}
                    loading={isLoading}
                />

                <StatsCard
                    title={t('sharedLists')}
                    value={overview?.sharedLists || 0}
                    icon="share-2"
                    description={t('listsWithMembers')}
                    loading={isLoading}
                />

                <StatsCard
                    title={t('activeUsers')}
                    value={overview?.activeUsers || 0}
                    icon="users"
                    description={t('creatingLists')}
                    loading={isLoading}
                />
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DistributionChart
                    title={t('privacyDistribution')}
                    data={privacyChartData}
                    loading={isLoading}
                    onRefresh={handleRefresh}
                    centerText={
                        overview
                            ? {
                                primary: overview.totalLists.toString(),
                                secondary: t('totalLists'),
                            }
                            : undefined
                    }
                />

                <DistributionChart
                    title={t('sharingStatus')}
                    data={sharingChartData}
                    loading={isLoading}
                    onRefresh={handleRefresh}
                    centerText={
                        overview
                            ? {
                                primary: overview.sharedLists.toString(),
                                secondary: t('shared'),
                            }
                            : undefined
                    }
                />
            </div>

            {/* Additional Stats */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    {t('pendingInvitations')}
                                </p>
                                <p className="text-2xl font-bold">{overview?.pendingInvitations || 0}</p>
                            </div>
                            <Share2 className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    {t('joinRequests')}
                                </p>
                                <p className="text-2xl font-bold">
                                    {overview?.pendingJoinRequests || 0}
                                </p>
                            </div>
                            <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="pt-6">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleSearch()
                            return false
                        }}
                        className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4"
                    >
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder={t('searchPlaceholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <Button type="submit" size="sm" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        {tCommon('searching')}
                                    </>
                                ) : (
                                    <>
                                        <Search className="h-4 w-4 mr-2" />
                                        {tCommon('search')}
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={(e) => {
                                    e.preventDefault()
                                    setShowFilters(!showFilters)
                                }}
                                variant="outline"
                                size="sm"
                                type="button"
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                {tCommon('filter')}
                                {(filters.privacy || filters.userId || filters.shareEnabled !== undefined) && (
                                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                                        !
                                    </Badge>
                                )}
                            </Button>
                        </div>
                    </form>

                    {showFilters && (
                        <div className="mt-4 pt-4 border-t">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">{t('privacy')}</label>
                                    <select
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={filters.privacy || ''}
                                        onChange={(e) =>
                                            setFilters({ privacy: e.target.value as any || undefined })
                                        }
                                    >
                                        <option value="">{tCommon('filter')}</option>
                                        <option value="private">{t('private')}</option>
                                        <option value="public">{t('public')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">{t('sharing')}</label>
                                    <select
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={
                                            filters.shareEnabled === undefined
                                                ? ''
                                                : filters.shareEnabled
                                                    ? 'enabled'
                                                    : 'disabled'
                                        }
                                        onChange={(e) =>
                                            setFilters({
                                                shareEnabled:
                                                    e.target.value === ''
                                                        ? undefined
                                                        : e.target.value === 'enabled',
                                            })
                                        }
                                    >
                                        <option value="">{tCommon('filter')}</option>
                                        <option value="enabled">{t('enabled')}</option>
                                        <option value="disabled">{t('disabled')}</option>
                                    </select>
                                </div>

                                <div className="flex items-end">
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            clearFilters()
                                            setSearchQuery('')
                                            fetchListsOverview()
                                        }}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        {t('clearFilters')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Lists Table */}
            <ListsTable
                lists={lists}
                isLoading={isLoading}
                onEdit={handleEdit}
                onViewMembers={handleViewMembers}
                onManageSharing={handleManageSharing}
                onViewDetails={handleViewDetails}
            />

            {/* Modals */}
            <ListDetailModal
                open={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false)
                    setSelectedListId(undefined)
                }}
                listId={selectedListId || null}
            />

            {showForm && (
                <ListForm
                    open={showForm}
                    onClose={() => {
                        setShowForm(false)
                        setSelectedListId(undefined)
                    }}
                    listId={selectedListId}
                />
            )}

            {/* TODO: Add Members Dialog */}
            {/* TODO: Add Sharing Dialog */}
        </div>
    )
}
