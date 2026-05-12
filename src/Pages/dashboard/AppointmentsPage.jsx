import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Clock, MapPin, X, CheckCircle, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import axiosInstance from '../../api/axiosInstance';
import { APPOINTMENTS } from '../../api/endpoints';
import { cancelAppointment, clearError, clearInfo, fetchAppointments } from '../../features/appointments/appointmentsSlice';
import AsyncState from '../../components/AsyncState';
import { translateAppointmentStatus } from '../../utils/i18nStatus';

function CancelModal({ appointment, onConfirm, onCancel, loading, t }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onCancel} />
      <div className="relative bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 w-full max-w-sm z-10">
        <div className="text-center mb-4">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <X size={24} className="text-red-500" />
          </div>
          <h3 className="font-bold text-gray-800 text-lg">{t('patient.appointments.cancelTitle')}</h3>
          <p className="text-gray-500 text-sm mt-1">{t('patient.appointments.cancelConfirm', { doctor: appointment.doctorName })}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 mb-4 text-start">
          <p className="text-sm font-semibold text-gray-700">{appointment.doctorName}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {appointment.date} - {appointment.time}
          </p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors">
            {t('patient.appointments.keep')}
          </button>
          <button type="button" onClick={onConfirm} disabled={loading} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              t('patient.appointments.confirmCancel')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailsModal({ appointment, onClose, t }) {
  if (!appointment) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />
      <div className="relative bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 w-full max-w-md z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 text-lg">{t('patient.appointments.details')}</h3>
          <button type="button" onClick={onClose} className="text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <img src={appointment.img} alt={appointment.doctorName} className="w-12 h-12 rounded-xl object-cover" />
          <div className="text-start">
            <p className="font-bold text-gray-800">{appointment.doctorName}</p>
            <p className="text-blue-500 text-xs mt-0.5">{appointment.specialty}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <StatusBadge status={appointment.status} t={t} />
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-blue-500" />
            <span>{appointment.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-blue-500" />
            <span>{appointment.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-blue-500" />
            <span>{appointment.location}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-5 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
        >
          {t('common.close')}
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status, t }) {
  const label = translateAppointmentStatus(status, t);
  const styles = {
    مؤكد: 'bg-blue-100 text-blue-600',
    مكتمل: 'bg-green-100 text-green-600',
    ملغي: 'bg-red-100 text-red-500',
  };
  return <span className={`text-xs font-semibold px-3 py-1 rounded-full ${styles[status] || 'bg-gray-100 text-gray-500'}`}>{label}</span>;
}

export default function AppointmentsPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const toast = useToast();
  const { upcoming, previous, loading, error, infoMessage } = useSelector((state) => state.appointments);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancelModal, setCancelModal] = useState(null);
  const [detailsModal, setDetailsModal] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [dispatch, error, toast]);

  useEffect(() => {
    if (infoMessage) {
      toast.info(t('common.demoDataNotice'));
      dispatch(clearInfo());
    }
  }, [dispatch, infoMessage, toast, t]);

  const handleCancel = async () => {
    setCancelLoading(true);
    const result = await dispatch(cancelAppointment(cancelModal.id));
    setCancelLoading(false);
    if (cancelAppointment.fulfilled.match(result)) {
      toast.success(t('appointments.toast.cancelled'));
      setCancelModal(null);
    } else {
      toast.error(result.payload || t('appointments.toast.cancelFailed'));
    }
  };

  const handleRateDoctor = async (apt) => {
    const raw = window.prompt(t('patient.appointments.ratePrompt'));
    if (raw === null) return;
    const rating = Number(raw);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      toast.error(t('patient.appointments.rateInvalid'));
      return;
    }
    const comment = window.prompt(t('patient.appointments.rateCommentPrompt')) ?? '';
    try {
      await axiosInstance.post(APPOINTMENTS.RATE(apt.id), { rating, comment });
      toast.success(t('patient.appointments.rateSaved'));
      dispatch(fetchAppointments());
    } catch (err) {
      toast.error(err?.response?.data?.message || t('patient.appointments.rateError'));
    }
  };

  const tabs = [
    { key: 'upcoming', label: t('patient.appointments.upcoming') },
    { key: 'previous', label: t('patient.appointments.previous') },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-800 text-start">{t('patient.appointments.title')}</h1>
        <p className="text-gray-500 text-sm mt-1 text-start">{t('patient.appointments.subtitle')}</p>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-1 flex gap-1 w-fit">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === key ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <AsyncState loading={loading} loadingText={t('patient.appointments.loading')} />

      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {!loading && upcoming.length === 0 ? (
            <div className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={28} className="text-blue-400" />
              </div>
              <p className="font-bold text-gray-700">{t('patient.appointments.emptyUpcomingTitle')}</p>
              <p className="text-gray-400 text-sm mt-1">{t('patient.appointments.emptyUpcomingSub')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcoming.map((apt) => (
                <div key={apt.id} className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={apt.status} t={t} />
                    <div className="flex items-center gap-3">
                      <img src={apt.img} alt={apt.doctorName} className="w-12 h-12 rounded-xl object-cover" />
                      <div className="text-start">
                        <p className="font-bold text-gray-800">{apt.doctorName}</p>
                        <p className="text-blue-500 text-xs mt-0.5">{apt.specialty}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-start gap-2 text-gray-500 text-sm">
                      <Calendar size={14} className="text-blue-500" />
                      <span>{apt.date}</span>
                    </div>
                    <div className="flex items-center justify-start gap-2 text-gray-500 text-sm">
                      <Clock size={14} className="text-blue-500" />
                      <span>{apt.time}</span>
                    </div>
                    <div className="flex items-center justify-start gap-2 text-gray-500 text-sm">
                      <MapPin size={14} className="text-blue-500" />
                      <span>{apt.location}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setCancelModal(apt)} className="flex-1 border border-red-200 text-red-500 font-semibold py-2.5 rounded-xl text-sm hover:bg-red-50 transition-colors">
                      {t('patient.appointments.cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailsModal(apt)}
                      className="flex-1 bg-blue-600 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-blue-700 transition-colors"
                    >
                      {t('patient.appointments.details')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'previous' && (
        <div className="card-hover-panel bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-5 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-500">
            <span className="text-center">{t('patient.appointments.colAction')}</span>
            <span className="text-center">{t('patient.appointments.colStatus')}</span>
            <span className="text-center">{t('patient.appointments.colDate')}</span>
            <span className="text-center">{t('patient.appointments.colSpec')}</span>
            <span className="text-start">{t('patient.appointments.colDoctor')}</span>
          </div>

          <div className="divide-y divide-gray-50">
            {previous.map((apt) => (
              <div key={apt.id} className="px-5 py-4">
                <div className="md:hidden flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button type="button" className="text-blue-600 text-xs font-semibold border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1">
                      <RefreshCw size={12} />
                      {t('patient.appointments.rebook')}
                    </button>
                    {apt.canRate && (
                      <button
                        type="button"
                        onClick={() => void handleRateDoctor(apt)}
                        className="text-yellow-700 text-xs font-semibold border border-yellow-200 px-3 py-1.5 rounded-lg hover:bg-yellow-50 transition-colors"
                      >
                        {apt.rating?.value ? t('patient.appointments.editRating') : t('patient.appointments.rateDoctor')}
                      </button>
                    )}
                    <StatusBadge status={apt.status} t={t} />
                  </div>
                  <div className="flex items-center gap-2">
                    <img src={apt.img} alt={apt.doctorName} className="w-10 h-10 rounded-xl object-cover" />
                    <div className="text-start">
                      <p className="font-bold text-gray-800 text-sm">{apt.doctorName}</p>
                      <p className="text-gray-400 text-xs">{apt.date}</p>
                    </div>
                  </div>
                </div>

                <div className="hidden md:grid grid-cols-5 gap-4 items-center">
                  <div className="flex justify-center">
                    <div className="flex items-center gap-2">
                      <button type="button" className="text-blue-600 text-xs font-semibold border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1">
                        <RefreshCw size={12} />
                        {t('patient.appointments.rebook')}
                      </button>
                      {apt.canRate && (
                        <button
                          type="button"
                          onClick={() => void handleRateDoctor(apt)}
                          className="text-yellow-700 text-xs font-semibold border border-yellow-200 px-3 py-1.5 rounded-lg hover:bg-yellow-50 transition-colors"
                        >
                          {apt.rating?.value ? t('patient.appointments.editRating') : t('patient.appointments.rateDoctor')}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <StatusBadge status={apt.status} t={t} />
                  </div>
                  <p className="text-sm text-gray-500 text-center">{apt.date}</p>
                  <p className="text-sm text-gray-500 text-center">{apt.specialty2 || apt.specialty}</p>
                  <div className="flex items-center gap-2 justify-start">
                    <img src={apt.img} alt={apt.doctorName} className="w-9 h-9 rounded-xl object-cover" />
                    <p className="font-semibold text-gray-800 text-sm">{apt.doctorName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <CheckCircle size={13} className="text-green-500" />
                <span>
                  {previous.filter((a) => a.status === 'مكتمل').length} {t('patient.appointments.summaryDone')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <X size={13} className="text-red-400" />
                <span>
                  {previous.filter((a) => a.status === 'ملغي').length} {t('patient.appointments.summaryCancelled')}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              {t('patient.appointments.pagination', { from: 1, to: previous.length, total: previous.length })}
            </p>
          </div>
        </div>
      )}

      {cancelModal && (
        <CancelModal appointment={cancelModal} onConfirm={handleCancel} onCancel={() => setCancelModal(null)} loading={cancelLoading} t={t} />
      )}
      {detailsModal && <DetailsModal appointment={detailsModal} onClose={() => setDetailsModal(null)} t={t} />}
    </div>
  );
}
