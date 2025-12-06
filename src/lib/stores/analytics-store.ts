import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import analyticsService from '@/lib/api/analytics'
import type {
  AnalyticsDashboardData,
  SearchedProduct,
  TopSearchQuery,
  AnalyticsPeriod,
  AnalyticsSummary,
  ProductAnalyticsData,
} from '@/types'

interface AnalyticsState {
  // Dashboard data
  dashboardData: AnalyticsDashboardData | null
  summary: AnalyticsSummary | null
  mostSearchedProducts: SearchedProduct[]
  mostPopularProducts: SearchedProduct[]
  topQueries: TopSearchQuery[]
  productAnalytics: Record<string, ProductAnalyticsData>

  // Current period filter
  currentPeriod: AnalyticsPeriod

  // Pagination
  searchedProductsPagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
  popularProductsPagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
  queriesPagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }

  // Loading states
  isLoadingDashboard: boolean
  isLoadingMostSearched: boolean
  isLoadingMostPopular: boolean
  isLoadingTopQueries: boolean
  isLoadingSummary: boolean
  isLoadingProductAnalytics: Record<string, boolean>

  // Error states
  error: string | null
  errors: Record<string, string>
}

interface AnalyticsActions {
  // Fetch actions
  fetchDashboard: (period?: AnalyticsPeriod) => Promise<void>
  fetchMostSearched: (limit?: number, offset?: number, period?: AnalyticsPeriod) => Promise<void>
  fetchMostPopular: (limit?: number, offset?: number, period?: AnalyticsPeriod) => Promise<void>
  fetchTopQueries: (limit?: number, offset?: number, period?: AnalyticsPeriod) => Promise<void>
  fetchSummary: () => Promise<void>
  fetchProductAnalytics: (productId: string) => Promise<void>

  // Period management
  setPeriod: (period: AnalyticsPeriod) => void
  refreshWithPeriod: (period: AnalyticsPeriod) => Promise<void>

  // Error management
  setError: (error: string | null) => void
  clearError: () => void
  clearAllErrors: () => void

  // Utility
  reset: () => void
}

type AnalyticsStore = AnalyticsState & AnalyticsActions

const initialState: AnalyticsState = {
  dashboardData: null,
  summary: null,
  mostSearchedProducts: [],
  mostPopularProducts: [],
  topQueries: [],
  productAnalytics: {},
  currentPeriod: 'month',
  searchedProductsPagination: {
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
  },
  popularProductsPagination: {
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
  },
  queriesPagination: {
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
  },
  isLoadingDashboard: false,
  isLoadingMostSearched: false,
  isLoadingMostPopular: false,
  isLoadingTopQueries: false,
  isLoadingSummary: false,
  isLoadingProductAnalytics: {},
  error: null,
  errors: {},
}

