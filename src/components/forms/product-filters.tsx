'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, X, Filter } from 'lucide-react'
import { ProductSearchFilters, ProductCategory } from '@/types'

interface ProductFiltersProps {
  filters: ProductSearchFilters
  categories: ProductCategory[]
  onFiltersChange: (filters: Partial<ProductSearchFilters>) => void
  onSearch: () => void
  onClear: () => void
}

export function ProductFilters({
  filters,
  categories,
  onFiltersChange,
  onSearch,
  onClear
}: ProductFiltersProps) {
  const [localFilters, setLocalFilters] = useState<ProductSearchFilters>(filters)

  const handleFilterChange = (key: keyof ProductSearchFilters, value: string | boolean | undefined) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange({ [key]: value })
  }

  const handleApplyFilters = () => {
    onSearch()
  }

  const handleClearFilters = () => {
    const emptyFilters: ProductSearchFilters = {
      query: '',
      category: '',
      brand: '',
      dataSource: '',
      verified: undefined,
      hasAllergens: undefined
    }
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
    onClear()
  }

  const getActiveFiltersCount = () => {
    return Object.values(localFilters).filter(value =>
      value !== '' && value !== undefined && value !== null
    ).length
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <h3 className="font-medium">Advanced Filters</h3>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFiltersCount} active
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              disabled={activeFiltersCount === 0}
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Query Filter */}
            <div className="space-y-2">
              <Label htmlFor="query-filter">Search Query</Label>
              <Input
                id="query-filter"
                placeholder="Product name, brand, barcode..."
                value={localFilters.query || ''}
                onChange={(e) => handleFilterChange('query', e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label htmlFor="category-filter">Category</Label>
              <Select
                value={localFilters.category || ''}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger id="category-filter">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.nameEn}>
                      {category.nameEn} - {category.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2">
              <Label htmlFor="brand-filter">Brand</Label>
              <Input
                id="brand-filter"
                placeholder="Brand name..."
                value={localFilters.brand || ''}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
              />
            </div>

            {/* Data Source Filter */}
            <div className="space-y-2">
              <Label htmlFor="source-filter">Data Source</Label>
              <Select
                value={localFilters.dataSource || ''}
                onValueChange={(value) => handleFilterChange('dataSource', value)}
              >
                <SelectTrigger id="source-filter">
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All sources</SelectItem>
                  <SelectItem value="api">API Import</SelectItem>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                  <SelectItem value="community">Community Sourced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Verification Status */}
            <div className="space-y-2">
              <Label htmlFor="verified-filter">Verification Status</Label>
              <Select
                value={localFilters.verified === undefined ? '' : localFilters.verified.toString()}
                onValueChange={(value) =>
                  handleFilterChange('verified', value === '' ? undefined : value === 'true')
                }
              >
                <SelectTrigger id="verified-filter">
                  <SelectValue placeholder="All products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All products</SelectItem>
                  <SelectItem value="true">Verified only</SelectItem>
                  <SelectItem value="false">Unverified only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Allergen Status */}
            <div className="space-y-2">
              <Label htmlFor="allergen-filter">Allergen Status</Label>
              <Select
                value={localFilters.hasAllergens === undefined ? '' : localFilters.hasAllergens.toString()}
                onValueChange={(value) =>
                  handleFilterChange('hasAllergens', value === '' ? undefined : value === 'true')
                }
              >
                <SelectTrigger id="allergen-filter">
                  <SelectValue placeholder="All products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All products</SelectItem>
                  <SelectItem value="true">Contains allergens</SelectItem>
                  <SelectItem value="false">No allergens</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              disabled={activeFiltersCount === 0}
            >
              Clear Filters
            </Button>
            <Button onClick={handleApplyFilters}>
              <Search className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div className="pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {localFilters.query && (
                  <Badge variant="outline" className="text-xs">
                    Query: {localFilters.query}
                    <button
                      onClick={() => handleFilterChange('query', '')}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {localFilters.category && (
                  <Badge variant="outline" className="text-xs">
                    Category: {localFilters.category}
                    <button
                      onClick={() => handleFilterChange('category', '')}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {localFilters.brand && (
                  <Badge variant="outline" className="text-xs">
                    Brand: {localFilters.brand}
                    <button
                      onClick={() => handleFilterChange('brand', '')}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {localFilters.dataSource && (
                  <Badge variant="outline" className="text-xs">
                    Source: {localFilters.dataSource}
                    <button
                      onClick={() => handleFilterChange('dataSource', '')}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {localFilters.verified !== undefined && (
                  <Badge variant="outline" className="text-xs">
                    {localFilters.verified ? 'Verified' : 'Unverified'}
                    <button
                      onClick={() => handleFilterChange('verified', undefined)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {localFilters.hasAllergens !== undefined && (
                  <Badge variant="outline" className="text-xs">
                    {localFilters.hasAllergens ? 'Has Allergens' : 'No Allergens'}
                    <button
                      onClick={() => handleFilterChange('hasAllergens', undefined)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}