import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import { Search, Calendar } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { ADMIN } from '../../api/endpoints';
import { getApiErrorMessage } from '../../utils/apiError';

/** يطابق `Appointment::STATUSES` في الباكند */
const API_STATUSES = ['pending', 'confirmed', 'inProgress', 'completed', 'cancelled'];

const FILTER_TABS = [
  { id: 'all', labelKey: 'admin.appointments.statAll' },
  { id: 'pending', labelKey: 'appointments.status.waiting' },
  { id: 'confirmed', labelKey: 'appointments.status.confirmed' },
  { id: 'inProgress', labelKey: 'appointments.status.inProgress' },
  { id: 'completed', labelKey: 'appointments.status.completed' },
  { id: 'cancelled', labelKey: 'appointments.status.cancelled' },
];

function statusOptionLabelKey(v) {
  if (v === 'pending') return 'appointments.status.waiting';
  return `appointments.status.${v}`;
}

export default function AdminAppointmentsPage() {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [filterId, setFilterId] = useState('all');
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const toast = useToast();

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(ADMIN.APPOINTMENTS);
      const mapped = (res.data?.appointments || []).map((a) => ({
        id: a.id,
        patient: a.patient?.name || '-',
        doctor: a.doctor?.name || '-',
        specialty: a.doctor?.specialty || '—',
        date: a.appointment_date || '-',
        time: a.appointment_time || '-',
        status: a.status || 'pending',
      }));
      setAppointments(mapped);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only
  }, []);

  const filtered = useMemo(
    () =>
      appointments.filter((a) => {
        const s = (search || '').trim().toLowerCase();
        const matchSearch =
          !s ||
          a.patient.toLowerCase().includes(s) ||
          a.doctor.toLowerCase().includes(s) ||
          (a.specialty && String(a.specialty).toLowerCase().includes(s));
        const matchStatus = filterId === 'all' || a.status === filterId;
        return matchSearch && matchStatus;
      }),
    [appointments, search, filterId]
  );

  const handleStatusChange = async (id, newStatus) => {
    const row = appointments.find((x) => x.id === id);
    if (!row || row.status === newStatus) return;
    setUpdatingId(id);
    try {
      await axiosInstance.patch(ADMIN.APPOINTMENTS + `/${id}`, { status: newStatus });
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
      toast.success(t('admin.appointments.statusUpdated'));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('admin.appointments.statusUpdateError')));
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = FILTER_TABS.map(({ id, labelKey }) => ({
    id,
    label: t(labelKey),
    value: id === 'all' ? appointments.length : appointments.filter((a) => a.status === id).length,
    color:
      id === 'all'
        ? 'text-gray-600'
        : id === 'pending'
          ? 'text-amber-600'
          : id === 'confirmed'
            ? 'text-blue-600'
            : id === 'inProgress'
              ? 'text-green-600'
              : id === 'completed'
                ? 'text-gray-500'
                : 'text-red-500',
  }));

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen w-full">
      <div className="text-start">
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-800">{t('admin.appointments.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{loading ? t('common.loading') : t('admin.appointments.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map(({ id, label, value, color }) => (
          <div key={id} className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm flex items-center justify-between gap-2">
            <span className={`text-2xl font-extrabold ${color}`}>{value}</span>
            <span className="text-xs text-gray-400 font-semibold text-start leading-tight">{label}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-white rounded-xl shadow-sm p-1 overflow-x-auto max-w-full">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterId(tab.id)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filterId === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-800 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50/70'
              }`}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-48">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.appointments.searchPh')}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 pe-10 text-sm text-start placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
          />
          <Search size={16} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="card-hover-panel bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-5 gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 text-center">
          <span className="text-start">{t('admin.appointments.colPatient')}</span>
          <span>{t('admin.appointments.colDoctor')}</span>
          <span>{t('admin.appointments.colSpec')}</span>
          <span>{t('admin.appointments.colTimeDate')}</span>
          <span>{t('admin.appointments.colStatus')}</span>
        </div>
        <div className="divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Calendar size={32} className="mx-auto mb-3 text-gray-300" />
              <p>{t('admin.appointments.empty')}</p>
            </div>
          ) : (
            filtered.map((apt) => {
              const busy = updatingId === apt.id;
              return (
                <div key={apt.id} className="px-4 md:px-5 py-4">
                  <div className="md:hidden space-y-3">
                    <div className="text-start min-w-0">
                      <p className="font-bold text-gray-800 text-sm">{apt.patient}</p>
                      <p className="text-xs text-gray-400">
                        {apt.doctor} · {apt.date} {apt.time}
                      </p>
                    </div>
                    <label className="block text-start text-xs font-semibold text-gray-500">
                      {t('admin.appointments.colStatus')}
                      <select
                        value={apt.status}
                        disabled={busy}
                        onChange={(e) => void handleStatusChange(apt.id, e.target.value)}
                        aria-label={t('admin.appointments.statusSelectAria')}
                        className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-start bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {API_STATUSES.map((v) => (
                          <option key={v} value={v}>
                            {t(statusOptionLabelKey(v))}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="hidden md:grid grid-cols-5 gap-3 items-center text-center">
                    <span className="text-sm font-semibold text-gray-800 text-start">{apt.patient}</span>
                    <span className="text-sm text-gray-700">{apt.doctor}</span>
                    <span className="text-xs text-gray-500">{apt.specialty}</span>
                    <div>
                      <p className="text-xs font-bold text-gray-700">{apt.time}</p>
                      <p className="text-xs text-gray-400">{apt.date}</p>
                    </div>
                    <div className="flex justify-center min-w-0">
                      <select
                        value={apt.status}
                        disabled={busy}
                        onChange={(e) => void handleStatusChange(apt.id, e.target.value)}
                        aria-label={t('admin.appointments.statusSelectAria')}
                        className="max-w-full border border-gray-200 rounded-xl px-2 py-1.5 text-xs text-start bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {API_STATUSES.map((v) => (
                          <option key={v} value={v}>
                            {t(statusOptionLabelKey(v))}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
