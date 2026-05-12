/** Map persisted Arabic/API status strings to i18n keys under `appointments.status.*` */
const APPOINTMENT_STATUS_KEYS = {
  مؤكد: 'appointments.status.confirmed',
  confirmed: 'appointments.status.confirmed',
  مكتمل: 'appointments.status.completed',
  completed: 'appointments.status.completed',
  ملغي: 'appointments.status.cancelled',
  cancelled: 'appointments.status.cancelled',
  'قيد الانتظار': 'appointments.status.waiting',
  pending: 'appointments.status.waiting',
  جاري: 'appointments.status.inProgress',
  inProgress: 'appointments.status.inProgress',
  'تحت المراجعة': 'appointments.status.underReview',
  underReview: 'appointments.status.underReview',
};

const INVOICE_STATUS_KEYS = {
  'تم الدفع': 'invoices.status.paid',
  'لم يتم الدفع': 'invoices.status.unpaid',
  paid: 'invoices.status.paid',
  unpaid: 'invoices.status.unpaid',
  pending: 'invoices.status.unpaid',
};

export function translateAppointmentStatus(status, t) {
  const key = APPOINTMENT_STATUS_KEYS[status];
  return key ? t(key) : status;
}

export function translateInvoiceStatus(status, t) {
  const key = INVOICE_STATUS_KEYS[status];
  return key ? t(key) : status;
}

/** Doctor row active flag from admin UI mock/API */
export function translateDoctorActiveStatus(status, t) {
  if (status === 'نشط') return t('admin.doctors.active');
  if (status === 'غير نشط') return t('admin.doctors.inactive');
  return status;
}
