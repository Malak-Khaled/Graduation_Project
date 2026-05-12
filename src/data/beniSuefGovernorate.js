/** Beni Suef governorate only — markaz (administrative centers) for the app. */

export const BENI_SUEF_GOV_AR = 'بني سويف';

export const BENI_SUEF_MARKAZ_AR = [
  'مركز بني سويف',
  'سمسطا',
  'الفشن',
  'ببا',
  'الواسطى',
  'ناصر',
  'إهناسيا',
];

/** Same order as {@link BENI_SUEF_MARKAZ_AR} for language switching. */
export const BENI_SUEF_MARKAZ_EN = [
  'Beni Suef (center)',
  'Samasta',
  'El Fashn',
  'Biba',
  'El Wasta',
  'Nasser',
  'Ihnasiya',
];

export const GOVERNORATES_AR = [BENI_SUEF_GOV_AR];

export const AREAS_BY_GOV_AR = {
  [BENI_SUEF_GOV_AR]: BENI_SUEF_MARKAZ_AR,
};
