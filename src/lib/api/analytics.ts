import { apiClient } from './client'
import type {
  AnalyticsDashboardResponse,
  SearchedProductsResponse,
  TopQueriesResponse,
  ProductAnalyticsResponse,
  AnalyticsPeriod,
  AnalyticsSummary,
  ApiResponse,
} from '@/types'

class AnalyticsService {
  /**
   * Get all analytics data in one call (Dashboard)
   */
  async getDashboard(period: AnalyticsPeriod = 'month'): Promise<AnalyticsDashboardResponse> {
    return apiClient.get<AnalyticsDashboardResponse>(
      `/admin/analytics/dashboard?period=${period}`
    )
  }

  /**
   * Get most searched products
   */
  async getMostSearched(
    limit = 50,
    offset = 0,
    period: AnalyticsPeriod = 'month'
  ): Promise<SearchedProductsResponse> {
    return apiClient.get<SearchedProductsResponse>(
      `/admin/analytics/most-searched?limit=${limit}&offset=${offset}&period=${period}`
    )
  }

  /**
   * Get most popular products
   */
  async getMostPopular(
    limit = 50,
    offset = 0,
    period: AnalyticsPeriod = 'month'
  ): Promise<SearchedProductsResponse> {
    return apiClient.get<SearchedProductsResponse>(
      `/admin/analytics/most-popular?limit=${limit}&offset=${offset}&period=${period}`
    )
  }

  /**
   * Get top search queries
   */
  async getTopQueries(
    limit = 50,
    offset = 0,
    period: AnalyticsPeriod = 'month'
  ): Promise<TopQueriesResponse> {
    return apiClient.get<TopQueriesResponse>(
      `/admin/analytics/top-queries?limit=${limit}&offset=${offset}&period=${period}`
    )
  }

  /**
   * Get analytics summary only
   */
  async getSummary(): Promise<ApiResponse<AnalyticsSummary>> {
    return apiClient.get<ApiResponse<AnalyticsSummary>>('/admin/analytics/summary')
  }

  /**
   * Get analytics for a specific product
   */
  async getProductAnalytics(productId: string): Promise<ProductAnalyticsResponse> {
    return apiClient.get<ProductAnalyticsResponse>(
      `/admin/analytics/products/${productId}`
    )
  }
}

const analyticsService = new AnalyticsService()
export default analyticsService
