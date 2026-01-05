// Group Types based on backend schema

export interface Group {
    id: string
    nameAr: string
    nameEn: string
    descriptionAr?: string | null
    descriptionEn?: string | null
    coverPhotoUrl?: string | null
    postCount: number
    participantCount: number
    severity?: 'mild' | 'moderate' | 'severe' | null
}

export interface GroupPost {
    id: string
    allergyId: string
    userId: string
    title: string
    content: string
    imageUrl?: string | null
    commentCount: number
    helpfulCount: number
    notHelpfulCount: number
    isPinned: boolean
    createdAt: string
    updatedAt: string
    authorName?: string | null
    authorUsername?: string | null
    authorAvatar?: string | null
    userReaction?: boolean | null
}

export interface GroupsFilters {
    search?: string
    limit?: number
    page?: number
}

export interface CreateGroupInput {
    nameAr: string
    nameEn: string
    descriptionAr?: string
    descriptionEn?: string
    coverPhotoUrl?: string
}
