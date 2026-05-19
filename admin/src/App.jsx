import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import "./styles/admin.css";

import { AuthProvider, useAuth } from "./context/AuthContext";
import AdminNavbar from "./components/AdminNavbar";
import PermissionRoute from "./components/PermissionRoute";

import AdminLogin from "./pages/AdminLogin";
import DealerPage from "./pages/DealerPage";
import CarsPage from "./pages/CarsPage";
import EditCarPage from "./pages/EditCarPage";
import AdminDealerSubscription from "./pages/AdminDealerSubscription";
import ProducersPage from "./pages/ProducersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import CarDataDownload from "./pages/CarDataDownload";

/**
 * Layout component for authenticated pages
 */
function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="admin-root">
      <AdminNavbar onLogout={logout} />
      <main className="admin-main">
        <Routes>
          <Route index element={<DealerPage />} />

          <Route
            path="cars"
            element={
              <PermissionRoute permission="cars">
                <CarsPage />
              </PermissionRoute>
            }
          />

          <Route
            path="subscriptions"
            element={
              <PermissionRoute permission="subscriptions">
                <AdminDealerSubscription />
              </PermissionRoute>
            }
          />

          <Route
            path="producers"
            element={
              <PermissionRoute permission="producers">
                <ProducersPage />
              </PermissionRoute>
            }
          />

          <Route
            path="analytics"
            element={
              <PermissionRoute permission="analytics">
                <AnalyticsPage />
              </PermissionRoute>
            }
          />

          <Route
            path="data-download"
            element={
              <PermissionRoute permission="data_download">
                <CarDataDownload />
              </PermissionRoute>
            }
          />

          <Route
            path="car-edit/:carId"
            element={
              <PermissionRoute permission="cars">
                <EditCarPage />
              </PermissionRoute>
            }
          />

          {/* Catch-all for undefined routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

/**
 * Protected Admin Layout that checks authentication
 */
function ProtectedAdminLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout />;
}

/**
 * Main App component
 */
function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public login route */}
        <Route path="/login" element={<AdminLogin />} />

        {/* Protected admin routes */}
        <Route path="/*" element={<ProtectedAdminLayout />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
