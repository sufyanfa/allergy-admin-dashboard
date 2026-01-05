import { create } from 'zustand'
import { listsApi } from '../api/lists'
import {
    ProductList,
    ListWithProducts,
    ListMember,
    ListInvitation,
    ListJoinRequest,
    ListsOverview,
    ListsFilters,
    CreateListInput,
    UpdateListInput,
} from '@/types/lists'

interface ListsState {
    // Data
    lists: ProductList[]
    currentList: ListWithProducts | null
    members: ListMember[]
    invitations: ListInvitation[]
    joinRequests: ListJoinRequest[]
    overview: ListsOverview | null
    colors: Array<{ name: string; value: string; category: string }> | null
    icons: string[] | null

    // UI State
    isLoading: boolean
    isLoadingMembers: boolean
    isLoadingInvitations: boolean
    error: string | null

    // Pagination
    pagination: {
        page: number
        limit: number
        total: number
        hasMore: boolean
    }

    // Filters
    filters: ListsFilters

    // Actions - Overview & Lists
    fetchListsOverview: () => Promise<void>
    fetchLists: (filters?: ListsFilters) => Promise<void>
    fetchListById: (listId: string) => Promise<void>
    fetchListWithProducts: (listId: string, sortBy?: 'date_added' | 'name_ar' | 'name_en') => Promise<void>
    createList: (data: CreateListInput) => Promise<ProductList>
    updateList: (listId: string, data: UpdateListInput) => Promise<ProductList>
    deleteList: (listId: string) => Promise<void>

    // Actions - Products
    addProductToList: (listId: string, productId: string, notes?: string) => Promise<void>
    removeProductFromList: (listId: string, productId: string) => Promise<void>
    updateProductNotes: (listId: string, productId: string, notes: string) => Promise<void>

    // Actions - Sharing
    fetchListMembers: (listId: string) => Promise<void>
    fetchListInvitations: (listId: string) => Promise<void>
    shareList: (listId: string, data: any) => Promise<void>
    removeMember: (listId: string, memberId: string) => Promise<void>
    updateMemberRole: (listId: string, memberId: string, role: 'editor' | 'viewer') => Promise<void>
    cancelInvitation: (invitationId: string) => Promise<void>

    // Actions - Public Sharing
    generatePublicLink: (listId: string, role?: 'editor' | 'viewer') => Promise<{ shareToken: string; shareUrl: string }>
    disablePublicSharing: (listId: string) => Promise<void>
    fetchPublicLists: (limit?: number, offset?: number) => Promise<void>
    fetchListJoinRequests: (listId: string) => Promise<void>
    approveJoinRequest: (listId: string, requestId: string) => Promise<void>
    rejectJoinRequest: (listId: string, requestId: string) => Promise<void>

    // Actions - Meta
    fetchAvailableColors: () => Promise<void>
    fetchAvailableIcons: () => Promise<void>

    // Utility
    setFilters: (filters: Partial<ListsFilters>) => void
    clearFilters: () => void
    clearError: () => void
    clearCurrentList: () => void
}

const initialFilters: ListsFilters = {
    limit: 20,
    offset: 0,
}

