import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, Save, Eye, Download, Upload } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import axiosInstance from '../../api/axiosInstance';
import { DOCTOR_API } from '../../api/endpoints';
import { getApiErrorMessage } from '../../utils/apiError';

const FILTER_KEYS = ['all', 'lab', 'xray', 'periodic', 'rx'];

const avatarColors = ['bg-blue-100 text-blue-600', 'bg-green-100 text-green-600', 'bg-purple-100 text-purple-600', 'bg-orange-100 text-orange-600'];

const REPORT_STATUS_KEYS = ['completed', 'underReview', 'pending'];

const reportStatusSelectClass =
  'max-w-full min-w-0 w-full text-xs border border-gray-200 rounded-lg py-1.5 px-2 bg-white text-gray-800 text-start focus:outline-none focus:ring-2 focus:ring-blue-500/30';

function filterLabel(key, t) {
  const map = { all: 'filterAll', lab: 'catLab', xray: 'catXray', periodic: 'catPeriodic', rx: 'catRx' };
  return t(`doctor.reports.${map[key]}`);
}

function statusLabel(key, t) {
  const map = { completed: 'statusCompleted', underReview: 'statusUnderReview', pending: 'statusPending' };
  const sub = map[key];
  return sub ? t(`doctor.reports.${sub}`) : key || '—';
}

