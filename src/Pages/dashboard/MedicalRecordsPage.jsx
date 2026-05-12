import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import { translateAppointmentStatus } from '../../utils/i18nStatus';
import { Download, Upload, X, Save, Plus, FileText, Activity, Trash2 } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { APPOINTMENTS, MEDICAL_RECORDS } from '../../api/endpoints';
import { getApiErrorMessage } from '../../utils/apiError';
import { downloadBlobFile, downloadTextFile } from '../../utils/downloadTextFile';
import AsyncState from '../../components/AsyncState';

const EMPTY = '—';

/** يطابق ترتيب `patient.medical.uploadBoxes` في الترجمة */
const UPLOAD_CATEGORIES = ['report', 'lab', 'imaging'];

function formatBytes(n) {
  const b = Number(n) || 0;
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function categoryLabel(t, cat) {
  const key = `patient.medical.cat_${cat}`;
  return t(key, { defaultValue: cat });
}

function recordToForm(m) {
  return {
    bloodPressure: m.blood_pressure ?? '',
    sugar: m.blood_sugar ?? '',
    weight: m.body_weight ?? '',
    temperature: m.body_temperature ?? '',
    chronicDiseases: m.chronic_conditions ?? '',
    surgicalOps: m.surgeries ?? '',
    allergy: m.allergies ?? '',
    medications: m.medications ?? '',
    familyHistory: m.family_history ?? '',
    notes: m.notes ?? '',
  };
}

function EditModal({ t, initial, onClose, onSave, onUploadFile, uploading }) {
  const [form, setForm] = useState(() => initial);
  const [loading, setLoading] = useState(false);
  const uploadLabels = t('patient.medical.uploadBoxes', { returnObjects: true });
  const fileRef = useRef(null);
  const [pendingCategory, setPendingCategory] = useState('report');

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const openFilePicker = (index) => {
    const cat = UPLOAD_CATEGORIES[index] || 'other';
    setPendingCategory(cat);
    window.setTimeout(() => fileRef.current?.click(), 0);
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (f) onUploadFile(pendingCategory, f);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} role="presentation" />
      <input ref={fileRef} type="file" className="hidden" accept=".pdf,image/*,.doc,.docx" onChange={onFileChange} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5 gap-3">
          <button type="button" onClick={onClose} className="text-gray-400 shrink-0" aria-label={t('common.close')}>
            <X size={20} />
          </button>
          <h3 className="font-bold text-gray-800 text-lg text-start flex-1">{t('patient.medical.modalTitle')}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: t('patient.medical.fieldBP'), name: 'bloodPressure', placeholder: t('patient.medical.phBP') },
            { label: t('patient.medical.fieldSugar'), name: 'sugar', placeholder: t('patient.medical.phSugar') },
            { label: t('patient.medical.fieldTemp'), name: 'temperature', placeholder: t('patient.medical.phTemp') },
            { label: t('patient.medical.fieldWeight'), name: 'weight', placeholder: t('patient.medical.phWeight') },
          ].map(({ label, name, placeholder }) => (
            <div key={name}>
              <label className="block text-xs font-semibold text-gray-600 mb-1 text-start" htmlFor={`med-${name}`}>
                {label}
              </label>
              <input
                id={`med-${name}`}
                value={form[name]}
                onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                placeholder={placeholder}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          ))}
          {[
            { label: t('patient.medical.fieldChronic'), name: 'chronicDiseases', placeholder: t('patient.medical.phChronic') },
            { label: t('patient.medical.fieldSurgery'), name: 'surgicalOps', placeholder: t('patient.medical.phSurgery') },
            { label: t('patient.medical.fieldAllergy'), name: 'allergy', placeholder: t('patient.medical.phAllergy') },
            { label: t('patient.medical.fieldMedications'), name: 'medications', placeholder: t('patient.medical.phMedications') },
            { label: t('patient.medical.fieldFamily'), name: 'familyHistory', placeholder: t('patient.medical.phFamily') },
            { label: t('patient.medical.fieldNotes'), name: 'notes', placeholder: t('patient.medical.phNotes') },
          ].map(({ label, name, placeholder }) => (
            <div key={name} className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1 text-start" htmlFor={`med-${name}`}>
                {label}
              </label>
              <textarea
                id={`med-${name}`}
                value={form[name]}
                onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                placeholder={placeholder}
                rows={name === 'notes' ? 3 : 2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
              />
            </div>
          ))}
        </div>

        <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-3 text-start">{t('patient.medical.uploadSoon')}</p>
        <p className="text-xs text-gray-400 mt-1 text-start">{t('patient.medical.uploadMax')}</p>

        <div className="grid grid-cols-3 gap-3 mt-4">
          {Array.isArray(uploadLabels) &&
            uploadLabels.map((label, index) => (
              <button
                key={String(label)}
                type="button"
                disabled={uploading}
                onClick={() => openFilePicker(index)}
                className="border-2 border-dashed border-gray-200 rounded-xl p-3 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all disabled:opacity-50"
              >
                <Upload size={18} className="mx-auto text-blue-400 mb-1" />
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-xs text-blue-500 mt-0.5">{t('patient.medical.pickFile')}</p>
              </button>
            ))}
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
            disabled={loading || uploading}
            className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <>
                <Save size={14} />
                {t('patient.medical.save')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function useMedicalRecordLoad(t) {
  const toast = useToast();
  const [record, setRecord] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [medRes, apptRes] = await Promise.all([
        axiosInstance.get(MEDICAL_RECORDS.ROOT),
        axiosInstance.get(APPOINTMENTS.LIST),
      ]);
      setRecord(medRes.data?.medical_record ?? null);
      setAttachments(Array.isArray(medRes.data?.attachments) ? medRes.data.attachments : []);
      const raw = apptRes.data?.appointments ?? apptRes.data;
      setAppointments(Array.isArray(raw) ? raw : []);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('patient.medical.loadError')));
      setRecord(null);
      setAttachments([]);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [t, toast]);

  return { record, setRecord, attachments, setAttachments, appointments, loading, load };
}

