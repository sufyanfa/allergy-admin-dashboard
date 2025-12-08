'use client'

import { useEffect } from 'react'
import { useAnalyticsStore } from '@/lib/stores/analytics-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RefreshCw, Search, TrendingUp, BarChart3, CheckCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AnalyticsPeriod } from '@/types'
import Link from 'next/link'
import { useTranslations } from '@/lib/hooks/use-translations'


interface AnalyticsOverviewProps {
  className?: string
}

export function AnalyticsOverview({ className }: AnalyticsOverviewProps) {
  const t = useTranslations('analytics')
  const tCommon = useTranslations('common')

  const {
    dashboardData,
    currentPeriod,
    isLoadingDashboard,
    error,
    fetchDashboard,
    refreshWithPeriod,
  } = useAnalyticsStore()

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const handlePeriodChange = async (period: AnalyticsPeriod) => {
    await refreshWithPeriod(period)
  }

  const handleRefresh = async () => {
    await fetchDashboard(currentPeriod)
  }

  const periodButtons: { label: string; value: AnalyticsPeriod }[] = [
    { label: 'Today', value: 'day' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'All Time', value: 'all' },
  ]

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const calculateSuccessRate = (found: number, total: number) => {
    if (total === 0) return 0
    return ((found / total) * 100).toFixed(1)
  }

  if (isLoadingDashboard && !dashboardData) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error && !dashboardData) {
    return (
      <div className={cn('space-y-6', className)}>
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={handleRefresh}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const summary = dashboardData?.summary

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('searchAnalytics')}
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isLoadingDashboard}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={cn('h-4 w-4 mr-2', isLoadingDashboard && 'animate-spin')} />
          {tCommon('refresh')}
        </Button>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2">
        {periodButtons.map((btn) => (
          <Button
            key={btn.value}
            onClick={() => handlePeriodChange(btn.value)}
            variant={currentPeriod === btn.value ? 'default' : 'outline'}
            size="sm"
            disabled={isLoadingDashboard}
          >
            {btn.label}
          </Button>
        ))}
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('totalSearches')}</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(summary.totalSearches)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatNumber(summary.uniqueSearchQueries)} unique queries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products Searched</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(summary.uniqueProductsSearched)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Unique products viewed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Search Types</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Barcode:</span>
                  <span className="font-semibold">{formatNumber(summary.barcodeSearches)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Text:</span>
                  <span className="font-semibold">{formatNumber(summary.textSearches)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Safety Results</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">Safe:</span>
                  <span className="font-semibold text-green-600">{formatNumber(summary.safeResults)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600">Unsafe:</span>
                  <span className="font-semibold text-red-600">{formatNumber(summary.unsafeResults)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Most Searched Products */}
      {dashboardData?.mostSearchedProducts && dashboardData.mostSearchedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('topSearches')}</CardTitle>
                <CardDescription>Top 10 products by search count</CardDescription>
              </div>
              <Link href="/analytics/most-searched">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Searches</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Popularity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.mostSearchedProducts.map((product) => (
                  <TableRow key={product.productId}>
                    <TableCell className="font-medium">
                      {product.nameEn || product.nameAr}
                    </TableCell>
                    <TableCell>{product.brandEn || product.brandAr}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(product.searchCount)}</TableCell>
                    <TableCell className="text-right">{formatNumber(product.viewCount)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatNumber(product.popularityScore)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Most Popular Products */}
      {dashboardData?.mostPopularProducts && dashboardData.mostPopularProducts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('popularProducts')}</CardTitle>
                <CardDescription>Top 10 products by popularity score</CardDescription>
              </div>
              <Link href="/analytics/most-popular">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Popularity</TableHead>
                  <TableHead className="text-right">Searches</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.mostPopularProducts.map((product) => (
                  <TableRow key={product.productId}>
                    <TableCell className="font-medium">
                      {product.nameEn || product.nameAr}
                    </TableCell>
                    <TableCell>{product.brandEn || product.brandAr}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatNumber(product.popularityScore)}
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(product.searchCount)}</TableCell>
                    <TableCell className="text-right">{formatNumber(product.viewCount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Top Search Queries */}
      {dashboardData?.topSearchQueries && dashboardData.topSearchQueries.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Search Queries</CardTitle>
                <CardDescription>Most frequently searched terms</CardDescription>
              </div>
              <Link href="/analytics/queries">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Query</TableHead>
                  <TableHead className="text-right">Total Searches</TableHead>
                  <TableHead className="text-right">Results Found</TableHead>
                  <TableHead className="text-right">No Results</TableHead>
                  <TableHead className="text-right">Success Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.topSearchQueries.map((query) => {
                  const successRate = calculateSuccessRate(
                    query.resultFoundCount,
                    query.searchCount
                  )
                  return (
                    <TableRow key={query.id}>
                      <TableCell className="font-medium">{query.query}</TableCell>
                      <TableCell className="text-right">{formatNumber(query.searchCount)}</TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatNumber(query.resultFoundCount)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {formatNumber(query.noResultCount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={parseFloat(successRate) > 70 ? 'default' : 'destructive'}
                        >
                          {successRate}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
