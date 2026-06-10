import { Navigate, Outlet, Route, Routes, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Upload, LogOut } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { NewOrderPage } from './pages/NewOrderPage';
import { ImportPage } from './pages/ImportPage';
import { SupplierStatusPage } from './pages/SupplierStatusPage';

function ProtectedLayout() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Laden...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-lg font-bold text-brand-900">
              LieferRadar
            </Link>
            <nav className="flex items-center gap-1">
              <NavLink to="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />}>
                Dashboard
              </NavLink>
              <NavLink to="/suppliers" icon={<Users className="w-4 h-4" />}>
                Lieferanten
              </NavLink>
              <NavLink to="/import" icon={<Upload className="w-4 h-4" />}>
                Importieren
              </NavLink>
            </nav>
          </div>
          <button
            type="button"
            onClick={() => logout().then(() => { window.location.href = '/login'; })}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-4 h-4" />
            Abmelden
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) {
  const location = useLocation();
  const active = location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
        active ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/s/:token" element={<SupplierStatusPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/orders/new" element={<NewOrderPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/import" element={<ImportPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
