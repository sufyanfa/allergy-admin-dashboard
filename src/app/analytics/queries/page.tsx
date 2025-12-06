'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
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
import { RefreshCw, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AnalyticsPeriod } from '@/types'
import Link from 'next/link'

export default function SearchQueriesPage() {
  const {
    topQueries,
    queriesPagination,
    currentPeriod,
    isLoadingTopQueries,
    error,
    fetchTopQueries,
    setPeriod,
  } = useAnalyticsStore()

  const [page, setPage] = useState(0)
  const limit = 50

  useEffect(() => {
    fetchTopQueries(limit, page * limit, currentPeriod)
  }, [fetchTopQueries, page, currentPeriod, limit])

  const handlePeriodChange = (period: AnalyticsPeriod) => {
    setPeriod(period)
    setPage(0)
    fetchTopQueries(limit, 0, period)
  }

  const handleRefresh = () => {
    fetchTopQueries(limit, page * limit, currentPeriod)
  }

  const handleNextPage = () => {
    if (queriesPagination.hasMore) {
      setPage(page + 1)
    }
  }

  const handlePrevPage = () => {
    if (page > 0) {
      setPage(page - 1)
    }
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

  const getSuccessRateBadgeVariant = (rate: string) => {
    const numRate = parseFloat(rate)
    if (numRate >= 80) return 'default'
    if (numRate >= 50) return 'secondary'
    return 'destructive'
  }

  const currentStart = page * limit + 1
  const currentEnd = Math.min((page + 1) * limit, queriesPagination.total)

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/analytics">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Search Queries</h1>
            <p className="text-muted-foreground mt-1">
              Most frequently searched terms and their success rates
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isLoadingTopQueries}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoadingTopQueries && 'animate-spin')} />
            Refresh
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
              disabled={isLoadingTopQueries}
            >
              {btn.label}
            </Button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={handleRefresh}>Try Again</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        {!error && (
          <Card>
            <CardHeader>
              <CardTitle>
                Top Search Queries
                {queriesPagination.total > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({formatNumber(queriesPagination.total)} total)
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Most frequently searched terms and their success rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTopQueries && topQueries.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : topQueries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No search queries available</h3>
                  <p className="text-sm text-muted-foreground">
                    There are no search query analytics for the selected period.
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Search Query</TableHead>
                        <TableHead className="text-right">Total Searches</TableHead>
                        <TableHead className="text-right">Found Results</TableHead>
                        <TableHead className="text-right">No Results</TableHead>
                        <TableHead className="text-right">Success Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topQueries.map((query, index) => {
                        const successRate = calculateSuccessRate(
                          query.resultFoundCount,
                          query.searchCount
                        )
                        return (
                          <TableRow key={query.id}>
                            <TableCell className="font-medium text-muted-foreground">
                              {currentStart + index}
                            </TableCell>
                            <TableCell className="font-medium max-w-md">
                              <div className="flex items-center gap-2">
                                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="truncate">{query.query}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatNumber(query.searchCount)}
                            </TableCell>
                            <TableCell className="text-right text-green-600">
                              {formatNumber(query.resultFoundCount)}
                            </TableCell>
                            <TableCell className="text-right text-red-600">
                              {formatNumber(query.noResultCount)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant={getSuccessRateBadgeVariant(successRate)}>
                                {successRate}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">Total Queries</div>
                      <div className="text-2xl font-bold">
                        {formatNumber(queriesPagination.total)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">Total Searches</div>
                      <div className="text-2xl font-bold">
                        {formatNumber(
                          topQueries.reduce((sum, q) => sum + q.searchCount, 0)
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">Avg Success Rate</div>
                      <div className="text-2xl font-bold">
                        {topQueries.length > 0
                          ? (
                              topQueries.reduce(
                                (sum, q) =>
                                  sum +
                                  parseFloat(
                                    calculateSuccessRate(q.resultFoundCount, q.searchCount)
                                  ),
                                0
                              ) / topQueries.length
                            ).toFixed(1)
                          : 0}
                        %
                      </div>
                    </div>
                  </div>

                  {/* Pagination */}
                  {queriesPagination.total > limit && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Showing {currentStart} to {currentEnd} of{' '}
                        {formatNumber(queriesPagination.total)} queries
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handlePrevPage}
                          disabled={page === 0 || isLoadingTopQueries}
                          variant="outline"
                          size="sm"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <Button
                          onClick={handleNextPage}
                          disabled={!queriesPagination.hasMore || isLoadingTopQueries}
                          variant="outline"
                          size="sm"
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
