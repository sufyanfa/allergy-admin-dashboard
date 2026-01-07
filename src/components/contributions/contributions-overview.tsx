'use client'

import { useEffect, useState } from 'react'
import { useContributionsStore } from '@/lib/stores/contributions-store'
import { StatsCard } from '../dashboard/stats-card'
import { DistributionChart } from '../dashboard/distribution-chart'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RefreshCw, Search, Filter, CheckCircle, XCircle } from 'lucide-react'
import { ContributionsTable } from '@/components/tables/contributions-table'
import { ContributionDetailModal } from './contribution-detail-modal'
import { cn } from '@/lib/utils'
import { useTranslations } from '@/lib/hooks/use-translations'
import { Contribution, ContributionStatus, ContributionType } from '@/types'
import { toast } from 'sonner'

interface ContributionsOverviewProps {
  className?: string
}

export function ContributionsOverview({ className }: ContributionsOverviewProps) {
  const t = useTranslations('contributions')
  const tCommon = useTranslations('common')
  const tMessages = useTranslations('messages')

  const {
    contributions,
    overview,
    isLoading,
    error,
    filters,
    selectedIds,
    pagination,
    fetchContributionsOverview,
    fetchContribution,
    editContribution,
    setFilters,
    clearFilters,
    updateContributionStatus,
    bulkUpdateContributions,
    toggleSelection,
    setSelectedIds,
    clearSelection,
    clearError,
    loadMore
  } = useContributionsStore()

  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)

  useEffect(() => {
    fetchContributionsOverview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = async () => {
    setFilters({ search: searchQuery, offset: 0 })
    await fetchContributionsOverview()
  }

  const handleRefresh = async () => {
    try {
      await fetchContributionsOverview()
      toast.success('Contributions refreshed')
    } catch (error) {
      console.error('Refresh failed:', error)
      toast.error('Failed to refresh contributions')
    }
  }

  const handleApprove = async (contribution: Contribution, notes?: string, editedData?: Record<string, string | number | undefined>) => {
    try {
      // Step 1: If there's edited data, save it first using the edit endpoint
      if (editedData && Object.keys(editedData).length > 0) {
        console.log('🔧 Saving edited data first:', editedData)
        await editContribution(contribution.id, editedData as any)
        toast.success('Changes saved')
      }

      // Step 2: Now approve the contribution
      console.log('✅ Approving contribution')
      await updateContributionStatus(contribution.id, {
        status: 'approved',
        notes
      })

      if (editedData && Object.keys(editedData).length > 0) {
        toast.success('Contribution approved with your edits')
      } else {
        toast.success('Contribution approved successfully')
      }
    } catch (error: any) {
      console.error('❌ Approve failed - Full error:', error)
      console.error('❌ Error response:', error?.response)
      console.error('❌ Error data:', error?.response?.data)
      console.error('❌ Error message:', error?.message)
      toast.error(`Failed to approve: ${error?.response?.data?.message || error?.message || 'Unknown error'}`)
      throw error
    }
  }

  const handleReject = async (contribution: Contribution, notes?: string) => {
    try {
      await updateContributionStatus(contribution.id, {
        status: 'rejected',
        notes
      })
      toast.success('Contribution rejected')
    } catch (error) {
      console.error('Reject failed:', error)
      toast.error('Failed to reject contribution')
      throw error
    }
  }

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select contributions to approve')
      return
    }

    try {
      const result = await bulkUpdateContributions({
        contributionIds: selectedIds,
        status: 'approved'
      })
      toast.success(`Approved ${result.succeeded} contributions`)
      if (result.failed > 0) {
        toast.error(`Failed to approve ${result.failed} contributions`)
      }
    } catch (error) {
      console.error('Bulk approve failed:', error)
      toast.error('Failed to bulk approve contributions')
    }
  }

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select contributions to reject')
      return
    }

    try {
      const result = await bulkUpdateContributions({
        contributionIds: selectedIds,
        status: 'rejected'
      })
      toast.success(`Rejected ${result.succeeded} contributions`)
      if (result.failed > 0) {
        toast.error(`Failed to reject ${result.failed} contributions`)
      }
    } catch (error) {
      console.error('Bulk reject failed:', error)
      toast.error('Failed to bulk reject contributions')
    }
  }

  const handleStatusFilter = (status: string) => {
    const statusValue = status === 'all' ? undefined : (status as ContributionStatus)
    setFilters({ status: statusValue, offset: 0 })
    fetchContributionsOverview()
  }

  const handleTypeFilter = (type: string) => {
    const typeValue = type === 'all' ? undefined : (type as ContributionType)
    setFilters({ contributionType: typeValue, offset: 0 })
    fetchContributionsOverview()
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    clearFilters()
    fetchContributionsOverview()
  }

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(contributions.map(c => c.id))
    } else {
      clearSelection()
    }
  }

  const handleViewDetails = async (contribution: Contribution) => {
    setIsLoadingDetail(true)
    try {
      // Fetch full contribution data with all fields
      const fullContribution = await fetchContribution(contribution.id)
      setSelectedContribution(fullContribution)
    } catch (error) {
      console.error('Failed to fetch contribution details:', error)
      toast.error('Failed to load contribution details')
    } finally {
      setIsLoadingDetail(false)
    }
  }

  // Transform data for charts
  const typeDistributionData = overview?.typeDistribution?.map((item, index) => {
    const total = overview.totalContributions
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
    return {
      label: item.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: item.count,
      percentage: total ? (item.count / total * 100) : 0,
      color: colors[index % colors.length]
    }
  }) || null

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('title')}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button type="button" onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            {tCommon('refresh')}
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
          title={t("totalContributions")}
          value={overview?.totalContributions || 0}
          icon="users"
          description={t("allSubmissions")}
          loading={isLoading}
        />

        <StatsCard
          title={t("pendingReview")}
          value={overview?.pendingContributions || 0}
          icon="package"
          description={t("awaitingReview")}
          loading={isLoading}
        />

        <StatsCard
          title={t("approved")}
          value={overview?.approvedContributions || 0}
          icon="package"
          description={t("acceptedContributions")}
          loading={isLoading}
        />

        <StatsCard
          title={t("rejected")}
          value={overview?.rejectedContributions || 0}
          icon="package"
          description={t("declinedContributions")}
          loading={isLoading}
        />
      </div>

      {/* Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DistributionChart
          title={t("contributionTypes")}
          data={typeDistributionData}
          loading={isLoading}
          onRefresh={handleRefresh}
          centerText={overview ? {
            primary: overview.totalContributions.toString(),
            secondary: 'Total'
          } : undefined}
        />

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('quickStats')}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('approvalRate')}</span>
              <span className="font-semibold">
                {overview && overview.totalContributions > 0
                  ? Math.round((overview.approvedContributions / overview.totalContributions) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('pendingRate')}</span>
              <span className="font-semibold">
                {overview && overview.totalContributions > 0
                  ? Math.round((overview.pendingContributions / overview.totalContributions) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{tCommon('selected')}</span>
              <Badge variant="secondary">{selectedIds.length}</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-900">
                {selectedIds.length} {t('contributionsSelected')}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleBulkApprove}
                  size="sm"
                  variant="default"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t('approveSelected')}
                </Button>
                <Button
                  onClick={handleBulkReject}
                  size="sm"
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {t('rejectSelected')}
                </Button>
                <Button
                  onClick={clearSelection}
                  size="sm"
                  variant="outline"
                >
                  {tCommon('clearSelection')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by ID or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button type="button" onClick={handleSearch} size="sm">
                <Search className="h-4 w-4 mr-2" />
                {tCommon('search')}
              </Button>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
                type="button"
              >
                <Filter className="h-4 w-4 mr-2" />
                {tCommon('filter')}
                {(filters.status || filters.contributionType) && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    !
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{tCommon('status')}</Label>
                  <Select
                    value={filters.status || 'all'}
                    onValueChange={handleStatusFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allStatuses')}</SelectItem>
                      <SelectItem value="pending">{t('pending')}</SelectItem>
                      <SelectItem value="approved">{t('approved')}</SelectItem>
                      <SelectItem value="rejected">{t('rejected')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{tCommon('type')}</Label>
                  <Select
                    value={filters.contributionType || 'all'}
                    onValueChange={handleTypeFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allTypes')}</SelectItem>
                      <SelectItem value="new_product">{t('newProduct')}</SelectItem>
                      <SelectItem value="edit_ingredients">{t('editIngredients')}</SelectItem>
                      <SelectItem value="add_image">{t('addImage')}</SelectItem>
                      <SelectItem value="report_error">{t('reportError')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button
                    onClick={handleClearFilters}
                    variant="outline"
                    className="w-full"
                  >
                    {tCommon('reset')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contributions Table */}
      <ContributionsTable
        contributions={contributions}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onToggleSelection={toggleSelection}
        onToggleAll={handleToggleAll}
        onView={handleViewDetails}
        onApprove={(contribution) => handleApprove(contribution)}
        onReject={(contribution) => handleReject(contribution)}
        onLoadMore={loadMore}
        hasMore={pagination.hasMore}
      />

      {/* Detail Modal */}
      <ContributionDetailModal
        contribution={selectedContribution}
        open={!!selectedContribution || isLoadingDetail}
        onClose={() => setSelectedContribution(null)}
        isLoading={isLoadingDetail}
        onSaveChanges={async (id, editedData) => {
          try {
            await editContribution(id, editedData as any)
            toast.success('Changes saved successfully')
            // Refresh the selected contribution to show updated data
            const updated = await fetchContribution(id)
            setSelectedContribution(updated)
          } catch (error) {
            toast.error('Failed to save changes')
            throw error
          }
        }}
        onApprove={(id, notes, editedData) => {
          const contribution = selectedContribution
          if (contribution) return handleApprove(contribution, notes, editedData)
          return Promise.resolve()
        }}
        onReject={(id, notes) => {
          const contribution = selectedContribution
          if (contribution) return handleReject(contribution, notes)
          return Promise.resolve()
        }}
      />
    </div>
  )
}
