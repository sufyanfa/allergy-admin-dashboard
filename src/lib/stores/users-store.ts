import { create } from 'zustand'
import { User, PaginatedResponse, UsersOverview, UsersOverviewResponse, ApiResponse } from '@/types'
import apiClient from '@/lib/api/client'

interface UsersState {
  users: User[]
  selectedUser: User | null
  overview: UsersOverview | null
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasMore: boolean
  }
  filters: {
    search: string
    role: string
    status: string
    verified: string
  }
}

interface UsersActions {
  fetchUsersOverview: () => Promise<void>
  fetchUsers: (params?: Record<string, unknown>) => Promise<void>
  fetchUser: (id: string) => Promise<void>
  updateUser: (id: string, data: Partial<User>) => Promise<void>
  updateUserStatus: (id: string, status: 'active' | 'inactive' | 'suspended') => Promise<void>
  deleteUser: (id: string) => Promise<void>
  searchUsers: (query: string) => Promise<void>
  setFilters: (filters: Partial<UsersState['filters']>) => void
  setPagination: (page: number, limit?: number) => void
  clearError: () => void
  setSelectedUser: (user: User | null) => void
}

type UsersStore = UsersState & UsersActions

export const useUsersStore = create<UsersStore>((set, get) => ({
  // State
  users: [],
  selectedUser: null,
  overview: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasMore: false,
  },
  filters: {
    search: '',
    role: '',
    status: '',
    verified: '',
  },

  // Actions
  fetchUsersOverview: async () => {
    set({ loading: true, error: null })

    try {
      const response = await apiClient.get<ApiResponse<UsersOverviewResponse>>(
        '/admin/users/overview'
      )

      if (response.success && response.data) {
        const { overview, users, pagination } = response.data
        set({
          overview,
          users,
          pagination: {
            page: Math.floor(pagination.offset / pagination.limit) + 1,
            limit: pagination.limit,
            total: pagination.total,
            pages: pagination.pages,
            hasMore: pagination.offset + pagination.limit < pagination.total
          },
          loading: false
        })
      } else {
        throw new Error(response.message || 'Failed to fetch users overview')
      }
    } catch (error: unknown) {
      const message = (error as Error)?.message || 'Failed to fetch users overview'
      set({
        error: message,
        loading: false
      })
      throw error
    }
  },

  fetchUsers: async (params = {}) => {
    set({ loading: true, error: null })

    try {
      const { filters, pagination } = get()
      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        role: filters.role,
        status: filters.status,
        ...params,
      }

      // Remove empty filters
      Object.keys(queryParams).forEach(key => {
        if (!queryParams[key as keyof typeof queryParams]) {
          delete queryParams[key as keyof typeof queryParams]
        }
      })

      const response: PaginatedResponse<User> = await apiClient.get('/profiles/search', {
        params: queryParams,
      })

      if (response.success) {
        set({
          users: response.data.items,
          pagination: response.data.pagination,
          loading: false,
        })
      } else {
        throw new Error(response.message || 'Failed to fetch users')
      }
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || (error as Error)?.message || 'Failed to fetch users'
      set({
        error: message,
        loading: false,
        users: [],
      })
    }
  },

  fetchUser: async (id: string) => {
    set({ loading: true, error: null })

    try {
      const response = await apiClient.get<{
        success: boolean
        message?: string
        data: { profile: User }
      }>(`/profiles/${id}`)

      if (response.success) {
        set({
          selectedUser: response.data.profile,
          loading: false,
        })
      } else {
        throw new Error(response.message || 'Failed to fetch user')
      }
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || (error as Error)?.message || 'Failed to fetch user'
      set({
        error: message,
        loading: false,
        selectedUser: null,
      })
    }
  },

  updateUser: async (id: string, data: Partial<User>) => {
    set({ loading: true, error: null })

    try {
      const response = await apiClient.put<{
        success: boolean
        message?: string
        data: { profile: User }
      }>(`/profiles/${id}`, data)

      if (response.success) {
        const updatedUser = response.data.profile
        const { users, selectedUser } = get()

        set({
          users: users.map(user => user.id === id ? { ...user, ...updatedUser } : user),
          selectedUser: selectedUser?.id === id ? { ...selectedUser, ...updatedUser } : selectedUser,
          loading: false,
        })
      } else {
        throw new Error(response.message || 'Failed to update user')
      }
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || (error as Error)?.message || 'Failed to update user'
      set({
        error: message,
        loading: false,
      })
      throw error
    }
  },

  updateUserStatus: async (id: string, status: 'active' | 'inactive' | 'suspended') => {
    await get().updateUser(id, { status })
  },

  searchUsers: async (query: string) => {
    set((state) => ({ ...state, filters: { ...state.filters, search: query } }))
    await get().fetchUsersOverview()
  },

  deleteUser: async (id: string) => {
    set({ loading: true, error: null })

    try {
      const response = await apiClient.delete<{
        success: boolean
        message?: string
      }>(`/profiles/${id}`)

      if (response.success) {
        const { users } = get()
        set({
          users: users.filter(user => user.id !== id),
          selectedUser: null,
          loading: false,
        })
      } else {
        throw new Error(response.message || 'Failed to delete user')
      }
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || (error as Error)?.message || 'Failed to delete user'
      set({
        error: message,
        loading: false,
      })
      throw error
    }
  },

  setFilters: (newFilters) => {
    const { filters } = get()
    set({
      filters: { ...filters, ...newFilters },
      pagination: { ...get().pagination, page: 1 }, // Reset to first page when filtering
    })
  },

  setPagination: (page: number, limit?: number) => {
    const { pagination } = get()
    set({
      pagination: {
        ...pagination,
        page,
        ...(limit && { limit }),
      },
    })
  },

  clearError: () => {
    set({ error: null })
  },

  setSelectedUser: (user: User | null) => {
    set({ selectedUser: user })
  },
}))