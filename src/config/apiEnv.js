/**
 * عنوان Laravel API.
 *
 * التطوير المحلي الموصى به (مع `npm run dev`):
 *   ضع في `.env` جذر المشروع: VITE_API_BASE_URL=/api
 *   ثم شغّل Laravel: `php artisan serve` (افتراضيًا 127.0.0.1:8000)
 *   الـ proxy في `vite.config.js` يمرّر `/api` → الباكند بدون CORS.
 *
 * بدون Vite (مثل `vite preview` أو اختبارات): استخدم عنوانًا مطلقًا:
 *   VITE_API_BASE_URL=http://127.0.0.1:8000/api
 */
const DEFAULT_LOCAL_API = '/api';

export function getApiBaseUrl() {
  let s = String(import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').trim();
  if (!s) {
    return DEFAULT_LOCAL_API;
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
