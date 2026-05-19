import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { hasPermission } from '../utils/permissionUtils'

/**
 * PermissionRoute component for protected routes with permission checking
 * 
 * Usage:
 * <PermissionRoute permission="analytics">
 *   <AnalyticsPage />
 * </PermissionRoute>
 * 
 * Or with multiple permissions (OR logic - requires any one):
 * <PermissionRoute permission={['analytics', 'reports']}>
 *   <AnalyticsPage />
 * </PermissionRoute>
 * 
 * Behavior:
 * - If not logged in → redirect to /login
 * - If permission missing → redirect to /
 * - Otherwise → render children
 */
const PermissionRoute = ({ permission, children }) => {
  const { isAuthenticated, admin } = useAuth()

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Permission required but user doesn't have it - redirect to home
  if (permission && !hasPermission(admin?.permissions, permission)) {
    return <Navigate to="/" replace />
  }

  // All checks passed - render children
  return children
}

export default PermissionRoute
