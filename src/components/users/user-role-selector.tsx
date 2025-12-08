'use client'

import { useState } from 'react'
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
import { User } from '@/types'
import { toast } from 'sonner'
import { useUsersStore } from '@/lib/stores/users-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useTranslations } from '@/lib/hooks/use-translations'

interface UserRoleSelectorProps {
  user: User
  disabled?: boolean
}

const ROLES: Array<{ value: User['role']; label: string; description: string }> = [
  { value: 'user', label: 'User', description: 'Regular user with basic permissions' },
  { value: 'company', label: 'Company', description: 'Company account with product management access' },
  { value: 'doctor', label: 'Doctor', description: 'Medical professional with review permissions' },
  { value: 'hospital', label: 'Hospital', description: 'Hospital account with advanced permissions' },
  { value: 'admin', label: 'Admin', description: 'Full administrative access' },
]

export function UserRoleSelector({ user, disabled = false }: UserRoleSelectorProps) {
  const tMessages = useTranslations('messages')
  const { user: currentUser } = useAuthStore()
  const { updateUserRole } = useUsersStore()
  const [selectedRole, setSelectedRole] = useState<User['role'] | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const isCurrentUser = currentUser?.id === user.id
  const isAdminChange = selectedRole === 'admin' || user.role === 'admin'

  const handleRoleChange = (newRole: string) => {
    const role = newRole as User['role']

    // Prevent changing own role
    if (isCurrentUser) {
      toast.error('You cannot change your own role')
      return
    }

    setSelectedRole(role)

    // Show confirmation dialog for admin role changes
    if (role === 'admin' || user.role === 'admin') {
      setShowConfirmDialog(true)
    } else {
      // For non-admin changes, update immediately
      handleConfirmRoleChange(role)
    }
  }

  const handleConfirmRoleChange = async (roleToUpdate?: User['role']) => {
    const role = roleToUpdate || selectedRole
    if (!role) return

    setIsUpdating(true)
    try {
      const result = await updateUserRole(user.id, role)

      toast.success(
        `User role updated from ${result.previousRole} to ${result.currentRole}`,
        {
          description: `${user.name || user.email || 'User'}'s role has been successfully updated.`
        }
      )

      setShowConfirmDialog(false)
      setSelectedRole(null)
    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || 'Failed to update user role'

      // Handle specific error cases
      if (errorMessage.includes('Cannot change your own role')) {
        toast.error('Cannot change own role', {
          description: 'You cannot modify your own user role.'
        })
      } else if (errorMessage.includes('Cannot demote the last admin')) {
        toast.error('Cannot demote last admin', {
          description: 'At least one admin user must remain in the system.'
        })
      } else if (errorMessage.includes('Invalid role')) {
        toast.error('Invalid role', {
          description: 'The selected role is not valid.'
        })
      } else {
        toast.error('Failed to update role', {
          description: errorMessage
        })
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancelDialog = () => {
    setShowConfirmDialog(false)
    setSelectedRole(null)
  }

  return (
    <>
      <Select
        value={user.role}
        onValueChange={handleRoleChange}
        disabled={disabled || isCurrentUser || isUpdating}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((role) => (
            <SelectItem
              key={role.value}
              value={role.value}
              disabled={isCurrentUser}
            >
              <div className="flex flex-col">
                <span className="font-medium">{role.label}</span>
                <span className="text-xs text-muted-foreground">
                  {role.description}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Confirmation Dialog for Admin Role Changes */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedRole === 'admin' ? 'Grant Admin Access?' : 'Remove Admin Access?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedRole === 'admin' ? (
                <>
                  You are about to grant <strong>admin privileges</strong> to{' '}
                  <strong>{user.name || user.email || 'this user'}</strong>.
                  <br />
                  <br />
                  Admins have full access to the system including user management,
                  system configuration, and all data.
                  <br />
                  <br />
                  Are you sure you want to proceed?
                </>
              ) : (
                <>
                  You are about to remove <strong>admin privileges</strong> from{' '}
                  <strong>{user.name || user.email || 'this user'}</strong> and
                  change their role to <strong>{selectedRole}</strong>.
                  <br />
                  <br />
                  This will revoke their administrative access to the system.
                  <br />
                  <br />
                  Are you sure you want to proceed?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDialog}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleConfirmRoleChange()}
              className={
                selectedRole === 'admin'
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Confirm Change'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
