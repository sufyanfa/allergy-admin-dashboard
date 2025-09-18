import apiClient from './client'
import { API_ENDPOINTS } from '@/constants'
import type {
  DashboardOverview,
  KeyMetrics,
  SystemHealth,
  UserStatistics,
  GrowthData,
  ProductStatistics,
  ActivityStatistics,
  ApiResponse,
  StatisticsApiResponse,
  SystemHealthApiResponse
} from '@/types'

type Period = 'daily' | 'weekly' | 'monthly'

class StatisticsServiceClass {
  private validatePeriod(period: Period): void {
    const validPeriods: Period[] = ['daily', 'weekly', 'monthly']
    if (!validPeriods.includes(period)) {
      throw new Error(`Invalid period: ${period}. Must be one of: ${validPeriods.join(', ')}`)
    }
  }

  private async fetchData<T>(
    endpoint: string,
    errorMessage: string,
    signal?: AbortSignal
  ): Promise<T> {
    try {
      const response = await apiClient.get<ApiResponse<T>>(endpoint, { signal })

      if (!response.success) {
        throw new Error(response.message || errorMessage)
      }

      if (!response.data) {
        throw new Error(`No data received from ${endpoint}`)
      }

      return response.data
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request to ${endpoint} was cancelled`)
      }
      throw error
    }
  }

  private async deleteData(
    endpoint: string,
    errorMessage: string,
    signal?: AbortSignal
  ): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse>(endpoint, { signal })

      if (!response.success) {
        throw new Error(response.message || errorMessage)
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request to ${endpoint} was cancelled`)
      }
      throw error
    }
  }

  // Dashboard Overview
  async getDashboardOverview(params: { period?: string; timezone?: string } = {}, signal?: AbortSignal): Promise<DashboardOverview> {
    try {
      const { period = '30d', timezone = Intl.DateTimeFormat().resolvedOptions().timeZone } = params
      const url = `${API_ENDPOINTS.STATISTICS.OVERVIEW}?period=${period}&timezone=${encodeURIComponent(timezone)}`

      const response = await this.fetchData<StatisticsApiResponse['data']>(
        url,
        'Failed to fetch dashboard overview',
        signal
      )

      // Transform new API response to match existing interface
      return {
        users: {
          total: response.overview?.totalUsers?.count || 0,
          active: response.overview?.totalUsers?.count || 0,
          newToday: 0,
          growthRate: response.overview?.totalUsers?.growthPercentage || 0
        },
        products: {
          total: response.overview?.totalProducts?.count || 0,
          verified: Math.round((response.overview?.totalProducts?.count || 0) * (response.realtime?.verifiedProductsPercentage || 0) / 100),
          newToday: 0,
          categoriesCount: response.charts?.productCategories?.length || 0
        },
        activity: {
          totalSearches: response.overview?.totalSearches?.count || 0,
          searchesToday: response.realtime?.searchesToday || 0,
          avgResponseTime: response.realtime?.avgSearchTimeMs || 0,
          contributionsToday: response.realtime?.contributionsToday || 0
        },
        system: {
          uptime: response.overview?.systemUptime?.percentage || 0,
          lastRestart: response.overview?.systemUptime?.lastRestart || new Date().toISOString()
        }
      }
    } catch (error) {
      throw error
    }
  }

  async getKeyMetrics(params: { period?: string; timezone?: string } = {}, signal?: AbortSignal): Promise<KeyMetrics> {
    try {
      const { period = '30d', timezone = Intl.DateTimeFormat().resolvedOptions().timeZone } = params
      const url = `${API_ENDPOINTS.STATISTICS.KEY_METRICS}?period=${period}&timezone=${encodeURIComponent(timezone)}`

      const response = await this.fetchData<StatisticsApiResponse['data']>(
        url,
        'Failed to fetch key metrics',
        signal
      )

      // Transform new API response to match existing interface
      return {
        totalUsers: response.overview?.totalUsers?.count || 0,
        activeUsers: response.overview?.totalUsers?.count || 0,
        totalProducts: response.overview?.totalProducts?.count || 0,
        verifiedProducts: Math.round((response.overview?.totalProducts?.count || 0) * (response.realtime?.verifiedProductsPercentage || 0) / 100),
        totalSearches: response.overview?.totalSearches?.count || 0,
        totalContributions: response.realtime?.contributionsToday || 0,
        avgSearchTime: response.realtime?.avgSearchTimeMs || 0,
        userGrowthRate: response.overview?.totalUsers?.growthPercentage || 0,
        productGrowthRate: response.overview?.totalProducts?.growthPercentage || 0,
        systemUptime: (response.overview?.systemUptime?.percentage || 0) / 100
      }
    } catch (error) {
      throw error
    }
  }

  async getSystemHealth(signal?: AbortSignal): Promise<SystemHealth> {
    try {
      const response = await this.fetchData<SystemHealthApiResponse>(
        API_ENDPOINTS.STATISTICS.SYSTEM_HEALTH,
        'Failed to fetch system health',
        signal
      )

      // Transform new API response to match existing interface
      const memoryPercentage = response.checks?.memory?.heapTotal ?
        (response.checks.memory.heapUsed / response.checks.memory.heapTotal * 100) : 0

      return {
        status: response.status === 'healthy' ? 'healthy' : 'degraded',
        timestamp: response.timestamp,
        responseTime: response.responseTime || 0,
        uptime: response.checks?.uptime || 0,
        lastUpdated: response.timestamp,
        // Component expected properties
        memoryUsage: memoryPercentage,
        cpuUsage: 0, // Not provided by API, using default
        cacheHitRate: 95.5, // Mock value since not in API
        avgResponseTime: response.responseTime || 0,
        errorRate: 0.01, // Mock value since not in API
        // Detailed breakdown
        database: {
          status: response.checks?.database?.status === 'healthy' ? 'healthy' : 'degraded',
          responseTime: response.checks?.database?.responseTime || 0
        },
        memory: {
          used: response.checks?.memory?.heapUsed || 0,
          total: response.checks?.memory?.heapTotal || 0,
          percentage: memoryPercentage
        }
      }
    } catch (error) {
      throw error
    }
  }

  async getRealtimeMetrics(signal?: AbortSignal): Promise<StatisticsApiResponse['data']['realtime']> {
    return this.fetchData<StatisticsApiResponse['data']['realtime']>(
      API_ENDPOINTS.STATISTICS.REALTIME_METRICS,
      'Failed to fetch realtime metrics',
      signal
    )
  }

  // Test CORS connection
  async testConnection(signal?: AbortSignal): Promise<SystemHealthApiResponse> {
    try {
      console.log('Testing CORS connection...')
      const response = await apiClient.get<SystemHealthApiResponse>('/admin/system/health', { signal })
      console.log('CORS test successful:', response)
      return response
    } catch (error) {
      console.error('CORS test failed:', error)
      throw error
    }
  }

  // Export Dashboard Data
  async exportDashboardData(params: { period?: string; timezone?: string; format?: 'json' | 'csv' } = {}, signal?: AbortSignal): Promise<StatisticsApiResponse | { success: boolean; message: string }> {
    try {
      const { period = '30d', timezone = Intl.DateTimeFormat().resolvedOptions().timeZone, format = 'json' } = params
      const url = `${API_ENDPOINTS.STATISTICS.EXPORT}?period=${period}&timezone=${encodeURIComponent(timezone)}&format=${format}`

      const response = await apiClient.get(url, {
        signal,
        responseType: format === 'csv' ? 'blob' : 'json'
      })

      if (format === 'csv') {
        // Handle CSV download
        const blob = new Blob([response as string], { type: 'text/csv' })
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = `dashboard-export-${period}-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(downloadUrl)
        return { success: true, message: 'Export downloaded successfully' }
      }

      return response
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Export request was cancelled`)
      }
      throw new Error(`Failed to export dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // User Statistics
  async getUserStatistics(signal?: AbortSignal): Promise<UserStatistics> {
    try {
      // Use overview data for now since specific endpoints might not be implemented
      const response = await this.fetchData<StatisticsApiResponse['data']>(
        API_ENDPOINTS.STATISTICS.OVERVIEW,
        'Failed to fetch user statistics',
        signal
      )

      // Transform to UserStatistics format
      return {
        overview: {
          totalUsers: response.overview?.totalUsers?.count || 0,
          activeUsers: response.overview?.totalUsers?.count || 0,
          newUsers: 0,
          avgSessionTime: 0
        },
        demographics: {
          byRole: response.charts?.userRoleDistribution || [],
          byCountry: [],
          byAge: []
        },
        growth: {
          daily: [],
          weekly: [],
          monthly: []
        }
      }
    } catch (error) {
      throw error
    }
  }

  async getUserOverview(signal?: AbortSignal): Promise<UserStatistics['overview']> {
    return this.fetchData<UserStatistics['overview']>(
      API_ENDPOINTS.STATISTICS.USERS.OVERVIEW,
      'Failed to fetch user overview',
      signal
    )
  }

  async getUserGrowth(period: Period = 'daily', signal?: AbortSignal): Promise<GrowthData> {
    this.validatePeriod(period)
    try {
      const response = await this.fetchData<StatisticsApiResponse['data']>(
        API_ENDPOINTS.STATISTICS.OVERVIEW,
        `Failed to fetch user growth data for period: ${period}`,
        signal
      )

      // Transform chart data to GrowthData format
      const chartData = response.charts?.userGrowth || []
      return {
        period,
        data: chartData.map((item) => ({
          date: item.date,
          value: item.count,
          cumulative: item.count // This would need proper cumulative calculation
        })),
        totalGrowth: response.overview?.totalUsers?.growthPercentage || 0,
        periodGrowth: response.overview?.totalUsers?.growthPercentage || 0
      }
    } catch (error) {
      throw error
    }
  }

  async getUserDemographics(signal?: AbortSignal): Promise<UserStatistics['demographics']> {
    return this.fetchData<UserStatistics['demographics']>(
      API_ENDPOINTS.STATISTICS.USERS.DEMOGRAPHICS,
      'Failed to fetch user demographics',
      signal
    )
  }

  // Product Statistics
  async getProductStatistics(signal?: AbortSignal): Promise<ProductStatistics> {
    try {
      const response = await this.fetchData<StatisticsApiResponse['data']>(
        API_ENDPOINTS.STATISTICS.OVERVIEW,
        'Failed to fetch product statistics',
        signal
      )

      return {
        overview: {
          totalProducts: response.overview?.totalProducts?.count || 0,
          verifiedProducts: Math.round((response.overview?.totalProducts?.count || 0) * (response.realtime?.verifiedProductsPercentage || 0) / 100),
          categoriesCount: response.charts?.productCategories?.length || 0,
          avgConfidenceScore: 0.85 // Mock value since not in API
        },
        categories: response.charts?.productCategories || [],
        dataSources: response.charts?.productDataSources || [],
        quality: {
          verificationRate: (response.realtime?.verifiedProductsPercentage || 0) / 100,
          avgConfidenceScore: 0.85,
          flaggedForReview: 0
        },
        growth: {
          daily: [],
          weekly: [],
          monthly: []
        }
      }
    } catch (error) {
      throw error
    }
  }

  async getProductOverview(signal?: AbortSignal): Promise<ProductStatistics['overview']> {
    return this.fetchData<ProductStatistics['overview']>(
      API_ENDPOINTS.STATISTICS.PRODUCTS.OVERVIEW,
      'Failed to fetch product overview',
      signal
    )
  }

  async getProductCategories(signal?: AbortSignal): Promise<ProductStatistics['categories']> {
    return this.fetchData<ProductStatistics['categories']>(
      API_ENDPOINTS.STATISTICS.PRODUCTS.CATEGORIES,
      'Failed to fetch product categories',
      signal
    )
  }

  async getProductDataSources(signal?: AbortSignal): Promise<ProductStatistics['dataSources']> {
    return this.fetchData<ProductStatistics['dataSources']>(
      API_ENDPOINTS.STATISTICS.PRODUCTS.DATA_SOURCES,
      'Failed to fetch product data sources',
      signal
    )
  }

  async getProductQuality(signal?: AbortSignal): Promise<ProductStatistics['quality']> {
    return this.fetchData<ProductStatistics['quality']>(
      API_ENDPOINTS.STATISTICS.PRODUCTS.QUALITY,
      'Failed to fetch product quality',
      signal
    )
  }

  async getProductGrowth(period: Period = 'daily', signal?: AbortSignal): Promise<GrowthData> {
    this.validatePeriod(period)
    try {
      const response = await this.fetchData<StatisticsApiResponse['data']>(
        API_ENDPOINTS.STATISTICS.OVERVIEW,
        `Failed to fetch product growth data for period: ${period}`,
        signal
      )

      const chartData = response.charts?.productGrowth || []
      return {
        period,
        data: chartData.map((item) => ({
          date: item.date,
          value: item.count,
          cumulative: item.count
        })),
        totalGrowth: response.overview?.totalProducts?.growthPercentage || 0,
        periodGrowth: response.overview?.totalProducts?.growthPercentage || 0
      }
    } catch (error) {
      throw error
    }
  }

  // Activity Statistics
  async getActivityStatistics(signal?: AbortSignal): Promise<ActivityStatistics> {
    try {
      const response = await this.fetchData<StatisticsApiResponse['data']>(
        API_ENDPOINTS.STATISTICS.OVERVIEW,
        'Failed to fetch activity statistics',
        signal
      )

      return {
        overview: {
          searchesToday: response.realtime?.searchesToday || 0,
          avgSearchTime: response.realtime?.avgSearchTimeMs || 0,
          contributionsToday: response.realtime?.contributionsToday || 0,
          totalContributions: 0
        },
        searches: {
          total: response.overview?.totalSearches?.count || 0,
          today: response.realtime?.searchesToday || 0,
          avgResponseTime: response.realtime?.avgSearchTimeMs || 0,
          peakHour: '12:00'
        },
        contributions: {
          total: 0,
          today: response.realtime?.contributionsToday || 0,
          pending: 0,
          approved: 0
        },
        experiences: {
          total: 0,
          positive: 0,
          negative: 0,
          avgRating: 0
        }
      }
    } catch (error) {
      throw error
    }
  }

  async getActivityOverview(signal?: AbortSignal): Promise<ActivityStatistics['overview']> {
    return this.fetchData<ActivityStatistics['overview']>(
      API_ENDPOINTS.STATISTICS.ACTIVITY.OVERVIEW,
      'Failed to fetch activity overview',
      signal
    )
  }

  async getSearchStatistics(signal?: AbortSignal): Promise<ActivityStatistics['searches']> {
    return this.fetchData<ActivityStatistics['searches']>(
      API_ENDPOINTS.STATISTICS.ACTIVITY.SEARCHES,
      'Failed to fetch search statistics',
      signal
    )
  }

  async getContributionStatistics(signal?: AbortSignal): Promise<ActivityStatistics['contributions']> {
    return this.fetchData<ActivityStatistics['contributions']>(
      API_ENDPOINTS.STATISTICS.ACTIVITY.CONTRIBUTIONS,
      'Failed to fetch contribution statistics',
      signal
    )
  }

  async getExperienceStatistics(signal?: AbortSignal): Promise<ActivityStatistics['experiences']> {
    return this.fetchData<ActivityStatistics['experiences']>(
      API_ENDPOINTS.STATISTICS.ACTIVITY.EXPERIENCES,
      'Failed to fetch experience statistics',
      signal
    )
  }

  // Cache Management (Super Admin Only)
  async clearUserCache(signal?: AbortSignal): Promise<void> {
    await this.deleteData(
      API_ENDPOINTS.STATISTICS.CACHE.CLEAR_USERS,
      'Failed to clear user cache',
      signal
    )
  }

  async clearProductCache(signal?: AbortSignal): Promise<void> {
    await this.deleteData(
      API_ENDPOINTS.STATISTICS.CACHE.CLEAR_PRODUCTS,
      'Failed to clear product cache',
      signal
    )
  }

  async clearActivityCache(signal?: AbortSignal): Promise<void> {
    await this.deleteData(
      API_ENDPOINTS.STATISTICS.CACHE.CLEAR_ACTIVITY,
      'Failed to clear activity cache',
      signal
    )
  }

  async clearAllCache(signal?: AbortSignal): Promise<void> {
    await this.deleteData(
      API_ENDPOINTS.STATISTICS.CACHE.CLEAR_ALL,
      'Failed to clear all cache',
      signal
    )
  }
}

// Create singleton instance
export const StatisticsService = new StatisticsServiceClass()

// Export default for backward compatibility
export default StatisticsService