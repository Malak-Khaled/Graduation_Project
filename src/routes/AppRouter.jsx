import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import BrandLogo from '../components/BrandLogo';
import ProtectedRoute from './ProtectedRoute';

// Public Pages
const HomePage = lazy(() => import('../Pages/Public/HomePage'));
const LoginPage = lazy(() => import('../Pages/Public/LoginPage'));
const RegisterPage = lazy(() => import('../Pages/Public/RegisterPage'));
const ContactPage = lazy(() => import('../Pages/Public/ContactPage'));
const AboutPage = lazy(() => import('../Pages/Public/AboutPage'));
const DoctorsPage = lazy(() => import('../Pages/Public/DoctorsPage'));
const NotFoundPage = lazy(() => import('../Pages/Public/NotFoundPage'));
const ForgotPasswordPage = lazy(() => import('../Pages/Public/ForgotPasswordPage'));

// Patient Dashboard
const DashboardLayout = lazy(() => import('../Pages/dashboard/DashboardLayout'));
const DashboardHome = lazy(() => import('../Pages/dashboard/DashboardHome'));
const BookingPage = lazy(() => import('../Pages/dashboard/BookingPage'));
const AppointmentsPage = lazy(() => import('../Pages/dashboard/AppointmentsPage'));
const MedicalRecordsPage = lazy(() => import('../Pages/dashboard/MedicalRecordsPage'));
const InvoicesPage = lazy(() => import('../Pages/dashboard/InvoicesPage'));
const PaymentStatusPage = lazy(() => import('../Pages/dashboard/PaymentStatusPage'));
const AIAssistantPage = lazy(() => import('../Pages/dashboard/AIAssistantPage'));
const SmartBookingAssistantPage = lazy(() => import('../Pages/dashboard/SmartBookingAssistantPage'));
const PatientProfilePage = lazy(() => import('../Pages/dashboard/PatientProfilePage'));

// Doctor Dashboard
const DoctorLayout = lazy(() => import('../Pages/doctor/DoctorLayout'));
const DoctorHome = lazy(() => import('../Pages/doctor/DoctorHome'));
const DoctorAppointmentsPage = lazy(() => import('../Pages/doctor/DoctorAppointmentsPage'));
const DoctorPatientsPage = lazy(() => import('../Pages/doctor/DoctorPatientsPage'));
const DoctorPrescriptionsPage = lazy(() => import('../Pages/doctor/DoctorPrescriptionsPage'));
const DoctorReportsPage = lazy(() => import('../Pages/doctor/DoctorReportsPage'));
const DoctorAIAssistantPage = lazy(() => import('../Pages/doctor/DoctorAIAssistantPage'));
const DoctorProfilePage = lazy(() => import('../Pages/doctor/DoctorProfilePage'));

// Admin Dashboard
const AdminLayout = lazy(() => import('../Pages/admin/AdminLayout'));
const AdminHome = lazy(() => import('../Pages/admin/AdminHome'));
const AdminDoctorsPage = lazy(() => import('../Pages/admin/AdminDoctorsPage'));
const AdminStaffPage = lazy(() => import('../Pages/admin/AdminStaffPage'));
const AdminPatientsPage = lazy(() => import('../Pages/admin/AdminPatientsPage'));
const AdminAppointmentsPage = lazy(() => import('../Pages/admin/AdminAppointmentsPage'));
const AdminInvoicesPage = lazy(() => import('../Pages/admin/AdminInvoicesPage'));
const AdminSettingsPage = lazy(() => import('../Pages/admin/AdminSettingsPage'));

function PublicOnlyRoute({ children }) {
  const { token, role } = useSelector((state) => state.auth);
  if (!token) return children;
  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'doctor') return <Navigate to="/doctor" replace />;
  return <Navigate to="/dashboard" replace />;
}

function RouteLoader() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white/70">
      <BrandLogo className="h-20 w-20 object-contain" />
      <p className="text-sm font-semibold text-gray-600">{t('routeLoader.loading')}</p>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Patient Dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRole="patient">
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="booking" element={<BookingPage />} />
            <Route path="smart-booking" element={<SmartBookingAssistantPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="medical-records" element={<MedicalRecordsPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="payment-status" element={<PaymentStatusPage />} />
            <Route path="ai-assistant" element={<AIAssistantPage />} />
            <Route path="profile" element={<PatientProfilePage />} />
          </Route>

          {/* Doctor Dashboard */}
          <Route path="/doctor" element={
            <ProtectedRoute allowedRole="doctor">
              <DoctorLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DoctorHome />} />
            <Route path="appointments" element={<DoctorAppointmentsPage />} />
            <Route path="patients" element={<DoctorPatientsPage />} />
            <Route path="prescriptions" element={<DoctorPrescriptionsPage />} />
            <Route path="reports" element={<DoctorReportsPage />} />
            <Route path="ai-assistant" element={<DoctorAIAssistantPage />} />
            <Route path="profile" element={<DoctorProfilePage />} />
          </Route>

          {/* Admin Dashboard */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminHome />} />
            <Route path="doctors" element={<AdminDoctorsPage />} />
            <Route path="staff" element={<AdminStaffPage />} />
            <Route path="patients" element={<AdminPatientsPage />} />
            <Route path="appointments" element={<AdminAppointmentsPage />} />
            <Route path="invoices" element={<AdminInvoicesPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}