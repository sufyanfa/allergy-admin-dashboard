'use client'

import { useEffect, useState } from 'react'
import { useUsersStore } from '@/lib/stores/users-store'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { RefreshCw, Download, Search, Filter, Plus, TrendingUp } from 'lucide-react'
import { UserForm } from '@/components/forms/user-form'
import { User } from '@/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useTranslations } from '@/lib/hooks/use-translations'

interface UsersOverviewProps {
  className?: string
}

export function UsersOverview({ className }: UsersOverviewProps) {
  const t = useTranslations('users')
  const tCommon = useTranslations('common')
  const tMessages = useTranslations('messages')

  const {
    users,
    overview,
    selectedUser,
    loading,
    error,
    pagination,
    filters,
    fetchUsersOverview,
    createUser,
    updateUser,
    deleteUser,
    searchUsers,
    setFilters,
    setPagination,
    clearError,
    setSelectedUser,
  } = useUsersStore()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string | null }>({
    open: false,
    userId: null,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchUsersOverview()
  }, [fetchUsersOverview])

  // Update filters when search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        searchUsers(searchTerm)
      } else {
        fetchUsersOverview()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, searchUsers, fetchUsersOverview])

  const handleCreateUser = () => {
    setSelectedUser(null)
    setIsFormOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (data: Partial<User>) => {
    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, data)
        toast.success(tMessages('updated'))
      } else {
        await createUser(data)
        toast.success(tMessages('created'))
      }
      setIsFormOpen(false)
    } catch (error: unknown) {
      toast.error((error as Error)?.message || tMessages('error'))
    }
  }


  const handleDeleteConfirm = async () => {
    if (deleteDialog.userId) {
      try {
        await deleteUser(deleteDialog.userId)
        toast.success(tMessages('deleted'))
        setDeleteDialog({ open: false, userId: null })
      } catch (error: unknown) {
        toast.error((error as Error)?.message || tMessages('error'))
      }
    }
  }

  const handleRefresh = async () => {
    try {
      if (searchTerm.trim()) {
        await searchUsers(searchTerm)
      } else {
        await fetchUsersOverview()
      }
    } catch (error) {
      console.error('Refresh failed:', error)
    }
  }

  const handleExport = () => {
    const csvData = users.map(user => ({
      id: user.id,
      name: user.name || user.fullName || user.username || '',
      email: user.email || '',
      role: user.role,
      status: user.status,
      allergiesCount: user.allergiesCount || 0,
      createdAt: new Date(user.createdAt).toLocaleDateString()
    }))

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `users-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  // Transform data for charts
  const roleDistributionData = overview?.roleDistribution?.map((item, index) => ({
    label: item.role.charAt(0).toUpperCase() + item.role.slice(1),
    value: item.count,
    percentage: item.percentage,
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
  })) || null

  const getStatusBadge = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    const variants = {
      active: 'default' as const,
      inactive: 'secondary' as const,
      suspended: 'destructive' as const,
      pending: 'outline' as const
    }
    return variants[status as keyof typeof variants] || 'default'
  }

  const getRoleBadge = (role: string): "default" | "destructive" | "outline" | "secondary" => {
    const variants = {
      admin: 'destructive' as const,
      moderator: 'default' as const,
      premium_user: 'secondary' as const,
      user: 'outline' as const,
      guest: 'outline' as const
    }
    return variants[role as keyof typeof variants] || 'outline'
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('title')}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            {tCommon('refresh')}
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {tCommon('export')}
          </Button>
          <Button onClick={handleCreateUser}>
            <Plus className="h-4 w-4 mr-2" />
            {t('addUser')}
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
                {tCommon('close')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("totalUsers")}
          value={overview?.totalUsers.count || 0}
          change={{
            value: overview?.totalUsers.growthPercentage || 0,
            type: (overview?.totalUsers.growthPercentage || 0) >= 0 ? 'increase' : 'decrease',
            period: 'vs last month'
          }}
          icon="users"
          description={t("registeredUsers")}
          loading={loading}
        />

        <StatsCard
          title={t("activeUsers")}
          value={overview?.activeUsers.count || 0}
          change={{
            value: overview?.activeUsers.percentage || 0,
            type: 'neutral',
            period: 'of total users'
          }}
          icon="activity"
          description={t("currentlyActive")}
          loading={loading}
        />

        <StatsCard
          title={t("premiumUsers")}
          value={overview?.premiumUsers.count || 0}
          change={{
            value: overview?.premiumUsers.percentage || 0,
            type: 'neutral',
            period: 'of total users'
          }}
          icon="shield-check"
          description={t("premiumSubscribers")}
          loading={loading}
        />

        <StatsCard
          title={t("growthRate")}
          value={`${overview?.totalUsers.growthPercentage || 0}%`}
          icon="activity"
          description={t("userGrowthThisMonth")}
          loading={loading}
        />
      </div>

      {/* Role Distribution Chart and Growth Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DistributionChart
          title={t("roleDistribution")}
          data={roleDistributionData}
          loading={loading}
          onRefresh={handleRefresh}
          centerText={overview ? {
            primary: overview.totalUsers.count.toString(),
            secondary: t('totalUsers')
          } : undefined}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              User Growth Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Growth</span>
                <Badge variant={overview?.totalUsers.growthPercentage && overview.totalUsers.growthPercentage > 0 ? 'default' : 'secondary'}>
                  {overview?.totalUsers.growthPercentage || 0}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Rate</span>
                <Badge variant="default">
                  {overview?.activeUsers.percentage || 0}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Premium Rate</span>
                <Badge variant="secondary">
                  {overview?.premiumUsers.percentage || 0}%
                </Badge>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  {overview?.totalUsers.growthPercentage && overview.totalUsers.growthPercentage > 0
                    ? `Strong growth momentum with ${overview.totalUsers.count} total users`
                    : 'Monitor growth strategies to increase user acquisition'
                  }
                </p>
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
                  placeholder={tCommon("search")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {(filters.role || filters.status || filters.verified) && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    !
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select
                  value={filters.role}
                  onValueChange={(value) => setFilters({ role: value === 'all' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("allRoles")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="premium_user">Premium User</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters({ status: value === 'all' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("allStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.verified}
                  onValueChange={(value) => setFilters({ verified: value === 'all' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Verification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Verification</SelectItem>
                    <SelectItem value="email">Email Verified</SelectItem>
                    <SelectItem value="phone">Phone Verified</SelectItem>
                    <SelectItem value="none">Not Verified</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => {
                    setFilters({ role: '', status: '', verified: '' })
                    setSearchTerm('')
                    fetchUsersOverview()
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

      {/* Users List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Users List</CardTitle>
              <p className="text-sm text-muted-foreground">
                {pagination.total} total users found
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1 || loading}
              >
                Previous
              </Button>
              <Badge variant="outline">
                Page {pagination.page} of {pagination.pages}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(pagination.page + 1)}
                disabled={!pagination.hasMore || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{user.name || user.fullName || user.username || 'Unknown User'}</h3>
                      <Badge variant={getRoleBadge(user.role)}>
                        {user.role}
                      </Badge>
                      <Badge variant={getStatusBadge(user.status)}>
                        {user.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {user.email || 'No email'} • {user.allergiesCount || 0} allergies
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteDialog({ open: true, userId: user.id })}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}

              {users.length === 0 && !loading && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No users found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Form */}
      <UserForm
        user={selectedUser}
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        loading={loading}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, userId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}