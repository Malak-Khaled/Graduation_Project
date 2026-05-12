# Endpoints — مرجع للباك إند

**القاعدة:** كل المسارات أدناه **نسبية** لـ `baseURL` (مثلاً `http://localhost:8000/api`).  
**المرجع البرمجي:** `src/api/endpoints.js` (يجب أن يبقى متطابقًا مع هذا الملف).

**التوثيق:** الطلبات المحمية تُرسل `Authorization: Bearer <token>` (انظر `src/api/axiosInstance.js`).

**حالة التنفيذ في الفرونت**

| | المعنى |
|---|--------|
| **مستخدم** | يُستدعى فعليًا من axios في الكود الحالي |
| **مخطط** | الواجهة جاهزة أو مذكور في تعليقات؛ ينتظر ربط الباك |

---

## مصادقة `AUTH`

| المسار | الطريقة | الحالة | ملاحظة |
|--------|---------|--------|--------|
| `/auth/login` | POST | مستخدم | body: `{ email, password, role }` |
| `/auth/register` | POST | مستخدم | `multipart/form-data` (نموذج التسجيل + avatar اختياري) |
| `/auth/forgot-password` | POST | مخطط | `{ email }` |
| `/auth/verify-otp` | POST | مخطط | `{ email, otp }` |
| `/auth/reset-password` | POST | مخطط | `{ email, password }` |
| `/auth/logout` | POST | مخطط | اختياري — إبطال التوكن في السيرفر |
| `/auth/me` | GET | مخطط | المستخدم الحالي |
| `/auth/change-password` | PUT | مخطط | تغيير كلمة المرور وهو مسجل الدخول |

---

## مواعيد المريض `APPOINTMENTS`

| المسار | الطريقة | الحالة | ملاحظة |
|--------|---------|--------|--------|
| `/appointments` | GET | مستخدم | مصفوفة أو `{ upcoming, previous }` |
| `/appointments` | POST | مخطط | إنشاء حجز |
| `/appointments/:id` | PATCH | مخطط | تعديل حالة / وقت |
| `/appointments/:id` | DELETE | مستخدم | إلغاء موعد |

---

## فواتير المريض `INVOICES`

| المسار | الطريقة | الحالة | ملاحظة |
|--------|---------|--------|--------|
| `/invoices` | GET | مستخدم | مصفوفة أو `{ invoices, summary }` |
| `/invoices/:invoiceId/pay` | POST | مستخدم | `{ paymentMethod, cardData? }` |

---

## السجل الطبي `MEDICAL_RECORDS`

| المسار | الطريقة | الحالة | ملاحظة |
|--------|---------|--------|--------|
| `/medical-records` | GET | مستخدم | `{ records, vitals, chronicDiseases, surgicalOperations }` |
| `/medical-records` | PUT | مستخدم | تحديث البيانات الطبية |

---

## ملف المريض `PATIENT` (مخطط)

| المسار | الطريقة |
|--------|---------|
| `/patient/profile` | PUT (أو PATCH) |
| `/patient/change-password` | PUT |

---

## ملف الطبيب `DOCTOR` (مخطط)

| المسار | الطريقة |
|--------|---------|
| `/doctor/profile` | PUT (أو PATCH) |
| `/doctor/schedule` | GET / PUT |

---

## إدارة `ADMIN` (مخطط)

| المسار |
|--------|
| `/admin/doctors` |
| `/admin/doctors/:id` |
| `/admin/patients` |
| `/admin/patients/:id` |
| `/admin/appointments` |
| `/admin/stats` |
| `/admin/settings` |
| `/admin/invoices` |

---

## واجهات الطبيب `DOCTOR_API` (مخطط)

| المسار |
|--------|
| `/doctor/patients` |
| `/doctor/patients/:id` |
| `/doctor/prescriptions` |
| `/doctor/reports` |
| `/doctor/appointments` |
| `/doctor/messages` |

---

## حجز `BOOKING` (مخطط)

| المسار |
|--------|
| `/doctors/search` |
| `/doctors/:doctorId/slots` |

---

## مساعد ذكاء اصطناعي `AI` (مخطط)

| المسار |
|--------|
| `/ai/chat` |
| `/ai/messages` |

---

## مستندات إضافية

- تفاصيل أجسام الطلبات والردود المقترحة: **`API_CONTRACT.md`**
