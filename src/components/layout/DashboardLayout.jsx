import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../context/ToastContext';
import BrandLogo from '../BrandLogo';
import { logout } from '../../features/auth/authSlice';
import { LayoutDashboard, UserCircle, Calendar, CalendarCheck, FileText, Receipt, Bot, LogOut, Menu, X } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, end: true },
  { to: '/dashboard/booking', label: 'الحجز', icon: Calendar },
  { to: '/dashboard/appointments', label: 'مواعيدي', icon: CalendarCheck },
  { to: '/dashboard/medical-records', label: 'ملفي الطبي', icon: FileText },
  { to: '/dashboard/invoices', label: 'الفواتير', icon: Receipt },
  { to: '/dashboard/profile', label: 'الملف الشخصي', icon: UserCircle },
  { to: '/dashboard/ai-assistant', label: 'المساعد الذكي', icon: Bot },
];

function SidebarContent({ user, onClose, onLogout }) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between gap-2 mb-8 px-2">
        <div className="flex items-center gap-2">
          <BrandLogo className="h-20 w-20 object-contain" />
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const NavIcon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                }`
              }
            >
              <NavIcon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="mt-auto">
        {user && (
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
              {user.name?.charAt(0) || 'م'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-700 truncate">{user.name || 'المريض'}</p>
              <p className="text-xs text-gray-400">مريض رقم #{user.id || '12345'}</p>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 w-full transition-all"
        >
          <LogOut size={18} />
          تسجيل الخروج
        </button>
      </div>
    </>
  );
}

export default function DashboardLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    toast.info('تم تسجيل الخروج بنجاح');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex" style={{ direction: 'rtl' }}>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white shadow-md flex-col py-6 px-4 fixed h-full z-40">
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl flex flex-col py-6 px-4 z-50">
            <SidebarContent
              user={user}
              onClose={() => setSidebarOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:mr-64 bg-gray-50 min-h-screen">
        {/* Mobile Top Bar */}
        <div className="md:hidden bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <BrandLogo className="h-20 w-20 object-contain" />
          </div>
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600 hover:text-gray-800">
            <Menu size={24} />
          </button>
        </div>

        <Outlet />
      </main>
    </div>
  );
}