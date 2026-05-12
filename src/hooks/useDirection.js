import { useTranslation } from 'react-i18next';

export function useDirection() {
  const { i18n } = useTranslation();
  const isLtr = i18n.language === 'en';
  return {
    isLtr,
    dir: isLtr ? 'ltr' : 'rtl',
    sidebarEdge: isLtr ? 'left' : 'right',
    sidebarFixedClass: isLtr ? 'left-0' : 'right-0',
    sidebarMainMarginClass: isLtr ? 'md:ml-64' : 'md:mr-64',
    fabHorizontalClass: isLtr ? 'right-5' : 'left-5',
  };
}
