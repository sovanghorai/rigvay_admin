/**
 * Custom React hooks for auth and permissions
 * Import and use these hooks in your components
 */

import { useAuth } from '../context/AuthContext'

/**
 * usePermission - Check if user has specific permission(s)
 * @param {string|Array<string>} permission - Permission(s) to check
 * @returns {boolean}
 * 
 * Usage:
 * const canViewAnalytics = usePermission('analytics')
 * const canEdit = usePermission(['cars', 'subscriptions'])
 */
export const usePermission = (permission) => {
  const { hasPermission } = useAuth()
  return hasPermission(permission)
}

/**
 * useAuthRedirect - Redirect to login if not authenticated
 * Usage: Call this at the start of a protected component
 */
export const useAuthRedirect = () => {
  const { isAuthenticated } = useAuth()
  const navigate = require('react-router-dom').useNavigate()

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, navigate])

  return isAuthenticated
}

/**
 * useAdmin - Get current admin data
 * @returns {Object} - Admin object with id, phone, permissions
 * 
 * Usage:
 * const admin = useAdmin()
 * console.log(admin.phone, admin.permissions)
 */
export const useAdmin = () => {
  const { admin } = useAuth()
  return admin
}

/**
 * useLogout - Get logout function
 * @returns {Function} - Logout function
 * 
 * Usage:
 * const logout = useLogout()
 * logout() // Logs out user and clears storage
 */
export const useLogout = () => {
  const { logout } = useAuth()
  return logout
}

/**
//  * useIsAuthenticated - Check if user is logged in
//  * @returns {boolean}
//  * 
//  * Usage:
//  * const isLoggedIn = useIsAuthenticated()
//  * if (isLoggedIn) { /* render content */
//  */
export const useIsAuthenticated = () => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated
}

/**
 * useAccessibleMenuItems - Get menu items user has access to
 * @returns {Array} - Filtered menu items
 * 
 * Usage:
 * const menuItems = useAccessibleMenuItems()
 * menuItems.map(item => <NavLink to={item.path}>{item.label}</NavLink>)
 */
export const useAccessibleMenuItems = () => {
  const { admin } = useAuth()
  const { getAccessibleMenuItems } = require('../utils/permissionUtils')
  
  return getAccessibleMenuItems(admin?.permissions || [])
}

export default {
  usePermission,
  useAuthRedirect,
  useAdmin,
  useLogout,
  useIsAuthenticated,
  useAccessibleMenuItems,
}