function buildFullExportText({ record, appointments, attachmentRows, t }) {
  const m = record || {};
  const lines = [
    t('patient.medical.pageTitle'),
    '---',
    `${t('patient.medical.vitalsBP')}: ${m.blood_pressure || EMPTY}`,
    `${t('patient.medical.vitalsSugar')}: ${m.blood_sugar || EMPTY}`,
    `${t('patient.medical.vitalsWeight')}: ${m.body_weight || EMPTY} ${t('patient.medical.vitalsUnitWeight')}`,
    `${t('patient.medical.vitalsTemp')}: ${m.body_temperature || EMPTY}`,
    '',
    t('patient.medical.chronicTitle'),
    m.chronic_conditions || t('patient.medical.emptyChronic'),
    '',
    t('patient.medical.surgeryTitle'),
    m.surgeries || t('patient.medical.noMoreSurgeries'),
    '',
    `${t('patient.medical.fieldAllergy')}: ${m.allergies || EMPTY}`,
    `${t('patient.medical.fieldMedications')}: ${m.medications || EMPTY}`,
    `${t('patient.medical.fieldFamily')}: ${m.family_history || EMPTY}`,
    `${t('patient.medical.fieldNotes')}: ${m.notes || EMPTY}`,
    '',
    t('patient.medical.attachmentsTitle'),
  ];
  (attachmentRows || []).forEach((att, i) => {
    lines.push(
      `${i + 1}. [${categoryLabel(t, att.category)}] ${att.original_name} (${formatBytes(att.size_bytes)})`
    );
  });
  if (!attachmentRows?.length) {
    lines.push(t('patient.medical.attachmentsEmpty'));
  }
  lines.push('', t('patient.medical.visitsLogTitle'));
  appointments.forEach((a, i) => {
    const d = a.doctor?.name || '—';
    lines.push(
      `${i + 1}. ${a.appointment_date} ${a.appointment_time || ''} | ${d} | ${translateAppointmentStatus(a.status, t)}`,
      a.notes || '—',
      '---'
    );
  });
  return `\uFEFF${lines.join('\n')}`;
}

