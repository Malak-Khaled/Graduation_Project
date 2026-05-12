import { createElement, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Clock, CheckCircle, XCircle, Eye, Calendar, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { translateAppointmentStatus } from '../../utils/i18nStatus';
import axiosInstance from '../../api/axiosInstance';
import { DOCTOR, DOCTOR_API } from '../../api/endpoints';
import { getApiErrorMessage } from '../../utils/apiError';
import { getApiOrigin } from '../../utils/apiOrigin';

function localDateInputValue(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function DoctorAppointmentsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [patientsForSelect, setPatientsForSelect] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [savingAppointment, setSavingAppointment] = useState(false);
  const [formPatientId, setFormPatientId] = useState('');
  const [formDate, setFormDate] = useState(() => localDateInputValue());
  const [formTime, setFormTime] = useState('09:00');
  const [formNotes, setFormNotes] = useState('');

  const apiOrigin = getApiOrigin();
  const placeholderApptImg = 'https://randomuser.me/api/portraits/lego/1.jpg';

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(DOCTOR.SCHEDULE);
      const normalized = (res.data?.schedules || []).map((item) => ({
        id: item.id,
        name: item.patient?.name || 'Unknown patient',
        pid: `#${item.patient_id}`,
        time: item.appointment_time || '--:--',
        endTime: item.appointment_time || '--:--',
        type: item.notes || t('doctor.appointments.tableSubtitle'),
        status: item.status || 'pending',
        done: item.status === 'completed',
        img: item.patient?.avatar ? `${apiOrigin}/storage/${item.patient.avatar}` : placeholderApptImg,
      }));
      setAppointments(normalized);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only
  }, []);

  const openAddModal = useCallback(async () => {
    setFormPatientId('');
    setFormDate(localDateInputValue());
    setFormTime('09:00');
    setFormNotes('');
    setShowAddModal(true);
    setLoadingPatients(true);
    try {
      const res = await axiosInstance.get(DOCTOR_API.PATIENTS);
      const list = res.data?.patients || [];
      setPatientsForSelect(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('doctor.appointments.loadPatientsErr')));
      setPatientsForSelect([]);
    } finally {
      setLoadingPatients(false);
    }
  }, [toast, t]);

  const closeAddModal = useCallback(() => {
    setShowAddModal(false);
  }, []);

  const submitNewAppointment = async () => {
    if (!formPatientId) {
      toast.error(t('doctor.appointments.selectPatientPh'));
      return;
    }
    setSavingAppointment(true);
    try {
      await axiosInstance.post(DOCTOR_API.APPOINTMENTS, {
        patient_id: Number(formPatientId),
        appointment_date: formDate,
        appointment_time: formTime.slice(0, 5),
        notes: formNotes.trim() || undefined,
      });
      toast.success(t('doctor.appointments.successAdded'));
      closeAddModal();
      await loadSchedules();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
    } finally {
      setSavingAppointment(false);
    }
  };

  const filtered = useMemo(
    () => appointments.filter((a) => a.name.includes(search) || a.type.includes(search) || a.pid.includes(search)),
    [appointments, search]
  );

  const updateScheduleStatus = async (id, status) => {
    try {
      await axiosInstance.put(DOCTOR.SCHEDULE, {
        appointment_id: id,
        status,
      });
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, done: status === 'completed', status } : a)));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
    }
  };

  const handleDone = async (id) => {
    await updateScheduleStatus(id, 'completed');
    toast.success(t('doctor.home.completed'));
  };

  const handleNotDone = async (id) => {
    await updateScheduleStatus(id, 'confirmed');
    toast.info(t('doctor.appointments.revertedCheck'));
  };

  const stats = [
    { label: t('doctor.appointments.statToday'), value: appointments.length, color: 'text-blue-600', bg: 'bg-blue-50', icon: Calendar },
    {
      label: t('doctor.appointments.statPending'),
      value: appointments.filter((a) => a.status === 'pending').length,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
      icon: Clock,
    },
    {
      label: t('doctor.appointments.statConsults'),
      value: Number(t('doctor.appointments.statConsultsVal')),
      color: 'text-green-600',
      bg: 'bg-green-50',
      icon: CheckCircle,
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={loadSchedules}
            disabled={loading}
            className="flex items-center gap-2 border border-gray-200 bg-white text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            {loading ? t('common.loading') : t('doctor.appointments.refreshBtn')}
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus size={15} />
            {t('doctor.appointments.addBtn')}
          </button>
        </div>
        <div className="text-start">
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-800">{t('doctor.appointments.title')}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{t('doctor.appointments.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ label, value, color, bg, icon }) => (
          <div key={label} className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
              {createElement(icon, { size: 18, className: color })}
            </div>
            <div className="text-start flex-1 min-w-0">
              <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('doctor.appointments.searchPh')}
          className="w-full bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2.5 pe-10 text-sm text-start placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
        />
        <Search size={16} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>

      <div className="card-hover-panel bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 text-start">
          <h3 className="font-bold text-gray-800">{t('doctor.appointments.tableTitle')}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{t('doctor.appointments.tableSubtitle')}</p>
        </div>

        <div className="divide-y divide-gray-50">
          {filtered.map((apt) => (
            <div key={apt.id} className="px-5 py-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 ms-auto shrink-0 flex-wrap">
                  <button
                    type="button"
                    className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-400"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNotDone(apt.id)}
                    className="flex items-center gap-1 text-xs font-semibold border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <XCircle size={13} />
                    {t('doctor.home.notExamined')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDone(apt.id)}
                    className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
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

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-500 shrink-0 hidden sm:block">{apt.type}</span>

                  <div className="text-start min-w-0 flex-1">
                    <div className="flex items-center justify-start gap-2">
                      <p className="font-bold text-gray-800 text-sm">{apt.name}</p>
                      <img src={apt.img} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                    </div>
                    <p className="text-xs text-gray-400 flex items-center justify-start gap-1 mt-0.5">
                      <span>{apt.pid}</span>
                      <span>•</span>
                      <Clock size={11} />
                      <span>
                        {apt.time} - {apt.endTime} ص
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="px-5 py-3 flex items-center justify-between bg-gray-50/80 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{t('doctor.appointments.breakTime')}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Clock size={16} />
              <span className="text-sm font-semibold">{t('doctor.appointments.breakLabel')}</span>
            </div>
          </div>
        </div>
      </div>

      {showAddModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          role="presentation"
          onClick={closeAddModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="doctor-add-appt-title"
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 text-start space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="doctor-add-appt-title" className="text-lg font-extrabold text-gray-800">
              {t('doctor.appointments.modalTitle')}
            </h2>
            <p className="text-xs text-gray-500">{t('doctor.appointments.modalHint')}</p>

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-gray-600">{t('doctor.appointments.fieldPatient')}</span>
              <select
                value={formPatientId}
                onChange={(e) => setFormPatientId(e.target.value)}
                disabled={loadingPatients}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('doctor.appointments.selectPatientPh')}</option>
                {patientsForSelect.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {!loadingPatients && patientsForSelect.length === 0 ? (
                <p className="text-xs text-amber-600 mt-1">{t('doctor.appointments.patientsListEmpty')}</p>
              ) : null}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-gray-600">{t('doctor.appointments.fieldDate')}</span>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-gray-600">{t('doctor.appointments.fieldTime')}</span>
                <input
                  type="time"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-gray-600">{t('doctor.appointments.fieldNotes')}</span>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={3}
                placeholder={t('doctor.appointments.phNotes')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeAddModal}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                {t('doctor.appointments.cancel')}
              </button>
              <button
                type="button"
                onClick={submitNewAppointment}
                disabled={savingAppointment || loadingPatients}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {savingAppointment ? t('common.loading') : t('doctor.appointments.save')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
