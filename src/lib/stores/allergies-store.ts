import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Allergy,
  AllergiesOverview,
  AllergiesOverviewResponse,
  ApiResponse
} from '@/types'
import apiClient from '@/lib/api/client'
import { API_ENDPOINTS } from '@/constants'

interface AllergiesState {
  allergies: Allergy[]
  currentAllergy: Allergy | null
  overview: AllergiesOverview | null
  isLoading: boolean
  error: string | null
  searchQuery: string
  severityFilter: string
  activeFilter: string
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasMore: boolean
  }
}

interface AllergiesActions {
  // Overview
  fetchAllergiesOverview: () => Promise<void>

  // CRUD operations
  fetchAllergies: (page?: number, limit?: number) => Promise<void>
  fetchAllergy: (id: string) => Promise<Allergy>
  createAllergy: (data: Omit<Allergy, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Allergy>
  updateAllergy: (id: string, data: Partial<Allergy>) => Promise<Allergy>
  deleteAllergy: (id: string) => Promise<void>

  // Search and filters
  searchAllergies: (query: string) => Promise<void>
  setFilters: (severity?: string, active?: string) => void
  clearFilters: () => void

  // State management
  setCurrentAllergy: (allergy: Allergy | null) => void
  setError: (error: string | null) => void
  clearError: () => void
}

type AllergiesStore = AllergiesState & AllergiesActions

export const useAllergiesStore = create<AllergiesStore>()(
  persist(
    (set, get) => ({
      // State
      allergies: [],
      currentAllergy: null,
      overview: null,
      isLoading: false,
      error: null,
      searchQuery: '',
      severityFilter: '',
      activeFilter: '',
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
        hasMore: false
      },

      // Actions
      fetchAllergiesOverview: async () => {
        set({ isLoading: true, error: null })

        try {
          const response = await apiClient.get<ApiResponse<AllergiesOverviewResponse>>(
            API_ENDPOINTS.ALLERGIES.OVERVIEW
          )

          if (response.success && response.data) {
            const { overview, allergies, pagination } = response.data
            set({
              overview,
              allergies,
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
            throw new Error(response.message || 'Failed to fetch allergies overview')
          }
        } catch (error: unknown) {
          const message = (error as Error)?.message || 'Failed to fetch allergies overview'
          set({
            error: message,
            isLoading: false
          })
          throw error
        }
      },

      fetchAllergies: async (page = 1, limit = 20) => {
        set({ isLoading: true, error: null })

        try {
          const { searchQuery, severityFilter, activeFilter } = get()
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
          })

          if (searchQuery) params.append('search', searchQuery)
          if (severityFilter) params.append('severity', severityFilter)
          if (activeFilter) params.append('active', activeFilter)

          const response = await apiClient.get<ApiResponse<{ allergies: Allergy[], pagination: { total: number; limit: number; offset: number; pages: number } }>>(
            `${API_ENDPOINTS.ALLERGIES.LIST}?${params.toString()}`
          )

          if (response.success && response.data) {
            set({
              allergies: response.data.allergies,
              pagination: response.data.pagination,
              isLoading: false
            })
          } else {
            throw new Error(response.message || 'Failed to fetch allergies')
          }
        } catch (error: unknown) {
          const message = (error as Error)?.message || 'Failed to fetch allergies'
          set({
            error: message,
            isLoading: false
          })
          throw error
        }
      },

      fetchAllergy: async (id: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await apiClient.get<ApiResponse<Allergy>>(
            API_ENDPOINTS.ALLERGIES.GET(id)
          )

          if (response.success && response.data) {
            const allergy = response.data
            set({
              currentAllergy: allergy,
              isLoading: false
            })
            return allergy
          } else {
            throw new Error(response.message || 'Failed to fetch allergy')
          }
        } catch (error: unknown) {
          const message = (error as Error)?.message || 'Failed to fetch allergy'
          set({
            error: message,
            isLoading: false
          })
          throw error
        }
      },

      createAllergy: async (data) => {
        set({ isLoading: true, error: null })

        try {
          const response = await apiClient.post<ApiResponse<{ allergy: Allergy }>>(
            API_ENDPOINTS.ALLERGIES.CREATE,
            data
          )

          if (response.success && response.data) {
            const newAllergy = response.data.allergy
            set((state) => ({
              allergies: [newAllergy, ...state.allergies],
              isLoading: false
            }))
            // Refresh overview to update counts
            await get().fetchAllergiesOverview()
            return newAllergy
          } else {
            throw new Error(response.message || 'Failed to create allergy')
          }
        } catch (error: unknown) {
          const message = (error as Error)?.message || 'Failed to create allergy'
          set({
            error: message,
            isLoading: false
          })
          throw error
        }
      },

      updateAllergy: async (id: string, data) => {
        set({ isLoading: true, error: null })

        try {
          const response = await apiClient.put<ApiResponse<{ allergy: Allergy }>>(
            API_ENDPOINTS.ALLERGIES.UPDATE(id),
            data
          )

          if (response.success && response.data) {
            const updatedAllergy = response.data.allergy
            set((state) => ({
              allergies: state.allergies.map(a =>
                a.id === id ? updatedAllergy : a
              ),
              currentAllergy: state.currentAllergy?.id === id ? updatedAllergy : state.currentAllergy,
              isLoading: false
            }))
            return updatedAllergy
          } else {
            throw new Error(response.message || 'Failed to update allergy')
          }
        } catch (error: unknown) {
          const message = (error as Error)?.message || 'Failed to update allergy'
          set({
            error: message,
            isLoading: false
          })
          throw error
        }
      },

      deleteAllergy: async (id: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await apiClient.delete<ApiResponse<void>>(
            API_ENDPOINTS.ALLERGIES.DELETE(id)
          )

          if (response.success) {
            set((state) => ({
              allergies: state.allergies.filter(a => a.id !== id),
              currentAllergy: state.currentAllergy?.id === id ? null : state.currentAllergy,
              isLoading: false
            }))
          } else {
            throw new Error(response.message || 'Failed to delete allergy')
          }
        } catch (error: unknown) {
          const message = (error as Error)?.message || 'Failed to delete allergy'
          set({
            error: message,
            isLoading: false
          })
          throw error
        }
      },

      searchAllergies: async (query: string) => {
        set({ searchQuery: query })
        await get().fetchAllergies()
      },

      setFilters: (severity?: string, active?: string) => {
        set({
          severityFilter: severity || '',
          activeFilter: active || ''
        })
      },

      clearFilters: () => {
        set({
          searchQuery: '',
          severityFilter: '',
          activeFilter: ''
        })
      },

      setCurrentAllergy: (allergy: Allergy | null) => {
        set({ currentAllergy: allergy })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'allergies-storage',
      partialize: (state) => ({
        allergies: state.allergies,
        currentAllergy: state.currentAllergy,
        overview: state.overview
      }),
    }
  )
)