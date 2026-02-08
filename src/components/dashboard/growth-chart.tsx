'use client'

import { useRef, memo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { RefreshCw, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GrowthData } from '@/types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface GrowthChartProps {
  title: string
  data: GrowthData | null
  loading?: boolean
  onPeriodChange?: (period: 'daily' | 'weekly' | 'monthly') => void
  onRefresh?: () => void
  className?: string
  showCumulative?: boolean
}

export const GrowthChart = memo(function GrowthChart({
  title,
  data,
  loading = false,
  onPeriodChange,
  onRefresh,
  className,
  showCumulative = true
}: GrowthChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null)

  const formatDate = (dateString: string, period: 'daily' | 'weekly' | 'monthly') => {
    const date = new Date(dateString)
    switch (period) {
      case 'daily':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      case 'weekly':
        return `Week ${Math.ceil(date.getDate() / 7)}`
      case 'monthly':
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      default:
        return date.toLocaleDateString()
    }
  }

  const chartData: ChartData<'line'> = data ? {
    labels: data.data.map(item => formatDate(item.date, data.period)),
    datasets: [
      {
        label: 'New',
        data: data.data.map(item => item.value),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      ...(showCumulative ? [{
        label: 'Cumulative',
        data: data.data.map(item => item.cumulative),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: 'rgb(16, 185, 129)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderDash: [5, 5],
      }] : [])
    ]
  } : {
    labels: [],
    datasets: []
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        border: {
          display: false
        },
        ticks: {
          callback: function(value) {
            if (typeof value === 'number') {
              if (value >= 1000000) {
                return (value / 1000000).toFixed(1) + 'M'
              }
              if (value >= 1000) {
                return (value / 1000).toFixed(1) + 'K'
              }
              return value.toString()
            }
            return value
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          padding: 16,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const value = typeof context.parsed.y === 'number' ? context.parsed.y.toLocaleString() : context.parsed.y
            return `${context.dataset.label}: ${value}`
          }
        }
      }
    }
  }

  if (loading) {
    return (
      <Card className={cn('', className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            {title}
          </CardTitle>

          <div className="flex items-center gap-2">
            {onPeriodChange && (
              <Select onValueChange={onPeriodChange} defaultValue={data?.period || 'daily'}>
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            )}

            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {data && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Total Growth</div>
              <div className={cn(
                'font-semibold',
                data.totalGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {data.totalGrowth >= 0 ? '+' : ''}
                {data.totalGrowth.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-gray-500">Period Growth</div>
              <div className="font-semibold text-gray-900">
                {data.periodGrowth >= 0 ? '+' : ''}
                {data.periodGrowth.toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="h-64">
          <Line ref={chartRef} data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
})