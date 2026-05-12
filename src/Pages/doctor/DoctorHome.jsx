import { createElement, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import { translateAppointmentStatus } from '../../utils/i18nStatus';
import { Users, Calendar, FileText, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { DOCTOR, DOCTOR_API } from '../../api/endpoints';
import { getApiErrorMessage } from '../../utils/apiError';
import { getApiOrigin } from '../../utils/apiOrigin';

function localTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatTimeHm(raw) {
  const s = String(raw || '');
  if (!s) return '—';
  return s.slice(0, 5);
}

function parseApptDateTime(dateStr, timeRaw) {
  if (!dateStr) return null;
  const t = String(timeRaw || '00:00:00').slice(0, 8);
  const d = new Date(`${String(dateStr).slice(0, 10)}T${t}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function findNextUpcoming(items) {
  const now = new Date();
  let best = null;
  let bestAt = null;
  for (const a of items) {
    if (a.status === 'cancelled') continue;
    const dt = parseApptDateTime(a.appointmentDate, a.appointmentTime);
    if (!dt || dt < now) continue;
    if (!bestAt || dt < bestAt) {
      best = a;
      bestAt = dt;
    }
  }
  return best;
}

function ageFromDob(dob) {
  if (!dob) return null;
  const b = new Date(dob);
  if (Number.isNaN(b.getTime())) return null;
  let age = new Date().getFullYear() - b.getFullYear();
  const m = new Date().getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && new Date().getDate() < b.getDate())) age -= 1;
  return age;
}

function formatApptDateLong(dateStr, locale) {
  if (!dateStr) return '—';
  const d = new Date(`${String(dateStr).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default function DoctorHome() {
  const { user } = useSelector((s) => s.auth);
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const [scheduleItems, setScheduleItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [reportsCount, setReportsCount] = useState(0);
  const isEn = i18n.language?.startsWith('en');
  const Chevron = isEn ? ChevronRight : ChevronLeft;

  const apiOrigin = getApiOrigin();
  const placeholderFace = 'https://randomuser.me/api/portraits/lego/1.jpg';

  const { todayList, nextUp, patientsTodayCount, apptsTodayCount, nextTimeLabel, nextSubLabel } = useMemo(() => {
    const todayStr = localTodayStr();
    const todays = scheduleItems.filter((a) => String(a.appointmentDate || '').slice(0, 10) === todayStr);
    const uniquePatients = new Set(todays.map((a) => a.patientId).filter(Boolean));
    const next = findNextUpcoming(scheduleItems);
    const nextTime = next ? formatTimeHm(next.appointmentTime) : '—';
    const nextSub = next ? formatApptDateLong(next.appointmentDate, i18n.language) : '—';
    return {
      todayList: todays,
      nextUp: next,
      patientsTodayCount: uniquePatients.size,
      apptsTodayCount: todays.length,
      nextTimeLabel: nextTime,
      nextSubLabel: nextSub,
    };
  }, [scheduleItems, i18n.language]);

  const activityItems = useMemo(
    () =>
      todayList.slice(0, 5).map((a) => ({
        id: a.id,
        label: a.name,
        value: `${a.time} · ${translateAppointmentStatus(a.status, t)}`,
        done: a.done,
      })),
    [todayList, t]
  );

  const stats = useMemo(
    () => [
      {
        label: t('doctor.home.stats.patientsToday'),
        value: String(patientsTodayCount),
        sub: t('doctor.home.stats.patientWord'),
        icon: Users,
        color: 'bg-blue-50 text-blue-600',
      },
      {
        label: t('doctor.home.stats.apptsToday'),
        value: String(apptsTodayCount),
        sub: t('doctor.home.stats.apptWord'),
        icon: Calendar,
        color: 'bg-green-50 text-green-600',
      },
      {
        label: t('doctor.home.stats.openFiles'),
        value: String(reportsCount),
        sub: t('doctor.home.stats.filesWord'),
        icon: FileText,
        color: 'bg-orange-50 text-orange-500',
      },
      {
        label: t('doctor.home.stats.next'),
        value: nextTimeLabel,
        sub: nextSubLabel,
        icon: Clock,
        color: 'bg-purple-50 text-purple-600',
      },
    ],
    [apptsTodayCount, patientsTodayCount, reportsCount, nextSubLabel, nextTimeLabel, t]
  );

  const completedToday = todayList.filter((a) => a.done).length;
  const totalToday = todayList.length;
  const percent = totalToday ? Math.round((completedToday / totalToday) * 100) : 0;

  const loadDoctorDashboard = async () => {
    setLoading(true);
    try {
      const [scheduleRes, reportsRes] = await Promise.all([
        axiosInstance.get(DOCTOR.SCHEDULE),
        axiosInstance.get(DOCTOR_API.REPORTS),
      ]);

      const normalized = (scheduleRes.data?.schedules || []).map((item) => ({
        id: item.id,
        patientId: item.patient_id,
        appointmentDate: item.appointment_date,
        appointmentTime: item.appointment_time,
        time: formatTimeHm(item.appointment_time),
        name: item.patient?.name || t('doctor.home.defaultDoctorName'),
        patientDob: item.patient?.date_of_birth,
        patientAvatar: item.patient?.avatar,
        type: item.notes?.trim() ? item.notes : t('doctor.home.todayListTitle'),
        status: item.status || 'pending',
        done: item.status === 'completed',
        location: [item.patient?.area, item.patient?.governorate].filter(Boolean).join(' — ') || '—',
      }));

      setScheduleItems(normalized);
      setReportsCount((reportsRes.data?.reports || []).length);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only dashboard fetch
  }, []);

  const updateVisitStatus = async (id, status) => {
    setSavingId(id);
    try {
      await axiosInstance.put(DOCTOR.SCHEDULE, { appointment_id: id, status });
      setScheduleItems((prev) =>
        prev.map((a) => (a.id === id ? { ...a, done: status === 'completed', status } : a))
      );
      if (status === 'completed') {
        toast.success(t('doctor.home.completed'));
      } else {
        toast.info(t('doctor.home.reverted'));
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
    } finally {
      setSavingId(null);
    }
  };

  const handleDone = (id) => updateVisitStatus(id, 'completed');
  const handleNotDone = (id) => updateVisitStatus(id, 'confirmed');

  const nextImg =
    nextUp?.patientAvatar ? `${apiOrigin}/storage/${nextUp.patientAvatar}` : placeholderFace;
  const nextAge = nextUp?.patientDob ? ageFromDob(nextUp.patientDob) : null;

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          to="/doctor/appointments"
          className="flex items-center gap-2 border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-600 px-4 py-2 rounded-xl text-sm font-semibold hover:border-blue-400 hover:text-blue-600 transition-all"
        >
          <Calendar size={15} />
          {t('doctor.home.viewAppts')}
        </Link>
        <div className="text-start">
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-800">
            {t('doctor.home.welcome', { name: user?.name || t('doctor.home.defaultDoctorName') })}
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">{t('doctor.home.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub, icon, color }) => (
          <div key={label} className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-4 text-start">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ms-auto ${color}`}>
              {createElement(icon, { size: 18 })}
            </div>
            <p className="text-2xl font-extrabold text-gray-800">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="card-hover lg:col-span-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4 text-start">{t('doctor.home.nextTitle')}</h3>
          {!nextUp ? (
            <p className="text-sm text-gray-500 text-start">{t('doctor.home.noNext')}</p>
          ) : (
            <div className="flex items-start gap-4 flex-wrap">
              <div className="flex flex-col gap-2 flex-1 text-start min-w-48">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-600 w-fit">
                  {nextUp.type}
                </span>
                <h4 className="font-extrabold text-gray-800 text-lg">{nextUp.name}</h4>
                <p className="text-gray-400 text-xs">
                  {nextAge != null ? t('doctor.home.ageShort', { age: nextAge }) : t('doctor.home.ageUnknown')}
                </p>
                <div className="flex items-center gap-2 justify-start text-xs text-gray-500">
                  <Calendar size={13} className="text-blue-400 shrink-0" />
                  <span>{formatApptDateLong(nextUp.appointmentDate, i18n.language)}</span>
                </div>
                <div className="flex items-center gap-2 justify-start text-xs text-gray-500">
                  <Clock size={13} className="text-blue-400 shrink-0" />
                  <span>{formatTimeHm(nextUp.appointmentTime)}</span>
                </div>
                <div className="flex items-center gap-2 justify-start text-xs text-gray-500">
                  <MapPin size={13} className="text-blue-400 shrink-0" />
                  <span>{nextUp.location}</span>
                </div>
                <Link
                  to="/doctor/patients"
                  className="mt-2 border border-blue-200 text-blue-600 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-blue-50 transition-colors w-fit inline-block text-center"
                >
                  {t('doctor.home.openPatientFile')}
                </Link>
              </div>
              <img src={nextImg} alt="" className="w-20 h-20 rounded-2xl object-cover shrink-0" />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-gray-100">
            {[
              { label: t('doctor.home.quickRx'), icon: '📋', to: '/doctor/prescriptions' },
              { label: t('doctor.home.quickPatients'), icon: '👤', to: '/doctor/patients' },
              { label: t('doctor.home.quickReport'), icon: '📤', to: '/doctor/reports' },
            ].map(({ label, icon, to }) => (
              <Link
                key={label}
                to={to}
                className="flex flex-col items-center gap-2 bg-gray-50 hover:bg-blue-50 rounded-xl p-3 text-center transition-colors group"
              >
                <span className="text-xl">{icon}</span>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-blue-600">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="card-hover lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4 text-start">{t('doctor.home.activityTitle')}</h3>

          <div className="flex items-center justify-center mb-4">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                  strokeDasharray={`${percent} ${100 - percent}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-blue-600">{percent}%</span>
                <span className="text-xs text-gray-400">{t('doctor.home.donutComplete')}</span>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mb-4">
            {t('doctor.home.taskProgress', { done: completedToday, total: totalToday })}
          </p>

          <div className="space-y-3">
            {loading && <p className="text-xs text-gray-400 text-start">{t('common.loading')}</p>}
            {!loading && activityItems.length === 0 && (
              <p className="text-xs text-gray-400 text-start">{t('doctor.home.todayEmpty')}</p>
            )}
            {activityItems.map(({ id, label, value, done }) => (
              <div key={id} className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-green-100' : 'bg-yellow-100'}`}
                >
                  {done ? <CheckCircle size={14} className="text-green-500" /> : <Clock size={14} className="text-yellow-500" />}
                </div>
                <div className="flex-1 text-start min-w-0">
                  <p className="text-xs font-semibold text-gray-700">{label}</p>
                  <p className="text-xs text-gray-400">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card-hover-panel bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 gap-2">
          <Link to="/doctor/appointments" className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:underline">
            <Chevron size={16} />
            {t('doctor.home.viewAll')}
          </Link>
          <h3 className="font-bold text-gray-800 text-start">{t('doctor.home.todayScheduleTitle')}</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {!loading && todayList.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-gray-400">{t('doctor.home.todayEmpty')}</div>
          )}
          {todayList.map((apt) => (
            <div key={apt.id} className="px-5 py-4 flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 ms-auto flex-wrap">
                <button
                  type="button"
                  disabled={savingId === apt.id}
                  onClick={() => handleNotDone(apt.id)}
                  className="flex items-center gap-1 text-xs font-semibold border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  <XCircle size={13} />
                  {t('doctor.home.notExamined')}
                </button>
                <button
                  type="button"
                  disabled={savingId === apt.id}
                  onClick={() => handleDone(apt.id)}
                  className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none ${
                    apt.done ? 'bg-green-500 text-white' : 'border border-green-200 text-green-600 hover:bg-green-50'
                  }`}
                >
                  <CheckCircle size={13} />
                  {t('doctor.home.examined')}
                </button>
              </div>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                    apt.status === 'completed'
                      ? 'bg-gray-100 text-gray-500'
                      : apt.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {translateAppointmentStatus(apt.status, t)}
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-500 shrink-0 truncate max-w-[40%]">
                  {apt.type}
                </span>
                <div className="text-start min-w-0 flex-1">
                  <p className="font-bold text-gray-800 text-sm truncate">{apt.name}</p>
                  <p className="text-xs text-gray-400 flex items-center justify-start gap-1">
                    <Clock size={11} />
                    {apt.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
