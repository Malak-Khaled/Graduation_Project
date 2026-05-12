import { createElement, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, TrendingUp, TrendingDown, Receipt, Clock } from 'lucide-react';
import { translateInvoiceStatus } from '../../utils/i18nStatus';
import axiosInstance from '../../api/axiosInstance';
import { ADMIN } from '../../api/endpoints';
import { getApiErrorMessage } from '../../utils/apiError';
import { useToast } from '../../context/ToastContext';
import { downloadTextFile } from '../../utils/downloadTextFile';

function escapeCsvField(val) {
  const s = String(val ?? '');
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function buildFinancialReportCsv({ summary, rows, t, currency }) {
  const line = (cells) => cells.map(escapeCsvField).join(',');
  const out = [
    line([t('admin.invoices.statTotalRevenue'), `${summary.total_revenue} ${currency}`]),
    line([t('admin.invoices.statPending'), `${summary.pending_amount} ${currency}`]),
    line([t('admin.invoices.statCount'), String(summary.invoices_count)]),
    '',
    line([
      t('admin.invoices.exportColInvoice'),
      t('admin.invoices.exportColPatient'),
      t('admin.invoices.exportColDoctor'),
      t('admin.invoices.exportColService'),
      t('admin.invoices.exportColAmount'),
      t('admin.invoices.exportColDate'),
      t('admin.invoices.exportColStatus'),
    ]),
    ...rows.map((inv) =>
      line([
        inv.id,
        inv.patient,
        inv.doctor,
        inv.service ?? '',
        `${inv.amount} ${currency}`.trim(),
        inv.date,
        inv.status,
      ])
    ),
  ];
  return `\uFEFF${out.join('\r\n')}`;
}

const monthlyData = [
  { month: 'يناير', revenue: 12000, appointments: 80 },
  { month: 'فبراير', revenue: 18000, appointments: 110 },
  { month: 'مارس', revenue: 15000, appointments: 95 },
  { month: 'أبريل', revenue: 22000, appointments: 140 },
  { month: 'مايو', revenue: 24500, appointments: 156 },
];

const INV_FILTER = [
  { value: 'الكل', labelKey: 'admin.doctors.filterAll' },
  { value: 'تم الدفع', labelKey: 'admin.invoices.filterPaid' },
  { value: 'لم يتم الدفع', labelKey: 'admin.invoices.filterUnpaid' },
];

const STATUS_STYLES = { 'تم الدفع': 'bg-green-100 text-green-600', 'لم يتم الدفع': 'bg-yellow-100 text-yellow-600' };

function StatusBadge({ status, t }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-500'}`}>
      {translateInvoiceStatus(status, t)}
    </span>
  );
}

