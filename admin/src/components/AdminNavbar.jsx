import React from 'react'
import { NavLink } from 'react-router-dom'
import '../styles/admin.css'
import '../styles/adminNavbar.css'

export default function AdminNavbar({ onLogout }) {
  const linkClass = ({ isActive }) => 'nav-item' + (isActive ? ' active' : '')

  return (
    <nav className="admin-navbar">
      <div className="admin-brand">Rigvay Admin</div>

      <div className="admin-nav-items">
        <NavLink to="/" className={linkClass} end>
          Dealer
        </NavLink>

        <NavLink to="/cars" className={linkClass}>
          Cars
        </NavLink>

        <NavLink to="/subscriptions" className={linkClass}>
          Subscriptions
        </NavLink>
      </div>

      <div style={{ marginLeft: 'auto' }}>
        {onLogout && (
          <button className="nav-item" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  )
}
