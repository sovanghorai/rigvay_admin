import { useState } from 'react'
import './App.css'
import './styles/admin.css'
import AdminNavbar from './components/AdminNavbar'
import DealerPage from './pages/DealerPage'
import AdminLogin from './pages/AdminLogin'
import { Routes, Route, Navigate } from 'react-router-dom'
import CarsPage from "./pages/CarsPage";
import AdminDealerSubscription from './pages/AdminDealerSubscription' // ← new page

function ProtectedRoute({ token, children }) {
  if (!token) return <Navigate to="/login" replace />
  return children
}

import { Outlet } from 'react-router-dom'

function AdminLayout({ onLogout }) {
  return (
    <div className="admin-root">
      <AdminNavbar onLogout={onLogout} />
      <main className="admin-main">
        {/* nested routes will render here */}
        <Outlet />
      </main>
    </div>
  )
}


function App() {
  const [token, setToken] = useState(localStorage.getItem('admin_access_token') || null)

  const handleLogin = (t) => setToken(t)
  const handleLogout = () => {
    localStorage.removeItem('admin_access_token')
    setToken(null)
  }

  return (
    <div>
      <Routes>
        <Route path="/login" element={<AdminLogin onLogin={handleLogin} />} />
        <Route
          path="/"
          element={
            <ProtectedRoute token={token}>
              <AdminLayout onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<DealerPage />} />
          <Route path="cars" element={<CarsPage />} />
          <Route path="subscriptions" element={<AdminDealerSubscription />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        <Route path="*" element={<Navigate to={token ? '/' : '/login'} replace />} />
      </Routes>
    </div>
  )
}

export default App
