import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, Save, Trash2, Eye, Edit } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import axiosInstance from '../../api/axiosInstance';
import { DOCTOR_API } from '../../api/endpoints';
import { getApiErrorMessage } from '../../utils/apiError';

const RX_STATUS_KEYS = ['active', 'ended'];

function rxStatusLabel(statusKey, t) {
  return statusKey === 'ended' ? t('doctor.prescriptions.statusEnded') : t('doctor.prescriptions.statusActive');
}

const rxStatusSelectClass =
  'max-w-full min-w-0 w-full text-xs border border-gray-200 rounded-lg py-1.5 px-2 bg-white text-gray-800 text-start focus:outline-none focus:ring-2 focus:ring-blue-500/30';

function AddPrescriptionModal({ onClose, onSave }) {
  const { t } = useTranslation();
  const [patientSearch, setPatientSearch] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [drugs, setDrugs] = useState([{ name: '', dose: '', repeat: '', duration: '' }]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const addDrug = () => setDrugs([...drugs, { name: '', dose: '', repeat: '', duration: '' }]);
  const updateDrug = (i, field, val) => setDrugs(drugs.map((d, idx) => (idx === i ? { ...d, [field]: val } : d)));

  const handleSave = async () => {
    if (!patientSearch?.trim()) return;
    setLoading(true);
    const drugLine = drugs
      .map((d) => [d.name, d.dose, d.repeat, d.duration].filter(Boolean).join(' ').trim())
      .filter(Boolean)
      .join(' | ') || drugs[0]?.name || '-';
    try {
      await Promise.resolve(
        onSave({
          patient: patientSearch.trim(),
          diagnosis: diagnosis?.trim() || null,
          drug: drugLine,
          notes: notes?.trim() || null,
        })
      );
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const drugFields = [
    { field: 'duration', ph: t('doctor.prescriptions.phDuration') },
    { field: 'repeat', ph: t('doctor.prescriptions.phRepeat') },
    { field: 'dose', ph: t('doctor.prescriptions.phDose') },
    { field: 'name', ph: t('doctor.prescriptions.phDrugName') },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} role="presentation" />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 gap-3">
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0">
            <X size={20} />
          </button>
          <div className="text-start flex-1">
            <h3 className="font-bold text-gray-800 text-lg">{t('doctor.prescriptions.modalTitle')}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{t('doctor.prescriptions.modalHint')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 text-start">{t('doctor.prescriptions.patientName')}</label>
              <input
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder={t('doctor.prescriptions.phPatient')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 text-start">{t('doctor.prescriptions.diagnosis')}</label>
              <input
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder={t('doctor.prescriptions.phDiagnosis')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
              <button type="button" onClick={addDrug} className="flex items-center gap-1 text-blue-600 text-xs font-semibold hover:underline">
                <Plus size={13} />
                {t('doctor.prescriptions.addDrug')}
              </button>
              <p className="text-xs font-semibold text-gray-600 text-start">{t('doctor.prescriptions.drugDetails')}</p>
            </div>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="hidden sm:grid grid-cols-4 gap-2 px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-500 text-center">
                <span>{t('doctor.prescriptions.colDuration')}</span>
                <span>{t('doctor.prescriptions.colRepeat')}</span>
                <span>{t('doctor.prescriptions.colDose')}</span>
                <span className="text-start">{t('doctor.prescriptions.colDrugName')}</span>
              </div>
              {drugs.map((drug, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-4 gap-2 px-3 py-2 border-t border-gray-50 items-center">
                  {drugFields.map(({ field, ph }) => (
                    <input
                      key={field}
                      value={drug[field]}
                      onChange={(e) => updateDrug(i, field, e.target.value)}
                      placeholder={ph}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-start focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 text-start">{t('doctor.prescriptions.notes')}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('doctor.prescriptions.phNotes')}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || !patientSearch}
            className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <>
                <Save size={14} />
                {t('doctor.prescriptions.saveSend')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ViewPrescriptionModal({ rx, onClose, onStatusChange }) {
  const { t } = useTranslation();
  if (!rx) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} role="presentation" />
      <div
        className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md z-10 text-start max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rx-view-title"
      >
        <div className="flex items-center justify-between gap-3 mb-5">
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0" aria-label={t('common.close')}>
            <X size={20} />
          </button>
          <h3 id="rx-view-title" className="font-bold text-gray-800 text-lg flex-1">
            {t('doctor.prescriptions.viewTitle')}
          </h3>
        </div>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-xs font-semibold text-gray-500">{t('doctor.prescriptions.colPatient')}</dt>
            <dd className="font-bold text-gray-800 mt-0.5">{rx.patient}</dd>
            <dd className="text-xs text-gray-400">{rx.pid}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-gray-500">{t('doctor.prescriptions.colDiagnosis')}</dt>
            <dd className="text-gray-800 mt-0.5">{rx.diagnosis}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-gray-500">{t('doctor.prescriptions.colDrug')}</dt>
            <dd className="text-blue-600 font-semibold mt-0.5">{rx.drug}</dd>
          </div>
          <div className="flex flex-wrap gap-4">
            <div>
              <dt className="text-xs font-semibold text-gray-500">{t('doctor.prescriptions.colDate')}</dt>
              <dd className="text-gray-800 mt-0.5">{rx.date}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-gray-500">{t('doctor.prescriptions.colStatus')}</dt>
              <dd className="mt-1">
                <select
                  value={rx.statusKey === 'ended' ? 'ended' : 'active'}
                  onChange={(e) => onStatusChange(rx.id, e.target.value)}
                  className={rxStatusSelectClass}
                  aria-label={t('doctor.prescriptions.colStatus')}
                >
                  {RX_STATUS_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {rxStatusLabel(k, t)}
                    </option>
                  ))}
                </select>
              </dd>
            </div>
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

export default function DoctorPrescriptionsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [prescriptions, setPrescriptions] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [viewRx, setViewRx] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(DOCTOR_API.PRESCRIPTIONS);
      const mapped = (res.data?.prescriptions || []).map((p) => {
        const pd = p.prescribed_at;
        let dateStr = '-';
        if (pd != null) {
          dateStr = typeof pd === 'string' ? pd.slice(0, 10) : String(pd).slice(0, 10);
        }
        return {
          id: p.id,
          patient: p.patient_name,
          pid: p.patient_id ? `#${p.patient_id}` : '#NA',
          diagnosis: p.diagnosis || '-',
          drug: p.drug,
          date: dateStr,
          statusKey: p.status === 'ended' ? 'ended' : 'active',
        };
      });
      setPrescriptions(mapped);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only
  }, []);

  const patchPrescriptionStatus = async (id, statusKey) => {
    try {
      await axiosInstance.put(DOCTOR_API.PRESCRIPTION_BY_ID(id), { status: statusKey });
      setPrescriptions((prev) => prev.map((x) => (x.id === id ? { ...x, statusKey } : x)));
      setViewRx((prev) => (prev && prev.id === id ? { ...prev, statusKey } : prev));
      toast.success(t('doctor.prescriptions.statusUpdated'));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus size={15} />
          {t('doctor.prescriptions.newRx')}
        </button>
        <div className="text-start">
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-800">{t('doctor.prescriptions.title')}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{loading ? t('common.loading') : t('doctor.prescriptions.subtitle')}</p>
        </div>
      </div>

      <div className="card-hover-panel bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-6 gap-3 px-5 py-3 bg-white/50 border-b border-gray-100 text-xs font-semibold text-gray-500 text-center">
          <span>{t('doctor.prescriptions.colActions')}</span>
          <span>{t('doctor.prescriptions.colStatus')}</span>
          <span>{t('doctor.prescriptions.colDate')}</span>
          <span>{t('doctor.prescriptions.colDrug')}</span>
          <span>{t('doctor.prescriptions.colDiagnosis')}</span>
          <span className="text-start">{t('doctor.prescriptions.colPatient')}</span>
        </div>
        <div className="divide-y divide-gray-50">
          {!loading && prescriptions.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-gray-400">{t('doctor.prescriptions.emptyList')}</div>
          )}
          {prescriptions.map((p) => (
            <div key={p.id} className="px-5 py-4">
              <div className="md:hidden flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setViewRx(p)}
                  className="flex items-center gap-1 border border-blue-200 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors shrink-0"
                >
                  <Eye size={13} />
                  {t('doctor.prescriptions.openFile')}
                </button>
                <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                  <div className="text-start min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{p.patient}</p>
                    <p className="text-xs text-gray-400">
                      {p.diagnosis} — {p.date}
                    </p>
                  </div>
                  <select
                    value={p.statusKey === 'ended' ? 'ended' : 'active'}
                    onChange={(e) => patchPrescriptionStatus(p.id, e.target.value)}
                    className={`${rxStatusSelectClass} shrink-0 max-w-[7.5rem]`}
                    aria-label={t('doctor.prescriptions.colStatus')}
                  >
                    {RX_STATUS_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {rxStatusLabel(k, t)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="hidden md:grid grid-cols-6 gap-3 items-center text-center">
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewRx(p)}
                    className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 text-gray-400"
                    title={t('doctor.prescriptions.openFile')}
                    aria-label={t('doctor.prescriptions.openFile')}
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.info(t('doctor.prescriptions.toastEdit') + p.patient)}
                    className="w-8 h-8 border border-blue-200 rounded-lg flex items-center justify-center hover:bg-blue-50 text-blue-400"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await axiosInstance.delete(DOCTOR_API.PRESCRIPTION_BY_ID(p.id));
                        setPrescriptions((prev) => prev.filter((x) => x.id !== p.id));
                        toast.success(t('doctor.prescriptions.toastDeleted'));
                      } catch (err) {
                        toast.error(getApiErrorMessage(err, t('authErrors.default')));
                      }
                    }}
                    className="w-8 h-8 border border-red-200 rounded-lg flex items-center justify-center hover:bg-red-50 text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <select
                  value={p.statusKey === 'ended' ? 'ended' : 'active'}
                  onChange={(e) => patchPrescriptionStatus(p.id, e.target.value)}
                  className={`${rxStatusSelectClass} mx-auto max-w-[9rem]`}
                  aria-label={t('doctor.prescriptions.colStatus')}
                >
                  {RX_STATUS_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {rxStatusLabel(k, t)}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-500">{p.date}</span>
                <span className="text-sm text-blue-500 font-semibold">{p.drug}</span>
                <span className="text-sm text-gray-600">{p.diagnosis}</span>
                <div className="text-start">
                  <p className="font-bold text-gray-800 text-sm">{p.patient}</p>
                  <p className="text-xs text-gray-400">{p.pid}</p>
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
                className={`w-8 h-8 rounded-lg text-sm font-semibold ${n === 1 ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-start">{t('doctor.prescriptions.footer', { count: prescriptions.length, total: 24 })}</p>
        </div>
      </div>

      {viewRx && (
        <ViewPrescriptionModal rx={viewRx} onClose={() => setViewRx(null)} onStatusChange={patchPrescriptionStatus} />
      )}

      {showAdd && (
        <AddPrescriptionModal
          onClose={() => setShowAdd(false)}
          onSave={async (p) => {
            try {
              await axiosInstance.post(DOCTOR_API.PRESCRIPTIONS, {
                patient_name: p.patient,
                diagnosis: p.diagnosis,
                drug: p.drug,
                notes: p.notes,
                status: 'active',
              });
              toast.success(t('doctor.prescriptions.toastIssued'));
              await fetchPrescriptions();
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
