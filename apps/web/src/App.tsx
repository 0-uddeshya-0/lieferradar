import { Navigate, Outlet, Route, Routes, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Upload, LogOut, UsersRound } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { NewOrderPage } from './pages/NewOrderPage';
import { ImportPage } from './pages/ImportPage';
import { SupplierStatusPage } from './pages/SupplierStatusPage';
import { TeamPage } from './pages/TeamPage';
import { InvitePage } from './pages/InvitePage';
import { DemoBanner } from './demo/DemoBanner';
import { isDemoMode } from './demo/config';
import { useI18n } from './i18n';
import { LanguageToggle } from './i18n/LanguageToggle';
import { BrandMark } from './components/BrandMark';

function ProtectedLayout() {
  const { isAuthenticated, isLoading, logout, organization } = useAuth();
  const location = useLocation();
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        {t('common.loading')}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={isDemoMode ? '/' : '/login'} state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen">
      {isDemoMode && <DemoBanner />}
      <header className="bg-white/90 backdrop-blur border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
              <BrandMark />
              <span className="text-lg font-bold text-brand-900">LieferRadar</span>
            </Link>
            <nav className="flex items-center gap-1">
              <NavLink to="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />}>
                {t('nav.dashboard')}
              </NavLink>
              <NavLink to="/suppliers" icon={<Users className="w-4 h-4" />}>
                {t('nav.suppliers')}
              </NavLink>
              <NavLink to="/import" icon={<Upload className="w-4 h-4" />}>
                {t('nav.import')}
              </NavLink>
              <NavLink to="/team" icon={<UsersRound className="w-4 h-4" />}>
                {t('nav.team')}
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {organization && (
              <span className="hidden md:block text-sm text-gray-500 truncate max-w-[180px]">
                {organization.name}
              </span>
            )}
            <LanguageToggle />
            {!isDemoMode && (
              <button
                type="button"
                onClick={() => logout().then(() => { window.location.href = '/login'; })}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4" />
                {t('nav.logout')}
              </button>
            )}
          </div>
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
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{children}</span>
    </Link>
  );
}

export default function App() {
  return (
    <Routes>
      {isDemoMode && <Route path="/" element={<LandingPage />} />}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/s/:token" element={<SupplierStatusPage />} />
      <Route path="/invite/:token" element={<InvitePage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/orders/new" element={<NewOrderPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/team" element={<TeamPage />} />
      </Route>
      {!isDemoMode && <Route path="/" element={<Navigate to="/dashboard" replace />} />}
      <Route path="*" element={<Navigate to={isDemoMode ? '/' : '/dashboard'} replace />} />
    </Routes>
  );
}
