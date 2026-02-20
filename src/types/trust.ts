/**
 * Trust System Type Definitions
 * 
 * Types for the Trust & Voting Engine integration
 */

// Field Types
export type FieldType =
    | 'allergens'
    | 'ingredients_ar'
    | 'ingredients_en'
    | 'nutrition_facts'
    | 'product_name'
    | 'brand_info'
    | 'overall'

// Verification Status
export type VerificationStatus =
    | 'unverified'
    | 'community_verified'
    | 'expert_verified'
    | 'contested'
    | 'flagged'
    | 'under_review'

// User Ranks
export type UserRank =
    | 'explorer'
    | 'verifier'
    | 'guardian'
    | 'expert'
    | 'admin'

// Vote Types
export type VoteType =
    | 'approve'
    | 'reject'
    | 'flag'

// Trust Event Trigger Types
export type TrustEventTrigger =
    | 'vote_cast'
    | 'admin_override'
    | 'admin_freeze'
    | 'admin_unfreeze'
    | 'time_decay'
    | 'recalculation'

/**
 * Product Field Trust State
 */
export interface ProductFieldTrust {
    id: string
    productId: string
    fieldType: FieldType

    // Trust Aggregates
    positiveWeightSum: number
    negativeWeightSum: number
    trustScore: number

    // Vote Counts
    totalVotes: number
    approvalVotes: number
    rejectionVotes: number
    flagVotes: number

    // Aliases for compatibility
    approvalCount: number
    rejectionCount: number
    flagCount: number

    // Verification
    verificationStatus: VerificationStatus

    // Conflict Detection
    isContested: boolean
    oscillationCount: number

    // Admin Control
    isFrozen: boolean
    frozenBy?: string
    frozenReason?: string
    frozenAt?: string

    // Timestamps
    lastUpdatedAt: string
    lastVerifiedAt?: string
    createdAt: string
}

/**
 * User Trust Statistics
 */
export interface UserTrustStats {
    id: string
    userId: string

    // Trust Metrics
    trustScore: number
    rank: UserRank
    accuracyRate: number

    // Aliases for compatibility
    votingAccuracy: number
    trustWeight: number
    reputationScore: number

    // Vote Statistics
    totalVotesCast: number
    totalVotes: number // Alias
    validatedVotes: number
    correctVotes: number
    incorrectVotes: number

    // Activity Limits
    votesThisDay: number
    votesThisMonth: number

    // Abuse Detection
    suspiciousActivityScore: number

    // Timestamps
    lastVoteAt?: string
    createdAt: string
}

/**
 * Field Vote
 */
export interface FieldVote {
    id: string
    userId: string
    productId: string
    fieldType: FieldType
    voteType: VoteType

    // Weight
    originalWeight: number
    currentWeight: number

    // User Context
    userTrustSnapshot: number
    userRankSnapshot: UserRank

    // Documentation
    reason?: string
    evidenceUrl?: string

    // Timestamps
    createdAt: string
    updatedAt: string
    decayLastAppliedAt: string
}

/**
 * Trust Event Log Entry
 */
export interface TrustEvent {
    id: string
    productId: string
    fieldType: FieldType

    // State Change
    previousScore: number
    newScore: number
    previousStatus: VerificationStatus
    newStatus: VerificationStatus

    // Aliases for compatibility
    oldTrustScore: number | null
    newTrustScore: number | null
    eventType: string
    userId?: string | null
    userRank?: UserRank | null
    voteType?: VoteType | null
    reason?: string | null

    // Trigger
    triggerType: TrustEventTrigger
    actorId?: string
    voteId?: string

    // Metadata
    metadata?: Record<string, any>

    // Timestamp
    createdAt: string
}

/**
 * Admin Vote
 */
export interface AdminVote {
    id: string
    adminId: string
    productId: string
    fieldType: FieldType
    decision: VoteType
    weight: number

    // Documentation (MANDATORY)
    reason: string

    // Legal Review
    legalReviewRequired: boolean
    reviewedByLegal: boolean
    legalReviewNotes?: string
    legalReviewedAt?: string

    // Audit Trail
    ipAddress?: string
    userAgent?: string

    // Timestamps
    createdAt: string
}

/**
 * API Request Types
 */

export interface CastVoteRequest {
    productId: string
    fieldType: FieldType
    voteType: VoteType
    reason?: string
    evidenceUrl?: string
}

export interface AdminVoteRequest {
    productId: string
    fieldType: FieldType
    decision: VoteType
    reason: string
    legalReviewRequired?: boolean
}

export interface FreezeFieldRequest {
    productId: string
    fieldType: FieldType
    reason: string
}

export interface UnfreezeFieldRequest {
    productId: string
    fieldType: FieldType
    reason: string
}

/**
 * API Response Types
 */

export interface CastVoteResponse {
    success: boolean
    data: {
        voteId: string
        weight: number
        newTrustScore: number
        newStatus: VerificationStatus
    }
}

export interface AdminVoteResponse {
    success: boolean
    data: {
        adminVoteId: string
        fieldVoteId: string
        weight: number
        newTrustScore: number
        newStatus: VerificationStatus
        reason: string
        legalReviewRequired: boolean
        createdAt: string
    }
}

export interface ProductTrustResponse {
    success: boolean
    data: {
        productId: string
        fields: ProductFieldTrust[]
    }
}

export interface FieldTrustResponse {
    success: boolean
    data: ProductFieldTrust
}

export interface TrustHistoryResponse {
    success: boolean
    data: {
        productId: string
        fieldType: FieldType
        events: TrustEvent[]
    }
}

export interface UserTrustResponse {
    success: boolean
    data: UserTrustStats
}

/**
 * Dashboard-Specific Types
 */

export interface TrustOverviewStats {
    totalVotes: number
    averageTrustScore: number
    contestedFields: number
    frozenFields: number
    verifiedFields: number
    activeVoters: number
}

export interface TopContributor {
    userId: string
    userName: string
    rank: UserRank
    accuracyRate: number
    totalVotes: number
}

export interface TrustAnalytics {
    trustScoreTrend: Array<{ date: string; score: number }>
    voteVolumeTrend: Array<{ date: string; count: number }>
    rankDistribution: Array<{ rank: UserRank; count: number }>
    statusDistribution: Array<{ status: VerificationStatus; count: number }>
}

/**
 * Suspicious Activity Log Entry
 */
export type SuspiciousActivityType =
    | 'rapid_fire_votes'
    | 'brand_bias'
    | 'new_account_heavy'
    | 'vote_reversal_pattern'
    | 'coordinated_voting'
    | 'impossible_timing'
    | 'self_voting'
    | 'vote_manipulation'

export type SuspiciousActivityAction =
    | 'dismissed'
    | 'banned'
    | 'warned'
    | 'no_action'
    | 'monitoring'
    | 'pending_review'
    | 'auto_banned'

export interface SuspiciousActivity {
    id: string
    userId: string
    activityType: SuspiciousActivityType
    severityScore: number
    evidenceData: Record<string, any>
    detectionMethod: string | null
    resolved: boolean
    resolvedBy: string | null
    resolvedAt: string | null
    resolutionNotes: string | null
    actionTaken: string | null
    detectedAt: string
}

/**
 * Utility Types
 */

export interface TrustScoreColor {
    color: string
    label: string
}

export interface VerificationStatusConfig {
    label: string
    color: string
    icon: string
}

export interface UserRankConfig {
    label: string
    color: string
    icon: string
    minTrustScore: number
}
