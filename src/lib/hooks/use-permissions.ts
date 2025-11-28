import { useAuthStore } from '@/lib/stores/auth-store'
import { permissionService } from '@/lib/services/permission.service'
import { AppPermission, UserRole } from '@/types'

/**
 * Hook to access user permissions and check permissions
 */
export function usePermissions() {
  const { user, permissions } = useAuthStore()

  const userContext = user
    ? {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        permissions: permissions.length > 0 ? permissions : user.permissions,
      }
    : null

  return {
    /**
     * All permissions for current user
     */
    permissions,

    /**
     * Current user context
     */
    user: userContext,

    /**
     * Check if user has a specific permission
     */
    hasPermission: (permission: AppPermission) => {
      return permissionService.hasPermission(userContext, permission)
    },

    /**
     * Check if user has ANY of the specified permissions
     */
    hasAnyPermission: (permissionsToCheck: AppPermission[]) => {
      return permissionService.hasAnyPermission(userContext, permissionsToCheck)
    },

    /**
     * Check if user has ALL of the specified permissions
     */
    hasAllPermissions: (permissionsToCheck: AppPermission[]) => {
      return permissionService.hasAllPermissions(userContext, permissionsToCheck)
    },

    /**
     * Check if user is admin
     */
    isAdmin: () => {
      return permissionService.isAdmin(userContext)
    },

    /**
     * Check if user has specific role
     */
    hasRole: (role: UserRole | UserRole[]) => {
      return permissionService.hasRole(userContext, role)
    },

    /**
     * Get permissions grouped by category
     */
    getPermissionsByCategory: () => {
      return permissionService.groupPermissionsByCategory(permissions)
    },
  }
}

/**
 * Hook to check if user can perform a specific action
 * Returns boolean indicating if user has permission
 */
export function useHasPermission(permission: AppPermission): boolean {
  const { hasPermission } = usePermissions()
  return hasPermission(permission)
}

/**
 * Hook to check if user has any of the specified permissions
 */
export function useHasAnyPermission(permissions: AppPermission[]): boolean {
  const { hasAnyPermission } = usePermissions()
  return hasAnyPermission(permissions)
}

/**
 * Hook to check if user has all of the specified permissions
 */
export function useHasAllPermissions(permissions: AppPermission[]): boolean {
  const { hasAllPermissions } = usePermissions()
  return hasAllPermissions(permissions)
}

/**
 * Hook to check if user is admin
 */
export function useIsAdmin(): boolean {
  const { isAdmin } = usePermissions()
  return isAdmin()
}

/**
 * Hook to check if user has specific role
 */
export function useHasRole(role: UserRole | UserRole[]): boolean {
  const { hasRole } = usePermissions()
  return hasRole(role)
}