export const useListsStore = create<ListsState>((set, get) => ({
    // Initial State
    lists: [],
    currentList: null,
    members: [],
    invitations: [],
    joinRequests: [],
    overview: null,
    colors: null,
    icons: null,
    isLoading: false,
    isLoadingMembers: false,
    isLoadingInvitations: false,
    error: null,
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        hasMore: false,
    },
    filters: initialFilters,

    // ==================== Overview & Lists ====================

    fetchListsOverview: async () => {
        set({ isLoading: true, error: null })
        try {
            const response = await listsApi.getLists(get().filters)
            const lists = response.data.lists

            // Calculate overview statistics from lists
            const overview = {
                totalLists: lists.length,
                publicLists: lists.filter(l => l.privacy === 'public').length,
                privateLists: lists.filter(l => l.privacy === 'private').length,
                sharedLists: lists.filter(l => l.shareEnabled).length,
                totalProducts: lists.reduce((sum, l) => sum + l.productCount, 0),
                activeUsers: new Set(lists.map(l => l.userId)).size,
                pendingInvitations: 0, // Would need separate endpoint
                pendingJoinRequests: 0, // Would need separate endpoint
            }

            set({
                overview,
                lists,
                pagination: {
                    page: 1,
                    limit: get().filters.limit || 20,
                    total: lists.length,
                    hasMore: false,
                },
                isLoading: false,
            })
        } catch (error: any) {
            set({
                error: error.message || 'Failed to fetch lists overview',
                isLoading: false,
            })
        }
    },

    fetchLists: async (filters?: ListsFilters) => {
        set({ isLoading: true, error: null })
        try {
            const searchFilters = filters || get().filters
            const response = await listsApi.getLists(searchFilters)
            set({
                lists: response.data.lists,
                isLoading: false,
            })
        } catch (error: any) {
            set({
                error: error.message || 'Failed to fetch lists',
                isLoading: false,
            })
        }
    },

    fetchListById: async (listId: string) => {
        set({ isLoading: true, error: null })
        try {
            const response = await listsApi.getListById(listId)
            // Update the list in the lists array if it exists
            set((state) => ({
                lists: state.lists.map((list) =>
                    list.id === listId ? response.data.list : list
                ),
                isLoading: false,
            }))
        } catch (error: any) {
            set({
                error: error.message || 'Failed to fetch list',
                isLoading: false,
            })
        }
    },

    fetchListWithProducts: async (listId: string, sortBy?: 'date_added' | 'name_ar' | 'name_en') => {
        set({ isLoading: true, error: null })
        try {
            const response = await listsApi.getListWithProducts(listId, sortBy)
            set({
                currentList: response.data.list,
                isLoading: false,
            })
        } catch (error: any) {
            set({
                error: error.message || 'Failed to fetch list with products',
                isLoading: false,
            })
        }
    },

    createList: async (data: CreateListInput) => {
        set({ isLoading: true, error: null })
        try {
            const response = await listsApi.createList(data)
            set((state) => ({
                lists: [response.data.list, ...state.lists],
                isLoading: false,
            }))
            return response.data.list
        } catch (error: any) {
            set({
                error: error.message || 'Failed to create list',
                isLoading: false,
            })
            throw error
        }
    },

    updateList: async (listId: string, data: UpdateListInput) => {
        set({ isLoading: true, error: null })
        try {
            const response = await listsApi.updateList(listId, data)
            set((state) => ({
                lists: state.lists.map((list) =>
                    list.id === listId ? response.data.list : list
                ),
                currentList:
                    state.currentList?.id === listId
                        ? { ...state.currentList, ...response.data.list }
                        : state.currentList,
                isLoading: false,
            }))
            return response.data.list
        } catch (error: any) {
            set({
                error: error.message || 'Failed to update list',
                isLoading: false,
            })
            throw error
        }
    },

    deleteList: async (listId: string) => {
        set({ isLoading: true, error: null })
        try {
            await listsApi.deleteList(listId)
            set((state) => ({
                lists: state.lists.filter((list) => list.id !== listId),
                currentList: state.currentList?.id === listId ? null : state.currentList,
                isLoading: false,
            }))
        } catch (error: any) {
            set({
                error: error.message || 'Failed to delete list',
                isLoading: false,
            })
            throw error
        }
    },

    // ==================== Products ====================

    addProductToList: async (listId: string, productId: string, notes?: string) => {
        set({ isLoading: true, error: null })
        try {
            await listsApi.addProductToList(listId, { productId, notes })
            // Refresh the current list if it's the one being modified
            if (get().currentList?.id === listId) {
                await get().fetchListWithProducts(listId)
            }
            // Update product count in lists array
            set((state) => ({
                lists: state.lists.map((list) =>
                    list.id === listId
                        ? { ...list, productCount: list.productCount + 1 }
                        : list
                ),
                isLoading: false,
            }))
        } catch (error: any) {
            set({
                error: error.message || 'Failed to add product to list',
                isLoading: false,
            })
            throw error
        }
    },

    removeProductFromList: async (listId: string, productId: string) => {
        set({ isLoading: true, error: null })
        try {
            await listsApi.removeProductFromList(listId, productId)
            // Update current list if it's the one being modified
            if (get().currentList?.id === listId) {
                set((state) => ({
                    currentList: state.currentList
                        ? {
                            ...state.currentList,
                            items: state.currentList.items.filter(
                                (item) => item.productId !== productId
                            ),
                            productCount: state.currentList.productCount - 1,
                        }
                        : null,
                }))
            }
            // Update product count in lists array
            set((state) => ({
                lists: state.lists.map((list) =>
                    list.id === listId
                        ? { ...list, productCount: Math.max(0, list.productCount - 1) }
                        : list
                ),
                isLoading: false,
            }))
        } catch (error: any) {
            set({
                error: error.message || 'Failed to remove product from list',
                isLoading: false,
            })
            throw error
        }
    },

    updateProductNotes: async (listId: string, productId: string, notes: string) => {
        set({ isLoading: true, error: null })
        try {
            await listsApi.updateProductNotes(listId, productId, notes)
            // Update current list if it's the one being modified
            if (get().currentList?.id === listId) {
                set((state) => ({
                    currentList: state.currentList
                        ? {
                            ...state.currentList,
                            items: state.currentList.items.map((item) =>
                                item.productId === productId ? { ...item, notes } : item
                            ),
                        }
                        : null,
                }))
            }
            set({ isLoading: false })
        } catch (error: any) {
            set({
                error: error.message || 'Failed to update product notes',
                isLoading: false,
            })
            throw error
        }
    },

    // ==================== Sharing ====================

    fetchListMembers: async (listId: string) => {
        set({ isLoadingMembers: true, error: null })
        try {
            const response = await listsApi.getListMembers(listId)
            set({
                members: response.data.members,
                isLoadingMembers: false,
            })
        } catch (error: any) {
            set({
                error: error.message || 'Failed to fetch list members',
                isLoadingMembers: false,
            })
        }
    },

    fetchListInvitations: async (listId: string) => {
        set({ isLoadingInvitations: true, error: null })
        try {
            const response = await listsApi.getListInvitations(listId)
            set({
                invitations: response.data.invitations,
                isLoadingInvitations: false,
            })
        } catch (error: any) {
            set({
                error: error.message || 'Failed to fetch invitations',
                isLoadingInvitations: false,
            })
        }
    },

    shareList: async (listId: string, data: any) => {
        set({ isLoading: true, error: null })
        try {
            await listsApi.shareList(listId, data)
            // Refresh invitations
            await get().fetchListInvitations(listId)
            set({ isLoading: false })
        } catch (error: any) {
            set({
                error: error.message || 'Failed to share list',
                isLoading: false,
            })
            throw error
        }
    },

    removeMember: async (listId: string, memberId: string) => {
        set({ isLoading: true, error: null })
        try {
            await listsApi.removeMember(listId, memberId)
            set((state) => ({
                members: state.members.filter((member) => member.id !== memberId),
                isLoading: false,
            }))
        } catch (error: any) {
            set({
                error: error.message || 'Failed to remove member',
                isLoading: false,
            })
            throw error
        }
    },

    updateMemberRole: async (listId: string, memberId: string, role: 'editor' | 'viewer') => {
        set({ isLoading: true, error: null })
        try {
            await listsApi.updateMemberRole(listId, memberId, role)
            set((state) => ({
                members: state.members.map((member) =>
                    member.id === memberId ? { ...member, role } : member
                ),
                isLoading: false,
            }))
        } catch (error: any) {
            set({
                error: error.message || 'Failed to update member role',
                isLoading: false,
            })
            throw error
        }
    },

    cancelInvitation: async (invitationId: string) => {
        set({ isLoading: true, error: null })
        try {
            await listsApi.cancelInvitation(invitationId)
            set((state) => ({
                invitations: state.invitations.filter((inv) => inv.id !== invitationId),
                isLoading: false,
            }))
        } catch (error: any) {
            set({
                error: error.message || 'Failed to cancel invitation',
                isLoading: false,
            })
            throw error
        }
    },

    // ==================== Public Sharing ====================

    generatePublicLink: async (listId: string, role?: 'editor' | 'viewer') => {
        set({ isLoading: true, error: null })
        try {
            const response = await listsApi.generatePublicLink(listId, role ? { role } : undefined)
            // Update the list in the lists array
            set((state) => ({
                lists: state.lists.map((list) =>
                    list.id === listId
                        ? { ...list, shareEnabled: true, shareToken: response.data.shareToken }
                        : list
                ),
                currentList:
                    state.currentList?.id === listId
                        ? { ...state.currentList, shareEnabled: true, shareToken: response.data.shareToken }
                        : state.currentList,
                isLoading: false,
            }))
            return response.data
        } catch (error: any) {
            set({
                error: error.message || 'Failed to generate public link',
                isLoading: false,
            })
            throw error
        }
    },

    disablePublicSharing: async (listId: string) => {
        set({ isLoading: true, error: null })
        try {
            await listsApi.disablePublicSharing(listId)
            set((state) => ({
                lists: state.lists.map((list) =>
                    list.id === listId
                        ? { ...list, shareEnabled: false, shareToken: undefined }
                        : list
                ),
                currentList:
                    state.currentList?.id === listId
                        ? { ...state.currentList, shareEnabled: false, shareToken: undefined }
                        : state.currentList,
                isLoading: false,
            }))
        } catch (error: any) {
            set({
                error: error.message || 'Failed to disable public sharing',
                isLoading: false,
            })
            throw error
        }
    },

    fetchPublicLists: async (limit = 20, offset = 0) => {
        set({ isLoading: true, error: null })
        try {
            const response = await listsApi.getPublicLists(limit, offset)
            set({
                lists: response.data.lists,
                isLoading: false,
            })
        } catch (error: any) {
            set({
                error: error.message || 'Failed to fetch public lists',
                isLoading: false,
            })
        }
    },

    fetchListJoinRequests: async (listId: string) => {
        set({ isLoading: true, error: null })
        try {
            const response = await listsApi.getListJoinRequests(listId)
            set({
                joinRequests: response.data.requests,
                isLoading: false,
            })
        } catch (error: any) {
            set({
                error: error.message || 'Failed to fetch join requests',
                isLoading: false,
            })
        }
    },

    approveJoinRequest: async (listId: string, requestId: string) => {
        set({ isLoading: true, error: null })
        try {
            await listsApi.approveJoinRequest(listId, requestId)
            set((state) => ({
                joinRequests: state.joinRequests.filter((req) => req.id !== requestId),
                isLoading: false,
            }))
            // Refresh members
            await get().fetchListMembers(listId)
        } catch (error: any) {
            set({
                error: error.message || 'Failed to approve join request',
                isLoading: false,
            })
            throw error
        }
    },

    rejectJoinRequest: async (listId: string, requestId: string) => {
        set({ isLoading: true, error: null })
        try {
            await listsApi.rejectJoinRequest(listId, requestId)
            set((state) => ({
                joinRequests: state.joinRequests.filter((req) => req.id !== requestId),
                isLoading: false,
            }))
        } catch (error: any) {
            set({
                error: error.message || 'Failed to reject join request',
                isLoading: false,
            })
            throw error
        }
    },

    // ==================== Meta ====================

    fetchAvailableColors: async () => {
        try {
            const response = await listsApi.getAvailableColors()
            set({ colors: response.data.colors })
        } catch (error: any) {
            console.error('Failed to fetch available colors:', error)
        }
    },

    fetchAvailableIcons: async () => {
        try {
            const response = await listsApi.getAvailableIcons()
            set({ icons: response.data.icons })
        } catch (error: any) {
            console.error('Failed to fetch available icons:', error)
        }
    },

    // ==================== Utility ====================

    setFilters: (filters: Partial<ListsFilters>) => {
        set((state) => ({
            filters: { ...state.filters, ...filters },
        }))
    },

    clearFilters: () => {
        set({ filters: initialFilters })
    },

    clearError: () => {
        set({ error: null })
    },

    clearCurrentList: () => {
        set({ currentList: null })
    },
}))
