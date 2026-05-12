import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { CheckCircle, Clock3, XCircle, RefreshCw } from 'lucide-react';
import { fetchInvoiceByRef } from '../../features/invoices/invoicesSlice';

const POLL_MAX_ATTEMPTS = 12;
const POLL_DELAY_MS = 2500;

export default function PaymentStatusPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const invoiceRef = searchParams.get('invoice') || '';
  const initialState = searchParams.get('state') || 'pending';
  const [status, setStatus] = useState(initialState);
  const [checking, setChecking] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!invoiceRef || status === 'paid' || status === 'failed') return undefined;

    let cancelled = false;

    const poll = async () => {
      setChecking(true);
      for (let i = 0; i < POLL_MAX_ATTEMPTS; i += 1) {
        if (cancelled) return;
        // eslint-disable-next-line no-await-in-loop
        const action = await dispatch(fetchInvoiceByRef(invoiceRef));
        if (fetchInvoiceByRef.fulfilled.match(action)) {
          const apiStatus = action.payload?.status;
          if (apiStatus === 'تم الدفع') {
            if (!cancelled) setStatus('paid');
            return;
          }
        }
        if (!cancelled) setAttempts(i + 1);
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, POLL_DELAY_MS));
      }
      if (!cancelled) setStatus('pending');
    };

    poll().finally(() => {
      if (!cancelled) setChecking(false);
    });

    return () => {
      cancelled = true;
    };
  }, [dispatch, invoiceRef, status]);

  const ui = useMemo(() => {
    if (status === 'paid') {
      return {
        icon: <CheckCircle className="text-green-500" size={52} />,
        title: t('patient.invoices.paymentStatusPaidTitle'),
        text: t('patient.invoices.paymentStatusPaidDesc'),
        badge: 'bg-green-50 text-green-600',
        badgeText: t('patient.invoices.paymentStatusPaidBadge'),
      };
    }
    if (status === 'failed') {
      return {
        icon: <XCircle className="text-red-500" size={52} />,
        title: t('patient.invoices.paymentStatusFailedTitle'),
        text: t('patient.invoices.paymentStatusFailedDesc'),
        badge: 'bg-red-50 text-red-600',
        badgeText: t('patient.invoices.paymentStatusFailedBadge'),
      };
    }
    return {
      icon: <Clock3 className="text-amber-500" size={52} />,
      title: t('patient.invoices.paymentStatusPendingTitle'),
      text: t('patient.invoices.paymentStatusPendingDesc'),
      badge: 'bg-amber-50 text-amber-600',
      badgeText: t('patient.invoices.paymentStatusPendingBadge'),
    };
  }, [status, t]);

  return (
    <div className="p-4 md:p-6 min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-xl bg-white/90 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 text-center space-y-4">
        <div className="flex justify-center">{ui.icon}</div>
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-800">{ui.title}</h1>
        <p className="text-sm text-gray-500">{ui.text}</p>
        <div className="flex justify-center">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${ui.badge}`}>{ui.badgeText}</span>
        </div>
        {invoiceRef ? (
          <p className="text-xs text-gray-400">
            {t('patient.invoices.paymentStatusInvoice', { invoice: invoiceRef })}
          </p>
        ) : null}
        {checking ? (
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <RefreshCw size={12} className="animate-spin" />
            {t('patient.invoices.paymentStatusChecking', { attempts })}
          </p>
        ) : null}

        <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
          <Link
            to="/dashboard/invoices"
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            {t('patient.invoices.paymentStatusBackToInvoices')}
          </Link>
          {status !== 'paid' && invoiceRef ? (
            <Link
              to={`/dashboard/invoices?invoice=${encodeURIComponent(invoiceRef)}`}
              className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('patient.invoices.paymentStatusRetry')}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
