'use client'

import { useEffect, useState } from 'react'
import { useProductsStore } from '@/lib/stores/products-store'
import { StatsCard } from '../dashboard/stats-card'
import { DistributionChart } from '../dashboard/distribution-chart'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { RefreshCw, Download, Search, Filter, Plus, ScanLine } from 'lucide-react'
import { ProductsTable } from '@/components/tables/products-table'
import { ProductForm } from '@/components/forms/product-form'
import { BarcodeScanner } from '@/components/forms/barcode-scanner'
import { ProductFilters } from '@/components/forms/product-filters'
import { cn } from '@/lib/utils'

interface ProductsOverviewProps {
  className?: string
}

export function ProductsOverview({ className }: ProductsOverviewProps) {
  const {
    products,
    categories,
    searchResults,
    isLoading,
    error,
    filters,
    pagination,
    overview,
    fetchProductsOverview,
    fetchProducts,
    searchProducts,
    searchIntegrated,
    setFilters,
    clearFilters,
    clearError
  } = useProductsStore()

  const [showForm, setShowForm] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Initial data fetch - fetch overview which includes products
    fetchProductsOverview()
  }, [])

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        await searchIntegrated(searchQuery.trim())
      } catch (error) {
        console.error('Search failed:', error)
      }
    } else {
      await fetchProductsOverview()
    }
  }

  const handleFilterSearch = async () => {
    try {
      await searchProducts(filters)
    } catch (error) {
      console.error('Filter search failed:', error)
    }
  }

  const handleRefresh = async () => {
    try {
      if (searchQuery.trim()) {
        await searchIntegrated(searchQuery.trim())
      } else {
        await fetchProductsOverview()
      }
    } catch (error) {
      console.error('Refresh failed:', error)
    }
  }

  const handleExport = () => {
    const csvData = products.map(product => ({
      id: product.id,
      barcode: product.barcode,
      nameAr: product.nameAr,
      nameEn: product.nameEn || '',
      brandAr: product.brandAr,
      brandEn: product.brandEn || '',
      category: product.category,
      dataSource: product.dataSource,
      verified: product.verified ? 'Yes' : 'No',
      confidenceScore: product.confidenceScore,
      createdAt: new Date(product.createdAt).toLocaleDateString()
    }))

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `products-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const handleLoadMore = async () => {
    if (pagination.hasMore) {
      try {
        await fetchProducts(pagination.page + 1, pagination.limit)
      } catch (error) {
        console.error('Load more failed:', error)
      }
    }
  }

  // Transform data for charts
  const categoriesChartData = categories?.slice(0, 8).map((item: any, index: number) => ({
    label: item.name || item.category || 'Unknown',
    value: item.count || 0,
    percentage: overview?.totalProducts ? (item.count / overview.totalProducts * 100) : 0,
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'][index % 8]
  })) || null

  // Data sources chart will be removed for now as data structure is not available
  const dataSourcesChartData = null

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products Management</h1>
          <p className="text-muted-foreground">
            Manage products, scan barcodes, and check allergies
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowScanner(true)} variant="outline">
            <ScanLine className="h-4 w-4 mr-2" />
            Scan Barcode
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-red-600">{error}</p>
              <Button onClick={clearError} variant="ghost" size="sm">
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Products"
          value={overview?.totalProducts || 0}
          icon="package"
          description="Across all sources"
          loading={isLoading}
        />

        <StatsCard
          title="Verified Products"
          value={overview?.verifiedProducts || 0}
          icon="shield-check"
          description="Admin verified"
          loading={isLoading}
        />

        <StatsCard
          title="Categories"
          value={overview?.categoriesCount || 0}
          icon="grid-3x3"
          description="Product categories"
          loading={isLoading}
        />

        <StatsCard
          title="Data Sources"
          value={overview?.dataSourcesCount || 0}
          icon="database"
          description="API, Manual, Community"
          loading={isLoading}
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DistributionChart
          title="Product Categories"
          data={categoriesChartData}
          loading={isLoading}
          onRefresh={handleRefresh}
          centerText={overview ? {
            primary: overview.categoriesCount.toString(),
            secondary: 'Categories'
          } : undefined}
        />

        <DistributionChart
          title="Data Sources"
          data={dataSourcesChartData}
          loading={isLoading}
          onRefresh={handleRefresh}
          centerText={overview ? {
            primary: overview.totalProducts.toString(),
            secondary: 'Total Products'
          } : undefined}
        />
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products, brands, or barcodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSearch} size="sm">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {Object.values(filters).some(v => v !== '' && v !== undefined) && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    !
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <ProductFilters
                filters={filters}
                categories={categories}
                onFiltersChange={setFilters}
                onSearch={handleFilterSearch}
                onClear={() => {
                  clearFilters()
                  fetchProductsOverview()
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results Info */}
      {searchResults && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Found {searchResults.totalCount} products
                  {searchQuery && ` for "${searchQuery}"`}
                </p>
                {searchResults.brands.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1">Brands found:</p>
                    <div className="flex flex-wrap gap-1">
                      {searchResults.brands.slice(0, 10).map((brand) => (
                        <Badge key={brand} variant="secondary" className="text-xs">
                          {brand}
                        </Badge>
                      ))}
                      {searchResults.brands.length > 10 && (
                        <Badge variant="secondary" className="text-xs">
                          +{searchResults.brands.length - 10} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Button
                onClick={() => {
                  setSearchQuery('')
                  fetchProductsOverview()
                }}
                variant="outline"
                size="sm"
              >
                Clear Search
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <ProductsTable
        products={products}
        isLoading={isLoading}
        onLoadMore={handleLoadMore}
        hasMore={pagination.hasMore}
      />

      {/* Modals */}
      {showForm && (
        <ProductForm
          open={showForm}
          onClose={() => setShowForm(false)}
          categories={categories}
        />
      )}

      {showScanner && (
        <BarcodeScanner
          open={showScanner}
          onClose={() => setShowScanner(false)}
          onScan={(barcode) => {
            setSearchQuery(barcode)
            handleSearch()
          }}
        />
      )}
    </div>
  )
}