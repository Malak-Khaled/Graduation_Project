import { useEffect, useMemo, useState, Suspense } from 'react';
import MedicalBackground from '../../components/MedicalBackground';
import FloatingAI from '../../components/FloatingAI';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import BrandLogo from '../../components/BrandLogo';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import NotificationBell from '../../components/NotificationBell';
import { logout } from '../../features/auth/authSlice';
import { useDirection } from '../../hooks/useDirection';
import { LayoutDashboard, Users, Stethoscope, Calendar, Receipt, Settings, LogOut, Menu, X, Shield } from 'lucide-react';

const prefetchAdminByPath = {
  '/admin': () => Promise.all([import('./AdminHome')]),
  '/admin/doctors': () => Promise.all([import('./AdminDoctorsPage')]),
  '/admin/staff': () => Promise.all([import('./AdminStaffPage')]),
  '/admin/patients': () => Promise.all([import('./AdminPatientsPage')]),
  '/admin/appointments': () => Promise.all([import('./AdminAppointmentsPage')]),
  '/admin/invoices': () => Promise.all([import('./AdminInvoicesPage')]),
  '/admin/settings': () => Promise.all([import('./AdminSettingsPage')]),
};

function SidebarContent({ user, onClose, onLogout, navItems, t }) {
  return (
    <>
      <div className="flex items-center justify-between mb-6 px-2 gap-2">
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

      <div className="bg-gradient-to-l from-blue-600 to-blue-700 rounded-2xl p-4 mb-6 text-center">
        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-2xl mx-auto mb-2">
          {user?.name?.charAt(0) || 'أ'}
        </div>
        <p className="font-bold text-white text-sm">{user?.name || 'أحمد محمد'}</p>
        <p className="text-blue-200 text-xs mt-0.5">{t('admin.layout.systemAdmin')}</p>
        <div className="flex items-center justify-center gap-1 mt-1">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs text-green-300">{t('admin.layout.active')}</span>
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
              onMouseEnter={() => prefetchAdminByPath[item.to]?.()}
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

function AdminOutletFallback() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-8">
      <p className="text-sm font-medium text-gray-500">{t('common.loading')}</p>
    </div>
  );
}

export default function AdminLayout() {
  const { t } = useTranslation();
  const { sidebarFixedClass, sidebarMainMarginClass } = useDirection();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = useMemo(
    () => [
      { to: '/admin', label: t('admin.nav.dashboard'), icon: LayoutDashboard, end: true },
      { to: '/admin/doctors', label: t('admin.nav.doctors'), icon: Stethoscope },
      { to: '/admin/staff', label: t('admin.nav.staff'), icon: Shield },
      { to: '/admin/patients', label: t('admin.nav.patients'), icon: Users },
      { to: '/admin/appointments', label: t('admin.nav.appointments'), icon: Calendar },
      { to: '/admin/invoices', label: t('admin.nav.invoices'), icon: Receipt },
      { to: '/admin/settings', label: t('admin.nav.settings'), icon: Settings },
    ],
    [t]
  );

  useEffect(() => {
    prefetchAdminByPath['/admin/appointments']?.();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    toast.info(t('toast.logoutSuccess'));
    navigate('/login');
  };

  return (
    <div className="relative z-10 min-h-screen flex">
      <MedicalBackground />
      <aside className={`layout-aside-surface hidden md:flex w-64 bg-white shadow-md flex-col py-6 px-4 fixed top-0 h-full z-40 border-e border-gray-100 ${sidebarFixedClass}`}>
        <SidebarContent user={user} onLogout={handleLogout} navItems={navItems} t={t} />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setSidebarOpen(false)} />
          <aside className={`layout-aside-surface absolute top-0 h-full w-64 bg-white shadow-xl flex flex-col py-6 px-4 z-50 border-e border-gray-100 ${sidebarFixedClass}`}>
            <SidebarContent user={user} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} navItems={navItems} t={t} />
          </aside>
        </div>
      )}

      <main className={`relative z-10 isolate min-h-screen flex-1 w-full bg-slate-50/95 ${sidebarMainMarginClass}`}>
        <div className="layout-mobile-topbar md:hidden bg-white/90 backdrop-blur-md shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <NotificationBell />
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <BrandLogo className="h-20 w-20 object-contain" />
          </div>
          <button type="button" onClick={() => setSidebarOpen(true)} className="nav-icon-toggle text-gray-600" aria-label={t('common.openMenu')}>
            <Menu size={24} />
          </button>
        </div>
        <Suspense fallback={<AdminOutletFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <FloatingAI role="admin" />
    </div>
  );
}
