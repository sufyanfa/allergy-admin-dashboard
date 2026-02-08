'use client'

import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Package,
  List,
  Share2,
  Activity,
  Server,
  ShieldCheck,
  Grid3X3,
  Database,
} from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
    period?: string
  }
  icon?: 'users' | 'package' | 'list' | 'share-2' | 'activity' | 'server' | 'shield-check' | 'grid-3x3' | 'database'
  description?: string
  className?: string
  loading?: boolean
}

const iconMap = {
  users: Users,
  package: Package,
  list: List,
  'share-2': Share2,
  activity: Activity,
  server: Server,
  'shield-check': ShieldCheck,
  'grid-3x3': Grid3X3,
  database: Database,
}

export const StatsCard = memo(function StatsCard({
  title,
  value,
  change,
  icon,
  description,
  className,
  loading = false
}: StatsCardProps) {
  const Icon = icon ? iconMap[icon] : null

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + 'M'
      }
      if (val >= 1000) {
        return (val / 1000).toFixed(1) + 'K'
      }
      return val.toLocaleString()
    }
    return val
  }

  const getTrendIcon = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return <TrendingUp className="h-4 w-4" />
      case 'decrease':
        return <TrendingDown className="h-4 w-4" />
      default:
        return <Minus className="h-4 w-4" />
    }
  }

  const getTrendColor = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'decrease':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <Card className={cn('', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </CardTitle>
          {Icon && (
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-gray-500" />
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-gray-900">
            {formatValue(value)}
          </div>

          <div className="flex items-center space-x-2">
            {change && (
              <Badge
                variant="outline"
                className={cn(
                  'text-xs font-medium flex items-center gap-1',
                  getTrendColor(change.type)
                )}
              >
                {getTrendIcon(change.type)}
                {Math.abs(change.value)}%
              </Badge>
            )}

            {(description || change?.period) && (
              <p className="text-xs text-gray-500">
                {change?.period && `${change.period} • `}
                {description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
})