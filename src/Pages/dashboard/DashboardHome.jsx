import { createElement, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useToast } from '../../context/ToastContext';
import { Calendar, FileText, Upload, Clock, MapPin, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { APPOINTMENTS, MEDICAL_RECORDS } from '../../api/endpoints';
import { getApiErrorMessage } from '../../utils/apiError';
import AsyncState from '../../components/AsyncState';

export default function DashboardHome() {
  const { t } = useTranslation();
  const { user } = useSelector((s) => s.auth);
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const profilePercent = 75;

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [apptRes, medRes] = await Promise.all([
          axiosInstance.get(APPOINTMENTS.LIST),
          axiosInstance.get(MEDICAL_RECORDS.ROOT),
        ]);
        if (!mounted) return;
        const apptRows = Array.isArray(apptRes.data)
          ? apptRes.data
          : Array.isArray(apptRes.data?.appointments)
            ? apptRes.data.appointments
            : [...(apptRes.data?.upcoming || []), ...(apptRes.data?.previous || [])];
        setAppointments(apptRows);
        setAttachments(Array.isArray(medRes.data?.attachments) ? medRes.data.attachments : []);
      } catch (err) {
        if (!mounted) return;
        toast.error(getApiErrorMessage(err, t('patient.dashboardHome.loadError', { defaultValue: 'Failed to load dashboard data' })));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [t, toast]);

  const upcoming = useMemo(
    () => appointments.filter((a) => a.status !== 'completed' && a.status !== 'cancelled'),
    [appointments]
  );
  const nextAppointment = useMemo(() => {
    if (!upcoming.length) return null;
    const sorted = [...upcoming].sort((a, b) => {
      const da = new Date(`${a.appointment_date || a.date}T${String(a.appointment_time || a.time || '00:00:00').slice(0, 8)}`);
      const db = new Date(`${b.appointment_date || b.date}T${String(b.appointment_time || b.time || '00:00:00').slice(0, 8)}`);
      return da - db;
    });
    return sorted[0];
  }, [upcoming]);

  const stats = useMemo(
    () => [
      {
        label: t('patient.dashboardHome.stats.nextAppt'),
        value: nextAppointment ? String(nextAppointment.appointment_date || nextAppointment.date || '—') : '—',
        icon: Calendar,
        color: 'bg-blue-50 text-blue-600',
        iconBg: 'bg-blue-100',
      },
      {
        label: t('patient.dashboardHome.stats.appts'),
        value: String(appointments.length),
        icon: Calendar,
        color: 'bg-green-50 text-green-600',
        iconBg: 'bg-green-100',
      },
      {
        label: t('patient.dashboardHome.stats.docs'),
        value: String(attachments.length),
        icon: FileText,
        color: 'bg-purple-50 text-purple-600',
        iconBg: 'bg-purple-100',
      },
      {
        label: t('patient.dashboardHome.stats.blood'),
        value: user?.bloodType || 'O+',
        icon: () => <span className="text-red-500 text-lg font-extrabold">🩸</span>,
        color: 'bg-red-50 text-red-500',
        iconBg: 'bg-red-100',
      },
    ],
    [appointments.length, attachments.length, nextAppointment, t, user?.bloodType]
  );

  const quickActions = useMemo(
    () => [
      { label: t('patient.dashboardHome.quick.upload'), icon: Upload, to: '/dashboard/medical-records', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
      { label: t('patient.dashboardHome.quick.visits'), icon: Clock, to: '/dashboard/medical-records', color: 'bg-green-50 text-green-600 hover:bg-green-100' },
      { label: t('patient.dashboardHome.quick.rx'), icon: FileText, to: '/dashboard/medical-records', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
    ],
    [t]
  );

  const profileSteps = useMemo(
    () => [
      { label: t('patient.dashboardHome.steps.personal'), done: true },
      { label: t('patient.dashboardHome.steps.history'), done: true },
      { label: t('patient.dashboardHome.steps.meds'), done: false },
    ],
    [t]
  );

  const img = 'https://randomuser.me/api/portraits/men/32.jpg';

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          to="/dashboard/profile"
          className="inline-flex items-center gap-2 border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-600 px-4 py-2 rounded-xl text-sm font-semibold hover:border-blue-400 hover:text-blue-600 transition-all"
        >
          <Edit size={14} /> {t('patient.dashboardHome.editProfile')}
        </Link>
        <div className="text-start">
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-800">
            {t('patient.dashboardHome.welcome', { name: user?.name || '—' })}
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">{t('patient.dashboardHome.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon, iconBg }) => (
          <div key={label} className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-4 text-start">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ms-auto ${iconBg}`}>
              {createElement(icon, { size: 18 })}
            </div>
            <p className="text-sm font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="card-hover lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-blue-500 font-semibold px-2.5 py-1 bg-blue-50 rounded-full">
              {nextAppointment ? t('patient.appointments.upcoming') : '—'}
            </span>
            <h3 className="font-bold text-gray-800">{t('patient.dashboardHome.nextApptTitle')}</h3>
          </div>
          <div className="flex items-start gap-3">
            <img src={img} alt={nextAppointment?.doctor?.name || ''} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
            <div className="text-start flex-1">
              <p className="font-extrabold text-gray-800">{nextAppointment?.doctor?.name || '—'}</p>
              <p className="text-xs text-blue-500 mt-0.5">{nextAppointment?.doctor?.specialty || '—'}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-start gap-2 text-xs text-gray-500">
              <Calendar size={13} className="text-blue-400" />
              <span>{nextAppointment?.appointment_date || nextAppointment?.date || '—'}</span>
            </div>
            <div className="flex items-center justify-start gap-2 text-xs text-gray-500">
              <Clock size={13} className="text-blue-400" />
              <span>{nextAppointment?.appointment_time || nextAppointment?.time || '—'}</span>
            </div>
            <div className="flex items-center justify-start gap-2 text-xs text-gray-500">
              <MapPin size={13} className="text-blue-400" />
              <span>{nextAppointment?.doctor?.area || user?.area || '—'}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              type="button"
              onClick={() => toast.info(t('patient.dashboardHome.toastJoin'))}
              className="bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
            >
              <Calendar size={13} /> {t('patient.dashboardHome.join')}
            </button>
            <Link
              to="/dashboard/appointments"
              className="border border-gray-200 text-gray-600 text-xs font-semibold py-2.5 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-colors text-center"
            >
              {t('patient.dashboardHome.viewDetails')}
            </Link>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-blue-600 font-extrabold text-lg">{profilePercent}%</span>
              <h3 className="font-bold text-gray-800">{t('patient.dashboardHome.profileTitle')}</h3>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-700" style={{ width: `${profilePercent}%` }} />
            </div>
            <p className="text-xs text-gray-500 text-start mb-3 leading-relaxed">{t('patient.dashboardHome.profileHint')}</p>
            <div className="flex items-center justify-start gap-3 flex-wrap">
              {profileSteps.map(({ label, done }) => (
                <span
                  key={label}
                  className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {done ? '✓' : '○'} {label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickActions.map(({ label, icon, to, color }) => (
              <Link key={label} to={to} className={`flex flex-col items-center gap-2 p-4 rounded-2xl text-center transition-all shadow-sm ${color}`}>
                <div className="w-10 h-10 bg-white/60 rounded-xl flex items-center justify-center">{createElement(icon, { size: 20 })}</div>
                <span className="text-xs font-semibold">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <AsyncState loading={loading} loadingText={t('common.loadingPage')} />
    </div>
  );
}
