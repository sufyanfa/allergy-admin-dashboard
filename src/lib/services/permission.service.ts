import { AppPermission, UserRole, UserPermissionContext } from '@/types'

/**
 * Permission Service - Centralized RBAC permission checking for frontend
 * Mirrors the backend permission service for consistency
 */
export class PermissionService {
  /**
   * Check if a user has a specific permission
   */
  hasPermission(
    user: UserPermissionContext | null | undefined,
    permission: AppPermission
  ): boolean {
    if (!user) return false

    // Use cached permissions if available
    if (user.permissions) {
      return user.permissions.includes(permission)
    }

    // No permissions loaded
    return false
  }

  /**
   * Check if a user has ANY of the specified permissions
   */
  hasAnyPermission(
    user: UserPermissionContext | null | undefined,
    permissions: AppPermission[]
  ): boolean {
    if (!user || !user.permissions) return false
    return permissions.some(p => user.permissions!.includes(p))
  }

  /**
   * Check if a user has ALL of the specified permissions
   */
  hasAllPermissions(
    user: UserPermissionContext | null | undefined,
    permissions: AppPermission[]
  ): boolean {
    if (!user || !user.permissions) return false
    return permissions.every(p => user.permissions!.includes(p))
  }

  /**
   * Check if user has admin role
   */
  isAdmin(user: UserPermissionContext | null | undefined): boolean {
    return user?.role === 'admin'
  }

  /**
   * Check if user has specific role
   */
  hasRole(
    user: UserPermissionContext | null | undefined,
    role: UserRole | UserRole[]
  ): boolean {
    if (!user) return false

    if (Array.isArray(role)) {
      return role.includes(user.role)
    }

    return user.role === role
  }

  /**
   * Get all permissions for a user
   */
  getUserPermissions(user: UserPermissionContext | null | undefined): AppPermission[] {
    return user?.permissions || []
  }

  /**
   * Group permissions by category
   */
  groupPermissionsByCategory(permissions: AppPermission[]): Record<string, AppPermission[]> {
    const grouped: Record<string, AppPermission[]> = {
      profile: [],
      products: [],
      allergies: [],
      community: [],
      experiments: [],
      users: [],
      system: [],
    }

    permissions.forEach(permission => {
      const category = permission.split('.')[0]
      if (grouped[category]) {
        grouped[category].push(permission)
      }
    })

    return grouped
  }

  /**
   * Get permission category from permission string
   */
  getPermissionCategory(permission: AppPermission): string {
    return permission.split('.')[0]
  }

  /**
   * Get permission action from permission string
   */
  getPermissionAction(permission: AppPermission): string {
    return permission.split('.')[1]
  }

  /**
   * Check if permission is a read-only permission
   */
  isReadOnlyPermission(permission: AppPermission): boolean {
    return permission.endsWith('.read')
  }

  /**
   * Check if permission is a write permission
   */
  isWritePermission(permission: AppPermission): boolean {
    const writeActions = ['create', 'update', 'delete', 'manage', 'configure', 'approve']
    const action = this.getPermissionAction(permission)
    return writeActions.includes(action)
  }
}

// Export singleton instance
export const permissionService = new PermissionService()
