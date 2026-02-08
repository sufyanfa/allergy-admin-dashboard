'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useShallow } from 'zustand/react/shallow'
import { useStatisticsStore } from '@/lib/stores/statistics-store'
import { StatsCard } from './stats-card'
import { SystemHealth } from './system-health'
import { Button } from '@/components/ui/button'
import { RefreshCw, Download, Activity } from 'lucide-react'
import { StatisticsService } from '@/lib/api/statistics'
import { cn } from '@/lib/utils'
import { useTranslations } from '@/lib/hooks/use-translations'

// Lazy load chart components to defer ~50KB Chart.js bundle
const GrowthChart = dynamic(
  () => import('./growth-chart').then(m => ({ default: m.GrowthChart })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-lg border p-6">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
          <div className="text-gray-400">Loading chart...</div>
        </div>
      </div>
    ),
  }
)

const DistributionChart = dynamic(
  () => import('./distribution-chart').then(m => ({ default: m.DistributionChart })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-lg border p-6">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
          <div className="text-gray-400">Loading chart...</div>
        </div>
      </div>
    ),
  }
)

interface DashboardOverviewProps {
  className?: string
}

export function DashboardOverview({ className }: DashboardOverviewProps) {
  const t = useTranslations('dashboard')
  const tCommon = useTranslations('common')
  const initializedRef = useRef(false)

  // Select data and loading states with useShallow to prevent re-renders
  // when unrelated store properties change
  const {
    dashboardOverview,
    keyMetrics,
    userStatistics,
    productStatistics,
    activityStatistics,
    userGrowth,
    productGrowth,
    isLoadingOverview,
    isLoadingKeyMetrics,
    isLoadingUserStats,
    isLoadingProductStats,
    isLoadingActivityStats,
    error,
  } = useStatisticsStore(
    useShallow((state) => ({
      dashboardOverview: state.dashboardOverview,
      keyMetrics: state.keyMetrics,
      userStatistics: state.userStatistics,
      productStatistics: state.productStatistics,
      activityStatistics: state.activityStatistics,
      userGrowth: state.userGrowth,
      productGrowth: state.productGrowth,
      isLoadingOverview: state.isLoadingOverview,
      isLoadingKeyMetrics: state.isLoadingKeyMetrics,
      isLoadingUserStats: state.isLoadingUserStats,
      isLoadingProductStats: state.isLoadingProductStats,
      isLoadingActivityStats: state.isLoadingActivityStats,
      error: state.error,
    }))
  )

  // Select actions individually — these are stable references in Zustand 5
  const fetchOverview = useStatisticsStore((s) => s.fetchDashboardOverview)
  const fetchKeyMetrics = useStatisticsStore((s) => s.fetchKeyMetrics)
  const fetchUserStatistics = useStatisticsStore((s) => s.fetchUserStatistics)
  const fetchProductStatistics = useStatisticsStore((s) => s.fetchProductStatistics)
  const fetchActivityStatistics = useStatisticsStore((s) => s.fetchActivityStatistics)
  const fetchUserGrowth = useStatisticsStore((s) => s.fetchUserGrowth)
  const fetchProductGrowth = useStatisticsStore((s) => s.fetchProductGrowth)

  const [userGrowthPeriod, setUserGrowthPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [productGrowthPeriod, setProductGrowthPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  // Initialize data ONCE on mount — no function refs in deps
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    Promise.allSettled([
      fetchOverview(),
      fetchKeyMetrics(),
      fetchUserStatistics(),
      fetchProductStatistics(),
      fetchActivityStatistics(),
      fetchUserGrowth('daily'),
      fetchProductGrowth('daily'),
    ])
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch growth data only when the period selector changes
  useEffect(() => {
    if (!initializedRef.current) return
    fetchUserGrowth(userGrowthPeriod)
  }, [userGrowthPeriod, fetchUserGrowth])

  useEffect(() => {
    if (!initializedRef.current) return
    fetchProductGrowth(productGrowthPeriod)
  }, [productGrowthPeriod, fetchProductGrowth])

  const handleRefreshAll = useCallback(async () => {
    await Promise.allSettled([
      fetchOverview(),
      fetchKeyMetrics(),
      fetchUserStatistics(),
      fetchProductStatistics(),
      fetchActivityStatistics(),
      fetchUserGrowth(userGrowthPeriod),
      fetchProductGrowth(productGrowthPeriod),
    ])
  }, [
    fetchOverview, fetchKeyMetrics, fetchUserStatistics,
    fetchProductStatistics, fetchActivityStatistics,
    fetchUserGrowth, fetchProductGrowth,
    userGrowthPeriod, productGrowthPeriod,
  ])

  const handleExport = useCallback(async (format: 'json' | 'csv') => {
    try {
      const result = await StatisticsService.exportDashboardData({
        period: '30d',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        format,
      })

      if (format === 'csv') {
        alert(t('exportSuccess'))
      } else {
        console.log('Export data:', result)
        alert(t('exportComplete'))
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert(`${t('exportFailed')}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [t])

  const handleTestConnection = useCallback(async () => {
    try {
      console.log('Testing API connection...')
      await StatisticsService.testConnection()
      alert(`✅ ${t('connectionSuccess')}`)
    } catch (error) {
      console.error('Connection test failed:', error)
      alert(`❌ ${t('connectionFailed')}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [t])

  // Period change handlers — only set state, useEffect handles the fetch
  const handleUserGrowthPeriodChange = useCallback((period: 'daily' | 'weekly' | 'monthly') => {
    setUserGrowthPeriod(period)
  }, [])

  const handleProductGrowthPeriodChange = useCallback((period: 'daily' | 'weekly' | 'monthly') => {
    setProductGrowthPeriod(period)
  }, [])

  // Memoize refresh callbacks for chart components
  const handleUserGrowthRefresh = useCallback(() => {
    fetchUserGrowth(userGrowthPeriod)
  }, [fetchUserGrowth, userGrowthPeriod])

  const handleProductGrowthRefresh = useCallback(() => {
    fetchProductGrowth(productGrowthPeriod)
  }, [fetchProductGrowth, productGrowthPeriod])

  // Memoize chart data transformations to prevent Chart.js re-initialization
  const userDemographicsData = useMemo(() => {
    return userStatistics?.demographics.byRole.map((item, index) => ({
      label: item.role,
      value: item.count,
      percentage: item.percentage,
      color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4],
    })) || null
  }, [userStatistics])

  const productCategoriesData = useMemo(() => {
    return productStatistics?.categories.slice(0, 8).map((item, index) => ({
      label: item.category,
      value: item.count,
      percentage: item.percentage,
      color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'][index % 8],
    })) || null
  }, [productStatistics])

  const productDataSourcesData = useMemo(() => {
    return productStatistics?.dataSources.map((item, index) => ({
      label: item.source,
      value: item.count,
      percentage: item.percentage,
      color: ['#3B82F6', '#10B981', '#F59E0B'][index % 3],
    })) || null
  }, [productStatistics])

  // Memoize center text objects for distribution charts
  const userCenterText = useMemo(() => {
    return userStatistics ? {
      primary: userStatistics.overview.totalUsers.toLocaleString(),
      secondary: t('totalUsers'),
    } : undefined
  }, [userStatistics, t])

  const categoriesCenterText = useMemo(() => {
    return productStatistics ? {
      primary: productStatistics.overview.categoriesCount.toString(),
      secondary: t('categories'),
    } : undefined
  }, [productStatistics, t])

  const sourcesCenterText = useMemo(() => {
    return productStatistics ? {
      primary: (productStatistics.overview.avgConfidenceScore * 100).toFixed(0) + '%',
      secondary: t('avgQuality'),
    } : undefined
  }, [productStatistics, t])

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('overview')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={handleTestConnection} size="sm">
            <Activity className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{t('testApi')}</span>
            <span className="sm:hidden">{t('test')}</span>
          </Button>
          <Button variant="outline" onClick={handleRefreshAll} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{tCommon('refresh')}</span>
            <span className="sm:hidden">{tCommon('refresh')}</span>
          </Button>
          <Button variant="outline" onClick={() => handleExport('json')} size="sm">
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden lg:inline">{tCommon('export')} JSON</span>
            <span className="lg:hidden">JSON</span>
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')} size="sm">
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden lg:inline">{tCommon('export')} CSV</span>
            <span className="lg:hidden">CSV</span>
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('totalUsers')}
          value={keyMetrics?.totalUsers || 0}
          change={{
            value: dashboardOverview?.users.growthRate || 0,
            type: (dashboardOverview?.users.growthRate || 0) >= 0 ? 'increase' : 'decrease',
            period: t('vsLastPeriod'),
          }}
          icon="users"
          description={t('activeRegisteredUsers')}
          loading={isLoadingKeyMetrics || isLoadingOverview}
        />

        <StatsCard
          title={t('totalProducts')}
          value={keyMetrics?.totalProducts || 0}
          change={{
            value: 5.2,
            type: 'increase',
            period: t('vsLastMonth'),
          }}
          icon="package"
          description={t('productsInDatabase')}
          loading={isLoadingKeyMetrics}
        />

        <StatsCard
          title={t('totalSearches')}
          value={keyMetrics?.totalSearches || 0}
          change={{
            value: 12.4,
            type: 'increase',
            period: t('vsLastWeek'),
          }}
          icon="activity"
          description={t('searchQueriesPerformed')}
          loading={isLoadingKeyMetrics}
        />

        <StatsCard
          title={t('systemUptime')}
          value={`${((keyMetrics?.systemUptime || 0) * 100).toFixed(1)}%`}
          change={{
            value: 0.1,
            type: 'increase',
            period: t('vsLastMonth'),
          }}
          icon="server"
          description={t('serviceAvailability')}
          loading={isLoadingKeyMetrics}
        />
      </div>

      {/* Charts Row 1 - Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GrowthChart
          title={t('userGrowth')}
          data={userGrowth[userGrowthPeriod] || null}
          loading={isLoadingUserStats}
          onPeriodChange={handleUserGrowthPeriodChange}
          onRefresh={handleUserGrowthRefresh}
          showCumulative={true}
        />

        <GrowthChart
          title={t('productGrowth')}
          data={productGrowth[productGrowthPeriod] || null}
          loading={isLoadingProductStats}
          onPeriodChange={handleProductGrowthPeriodChange}
          onRefresh={handleProductGrowthRefresh}
          showCumulative={true}
        />
      </div>

      {/* Charts Row 2 - Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <DistributionChart
          title={t('userDistributionByRole')}
          data={userDemographicsData}
          loading={isLoadingUserStats}
          onRefresh={fetchUserStatistics}
          centerText={userCenterText}
        />

        <DistributionChart
          title={t('productCategories')}
          data={productCategoriesData}
          loading={isLoadingProductStats}
          onRefresh={fetchProductStatistics}
          centerText={categoriesCenterText}
        />

        <DistributionChart
          title={t('productDataSources')}
          data={productDataSourcesData}
          loading={isLoadingProductStats}
          onRefresh={fetchProductStatistics}
          centerText={sourcesCenterText}
        />
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SystemHealth />
        </div>

        {/* Activity Overview */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title={t('searchesToday')}
              value={activityStatistics?.overview.searchesToday || 0}
              icon="activity"
              description={t('todaySearchActivity')}
              loading={isLoadingActivityStats}
            />

            <StatsCard
              title={t('avgSearchTime')}
              value={`${activityStatistics?.overview.avgSearchTime || 0}ms`}
              icon="activity"
              description={t('responsePerformance')}
              loading={isLoadingActivityStats}
            />

            <StatsCard
              title={t('contributions')}
              value={activityStatistics?.overview.contributionsToday || 0}
              icon="users"
              description={t('userContributionsToday')}
              loading={isLoadingActivityStats}
            />

            <StatsCard
              title={t('verifiedProducts')}
              value={`${((productStatistics?.quality.verificationRate || 0) * 100).toFixed(0)}%`}
              icon="package"
              description={t('productVerificationRate')}
              loading={isLoadingProductStats}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
