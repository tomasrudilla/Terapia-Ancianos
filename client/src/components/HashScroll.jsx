import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToHomeSection, homeSectionFromHash } from '../lib/scrollToSection';

export function HashScroll() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (pathname !== '/' && pathname !== '/inicio') return;
    if (!hash) return;

    const id = requestAnimationFrame(() => {
      scrollToHomeSection(homeSectionFromHash(hash));
    });
    return () => cancelAnimationFrame(id);
  }, [pathname, hash]);

  return null;
}
