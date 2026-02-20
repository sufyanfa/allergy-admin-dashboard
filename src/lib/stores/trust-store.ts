/**
 * Trust System State Management
 * 
 * Zustand store for managing trust-related state
 */

import { create } from 'zustand'
import type {
    ProductFieldTrust,
    UserTrustStats,
    TrustEvent,
    TrustOverviewStats,
    TopContributor,
} from '@/types/trust'
import { trustApi, trustAnalyticsApi } from '@/lib/api/trust'

interface TrustStore {
    // State
    productTrust: Record<string, ProductFieldTrust[]>
    userTrust: Record<string, UserTrustStats>
    trustEvents: Record<string, TrustEvent[]>
    overviewStats: TrustOverviewStats | null
    topContributors: TopContributor[]
    loading: boolean
    error: string | null

    // Actions
    fetchProductTrust: (productId: string) => Promise<void>
    fetchUserTrust: (userId: string) => Promise<void>
    fetchTrustHistory: (productId: string, fieldType: string) => Promise<void>
    fetchOverviewStats: () => Promise<void>
    fetchTopContributors: () => Promise<void>
    clearError: () => void
    reset: () => void
}

const initialState = {
    productTrust: {},
    userTrust: {},
    trustEvents: {},
    overviewStats: null,
    topContributors: [],
    loading: false,
    error: null,
}

export const useTrustStore = create<TrustStore>((set) => ({
    ...initialState,

    /**
     * Fetch trust scores for a product
     */
    fetchProductTrust: async (productId: string) => {
        set({ loading: true, error: null })
        try {
            const response = await trustApi.getProductTrust(productId)
            set((state) => ({
                productTrust: {
                    ...state.productTrust,
                    [productId]: response.data.fields,
                },
                loading: false,
            }))
        } catch (error: any) {
            set({
                error: error.response?.data?.error?.message || 'Failed to fetch product trust',
                loading: false,
            })
        }
    },

    /**
     * Fetch trust stats for a user
     */
    fetchUserTrust: async (userId: string) => {
        set({ loading: true, error: null })
        try {
            const response = await trustApi.getUserTrust(userId)
            set((state) => ({
                userTrust: {
                    ...state.userTrust,
                    [userId]: response.data,
                },
                loading: false,
            }))
        } catch (error: any) {
            set({
                error: error.response?.data?.error?.message || 'Failed to fetch user trust',
                loading: false,
            })
        }
    },

    /**
     * Fetch trust event history
     */
    fetchTrustHistory: async (productId: string, fieldType: string) => {
        set({ loading: true, error: null })
        try {
            const response = await trustApi.getTrustHistory(productId, fieldType as any)
            const key = `${productId}:${fieldType}`
            set((state) => ({
                trustEvents: {
                    ...state.trustEvents,
                    [key]: response.data.events,
                },
                loading: false,
            }))
        } catch (error: any) {
            set({
                error: error.response?.data?.error?.message || 'Failed to fetch trust history',
                loading: false,
            })
        }
    },

    /**
     * Fetch overview statistics
     */
    fetchOverviewStats: async () => {
        set({ loading: true, error: null })
        try {
            const stats = await trustAnalyticsApi.getOverviewStats()
            set({
                overviewStats: stats,
                loading: false,
            })
        } catch (error: any) {
            // 404 means the endpoint is not yet available on the backend —
            // treat it as "no data" rather than an error so the UI stays clean.
            const status = error?.status ?? error?.response?.status
            if (status === 404) {
                set({ loading: false })
            } else {
                set({
                    error: error.response?.data?.error?.message || 'Failed to fetch overview stats',
                    loading: false,
                })
            }
        }
    },

    /**
     * Fetch top contributors
     */
    fetchTopContributors: async () => {
        set({ loading: true, error: null })
        try {
            const contributors = await trustAnalyticsApi.getTopContributors()
            set({
                topContributors: contributors,
                loading: false,
            })
        } catch (error: any) {
            set({
                error: error.response?.data?.error?.message || 'Failed to fetch top contributors',
                loading: false,
            })
        }
    },

    /**
     * Clear error state
     */
    clearError: () => set({ error: null }),

    /**
     * Reset store to initial state
     */
    reset: () => set(initialState),
}))

export default useTrustStore
