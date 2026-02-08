import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import StatisticsService from '@/lib/api/statistics'
import type {
  DashboardOverview,
  KeyMetrics,
  SystemHealth,
  UserStatistics,
  GrowthData,
  ProductStatistics,
  ActivityStatistics,
  StatisticsApiResponse
} from '@/types'

// Helper: transform raw API response into all derived state slices
function transformOverviewResponse(response: StatisticsApiResponse['data']) {
  const dashboardOverview: DashboardOverview = {
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

  const keyMetrics: KeyMetrics = {
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

  const userStatistics: UserStatistics = {
    overview: {
      totalUsers: response.overview?.totalUsers?.count || 0,
      activeUsers: response.overview?.totalUsers?.count || 0,
      inactiveUsers: 0,
      suspendedUsers: 0,
      newUsersToday: 0,
      newUsersThisWeek: 0,
      newUsersThisMonth: 0,
      growthRate: response.overview?.totalUsers?.growthPercentage || 0
    },
    demographics: {
      byLanguage: [],
      byRole: response.charts?.userRoleDistribution || [],
      byStatus: [],
      byLocation: []
    }
  }

  const productStatistics: ProductStatistics = {
    overview: {
      totalProducts: response.overview?.totalProducts?.count || 0,
      verifiedProducts: Math.round((response.overview?.totalProducts?.count || 0) * (response.realtime?.verifiedProductsPercentage || 0) / 100),
      unverifiedProducts: 0,
      newProductsToday: 0,
      newProductsThisWeek: 0,
      newProductsThisMonth: 0,
      avgConfidenceScore: 0.85,
      categoriesCount: response.charts?.productCategories?.length || 0
    },
    categories: (response.charts?.productCategories || []).map(cat => ({
      ...cat,
      verified: 0,
      avgConfidence: 0.85
    })),
    dataSources: (response.charts?.productDataSources || []).map(source => ({
      ...source,
      source: source.source as "api" | "manual" | "community",
      avgConfidence: 0.85
    })),
    quality: {
      highConfidence: 0,
      mediumConfidence: 0,
      lowConfidence: 0,
      avgConfidenceScore: 0.85,
      verificationRate: (response.realtime?.verifiedProductsPercentage || 0) / 100
    }
  }

  const activityStatistics: ActivityStatistics = {
    overview: {
      totalSearches: response.overview?.totalSearches?.count || 0,
      searchesToday: response.realtime?.searchesToday || 0,
      searchesThisWeek: 0,
      searchesThisMonth: 0,
      avgSearchTime: response.realtime?.avgSearchTimeMs || 0,
      totalContributions: 0,
      contributionsToday: response.realtime?.contributionsToday || 0,
      contributionsThisWeek: 0,
      contributionsThisMonth: 0,
      avgContributionsPerUser: 0
    },
    searches: {
      byType: [],
      byResult: [],
      avgResponseTime: response.realtime?.avgSearchTimeMs || 0,
      popularQueries: []
    },
    contributions: {
      byType: [],
      byStatus: [],
      topContributors: []
    },
    experiences: {
      totalReports: 0,
      byReaction: [],
      bySeverity: [],
      avgRating: 0
    }
  }

  const userGrowthData: GrowthData = {
    period: 'daily',
    data: (response.charts?.userGrowth || []).map((item) => ({
      date: item.date,
      value: item.count,
      cumulative: item.count
    })),
    totalGrowth: response.overview?.totalUsers?.growthPercentage || 0,
    periodGrowth: response.overview?.totalUsers?.growthPercentage || 0
  }

  const productGrowthData: GrowthData = {
    period: 'daily',
    data: (response.charts?.productGrowth || []).map((item) => ({
      date: item.date,
      value: item.count,
      cumulative: item.count
    })),
    totalGrowth: response.overview?.totalProducts?.growthPercentage || 0,
    periodGrowth: response.overview?.totalProducts?.growthPercentage || 0
  }

  return { dashboardOverview, keyMetrics, userStatistics, productStatistics, activityStatistics, userGrowthData, productGrowthData }
}

interface StatisticsState {
  // Data
  dashboardOverview: DashboardOverview | null
  keyMetrics: KeyMetrics | null
  systemHealth: SystemHealth | null
  userStatistics: UserStatistics | null
  productStatistics: ProductStatistics | null
  activityStatistics: ActivityStatistics | null
  userGrowth: Record<string, GrowthData>
  productGrowth: Record<string, GrowthData>

  // Loading states
  isLoadingOverview: boolean
  isLoadingKeyMetrics: boolean
  isLoadingSystemHealth: boolean
  isLoadingUserStats: boolean
  isLoadingProductStats: boolean
  isLoadingActivityStats: boolean
  isLoadingUserGrowth: boolean
  isLoadingProductGrowth: boolean

  // Error states
  error: string | null
  errors: Record<string, string>

  // Request cancellation
  abortControllers: Record<string, AbortController>

  // Last updated timestamps
  lastUpdated: {
    overview?: number
    keyMetrics?: number
    systemHealth?: number
    userStats?: number
    productStats?: number
    activityStats?: number
    userGrowth?: Record<string, number>
    productGrowth?: Record<string, number>
  }
}

interface StatisticsActions {
  // Single-fetch that populates all overview-derived slices at once
  fetchAllOverviewData: (params?: { period?: string; timezone?: string }) => Promise<void>

  // Individual fetchers (kept for targeted refresh)
  fetchDashboardOverview: () => Promise<void>
  fetchKeyMetrics: () => Promise<void>
  fetchSystemHealth: () => Promise<void>

  // User Statistics
  fetchUserStatistics: () => Promise<void>
  fetchUserGrowth: (period: 'daily' | 'weekly' | 'monthly') => Promise<void>

  // Product Statistics
  fetchProductStatistics: () => Promise<void>
  fetchProductGrowth: (period: 'daily' | 'weekly' | 'monthly') => Promise<void>

  // Activity Statistics
  fetchActivityStatistics: () => Promise<void>

  // Cache Management
  clearUserCache: () => Promise<void>
  clearProductCache: () => Promise<void>
  clearActivityCache: () => Promise<void>
  clearAllCache: () => Promise<void>

  // Request Management
  cancelRequest: (key: string) => void
  cancelAllRequests: () => void

  // Error Management
  setError: (error: string | null) => void
  setErrorForKey: (key: string, error: string) => void
  clearError: () => void
  clearErrorForKey: (key: string) => void
  clearAllErrors: () => void

  // Utility
  refreshAll: () => Promise<void>
  isDataStale: (key: keyof StatisticsState['lastUpdated'], maxAge?: number) => boolean
}

type StatisticsStore = StatisticsState & StatisticsActions

const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes in milliseconds

export const useStatisticsStore = create<StatisticsStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      dashboardOverview: null,
      keyMetrics: null,
      systemHealth: null,
      userStatistics: null,
      productStatistics: null,
      activityStatistics: null,
      userGrowth: {},
      productGrowth: {},

      isLoadingOverview: false,
      isLoadingKeyMetrics: false,
      isLoadingSystemHealth: false,
      isLoadingUserStats: false,
      isLoadingProductStats: false,
      isLoadingActivityStats: false,
      isLoadingUserGrowth: false,
      isLoadingProductGrowth: false,

      error: null,
      errors: {},
      abortControllers: {},
      lastUpdated: {},


      // Actions

      // Single-fetch: call /admin/dashboard/overview ONCE and populate all slices
      fetchAllOverviewData: async (params?: { period?: string; timezone?: string }) => {
        const state = get()
        if (state.isLoadingOverview || state.isLoadingKeyMetrics) return

        set({
          isLoadingOverview: true,
          isLoadingKeyMetrics: true,
          isLoadingUserStats: true,
          isLoadingProductStats: true,
          isLoadingActivityStats: true,
          isLoadingUserGrowth: true,
          isLoadingProductGrowth: true,
          error: null
        })

        try {
          const rawResponse = await StatisticsService.getRawOverview(params)
          const {
            dashboardOverview,
            keyMetrics,
            userStatistics,
            productStatistics,
            activityStatistics,
            userGrowthData,
            productGrowthData
          } = transformOverviewResponse(rawResponse)

          const now = Date.now()
          set({
            dashboardOverview,
            keyMetrics,
            userStatistics,
            productStatistics,
            activityStatistics,
            userGrowth: { ...get().userGrowth, daily: userGrowthData },
            productGrowth: { ...get().productGrowth, daily: productGrowthData },
            lastUpdated: {
              overview: now,
              keyMetrics: now,
              userStats: now,
              productStats: now,
              activityStats: now,
              userGrowth: { ...get().lastUpdated.userGrowth, daily: now },
              productGrowth: { ...get().lastUpdated.productGrowth, daily: now },
            }
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch dashboard data'
          set({ error: message })
          console.error('Failed to fetch dashboard data:', error)
        } finally {
          set({
            isLoadingOverview: false,
            isLoadingKeyMetrics: false,
            isLoadingUserStats: false,
            isLoadingProductStats: false,
            isLoadingActivityStats: false,
            isLoadingUserGrowth: false,
            isLoadingProductGrowth: false,
          })
        }
      },

      fetchDashboardOverview: async () => {
        if (get().isLoadingOverview) return

        set({ isLoadingOverview: true, error: null })
        try {
          const data = await StatisticsService.getDashboardOverview()
          set({
            dashboardOverview: data,
            lastUpdated: { ...get().lastUpdated, overview: Date.now() }
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch dashboard overview'
          set({ error: message })
          console.error('Failed to fetch dashboard overview:', error)
        } finally {
          set({ isLoadingOverview: false })
        }
      },

      fetchKeyMetrics: async () => {
        if (get().isLoadingKeyMetrics) return

        set({ isLoadingKeyMetrics: true, error: null })
        try {
          const data = await StatisticsService.getKeyMetrics()
          set({
            keyMetrics: data,
            lastUpdated: { ...get().lastUpdated, keyMetrics: Date.now() }
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch key metrics'
          set({ error: message })
          console.error('Failed to fetch key metrics:', error)
        } finally {
          set({ isLoadingKeyMetrics: false })
        }
      },

      fetchSystemHealth: async () => {
        if (get().isLoadingSystemHealth) return

        set({ isLoadingSystemHealth: true, error: null })
        try {
          const data = await StatisticsService.getSystemHealth()
          set({
            systemHealth: data,
            lastUpdated: { ...get().lastUpdated, systemHealth: Date.now() }
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch system health'
          set({ error: message })
          console.error('Failed to fetch system health:', error)
        } finally {
          set({ isLoadingSystemHealth: false })
        }
      },

      fetchUserStatistics: async () => {
        if (get().isLoadingUserStats) return

        set({ isLoadingUserStats: true, error: null })
        try {
          const data = await StatisticsService.getUserStatistics()
          set({
            userStatistics: data,
            lastUpdated: { ...get().lastUpdated, userStats: Date.now() }
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch user statistics'
          set({ error: message })
          console.error('Failed to fetch user statistics:', error)
        } finally {
          set({ isLoadingUserStats: false })
        }
      },

      fetchUserGrowth: async (period: 'daily' | 'weekly' | 'monthly') => {
        if (get().isLoadingUserGrowth) return

        set({ isLoadingUserGrowth: true, error: null })
        try {
          const data = await StatisticsService.getUserGrowth(period)
          const currentGrowth = get().userGrowth
          const currentUpdated = get().lastUpdated.userGrowth || {}

          set({
            userGrowth: { ...currentGrowth, [period]: data },
            lastUpdated: {
              ...get().lastUpdated,
              userGrowth: { ...currentUpdated, [period]: Date.now() }
            }
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch user growth data'
          set({ error: message })
          console.error('Failed to fetch user growth data:', error)
        } finally {
          set({ isLoadingUserGrowth: false })
        }
      },

      fetchProductStatistics: async () => {
        if (get().isLoadingProductStats) return

        set({ isLoadingProductStats: true, error: null })
        try {
          const data = await StatisticsService.getProductStatistics()
          set({
            productStatistics: data,
            lastUpdated: { ...get().lastUpdated, productStats: Date.now() }
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch product statistics'
          set({ error: message })
          console.error('Failed to fetch product statistics:', error)
        } finally {
          set({ isLoadingProductStats: false })
        }
      },

      fetchProductGrowth: async (period: 'daily' | 'weekly' | 'monthly') => {
        if (get().isLoadingProductGrowth) return

        set({ isLoadingProductGrowth: true, error: null })
        try {
          const data = await StatisticsService.getProductGrowth(period)
          const currentGrowth = get().productGrowth
          const currentUpdated = get().lastUpdated.productGrowth || {}

          set({
            productGrowth: { ...currentGrowth, [period]: data },
            lastUpdated: {
              ...get().lastUpdated,
              productGrowth: { ...currentUpdated, [period]: Date.now() }
            }
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch product growth data'
          set({ error: message })
          console.error('Failed to fetch product growth data:', error)
        } finally {
          set({ isLoadingProductGrowth: false })
        }
      },

      fetchActivityStatistics: async () => {
        if (get().isLoadingActivityStats) return

        set({ isLoadingActivityStats: true, error: null })
        try {
          const data = await StatisticsService.getActivityStatistics()
          set({
            activityStatistics: data,
            lastUpdated: { ...get().lastUpdated, activityStats: Date.now() }
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch activity statistics'
          set({ error: message })
          console.error('Failed to fetch activity statistics:', error)
        } finally {
          set({ isLoadingActivityStats: false })
        }
      },

      clearUserCache: async () => {
        try {
          await StatisticsService.clearUserCache()
          set({
            userStatistics: null,
            userGrowth: {},
            lastUpdated: {
              ...get().lastUpdated,
              userStats: undefined,
              userGrowth: undefined
            }
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to clear user cache'
          set({ error: message })
          console.error('Failed to clear user cache:', error)
          throw error
        }
      },

      clearProductCache: async () => {
        try {
          await StatisticsService.clearProductCache()
          set({
            productStatistics: null,
            productGrowth: {},
            lastUpdated: {
              ...get().lastUpdated,
              productStats: undefined,
              productGrowth: undefined
            }
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to clear product cache'
          set({ error: message })
          console.error('Failed to clear product cache:', error)
          throw error
        }
      },

      clearActivityCache: async () => {
        try {
          await StatisticsService.clearActivityCache()
          set({
            activityStatistics: null,
            lastUpdated: { ...get().lastUpdated, activityStats: undefined }
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to clear activity cache'
          set({ error: message })
          console.error('Failed to clear activity cache:', error)
          throw error
        }
      },

      clearAllCache: async () => {
        try {
          await StatisticsService.clearAllCache()
          set({
            dashboardOverview: null,
            keyMetrics: null,
            systemHealth: null,
            userStatistics: null,
            productStatistics: null,
            activityStatistics: null,
            userGrowth: {},
            productGrowth: {},
            lastUpdated: {}
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to clear all cache'
          set({ error: message })
          console.error('Failed to clear all cache:', error)
          throw error
        }
      },

      // Request Management
      cancelRequest: (key: string) => {
        const state = get()
        if (state.abortControllers[key]) {
          state.abortControllers[key].abort()
          set({
            abortControllers: Object.fromEntries(
              Object.entries(state.abortControllers).filter(([k]) => k !== key)
            )
          })
        }
      },

      cancelAllRequests: () => {
        const state = get()
        Object.values(state.abortControllers).forEach(controller => {
          controller.abort()
        })
        set({ abortControllers: {} })
      },

      // Error Management
      setError: (error: string | null) => {
        set({ error })
      },

      setErrorForKey: (key: string, error: string) => {
        const state = get()
        set({
          errors: { ...state.errors, [key]: error },
          error: error // Also set global error
        })
      },

      clearError: () => {
        set({ error: null })
      },

      clearErrorForKey: (key: string) => {
        const state = get()
        const { [key]: _, ...restErrors } = state.errors
        // Explicitly mark as used for linting
        void _
        set({ errors: restErrors })
      },

      clearAllErrors: () => {
        set({ error: null, errors: {} })
      },

      refreshAll: async () => {
        const state = get()
        await Promise.allSettled([
          state.fetchAllOverviewData(),
          state.fetchSystemHealth(),
        ])
      },

      isDataStale: (key: keyof StatisticsState['lastUpdated'], maxAge: number = CACHE_DURATION) => {
        const lastUpdated = get().lastUpdated[key]
        if (!lastUpdated) return true

        // Handle both number and Record<string, number> types
        if (typeof lastUpdated === 'number') {
          return Date.now() - lastUpdated > maxAge
        }

        // For Record types, check if any value is stale
        if (typeof lastUpdated === 'object') {
          const values = Object.values(lastUpdated)
          if (values.length === 0) return true
          return values.some(timestamp => Date.now() - timestamp > maxAge)
        }

        return true
      },
    }),
    {
      name: 'statistics-store'
    }
  )
)

// Convenience hooks using useShallow to prevent unnecessary re-renders
import { useShallow } from 'zustand/react/shallow'

export const useStatisticsOverview = () => {
  return useStatisticsStore(
    useShallow((s) => ({ data: s.dashboardOverview, loading: s.isLoadingOverview, fetch: s.fetchDashboardOverview }))
  )
}

export const useKeyMetrics = () => {
  return useStatisticsStore(
    useShallow((s) => ({ data: s.keyMetrics, loading: s.isLoadingKeyMetrics, fetch: s.fetchKeyMetrics }))
  )
}

export const useSystemHealth = () => {
  return useStatisticsStore(
    useShallow((s) => ({ data: s.systemHealth, loading: s.isLoadingSystemHealth, fetch: s.fetchSystemHealth }))
  )
}

export const useUserStatistics = () => {
  return useStatisticsStore(
    useShallow((s) => ({ data: s.userStatistics, loading: s.isLoadingUserStats, fetch: s.fetchUserStatistics }))
  )
}

export const useProductStatistics = () => {
  return useStatisticsStore(
    useShallow((s) => ({ data: s.productStatistics, loading: s.isLoadingProductStats, fetch: s.fetchProductStatistics }))
  )
}

export const useActivityStatistics = () => {
  return useStatisticsStore(
    useShallow((s) => ({ data: s.activityStatistics, loading: s.isLoadingActivityStats, fetch: s.fetchActivityStatistics }))
  )
}