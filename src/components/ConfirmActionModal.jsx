import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

/**
 * نافذة تأكيد قبل إجراءات حساسة (حذف / تغيير حالة).
 * @param {'danger' | 'warning'} variant — danger للحذف، warning لتعطيل/تفعيل
 */
export default function ConfirmActionModal({
  open,
  onClose,
  title,
  description,
  onConfirm,
  variant = 'danger',
  isSubmitting = false,
}) {
  const { t } = useTranslation();
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    const id = window.setTimeout(() => confirmBtnRef.current?.focus(), 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(id);
    };
  }, [open, isSubmitting, onClose]);

  if (!open) return null;

  const confirmBtnClass =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-amber-600 hover:bg-amber-700 text-white';

  const iconWrap =
    variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-action-title"
    >
      <div className="absolute inset-0 bg-black/45" onClick={onClose} role="presentation" />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md z-10 border border-gray-100">
        <div className="flex gap-3 text-start">
          <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${iconWrap}`}>
            <AlertTriangle size={22} aria-hidden />
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="confirm-action-title" className="font-bold text-gray-900 text-base mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{description}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-60"
          >
            {t('common.cancel')}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`flex-1 font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 flex items-center justify-center gap-2 ${confirmBtnClass}`}
          >
            {isSubmitting ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              t('common.confirm')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
