// List Types based on backend schema

export type ListPrivacy = 'private' | 'public'
export type ListSortBy = 'date_added' | 'name_ar' | 'name_en' | 'safety_level'
export type ListMemberRole = 'owner' | 'editor' | 'viewer'
export type ListInvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired'
export type ListJoinRequestStatus = 'pending' | 'approved' | 'rejected'

// Product List
export interface ProductList {
    id: string
    userId: string
    nameAr: string
    nameEn: string
    descriptionAr?: string
    descriptionEn?: string
    color: string
    icon?: string
    privacy: ListPrivacy
    isDefault: boolean
    sortBy: ListSortBy
    productCount: number
    shareToken?: string
    shareEnabled: boolean
    shareRole?: ListMemberRole
    createdAt: string
    updatedAt: string
    // Relations
    user?: {
        id: string
        fullName?: string
        email?: string
    }
}

// Product List Item
export interface ProductListItem {
    id: string
    listId: string
    productId: string
    notes?: string
    orderIndex: number
    addedAt: string
    // Relations
    product?: {
        id: string
        barcode: string
        nameAr: string
        nameEn?: string
        brandAr: string
        brandEn?: string
        category: string
        imageUrl?: string
    }
}

// List Member
export interface ListMember {
    id: string
    listId: string
    userId: string
    role: ListMemberRole
    addedBy: string
    joinedAt: string
    createdAt: string
    updatedAt: string
    // Relations
    user?: {
        id: string
        fullName?: string
        email?: string
        avatarUrl?: string
    }
}

// List Invitation
export interface ListInvitation {
    id: string
    listId: string
    invitedUserId?: string
    invitedEmail?: string
    invitedPhone?: string
    invitedBy: string
    role: ListMemberRole
    status: ListInvitationStatus
    token: string
    message?: string
    expiresAt: string
    acceptedAt?: string
    rejectedAt?: string
    createdAt: string
    updatedAt: string
    // Relations
    list?: {
        id: string
        nameAr: string
        nameEn: string
    }
    inviter?: {
        id: string
        fullName?: string
        email?: string
    }
}

// List Join Request
export interface ListJoinRequest {
    id: string
    listId: string
    userId: string
    status: ListJoinRequestStatus
    message?: string
    respondedBy?: string
    respondedAt?: string
    createdAt: string
    updatedAt: string
    // Relations
    list?: {
        id: string
        nameAr: string
        nameEn: string
    }
    user?: {
        id: string
        fullName?: string
        email?: string
        avatarUrl?: string
    }
}

// API Request/Response Types

export interface CreateListInput {
    nameAr: string
    nameEn: string
    descriptionAr?: string
    descriptionEn?: string
    color?: string
    icon?: string
    privacy?: ListPrivacy
    sortBy?: ListSortBy
}

export interface UpdateListInput {
    nameAr?: string
    nameEn?: string
    descriptionAr?: string
    descriptionEn?: string
    color?: string
    icon?: string
    privacy?: ListPrivacy
    sortBy?: ListSortBy
}

export interface AddProductToListInput {
    productId: string
    notes?: string
}

export interface ShareListInput {
    invitedUserId?: string
    invitedEmail?: string
    invitedPhone?: string
    role?: 'editor' | 'viewer'
    message?: string
}

export interface GeneratePublicLinkInput {
    role?: 'editor' | 'viewer'
}

export interface ListWithProducts extends ProductList {
    items: ProductListItem[]
}

// Overview & Statistics
export interface ListsOverview {
    totalLists: number
    publicLists: number
    privateLists: number
    sharedLists: number
    totalProducts: number
    activeUsers: number
    pendingInvitations: number
    pendingJoinRequests: number
}

export interface ListStatistics {
    listId: string
    productCount: number
    memberCount: number
    invitationCount: number
    joinRequestCount: number
    viewCount?: number
    lastActivityAt: string
}

// Filters
export interface ListsFilters {
    search?: string
    privacy?: ListPrivacy
    userId?: string
    isDefault?: boolean
    shareEnabled?: boolean
    limit?: number
    offset?: number
}

// API Responses
export interface ListsOverviewResponse {
    success: boolean
    data: {
        overview: ListsOverview
        lists: ProductList[]
        pagination: {
            total: number
            limit: number
            offset: number
            pages: number
            hasMore: boolean
        }
    }
}

export interface ListResponse {
    success: boolean
    data: {
        list: ProductList
    }
}

export interface ListWithProductsResponse {
    success: boolean
    data: {
        list: ListWithProducts
    }
}

export interface ListMembersResponse {
    success: boolean
    data: {
        members: ListMember[]
        owner: {
            id: string
            fullName?: string
            email?: string
            avatarUrl?: string
        }
    }
}

export interface ListInvitationsResponse {
    success: boolean
    data: {
        invitations: ListInvitation[]
    }
}

export interface ListJoinRequestsResponse {
    success: boolean
    data: {
        requests: ListJoinRequest[]
    }
}

export interface AvailableColorsResponse {
    success: boolean
    data: {
        colors: Array<{
            name: string
            value: string
            category: string
        }>
    }
}

export interface AvailableIconsResponse {
    success: boolean
    data: {
        icons: string[]
    }
}
