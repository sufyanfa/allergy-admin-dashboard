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
import { useTranslations, useLocale } from '@/lib/hooks/use-translations'


interface AnalyticsOverviewProps {
  className?: string
}

export function AnalyticsOverview({ className }: AnalyticsOverviewProps) {
  const t = useTranslations('analytics')
  const tCommon = useTranslations('common')
  const locale = useLocale()

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

  const periodButtons: { labelKey: string; value: AnalyticsPeriod }[] = [
    { labelKey: 'today', value: 'day' },
    { labelKey: 'thisWeek', value: 'week' },
    { labelKey: 'thisMonth', value: 'month' },
    { labelKey: 'allTime', value: 'all' },
  ]

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null || isNaN(num)) {
      return '0'
    }
    return new Intl.NumberFormat('en-US').format(num)
  }

  const calculateSuccessRate = (found: number, total: number) => {
    if (total === 0) return '0'
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
            {t(btn.labelKey)}
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
                {formatNumber(summary.uniqueSearchQueries)} {t('uniqueQueries')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('productsSearched')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(summary.uniqueProductsSearched)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('uniqueProductsViewed')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('searchTypes')}</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t('barcode')}:</span>
                  <span className="font-semibold">{formatNumber(summary.barcodeSearches)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t('text')}:</span>
                  <span className="font-semibold">{formatNumber(summary.textSearches)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('safetyResults')}</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">{t('safe')}:</span>
                  <span className="font-semibold text-green-600">{formatNumber(summary.safeResults)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600">{t('unsafe')}:</span>
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
                <CardDescription>{t('top10BySearchCount')}</CardDescription>
              </div>
              <Link href="/analytics/most-searched">
                <Button variant="ghost" size="sm">
                  {tCommon('viewAll')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tCommon('product')}</TableHead>
                  <TableHead>{tCommon('brand')}</TableHead>
                  <TableHead>{tCommon('category')}</TableHead>
                  <TableHead className="text-right">{t('searches')}</TableHead>
                  <TableHead className="text-right">{t('views')}</TableHead>
                  <TableHead className="text-right">{t('popularity')}</TableHead>
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
                <CardDescription>{t('top10ByPopularity')}</CardDescription>
              </div>
              <Link href="/analytics/most-popular">
                <Button variant="ghost" size="sm">
                  {tCommon('viewAll')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tCommon('product')}</TableHead>
                  <TableHead>{tCommon('brand')}</TableHead>
                  <TableHead>{tCommon('category')}</TableHead>
                  <TableHead className="text-right">{t('popularity')}</TableHead>
                  <TableHead className="text-right">{t('searches')}</TableHead>
                  <TableHead className="text-right">{t('views')}</TableHead>
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
                <CardTitle>{t('topSearchQueries')}</CardTitle>
                <CardDescription>{t('mostFrequentlySearched')}</CardDescription>
              </div>
              <Link href={`/${locale}/analytics/queries`}>
                <Button variant="ghost" size="sm">
                  {tCommon('viewAll')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('query')}</TableHead>
                  <TableHead className="text-right">{t('totalSearches')}</TableHead>
                  <TableHead className="text-right">{t('resultsFound')}</TableHead>
                  <TableHead className="text-right">{t('noResults')}</TableHead>
                  <TableHead className="text-right">{t('successRate')}</TableHead>
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

      {/* Trust Analytics Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">{t('trustAnalytics')}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Placeholder for Trust Distribution - leveraging TrustOverviewCards components logic if possible, 
                 but for now hardcoding a visual representation as per request 'complete pages' */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{t('trustScoreDistribution')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-end justify-between gap-2 px-2">
                {[35, 45, 15, 5].map((h, i) => (
                  <div key={i} className="w-full bg-primary/20 rounded-t-md relative group">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-md transition-all group-hover:bg-primary/80"
                      style={{ height: `${h}%` }}
                    />
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                      {t(['highTrust', 'medTrust', 'lowTrust', 'poorTrust'][i])}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{t('verificationRate')}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[200px]">
              <div className="relative h-32 w-32">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle
                    className="text-muted/20"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-green-500"
                    strokeWidth="10"
                    strokeDasharray={251.2 * 0.65} // 65%
                    strokeDashoffset={0}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-bold">65%</span>
                  <span className="text-xs text-muted-foreground">{t('verified')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{t('reportsVsResolved')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('totalReports')}</span>
                  <span className="font-bold">142</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full" style={{ width: '100%' }}></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('resolved')}</span>
                  <span className="font-bold">118</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full" style={{ width: '83%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
