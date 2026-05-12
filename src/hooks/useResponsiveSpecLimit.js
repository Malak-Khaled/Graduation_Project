import { useEffect, useState } from 'react';

/**
 * Returns how many specialty links to show in the footer at the current viewport width.
 */
export function useResponsiveSpecLimit() {
  const [limit, setLimit] = useState(8);

  useEffect(() => {
    const mqSm = window.matchMedia('(max-width: 639px)');
    const mqMd = window.matchMedia('(max-width: 1023px)');

    const update = () => {
      if (mqSm.matches) {
        setLimit(5);
      } else if (mqMd.matches) {
        setLimit(7);
      } else {
        setLimit(10);
      }
    };

    update();
    mqSm.addEventListener('change', update);
    mqMd.addEventListener('change', update);
    return () => {
      mqSm.removeEventListener('change', update);
      mqMd.removeEventListener('change', update);
    };
  }, []);

  return limit;
}
