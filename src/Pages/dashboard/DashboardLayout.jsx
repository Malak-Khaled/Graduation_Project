import { useEffect, useMemo, useState, Suspense } from 'react';
import MedicalBackground from '../../components/MedicalBackground';
import FloatingAI from '../../components/FloatingAI';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import BrandLogo from '../../components/BrandLogo';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { logout, fetchCurrentUser } from '../../features/auth/authSlice';
import { useDirection } from '../../hooks/useDirection';
import { LayoutDashboard, Calendar, CalendarCheck, FileText, Receipt, Bot, LogOut, Menu, X, Search, Sparkles } from 'lucide-react';

const prefetchDashboardByPath = {
  '/dashboard': () => Promise.all([import('./DashboardHome')]),
  '/dashboard/booking': () => Promise.all([import('./BookingPage')]),
  '/dashboard/appointments': () => Promise.all([import('./AppointmentsPage')]),
  '/dashboard/medical-records': () => Promise.all([import('./MedicalRecordsPage')]),
  '/dashboard/invoices': () => Promise.all([import('./InvoicesPage')]),
  '/dashboard/payment-status': () => Promise.all([import('./PaymentStatusPage')]),
  '/dashboard/ai-assistant': () => Promise.all([import('./AIAssistantPage')]),
  '/dashboard/smart-booking': () => Promise.all([import('./SmartBookingAssistantPage')]),
};

function SidebarContent({ user, onClose, onLogout, navItems, t }) {
  return (
    <>
      <div className="flex items-center justify-between gap-2 mb-6 px-2">
        <div className="flex items-center gap-2 min-w-0">
          <BrandLogo className="h-20 w-20 object-contain shrink-0" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <LanguageSwitcher />
          {onClose && (
            <button type="button" onClick={onClose} className="nav-icon-toggle md:hidden text-gray-400 hover:text-blue-600" aria-label={t('common.closeMenu')}>
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const NavIcon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              onMouseEnter={() => prefetchDashboardByPath[item.to]?.()}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'sidebar-nav-item-active' : 'sidebar-nav-item-idle'}`
              }
            >
              <NavIcon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto">
        {user && (
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
              {user.name?.charAt(0) || 'P'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-700 truncate">{user.name || t('patient.layout.patientFallback')}</p>
              <p className="text-xs text-gray-400">{t('patient.layout.patientNum', { id: user.id || '12345' })}</p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 w-full hover:shadow-sm"
        >
          <LogOut size={18} />
          {t('patient.layout.logout')}
        </button>
      </div>
    </>
  );
}

function DashboardOutletFallback() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[50vh] flex-1 items-center justify-center p-8">
      <p className="text-sm font-medium text-gray-500">{t('common.loading')}</p>
    </div>
  );
}

export default function DashboardLayout() {
  const { t } = useTranslation();
  const { sidebarFixedClass, sidebarMainMarginClass } = useDirection();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = useMemo(
    () => [
      { to: '/dashboard', label: t('patient.nav.dashboard'), icon: LayoutDashboard, end: true },
      { to: '/dashboard/booking', label: t('patient.nav.booking'), icon: Search },
      { to: '/dashboard/smart-booking', label: t('patient.nav.smartBooking'), icon: Sparkles },
      { to: '/dashboard/appointments', label: t('patient.nav.appointments'), icon: CalendarCheck },
      { to: '/dashboard/medical-records', label: t('patient.nav.medical'), icon: FileText },
      { to: '/dashboard/invoices', label: t('patient.nav.invoices'), icon: Receipt },
      { to: '/dashboard/ai-assistant', label: t('patient.nav.ai'), icon: Bot },
    ],
    [t]
  );

  useEffect(() => {
    prefetchDashboardByPath['/dashboard/appointments']?.();
  }, []);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    toast.info(t('toast.logoutSuccess'));
    navigate('/login');
  };

  return (
    <div className="relative z-10 min-h-screen flex">
      <MedicalBackground />

      <aside className={`layout-aside-surface hidden md:flex w-64 bg-white/85 backdrop-blur-md shadow-md flex-col py-6 px-4 fixed top-0 h-full z-40 ${sidebarFixedClass}`}>
        <SidebarContent user={user} onLogout={handleLogout} navItems={navItems} t={t} />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setSidebarOpen(false)} />
          <aside className={`layout-aside-surface absolute top-0 h-full w-64 bg-white/90 backdrop-blur-md shadow-xl flex flex-col py-6 px-4 z-50 ${sidebarFixedClass}`}>
            <SidebarContent
              user={user}
              onClose={() => setSidebarOpen(false)}
              onLogout={handleLogout}
              navItems={navItems}
              t={t}
            />
          </aside>
        </div>
      )}

      <main className={`relative z-[5] flex min-h-screen flex-1 flex-col bg-white/65 backdrop-blur-md ${sidebarMainMarginClass}`}>
        <div className="layout-mobile-topbar md:hidden bg-white/90 backdrop-blur-md shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <BrandLogo className="h-20 w-20 object-contain" />
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button type="button" onClick={() => setSidebarOpen(true)} className="nav-icon-toggle text-gray-600" aria-label={t('common.openMenu')}>
              <Menu size={24} />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <Suspense fallback={<DashboardOutletFallback />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
      <FloatingAI role="patient" />
    </div>
  );
}
