/**
 * Trust Score Badge Component
 * 
 * Displays a trust score with color-coded styling
 */

import { cn } from '@/lib/utils'

interface TrustScoreBadgeProps {
    score: number
    size?: 'sm' | 'md' | 'lg'
    showLabel?: boolean
    className?: string
}

export function TrustScoreBadge({
    score,
    size = 'md',
    showLabel = false,
    className,
}: TrustScoreBadgeProps) {
    // Determine color based on score
    const getScoreColor = (score: number) => {
        if (score >= 75) return 'text-green-600 bg-green-50 border-green-200'
        if (score >= 50) return 'text-blue-600 bg-blue-50 border-blue-200'
        if (score >= 25) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
        if (score >= 0) return 'text-orange-600 bg-orange-50 border-orange-200'
        return 'text-red-600 bg-red-50 border-red-200'
    }

    const getScoreLabel = (score: number) => {
        if (score >= 75) return 'Excellent'
        if (score >= 50) return 'Good'
        if (score >= 25) return 'Fair'
        if (score >= 0) return 'Poor'
        return 'Very Poor'
    }

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5',
    }

    return (
        <div className="inline-flex items-center gap-2">
            <span
                className={cn(
                    'inline-flex items-center gap-1 rounded-full border font-medium',
                    getScoreColor(score),
                    sizeClasses[size],
                    className
                )}
            >
                <span className="font-semibold">{score.toFixed(1)}</span>
                {showLabel && (
                    <>
                        <span className="text-muted-foreground">•</span>
                        <span>{getScoreLabel(score)}</span>
                    </>
                )}
            </span>
        </div>
    )
}
