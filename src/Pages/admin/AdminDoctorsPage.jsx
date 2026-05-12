import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import axiosInstance from '../../api/axiosInstance';
import { ADMIN } from '../../api/endpoints';
import { getApiErrorMessage } from '../../utils/apiError';
import { translateDoctorActiveStatus } from '../../utils/i18nStatus';
import { Search, Plus, X, Save, Eye, Trash2 } from 'lucide-react';
import ConfirmActionModal from '../../components/ConfirmActionModal';
import { ADMIN_FILTER } from '../../constants/adminUi';
import { getSpecialtyOptionsFromDoctors, matchesSpecialty, SPECIALTY_ALL_AR } from '../../utils/specialtyFilter';

const SPECIALTIES = ['قلب وأوعية دموية', 'طب الأسنان', 'عظام', 'طب عيون', 'أطفال', 'مخ وأعصاب', 'علاج طبيعي', 'باطنة'];

const FILTER_VALUES = [ADMIN_FILTER.ALL, ADMIN_FILTER.ACTIVE, ADMIN_FILTER.INACTIVE];

function mapDoctorFromApi(payload, form) {
  const d = payload?.doctor ?? payload?.data ?? payload;
  const active = d.is_active !== false && d.active !== false && d.status !== ADMIN_FILTER.INACTIVE;
  return {
    id: d.id ?? Date.now(),
    name: d.name ?? form.name,
    specialty: d.specialty ?? form.specialty,
    email: d.email ?? form.email,
    phone: d.phone ?? form.phone ?? '',
    center: d.area ?? d.center ?? form.center ?? '',
    status: active ? ADMIN_FILTER.ACTIVE : ADMIN_FILTER.INACTIVE,
    patients: d.patients_count ?? d.patients ?? 0,
    rating: Number(d.rating) || 0,
    img: d.avatar_url ?? d.img ?? `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 90)}.jpg`,
  };
}

function filterLabelKey(v) {
  if (v === ADMIN_FILTER.ALL) return 'admin.doctors.filterAll';
  if (v === ADMIN_FILTER.ACTIVE) return 'admin.doctors.active';
  return 'admin.doctors.inactive';
}

