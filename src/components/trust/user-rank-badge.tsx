/**
 * User Rank Badge Component
 * 
 * Displays user rank with appropriate styling and icon
 */

import { Compass, CheckSquare, Shield, Award, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRank } from '@/types/trust'

interface UserRankBadgeProps {
    rank: UserRank
    size?: 'sm' | 'md' | 'lg'
    showIcon?: boolean
    className?: string
}

const rankConfig: Record<
    UserRank,
    {
        label: string
        color: string
        icon: typeof Compass
    }
> = {
    explorer: {
        label: 'Explorer',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        icon: Compass,
    },
    verifier: {
        label: 'Verifier',
        color: 'text-gray-700 bg-gray-50 border-gray-300',
        icon: CheckSquare,
    },
    guardian: {
        label: 'Guardian',
        color: 'text-yellow-700 bg-yellow-50 border-yellow-300',
        icon: Shield,
    },
    expert: {
        label: 'Expert',
        color: 'text-blue-700 bg-blue-50 border-blue-300',
        icon: Award,
    },
    admin: {
        label: 'Admin',
        color: 'text-purple-700 bg-purple-50 border-purple-300',
        icon: Crown,
    },
}

export function UserRankBadge({
    rank,
    size = 'md',
    showIcon = true,
    className,
}: UserRankBadgeProps) {
    const config = rankConfig[rank]
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
                'inline-flex items-center gap-1.5 rounded-full border font-semibold',
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
