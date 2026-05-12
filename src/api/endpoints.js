/**
 * مسارات API الموحّدة للفرونت.
 * الـ baseURL المعرف في axiosInstance (مثلاً http://localhost:8000/api) يُضاف قبل هذه المسارات.
 *
 * - مسارات «مستخدمة»: ظهرت فعلياً في استدعاءات axios داخل المشروع.
 * - مسارات «مخططة»: مطلوبة لإكمال الصفحات الحالية (بيانات وهمية الآن) أو مذكورة كتعليق في الكود.
 */

/** @typedef {'patient'|'doctor'|'admin'} UserRole */

// --- مصادقة (مستخدمة: login, register) ---
export const AUTH = {
  /** POST { email, password, role } → { user, token } */
  LOGIN: '/auth/login',
  /** POST FormData (multipart) → { user, token } — التسجيل العام للمرضى فقط؛ role يُجبر على patient في الواجهة */
  REGISTER: '/auth/register',
  /** POST { email } — مخطط: ForgotPasswordPage */
  FORGOT_PASSWORD: '/auth/forgot-password',
  /** POST { email, otp } — مخطط */
  VERIFY_OTP: '/auth/verify-otp',
  /** POST { email, password } — مخطط */
  RESET_PASSWORD: '/auth/reset-password',
  /** POST — اختياري: إبطال التوكن في السيرفر */
  LOGOUT: '/auth/logout',
  /** GET — اختياري: بيانات المستخدم الحالي */
  ME: '/auth/me',
  /** PUT — اختياري: تحديث كلمة المرور وهو مسجل الدخول */
  CHANGE_PASSWORD: '/auth/change-password',
};

// --- مواعيد المريض (مستخدمة: list, cancel) ---
export const APPOINTMENTS = {
  /** GET → مصفوفة أو { upcoming, previous } */
  LIST: '/appointments',
  /** DELETE — إلغاء موعد */
  BY_ID: (id) => `/appointments/${id}`,
  /** POST — مخطط: إنشاء حجز من BookingPage */
  CREATE: '/appointments',
  /** PATCH — مخطط: تعديل حالة / وقت */
  PATCH: (id) => `/appointments/${id}`,
  RATE: (id) => `/appointments/${id}/rating`,
};

// --- فواتير المريض (مستخدمة: list, pay) — الباكند: PatientController@listInvoices, payInvoice ---
export const INVOICES = {
  /** GET → { invoices, summary } (حسب مواعيد المريض) */
  LIST: '/invoices',
  /** GET invoice by reference (e.g. INV-0001) */
  BY_REF: (invoiceId) => `/invoices/${encodeURIComponent(String(invoiceId))}`,
  /** POST { paymentMethod, cardData? } — invoiceId من حقل id (مثل INV-0001) */
  PAY: (invoiceId) => `/invoices/${encodeURIComponent(String(invoiceId))}/pay`,
};

// --- السجل الطبي للمريض (مستخدمة: get, put) ---
export const MEDICAL_RECORDS = {
  /** GET → { medical_record, attachments } */
  ROOT: '/medical-records',
  /** PUT — حقول مثل blood_pressure, chronic_conditions, allergies, … */
  UPDATE: '/medical-records',
  /** POST FormData: file, category (report|lab|imaging|other) */
  ATTACHMENTS: '/medical-records/attachments',
  ATTACHMENT_DOWNLOAD: (id) => `/medical-records/attachments/${id}/download`,
  ATTACHMENT_BY_ID: (id) => `/medical-records/attachments/${id}`,
};

// --- ملف المريض (مخطط: PatientProfilePage — تعليقات axios) ---
export const PATIENT = {
  PROFILE: '/patient/profile',
  CHANGE_PASSWORD: '/patient/change-password',
};

// --- ملف الطبيب (مخطط: DoctorProfilePage) ---
export const DOCTOR = {
  PROFILE: '/doctor/profile',
  SCHEDULE: '/doctor/schedule',
};

// --- إدارة (مخطط — الصفحات تستخدم بيانات محلية) ---
export const ADMIN = {
  DOCTORS: '/admin/doctors',
  DOCTOR_BY_ID: (id) => `/admin/doctors/${id}`,
  /** POST — إنشاء مدير جديد (صلاحيات كاملة؛ يتطلب توكن أدمن) */
  ADMINS: '/admin/admins',
  ADMIN_BY_ID: (id) => `/admin/admins/${id}`,
  PATIENTS: '/admin/patients',
  PATIENT_BY_ID: (id) => `/admin/patients/${id}`,
  APPOINTMENTS: '/admin/appointments',
  STATS: '/admin/stats',
  SETTINGS: '/admin/settings',
  INVOICES_REPORT: '/admin/invoices',
  /** GET/POST — قاعدة ردود المساعد (كلمات مفتاحية ↔ نص، بدون API خارجي) */
  AI_KNOWLEDGE: '/admin/ai-knowledge',
  AI_KNOWLEDGE_BY_ID: (id) => `/admin/ai-knowledge/${id}`,
};

// --- طبيب: مرضى / سجلات / وصفات (مخطط — واجهات موجودة ببيانات ثابتة) ---
export const DOCTOR_API = {
  PATIENTS: '/doctor/patients',
  PATIENT_BY_ID: (id) => `/doctor/patients/${id}`,
  PATIENT_CARE_STATUS: (id) => `/doctor/patients/${id}/care-status`,
  PRESCRIPTIONS: '/doctor/prescriptions',
  PRESCRIPTION_BY_ID: (id) => `/doctor/prescriptions/${id}`,
  REPORTS: '/doctor/reports',
  REPORT_BY_ID: (id) => `/doctor/reports/${id}`,
  APPOINTMENTS: '/doctor/appointments',
  MESSAGES: '/doctor/messages',
};

// --- حجز وبحث أطباء (مخطط — BookingPage) ---
export const BOOKING = {
  SEARCH_DOCTORS: '/doctors/search',
  /** POST { symptoms } — rule-based specialty + doctor shortlist (patient) */
  SYMPTOM_ADVICE: '/doctors/symptom-advice',
  SLOTS: (doctorId) => `/doctors/${doctorId}/slots`,
};

// --- مساعد: المحادثات تُحفظ في DB؛ الرد عبر driver (قاعدة معرفة / openai) ---
export const AI = {
  CONVERSATIONS: '/ai/conversations',
  CONVERSATION_MESSAGES: (id) => `/ai/conversations/${id}/messages`,
  MESSAGES: '/ai/messages',
};

export const NOTIFICATIONS = {
  LIST: '/notifications',
  MARK_READ: (id) => `/notifications/${id}/read`,
  MARK_ALL_READ: '/notifications/read-all',
};

/** تجميعة واحدة للاستيراد: import { ENDPOINTS } from './endpoints' */
export const ENDPOINTS = {
  AUTH,
  APPOINTMENTS,
  INVOICES,
  MEDICAL_RECORDS,
  PATIENT,
  DOCTOR,
  ADMIN,
  DOCTOR_API,
  BOOKING,
  AI,
  NOTIFICATIONS,
};

export default ENDPOINTS;
