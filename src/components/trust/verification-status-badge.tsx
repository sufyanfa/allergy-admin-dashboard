/**
 * Verification Status Badge Component
 * 
 * Displays verification status with appropriate styling and icon
 */

import { CheckCircle2, AlertCircle, Flag, Clock, XCircle, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VerificationStatus } from '@/types/trust'

interface VerificationStatusBadgeProps {
    status: VerificationStatus
    size?: 'sm' | 'md' | 'lg'
    showIcon?: boolean
    className?: string
}

const statusConfig: Record<
    VerificationStatus,
    {
        label: string
        color: string
        icon: typeof CheckCircle2
    }
> = {
    unverified: {
        label: 'Unverified',
        color: 'text-gray-600 bg-gray-50 border-gray-200',
        icon: Clock,
    },
    community_verified: {
        label: 'Community Verified',
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        icon: CheckCircle2,
    },
    expert_verified: {
        label: 'Expert Verified',
        color: 'text-green-600 bg-green-50 border-green-200',
        icon: Shield,
    },
    contested: {
        label: 'Contested',
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        icon: AlertCircle,
    },
    flagged: {
        label: 'Flagged',
        color: 'text-red-600 bg-red-50 border-red-200',
        icon: Flag,
    },
    under_review: {
        label: 'Under Review',
        color: 'text-purple-600 bg-purple-50 border-purple-200',
        icon: XCircle,
    },
}

export function VerificationStatusBadge({
    status,
    size = 'md',
    showIcon = true,
    className,
}: VerificationStatusBadgeProps) {
    const config = statusConfig[status]
    const Icon = config.icon

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5',
    }

    const iconSizes = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
    }

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border font-medium',
                config.color,
                sizeClasses[size],
                className
            )}
        >
            {showIcon && <Icon className={iconSizes[size]} />}
            <span>{config.label}</span>
        </span>
    )
}
