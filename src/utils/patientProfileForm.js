import { BENI_SUEF_GOV_AR, BENI_SUEF_MARKAZ_AR, BENI_SUEF_MARKAZ_EN } from '../data/beniSuefGovernorate';

export function formatBirthForInput(value) {
  if (value == null || value === '') return '';
  const s = typeof value === 'string' ? value : String(value);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

/** عرض المركز حسب اللغة بناءً على القيمة المخزنة (عربي أو إنجليزي). */
export function displayMarkazFromStoredArea(areaValue, isEn) {
  let idx = BENI_SUEF_MARKAZ_AR.indexOf(areaValue || '');
  if (idx < 0) idx = BENI_SUEF_MARKAZ_EN.indexOf(areaValue || '');
  if (idx < 0) idx = 0;
  return (isEn ? BENI_SUEF_MARKAZ_EN : BENI_SUEF_MARKAZ_AR)[idx] ?? BENI_SUEF_MARKAZ_AR[0];
}

/** يحوّل اختيار الواجهة (عربي/إنجليزي) إلى اسم المركز العربي للتخزين في الـ API. */
export function storedAreaFromDisplayMarkaz(markazDisplay) {
  const idxEn = BENI_SUEF_MARKAZ_EN.indexOf(markazDisplay);
  if (idxEn >= 0) return BENI_SUEF_MARKAZ_AR[idxEn];
  const idxAr = BENI_SUEF_MARKAZ_AR.indexOf(markazDisplay);
  if (idxAr >= 0) return BENI_SUEF_MARKAZ_AR[idxAr];
  return markazDisplay || BENI_SUEF_MARKAZ_AR[0];
}

/**
 * @param {Record<string, unknown>} user — من الـ API (snake_case)
 * @param {boolean} isEn
 */
export function personalFormFromUser(user, isEn) {
  return {
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
    birthDate: formatBirthForInput(user?.date_of_birth),
    gender: user?.gender === 'female' ? 'female' : 'male',
    governorate: user?.governorate || BENI_SUEF_GOV_AR,
    markaz: displayMarkazFromStoredArea(user?.area, isEn),
    bloodType: user?.blood_type ?? '',
    weight: user?.weight != null && user.weight !== '' ? String(user.weight) : '',
    height: user?.height != null ? String(user.height) : '',
    address: user?.address ?? '',
  };
}