function splitLines(text) {
  if (!text || !String(text).trim()) {
    return [];
  }
  return String(text)
    .split(/\n|،/u)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function MedicalRecordsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const { record, setRecord, attachments, appointments, loading, load } = useMedicalRecordLoad(t);
  const [showEdit, setShowEdit] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [expandedId, setExpandedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    void load();
  }, [load]);

  const formInitial = useMemo(() => recordToForm(record || {}), [record]);

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => {
      const ta = new Date(`${a.appointment_date}T${(a.appointment_time || '00:00:00').toString().slice(0, 8)}`);
      const tb = new Date(`${b.appointment_date}T${(b.appointment_time || '00:00:00').toString().slice(0, 8)}`);
      return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
    });
  }, [appointments]);

  const shownVisits = useMemo(
    () => sortedAppointments.slice(0, Math.min(visibleCount, sortedAppointments.length)),
    [sortedAppointments, visibleCount]
  );

  const hasMore = visibleCount < sortedAppointments.length;

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const res = await axiosInstance.put(MEDICAL_RECORDS.UPDATE, {
        blood_pressure: form.bloodPressure?.trim() || null,
        blood_sugar: form.sugar?.trim() || null,
        body_weight: form.weight?.trim() || null,
        body_temperature: form.temperature?.trim() || null,
        chronic_conditions: form.chronicDiseases?.trim() || null,
        surgeries: form.surgicalOps?.trim() || null,
        allergies: form.allergy?.trim() || null,
        medications: form.medications?.trim() || null,
        family_history: form.familyHistory?.trim() || null,
        notes: form.notes?.trim() || null,
      });
      setRecord(res.data?.medical_record ?? null);
      setShowEdit(false);
      toast.success(t('patient.medical.savedToast'));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('patient.medical.saveError')));
    } finally {
      setSaving(false);
    }
  };

  const handleUploadFile = useCallback(
    async (category, file) => {
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('category', category);
        await axiosInstance.post(MEDICAL_RECORDS.ATTACHMENTS, fd);
        await load();
        toast.success(t('patient.medical.uploadOk'));
      } catch (err) {
        toast.error(getApiErrorMessage(err, t('patient.medical.uploadFail')));
      } finally {
        setUploading(false);
      }
    },
    [load, t, toast]
  );

  const handleDeleteAttachment = useCallback(
    async (id) => {
      try {
        await axiosInstance.delete(MEDICAL_RECORDS.ATTACHMENT_BY_ID(id));
        await load();
        toast.success(t('patient.medical.deleteOk'));
      } catch (err) {
        toast.error(getApiErrorMessage(err, t('patient.medical.deleteFail')));
      }
    },
    [load, t, toast]
  );

  const handleDownloadAttachment = useCallback(
    async (att) => {
      try {
        const res = await axiosInstance.get(MEDICAL_RECORDS.ATTACHMENT_DOWNLOAD(att.id), { responseType: 'blob' });
        downloadBlobFile(att.original_name || `file-${att.id}`, res.data);
      } catch (err) {
        toast.error(getApiErrorMessage(err, t('patient.medical.downloadFail')));
      }
    },
    [t, toast]
  );

  const handleDownloadFull = useCallback(() => {
    if (!record && sortedAppointments.length === 0) {
      toast.error(t('patient.medical.loadError'));
      return;
    }
    const text = buildFullExportText({
      record,
      appointments: sortedAppointments,
      attachmentRows: attachments,
      t,
    });
    const d = new Date().toISOString().slice(0, 10);
    downloadTextFile(`medical-record-${d}.txt`, text, 'text/plain;charset=utf-8;');
  }, [record, sortedAppointments, attachments, t, toast]);

  const downloadVisitLine = (visit) => {
    const esc = (s) => {
      const v = String(s ?? '');
      return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
    };
    const head = [visit.id, visit.appointment_date, visit.appointment_time, visit.doctor?.name, visit.status, (visit.notes || '').replace(/\n/g, ' ')];
    const csv = `\uFEFF${[head.map(esc).join(',')].join('\n')}\r\n`;
    downloadTextFile(`visit-${visit.id}.csv`, csv);
    toast.success(t('patient.medical.rowExported'));
  };

  const m = record || {};

  const vitals = useMemo(
    () => [
      { label: t('patient.medical.vitalsBP'), value: m.blood_pressure || EMPTY, icon: '❤️', color: 'text-red-500 bg-red-50' },
      { label: t('patient.medical.vitalsSugar'), value: m.blood_sugar ? `${m.blood_sugar} mg/dL` : EMPTY, icon: '💧', color: 'text-blue-500 bg-blue-50' },
      {
        label: t('patient.medical.vitalsWeight'),
        value: m.body_weight ? `${m.body_weight} ${t('patient.medical.vitalsUnitWeight')}` : EMPTY,
        icon: '⚖️',
        color: 'text-green-500 bg-green-50',
      },
      { label: t('patient.medical.vitalsTemp'), value: m.body_temperature ? `${m.body_temperature}°` : EMPTY, icon: '🌡️', color: 'text-orange-500 bg-orange-50' },
    ],
    [m, t]
  );

  const chronicItems = useMemo(() => splitLines(m.chronic_conditions), [m.chronic_conditions]);

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <button
          type="button"
          onClick={handleDownloadFull}
          className="flex items-center gap-2 border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-600 px-4 py-2 rounded-xl text-sm font-semibold hover:border-blue-400 hover:text-blue-600 transition-all"
        >
          <Download size={15} />
          {t('patient.medical.downloadFull')}
        </button>
        <div className="text-start">
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-800">{t('patient.medical.pageTitle')}</h1>
          <div className="flex items-center justify-start gap-1 mt-1 flex-wrap">
            <span className="text-xs text-green-500 font-semibold">{t('patient.medical.privacy')}</span>
            <span className="text-green-500" aria-hidden>
              🔒
            </span>
          </div>
        </div>
      </div>

      <AsyncState loading={loading} loadingText={t('common.loadingPage')} empty={false} />

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="space-y-4">
            <div className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4 gap-2">
                <button
                  type="button"
                  onClick={() => setShowEdit(true)}
                  className="flex items-center gap-1 text-blue-600 text-xs font-semibold hover:underline"
                >
                  <Plus size={13} />
                  {t('patient.medical.editShort')}
                </button>
                <h3 className="font-bold text-gray-800 text-start">{t('patient.medical.vitalsLatest')}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vitals.map(({ label, value, icon, color }) => (
                  <div key={label} className={`rounded-xl p-3 text-start ${color.split(' ')[1]}`}>
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <span className="text-lg" aria-hidden>
                        {icon}
                      </span>
                      <span className="text-xs text-gray-500">{label}</span>
                    </div>
                    <p className={`font-extrabold text-lg ${color.split(' ')[0]}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 space-y-4">
              <div>
                <h4 className="font-bold text-gray-800 text-start mb-2 flex items-center justify-start gap-2">
                  {t('patient.medical.chronicTitle')}
                  <Activity size={15} className="text-blue-500 shrink-0" />
                </h4>
                <div className="space-y-1.5">
                  {chronicItems.length > 0 ? (
                    chronicItems.map((d) => (
                      <div key={d} className="flex items-center gap-2 w-full">
                        <span className="text-xs text-gray-600 text-start flex-1">{d}</span>
                        <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" aria-hidden />
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 text-start">{t('patient.medical.emptyChronic')}</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-start mb-2 flex items-center justify-start gap-2">
                  {t('patient.medical.surgeryTitle')}
                  <FileText size={15} className="text-blue-500 shrink-0" />
                </h4>
                {m.surgeries?.trim() ? (
                  <p className="text-xs text-gray-600 text-start leading-relaxed whitespace-pre-line">{m.surgeries}</p>
                ) : (
                  <p className="text-xs text-gray-300 text-start">{t('patient.medical.noMoreSurgeries')}</p>
                )}
                {m.allergies?.trim() ? (
                  <p className="text-xs text-amber-800 bg-amber-50 rounded-lg p-2 mt-2 text-start">
                    {t('patient.medical.fieldAllergy')}: {m.allergies}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5">
              <h4 className="font-bold text-gray-800 text-start mb-3">{t('patient.medical.attachmentsTitle')}</h4>
              {attachments.length === 0 ? (
                <p className="text-xs text-gray-500 text-start">{t('patient.medical.attachmentsEmpty')}</p>
              ) : (
                <ul className="space-y-2 max-h-52 overflow-y-auto pe-1">
                  {attachments.map((att) => (
                    <li
                      key={att.id}
                      className="flex items-center justify-between gap-2 text-start border border-gray-100 rounded-xl px-2 py-2 bg-gray-50/80"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                          {categoryLabel(t, att.category)}
                        </span>
                        <p className="text-xs text-gray-800 font-medium truncate" title={att.original_name}>
                          {att.original_name}
                        </p>
                        <p className="text-[10px] text-gray-400">{formatBytes(att.size_bytes)}</p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => void handleDownloadAttachment(att)}
                          className="p-2 rounded-lg text-gray-500 hover:bg-white hover:text-blue-600"
                          title={t('patient.medical.downloadFull')}
                        >
                          <Download size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteAttachment(att.id)}
                          className="p-2 rounded-lg text-gray-400 hover:bg-white hover:text-red-600"
                          title={t('patient.medical.deleteAria')}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={() => setShowEdit(true)}
                className="mt-3 w-full text-xs text-center text-blue-600 font-semibold py-2 rounded-xl border border-dashed border-blue-200 hover:bg-blue-50/50"
              >
                + {t('patient.medical.editShort')}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs text-gray-400">
                {t('patient.medical.totalRecords', { count: sortedAppointments.length })}
              </span>
              <h3 className="font-bold text-gray-800 text-start">{t('patient.medical.visitsLogTitle')}</h3>
            </div>

            {sortedAppointments.length === 0 ? (
              <div className="card-hover bg-white/80 rounded-2xl shadow-sm p-6 text-center text-sm text-gray-500">{t('patient.medical.noVisits')}</div>
            ) : (
              shownVisits.map((visit) => (
                  <div key={visit.id} className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          visit.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                        }`}
                      >
                        {translateAppointmentStatus(visit.status, t)}
                      </span>
                      <div className="text-start min-w-0">
                        <div className="flex items-center justify-start gap-2 flex-wrap">
                          <h4 className="font-bold text-gray-800 text-sm">{t('patient.medical.visitAppointment')}</h4>
                          <span className="text-lg shrink-0" aria-hidden>
                            📅
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {visit.appointment_date} {visit.appointment_time} | {visit.doctor?.name || '—'}
                        </p>
                      </div>
                    </div>

                    {visit.notes ? (
                      <div className="mb-3">
                        <div className="flex items-center justify-start gap-1 mb-1">
                          <span className="text-xs font-semibold text-blue-600">{t('patient.medical.finalDiag')}</span>
                          <span className="text-blue-500" aria-hidden>
                            📋
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 text-start leading-relaxed">{expandedId === visit.id ? visit.notes : `${(visit.notes || '').slice(0, 120)}${(visit.notes || '').length > 120 ? '…' : ''}`}</p>
                        {(visit.notes || '').length > 120 && (
                          <button
                            type="button"
                            onClick={() => setExpandedId(expandedId === visit.id ? null : visit.id)}
                            className="text-blue-600 text-xs font-semibold mt-1 hover:underline"
                          >
                            {t('patient.medical.detailsLink')}
                          </button>
                        )}
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 gap-2 flex-wrap">
                      <span className="text-xs text-gray-400" />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => downloadVisitLine(visit)}
                          className="flex items-center gap-1 text-gray-400 hover:text-blue-600 transition-colors"
                          aria-label={t('patient.medical.downloadingFile')}
                        >
                          <Download size={14} />
                        </button>
                        <span className="text-xs text-gray-400">#{visit.id}</span>
                        <span className="text-sm" aria-hidden>
                          📄
                        </span>
                      </div>
                    </div>
                  </div>
              ))
            )}

            {hasMore && sortedAppointments.length > 0 && (
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + 5)}
                className="w-full border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-500 font-semibold py-3 rounded-xl text-sm hover:border-blue-400 hover:text-blue-600 transition-all"
              >
                {t('patient.medical.loadOlder')}
              </button>
            )}
            {!hasMore && sortedAppointments.length > 5 && (
              <p className="text-center text-xs text-gray-400">{t('patient.medical.noMoreToLoad')}</p>
            )}
          </div>
        </div>
      )}

      {showEdit && (
        <EditModal
          t={t}
          initial={formInitial}
          uploading={uploading}
          onUploadFile={(category, file) => void handleUploadFile(category, file)}
          onClose={() => {
            if (!saving && !uploading) setShowEdit(false);
          }}
          onSave={async (form) => {
            await handleSave(form);
          }}
        />
      )}
    </div>
  );
}
