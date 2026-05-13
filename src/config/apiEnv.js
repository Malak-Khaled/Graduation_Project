/**
 * عنوان Laravel API (يجب أن ينتهي بـ `/api` ما لم يُستخدم وضع الـ proxy بـ `/api` فقط).
 * يدعم VITE_API_BASE_URL و VITE_API_URL (للتوافق مع إعدادات قديمة).
 */
const DEFAULT_REMOTE_API = 'http://18.156.7.107/api';

export function getApiBaseUrl() {
  let s = String(import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').trim();
  if (!s) {
    return DEFAULT_REMOTE_API;
  }
  s = s.replace(/\/+$/, '');
  if (s.startsWith('/')) {
    return s;
  }
  if (/^https?:\/\//i.test(s) && !/\/api$/i.test(s)) {
    return `${s}/api`;
  }
  return s;
}
