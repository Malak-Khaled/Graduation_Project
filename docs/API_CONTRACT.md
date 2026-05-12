# عقد API بين الفرونت والباك

**القاعدة:** `baseURL` = `VITE_API_BASE_URL` (الافتراضي في الكود: `http://localhost:8000/api`).  
جميع المسارات أدناه **نسبية** لهذه القاعدة.

**التوثيق:** الطلبات المحمية تُرسل تلقائياً  
`Authorization: Bearer <token>`  
(انظر `src/api/axiosInstance.js`).

**أخطاء موحّدة (مقترح للباك):** استجابة JSON مثل:

```json
{ "message": "نص الخطأ بالعربية أو الإنجليزية" }
```

الفرونت يستخرج الرسالة عبر `getApiErrorMessage` في `src/utils/apiError.js` (يدعم أيضاً `errors[]` وأشكال Laravel الشائعة).

---

## 1) مصادقة

### `POST /auth/login`

**Body (JSON):**

```json
{
  "email": "user@example.com",
  "password": "******",
  "role": "patient"
}
```

`role`: `patient` | `doctor` | `admin`.

**رد ناجح (مقترح):**

```json
{
  "user": {
    "id": 1,
    "name": "اسم المستخدم",
    "email": "user@example.com",
    "role": "patient"
  },
  "token": "jwt-or-sanctum-token"
}
```

**ملاحظة:** الفرونت يخزّن `user` و`token` في التخزين المحلي بعد النجاح.

---

### `POST /auth/register`

**Body:** `multipart/form-data` (نفس الحقول المرسلة من نموذج التسجيل في الواجهة)، منها على الأقل:

- `name`, `email`, `password`, `confirmPassword`, `role`
- حقول إضافية حسب الدور (مريض: `phone`, `governorate`, …؛ طبيب: `specialty`, …)
- اختياري: ملف `avatar`

**رد ناجح (مقترح):** مثل تسجيل الدخول `{ user, token }`.

---

### مسارات مخططة (الواجهة جاهزة / تعليقات)

| المسار | الطريقة | الغرض |
|--------|---------|--------|
| `/auth/forgot-password` | POST | `{ "email" }` |
| `/auth/verify-otp` | POST | `{ "email", "otp" }` |
| `/auth/reset-password` | POST | `{ "email", "password" }` |

---

## 2) المواعيد (مريض)

### `GET /appointments`

**رد ناجح — أحد الشكلين:**

1. مصفوفة مواعيد، أو  
2. كائن:

```json
{
  "upcoming": [],
  "previous": []
}
```

الفرونت يفرّق بين القادم والسابق حسب `status` (قيم عربية في الواجهة مثل: `مؤكد`, `مكتمل`, `ملغي` — يُفضّل الاتفاق مع الباك على القيم الثابتة).

**سلوك الفرونت عند فشل الشبكة:** عرض بيانات تجريبية مع رسالة في `infoMessage`.

---

### `DELETE /appointments/:id`

إلغاء موعد. **رد ناجح:** `204` أو `200` مع جسم اختياري.

---

## 3) الفواتير (مريض)

### `GET /invoices`

**رد ناجح — أحد الشكلين:**

1. مصفوفة فواتير، أو  
2.:

```json
{
  "invoices": [],
  "summary": {
    "total": 0,
    "pending": 0,
    "paid": 0
  }
}
```

إذا لم يُرسل `summary`، يحسب الفرونت ملخصاً من القائمة.

---

### `POST /invoices/:invoiceId/pay`

**Body (JSON):**

```json
{
  "paymentMethod": "visa | cash | ...",
  "cardData": {}
}
```

**رد ناجح:** جسم اختياري؛ الفرونت يحدّث الحالة محلياً إلى «تم الدفع» عند النجاح.

---

## 4) السجل الطبي (مريض)

### `GET /medical-records`

**رد ناجح (مقترح):**

```json
{
  "records": [],
  "vitals": {},
  "chronicDiseases": [],
  "surgicalOperations": []
}
```

---

### `PUT /medical-records`

**Body:** نفس الحقول المراد تحديثها (مثلاً المؤشرات والقوائم).

**رد ناجح:** يُفضّل إرجاع الكائن المحدّث أو الأجزاء المحدثة بنفس شكل `GET`.

---

## 5) مسارات مقترحة لاحقاً

مذكورة في `src/api/endpoints.js` تحت `ADMIN`, `DOCTOR_API`, `BOOKING`, `AI` — تُفصَّل عند جاهزية الصفحات والباك.

---

## مرجع الكود

| الملف | الوظيفة |
|--------|---------|
| `src/api/endpoints.js` | المسارات الموحّدة |
| `src/api/axiosInstance.js` | baseURL + Bearer + 401 |
| `src/utils/apiError.js` | استخراج رسالة الخطأ |
| `src/features/*/…Slice.js` | استدعاءات فعلية |
