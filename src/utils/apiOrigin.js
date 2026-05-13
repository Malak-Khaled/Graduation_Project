import { getApiBaseUrl } from '../config/apiEnv';

/**
 * أصل السيرفر لروابط الملفات الثابتة (صور البروفايل إلخ) بدون `/api`.
 * يعمل مع عنوان مطلق أو مسار نسبي مثل `/api` عند استخدام proxy في Vite.
 */
export function getApiOrigin() {
  const base = getApiBaseUrl();
  if (typeof base === 'string' && /^https?:\/\//i.test(base)) {
    return base.replace(/\/api\/?$/i, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:5173';
}
