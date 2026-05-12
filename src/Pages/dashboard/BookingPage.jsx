import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import { Search, MapPin, Star, Clock, X } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { BOOKING, APPOINTMENTS } from '../../api/endpoints';
import { BENI_SUEF_GOV_AR, GOVERNORATES_AR, AREAS_BY_GOV_AR, BENI_SUEF_MARKAZ_AR } from '../../data/beniSuefGovernorate';
import { getApiErrorMessage } from '../../utils/apiError';
import { getApiOrigin } from '../../utils/apiOrigin';
import { getSpecialtyOptionsFromDoctors, matchesSpecialty, SPECIALTY_ALL_AR } from '../../utils/specialtyFilter';

const GOVERNORATES = GOVERNORATES_AR;
const AREAS = AREAS_BY_GOV_AR;

const FALLBACK_DOCTORS = [
  {
    id: 1,
    name: 'د.موسى محمد',
    specialty: 'أخصائي علاج طبيعي',
    rating: 4.7,
    location: BENI_SUEF_GOV_AR,
    area: BENI_SUEF_MARKAZ_AR[0],
    price: 150,
    img: 'https://randomuser.me/api/portraits/men/55.jpg',
  },
  {
    id: 2,
    name: 'د.بسام سرحان',
    specialty: 'أخصائي اسنان عام',
    rating: 4.9,
    location: BENI_SUEF_GOV_AR,
    area: BENI_SUEF_MARKAZ_AR[1],
    price: 200,
    img: 'https://randomuser.me/api/portraits/men/44.jpg',
  },
  {
    id: 3,
    name: 'د.خالد عبد العزيز',
    specialty: 'أخصائي طب عيون',
    rating: 4.8,
    location: BENI_SUEF_GOV_AR,
    area: BENI_SUEF_MARKAZ_AR[3],
    price: 180,
    img: 'https://randomuser.me/api/portraits/men/60.jpg',
  },
];

function mapApiDaysToRows(days) {
  return (days || []).map((d) => ({
    date: d.date,
    dayLabel: `${d.day_name} (${d.date})`,
    slots: Array.isArray(d.slots) ? d.slots : [],
  }));
}

async function fetchDoctorSlots(doctorId) {
  const res = await axiosInstance.get(BOOKING.SLOTS(doctorId));
  return mapApiDaysToRows(res.data?.days);
}

function formatAppointmentTime(raw) {
  const s = String(raw || '').trim();
  const parts = s.split(':').map((p) => p.replace(/\D/g, ''));
  const h = parts[0] ?? '0';
  const m = parts[1] ?? '0';
  return `${String(Number(h) || 0).padStart(2, '0')}:${String(Number(m) || 0).padStart(2, '0')}`;
}

