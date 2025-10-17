import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Contribution,
  ContributionsOverview,
  ContributionsOverviewResponse,
  ContributionsFilters,
  ContributionStatusUpdate,
  ContributionStatusUpdateResponse,
  BulkUpdateRequest,
  BulkUpdateResponse,
  ApiResponse
} from '@/types'
import { API_ENDPOINTS } from '@/constants'
import apiClient from '@/lib/api/client'

interface ContributionsState {
  contributions: Contribution[]
  currentContribution: Contribution | null
  overview: ContributionsOverview | null
  isLoading: boolean
  error: string | null
  filters: ContributionsFilters
  selectedIds: string[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasMore: boolean
  }
}

interface ContributionsActions {
  // Fetch operations
  fetchContributionsOverview: () => Promise<void>
  fetchContributions: (filters?: ContributionsFilters) => Promise<void>
  fetchContribution: (id: string) => Promise<Contribution>
  loadMore: () => Promise<void>

  // Edit contribution data
  editContribution: (id: string, data: Record<string, string | number>) => Promise<void>

  // Status updates
  updateContributionStatus: (id: string, data: ContributionStatusUpdate) => Promise<ContributionStatusUpdateResponse>
  bulkUpdateContributions: (data: BulkUpdateRequest) => Promise<BulkUpdateResponse>

  // State management
  setCurrentContribution: (contribution: Contribution | null) => void
  setFilters: (filters: Partial<ContributionsFilters>) => void
  clearFilters: () => void
  setError: (error: string | null) => void
  clearError: () => void
  setSelectedIds: (ids: string[]) => void
  toggleSelection: (id: string) => void
  clearSelection: () => void
}

type ContributionsStore = ContributionsState & ContributionsActions

const initialFilters: ContributionsFilters = {
  search: '',
  status: undefined,
  contributionType: undefined,
  userId: undefined,
  limit: 20,
  offset: 0
}

