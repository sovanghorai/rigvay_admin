import { useState } from 'react'
import './App.css'
import './styles/admin.css'
import AdminNavbar from './components/AdminNavbar'
import DealerPage from './pages/DealerPage'
import AdminLogin from './pages/AdminLogin'
import { Routes, Route, Navigate } from 'react-router-dom'

function ProtectedRoute({ token, children }) {
  if (!token) return <Navigate to="/login" replace />
  return children
}

function AdminLayout({ section, setSection, onLogout }) {
  return (
    <div className="admin-root">
      <AdminNavbar current={section} onNavigate={setSection} onLogout={onLogout} />
      <main className="admin-main">
        {section === 'Dealer' && <DealerPage />}
        {section === 'Cars' && (
          <div className="placeholder">
            <h2>Cars Management (Under Development . . . .)</h2>
          </div>
        )}
      </main>
    </div>
  )
}

function App() {
  const [section, setSection] = useState('Dealer')
  const [token, setToken] = useState(localStorage.getItem('admin_access_token') || null)

  const handleLogin = (t) => setToken(t)
  const handleLogout = () => {
    localStorage.removeItem('admin_access_token')
    setToken(null)
    setSection('Dealer')
  }

  return (
    <div>
      <Routes>
        <Route path="/login" element={<AdminLogin onLogin={handleLogin} />} />
        <Route
          path="/"
          element={
            <ProtectedRoute token={token}>
              <AdminLayout section={section} setSection={setSection} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={token ? '/' : '/login'} replace />} />
      </Routes>
    </div>
  )
}

export default App
