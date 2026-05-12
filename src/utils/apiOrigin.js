/**
 * أصل السيرفر لروابط الملفات الثابتة (صور البروفايل إلخ) بدون `/api`.
 * يعمل مع `VITE_API_BASE_URL` كعنوان مطلق أو مسار نسبي مثل `/api` عند استخدام proxy في Vite.
 */
export function getApiOrigin() {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
  if (typeof base === 'string' && /^https?:\/\//i.test(base)) {
    return base.replace(/\/api\/?$/i, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:5173';
}
