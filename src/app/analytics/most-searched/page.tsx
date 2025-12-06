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

export default function MostSearchedProductsPage() {
  const {
    mostSearchedProducts,
    searchedProductsPagination,
    currentPeriod,
    isLoadingMostSearched,
    error,
    fetchMostSearched,
    setPeriod,
  } = useAnalyticsStore()

  const [page, setPage] = useState(0)
  const limit = 50

  useEffect(() => {
    fetchMostSearched(limit, page * limit, currentPeriod)
  }, [fetchMostSearched, page, currentPeriod, limit])

  const handlePeriodChange = (period: AnalyticsPeriod) => {
    setPeriod(period)
    setPage(0)
    fetchMostSearched(limit, 0, period)
  }

  const handleRefresh = () => {
    fetchMostSearched(limit, page * limit, currentPeriod)
  }

  const handleNextPage = () => {
    if (searchedProductsPagination.hasMore) {
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

  const currentStart = page * limit + 1
  const currentEnd = Math.min((page + 1) * limit, searchedProductsPagination.total)

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
            <h1 className="text-3xl font-bold tracking-tight">Most Searched Products</h1>
            <p className="text-muted-foreground mt-1">
              Products ranked by total search count
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isLoadingMostSearched}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoadingMostSearched && 'animate-spin')} />
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
              disabled={isLoadingMostSearched}
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
                Most Searched Products
                {searchedProductsPagination.total > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({formatNumber(searchedProductsPagination.total)} total)
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Products ranked by search frequency
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingMostSearched && mostSearchedProducts.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : mostSearchedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No search data available</h3>
                  <p className="text-sm text-muted-foreground">
                    There are no search analytics for the selected period.
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Barcode</TableHead>
                        <TableHead className="text-right">Searches</TableHead>
                        <TableHead className="text-right">Views</TableHead>
                        <TableHead className="text-right">Popularity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mostSearchedProducts.map((product, index) => (
                        <TableRow key={product.productId}>
                          <TableCell className="font-medium text-muted-foreground">
                            {currentStart + index}
                          </TableCell>
                          <TableCell className="font-medium">
                            {product.nameEn || product.nameAr}
                          </TableCell>
                          <TableCell>{product.brandEn || product.brandAr}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{product.category}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {product.barcode}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatNumber(product.searchCount)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(product.viewCount)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(product.popularityScore)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {searchedProductsPagination.total > limit && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Showing {currentStart} to {currentEnd} of{' '}
                        {formatNumber(searchedProductsPagination.total)} products
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handlePrevPage}
                          disabled={page === 0 || isLoadingMostSearched}
                          variant="outline"
                          size="sm"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <Button
                          onClick={handleNextPage}
                          disabled={!searchedProductsPagination.hasMore || isLoadingMostSearched}
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
