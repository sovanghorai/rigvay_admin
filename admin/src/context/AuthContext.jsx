import React, { createContext, useState, useEffect, useCallback } from 'react'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem('admin')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Login function
  const login = useCallback((newToken, adminData) => {
    setToken(newToken)
    setAdmin(adminData)
    localStorage.setItem('token', newToken)
    localStorage.setItem('admin', JSON.stringify(adminData))
    setError(null)
  }, [])

  // Logout function
  const logout = useCallback(() => {
    setToken(null)
    setAdmin(null)
    localStorage.removeItem('token')
    localStorage.removeItem('admin')
    localStorage.removeItem('admin_access_token') // legacy
    setError(null)
  }, [])

  // Check if user has permission
  const hasPermission = useCallback((permission) => {
    if (!admin?.permissions) return false
    if (Array.isArray(permission)) {
      return permission.some(p => admin.permissions.includes(p))
    }
    return admin.permissions.includes(permission)
  }, [admin])

  // Check if user is authenticated
  const isAuthenticated = !!token && !!admin

  const value = {
    token,
    admin,
    loading,
    error,
    setLoading,
    setError,
    login,
    logout,
    hasPermission,
    isAuthenticated,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
