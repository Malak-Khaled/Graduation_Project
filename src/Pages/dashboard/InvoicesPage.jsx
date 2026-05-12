import { createElement, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { Download, CreditCard, Banknote, Smartphone, FileText, X, CheckCircle } from 'lucide-react';
import { clearError, fetchInvoices, payInvoice } from '../../features/invoices/invoicesSlice';
import AsyncState from '../../components/AsyncState';
import { translateInvoiceStatus } from '../../utils/i18nStatus';
import { downloadTextFile } from '../../utils/downloadTextFile';
import { buildAccountStatementCsv, buildSingleInvoiceCsv } from '../../utils/patientInvoiceCsv';

function StatusBadge({ status, t }) {
  const label = translateInvoiceStatus(status, t);
  const styles = {
    'تم الدفع': 'bg-green-100 text-green-600',
    'لم يتم الدفع': 'bg-yellow-100 text-yellow-600',
    paid: 'bg-green-100 text-green-600',
    unpaid: 'bg-yellow-100 text-yellow-600',
  };
  return <span className={`text-xs font-semibold px-3 py-1 rounded-full ${styles[status] || 'bg-gray-100 text-gray-500'}`}>{label}</span>;
}

function PayModal({ invoice, onClose, onSuccess, loading }) {
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [cardData, setCardData] = useState({ name: '', number: '', cvv: '', expiry: '' });

  const methods = [
    { key: 'card', label: t('patient.invoices.methodCard'), icon: CreditCard, color: 'bg-blue-50 border-blue-300 text-blue-600' },
    { key: 'cash', label: t('patient.invoices.methodCash'), icon: Banknote, color: 'bg-green-50 border-green-300 text-green-600' },
    { key: 'vodafone', label: t('patient.invoices.methodVodafone'), icon: Smartphone, color: 'bg-red-50 border-red-300 text-red-600' },
  ];

  const handlePay = async () => {
    const ok = await onSuccess(invoice.id, selectedMethod, cardData);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />
      <div className="relative bg-white/90 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-lg z-10 max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-lg text-start">{t('patient.invoices.payTitle', { num: invoice.invoiceNum })}</h3>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 text-start space-y-2">
            <div className="flex justify-between text-sm gap-2">
              <span className="text-gray-600">{invoice.service}</span>
              <span className="font-bold text-blue-600">{invoice.amount} ج.م</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 gap-2">
              <span>{invoice.doctor}</span>
              <span>{invoice.date}</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-gray-700 mb-3 text-start">{t('patient.invoices.methodsTitle')}</p>
            <div className="flex gap-3 flex-wrap">
              {methods.map(({ key, label, icon, color }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedMethod(key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                    selectedMethod === key ? color : 'bg-white border-gray-200 text-gray-500'
                  }`}
                >
                  {createElement(icon, { size: 16 })}
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2 text-start">{t('patient.invoices.methodsHint')}</p>
          </div>

          {selectedMethod === 'card' && (
            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-700 text-start">{t('patient.invoices.cardFormTitle')}</p>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 text-start">{t('patient.invoices.cardName')}</label>
                <input
                  type="text"
                  value={cardData.name}
                  onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                  placeholder={t('patient.invoices.cardNamePh')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 text-start">{t('patient.invoices.cardNumber')}</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardData.number}
                    onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <CreditCard size={16} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 text-start">{t('patient.invoices.cvv')}</label>
                  <input
                    type="text"
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                    placeholder="123"
                    maxLength={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 text-start">{t('patient.invoices.expiry')}</label>
                  <input
                    type="text"
                    value={cardData.expiry}
                    onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                    placeholder="MM/YY"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>
            </div>
          )}

          <button type="button" onClick={handlePay} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {t('patient.invoices.paying')}
              </>
            ) : (
              t('patient.invoices.payCta', { amount: invoice.amount })
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessModal({ onClose }) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />
      <div className="relative bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 w-full max-w-sm z-10 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h3 className="font-bold text-gray-800 text-lg mb-2">{t('patient.invoices.successTitle')}</h3>
        <p className="text-gray-500 text-sm mb-6">{t('patient.invoices.successText')}</p>
        <button type="button" onClick={onClose} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-blue-700 transition-colors">
          {t('patient.invoices.ok')}
        </button>
      </div>
    </div>
  );
}

const UNPAID = 'لم يتم الدفع';

export default function InvoicesPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { invoices, summary, loading, payLoading, error } = useSelector((state) => state.invoices);
  const [payModal, setPayModal] = useState(null);
  const [successModal, setSuccessModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 4;

  useEffect(() => {
    dispatch(fetchInvoices());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [dispatch, error, toast]);

  const handlePaySuccess = async (id, paymentMethod, cardData) => {
    const result = await dispatch(payInvoice({ invoiceId: id, paymentMethod, cardData }));
    if (payInvoice.fulfilled.match(result)) {
      if (result.payload?.pending_confirmation) {
        if (result.payload?.payment_url) {
          window.open(result.payload.payment_url, '_blank', 'noopener,noreferrer');
        }
        toast.info(t('patient.invoices.paymentStatusRedirectHint'));
        navigate(`/dashboard/payment-status?invoice=${encodeURIComponent(id)}&state=pending`);
        return true;
      }
      toast.success(t('patient.invoices.paySuccessToast'));
      setSuccessModal(true);
      return true;
    }
    toast.error(result.payload || t('patient.invoices.payFail'));
    return false;
  };

  const paginated = invoices.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(invoices.length / perPage);
  const from = (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, invoices.length);

  const handleDownloadStatement = useCallback(() => {
    if (invoices.length === 0) {
      toast.error(t('patient.invoices.exportEmpty'));
      return;
    }
    const dateStr = new Date().toISOString().slice(0, 10);
    const csv = buildAccountStatementCsv({ summary, rows: invoices, t });
    downloadTextFile(`account-statement-${dateStr}.csv`, csv);
    toast.success(t('patient.invoices.exportSuccess'));
  }, [invoices, summary, t, toast]);

  const handleDownloadInvoiceRow = useCallback(
    (inv) => {
      const dateStr = new Date().toISOString().slice(0, 10);
      const ref = String(inv.id ?? 'invoice').replace(/[/\\?%*:|"<>]/g, '-');
      const csv = buildSingleInvoiceCsv(inv, t);
      downloadTextFile(`invoice-${ref}-${dateStr}.csv`, csv);
      toast.success(t('patient.invoices.exportOneSuccess'));
    },
    [t, toast]
  );

  const summaryCards = [
    { label: t('patient.invoices.summaryCount'), value: `${summary.total} ${t('patient.invoices.invoiceWord')}`, icon: FileText, color: 'bg-blue-50 text-blue-600' },
    { label: t('patient.invoices.summaryPending'), value: `${summary.pending} ج.م`, icon: X, color: 'bg-yellow-50 text-yellow-500' },
    { label: t('patient.invoices.summaryPaid'), value: `${summary.paid} ج.م`, icon: CheckCircle, color: 'bg-green-50 text-green-500' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <button
          type="button"
          onClick={handleDownloadStatement}
          className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          <Download size={15} />
          {t('patient.invoices.download')}
        </button>
        <div className="text-start">
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-800">{t('patient.invoices.title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('patient.invoices.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map(({ label, value, icon, color }) => (
          <div key={label} className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>{createElement(icon, { size: 20 })}</div>
            <div className="text-start">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="font-extrabold text-gray-800 text-lg mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <AsyncState loading={loading} loadingText={t('patient.invoices.loading')} />
      <AsyncState empty={!loading && invoices.length === 0} emptyTitle={t('patient.invoices.emptyTitle')} emptyDescription={t('patient.invoices.emptyDesc')} />

      {!loading && invoices.length > 0 && (
        <div className="card-hover-panel bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-6 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-500">
            <span className="text-center">{t('patient.invoices.colAction')}</span>
            <span className="text-center">{t('patient.invoices.colStatus')}</span>
            <span className="text-center">{t('patient.invoices.colAmount')}</span>
            <span className="text-center">{t('patient.invoices.colMethod')}</span>
            <span className="text-center">{t('patient.invoices.colService')}</span>
            <span className="text-start">{t('patient.invoices.colNum')}</span>
          </div>

          <div className="divide-y divide-gray-50">
            {paginated.map((inv) => (
              <div key={inv.id} className="px-5 py-4">
                <div className="md:hidden space-y-3">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={inv.status} t={t} />
                    <div className="text-start">
                      <p className="font-bold text-gray-800 text-sm">{inv.invoiceNum}</p>
                      <p className="text-xs text-gray-400">{inv.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-start min-w-0">
                      <p className="text-sm text-gray-700">{inv.doctor}</p>
                      <p className="text-xs text-gray-400">{inv.service}</p>
                    </div>
                    <span className="font-bold text-blue-600 flex-shrink-0">{inv.amount} ج.م</span>
                  </div>
                  <div className="flex gap-2">
                    {inv.status === UNPAID || inv.status === 'pending' || inv.status === 'unpaid' ? (
                      <button type="button" onClick={() => setPayModal(inv)} className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-xl text-xs hover:bg-blue-700 transition-colors">
                        {t('patient.invoices.payNow')}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDownloadInvoiceRow(inv)}
                        className="flex-1 flex items-center justify-center gap-1 border border-gray-200 text-gray-600 font-semibold py-2 rounded-xl text-xs hover:bg-gray-50 transition-colors"
                      >
                        <Download size={12} />
                        {t('patient.invoices.downloadPdf')}
                      </button>
                    )}
                  </div>
                </div>

                <div className="hidden md:grid grid-cols-6 gap-4 items-center">
                  <div className="flex justify-center gap-2">
                    {inv.status === UNPAID || inv.status === 'pending' || inv.status === 'unpaid' ? (
                      <button type="button" onClick={() => setPayModal(inv)} className="bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-blue-700 transition-colors">
                        {t('patient.invoices.payNow')}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDownloadInvoiceRow(inv)}
                        className="flex items-center gap-1 border border-gray-200 text-gray-600 font-semibold px-3 py-1.5 rounded-lg text-xs hover:bg-gray-50 transition-colors"
                      >
                        <Download size={12} />
                        {t('patient.invoices.downloadPdf')}
                      </button>
                    )}
                  </div>
                  <div className="flex justify-center">
                    <StatusBadge status={inv.status} t={t} />
                  </div>
                  <p className="text-sm font-bold text-blue-600 text-center">{inv.amount} ج.م</p>
                  <p className="text-sm text-gray-500 text-center">{inv.paymentMethod}</p>
                  <div className="text-center">
                    <p className="text-sm text-gray-700 font-semibold">{inv.doctor}</p>
                    <p className="text-xs text-gray-400">{inv.service}</p>
                  </div>
                  <div className="text-start">
                    <p className="font-bold text-gray-800 text-sm">{inv.invoiceNum}</p>
                    <p className="text-xs text-gray-400">{inv.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${
                    currentPage === page ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400">{t('patient.invoices.pagination', { from, to, total: invoices.length })}</p>
          </div>
        </div>
      )}

      {payModal && <PayModal invoice={payModal} onClose={() => setPayModal(null)} onSuccess={handlePaySuccess} loading={payLoading} />}

      {successModal && <SuccessModal onClose={() => setSuccessModal(false)} />}
    </div>
  );
}
