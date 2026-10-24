document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  const dropdown = document.querySelector('[data-nav-dropdown]');
  const trigger = dropdown?.querySelector('.nav-dropdown-trigger');
  const panel = dropdown?.querySelector('.nav-dropdown-panel');

  function closeDropdown() {
    if (!trigger || !panel) return;
    trigger.setAttribute('aria-expanded', 'false');
    panel.classList.remove('is-open');
    panel.setAttribute('hidden', '');
  }

  function openDropdown() {
    if (!trigger || !panel) return;
    trigger.setAttribute('aria-expanded', 'true');
    panel.removeAttribute('hidden');
    requestAnimationFrame(() => panel.classList.add('is-open'));
  }

  function toggleDropdown() {
    if (!trigger) return;
    if (trigger.getAttribute('aria-expanded') === 'true') {
      closeDropdown();
    } else {
      openDropdown();
    }
  }

  if (trigger && panel) {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown();
    });

    panel.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeDropdown();
        nav?.classList.remove('open');
        toggle?.setAttribute('aria-expanded', 'false');
      });
    });
  }

  document.addEventListener('click', (e) => {
    if (dropdown && !dropdown.contains(e.target)) {
      closeDropdown();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDropdown();
      nav?.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
    }
  });

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (!open) closeDropdown();
    });
  }

  function syncInicioSectionHighlight() {
    if (nav?.dataset.navPage !== 'inicio' || !panel) return;

    const hash = window.location.hash.replace('#', '');
    const section = hash || 'portada';

    panel.querySelectorAll('[data-nav-section]').forEach((link) => {
      const active = link.dataset.navSection === section;
      link.classList.toggle('is-active', active);
      if (active) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  syncInicioSectionHighlight();
  window.addEventListener('hashchange', syncInicioSectionHighlight);
});
