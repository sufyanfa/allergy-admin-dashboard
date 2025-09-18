'use client'

import { useRef } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, PieChart } from 'lucide-react'
import { cn } from '@/lib/utils'

ChartJS.register(ArcElement, Tooltip, Legend)

interface DistributionItem {
  label: string
  value: number
  percentage: number
  color?: string
}

interface DistributionChartProps {
  title: string
  data: DistributionItem[] | null
  loading?: boolean
  onRefresh?: () => void
  className?: string
  showLegend?: boolean
  centerText?: {
    primary: string
    secondary: string
  }
}

const DEFAULT_COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
  '#F97316', // orange-500
  '#EC4899', // pink-500
  '#6B7280', // gray-500
]

export function DistributionChart({
  title,
  data,
  loading = false,
  onRefresh,
  className,
  showLegend = true,
  centerText
}: DistributionChartProps) {
  const chartRef = useRef<ChartJS<'doughnut'>>(null)

  const chartData: ChartData<'doughnut'> = data ? {
    labels: data.map(item => item.label),
    datasets: [{
      data: data.map(item => item.value),
      backgroundColor: data.map((item, index) =>
        item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
      ),
      borderColor: data.map((item, index) =>
        item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
      ),
      borderWidth: 2,
      hoverBorderWidth: 3,
      hoverBorderColor: '#ffffff',
    }]
  } : {
    labels: [],
    datasets: []
  }

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: centerText ? '70%' : '50%',
    plugins: {
      legend: {
        display: showLegend,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 16,
          font: {
            size: 12
          },
          generateLabels: function(chart) {
            const data = chart.data
            if (data.labels?.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0]
                const value = dataset.data[i] as number
                const total = dataset.data.reduce((a, b) => (a as number) + (b as number), 0) as number
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'

                // Safely access backgroundColor and borderColor arrays
                const backgroundColor = Array.isArray(dataset.backgroundColor)
                  ? dataset.backgroundColor[i] as string
                  : dataset.backgroundColor as string || '#000000'

                const borderColor = Array.isArray(dataset.borderColor)
                  ? dataset.borderColor[i] as string
                  : dataset.borderColor as string || '#000000'

                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: backgroundColor,
                  strokeStyle: borderColor,
                  lineWidth: 2,
                  pointStyle: 'circle' as const,
                  hidden: false,
                  index: i
                }
              })
            }
            return []
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
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => (a as number) + (b as number), 0) as number
            const percentage = ((context.parsed / total) * 100).toFixed(1)
            return `${context.label}: ${context.parsed.toLocaleString()} (${percentage}%)`
          }
        }
      }
    },
    onHover: (event, activeElements) => {
      if (event.native?.target) {
        (event.native.target as HTMLElement).style.cursor = activeElements.length > 0 ? 'pointer' : 'default'
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
            {onRefresh && (
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
            )}
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

  if (!data || data.length === 0) {
    return (
      <Card className={cn('', className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-gray-400" />
              {title}
            </CardTitle>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            No data available
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
            <PieChart className="h-5 w-5 text-blue-600" />
            {title}
          </CardTitle>

          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-64 relative">
          <Doughnut ref={chartRef} data={chartData} options={options} />

          {centerText && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-2xl font-bold text-gray-900">
                {centerText.primary}
              </div>
              <div className="text-sm text-gray-500">
                {centerText.secondary}
              </div>
            </div>
          )}
        </div>

        {/* Statistics Summary */}
        {data.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Total Items</div>
                <div className="font-semibold text-gray-900">
                  {data.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Categories</div>
                <div className="font-semibold text-gray-900">
                  {data.length}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}