import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import BrandLogo from './BrandLogo';
import LanguageSwitcher from './LanguageSwitcher';
import { useDirection } from '../hooks/useDirection';

/**
 * @param {'home'|'doctors'|'about'|'contact'|null} active
 * @param {{ to: string, labelKey: string }} [cta] labelKey is a translation key e.g. publicNav.login
 */
const SCROLL_BG_THRESHOLD = 12;

export default function PublicNavbar({ active = null, cta = { to: '/login', labelKey: 'publicNav.login' } }) {
  const { t } = useTranslation();
  const { isLtr } = useDirection();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > SCROLL_BG_THRESHOLD);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkClass = (key) => (active === key ? 'nav-link-active' : 'nav-link-inactive');
  const mobileAlign = isLtr ? 'text-start' : 'text-end';

  return (
    <nav className={`navbar-public${scrolled ? ' navbar-public--scrolled' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <Link to="/" className="nav-logo-hit">
          <BrandLogo className="h-20 w-20 object-contain" />
        </Link>
        <div className="hidden md:flex items-center gap-4">
          <Link to="/" className={linkClass('home')}>{t('publicNav.home')}</Link>
          <Link to="/doctors" className={linkClass('doctors')}>{t('publicNav.doctors')}</Link>
          <Link to="/about" className={linkClass('about')}>{t('publicNav.about')}</Link>
          <Link to="/contact" className={linkClass('contact')}>{t('publicNav.contact')}</Link>
        </div>
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <LanguageSwitcher />
          <Link to={cta.to} className="nav-cta-link hidden md:inline-flex">
            {t(cta.labelKey)}
          </Link>
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="nav-icon-toggle md:hidden" aria-label={t('common.menu')}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-2 pb-4 border-t border-gray-100 pt-4">
          <Link to="/" className={`${linkClass('home')} w-fit ${mobileAlign}`} onClick={() => setMenuOpen(false)}>{t('publicNav.home')}</Link>
          <Link to="/doctors" className={`${linkClass('doctors')} w-fit ${mobileAlign}`} onClick={() => setMenuOpen(false)}>{t('publicNav.doctors')}</Link>
          <Link to="/about" className={`${linkClass('about')} w-fit ${mobileAlign}`} onClick={() => setMenuOpen(false)}>{t('publicNav.about')}</Link>
          <Link to="/contact" className={`${linkClass('contact')} w-fit ${mobileAlign}`} onClick={() => setMenuOpen(false)}>{t('publicNav.contact')}</Link>
          <Link to={cta.to} className="nav-cta-link w-full text-center mt-1" onClick={() => setMenuOpen(false)}>{t(cta.labelKey)}</Link>
        </div>
      )}
    </nav>
  );
}
