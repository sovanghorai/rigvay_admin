import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import '../styles/admin.css'
import '../styles/adminNavbar.css'
// import Logo from "../assets/logo.png";

export default function AdminNavbar({ onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const linkClass = ({ isActive }) => 'nav-item' + (isActive ? ' active' : '')

  return (
    <nav className="admin-navbar">
      <div className="admin-brand">Rigvay Admin</div>

      {/* Hamburger */}
      <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>

      {/* Nav Items */}
      <div className={`admin-nav-items ${menuOpen ? 'open' : ''}`}>
        <NavLink to="/" className={linkClass} end onClick={() => setMenuOpen(false)}>
          Dealer
        </NavLink>

        <NavLink to="/cars" className={linkClass} onClick={() => setMenuOpen(false)}>
          Cars
        </NavLink>

        <NavLink to="/subscriptions" className={linkClass} onClick={() => setMenuOpen(false)}>
          Subscriptions
        </NavLink>

        <NavLink to="/producers" className={linkClass} onClick={() => setMenuOpen(false)}>
          Producers
        </NavLink>

        <NavLink to="/analytics" className={linkClass} onClick={() => setMenuOpen(false)}>
          Analytics
        </NavLink>
        <NavLink to="/data-download" className={linkClass} onClick={() => setMenuOpen(false)}>
          Data Download!
        </NavLink>

        {onLogout && (
          <button className="nav-item logout-btn" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  )
}