function ConfirmModal({ doctor, slot, onClose, onConfirm, t }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm z-10 text-start">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">{t('patient.booking.modalTitle')}</h3>
          <button type="button" onClick={onClose} className="text-gray-400">
            <X size={20} />
          </button>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <img src={doctor.img} alt={doctor.name} className="w-14 h-14 rounded-2xl object-cover" />
          <div>
            <p className="font-bold text-gray-800">{doctor.name}</p>
            <p className="text-xs text-blue-500">{doctor.specialty}</p>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <MapPin size={11} />
              {doctor.location} - {doctor.area}
            </p>
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 text-start mb-4">
          <p className="text-sm font-bold text-blue-700">{slot.dayLabel}</p>
          <p className="text-sm text-blue-600 flex items-center gap-1 mt-0.5">
            <Clock size={13} />
            {slot.time}
          </p>
          <p className="text-xs text-gray-500 mt-1">{t('patient.booking.fee', { price: doctor.price })}</p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50">
            {t('common.cancel')}
          </button>
          <button type="button" onClick={onConfirm} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-blue-700">
            {t('patient.booking.confirmBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [doctors, setDoctors] = useState([]);
  /** @type {Record<number, Array<{ date: string, dayLabel: string, slots: string[] }> | undefined>} */
  const [slotsByDoctor, setSlotsByDoctor] = useState({});
  const [slotsLoadingId, setSlotsLoadingId] = useState(null);
  const [specialty, setSpecialty] = useState(SPECIALTY_ALL_AR);
  const [governorate, setGovernorate] = useState(BENI_SUEF_GOV_AR);
  const [area, setArea] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const specialtyOptions = getSpecialtyOptionsFromDoctors(doctors);

  const apiOrigin = getApiOrigin();

  useEffect(() => {
    const spec = searchParams.get('specialty');
    if (spec && spec.trim()) {
      setSpecialty(decodeURIComponent(spec.trim()));
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axiosInstance.get(BOOKING.SEARCH_DOCTORS);
        const apiDoctors = res.data.doctors || [];
        const mapped = apiDoctors.map((d, idx) => ({
          id: d.id,
          name: d.name,
          specialty: d.specialty || FALLBACK_DOCTORS[idx % FALLBACK_DOCTORS.length]?.specialty || 'باطنة',
          rating: Number(d.rating_avg || 4.7).toFixed(1),
          location: d.governorate || FALLBACK_DOCTORS[idx % FALLBACK_DOCTORS.length]?.location || BENI_SUEF_GOV_AR,
          area: d.area || FALLBACK_DOCTORS[idx % FALLBACK_DOCTORS.length]?.area || BENI_SUEF_MARKAZ_AR[0],
          price: d.consultation_price ?? (FALLBACK_DOCTORS[idx % FALLBACK_DOCTORS.length]?.price || 150),
          img: d.avatar ? `${apiOrigin}/storage/${d.avatar}` : FALLBACK_DOCTORS[idx % FALLBACK_DOCTORS.length]?.img,
        }));
        setDoctors(mapped.length ? mapped : FALLBACK_DOCTORS);
      } catch {
        setDoctors(FALLBACK_DOCTORS);
      }
    };

    fetchDoctors();
  }, [apiOrigin]);

  const refreshSlotsForDoctor = useCallback(async (doctorId) => {
    setSlotsLoadingId(doctorId);
    try {
      const daysList = await fetchDoctorSlots(doctorId);
      setSlotsByDoctor((prev) => ({ ...prev, [doctorId]: daysList }));
    } catch (err) {
      setSlotsByDoctor((prev) => ({ ...prev, [doctorId]: [] }));
      toast.error(getApiErrorMessage(err, t('patient.booking.errorLoadingSlots')));
    } finally {
      setSlotsLoadingId((id) => (id === doctorId ? null : id));
    }
  }, [toast, t]);

  const filtered = doctors.filter((d) => {
    const matchSpec = matchesSpecialty(d.specialty, specialty);
    const matchGov = !governorate || d.location === governorate;
    const matchArea = !area || d.area === area;
    return matchSpec && matchGov && matchArea;
  });

  const handleConfirm = async () => {
    if (!confirmModal) return;
    const { date, time } = confirmModal.slot;
    if (!date || !time) {
      toast.error(t('patient.booking.invalidSlot'));
      return;
    }
    const appointment_time = formatAppointmentTime(time);
    setBookingSubmitting(true);
    try {
      await axiosInstance.post(APPOINTMENTS.CREATE, {
        doctor_id: confirmModal.doctor.id,
        appointment_date: date,
        appointment_time,
        notes: 'Online booking via dashboard',
      });
      toast.success(t('patient.booking.success', { name: confirmModal.doctor.name }));
      const doctorId = confirmModal.doctor.id;
      setConfirmModal(null);
      setSelectedSlot(null);
      setSlotsByDoctor((prev) => {
        const next = { ...prev };
        delete next[doctorId];
        return next;
      });
      await refreshSlotsForDoctor(doctorId);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('patient.booking.errorBooking')));
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-800 text-start">{t('patient.booking.title')}</h1>
      </div>

      <div className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 text-start">{t('patient.booking.specialty')}</label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none bg-white"
            >
              {specialtyOptions.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 text-start">{t('patient.booking.governorate')}</label>
            <select
              value={governorate}
              onChange={(e) => {
                setGovernorate(e.target.value);
                setArea('');
              }}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none bg-white"
            >
              {GOVERNORATES.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 text-start">{t('patient.booking.area')}</label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none bg-white"
            >
              <option value="">{t('patient.booking.allAreas')}</option>
              {(AREAS[governorate] || []).map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-start gap-2 mt-4">
          {specialtyOptions.map((s) => (
            <button
              key={`booking-chip-${s}`}
              type="button"
              onClick={() => setSpecialty(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                specialty === s
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((doc) => {
          const slotDays = slotsByDoctor[doc.id];
          const slotsLoading = slotsLoadingId === doc.id;
          return (
            <div key={doc.id} className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5">
              <div className="flex items-start gap-3 mb-4">
                <img src={doc.img} alt={doc.name} className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" />
                <div className="flex-1 text-start">
                  <div className="flex items-center justify-start gap-2">
                    <div className="flex items-center gap-0.5">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-bold text-yellow-500">{doc.rating}</span>
                    </div>
                    <p className="font-extrabold text-gray-800">{doc.name}</p>
                  </div>
                  <p className="text-sm text-blue-500 mt-0.5">{doc.specialty}</p>
                  <p className="text-xs text-gray-400 flex items-center justify-start gap-1 mt-1">
                    <MapPin size={11} />
                    <span>
                      {doc.area}، {doc.location}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 flex items-center justify-start gap-1 mt-0.5">
                    <span>🏥</span>
                    <span>{t('patient.booking.price', { price: doc.price })}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-600 text-start">{t('patient.booking.slotsTitle')}</p>
                {slotDays === undefined && (
                  <p className="text-xs text-gray-400 text-start">{t('patient.booking.slotsLoadingHint')}</p>
                )}
                {slotDays !== undefined &&
                  slotDays.map((dayRow) => (
                    <div key={dayRow.date}>
                      <p className="text-xs text-gray-400 text-start mb-1.5">{dayRow.dayLabel}</p>
                      <div className="flex flex-wrap gap-2 justify-start">
                        {dayRow.slots.length === 0 ? (
                          <span className="text-xs text-gray-400">{t('patient.booking.noSlotsDay')}</span>
                        ) : (
                          dayRow.slots.map((time) => {
                            const isSelected =
                              selectedSlot?.doctorId === doc.id &&
                              selectedSlot?.date === dayRow.date &&
                              selectedSlot?.time === time;
                            return (
                              <button
                                key={`${dayRow.date}-${time}`}
                                type="button"
                                onClick={() =>
                                  setSelectedSlot({
                                    doctorId: doc.id,
                                    date: dayRow.date,
                                    dayLabel: dayRow.dayLabel,
                                    time,
                                  })
                                }
                                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                                  isSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                }`}
                              >
                                {time}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  ))}
                <button
                  type="button"
                  disabled={slotsLoading}
                  onClick={() => void refreshSlotsForDoctor(doc.id)}
                  className="text-xs text-blue-600 underline text-start disabled:opacity-50"
                >
                  {slotsLoading
                    ? t('patient.booking.loadingSlots')
                    : slotDays === undefined
                      ? t('patient.booking.loadSlots')
                      : t('patient.booking.reloadSlots')}
                </button>
              </div>

              <button
                type="button"
                disabled={bookingSubmitting}
                onClick={() => {
                  const slot = selectedSlot?.doctorId === doc.id ? selectedSlot : null;
                  if (!slot) {
                    toast.warning(t('patient.booking.pickSlot'));
                    return;
                  }
                  setConfirmModal({ doctor: doc, slot });
                }}
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {bookingSubmitting ? t('patient.booking.bookingSubmitting') : t('patient.booking.confirmBooking')}
              </button>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-400">
            <Search size={32} className="mx-auto mb-3 text-gray-300" />
            <p>{t('patient.booking.noResults')}</p>
          </div>
        )}
      </div>

      {confirmModal && (
        <ConfirmModal
          doctor={confirmModal.doctor}
          slot={confirmModal.slot}
          onClose={() => setConfirmModal(null)}
          onConfirm={handleConfirm}
          t={t}
        />
      )}
    </div>
  );
}
