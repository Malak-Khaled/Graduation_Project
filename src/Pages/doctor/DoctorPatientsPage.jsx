import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import { Search, UserPlus, Download, Eye, X, Save } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { DOCTOR_API } from '../../api/endpoints';
import { getApiErrorMessage } from '../../utils/apiError';
import { getApiOrigin } from '../../utils/apiOrigin';

const PATIENT_CARE_KEYS = ['active', 'follow_up', 'stable', 'archived'];

const patientCareSelectClass =
  'max-w-full min-w-0 w-full text-xs border border-gray-200 rounded-lg py-1.5 px-2 bg-white text-gray-800 text-start focus:outline-none focus:ring-2 focus:ring-blue-500/30';

function AddPatientModal({ onClose, onSave }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '',
    nationalId: '',
    birthDate: '',
    gender: '',
    phone: '',
    email: '',
    password: '',
    bloodType: '',
    medicalHistory: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!form.name?.trim() || !form.email?.trim() || !form.password || form.password.length < 8) return;
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} role="presentation" />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5 gap-3">
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0">
            <X size={20} />
          </button>
          <h3 className="font-bold text-gray-800 text-lg text-start flex-1">{t('doctor.patients.modalTitle')}</h3>
        </div>
        <p className="text-gray-400 text-xs text-start mb-4">{t('doctor.patients.modalHint')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: t('doctor.patients.fieldFullName'), name: 'name', placeholder: t('doctor.patients.phFullName') },
            { label: t('doctor.patients.fieldNationalId'), name: 'nationalId', placeholder: t('doctor.patients.phNationalId') },
            { label: t('doctor.patients.fieldBirth'), name: 'birthDate', type: 'date' },
            { label: t('doctor.patients.fieldPhone'), name: 'phone', placeholder: t('doctor.patients.phPhone') },
            { label: t('doctor.patients.fieldEmail'), name: 'email', placeholder: t('doctor.patients.phEmail'), type: 'email' },
            { label: t('doctor.patients.fieldPassword'), name: 'password', placeholder: t('doctor.patients.phPassword'), type: 'password' },
          ].map(({ label, name, placeholder, type = 'text' }) => (
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
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 text-start">{t('doctor.patients.fieldGender')}</label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none bg-white"
            >
              <option value="">{t('doctor.patients.pickGender')}</option>
              <option value="ذكر">{t('patient.profile.genderMale')}</option>
              <option value="أنثى">{t('patient.profile.genderFemale')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 text-start">{t('doctor.patients.fieldBlood')}</label>
            <select
              value={form.bloodType}
              onChange={(e) => setForm({ ...form, bloodType: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none bg-white"
            >
              <option value="">{t('doctor.patients.pickBlood')}</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1 text-start">{t('doctor.patients.fieldHistory')}</label>
            <textarea
              value={form.medicalHistory}
              onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })}
              placeholder={t('doctor.patients.phHistory')}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            />
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
            disabled={loading || !form.name?.trim() || !form.email?.trim() || !form.password || form.password.length < 8}
            className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <>
                <Save size={14} />
                {t('doctor.patients.addPatientBtn')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function patientCareLabel(key, t) {
  return t(`doctor.patients.careStatus.${key}`);
}

function ViewPatientModal({ patient, onClose, onCareStatusChange }) {
  const { t } = useTranslation();
  if (!patient) return null;
  const care = PATIENT_CARE_KEYS.includes(patient.careStatus) ? patient.careStatus : 'active';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} role="presentation" />
      <div
        className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md z-10 text-start max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="patient-view-title"
      >
        <div className="flex items-center justify-between gap-3 mb-5">
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0" aria-label={t('common.close')}>
            <X size={20} />
          </button>
          <h3 id="patient-view-title" className="font-bold text-gray-800 text-lg flex-1">
            {t('doctor.patients.viewTitle')}
          </h3>
        </div>
        <div className="flex items-center gap-4 mb-5">
          <img src={patient.img} alt="" className="w-16 h-16 rounded-2xl object-cover shrink-0 ring-2 ring-blue-100" />
          <div className="min-w-0">
            <p className="font-bold text-gray-800 text-lg truncate">{patient.name}</p>
            <p className="text-sm text-gray-500">{patient.pid}</p>
          </div>
        </div>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
            <dt className="text-xs font-semibold text-gray-500">{t('doctor.patients.colLastVisit')}</dt>
            <dd className="text-gray-800 font-medium">{patient.lastVisit}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
            <dt className="text-xs font-semibold text-gray-500">{t('doctor.patients.colGender')}</dt>
            <dd className="text-gray-800 font-medium">{patient.gender}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
            <dt className="text-xs font-semibold text-gray-500">{t('doctor.patients.colAge')}</dt>
            <dd className="text-gray-800 font-medium">{t('admin.patients.ageSuffix', { age: patient.age })}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-gray-500 mb-1">{t('doctor.patients.colCareStatus')}</dt>
            <dd>
              <select
                value={care}
                onChange={(e) => onCareStatusChange(patient.id, e.target.value)}
                className={patientCareSelectClass}
                aria-label={t('doctor.patients.colCareStatus')}
              >
                {PATIENT_CARE_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {patientCareLabel(k, t)}
                  </option>
                ))}
              </select>
            </dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full bg-blue-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-blue-700 transition-colors"
        >
          {t('common.close')}
        </button>
      </div>
    </div>
  );
}

