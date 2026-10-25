const HEADER_OFFSET = 12;

export function scrollToHomeSection(sectionId) {
  if (sectionId === 'portada' || !sectionId) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const el = document.getElementById(sectionId);
  if (!el) return;

  const header = document.querySelector('.site-header');
  const offset = (header?.offsetHeight ?? 72) + HEADER_OFFSET;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

export function homeSectionFromHash(hash) {
  const id = (hash || '').replace('#', '');
  return id || 'portada';
}
