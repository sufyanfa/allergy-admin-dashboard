/**
 * Trust System API
 *
 * All routes are under the /trust prefix on the backend
 * (registered as: app.register(trustRoutes, { prefix: '/trust' }))
 *
 * Uses the shared apiClient so the same token storage and
 * refresh logic applies — no separate axios instance.
 */

import { apiClient } from './client'
import type {
    CastVoteRequest,
    CastVoteResponse,
    AdminVoteRequest,
    AdminVoteResponse,
    FreezeFieldRequest,
    UnfreezeFieldRequest,
    ProductTrustResponse,
    FieldTrustResponse,
    TrustHistoryResponse,
    UserTrustResponse,
    FieldType,
    TrustOverviewStats,
    TopContributor,
    SuspiciousActivity,
    SuspiciousActivityAction,
} from '@/types/trust'

export const trustApi = {
    /**
     * Cast a vote on a product field
     * POST /api/v1/trust/vote
     */
    castVote: async (data: CastVoteRequest): Promise<CastVoteResponse> => {
        return apiClient.post<CastVoteResponse>('/trust/vote', data)
    },

    /**
     * Get trust scores for all fields of a product
     * GET /api/v1/trust/products/:productId/trust
     */
    getProductTrust: async (productId: string): Promise<ProductTrustResponse> => {
        return apiClient.get<ProductTrustResponse>(`/trust/products/${productId}/trust`)
    },

    /**
     * Get trust score for a specific field
     * GET /api/v1/trust/products/:productId/trust/:fieldType
     */
    getFieldTrust: async (
        productId: string,
        fieldType: FieldType,
    ): Promise<FieldTrustResponse> => {
        return apiClient.get<FieldTrustResponse>(
            `/trust/products/${productId}/trust/${fieldType}`,
        )
    },

    /**
     * Get trust event history for a field
     * GET /api/v1/trust/products/:productId/trust/:fieldType/history
     */
    getTrustHistory: async (
        productId: string,
        fieldType: FieldType,
        limit: number = 50,
    ): Promise<TrustHistoryResponse> => {
        return apiClient.get<TrustHistoryResponse>(
            `/trust/products/${productId}/trust/${fieldType}/history`,
            { params: { limit } },
        )
    },

    /**
     * Get user trust statistics
     * GET /api/v1/trust/users/:userId/trust
     */
    getUserTrust: async (userId: string): Promise<UserTrustResponse> => {
        return apiClient.get<UserTrustResponse>(`/trust/users/${userId}/trust`)
    },

    /**
     * Cast an admin override vote (requires admin or expert role)
     * POST /api/v1/trust/admin/vote
     */
    castAdminVote: async (data: AdminVoteRequest): Promise<AdminVoteResponse> => {
        return apiClient.post<AdminVoteResponse>('/trust/admin/vote', data)
    },

    /**
     * Freeze a product field to prevent further voting (requires admin role)
     * POST /api/v1/trust/admin/freeze
     */
    freezeField: async (data: FreezeFieldRequest): Promise<{ success: boolean }> => {
        return apiClient.post<{ success: boolean }>('/trust/admin/freeze', data)
    },

    /**
     * Unfreeze a product field to allow voting (requires admin role)
     * POST /api/v1/trust/admin/unfreeze
     */
    unfreezeField: async (data: UnfreezeFieldRequest): Promise<{ success: boolean }> => {
        return apiClient.post<{ success: boolean }>('/trust/admin/unfreeze', data)
    },
}

export const trustReviewApi = {
    /**
     * GET /api/v1/trust/admin/suspicious-activities
     */
    getSuspiciousActivities: async (params?: { userId?: string; limit?: number }) =>
        apiClient.get<{ success: boolean; data: SuspiciousActivity[] }>(
            '/trust/admin/suspicious-activities',
            { params }
        ),

    /**
     * POST /api/v1/trust/admin/suspicious-activities/:id/resolve
     */
    resolveActivity: async (
        id: string,
        body: { notes: string; action: SuspiciousActivityAction }
    ) =>
        apiClient.post<{ success: boolean; message: string }>(
            `/trust/admin/suspicious-activities/${id}/resolve`,
            body
        ),
}

export const trustAnalyticsApi = {
    /**
     * GET /api/v1/trust/stats/overview
     */
    getOverviewStats: async (): Promise<TrustOverviewStats> => {
        const response = await apiClient.get<{ success: boolean; data: TrustOverviewStats }>('/trust/stats/overview')
        return response.data
    },

    /**
     * GET /api/v1/trust/stats/contributors
     */
    getTopContributors: async (limit: number = 10): Promise<TopContributor[]> => {
        return apiClient.get<TopContributor[]>('/trust/stats/contributors', { params: { limit } })
    },

    /**
     * GET /api/v1/trust/stats/analytics
     */
    getAnalytics: async (days: number = 30): Promise<unknown> => {
        return apiClient.get('/trust/stats/analytics', { params: { days } })
    },
}

export default trustApi