export const useAnalyticsStore = create<AnalyticsStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Fetch dashboard data (all in one)
      fetchDashboard: async (period?: AnalyticsPeriod) => {
        const periodToUse = period || get().currentPeriod
        if (get().isLoadingDashboard) return

        set({ isLoadingDashboard: true, error: null })
        try {
          const response = await analyticsService.getDashboard(periodToUse)
          set({
            dashboardData: response.data,
            summary: response.data.summary,
            mostSearchedProducts: response.data.mostSearchedProducts,
            mostPopularProducts: response.data.mostPopularProducts,
            topQueries: response.data.topSearchQueries,
            currentPeriod: periodToUse,
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch analytics dashboard'
          set({ error: message })
          console.error('Failed to fetch analytics dashboard:', error)
        } finally {
          set({ isLoadingDashboard: false })
        }
      },

      // Fetch most searched products
      fetchMostSearched: async (limit = 50, offset = 0, period?: AnalyticsPeriod) => {
        const periodToUse = period || get().currentPeriod
        if (get().isLoadingMostSearched) return

        set({ isLoadingMostSearched: true, error: null })
        try {
          const response = await analyticsService.getMostSearched(limit, offset, periodToUse)
          set({
            mostSearchedProducts: response.data.products,
            searchedProductsPagination: response.data.pagination,
            currentPeriod: periodToUse,
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch most searched products'
          set({ error: message })
          console.error('Failed to fetch most searched products:', error)
        } finally {
          set({ isLoadingMostSearched: false })
        }
      },

      // Fetch most popular products
      fetchMostPopular: async (limit = 50, offset = 0, period?: AnalyticsPeriod) => {
        const periodToUse = period || get().currentPeriod
        if (get().isLoadingMostPopular) return

        set({ isLoadingMostPopular: true, error: null })
        try {
          const response = await analyticsService.getMostPopular(limit, offset, periodToUse)
          set({
            mostPopularProducts: response.data.products,
            popularProductsPagination: response.data.pagination,
            currentPeriod: periodToUse,
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch most popular products'
          set({ error: message })
          console.error('Failed to fetch most popular products:', error)
        } finally {
          set({ isLoadingMostPopular: false })
        }
      },

      // Fetch top search queries
      fetchTopQueries: async (limit = 50, offset = 0, period?: AnalyticsPeriod) => {
        const periodToUse = period || get().currentPeriod
        if (get().isLoadingTopQueries) return

        set({ isLoadingTopQueries: true, error: null })
        try {
          const response = await analyticsService.getTopQueries(limit, offset, periodToUse)
          set({
            topQueries: response.data.queries,
            queriesPagination: response.data.pagination,
            currentPeriod: periodToUse,
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch top queries'
          set({ error: message })
          console.error('Failed to fetch top queries:', error)
        } finally {
          set({ isLoadingTopQueries: false })
        }
      },

      // Fetch summary only
      fetchSummary: async () => {
        if (get().isLoadingSummary) return

        set({ isLoadingSummary: true, error: null })
        try {
          const response = await analyticsService.getSummary()
          set({ summary: response.data || null })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch analytics summary'
          set({ error: message })
          console.error('Failed to fetch analytics summary:', error)
        } finally {
          set({ isLoadingSummary: false })
        }
      },

      // Fetch product-specific analytics
      fetchProductAnalytics: async (productId: string) => {
        const isLoading = get().isLoadingProductAnalytics[productId]
        if (isLoading) return

        set({
          isLoadingProductAnalytics: { ...get().isLoadingProductAnalytics, [productId]: true },
          error: null,
        })
        try {
          const response = await analyticsService.getProductAnalytics(productId)
          set({
            productAnalytics: { ...get().productAnalytics, [productId]: response.data },
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch product analytics'
          set({ error: message })
          console.error('Failed to fetch product analytics:', error)
        } finally {
          set({
            isLoadingProductAnalytics: { ...get().isLoadingProductAnalytics, [productId]: false },
          })
        }
      },

      // Set current period
      setPeriod: (period: AnalyticsPeriod) => {
        set({ currentPeriod: period })
      },

      // Refresh all data with a new period
      refreshWithPeriod: async (period: AnalyticsPeriod) => {
        set({ currentPeriod: period })
        await get().fetchDashboard(period)
      },

      // Error management
      setError: (error: string | null) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },

      clearAllErrors: () => {
        set({ error: null, errors: {} })
      },

      // Reset store
      reset: () => {
        set(initialState)
      },
    }),
    {
      name: 'analytics-store',
    }
  )
)

// Convenience hooks
export const useAnalyticsDashboard = () => {
  const { dashboardData, isLoadingDashboard, fetchDashboard, currentPeriod } = useAnalyticsStore()
  return { data: dashboardData, loading: isLoadingDashboard, fetch: fetchDashboard, period: currentPeriod }
}

export const useAnalyticsSummary = () => {
  const { summary, isLoadingSummary, fetchSummary } = useAnalyticsStore()
  return { data: summary, loading: isLoadingSummary, fetch: fetchSummary }
}
