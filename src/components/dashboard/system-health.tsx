'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useSystemHealth } from '@/lib/stores/statistics-store'
import { cn } from '@/lib/utils'
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Database,
  Zap,
  TrendingUp
} from 'lucide-react'
import { useEffect, useRef, useCallback } from 'react'

interface SystemHealthProps {
  className?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export function SystemHealth({
  className,
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}: SystemHealthProps) {
  const { data: systemHealth, loading, fetch } = useSystemHealth()
  const initializedRef = useRef(false)

  // Stable callback to avoid interval recreation
  const fetchHealth = useCallback(() => {
    fetch()
  }, [fetch])

  useEffect(() => {
    // Initial fetch once
    if (!initializedRef.current) {
      initializedRef.current = true
      fetchHealth()
    }

    if (!autoRefresh) return

    // Pause polling when tab is hidden to save bandwidth
    let interval: ReturnType<typeof setInterval> | null = null

    const startPolling = () => {
      if (interval) clearInterval(interval)
      interval = setInterval(fetchHealth, refreshInterval)
    }

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchHealth() // Refresh immediately when tab becomes visible
        startPolling()
      } else {
        stopPolling()
      }
    }

    startPolling()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      stopPolling()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchHealth, autoRefresh, refreshInterval])

  const getStatusConfig = (status: 'healthy' | 'degraded' | 'critical') => {
    switch (status) {
      case 'healthy':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          badgeVariant: 'default' as const
        }
      case 'degraded':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          badgeVariant: 'secondary' as const
        }
      case 'critical':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          badgeVariant: 'destructive' as const
        }
      default:
        return {
          icon: AlertTriangle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          badgeVariant: 'outline' as const
        }
    }
  }

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / (24 * 60 * 60))
    const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((uptime % (60 * 60)) / 60)

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getProgressColor = (value: number, thresholds = { warning: 70, critical: 90 }) => {
    if (value >= thresholds.critical) return 'bg-red-500'
    if (value >= thresholds.warning) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (loading || !systemHealth) {
    return (
      <Card className={cn('', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-2 w-full bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const statusConfig = getStatusConfig(systemHealth.status)
  const StatusIcon = statusConfig.icon

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className={cn('h-5 w-5', statusConfig.color)} />
            System Health
          </div>
          <Badge
            variant={statusConfig.badgeVariant}
            className={cn(statusConfig.bgColor, statusConfig.borderColor)}
          >
            {systemHealth.status.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Uptime */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Uptime</span>
          </div>
          <span className="text-sm text-gray-900 font-mono">
            {formatUptime(systemHealth.uptime)}
          </span>
        </div>

        {/* Memory Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Memory Usage</span>
            </div>
            <span className="text-sm text-gray-900 font-mono">
              {systemHealth.memoryUsage.toFixed(1)}%
            </span>
          </div>
          <Progress
            value={systemHealth.memoryUsage}
            className="h-2"
            indicatorClassName={getProgressColor(systemHealth.memoryUsage)}
          />
        </div>

        {/* CPU Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">CPU Usage</span>
            </div>
            <span className="text-sm text-gray-900 font-mono">
              {systemHealth.cpuUsage.toFixed(1)}%
            </span>
          </div>
          <Progress
            value={systemHealth.cpuUsage}
            className="h-2"
            indicatorClassName={getProgressColor(systemHealth.cpuUsage)}
          />
        </div>

        {/* Cache Hit Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Cache Hit Rate</span>
            </div>
            <span className="text-sm text-gray-900 font-mono">
              {systemHealth.cacheHitRate.toFixed(1)}%
            </span>
          </div>
          <Progress
            value={systemHealth.cacheHitRate}
            className="h-2"
            indicatorClassName="bg-blue-500"
          />
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="text-sm text-gray-500">Avg Response</div>
            <div className="text-lg font-semibold text-gray-900">
              {systemHealth.avgResponseTime}ms
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Error Rate</div>
            <div className="text-lg font-semibold text-gray-900">
              {(systemHealth.errorRate * 100).toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-gray-400 text-center pt-2">
          Last updated: {new Date(systemHealth.lastUpdated).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  )
}