import apiClient from './client'
import {
    ListsOverviewResponse,
    ListResponse,
    ListWithProductsResponse,
    ListMembersResponse,
    ListInvitationsResponse,
    ListJoinRequestsResponse,
    AvailableColorsResponse,
    AvailableIconsResponse,
    CreateListInput,
    UpdateListInput,
    AddProductToListInput,
    ShareListInput,
    GeneratePublicLinkInput,
    ListsFilters,
    ProductList,
} from '@/types/lists'

class ListsApi {
    private readonly basePath = '/lists'

    // ==================== List CRUD ====================

    /**
     * Get all lists (with optional filters)
     */
    async getLists(filters?: ListsFilters): Promise<{ success: boolean; data: { lists: ProductList[] } }> {
        const params = new URLSearchParams()
        if (filters?.search) params.append('search', filters.search)
        if (filters?.privacy) params.append('privacy', filters.privacy)
        if (filters?.userId) params.append('userId', filters.userId)
        if (filters?.isDefault !== undefined) params.append('isDefault', filters.isDefault.toString())
        if (filters?.shareEnabled !== undefined) params.append('shareEnabled', filters.shareEnabled.toString())
        if (filters?.limit) params.append('limit', filters.limit.toString())
        if (filters?.offset) params.append('offset', filters.offset.toString())

        return apiClient.get(`${this.basePath}?${params.toString()}`)
    }

    /**
     * Get a specific list by ID
     */
    async getListById(listId: string): Promise<ListResponse> {
        return apiClient.get<ListResponse>(`${this.basePath}/${listId}`)
    }

    /**
     * Get a list with all its products
     */
    async getListWithProducts(
        listId: string,
        sortBy?: 'date_added' | 'name_ar' | 'name_en'
    ): Promise<ListWithProductsResponse> {
        const params = sortBy ? `?sortBy=${sortBy}` : ''
        return apiClient.get<ListWithProductsResponse>(
            `${this.basePath}/${listId}/products${params}`
        )
    }

    /**
     * Create a new list
     */
    async createList(data: CreateListInput): Promise<ListResponse> {
        return apiClient.post<ListResponse>(this.basePath, data)
    }

    /**
     * Update a list
     */
    async updateList(listId: string, data: UpdateListInput): Promise<ListResponse> {
        return apiClient.put<ListResponse>(`${this.basePath}/${listId}`, data)
    }

    /**
     * Delete a list
     */
    async deleteList(listId: string): Promise<{ success: boolean; data: { message: string } }> {
        return apiClient.delete(`${this.basePath}/${listId}`)
    }

    // ==================== Product Management ====================

    /**
     * Add product to a list
     */
    async addProductToList(
        listId: string,
        data: AddProductToListInput
    ): Promise<{ success: boolean; data: { message: string } }> {
        return apiClient.post(`${this.basePath}/${listId}/products`, data)
    }

    /**
     * Remove product from a list
     */
    async removeProductFromList(
        listId: string,
        productId: string
    ): Promise<{ success: boolean; data: { message: string } }> {
        return apiClient.delete(`${this.basePath}/${listId}/products/${productId}`)
    }

    /**
     * Update product notes in a list
     */
    async updateProductNotes(
        listId: string,
        productId: string,
        notes: string
    ): Promise<{ success: boolean; data: { message: string } }> {
        return apiClient.patch(`${this.basePath}/${listId}/products/${productId}/notes`, {
            notes,
        })
    }

    /**
     * Check if product is in user's lists
     */
    async checkProductInLists(
        productId: string
    ): Promise<{ success: boolean; data: { lists: Array<{ id: string; name: string }> } }> {
        return apiClient.get(`${this.basePath}/check-product?productId=${productId}`)
    }

    // ==================== List Sharing ====================

    /**
     * Get list members
     */
    async getListMembers(listId: string): Promise<ListMembersResponse> {
        return apiClient.get<ListMembersResponse>(`${this.basePath}/${listId}/members`)
    }

