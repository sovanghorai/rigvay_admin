import React from 'react'
import '../styles/admin.css'
import '../styles/adminNavbar.css'

export default function AdminNavbar({ current, onNavigate, onLogout }) {
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

        {/* New Subscriptions Button */}
        <button
          className={"nav-item " + (current === 'DealerSubscriptions' ? 'active' : '')}
          onClick={() => onNavigate('DealerSubscriptions')}
        >
          Subscriptions
        </button>
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
