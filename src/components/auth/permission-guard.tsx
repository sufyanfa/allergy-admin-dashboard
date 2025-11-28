'use client'

import React from 'react'
import { AppPermission, UserRole } from '@/types'
import { usePermissions } from '@/lib/hooks/use-permissions'

interface PermissionGuardProps {
  /**
   * Required permission(s) - user must have at least one
   */
  permission?: AppPermission | AppPermission[]
  /**
   * Required role(s) - user must have one of these roles
   */
  role?: UserRole | UserRole[]
  /**
   * Require ALL permissions instead of ANY
   */
  requireAll?: boolean
  /**
   * Content to render if user has permission
   */
  children: React.ReactNode
  /**
   * Optional fallback content to render if user lacks permission
   */
  fallback?: React.ReactNode
}

/**
 * Component that conditionally renders children based on user permissions or roles
 *
 * @example
 * // Require single permission
 * <PermissionGuard permission="users.delete">
 *   <DeleteButton />
 * </PermissionGuard>
 *
 * @example
 * // Require any of multiple permissions
 * <PermissionGuard permission={['users.update', 'users.delete']}>
 *   <EditUserButton />
 * </PermissionGuard>
 *
 * @example
 * // Require all permissions
 * <PermissionGuard permission={['users.update', 'users.delete']} requireAll>
 *   <AdvancedUserActions />
 * </PermissionGuard>
 *
 * @example
 * // Check role instead of permission
 * <PermissionGuard role="admin">
 *   <AdminPanel />
 * </PermissionGuard>
 *
 * @example
 * // With fallback
 * <PermissionGuard permission="system.analytics" fallback={<p>Access denied</p>}>
 *   <AnalyticsDashboard />
 * </PermissionGuard>
 */
export function PermissionGuard({
  permission,
  role,
  requireAll = false,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole } =
    usePermissions()

  let hasAccess = false

  // Check role if provided
  if (role) {
    hasAccess = hasRole(role)
  }
  // Check permissions if provided
  else if (permission) {
    if (Array.isArray(permission)) {
      hasAccess = requireAll
        ? hasAllPermissions(permission)
        : hasAnyPermission(permission)
    } else {
      hasAccess = hasPermission(permission)
    }
  }
  // If neither permission nor role provided, deny access
  else {
    hasAccess = false
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

/**
 * Props for components that need permission control
 */
export interface WithPermissionProps {
  /**
   * Required permission(s)
   */
  requiredPermission?: AppPermission | AppPermission[]
  /**
   * Required role(s)
   */
  requiredRole?: UserRole | UserRole[]
}
