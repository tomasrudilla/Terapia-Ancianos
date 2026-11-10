import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { getAdminToken } from '../api';
import { homeSectionFromHash, scrollToHomeSection } from '../lib/scrollToSection';

const HOME_SECTION_LINKS = [
  { id: 'servicios', label: 'Servicios' },
  { id: 'sobre-mi', label: 'Sobre mí' },
  { id: 'contacto', label: 'Contacto' },
  { id: 'portada', label: 'Ver portada completa', foot: true },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [inicioOpen, setInicioOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/' || location.pathname === '/inicio';

  const closeMenu = () => {
    setOpen(false);
    setInicioOpen(false);
  };

  const goHomeSection = (sectionId) => (e) => {
    e.preventDefault();
    closeMenu();

    const hashPath = sectionId === 'portada' ? '/' : `/#${sectionId}`;

    if (!isHome) {
      navigate(hashPath);
      return;
    }

    if (sectionId === 'portada') {
      navigate('/', { replace: true });
    } else {
      navigate(hashPath, { replace: true });
    }
    scrollToHomeSection(sectionId);
  };

  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle('nav-open', open);
    return () => document.body.classList.remove('nav-open');
  }, [open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const pageKey = (() => {
    const p = location.pathname;
    if (p === '/' || p === '/inicio') return 'inicio';
    if (p.startsWith('/experiencias')) return 'experiencias';
    if (p.startsWith('/reservar')) return 'reservar';
    if (p.startsWith('/eventos')) return 'eventos';
    return '';
  })();

  const hashSection = isHome ? homeSectionFromHash(location.hash) : '';
  const adminPath = getAdminToken() ? '/admin' : '/admin/login';
  const portadaActive = isHome && hashSection === 'portada';

  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="header-brand">
          <Link to={adminPath} className="nav-admin-entry" aria-label="Panel administrador" title="Administración">
            <svg className="nav-admin-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.31 0-6 1.79-6 4v1h12v-1c0-2.21-2.69-4-6-4z"
              />
            </svg>
          </Link>
          <Link to="/" className="logo" onClick={closeMenu}>
            <span className="logo-mark" aria-hidden="true" />
            <span>Gerontología y Familia</span>
          </Link>
        </div>

        <nav className={`main-nav ${open ? 'open' : ''}`} id="main-nav" aria-label="Principal">
          <div className="nav-mobile-menu">
            <Link
              to="/"
              className={`nav-mobile-item nav-mobile-text${portadaActive ? ' is-active' : ''}`}
              onClick={goHomeSection('portada')}
            >
              Ver portada completa
            </Link>
            <NavLink
              to="/experiencias"
              className={({ isActive }) => `nav-mobile-item nav-mobile-text${isActive ? ' is-active' : ''}`}
              onClick={closeMenu}
            >
              Experiencias
            </NavLink>
          </div>

          <div className="nav-desktop-only">
            <div className="nav-links">
              <div className="nav-dropdown nav-desktop-dropdown">
                <button
                  type="button"
                  className={`nav-dropdown-trigger${pageKey === 'inicio' ? ' is-active' : ''}`}
                  aria-expanded={inicioOpen}
                  onClick={() => setInicioOpen((v) => !v)}
                >
                  Inicio
                  <span className="nav-chevron" aria-hidden="true" />
                </button>
                <div className={`nav-dropdown-panel${inicioOpen ? ' is-open' : ''}`}>
                  <p className="nav-dropdown-eyebrow">Secciones del inicio</p>
                  {HOME_SECTION_LINKS.map((item) => {
                    const active =
                      hashSection === item.id || (item.id === 'portada' && hashSection === 'portada');
                    const cls = item.foot
                      ? `nav-dropdown-foot${active ? ' is-active' : ''}`
                      : active
                        ? 'is-active'
                        : '';
                    return (
                      <Link
                        key={`desktop-${item.id}`}
                        to={item.id === 'portada' ? '/' : `/#${item.id}`}
                        className={cls || undefined}
                        role="menuitem"
                        onClick={goHomeSection(item.id)}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <NavLink to="/experiencias" className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}>
                Experiencias
              </NavLink>
            </div>

            <span className="nav-divider" aria-hidden="true" />

            <div className="nav-actions">
              <NavLink
                to="/reservar"
                className={() =>
                  `btn btn-small${pageKey === 'eventos' ? ' btn-nav-alt' : ''}${pageKey === 'reservar' ? ' is-active' : ''}`
                }
              >
                Reservar sesión individual
              </NavLink>
              <NavLink
                to="/eventos"
                className={() =>
                  `btn btn-small${pageKey !== 'eventos' ? ' btn-nav-alt' : ''}${pageKey === 'eventos' ? ' is-active' : ''}`
                }
              >
                Votar eventos grupales
              </NavLink>
            </div>
          </div>
        </nav>

        <button
          type="button"
          className="nav-toggle"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
