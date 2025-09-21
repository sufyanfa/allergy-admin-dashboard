'use client'

import { useEffect, useState } from 'react'
import { useAllergiesStore } from '@/lib/stores/allergies-store'
import { StatsCard } from '../dashboard/stats-card'
import { DistributionChart } from '../dashboard/distribution-chart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RefreshCw, Download, Search, Filter, Plus, AlertTriangle } from 'lucide-react'
import { AllergyForm } from '@/components/forms/allergy-form'
import { Allergy } from '@/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface AllergiesOverviewProps {
  className?: string
}

export function AllergiesOverview({ className }: AllergiesOverviewProps) {
  const {
    allergies,
    overview,
    currentAllergy,
    isLoading,
    error,
    severityFilter,
    activeFilter,
    fetchAllergiesOverview,
    createAllergy,
    updateAllergy,
    searchAllergies,
    setFilters,
    clearFilters,
    clearError,
    setCurrentAllergy
  } = useAllergiesStore()

  const [showFilters, setShowFilters] = useState(false)
  const [localSearchQuery, setLocalSearchQuery] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    // Initial data fetch - fetch overview which includes allergies
    fetchAllergiesOverview()
  }, [])

  const handleSearch = async () => {
    if (localSearchQuery.trim()) {
      try {
        await searchAllergies(localSearchQuery.trim())
      } catch (error) {
        console.error('Search failed:', error)
      }
    } else {
      await fetchAllergiesOverview()
    }
  }

  const handleFilterChange = async () => {
    try {
      await fetchAllergiesOverview()
    } catch (error) {
      console.error('Filter search failed:', error)
    }
  }

  const handleRefresh = async () => {
    try {
      if (localSearchQuery.trim()) {
        await searchAllergies(localSearchQuery.trim())
      } else {
        await fetchAllergiesOverview()
      }
    } catch (error) {
      console.error('Refresh failed:', error)
    }
  }

  const handleExport = () => {
    const csvData = allergies.map(allergy => ({
      id: allergy.id,
      nameAr: allergy.nameAr,
      nameEn: allergy.nameEn || '',
      descriptionAr: allergy.descriptionAr || '',
      descriptionEn: allergy.descriptionEn || '',
      severity: allergy.severity,
      isActive: allergy.isActive ? 'Yes' : 'No',
      userCount: allergy.userCount || 0,
      createdAt: new Date(allergy.createdAt).toLocaleDateString()
    }))

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `allergies-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const handleCreateAllergy = () => {
    setCurrentAllergy(null)
    setIsFormOpen(true)
  }

  const handleEditAllergy = (allergy: Allergy) => {
    setCurrentAllergy(allergy)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (data: Partial<Allergy>) => {
    try {
      if (currentAllergy) {
        await updateAllergy(currentAllergy.id, data)
        toast.success('Allergy updated successfully')
      } else {
        // Ensure required fields for creation
        if (!data.nameAr) {
          toast.error('Arabic name is required')
          return
        }
        const allergyData = {
          nameAr: data.nameAr,
          nameEn: data.nameEn || '',
          descriptionAr: data.descriptionAr || '',
          descriptionEn: data.descriptionEn || '',
          severity: data.severity || 'mild' as const,
          isActive: data.isActive ?? true
        }
        await createAllergy(allergyData)
        toast.success('Allergy created successfully')
      }
      setIsFormOpen(false)
    } catch (error: unknown) {
      toast.error((error as Error)?.message || 'Failed to save allergy')
    }
  }

  // Transform data for charts
  const severityChartData = overview?.severityDistribution ? [
    {
      label: 'Mild',
      value: overview.severityDistribution.mild,
      percentage: overview.totalAllergies ? (overview.severityDistribution.mild / overview.totalAllergies * 100) : 0,
      color: '#10B981'
    },
    {
      label: 'Moderate',
      value: overview.severityDistribution.moderate,
      percentage: overview.totalAllergies ? (overview.severityDistribution.moderate / overview.totalAllergies * 100) : 0,
      color: '#F59E0B'
    },
    {
      label: 'Severe',
      value: overview.severityDistribution.severe,
      percentage: overview.totalAllergies ? (overview.severityDistribution.severe / overview.totalAllergies * 100) : 0,
      color: '#EF4444'
    }
  ] : null

  const getSeverityBadge = (severity: string): "default" | "destructive" | "outline" | "secondary" => {
    const variants = {
      mild: 'default' as const,
      moderate: 'secondary' as const,
      severe: 'destructive' as const
    }
    return variants[severity as keyof typeof variants] || 'default'
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Allergies Management</h1>
          <p className="text-muted-foreground">
            Manage allergy types, severities, and user assignments
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
          <Button onClick={() => {}} variant="outline">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Check Allergies
          </Button>
          <Button onClick={handleCreateAllergy}>
            <Plus className="h-4 w-4 mr-2" />
            Add Allergy
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
          title="Total Allergies"
          value={overview?.totalAllergies || 0}
          icon="package"
          description="Allergy types available"
          loading={isLoading}
        />

        <StatsCard
          title="Active Allergies"
          value={overview?.activeAllergies || 0}
          icon="activity"
          description="Currently used by users"
          loading={isLoading}
        />

        <StatsCard
          title="User Assignments"
          value={overview?.userAllergiesCount || 0}
          icon="users"
          description="Total user allergy assignments"
          loading={isLoading}
        />

        <StatsCard
          title="Severe Allergies"
          value={overview?.severityDistribution?.severe || 0}
          icon="shield-check"
          description="High severity allergies"
          loading={isLoading}
        />
      </div>

      {/* Severity Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DistributionChart
          title="Severity Distribution"
          data={severityChartData}
          loading={isLoading}
          onRefresh={handleRefresh}
          centerText={overview ? {
            primary: overview.totalAllergies.toString(),
            secondary: 'Total Allergies'
          } : undefined}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Severity Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge variant="default" className="mr-2">Mild</Badge>
                  <span className="text-sm text-muted-foreground">Low risk reactions</span>
                </div>
                <span className="font-semibold">{overview?.severityDistribution?.mild || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge variant="secondary" className="mr-2">Moderate</Badge>
                  <span className="text-sm text-muted-foreground">Medium risk reactions</span>
                </div>
                <span className="font-semibold">{overview?.severityDistribution?.moderate || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge variant="destructive" className="mr-2">Severe</Badge>
                  <span className="text-sm text-muted-foreground">High risk reactions</span>
                </div>
                <span className="font-semibold">{overview?.severityDistribution?.severe || 0}</span>
              </div>
            </div>
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
                  placeholder="Search allergies by name or description..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
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
                {(severityFilter || activeFilter) && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    !
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  value={severityFilter}
                  onValueChange={(value) => {
                    setFilters(value === 'all' ? '' : value, activeFilter)
                    handleFilterChange()
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={activeFilter}
                  onValueChange={(value) => {
                    setFilters(severityFilter, value === 'all' ? '' : value)
                    handleFilterChange()
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => {
                    clearFilters()
                    setLocalSearchQuery('')
                    fetchAllergiesOverview()
                  }}
                  variant="outline"
                  size="sm"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allergies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Allergies List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {allergies.map((allergy) => (
                <div
                  key={allergy.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{allergy.nameAr}</h3>
                      {allergy.nameEn && (
                        <span className="text-sm text-muted-foreground">({allergy.nameEn})</span>
                      )}
                      <Badge variant={getSeverityBadge(allergy.severity)}>
                        {allergy.severity}
                      </Badge>
                      {allergy.isActive && (
                        <Badge variant="outline">Active</Badge>
                      )}
                    </div>
                    {allergy.descriptionAr && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {allergy.descriptionAr}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {allergy.userCount || 0} users
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditAllergy(allergy)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}

              {allergies.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No allergies found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allergy Form */}
      <AllergyForm
        allergy={currentAllergy}
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        loading={isLoading}
      />
    </div>
  )
}