export default function AdminInvoicesPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState({ total_revenue: 0, pending_amount: 0, invoices_count: 0 });
  const [filterStatus, setFilterStatus] = useState('الكل');
  const [loading, setLoading] = useState(false);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(ADMIN.INVOICES_REPORT);
      const normalized = (res.data?.invoices || []).map((inv) => ({
        ...inv,
        status: inv.status === 'paid' ? 'تم الدفع' : 'لم يتم الدفع',
      }));
      setInvoices(normalized);
      setSummary(res.data?.summary || { total_revenue: 0, pending_amount: 0, invoices_count: 0 });
    } catch (err) {
      setInvoices([]);
      setSummary({ total_revenue: 0, pending_amount: 0, invoices_count: 0 });
      void getApiErrorMessage(err, t('authErrors.default'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only
  }, []);

  const filtered = useMemo(
    () => invoices.filter((inv) => filterStatus === 'الكل' || inv.status === filterStatus),
    [invoices, filterStatus]
  );

  const handleExportReport = useCallback(() => {
    if (filtered.length === 0) {
      toast.error(t('admin.invoices.exportEmpty'));
      return;
    }
    const dateStr = new Date().toISOString().slice(0, 10);
    const csv = buildFinancialReportCsv({
      summary,
      rows: filtered,
      t,
      currency: t('admin.home.currency'),
    });
    downloadTextFile(`financial-report-${dateStr}.csv`, csv);
    toast.success(t('admin.invoices.exportSuccess'));
  }, [filtered, summary, t, toast]);

  const handleExportOne = useCallback(
    (inv) => {
      const dateStr = new Date().toISOString().slice(0, 10);
      const safeId = String(inv.id ?? 'invoice').replace(/[/\\?%*:|"<>]/g, '-');
      const csv = buildFinancialReportCsv({
        summary: {
          total_revenue: inv.status === 'تم الدفع' ? inv.amount : 0,
          pending_amount: inv.status === 'لم يتم الدفع' ? inv.amount : 0,
          invoices_count: 1,
        },
        rows: [inv],
        t,
        currency: t('admin.home.currency'),
      });
      downloadTextFile(`invoice-${safeId}-${dateStr}.csv`, csv);
      toast.success(t('admin.invoices.exportSuccess'));
    },
    [t, toast]
  );

  const totalRevenue = summary.total_revenue;
  const pending = summary.pending_amount;
  const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue));

  const arMonthIndex = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو'];
  const shortMonths = t('admin.home.monthsShort', { returnObjects: true });

  const curr = t('admin.home.currency');

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <button
          type="button"
          onClick={handleExportReport}
          className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          <Download size={15} />
          {t('admin.invoices.exportReport')}
        </button>
        <div className="text-start">
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-800">{t('admin.invoices.title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{loading ? t('common.loading') : t('admin.invoices.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: t('admin.invoices.statTotalRevenue'),
            value: `${totalRevenue.toLocaleString()} ${curr}`,
            icon: TrendingUp,
            color: 'bg-green-50 text-green-600',
            change: t('admin.home.statChanges.revenue'),
            up: true,
          },
          {
            label: t('admin.invoices.statPending'),
            value: `${pending.toLocaleString()} ${curr}`,
            icon: Clock,
            color: 'bg-yellow-50 text-yellow-600',
            change: t('admin.home.statChanges.appts'),
            up: false,
          },
          {
            label: t('admin.invoices.statCount'),
            value: summary.invoices_count,
            icon: Receipt,
            color: 'bg-blue-50 text-blue-600',
            change: t('admin.home.statChanges.patients'),
            up: true,
          },
        ].map(({ label, value, icon, color, change, up }) => (
          <div key={label} className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>{createElement(icon, { size: 22 })}</div>
            <div className="text-start flex-1 min-w-0">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="font-extrabold text-gray-800 text-lg mt-0.5">{value}</p>
              <p className={`text-xs font-semibold flex items-center justify-start gap-1 mt-0.5 ${up ? 'text-green-500' : 'text-red-500'}`}>
                {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {change}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-5 gap-2">
          <span className="text-sm text-gray-400">{t('admin.invoices.chartSubtitle')}</span>
          <h3 className="font-bold text-gray-800 text-start">{t('admin.invoices.chartTitle')}</h3>
        </div>
        <div className="flex items-end gap-4 h-36">
          {monthlyData.map(({ month, revenue }) => {
            const idx = arMonthIndex.indexOf(month);
            const label =
              Array.isArray(shortMonths) && idx >= 0 && shortMonths[idx] ? shortMonths[idx] : month.slice(0, 3);
            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-blue-600">{(revenue / 1000).toFixed(0)}K</span>
                <div
                  className="w-full bg-blue-600 rounded-t-xl hover:bg-blue-700 transition-colors"
                  style={{ height: `${(revenue / maxRevenue) * 80}%`, minHeight: '8px' }}
                />
                <span className="text-xs text-gray-400">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card-hover-panel bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-wrap gap-3">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {INV_FILTER.map(({ value, labelKey }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilterStatus(value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === value
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-800 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50/70'
                }`}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
          <h3 className="font-bold text-gray-800 text-start">{t('admin.invoices.logTitle')}</h3>
        </div>

        <div className="hidden md:grid grid-cols-6 gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 text-center">
          <span>{t('admin.invoices.colAction')}</span>
          <span>{t('admin.invoices.colStatus')}</span>
          <span>{t('admin.invoices.colAmount')}</span>
          <span>{t('admin.invoices.colDate')}</span>
          <span>{t('admin.invoices.colDoctorService')}</span>
          <span className="text-start">{t('admin.invoices.colPatientInv')}</span>
        </div>

        <div className="divide-y divide-gray-50">
          {filtered.map((inv) => (
            <div key={inv.id} className="px-4 md:px-5 py-4">
              <div className="md:hidden space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge status={inv.status} t={t} />
                  <div className="text-start min-w-0">
                    <p className="font-bold text-gray-800 text-sm">{inv.patient}</p>
                    <p className="text-xs text-gray-400">
                      {inv.id} - {inv.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-gray-800">
                    {inv.amount} {curr}
                  </span>
                  <span className="text-xs text-gray-500">{inv.doctor}</span>
                </div>
              </div>
              <div className="hidden md:grid grid-cols-6 gap-3 items-center text-center">
                <button
                  type="button"
                  onClick={() => handleExportOne(inv)}
                  className="flex items-center justify-center gap-1 text-gray-400 text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 mx-auto"
                >
                  <Download size={12} /> {t('admin.invoices.exportOne')}
                </button>
                <div className="flex justify-center">
                  <StatusBadge status={inv.status} t={t} />
                </div>
                <span className="font-bold text-gray-800">
                  {inv.amount} {curr}
                </span>
                <span className="text-xs text-gray-500">{inv.date}</span>
                <div>
                  <p className="text-sm text-gray-700">{inv.doctor}</p>
                  <p className="text-xs text-gray-400">{inv.service}</p>
                </div>
                <div className="text-start">
                  <p className="font-semibold text-gray-800 text-sm">{inv.patient}</p>
                  <p className="text-xs text-gray-400">{inv.id}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
