import { createElement, useEffect, useMemo, useState } from 'react';
import { Users, Stethoscope, Calendar, Receipt, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../api/axiosInstance';
import { ADMIN } from '../../api/endpoints';
import { translateAppointmentStatus, translateDoctorActiveStatus } from '../../utils/i18nStatus';
import { getApiErrorMessage } from '../../utils/apiError';
import { useToast } from '../../context/ToastContext';

function StatusBadge({ status, t }) {
  const styles = {
    مؤكد: 'bg-blue-100 text-blue-600',
    confirmed: 'bg-blue-100 text-blue-600',
    جاري: 'bg-green-100 text-green-600',
    inProgress: 'bg-green-100 text-green-600',
    مكتمل: 'bg-gray-100 text-gray-500',
    completed: 'bg-gray-100 text-gray-500',
    ملغي: 'bg-red-100 text-red-500',
    cancelled: 'bg-red-100 text-red-500',
    pending: 'bg-yellow-100 text-yellow-600',
    نشط: 'bg-green-100 text-green-600',
    active: 'bg-green-100 text-green-600',
    'غير نشط': 'bg-gray-100 text-gray-500',
    inactive: 'bg-gray-100 text-gray-500',
  };
  const label =
    status === 'نشط' || status === 'غير نشط' ? translateDoctorActiveStatus(status, t) : translateAppointmentStatus(status, t);
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status] || 'bg-gray-100 text-gray-500'}`}>{label}</span>;
}

export default function AdminHome() {
  const { user } = useSelector((state) => state.auth);
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const isEn = i18n.language?.startsWith('en');
  const Chevron = isEn ? ChevronRight : ChevronLeft;
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [dashboardDoctors, setDashboardDoctors] = useState([]);
  const [dashboardAppointments, setDashboardAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [statsRes, doctorsRes, appointmentsRes, invoicesRes] = await Promise.all([
          axiosInstance.get(ADMIN.STATS),
          axiosInstance.get(ADMIN.DOCTORS),
          axiosInstance.get(ADMIN.APPOINTMENTS),
          axiosInstance.get(ADMIN.INVOICES_REPORT),
        ]);

        const stats = statsRes.data?.stats || {};
        setDashboardStats(stats);

        const doctors = (doctorsRes.data?.doctors || []).slice(0, 3).map((doc) => ({
          id: doc.id,
          name: doc.name,
          specialty: doc.specialty || t('doctor.patients.notSpecified'),
          status: doc.is_active ? 'نشط' : 'غير نشط',
          img: doc.avatar_url || `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 90)}.jpg`,
        }));
        setDashboardDoctors(doctors);

        const appointments = (appointmentsRes.data?.appointments || []).slice(0, 4).map((apt) => ({
          id: apt.id,
          patient: apt.patient?.name || t('doctor.home.unknownPatient'),
          doctor: apt.doctor?.name || '-',
          time: apt.appointment_time || '-',
          status: apt.status || 'pending',
        }));
        setDashboardAppointments(appointments);
        setInvoices(Array.isArray(invoicesRes.data?.invoices) ? invoicesRes.data.invoices : []);
      } catch (err) {
        toast.error(getApiErrorMessage(err, t('authErrors.default')));
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only dashboard fetch
  }, [t]);

  const monthlyRevenue = useMemo(() => {
    const months = t('admin.home.monthsShort', { returnObjects: true }) || [];
    if (!Array.isArray(months) || months.length === 0) return [];
    const sums = new Array(months.length).fill(0);
    const safeInvoices = Array.isArray(invoices) ? invoices : [];

    safeInvoices.forEach((inv) => {
      const amount = Number(inv?.amount || 0);
      const rawDate = inv?.date || null;
      const parsed = rawDate ? new Date(rawDate) : null;
      if (!parsed || Number.isNaN(parsed.getTime())) return;
      const idx = parsed.getMonth();
      if (idx >= 0 && idx < sums.length) sums[idx] += amount;
    });

    return months.map((month, i) => ({ month, value: sums[i] || 0 }));
  }, [t, invoices]);

  const maxVal = Math.max(...monthlyRevenue.map((m) => m.value), 1);

  const stats = useMemo(
    () => [
      {
        label: t('admin.home.stats.patients'),
        value: dashboardStats?.total_patients ?? t('admin.home.statValues.patients'),
        change: t('admin.home.statChanges.patients'),
        up: true,
        icon: Users,
        color: 'bg-blue-50 text-blue-600',
      },
      {
        label: t('admin.home.stats.doctors'),
        value: dashboardStats?.total_doctors ?? t('admin.home.statValues.doctors'),
        change: t('admin.home.statChanges.doctors'),
        up: true,
        icon: Stethoscope,
        color: 'bg-purple-50 text-purple-600',
      },
      {
        label: t('admin.home.stats.todayAppts'),
        value: dashboardStats?.pending_appointments ?? t('admin.home.statValues.appts'),
        change: t('admin.home.statChanges.appts'),
        up: false,
        icon: Calendar,
        color: 'bg-orange-50 text-orange-500',
      },
      {
        label: t('admin.home.stats.revenue'),
        value: dashboardStats?.completed_appointments ?? t('admin.home.statValues.revenue'),
        change: t('admin.home.statChanges.revenue'),
        up: true,
        icon: Receipt,
        color: 'bg-green-50 text-green-600',
      },
    ],
    [t, dashboardStats]
  );

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen w-full">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-800 text-start">
          {t('admin.home.welcome', { name: user?.name || t('admin.home.defaultName') })}
        </h1>
        <p className="text-gray-500 text-sm mt-1 text-start">{loading ? t('common.loading') : t('admin.home.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, change, up, icon, color }) => (
          <div key={label} className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-1 text-xs font-semibold ${up ? 'text-green-500' : 'text-red-500'}`}>
                {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {change}
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{createElement(icon, { size: 18 })}</div>
            </div>
            <div>
              <p className="text-xs text-gray-400 text-start">{label}</p>
              <p className="font-extrabold text-gray-800 text-lg mt-0.5 text-start">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card-hover lg:col-span-2 bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-5 gap-2">
            <span className="text-sm text-gray-400">{t('admin.home.chartSubtitle')}</span>
            <h3 className="font-bold text-gray-800 text-start">{t('admin.home.chartTitle')}</h3>
          </div>
          <div className="flex items-end gap-3 h-32">
            {monthlyRevenue.map(({ month, value }) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-blue-600 rounded-t-lg transition-all hover:bg-blue-700"
                  style={{ height: `${(value / maxVal) * 100}%`, minHeight: '8px' }}
                />
                <span className="text-xs text-gray-400">{month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-hover-panel bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 gap-2">
            <Link to="/admin/doctors" className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:underline">
              <Chevron size={16} />
              {t('admin.home.viewAll')}
            </Link>
            <h3 className="font-bold text-gray-800 text-start">{t('admin.home.doctorsCardTitle')}</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {dashboardDoctors.length === 0 ? (
              <div className="px-5 py-8 text-sm text-gray-400 text-center">{t('admin.appointments.empty')}</div>
            ) : (
              dashboardDoctors.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 px-5 py-3">
                  <StatusBadge status={doc.status} t={t} />
                  <div className="flex-1 text-start min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{doc.name}</p>
                    <p className="text-xs text-blue-500">{doc.specialty}</p>
                  </div>
                  <img src={doc.img} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card-hover-panel bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 gap-2">
          <Link to="/admin/appointments" className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:underline">
            <Chevron size={16} />
            {t('admin.home.viewAll')}
          </Link>
          <h3 className="font-bold text-gray-800 text-start">{t('admin.home.apptsCardTitle')}</h3>
        </div>
        <div className="hidden md:grid grid-cols-4 gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 text-center">
          <span>{t('admin.home.tableStatus')}</span>
          <span>{t('admin.home.tableTime')}</span>
          <span>{t('admin.home.tableDoctor')}</span>
          <span className="text-start">{t('admin.home.tablePatient')}</span>
        </div>
        <div className="divide-y divide-gray-50">
          {dashboardAppointments.length === 0 ? (
            <div className="px-5 py-8 text-sm text-gray-400 text-center">{t('admin.appointments.empty')}</div>
          ) : (
            dashboardAppointments.map((apt) => (
              <div key={apt.id} className="px-5 py-3">
                <div className="md:hidden flex items-center justify-between gap-2">
                  <StatusBadge status={apt.status} t={t} />
                  <div className="text-start min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{apt.patient}</p>
                    <p className="text-xs text-gray-400">
                      {apt.doctor} - {apt.time}
                    </p>
                  </div>
                </div>
                <div className="hidden md:grid grid-cols-4 gap-3 items-center text-center">
                  <div className="flex justify-center">
                    <StatusBadge status={apt.status} t={t} />
                  </div>
                  <span className="text-sm text-gray-500">{apt.time}</span>
                  <span className="text-sm text-gray-500">{apt.doctor}</span>
                  <span className="text-sm font-semibold text-gray-800 text-start">{apt.patient}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
