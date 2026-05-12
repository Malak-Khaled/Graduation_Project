/**
 * استخراج رسالة خطأ قابلة للعرض للمستخدم من رد Axios أو أخطاء الشبكة.
 * يدعم أشكالاً شائعة: { message }, { error }, Laravel validation, مصفوفة errors.
 */
export function getApiErrorMessage(error, fallback = 'حدث خطأ') {
  if (!error) return fallback;

  const status = error.response?.status;
  const data = error.response?.data;

  if (data != null) {
    if (typeof data === 'string' && data.trim()) return data;
    if (typeof data.message === 'string' && data.message.trim()) return data.message;
    if (typeof data.error === 'string' && data.error.trim()) return data.error;

    if (Array.isArray(data.errors)) {
      const parts = data.errors
        .map((e) => (typeof e === 'string' ? e : e?.message || e?.msg))
        .filter(Boolean);
      if (parts.length) return parts.join('، ');
    }

    if (typeof data === 'object' && data !== null) {
      const values = Object.values(data).flat();
      const first = values.find((v) => typeof v === 'string' && v.trim());
      if (first) return first;
      const arr = values.find((v) => Array.isArray(v) && v.length && typeof v[0] === 'string');
      if (arr) return String(arr[0]);
    }
  }

  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'تعذر الاتصال بالخادم. تحقق من الشبكة أو أن الخادم يعمل.';
  }

  if (status === 404) return 'المورد غير موجود.';
  if (status === 403) return 'غير مصرح بتنفيذ هذا الإجراء.';
  if (status === 422) return fallback;

  return fallback;
}
