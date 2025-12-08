'use client'

import { useEffect, useState } from 'react'
import { useAllergiesStore } from '@/lib/stores/allergies-store'
import { StatsCard } from '../dashboard/stats-card'
import { DistributionChart } from '../dashboard/distribution-chart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RefreshCw, Download, Search, Filter, Plus, AlertTriangle } from 'lucide-react'
import { AllergyForm } from '@/components/forms/allergy-form'
import { Allergy } from '@/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useTranslations } from '@/lib/hooks/use-translations'

interface AllergiesOverviewProps {
  className?: string
}

export function AllergiesOverview({ className }: AllergiesOverviewProps) {
  const t = useTranslations('allergies')
  const tCommon = useTranslations('common')
  const tMessages = useTranslations('messages')

  const {
    allergies,
    overview,
    currentAllergy,
    isLoading,
    error,
    severityFilter,
    activeFilter,
    fetchAllergiesOverview,
    createAllergy,
    updateAllergy,
    searchAllergies,
    setFilters,
    clearFilters,
    clearError,
    setCurrentAllergy
  } = useAllergiesStore()

  const [showFilters, setShowFilters] = useState(false)
  const [localSearchQuery, setLocalSearchQuery] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    // Initial data fetch - fetch overview which includes allergies
    fetchAllergiesOverview()
  }, [fetchAllergiesOverview])

  const handleSearch = async () => {
    if (localSearchQuery.trim()) {
      try {
        await searchAllergies(localSearchQuery.trim())
      } catch (error) {
        console.error('Search failed:', error)
      }
    } else {
      await fetchAllergiesOverview()
    }
  }

  const handleFilterChange = async () => {
    try {
      await fetchAllergiesOverview()
    } catch (error) {
      console.error('Filter search failed:', error)
    }
  }

  const handleRefresh = async () => {
    try {
      if (localSearchQuery.trim()) {
        await searchAllergies(localSearchQuery.trim())
      } else {
        await fetchAllergiesOverview()
      }
    } catch (error) {
      console.error('Refresh failed:', error)
    }
  }

  const handleExport = () => {
    const csvData = allergies.map(allergy => ({
      id: allergy.id,
      nameAr: allergy.nameAr,
      nameEn: allergy.nameEn || '',
      descriptionAr: allergy.descriptionAr || '',
      descriptionEn: allergy.descriptionEn || '',
      severity: allergy.severity,
      isActive: allergy.isActive ? 'Yes' : 'No',
      userCount: allergy.userCount || 0,
      createdAt: new Date(allergy.createdAt).toLocaleDateString()
    }))

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `allergies-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const handleCreateAllergy = () => {
    setCurrentAllergy(null)
    setIsFormOpen(true)
  }

  const handleEditAllergy = (allergy: Allergy) => {
    setCurrentAllergy(allergy)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (data: Partial<Allergy>) => {
    try {
      if (currentAllergy) {
        await updateAllergy(currentAllergy.id, data)
        toast.success('Allergy updated successfully')
      } else {
        // Ensure required fields for creation
        if (!data.nameAr) {
          toast.error(t('validation.nameArRequired'))
          return
        }
        const allergyData = {
          nameAr: data.nameAr,
          nameEn: data.nameEn || '',
          descriptionAr: data.descriptionAr || '',
          descriptionEn: data.descriptionEn || '',
          severity: data.severity || 'mild' as const,
          isActive: data.isActive ?? true
        }
        await createAllergy(allergyData)
        toast.success(tCommon('messages.created'))
      }
      setIsFormOpen(false)
    } catch (error: unknown) {
      toast.error((error as Error)?.message || tCommon('messages.error'))
    }
  }

  // Transform data for charts
  const severityChartData = overview?.severityDistribution ? [
    {
      label: t('mild'),
      value: overview.severityDistribution.mild,
      percentage: overview.totalAllergies ? (overview.severityDistribution.mild / overview.totalAllergies * 100) : 0,
      color: '#10B981'
    },
    {
      label: t('moderate'),
      value: overview.severityDistribution.moderate,
      percentage: overview.totalAllergies ? (overview.severityDistribution.moderate / overview.totalAllergies * 100) : 0,
      color: '#F59E0B'
    },
    {
      label: t('severe'),
      value: overview.severityDistribution.severe,
      percentage: overview.totalAllergies ? (overview.severityDistribution.severe / overview.totalAllergies * 100) : 0,
      color: '#EF4444'
    }
  ] : null

  const getSeverityBadge = (severity: string): "default" | "destructive" | "outline" | "secondary" => {
    const variants = {
      mild: 'default' as const,
      moderate: 'secondary' as const,
      severe: 'destructive' as const
    }
    return variants[severity as keyof typeof variants] || 'default'
  }

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
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            {tCommon('refresh')}
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {tCommon('export')}
          </Button>
          <Button onClick={handleCreateAllergy}>
            <Plus className="h-4 w-4 mr-2" />
            {t('addAllergy')}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-red-600">{error}</p>
              <Button onClick={clearError} variant="ghost" size="sm">
                {tCommon('close')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("totalAllergies")}
          value={overview?.totalAllergies || 0}
          icon="package"
          description={t("allergyTypesAvailable")}
          loading={isLoading}
        />

        <StatsCard
          title={t("activeAllergies")}
          value={overview?.activeAllergies || 0}
          icon="activity"
          description={t("currentlyUsed")}
          loading={isLoading}
        />

        <StatsCard
          title={t("userAssignments")}
          value={overview?.userAllergiesCount || 0}
          icon="users"
          description={t("totalAssignments")}
          loading={isLoading}
        />

        <StatsCard
          title={t("severeAllergies")}
          value={overview?.severityDistribution?.severe || 0}
          icon="shield-check"
          description={t("highRiskAllergies")}
          loading={isLoading}
        />
      </div>

      {/* Severity Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DistributionChart
          title={t("severityDistribution")}
          data={severityChartData}
          loading={isLoading}
          onRefresh={handleRefresh}
          centerText={overview ? {
            primary: overview.totalAllergies.toString(),
            secondary: t('totalAllergies')
          } : undefined}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              {t("severityBreakdown")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge variant="default" className="mr-2">{t('mild')}</Badge>
                  <span className="text-sm text-muted-foreground">{t('lowRiskReactions')}</span>
                </div>
                <span className="font-semibold">{overview?.severityDistribution?.mild || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge variant="secondary" className="mr-2">{t('moderate')}</Badge>
                  <span className="text-sm text-muted-foreground">{t('mediumRiskReactions')}</span>
                </div>
                <span className="font-semibold">{overview?.severityDistribution?.moderate || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge variant="destructive" className="mr-2">{t('severe')}</Badge>
                  <span className="text-sm text-muted-foreground">{t('highRiskReactions')}</span>
                </div>
                <span className="font-semibold">{overview?.severityDistribution?.severe || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("searchPlaceholder")}
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSearch} size="sm">
                <Search className="h-4 w-4 mr-2" />
                {tCommon('search')}
              </Button>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
              >
                <Filter className="h-4 w-4 mr-2" />
                {tCommon('filter')}
                {(severityFilter || activeFilter) && (
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
                <Select
                  value={severityFilter}
                  onValueChange={(value) => {
                    setFilters(value === 'all' ? '' : value, activeFilter)
                    handleFilterChange()
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("allSeverities")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("allSeverities")}</SelectItem>
                    <SelectItem value="mild">{t("mild")}</SelectItem>
                    <SelectItem value="moderate">{t("moderate")}</SelectItem>
                    <SelectItem value="severe">{t("severe")}</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={activeFilter}
                  onValueChange={(value) => {
                    setFilters(severityFilter, value === 'all' ? '' : value)
                    handleFilterChange()
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("allStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("allStatus")}</SelectItem>
                    <SelectItem value="true">{tCommon("active")}</SelectItem>
                    <SelectItem value="false">{tCommon("inactive")}</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => {
                    clearFilters()
                    setLocalSearchQuery('')
                    fetchAllergiesOverview()
                  }}
                  variant="outline"
                  size="sm"
                >
                  {t("clearFilters")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allergies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Allergies List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {allergies.map((allergy) => (
                <div
                  key={allergy.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{allergy.nameAr}</h3>
                      {allergy.nameEn && (
                        <span className="text-sm text-muted-foreground">({allergy.nameEn})</span>
                      )}
                      <Badge variant={getSeverityBadge(allergy.severity)}>
                        {allergy.severity}
                      </Badge>
                      {allergy.isActive && (
                        <Badge variant="outline">{tCommon("active")}</Badge>
                      )}
                    </div>
                    {allergy.descriptionAr && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {allergy.descriptionAr}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {allergy.userCount || 0} {tCommon("users").toLowerCase()}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditAllergy(allergy)}
                    >
                      {tCommon('edit')}
                    </Button>
                  </div>
                </div>
              ))}

              {allergies.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{t("noAllergiesFound")}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allergy Form */}
      <AllergyForm
        allergy={currentAllergy}
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        loading={isLoading}
      />
    </div>
  )
}