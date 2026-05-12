/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

function ToastItem({ toast, onRemove }) {
  const styles = {
    success: { bg: 'bg-green-50 border-green-200', icon: CheckCircle, iconColor: 'text-green-500', title: 'text-green-800', msg: 'text-green-600' },
    error:   { bg: 'bg-red-50 border-red-200',     icon: XCircle,     iconColor: 'text-red-500',   title: 'text-red-800',   msg: 'text-red-600' },
    warning: { bg: 'bg-yellow-50 border-yellow-200', icon: AlertCircle, iconColor: 'text-yellow-500', title: 'text-yellow-800', msg: 'text-yellow-600' },
    info:    { bg: 'bg-blue-50 border-blue-200',    icon: Info,        iconColor: 'text-blue-500',  title: 'text-blue-800',  msg: 'text-blue-600' },
  };

  const s = styles[toast.type] || styles.info;
  const Icon = s.icon;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-2xl border shadow-lg ${s.bg} animate-slide-in min-w-72 max-w-sm`}>
      <button onClick={() => onRemove(toast.id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5">
        <X size={15} />
      </button>
      <div className="flex-1 text-end min-w-0">
        {toast.title && <p className={`font-bold text-sm ${s.title}`}>{toast.title}</p>}
        {toast.message && <p className={`text-xs mt-0.5 leading-relaxed ${s.msg}`}>{toast.message}</p>}
      </div>
      <Icon size={20} className={`flex-shrink-0 mt-0.5 ${s.iconColor}`} />
    </div>
  );
}

export function ToastProvider({ children }) {
  const { t } = useTranslation();
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 3500 }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  // Shorthand methods
  const toast = {
    success: (message, title) => addToast({ type: 'success', title: title ?? t('toastUi.successTitle'), message }),
    error:   (message, title) => addToast({ type: 'error',   title: title ?? t('toastUi.errorTitle'), message }),
    warning: (message, title) => addToast({ type: 'warning', title: title ?? t('toastUi.warningTitle'), message }),
    info:    (message, title) => addToast({ type: 'info',    title: title ?? t('toastUi.infoTitle'), message }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 end-4 z-[9999] flex flex-col gap-2">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}