function AddReportModal({ onClose, onSave }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ patient: '', type: 'lab', date: '', details: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const categoryKeys = useMemo(() => ['lab', 'xray', 'periodic', 'rx'], []);

  const handleSave = async () => {
    if (!form.patient?.trim()) return;
    setLoading(true);
    try {
      await Promise.resolve(
        onSave({
          patient: form.patient.trim(),
          category: form.type,
          date: form.date || null,
          details: form.details?.trim() || null,
        })
      );
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} role="presentation" />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg z-10">
        <div className="flex items-center justify-between mb-5 gap-3">
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0">
            <X size={20} />
          </button>
          <h3 className="font-bold text-gray-800 text-lg flex-1 text-start">{t('doctor.reports.modalTitle')}</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 text-start">{t('doctor.reports.patientName')}</label>
            <input
              value={form.patient}
              onChange={(e) => setForm({ ...form, patient: e.target.value })}
              placeholder={t('doctor.reports.phPatient')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 text-start">{t('doctor.reports.reportType')}</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                aria-label={t('doctor.reports.reportType')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none bg-white"
              >
                {categoryKeys.map((k) => (
                  <option key={k} value={k}>
                    {filterLabel(k, t)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 text-start">{t('doctor.reports.reportDate')}</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 text-start">{t('doctor.reports.details')}</label>
            <textarea
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              placeholder={t('doctor.reports.phDetails')}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 text-start">{t('doctor.reports.attachLabel')}</label>
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
              onClick={() => document.getElementById('report-file')?.click()}
              onKeyDown={(e) => e.key === 'Enter' && document.getElementById('report-file')?.click()}
              role="button"
              tabIndex={0}
            >
              <Upload size={24} className="mx-auto text-blue-400 mb-2" />
              <p className="text-sm text-gray-500">{t('doctor.reports.attachLine')}</p>
              <p className="text-xs text-gray-400 mt-1">{t('doctor.reports.attachFormats')}</p>
              <input id="report-file" type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            {file && <p className="text-xs text-green-600 mt-1 text-start">{t('doctor.reports.fileSelected', { name: file.name })}</p>}
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
            disabled={loading || !form.patient}
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
                {t('doctor.reports.saveReport')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ViewReportModal({ report, onClose, onStatusChange }) {
  const { t } = useTranslation();
  if (!report) return null;
  const typeText = t(`doctor.reports.typeIds.${report.typeId}`);
  const colorIdx = typeof report.id === 'number' ? Math.abs(report.id) % 4 : 0;
  const avatarClass = avatarColors[colorIdx];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} role="presentation" />
      <div
        className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md z-10 text-start max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-view-title"
      >
        <div className="flex items-center justify-between gap-3 mb-5">
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0" aria-label={t('common.close')}>
            <X size={20} />
          </button>
          <h3 id="report-view-title" className="font-bold text-gray-800 text-lg flex-1">
            {t('doctor.reports.viewTitle')}
          </h3>
        </div>
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0 ${avatarClass}`}>{report.avatar}</div>
          <div className="min-w-0">
            <p className="font-bold text-gray-800 text-lg truncate">{report.patient}</p>
            <p className="text-sm text-gray-500">{report.pid}</p>
          </div>
        </div>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
            <dt className="text-xs font-semibold text-gray-500">{t('doctor.reports.colReportType')}</dt>
            <dd className="text-gray-800 font-medium text-end">{typeText}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
            <dt className="text-xs font-semibold text-gray-500">{t('doctor.reports.colDate')}</dt>
            <dd className="text-gray-800 font-medium">{report.date}</dd>
          </div>
          <div className="border-b border-gray-100 pb-2">
            <dt className="text-xs font-semibold text-gray-500 mb-1">{t('doctor.reports.colStatus')}</dt>
            <dd>
              <select
                value={REPORT_STATUS_KEYS.includes(report.statusKey) ? report.statusKey : 'underReview'}
                onChange={(e) => onStatusChange(report.id, e.target.value)}
                className={reportStatusSelectClass}
                aria-label={t('doctor.reports.colStatus')}
              >
                {REPORT_STATUS_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {statusLabel(k, t)}
                  </option>
                ))}
              </select>
            </dd>
          </div>
          {report.details ? (
            <div>
              <dt className="text-xs font-semibold text-gray-500 mb-1">{t('doctor.reports.details')}</dt>
              <dd className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{report.details}</dd>
            </div>
          ) : null}
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

export default function DoctorReportsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [viewReport, setViewReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(DOCTOR_API.REPORTS);
      const mapped = (res.data?.reports || []).map((r) => {
        const rd = r.report_date;
        const dateStr =
          rd == null
            ? '-'
            : typeof rd === 'string'
              ? rd.slice(0, 10)
              : String(rd).slice(0, 10);
        return {
          id: r.id,
          patient: r.patient_name,
          pid: r.patient_id ? `#P-${r.patient_id}` : '#P-NA',
          typeId: r.type === 'xray' ? 'mri' : r.type === 'periodic' ? 'annualReport' : r.type === 'rx' ? 'ecg' : 'bloodLab',
          category: r.type,
          date: dateStr,
          statusKey: REPORT_STATUS_KEYS.includes(r.status) ? r.status : 'underReview',
          avatar: (r.patient_name || 'NA').slice(0, 2),
          details: r.details || null,
        };
      });
      setReports(mapped);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only
  }, []);

  const patchReportStatus = async (id, statusKey) => {
    try {
      await axiosInstance.put(DOCTOR_API.REPORT_BY_ID(id), { status: statusKey });
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, statusKey } : r)));
      setViewReport((prev) => (prev && prev.id === id ? { ...prev, statusKey } : prev));
      toast.success(t('doctor.reports.statusUpdated'));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
    }
  };

  const filtered = filter === 'all' ? reports : reports.filter((r) => r.category === filter);

  const typeLine = (r) => t(`doctor.reports.typeIds.${r.typeId}`);

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus size={15} />
          {t('doctor.reports.addNew')}
        </button>
        <div className="text-start">
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-800">{t('doctor.reports.title')}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{loading ? t('common.loading') : t('doctor.reports.subtitle')}</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTER_KEYS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === k ? 'bg-blue-600 text-white' : 'bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            {filterLabel(k, t)}
          </button>
        ))}
      </div>

      <div className="card-hover-panel bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-5 gap-3 px-5 py-3 bg-white/50 border-b border-gray-100 text-xs font-semibold text-gray-500 text-center">
          <span>{t('doctor.reports.colActions')}</span>
          <span>{t('doctor.reports.colStatus')}</span>
          <span>{t('doctor.reports.colDate')}</span>
          <span>{t('doctor.reports.colReportType')}</span>
          <span className="text-start">{t('doctor.reports.colPatient')}</span>
        </div>
        <div className="divide-y divide-gray-50">
          {!loading && filtered.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-gray-400">{t('doctor.reports.emptyList')}</div>
          )}
          {filtered.map((r, i) => (
            <div key={r.id} className="px-5 py-4">
              <div className="md:hidden flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setViewReport(r)}
                  className="flex items-center gap-1 border border-blue-200 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors shrink-0"
                >
                  <Eye size={13} />
                  {t('doctor.reports.openFile')}
                </button>
                <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                  <div className="text-start min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{r.patient}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {typeLine(r)} — {r.date}
                    </p>
                  </div>
                  <select
                    value={REPORT_STATUS_KEYS.includes(r.statusKey) ? r.statusKey : 'underReview'}
                    onChange={(e) => patchReportStatus(r.id, e.target.value)}
                    className={`${reportStatusSelectClass} shrink-0 max-w-[8.5rem]`}
                    aria-label={t('doctor.reports.colStatus')}
                  >
                    {REPORT_STATUS_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {statusLabel(k, t)}
                      </option>
                    ))}
                  </select>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${avatarColors[i % 4]}`}>{r.avatar}</div>
                </div>
              </div>
              <div className="hidden md:grid grid-cols-5 gap-3 items-center text-center">
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewReport(r)}
                    className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 text-gray-400"
                    title={t('doctor.reports.openFile')}
                    aria-label={t('doctor.reports.openFile')}
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.success(t('doctor.reports.toastDownloading'))}
                    className="w-8 h-8 border border-blue-200 rounded-lg flex items-center justify-center hover:bg-blue-50 text-blue-400"
                  >
                    <Download size={14} />
                  </button>
                </div>
                <select
                  value={REPORT_STATUS_KEYS.includes(r.statusKey) ? r.statusKey : 'underReview'}
                  onChange={(e) => patchReportStatus(r.id, e.target.value)}
                  className={`${reportStatusSelectClass} mx-auto max-w-[10rem]`}
                  aria-label={t('doctor.reports.colStatus')}
                >
                  {REPORT_STATUS_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {statusLabel(k, t)}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-500">{r.date}</span>
                <div className="flex items-center justify-center gap-1 min-w-0">
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg truncate">{typeLine(r).split(' ')[0]}</span>
                  <span className="text-xs text-gray-500 hidden lg:block truncate">{typeLine(r)}</span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <div className="text-start min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{r.patient}</p>
                    <p className="text-xs text-gray-400">{r.pid}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${avatarColors[i % 4]}`}>{r.avatar}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((n) => (
              <button key={n} type="button" className={`w-8 h-8 rounded-lg text-sm font-semibold ${n === 1 ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                {n}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-start">{t('doctor.reports.footer', { shown: 10, total: 45 })}</p>
        </div>
      </div>

      {viewReport && (
        <ViewReportModal report={viewReport} onClose={() => setViewReport(null)} onStatusChange={patchReportStatus} />
      )}

      {showAdd && (
        <AddReportModal
          onClose={() => setShowAdd(false)}
          onSave={async (r) => {
            try {
              await axiosInstance.post(DOCTOR_API.REPORTS, {
                patient_name: r.patient,
                type: r.category,
                report_date: r.date || null,
                details: r.details || null,
              });
              toast.success(t('doctor.reports.toastAdded'));
              await fetchReports();
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
