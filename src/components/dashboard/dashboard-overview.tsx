'use client'

import { useEffect, useState } from 'react'
import { useStatisticsStore, useStatisticsOverview, useKeyMetrics } from '@/lib/stores/statistics-store'
import { StatsCard } from './stats-card'
import { SystemHealth } from './system-health'
import { GrowthChart } from './growth-chart'
import { DistributionChart } from './distribution-chart'
import { Button } from '@/components/ui/button'
import { RefreshCw, Download, Activity } from 'lucide-react'
import { StatisticsService } from '@/lib/api/statistics'
import { cn } from '@/lib/utils'

interface DashboardOverviewProps {
  className?: string
}

export function DashboardOverview({ className }: DashboardOverviewProps) {
  const {
    userStatistics,
    productStatistics,
    activityStatistics,
    userGrowth,
    productGrowth,
    fetchUserStatistics,
    fetchProductStatistics,
    fetchActivityStatistics,
    fetchUserGrowth,
    fetchProductGrowth,
    isLoadingUserStats,
    isLoadingProductStats,
    isLoadingActivityStats,
    error
  } = useStatisticsStore()

  const { data: overview, loading: overviewLoading, fetch: fetchOverview } = useStatisticsOverview()
  const { data: keyMetrics, loading: keyMetricsLoading, fetch: fetchKeyMetrics } = useKeyMetrics()

  const [userGrowthPeriod, setUserGrowthPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [productGrowthPeriod, setProductGrowthPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  useEffect(() => {
    // Initial data fetch
    const initializeData = async () => {
      await Promise.allSettled([
        fetchOverview(),
        fetchKeyMetrics(),
        fetchUserStatistics(),
        fetchProductStatistics(),
        fetchActivityStatistics(),
        fetchUserGrowth(userGrowthPeriod),
        fetchProductGrowth(productGrowthPeriod)
      ])
    }

    initializeData()
  }, [
    fetchOverview,
    fetchKeyMetrics,
    fetchUserStatistics,
    fetchProductStatistics,
    fetchActivityStatistics,
    fetchUserGrowth,
    fetchProductGrowth,
    userGrowthPeriod,
    productGrowthPeriod
  ])

  const handleRefreshAll = async () => {
    await Promise.allSettled([
      fetchOverview(),
      fetchKeyMetrics(),
      fetchUserStatistics(),
      fetchProductStatistics(),
      fetchActivityStatistics(),
      fetchUserGrowth(userGrowthPeriod),
      fetchProductGrowth(productGrowthPeriod)
    ])
  }

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const result = await StatisticsService.exportDashboardData({
        period: '30d',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        format
      })

      if (format === 'csv') {
        // CSV download is handled automatically in the service
        alert('Export downloaded successfully!')
      } else {
        // For JSON, we can show a success message or handle differently
        console.log('Export data:', result)
        alert('Export completed successfully!')
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleTestConnection = async () => {
    try {
      console.log('Testing API connection...')
      await StatisticsService.testConnection()
      alert('✅ CORS connection test successful!')
    } catch (error) {
      console.error('Connection test failed:', error)
      alert(`❌ Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleUserGrowthPeriodChange = (period: 'daily' | 'weekly' | 'monthly') => {
    setUserGrowthPeriod(period)
    fetchUserGrowth(period)
  }

  const handleProductGrowthPeriodChange = (period: 'daily' | 'weekly' | 'monthly') => {
    setProductGrowthPeriod(period)
    fetchProductGrowth(period)
  }

  // Transform data for charts
  const userDemographicsData = userStatistics?.demographics.byRole.map((item, index) => ({
    label: item.role,
    value: item.count,
    percentage: item.percentage,
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4]
  })) || null

  const productCategoriesData = productStatistics?.categories.slice(0, 8).map((item, index) => ({
    label: item.category,
    value: item.count,
    percentage: item.percentage,
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'][index % 8]
  })) || null

  const productDataSourcesData = productStatistics?.dataSources.map((item, index) => ({
    label: item.source,
    value: item.count,
    percentage: item.percentage,
    color: ['#3B82F6', '#10B981', '#F59E0B'][index % 3]
  })) || null

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Monitor your allergy checker platform performance</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleTestConnection}>
            <Activity className="h-4 w-4 mr-2" />
            Test API
          </Button>
          <Button variant="outline" onClick={handleRefreshAll}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
          <div className="relative">
            <Button variant="outline" onClick={() => handleExport('json')}>
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
          </div>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
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
          title="Total Users"
          value={keyMetrics?.totalUsers || 0}
          change={{
            value: overview?.users.growthRate || 0,
            type: (overview?.users.growthRate || 0) >= 0 ? 'increase' : 'decrease',
            period: 'vs last period'
          }}
          icon="users"
          description="Active and registered users"
          loading={keyMetricsLoading || overviewLoading}
        />

        <StatsCard
          title="Total Products"
          value={keyMetrics?.totalProducts || 0}
          change={{
            value: 5.2,
            type: 'increase',
            period: 'vs last month'
          }}
          icon="package"
          description="Products in database"
          loading={keyMetricsLoading}
        />

        <StatsCard
          title="Total Searches"
          value={keyMetrics?.totalSearches || 0}
          change={{
            value: 12.4,
            type: 'increase',
            period: 'vs last week'
          }}
          icon="activity"
          description="Search queries performed"
          loading={keyMetricsLoading}
        />

        <StatsCard
          title="System Uptime"
          value={`${((keyMetrics?.systemUptime || 0) * 100).toFixed(1)}%`}
          change={{
            value: 0.1,
            type: 'increase',
            period: 'vs last month'
          }}
          icon="server"
          description="Service availability"
          loading={keyMetricsLoading}
        />
      </div>

      {/* Charts Row 1 - Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GrowthChart
          title="User Growth"
          data={userGrowth[userGrowthPeriod] || null}
          loading={isLoadingUserStats}
          onPeriodChange={handleUserGrowthPeriodChange}
          onRefresh={() => fetchUserGrowth(userGrowthPeriod)}
          showCumulative={true}
        />

        <GrowthChart
          title="Product Growth"
          data={productGrowth[productGrowthPeriod] || null}
          loading={isLoadingProductStats}
          onPeriodChange={handleProductGrowthPeriodChange}
          onRefresh={() => fetchProductGrowth(productGrowthPeriod)}
          showCumulative={true}
        />
      </div>

      {/* Charts Row 2 - Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DistributionChart
          title="User Distribution by Role"
          data={userDemographicsData}
          loading={isLoadingUserStats}
          onRefresh={fetchUserStatistics}
          centerText={userStatistics ? {
            primary: userStatistics.overview.totalUsers.toLocaleString(),
            secondary: 'Total Users'
          } : undefined}
        />

        <DistributionChart
          title="Product Categories"
          data={productCategoriesData}
          loading={isLoadingProductStats}
          onRefresh={fetchProductStatistics}
          centerText={productStatistics ? {
            primary: productStatistics.overview.categoriesCount.toString(),
            secondary: 'Categories'
          } : undefined}
        />

        <DistributionChart
          title="Product Data Sources"
          data={productDataSourcesData}
          loading={isLoadingProductStats}
          onRefresh={fetchProductStatistics}
          centerText={productStatistics ? {
            primary: (productStatistics.overview.avgConfidenceScore * 100).toFixed(0) + '%',
            secondary: 'Avg Quality'
          } : undefined}
        />
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SystemHealth />
        </div>

        {/* Activity Overview */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard
              title="Searches Today"
              value={activityStatistics?.overview.searchesToday || 0}
              icon="activity"
              description="Today's search activity"
              loading={isLoadingActivityStats}
            />

            <StatsCard
              title="Avg Search Time"
              value={`${activityStatistics?.overview.avgSearchTime || 0}ms`}
              icon="activity"
              description="Response performance"
              loading={isLoadingActivityStats}
            />

            <StatsCard
              title="Contributions"
              value={activityStatistics?.overview.contributionsToday || 0}
              icon="users"
              description="User contributions today"
              loading={isLoadingActivityStats}
            />

            <StatsCard
              title="Verified Products"
              value={`${((productStatistics?.quality.verificationRate || 0) * 100).toFixed(0)}%`}
              icon="package"
              description="Product verification rate"
              loading={isLoadingProductStats}
            />
          </div>
        </div>
      </div>
    </div>
  )
}