export default function DoctorPatientsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [viewPatient, setViewPatient] = useState(null);
  const [loading, setLoading] = useState(false);

  const apiOrigin = getApiOrigin();
  const placeholderImg = 'https://randomuser.me/api/portraits/lego/2.jpg';

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(DOCTOR_API.PATIENTS);
      const mapped = (res.data?.patients || []).map((p) => {
        const birth = p.date_of_birth ? new Date(p.date_of_birth) : null;
        let age = '-';
        if (birth && !Number.isNaN(birth.getTime())) {
          age = Math.max(0, new Date().getFullYear() - birth.getFullYear());
        }
        return {
          id: p.id,
          name: p.name,
          pid: `#MD-${p.id}`,
          age,
          gender:
            p.gender === 'female'
              ? t('patient.profile.genderFemale')
              : p.gender === 'male'
                ? t('patient.profile.genderMale')
                : p.gender || '—',
          lastVisit: p.last_visit ? String(p.last_visit).slice(0, 10) : '-',
          img: p.avatar ? `${apiOrigin}/storage/${p.avatar}` : placeholderImg,
          careStatus: p.care_status && PATIENT_CARE_KEYS.includes(p.care_status) ? p.care_status : 'active',
        };
      });
      setPatients(mapped);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only
  }, []);

  const patchPatientCareStatus = async (id, careStatus) => {
    try {
      await axiosInstance.put(DOCTOR_API.PATIENT_CARE_STATUS(id), { care_status: careStatus });
      setPatients((prev) => prev.map((x) => (x.id === id ? { ...x, careStatus } : x)));
      setViewPatient((prev) => (prev && prev.id === id ? { ...prev, careStatus } : prev));
      toast.success(t('doctor.patients.careStatusUpdated'));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
    }
  };

  const filtered = useMemo(
    () => patients.filter((p) => p.name.includes(search) || p.pid.includes(search)),
    [patients, search]
  );

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <UserPlus size={15} />
          {t('doctor.patients.addNew')}
        </button>
        <div className="text-start">
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-800">{t('doctor.patients.title')}</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {loading ? t('common.loading') : t('doctor.patients.subtitle', { count: patients.length })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          className="flex items-center gap-1 border border-gray-200 bg-white/80 text-gray-500 px-3 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors"
        >
          <Download size={14} />
        </button>
        <div className="flex gap-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-1">
          {[t('doctor.patients.filterAll'), t('doctor.patients.filterLast')].map((f) => (
            <button key={f} type="button" className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
              {f}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-48">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('doctor.patients.searchPh')}
            className="w-full bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2.5 pe-10 text-sm text-start placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
          />
          <Search size={16} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="card-hover-panel bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-6 gap-3 px-5 py-3 bg-white/50 border-b border-gray-100 text-xs font-semibold text-gray-500 text-center">
          <span>{t('doctor.patients.colActions')}</span>
          <span>{t('doctor.patients.colCareStatus')}</span>
          <span>{t('doctor.patients.colLastVisit')}</span>
          <span>{t('doctor.patients.colGender')}</span>
          <span>{t('doctor.patients.colAge')}</span>
          <span className="text-start">{t('doctor.patients.colName')}</span>
        </div>
        <div className="divide-y divide-gray-50">
          {!loading && filtered.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-gray-400">{t('doctor.patients.emptyList')}</div>
          )}
          {filtered.map((p) => (
            <div key={p.id} className="px-5 py-4">
              <div className="md:hidden space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setViewPatient(p)}
                    className="flex items-center gap-1 border border-blue-200 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Eye size={13} />
                    {t('doctor.patients.openFile')}
                  </button>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="text-start min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">
                        {p.pid} • {t('admin.patients.ageSuffix', { age: p.age })}
                      </p>
                    </div>
                    <img src={p.img} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 shrink-0">{t('doctor.patients.colCareStatus')}</span>
                  <select
                    value={PATIENT_CARE_KEYS.includes(p.careStatus) ? p.careStatus : 'active'}
                    onChange={(e) => patchPatientCareStatus(p.id, e.target.value)}
                    className={`${patientCareSelectClass} flex-1`}
                    aria-label={t('doctor.patients.colCareStatus')}
                  >
                    {PATIENT_CARE_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {patientCareLabel(k, t)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="hidden md:grid grid-cols-6 gap-3 items-center text-center">
                <button
                  type="button"
                  onClick={() => setViewPatient(p)}
                  className="flex items-center justify-center gap-1 border border-blue-200 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors mx-auto"
                  title={t('doctor.patients.openFile')}
                  aria-label={t('doctor.patients.openFile')}
                >
                  <Eye size={13} />
                  {t('doctor.patients.openFile')}
                </button>
                <select
                  value={PATIENT_CARE_KEYS.includes(p.careStatus) ? p.careStatus : 'active'}
                  onChange={(e) => patchPatientCareStatus(p.id, e.target.value)}
                  className={`${patientCareSelectClass} mx-auto max-w-[10rem]`}
                  aria-label={t('doctor.patients.colCareStatus')}
                >
                  {PATIENT_CARE_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {patientCareLabel(k, t)}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-500">{p.lastVisit}</span>
                <span className="text-sm text-gray-600">{p.gender}</span>
                <span className="text-sm text-gray-600">{t('admin.patients.ageSuffix', { age: p.age })}</span>
                <div className="flex items-center gap-2 justify-end">
                  <div className="text-start min-w-0">
                    <p className="font-bold text-gray-800 text-sm">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.pid}</p>
                  </div>
                  <img src={p.img} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${n === 1 ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-start">{t('doctor.patients.footerRange', { shown: filtered.length, total: patients.length })}</p>
        </div>
      </div>

      {viewPatient && (
        <ViewPatientModal
          patient={viewPatient}
          onClose={() => setViewPatient(null)}
          onCareStatusChange={patchPatientCareStatus}
        />
      )}

      {showAdd && (
        <AddPatientModal
          onClose={() => setShowAdd(false)}
          onSave={async (form) => {
            try {
              const gender =
                form.gender === 'أنثى' || form.gender === 'female'
                  ? 'female'
                  : form.gender === 'ذكر' || form.gender === 'male'
                    ? 'male'
                    : null;
              await axiosInstance.post(DOCTOR_API.PATIENTS, {
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
                phone: form.phone?.trim() || null,
                gender,
                date_of_birth: form.birthDate || null,
              });
              toast.success(t('doctor.patients.addSuccessNamed', { name: form.name.trim() }));
              await fetchPatients();
            } catch (err) {
              toast.error(getApiErrorMessage(err, t('authErrors.default')));
              throw err;
            }
          }}
        />
      )}
    </div>
  );
}
