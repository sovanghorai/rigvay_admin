import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAccessibleMenuItems } from '../utils/permissionUtils'
import '../styles/admin.css'
import '../styles/adminNavbar.css'
// import Logo from "../assets/logo.png";

export default function AdminNavbar({ onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { admin } = useAuth()

  const linkClass = ({ isActive }) => 'nav-item' + (isActive ? ' active' : '')

  // Get only accessible menu items based on user permissions
  const accessibleMenuItems = getAccessibleMenuItems(admin?.permissions || [])

  const handleLogout = () => {
    setMenuOpen(false)
    onLogout && onLogout()
  }

  return (
    <nav className="admin-navbar">
      <div className="admin-brand">Rigvay Admin</div>

      {/* User Info */}
      {admin && (
        <div className="admin-user-info">
          <span className="user-phone">{admin.phone}</span>
        </div>
      )}

      {/* Hamburger */}
      <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>

      {/* Nav Items */}
      <div className={`admin-nav-items ${menuOpen ? 'open' : ''}`}>
        {/* Dynamically render menu items based on permissions */}
        {accessibleMenuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={linkClass}
            end={item.path === '/'}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </NavLink>
        ))}

        {/* Logout Button */}
        {onLogout && (
          <button className="nav-item logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  )
}