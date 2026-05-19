/**
 * Permission utility helpers for role-based access control
 */

/**
 * Menu items with their required permissions
 */
export const MENU_ITEMS = [
  { path: '/', label: 'Dealer', permission: 'dealer', icon: 'Users' },
  { path: '/cars', label: 'Cars', permission: 'cars', icon: 'Car' },
  { path: '/subscriptions', label: 'Subscriptions', permission: 'subscriptions', icon: 'CreditCard' },
  { path: '/producers', label: 'Producers', permission: 'producers', icon: 'Factory' },
  { path: '/analytics', label: 'Analytics', permission: 'analytics', icon: 'BarChart3' },
  { path: '/data-download', label: 'Data Download', permission: 'data_download', icon: 'Download' },
]

/**
 * Check if user has a specific permission
 * @param {Array<string>} userPermissions - User's permissions array
 * @param {string|Array<string>} requiredPermission - Required permission(s)
 * @returns {boolean}
 */
export const hasPermission = (userPermissions = [], requiredPermission) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false
  }

  if (Array.isArray(requiredPermission)) {
    return requiredPermission.some(p => userPermissions.includes(p))
  }

  return userPermissions.includes(requiredPermission)
}

/**
 * Filter menu items based on user permissions
 * @param {Array<string>} userPermissions - User's permissions array
 * @returns {Array} Filtered menu items
 */
export const getAccessibleMenuItems = (userPermissions = []) => {
  return MENU_ITEMS.filter(item => hasPermission(userPermissions, item.permission))
}

/**
 * Check if a route is accessible to user
 * @param {string} routePath - Route path to check
 * @param {Array<string>} userPermissions - User's permissions array
 * @returns {boolean}
 */
export const isRouteAccessible = (routePath, userPermissions = []) => {
  // Home route is always accessible if user is logged in
  if (routePath === '/') return true

  const menuItem = MENU_ITEMS.find(item => item.path === routePath)
  if (!menuItem) return false

  return hasPermission(userPermissions, menuItem.permission)
}

/**
 * Get required permission for a route
 * @param {string} routePath - Route path
 * @returns {string|null}
 */
export const getRoutePermission = (routePath) => {
  if (routePath === '/') return null // Home route requires no specific permission

  const menuItem = MENU_ITEMS.find(item => item.path === routePath)
  return menuItem?.permission || null
}
