import { createElement, useEffect, useMemo, useState, Suspense } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import { logout } from '../../features/auth/authSlice';
import { LayoutDashboard, Users, Calendar, FileText, BarChart2, Settings, LogOut, Menu, X, Search } from 'lucide-react';
import BrandLogo from '../../components/BrandLogo';
import MedicalBackground from '../../components/MedicalBackground';
import FloatingAI from '../../components/FloatingAI';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import NotificationBell from '../../components/NotificationBell';
import { useDirection } from '../../hooks/useDirection';

const prefetchDoctorByPath = {
  '/doctor': () => Promise.all([import('./DoctorHome')]),
  '/doctor/patients': () => Promise.all([import('./DoctorPatientsPage')]),
  '/doctor/appointments': () => Promise.all([import('./DoctorAppointmentsPage')]),
  '/doctor/prescriptions': () => Promise.all([import('./DoctorPrescriptionsPage')]),
  '/doctor/reports': () => Promise.all([import('./DoctorReportsPage')]),
  '/doctor/profile': () => Promise.all([import('./DoctorProfilePage')]),
};

function SidebarContent({ user, onClose, onLogout, navItems, t }) {
  const specialtyLabel = user?.specialty || t('doctor.layout.specialty');
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 px-2 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <BrandLogo className="h-20 w-20 object-contain shrink-0" />
        </div>
        <div className="flex items-center gap-2 shrink-0 md:hidden">
          <LanguageSwitcher />
          {onClose && (
            <button type="button" onClick={onClose} className="nav-icon-toggle md:hidden text-gray-400 hover:text-blue-600" aria-label={t('common.closeMenu')}>
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="bg-blue-50 rounded-2xl p-3 mb-5 text-end">
        <p className="text-xs text-blue-400 font-semibold">{t('doctor.layout.clinicSystem')}</p>
        <p className="text-sm font-bold text-blue-700 mt-0.5">{t('doctor.layout.clinicName')}</p>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            onMouseEnter={() => prefetchDoctorByPath[to]?.()}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'sidebar-nav-item-active' : 'sidebar-nav-item-idle'}`
            }
          >
            {createElement(icon, { size: 18 })}
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="flex-1 text-end min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate">{user?.name || 'د. أحمد محمد'}</p>
            <p className="text-xs text-gray-400">{specialtyLabel}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
            {user?.name?.charAt(0) || 'د'}
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 w-full hover:shadow-sm"
        >
          <LogOut size={16} />
          {t('patient.layout.logout')}
        </button>
      </div>
    </div>
  );
}

function DoctorOutletFallback() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-8">
      <p className="text-sm font-medium text-gray-500">{t('common.loading')}</p>
    </div>
  );
}

export default function DoctorLayout() {
  const { t } = useTranslation();
  const { sidebarFixedClass, sidebarMainMarginClass } = useDirection();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const specialtyLabel = user?.specialty || t('doctor.layout.specialty');

  const navItems = useMemo(
    () => [
      { to: '/doctor', label: t('doctor.nav.dashboard'), icon: LayoutDashboard, end: true },
      { to: '/doctor/patients', label: t('doctor.nav.patients'), icon: Users },
      { to: '/doctor/appointments', label: t('doctor.nav.appointments'), icon: Calendar },
      { to: '/doctor/prescriptions', label: t('doctor.nav.prescriptions'), icon: FileText },
      { to: '/doctor/reports', label: t('doctor.nav.reports'), icon: BarChart2 },
      { to: '/doctor/profile', label: t('doctor.nav.profileSettings'), icon: Settings },
    ],
    [t]
  );

  useEffect(() => {
    prefetchDoctorByPath['/doctor/appointments']?.();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    toast.info(t('toast.logoutSuccess'));
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      <MedicalBackground />

      <aside className={`layout-aside-surface hidden md:flex w-64 bg-white/90 backdrop-blur-md shadow-sm flex-col py-6 px-4 fixed top-0 h-full z-40 ${sidebarFixedClass}`}>
        <SidebarContent user={user} onLogout={handleLogout} navItems={navItems} t={t} />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className={`layout-aside-surface absolute top-0 h-full w-64 bg-white shadow-xl flex flex-col py-6 px-4 z-50 ${sidebarFixedClass}`}>
            <SidebarContent user={user} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} navItems={navItems} t={t} />
          </aside>
        </div>
      )}

      <main className={`flex-1 min-h-screen relative z-10 ${sidebarMainMarginClass}`}>
        <div className="layout-mobile-topbar bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 min-w-64">
              <Search size={15} className="text-gray-400" />
              <input
                type="text"
                placeholder={t('doctor.layout.searchPh')}
                className="bg-transparent text-sm text-end outline-none placeholder-gray-400 flex-1"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <div className="hidden md:block text-end">
              <p className="text-sm font-bold text-gray-800">{user?.name || 'د. أحمد محمد'}</p>
              <p className="text-xs text-gray-400">{specialtyLabel}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
              {user?.name?.charAt(0) || 'د'}
            </div>
            <button type="button" onClick={() => setSidebarOpen(true)} className="nav-icon-toggle md:hidden text-gray-600" aria-label={t('common.openMenu')}>
              <Menu size={24} />
            </button>
          </div>
        </div>
        <Suspense fallback={<DoctorOutletFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <FloatingAI role="doctor" />
    </div>
  );
}