    /**
     * Share a list with another user
     */
    async shareList(
        listId: string,
        data: ShareListInput
    ): Promise<{ success: boolean; data: { invitation: any } }> {
        return apiClient.post(`${this.basePath}/${listId}/share`, data)
    }

    /**
     * Get pending invitations for a list
     */
    async getListInvitations(listId: string): Promise<ListInvitationsResponse> {
        return apiClient.get<ListInvitationsResponse>(
            `${this.basePath}/${listId}/invitations`
        )
    }

    /**
     * Remove member from a list
     */
    async removeMember(
        listId: string,
        memberId: string
    ): Promise<{ success: boolean; data: { message: string } }> {
        return apiClient.delete(`${this.basePath}/${listId}/members/${memberId}`)
    }

    /**
     * Update member role
     */
    async updateMemberRole(
        listId: string,
        memberId: string,
        role: 'editor' | 'viewer'
    ): Promise<{ success: boolean; data: { message: string } }> {
        return apiClient.patch(`${this.basePath}/${listId}/members/${memberId}/role`, {
            role,
        })
    }

    /**
     * Cancel invitation
     */
    async cancelInvitation(
        invitationId: string
    ): Promise<{ success: boolean; data: { message: string } }> {
        return apiClient.delete(`${this.basePath}/invitations/${invitationId}`)
    }

    // ==================== Public Link Sharing ====================

    /**
     * Generate or regenerate public share link
     */
    async generatePublicLink(
        listId: string,
        data?: GeneratePublicLinkInput
    ): Promise<{ success: boolean; data: { shareToken: string; shareUrl: string } }> {
        return apiClient.post(`${this.basePath}/${listId}/public-link/generate`, data || {})
    }

    /**
     * Disable public sharing
     */
    async disablePublicSharing(
        listId: string
    ): Promise<{ success: boolean; data: { message: string } }> {
        return apiClient.post(`${this.basePath}/${listId}/public-link/disable`, {})
    }

    /**
     * Get list by share token (public endpoint)
     */
    async getListByShareToken(
        shareToken: string
    ): Promise<{ success: boolean; data: { list: ProductList } }> {
        return apiClient.get(`${this.basePath}/join/${shareToken}`)
    }

    /**
     * Get join requests for a list
     */
    async getListJoinRequests(listId: string): Promise<ListJoinRequestsResponse> {
        return apiClient.get<ListJoinRequestsResponse>(
            `${this.basePath}/${listId}/join-requests`
        )
    }

    /**
     * Approve join request
     */
    async approveJoinRequest(
        listId: string,
        requestId: string
    ): Promise<{ success: boolean; data: { message: string } }> {
        return apiClient.post(
            `${this.basePath}/${listId}/join-requests/${requestId}/approve`,
            {}
        )
    }

    /**
     * Reject join request
     */
    async rejectJoinRequest(
        listId: string,
        requestId: string
    ): Promise<{ success: boolean; data: { message: string } }> {
        return apiClient.post(
            `${this.basePath}/${listId}/join-requests/${requestId}/reject`,
            {}
        )
    }

    // ==================== Public Lists ====================

    /**
     * Get public lists
     */
    async getPublicLists(
        limit = 20,
        offset = 0
    ): Promise<{ success: boolean; data: { lists: ProductList[] } }> {
        return apiClient.get(`${this.basePath}/public?limit=${limit}&offset=${offset}`)
    }

    // ==================== Meta ====================

    /**
     * Get available colors
     */
    async getAvailableColors(): Promise<AvailableColorsResponse> {
        return apiClient.get<AvailableColorsResponse>(`${this.basePath}/meta/colors`)
    }

    /**
     * Get available icons
     */
    async getAvailableIcons(): Promise<AvailableIconsResponse> {
        return apiClient.get<AvailableIconsResponse>(`${this.basePath}/meta/icons`)
    }
}

export const listsApi = new ListsApi()
export default listsApi
