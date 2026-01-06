import React from 'react'
import '../styles/admin.css'

export default function AdminNavbar({ current, onNavigate }) {
  return (
    <nav className="admin-navbar">
      <div className="admin-brand">Rigvay Admin</div>
      <div className="admin-nav-items">
        <button
          className={"nav-item " + (current === 'Dealer' ? 'active' : '')}
          onClick={() => onNavigate('Dealer')}
        >
          Dealer
        </button>
        <button
          className={"nav-item " + (current === 'Cars' ? 'active' : '')}
          onClick={() => onNavigate('Cars')}
        >
          Cars
        </button>
      </div>
    </nav>
  )
}