export const useContributionsStore = create<ContributionsStore>()(
  persist(
    (set, get) => ({
      // State
      contributions: [],
      currentContribution: null,
      overview: null,
      isLoading: false,
      error: null,
      filters: initialFilters,
      selectedIds: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
        hasMore: false
      },

      // Actions
      fetchContributionsOverview: async () => {
        set({ isLoading: true, error: null })

        try {
          const params = new URLSearchParams()
          const filters = get().filters

          if (filters.search) params.append('search', filters.search)
          if (filters.status) params.append('status', filters.status)
          if (filters.contributionType) params.append('contributionType', filters.contributionType)
          if (filters.userId) params.append('userId', filters.userId)
          params.append('limit', String(filters.limit || 20))
          params.append('offset', String(filters.offset || 0))

          const response = await apiClient.get<ApiResponse<ContributionsOverviewResponse>>(
            `${API_ENDPOINTS.CONTRIBUTIONS.OVERVIEW}?${params.toString()}`
          )

          if (response.success && response.data) {
            const { overview, contributions, pagination } = response.data

            set({
              overview,
              contributions,
              pagination: {
                page: Math.floor(pagination.offset / pagination.limit) + 1,
                limit: pagination.limit,
                total: pagination.total,
                pages: pagination.pages,
                hasMore: pagination.offset + pagination.limit < pagination.total
              },
              isLoading: false
            })
          } else {
            throw new Error(response.message || 'Failed to fetch contributions overview')
          }
        } catch (error: unknown) {
          console.error('❌ Contributions Overview Error:', error)
          const message = (error as Error)?.message || 'Failed to fetch contributions overview'
          set({
            error: message,
            isLoading: false
          })
          throw error
        }
      },

      fetchContributions: async (filters?: ContributionsFilters) => {
        set({ isLoading: true, error: null })

        if (filters) {
          set({ filters: { ...get().filters, ...filters } })
        }

        await get().fetchContributionsOverview()
      },

      loadMore: async () => {
        const { pagination, filters, contributions } = get()

        if (!pagination.hasMore) return

        set({ isLoading: true, error: null })

        try {
          const newOffset = pagination.page * pagination.limit
          const params = new URLSearchParams()

          if (filters.search) params.append('search', filters.search)
          if (filters.status) params.append('status', filters.status)
          if (filters.contributionType) params.append('contributionType', filters.contributionType)
          if (filters.userId) params.append('userId', filters.userId)
          params.append('limit', String(filters.limit || 20))
          params.append('offset', String(newOffset))

          const response = await apiClient.get<ApiResponse<ContributionsOverviewResponse>>(
            `${API_ENDPOINTS.CONTRIBUTIONS.OVERVIEW}?${params.toString()}`
          )

          if (response.success && response.data) {
            const { contributions: newContributions, pagination: newPagination } = response.data

            set({
              contributions: [...contributions, ...newContributions],
              pagination: {
                page: Math.floor(newPagination.offset / newPagination.limit) + 1,
                limit: newPagination.limit,
                total: newPagination.total,
                pages: newPagination.pages,
                hasMore: newPagination.offset + newPagination.limit < newPagination.total
              },
              isLoading: false
            })
          } else {
            throw new Error(response.message || 'Failed to load more contributions')
          }
        } catch (error: unknown) {
          console.error('❌ Load More Error:', error)
          const message = (error as Error)?.message || 'Failed to load more contributions'
          set({
            error: message,
            isLoading: false
          })
          throw error
        }
      },

      fetchContribution: async (id: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await apiClient.get<ApiResponse<{ contribution: Contribution }>>(
            API_ENDPOINTS.CONTRIBUTIONS.GET(id)
          )

          if (response.success && response.data) {
            const contribution = response.data.contribution
            set({
              currentContribution: contribution,
              isLoading: false
            })
            return contribution
          } else {
            throw new Error(response.message || 'Failed to fetch contribution')
          }
        } catch (error: unknown) {
          const message = (error as Error)?.message || 'Failed to fetch contribution'
          set({
            error: message,
            isLoading: false
          })
          throw error
        }
      },

      editContribution: async (id: string, data: Record<string, string | number>) => {
        set({ isLoading: true, error: null })

        try {
          const response = await apiClient.patch<ApiResponse<{ contributionId: string }>>(
            API_ENDPOINTS.CONTRIBUTIONS.UPDATE(id),
            data
          )

          if (response.success) {
            // Refresh the contribution to get updated data
            await get().fetchContribution(id)
          } else {
            throw new Error(response.message || 'Failed to edit contribution')
          }
        } catch (error: unknown) {
          const message = (error as Error)?.message || 'Failed to edit contribution'
          set({
            error: message,
            isLoading: false
          })
          throw error
        }
      },

      updateContributionStatus: async (id: string, data: ContributionStatusUpdate) => {
        set({ isLoading: true, error: null })

        try {
          const response = await apiClient.patch<ApiResponse<ContributionStatusUpdateResponse>>(
            API_ENDPOINTS.CONTRIBUTIONS.UPDATE_STATUS(id),
            data
          )

          if (response.success && response.data) {
            // Update the contribution in the list
            set((state) => ({
              contributions: state.contributions.map(c =>
                c.id === id
                  ? { ...c, status: data.status, notes: data.notes || c.notes }
                  : c
              ),
              currentContribution: state.currentContribution?.id === id
                ? { ...state.currentContribution, status: data.status, notes: data.notes || state.currentContribution.notes }
                : state.currentContribution,
              isLoading: false
            }))

            // Refresh overview to update counts
            await get().fetchContributionsOverview()

            return response.data
          } else {
            throw new Error(response.message || 'Failed to update contribution status')
          }
        } catch (error: unknown) {
          const message = (error as Error)?.message || 'Failed to update contribution status'
          set({
            error: message,
            isLoading: false
          })
          throw error
        }
      },

      bulkUpdateContributions: async (data: BulkUpdateRequest) => {
        set({ isLoading: true, error: null })

        try {
          const response = await apiClient.post<ApiResponse<BulkUpdateResponse>>(
            API_ENDPOINTS.CONTRIBUTIONS.BULK_UPDATE,
            data
          )

          if (response.success && response.data) {
            // Refresh the entire list
            await get().fetchContributionsOverview()

            // Clear selection
            set({
              selectedIds: [],
              isLoading: false
            })

            return response.data
          } else {
            throw new Error(response.message || 'Failed to bulk update contributions')
          }
        } catch (error: unknown) {
          const message = (error as Error)?.message || 'Failed to bulk update contributions'
          set({
            error: message,
            isLoading: false
          })
          throw error
        }
      },

      setCurrentContribution: (contribution) => {
        set({ currentContribution: contribution })
      },

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters, offset: 0 },
          pagination: { ...state.pagination, page: 1 }
        }))
      },

      clearFilters: () => {
        set({
          filters: initialFilters,
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            pages: 0,
            hasMore: false
          }
        })
      },

      setError: (error) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },

      setSelectedIds: (ids) => {
        set({ selectedIds: ids })
      },

      toggleSelection: (id) => {
        set((state) => ({
          selectedIds: state.selectedIds.includes(id)
            ? state.selectedIds.filter(selectedId => selectedId !== id)
            : [...state.selectedIds, id]
        }))
      },

      clearSelection: () => {
        set({ selectedIds: [] })
      },
    }),
    {
      name: 'contributions-storage',
      partialize: (state) => ({
        filters: state.filters
      }),
    }
  )
)
