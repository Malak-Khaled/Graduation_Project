import { useTranslation } from 'react-i18next';
import logoSrc from '../assets/logo.png';

/** شعار المنصة — يُستورد عبر Vite ليعمل في التطوير والإنتاج. */
export default function BrandLogo({ className = 'h-20 w-20 object-contain', alt }) {
  const { t } = useTranslation();
  return <img src={logoSrc} alt={alt ?? t('brand.alt')} className={className} decoding="async" />;
}
