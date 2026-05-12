import { createElement, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import { Search, FileText, Download, Share2, Eye, X, Save, Plus, Droplet, Activity, Weight, Thermometer } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { DOCTOR_API } from '../../api/endpoints';
import { getApiErrorMessage } from '../../utils/apiError';
import { getApiOrigin } from '../../utils/apiOrigin';

const VISIT_TYPE_INDEX = {
  'كشف أول': 0,
  'كشف دوري': 1,
  'متابعة': 2,
  'استشارة': 3,
};

function translateVisitType(type, visitTypes) {
  const idx = VISIT_TYPE_INDEX[type];
  if (Array.isArray(visitTypes) && typeof idx === 'number' && visitTypes[idx]) return visitTypes[idx];
  return type;
}

function AddRecordModal({ patient, onClose, onSave }) {
  const { t, i18n } = useTranslation();
  const visitTypes = useMemo(() => t('doctor.records.visitTypes', { returnObjects: true }) || [], [t]);
  const [form, setForm] = useState({ type: '', diagnosis: '', prescription: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const visitTypeValue = form.type || visitTypes[0] || '';

  const handleSave = () => {
    setLoading(true);
    const locale = i18n.language?.startsWith('en') ? 'en-GB' : 'ar-EG';
    setTimeout(() => {
      onSave(patient.id, {
        ...form,
        type: form.type || visitTypes[0] || '',
        date: new Date().toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }),
        id: Date.now(),
      });
      setLoading(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} role="presentation" />
      <div className="relative bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 w-full max-w-lg z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5 gap-3">
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0">
            <X size={20} />
          </button>
          <h3 className="font-bold text-gray-800 text-lg flex-1 text-start">{t('doctor.records.modalAddTitle', { name: patient.name })}</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 text-start">{t('doctor.records.visitType')}</label>
            <select
              value={visitTypeValue}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none bg-white"
            >
              {visitTypes.map((vt) => (
                <option key={vt} value={vt}>{vt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 text-start">{t('doctor.records.diagnosisField')}</label>
            <textarea
              value={form.diagnosis}
              onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
              placeholder={t('doctor.records.phDiagnosisDetail')}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 text-start">{t('doctor.records.prescriptionField')}</label>
            <textarea
              value={form.prescription}
              onChange={(e) => setForm({ ...form, prescription: e.target.value })}
              placeholder={t('doctor.records.phPrescription')}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 text-start">{t('doctor.records.extraNotes')}</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={t('doctor.records.phExtraNotes')}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
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
            disabled={loading || !form.diagnosis}
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
                {t('doctor.records.saveRecord')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function PatientRecordsModal({ patient, onClose, onAddRecord }) {
  const { t } = useTranslation();
  const visitTypes = useMemo(() => t('doctor.records.visitTypes', { returnObjects: true }) || [], [t]);
  const [showAdd, setShowAdd] = useState(false);

  const vitalsConfig = useMemo(
    () => [
      { icon: Activity, label: t('doctor.records.vitalBP'), value: patient.vitals.bloodPressure, color: 'bg-blue-50 text-blue-600' },
      { icon: Droplet, label: t('doctor.records.vitalSugar'), value: patient.vitals.sugar, color: 'bg-red-50 text-red-500' },
      { icon: Weight, label: t('doctor.records.vitalWeight'), value: `${patient.vitals.weight} ${t('doctor.records.weightUnit')}`, color: 'bg-green-50 text-green-600' },
      { icon: Thermometer, label: t('doctor.records.vitalTemp'), value: patient.vitals.temperature, color: 'bg-orange-50 text-orange-500' },
    ],
    [patient.vitals, t]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} role="presentation" />
      <div className="relative bg-white/90 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-2xl z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 gap-3">
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0">
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
            <div className="text-start min-w-0">
              <h3 className="font-bold text-gray-800 truncate">{patient.name}</h3>
              <p className="text-xs text-gray-400">{t('doctor.records.ageBloodLine', { age: patient.age, blood: patient.bloodType })}</p>
            </div>
            <img src={patient.img} alt={patient.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
          </div>
        </div>

        <div className="p-5 border-b border-gray-100">
          <p className="font-bold text-gray-700 text-start mb-3">{t('doctor.records.vitalsTitle')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {vitalsConfig.map(({ icon, label, value, color }) => (
              <div key={label} className={`rounded-xl p-3 flex items-center gap-2 ${color.split(' ')[0]}`}>
                {createElement(icon, { size: 16, className: color.split(' ')[1] })}
                <div className="min-w-0 text-start">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className={`text-sm font-bold truncate ${color.split(' ')[1]}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>
          {patient.chronic.length > 0 && (
            <div className="mt-3 flex items-center gap-2 justify-start flex-wrap">
              <span className="text-xs text-gray-500 font-semibold">{t('doctor.records.chronicLabel')}</span>
              {patient.chronic.map((c) => (
                <span key={c} className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-full">{c}</span>
              ))}
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              <Plus size={15} />
              {t('doctor.records.addRecordBtn')}
            </button>
            <p className="font-bold text-gray-700 text-start">{t('doctor.records.recordsTitle', { count: patient.records.length })}</p>
          </div>

          <div className="space-y-3">
            {patient.records.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FileText size={28} className="mx-auto mb-2 text-gray-300" />
                <p>{t('doctor.records.emptyRecords')}</p>
              </div>
            ) : (
              patient.records.map((rec) => (
                <div key={rec.id} className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="flex items-center gap-1 text-gray-400 text-xs border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-white transition-colors"
                      >
                        <Download size={12} />
                        {t('doctor.records.download')}
                      </button>
                      <button
                        type="button"
                        className="flex items-center gap-1 text-blue-500 text-xs border border-blue-200 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <Share2 size={12} />
                        {t('doctor.records.share')}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full font-semibold">
                        {translateVisitType(rec.type, visitTypes)}
                      </span>
                      <span className="text-xs text-gray-400">{rec.date}</span>
                    </div>
                  </div>
                  <div className="text-start">
                    <p className="text-xs font-semibold text-gray-500 mb-1">{t('doctor.records.diagnosisLabel')}</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{rec.diagnosis}</p>
                  </div>
                  {rec.prescription && (
                    <div className="text-start">
                      <p className="text-xs font-semibold text-gray-500 mb-1">{t('doctor.records.rxLabel')}</p>
                      <p className="text-sm text-gray-600 bg-white rounded-lg p-2 border border-gray-100">{rec.prescription}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showAdd && (
        <AddRecordModal
          key={patient.id}
          patient={patient}
          onClose={() => setShowAdd(false)}
          onSave={onAddRecord}
        />
      )}
    </div>
  );
}

export default function DoctorRecordsPage() {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const apiOrigin = getApiOrigin();
  const placeholderRecordImg = 'https://randomuser.me/api/portraits/lego/3.jpg';

  const fetchDoctorRecordsData = async () => {
    setLoading(true);
    try {
      const [patientsRes, reportsRes, prescriptionsRes] = await Promise.all([
        axiosInstance.get(DOCTOR_API.PATIENTS),
        axiosInstance.get(DOCTOR_API.REPORTS),
        axiosInstance.get(DOCTOR_API.PRESCRIPTIONS),
      ]);

      const reports = reportsRes.data?.reports || [];
      const prescriptions = prescriptionsRes.data?.prescriptions || [];

      const recordsByPatient = {};

      reports.forEach((r) => {
        const key = String(r.patient_id || `name:${r.patient_name}`);
        recordsByPatient[key] ||= [];
        recordsByPatient[key].push({
          id: `report-${r.id}`,
          date: r.report_date || r.created_at?.slice(0, 10) || '-',
          type: r.type === 'periodic' ? 'كشف دوري' : r.type === 'lab' ? 'استشارة' : r.type === 'xray' ? 'متابعة' : 'استشارة',
          diagnosis: r.details || '-',
          prescription: '',
        });
      });

      prescriptions.forEach((p) => {
        const key = String(p.patient_id || `name:${p.patient_name}`);
        recordsByPatient[key] ||= [];
        recordsByPatient[key].push({
          id: `rx-${p.id}`,
          date: p.prescribed_at || p.created_at?.slice(0, 10) || '-',
          type: 'استشارة',
          diagnosis: p.diagnosis || '-',
          prescription: p.drug || '-',
        });
      });

      const mappedPatients = (patientsRes.data?.patients || []).map((p) => {
        const birth = p.date_of_birth ? new Date(p.date_of_birth) : null;
        const age = birth ? Math.max(0, new Date().getFullYear() - birth.getFullYear()) : '-';
        const key = String(p.id);
        const patientRecords = recordsByPatient[key] || recordsByPatient[`name:${p.name}`] || [];

        return {
          id: p.id,
          name: p.name,
          age,
          bloodType: 'N/A',
          img: p.avatar ? `${apiOrigin}/storage/${p.avatar}` : placeholderRecordImg,
          vitals: { bloodPressure: '-', sugar: '-', weight: '-', temperature: '-' },
          chronic: [],
          records: patientRecords,
        };
      });

      setPatients(mappedPatients);
      if (selectedPatient) {
        const refreshed = mappedPatients.find((p) => p.id === selectedPatient.id);
        if (refreshed) setSelectedPatient(refreshed);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorRecordsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only
  }, []);

  const filtered = patients.filter((p) =>
    p.name.includes(search) || p.bloodType.includes(search) || p.records.some((r) => r.diagnosis.includes(search))
  );

  const statThisMonth = Number(t('doctor.records.statThisMonthVal')) || 2;

  const handleAddRecord = async (patientId, record) => {
    const typeMap = {
      'كشف أول': 'lab',
      'كشف دوري': 'periodic',
      متابعة: 'xray',
      استشارة: 'rx',
    };
    try {
      await axiosInstance.post(DOCTOR_API.REPORTS, {
        patient_id: patientId,
        patient_name: selectedPatient?.name,
        type: typeMap[record.type] || 'lab',
        report_date: null,
        details: record.diagnosis || null,
      });

      if (record.prescription) {
        await axiosInstance.post(DOCTOR_API.PRESCRIPTIONS, {
          patient_id: patientId,
          patient_name: selectedPatient?.name,
          diagnosis: record.diagnosis || null,
          drug: record.prescription,
          prescribed_at: null,
          status: 'active',
          notes: record.notes || null,
        });
      }

      await fetchDoctorRecordsData();
      toast.success(t('doctor.records.recordAdded'));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen">
      <div className="text-start">
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-800">{t('doctor.records.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{loading ? t('common.loading') : t('doctor.records.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: t('doctor.records.statPatients'), value: patients.length, color: 'bg-blue-50 text-blue-600' },
          { label: t('doctor.records.statRecords'), value: patients.reduce((s, p) => s + p.records.length, 0), color: 'bg-purple-50 text-purple-600' },
          { label: t('doctor.records.statThisMonth'), value: statThisMonth, color: 'bg-green-50 text-green-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm flex items-center justify-between gap-2">
            <span className={`text-2xl font-extrabold ${color.split(' ')[1]}`}>{value}</span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full text-start ${color}`}>{label}</span>
          </div>
        ))}
      </div>

      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('doctor.records.searchPh')}
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 ps-11 text-sm text-start placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
        />
        <Search size={17} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <div key={p.id} className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0 text-start">
                <p className="font-bold text-gray-800">{p.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t('doctor.records.ageBloodLine', { age: p.age, blood: p.bloodType })}</p>
                {p.chronic.length > 0 && (
                  <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full mt-1 inline-block">
                    {p.chronic[0]}
                  </span>
                )}
              </div>
              <img src={p.img} alt={p.name} className="w-14 h-14 rounded-2xl object-cover shrink-0" />
            </div>

            <div className="flex items-center justify-between text-xs bg-gray-50 rounded-xl p-3 gap-2">
              <span className="text-blue-600 font-bold">{t('doctor.records.recordsBadge', { count: p.records.length })}</span>
              <span className="text-gray-400 text-start">
                {t('doctor.records.lastVisit')}: {p.records[0]?.date || t('doctor.records.none')}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedPatient(p)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-blue-700 transition-colors"
            >
              <Eye size={15} />
              {t('doctor.records.openRecords')}
            </button>
          </div>
        ))}
      </div>

      {selectedPatient && (
        <PatientRecordsModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onAddRecord={handleAddRecord}
        />
      )}
    </div>
  );
}
