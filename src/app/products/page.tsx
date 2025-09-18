'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Filter, ScanLine, Download, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useProductsStore } from '@/lib/stores/products-store'
import { useRequireAuth } from '@/lib/hooks/use-auth'
import { ProductsTable } from '@/components/tables/products-table'
import { ProductForm } from '@/components/forms/product-form'
import { BarcodeScanner } from '@/components/forms/barcode-scanner'
import { ProductFilters } from '@/components/forms/product-filters'

export default function ProductsPage() {
  const { isAdmin } = useRequireAuth()
  const [showForm, setShowForm] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const {
    products,
    categories,
    searchResults,
    isLoading,
    error,
    filters,
    pagination,
    fetchProducts,
    fetchCategories,
    searchProducts,
    searchIntegrated,
    setFilters,
    clearFilters,
    clearError
  } = useProductsStore()

  useEffect(() => {
    if (isAdmin) {
      fetchProducts()
      fetchCategories()
    }
  }, [isAdmin, fetchProducts, fetchCategories])

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        await searchIntegrated(searchQuery.trim())
      } catch (error) {
        console.error('Search failed:', error)
      }
    } else {
      await fetchProducts()
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
        await fetchProducts()
      }
    } catch (error) {
      console.error('Refresh failed:', error)
    }
  }

  const handleExport = () => {
    // Implementation for exporting products data
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
    ].join('\\n')

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

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">You need admin privileges to access this page.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all sources
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.verified).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Admin verified
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Product categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              API, Manual, Community
            </p>
          </CardContent>
        </Card>
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
                  fetchProducts()
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

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
                  fetchProducts()
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