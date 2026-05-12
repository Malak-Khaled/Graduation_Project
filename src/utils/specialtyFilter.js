export const SPECIALTY_ALL_AR = 'الكل';
export const SPECIALTY_OPTIONS_AR = [SPECIALTY_ALL_AR];

const SPECIALTY_KEYWORDS = {
  باطنة: ['باطنة', 'باطنه', 'internal', 'internist'],
  'قلب وأوعية دموية': ['قلب', 'cardio', 'cardiology', 'أوعية'],
  'طب الأسنان': ['أسنان', 'dent', 'dental'],
  'مخ وأعصاب': ['مخ', 'أعصاب', 'neuro', 'neurology'],
  أطفال: ['أطفال', 'طفل', 'pedia', 'pediatric'],
  'طب وجراحة العيون': ['عيون', 'عين', 'ophtha', 'eye', 'ليزك'],
  عظام: ['عظام', 'ortho', 'orthopedic'],
  'علاج طبيعي': ['علاج طبيعي', 'physio', 'physiotherapy'],
};

const SPECIALTY_ALIASES = {
  internal: 'باطنة',
  'internal medicine': 'باطنة',
  cardiology: 'قلب وأوعية دموية',
  'cardiovascular diseases': 'قلب وأوعية دموية',
  dentistry: 'طب الأسنان',
  dental: 'طب الأسنان',
  neurology: 'مخ وأعصاب',
  pediatrics: 'أطفال',
  pediatric: 'أطفال',
  ophthalmology: 'طب وجراحة العيون',
  orthopedics: 'عظام',
  orthopaedics: 'عظام',
  physiotherapy: 'علاج طبيعي',
};

export function matchesSpecialty(doctorSpecialty, selectedSpecialty) {
  const selected = String(selectedSpecialty || '').trim();
  if (!selected || selected === SPECIALTY_ALL_AR) return true;

  const normalizedSelected = SPECIALTY_ALIASES[selected.toLowerCase()] || selected;
  const hay = String(doctorSpecialty || '').toLowerCase();
  const needles = SPECIALTY_KEYWORDS[normalizedSelected] || [normalizedSelected];
  return needles.some((kw) => hay.includes(String(kw).toLowerCase()));
}

export function isDoctorLikeName(name) {
  return String(name || '').trim().startsWith('د.');
}

export function getDoctorProfiles(rows) {
  return (rows || []).filter((row) => isDoctorLikeName(row?.name));
}

export function getSpecialtyOptionsFromDoctors(rows, includeAll = true) {
  const doctors = getDoctorProfiles(rows);
  const unique = new Set();
  doctors.forEach((d) => {
    const s = String(d?.specialty || '').trim();
    if (s) unique.add(s);
  });
  const values = Array.from(unique).sort((a, b) => a.localeCompare(b, 'ar'));
  return includeAll ? [SPECIALTY_ALL_AR, ...values] : values;
}

// Backward compatibility with old index-based URLs: /doctors?specialty=0
export function specialtyFromLegacyIndex(value) {
  const idx = Number(value);
  if (!Number.isInteger(idx)) return null;
  const mapping = [
    'قلب وأوعية دموية',
    'طب الأسنان',
    'مخ وأعصاب',
    'أطفال',
    'طب وجراحة العيون',
  ];
  return mapping[idx] || null;
}
