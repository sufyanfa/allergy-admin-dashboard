'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { UsersTable } from '@/components/tables/users-table'
import { UserForm } from '@/components/forms/user-form'
import { useUsersStore } from '@/lib/stores/users-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { Plus, Search, Filter, Users, UserCheck, UserX } from 'lucide-react'
import { toast } from 'sonner'
import { User } from '@/types'
import { USER_ROLES, USER_STATUSES } from '@/constants'

export default function UsersPage() {
  const {
    users,
    loading,
    error,
    pagination,
    filters,
    fetchUsers,
    updateUser,
    updateUserStatus,
    deleteUser,
    setFilters,
    setPagination,
    clearError,
    selectedUser,
    setSelectedUser,
  } = useUsersStore()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string | null }>({
    open: false,
    userId: null,
  })
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Update filters when search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters({ search: searchTerm })
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, setFilters])

  // Fetch users when filters or pagination change
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers, filters, pagination.page, pagination.limit])

  // Clear error when component unmounts
  useEffect(() => {
    return () => clearError()
  }, [clearError])

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
        toast.success('User updated successfully')
      } else {
        // For creating new users, you'd need to implement a create API endpoint
        toast.error('Creating new users is not yet implemented')
      }
      setIsFormOpen(false)
    } catch (error: unknown) {
      toast.error((error as Error)?.message || 'Failed to save user')
    }
  }

  const handleStatusUpdate = async (userId: string, status: 'active' | 'inactive' | 'suspended') => {
    try {
      await updateUserStatus(userId, status)
      toast.success(`User ${status === 'active' ? 'activated' : status === 'suspended' ? 'suspended' : 'deactivated'} successfully`)
    } catch (error: unknown) {
      toast.error((error as Error)?.message || 'Failed to update user status')
    }
  }

  const handleDeleteConfirm = async () => {
    if (deleteDialog.userId) {
      try {
        await deleteUser(deleteDialog.userId)
        toast.success('User deleted successfully')
        setDeleteDialog({ open: false, userId: null })
      } catch (error: unknown) {
        toast.error((error as Error)?.message || 'Failed to delete user')
      }
    }
  }

  const totalUsers = users.length
  const activeUsers = users.filter(u => u.status === 'active').length
  const premiumUsers = users.filter(u => u.role === 'premium').length

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">
              Manage user accounts and permissions
            </p>
          </div>
          <Button onClick={handleCreateUser}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                {totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{premiumUsers}</div>
              <p className="text-xs text-muted-foreground">
                {totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select
                value={filters.role}
                onValueChange={(value) => setFilters({ role: value === 'all' ? '' : value })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value={USER_ROLES.USER}>User</SelectItem>
                  <SelectItem value={USER_ROLES.PREMIUM}>Premium</SelectItem>
                  <SelectItem value={USER_ROLES.ADMIN}>Admin</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ status: value === 'all' ? '' : value })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={USER_STATUSES.ACTIVE}>Active</SelectItem>
                  <SelectItem value={USER_STATUSES.INACTIVE}>Inactive</SelectItem>
                  <SelectItem value={USER_STATUSES.SUSPENDED}>Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-600">
                <span>{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="text-red-600 hover:text-red-700"
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Users List</CardTitle>
                <CardDescription>
                  {pagination.total} total users found
                </CardDescription>
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
            <UsersTable
              users={users}
              loading={loading}
              onEdit={handleEditUser}
              onDelete={(userId) => setDeleteDialog({ open: true, userId })}
              onUpdateStatus={handleStatusUpdate}
            />
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
    </AdminLayout>
  )
}