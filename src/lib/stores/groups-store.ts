import { create } from 'zustand'
import { groupsApi } from '../api/groups'
import { Group, GroupsFilters } from '@/types/groups'

interface GroupsState {
    // Data
    groups: Group[]
    isLoading: boolean
    error: string | null
    filters: GroupsFilters

    // Actions
    fetchGroups: () => Promise<void>
    setFilters: (filters: Partial<GroupsFilters>) => void
    clearFilters: () => void
    clearError: () => void
}

const initialFilters: GroupsFilters = {
    limit: 20,
    page: 1,
}

export const useGroupsStore = create<GroupsState>((set, get) => ({
    // Initial State
    groups: [],
    isLoading: false,
    error: null,
    filters: initialFilters,

    // Actions
    fetchGroups: async () => {
        set({ isLoading: true, error: null })
        try {
            const groups = await groupsApi.getAllGroups()
            set({ groups, isLoading: false })
        } catch (error: any) {
            console.error('Failed to fetch groups:', error)
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to fetch groups',
            })
        }
    },

    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
        }))
    },

    clearFilters: () => {
        set({ filters: initialFilters })
    },

    clearError: () => {
        set({ error: null })
    },
}))