function AddDoctorModal({ onClose, onSave }) {
  const { t } = useTranslation();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', specialty: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!form.name || !form.email || !form.specialty) {
      toast.error(t('admin.doctors.errors.required'));
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post(ADMIN.DOCTORS, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        specialty: form.specialty,
        role: 'doctor',
      });
      onSave(mapDoctorFromApi(res.data, form));
      onClose();
    } catch (err) {
      if (err.response) {
        toast.error(getApiErrorMessage(err, t('admin.doctors.addFail')));
        setLoading(false);
        return;
      }
      onSave({
        ...form,
        id: Date.now(),
        center: form.center || '',
        status: ADMIN_FILTER.ACTIVE,
        patients: 0,
        rating: 0,
        img: `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 90)}.jpg`,
      });
      toast.info(t('admin.doctors.savedLocal'));
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} role="presentation" />
      <div className="relative bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 w-full max-w-lg z-10">
        <div className="flex items-center justify-between mb-5 gap-3">
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0">
            <X size={20} />
          </button>
          <h3 className="font-bold text-gray-800 text-lg text-start flex-1">{t('admin.doctors.modalTitle')}</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: t('admin.doctors.fieldName'), name: 'name', placeholder: t('admin.doctors.phDoctorName'), type: 'text' },
              { label: t('admin.doctors.fieldPhone'), name: 'phone', placeholder: t('admin.doctors.phPhone'), type: 'tel' },
              { label: t('admin.doctors.fieldEmail'), name: 'email', placeholder: t('admin.doctors.phEmailDoctor'), type: 'email' },
              { label: t('admin.doctors.fieldPassword'), name: 'password', placeholder: '••••••', type: 'password' },
            ].map(({ label, name, placeholder, type }) => (
              <div key={name}>
                <label className="block text-xs font-semibold text-gray-600 mb-1 text-start">{label}</label>
                <input
                  type={type}
                  value={form[name]}
                  onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 text-start">{t('admin.doctors.specialty')}</label>
            <select
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none bg-white"
            >
              <option value="">{t('admin.doctors.pickSpecialty')}</option>
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || !form.name || !form.email}
            className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <>
                <Save size={15} />
                {t('admin.doctors.saveBtn')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function DoctorDetailsModal({ doctor, onClose, t }) {
  if (!doctor) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} role="presentation" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
          <h3 className="text-lg font-bold text-gray-800">{t('admin.doctors.view')}</h3>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <img src={doctor.img} alt={doctor.name} className="w-16 h-16 rounded-2xl object-cover" />
          <div className="text-start">
            <p className="font-bold text-gray-800">{doctor.name}</p>
            <p className="text-sm text-blue-600">{doctor.specialty || '-'}</p>
            <p className="text-xs text-gray-500 mt-1">{translateDoctorActiveStatus(doctor.status, t)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">{t('admin.doctors.fieldEmail')}</p>
            <p className="text-gray-800 break-all">{doctor.email || '-'}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">{t('admin.doctors.fieldPhone')}</p>
            <p className="text-gray-800">{doctor.phone || '-'}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">{t('admin.doctors.patientCount', { count: '' }).replace(/\s*[:：]?\s*$/, '')}</p>
            <p className="text-gray-800">{doctor.patients ?? 0}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Rating</p>
            <p className="text-gray-800">{doctor.rating ?? 0}</p>
          </div>
        </div>

        <div className="mt-5">
          <button type="button" onClick={onClose} className="w-full border border-gray-200 text-gray-700 rounded-xl py-2.5 font-semibold hover:bg-gray-50">
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDoctorsPage() {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const toast = useToast();
  const [filterStatus, setFilterStatus] = useState(ADMIN_FILTER.ALL);
  const [specialtyFilter, setSpecialtyFilter] = useState(SPECIALTY_ALL_AR);
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [detailsDoctor, setDetailsDoctor] = useState(null);
  const [viewLoadingId, setViewLoadingId] = useState(null);
  const specialtyOptions = useMemo(() => getSpecialtyOptionsFromDoctors(doctors), [doctors]);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(ADMIN.DOCTORS);
      const mapped = (res.data?.doctors || []).map((d) => mapDoctorFromApi({ doctor: d }, {}));
      setDoctors(mapped);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only
  }, []);

  const filtered = useMemo(() => doctors.filter((d) => {
    const matchSearch = d.name.includes(search) || d.specialty.includes(search);
    const matchStatus = filterStatus === ADMIN_FILTER.ALL || d.status === filterStatus;
    const matchSpecialty = matchesSpecialty(d.specialty, specialtyFilter);
    return matchSearch && matchStatus && matchSpecialty;
  }), [doctors, search, filterStatus, specialtyFilter]);

  const toggleStatus = async (id) => {
    const doc = doctors.find((d) => d.id === id);
    try {
      await axiosInstance.patch(`${ADMIN.DOCTOR_BY_ID(id)}/toggle-status`);
      setDoctors((prev) =>
        prev.map((d) =>
          d.id === id
            ? { ...d, status: d.status === ADMIN_FILTER.ACTIVE ? ADMIN_FILTER.INACTIVE : ADMIN_FILTER.ACTIVE }
            : d
        )
      );
      toast.info(doc?.status === ADMIN_FILTER.ACTIVE ? t('admin.doctors.toggledOff') : t('admin.doctors.toggledOn'));
      return true;
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
      return false;
    }
  };

  const deleteDoctor = async (id) => {
    try {
      await axiosInstance.delete(ADMIN.DOCTOR_BY_ID(id));
      setDoctors((prev) => prev.filter((d) => d.id !== id));
      toast.error(t('admin.doctors.deleted'), t('admin.doctors.deleteTitle'));
      return true;
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
      return false;
    }
  };

  const handleConfirmPending = async () => {
    if (!pendingAction) return;
    setActionSubmitting(true);
    try {
      const ok =
        pendingAction.type === 'delete'
          ? await deleteDoctor(pendingAction.id)
          : await toggleStatus(pendingAction.id);
      if (ok) setPendingAction(null);
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleViewDoctor = async (doc) => {
    setViewLoadingId(doc.id);
    try {
      const res = await axiosInstance.get(ADMIN.DOCTOR_BY_ID(doc.id));
      const mapped = mapDoctorFromApi(res.data, doc);
      setDetailsDoctor(mapped);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
    } finally {
      setViewLoadingId(null);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          {t('admin.doctors.add')}
        </button>
        <div className="text-start">
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-800">{t('admin.doctors.title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{loading ? t('common.loading') : t('admin.doctors.subtitle', { count: doctors.length })}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-2 bg-white rounded-xl shadow-sm p-1">
          {FILTER_VALUES.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setFilterStatus(v)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filterStatus === v
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-800 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50/70'
              }`}
            >
              {t(filterLabelKey(v))}
            </button>
          ))}
        </div>
        <select
          value={specialtyFilter}
          onChange={(e) => setSpecialtyFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-start"
        >
          {specialtyOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <div className="relative flex-1 min-w-48">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.doctors.searchPh')}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 pe-10 text-sm text-start placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
          />
          <Search size={16} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {specialtyOptions.map((s) => (
          <button
            key={`admin-chip-${s}`}
            type="button"
            onClick={() => setSpecialtyFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              specialtyFilter === s
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc) => (
          <div key={doc.id} className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 text-start min-w-0">
                <p className="font-bold text-gray-800">{doc.name}</p>
                <p className="text-xs text-blue-500 mt-0.5">{doc.specialty}</p>
                {doc.center ? <p className="text-xs text-cyan-700 mt-0.5">{doc.center}</p> : null}
                <p className="text-xs text-gray-400 mt-0.5 break-all">{doc.email}</p>
              </div>
              <img src={doc.img} alt="" className="w-14 h-14 rounded-2xl object-cover shrink-0" />
            </div>

            <div className="flex items-center justify-between text-xs bg-gray-50 rounded-xl p-3 gap-2 flex-wrap">
              <span className="text-yellow-500 font-bold">⭐ {doc.rating}</span>
              <span className="text-gray-500">{t('admin.doctors.patientCount', { count: doc.patients })}</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded-full ${
                  doc.status === ADMIN_FILTER.ACTIVE ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {translateDoctorActiveStatus(doc.status, t)}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setPendingAction({
                    type: 'delete',
                    id: doc.id,
                    name: doc.name,
                    isActive: doc.status === ADMIN_FILTER.ACTIVE,
                  })
                }
                className="w-9 h-9 border border-red-200 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-50 transition-colors shrink-0"
              >
                <Trash2 size={15} />
              </button>
              <button
                type="button"
                onClick={() =>
                  setPendingAction({
                    type: 'toggle',
                    id: doc.id,
                    name: doc.name,
                    isActive: doc.status === ADMIN_FILTER.ACTIVE,
                  })
                }
                className={`flex-1 font-semibold py-2 rounded-xl text-sm transition-colors ${
                  doc.status === ADMIN_FILTER.ACTIVE
                    ? 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    : 'border border-green-200 text-green-600 hover:bg-green-50'
                }`}
              >
                {doc.status === ADMIN_FILTER.ACTIVE ? t('admin.doctors.disable') : t('admin.doctors.enable')}
              </button>
              <button
                type="button"
                onClick={() => void handleViewDoctor(doc)}
                className="flex-1 bg-blue-600 text-white font-semibold py-2 rounded-xl text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
              >
                <Eye size={14} />
                {viewLoadingId === doc.id ? t('common.loading') : t('admin.doctors.view')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <AddDoctorModal
          onClose={() => setShowAdd(false)}
          onSave={(doc) => {
            setDoctors((prev) => [doc, ...prev]);
            toast.success(t('admin.doctors.addSuccessNamed', { name: doc.name }));
          }}
        />
      )}

      <ConfirmActionModal
        open={!!pendingAction}
        onClose={() => !actionSubmitting && setPendingAction(null)}
        title={
          !pendingAction
            ? ''
            : pendingAction.type === 'delete'
              ? t('admin.confirm.deleteDoctorTitle')
              : pendingAction.isActive
                ? t('admin.confirm.toggleDoctorOffTitle')
                : t('admin.confirm.toggleDoctorOnTitle')
        }
        description={
          !pendingAction
            ? ''
            : pendingAction.type === 'delete'
              ? t('admin.confirm.deleteDoctorBody', { name: pendingAction.name })
              : pendingAction.isActive
                ? t('admin.confirm.toggleDoctorOffBody', { name: pendingAction.name })
                : t('admin.confirm.toggleDoctorOnBody', { name: pendingAction.name })
        }
        variant={pendingAction?.type === 'delete' ? 'danger' : 'warning'}
        isSubmitting={actionSubmitting}
        onConfirm={handleConfirmPending}
      />

      {detailsDoctor && <DoctorDetailsModal doctor={detailsDoctor} onClose={() => setDetailsDoctor(null)} t={t} />}
    </div>
  );
}
