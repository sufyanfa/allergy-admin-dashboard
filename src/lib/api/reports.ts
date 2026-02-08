import { apiClient } from './client'
import { API_ENDPOINTS } from '@/constants'

export interface GroupReport {
    id: string
    reason: string
    details: string | null
    status: string
    dismissedAt: string | null
    createdAt: string
    reporterName: string
    postId: string | null
    commentId: string | null
    postContent: string | null
    postTitle: string | null
    commentContent: string | null
}

class ReportsApi {
    /**
     * Get all community reports
     */
    async getReports() {
        return apiClient.get<{ success: boolean; message: string; data: { reports: GroupReport[] } }>(API_ENDPOINTS.REPORTS.LIST)
    }

    /**
     * Dismiss a report
     */
    async dismissReport(reportId: string) {
        return apiClient.delete(API_ENDPOINTS.REPORTS.DISMISS(reportId))
    }
}

export const reportsApi = new ReportsApi()
