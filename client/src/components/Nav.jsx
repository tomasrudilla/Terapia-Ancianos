import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

export function Nav() {
  const [open, setOpen] = useState(false);
  const [inicioOpen, setInicioOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
    setInicioOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setInicioOpen(false);
      }
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

  const hashSection = location.hash.replace('#', '') || (location.pathname === '/' ? 'portada' : '');

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          <span className="logo-mark" aria-hidden="true" />
          <span>Espacio Calma</span>
        </Link>

        <nav className={`main-nav ${open ? 'open' : ''}`} id="main-nav" aria-label="Principal">
          <div className="nav-links">
            <div className="nav-dropdown" data-nav-dropdown>
              <button
                type="button"
                className={`nav-dropdown-trigger${pageKey === 'inicio' ? ' is-active' : ''}`}
                aria-expanded={inicioOpen}
                onClick={() => setInicioOpen((v) => !v)}
              >
                Inicio
                <span className="nav-chevron" aria-hidden="true" />
              </button>
              <div className={`nav-dropdown-panel${inicioOpen ? ' is-open' : ''}`} hidden={!inicioOpen}>
                <p className="nav-dropdown-eyebrow">Secciones del inicio</p>
                <Link to="/#servicios" className={hashSection === 'servicios' ? 'is-active' : ''} role="menuitem">
                  Servicios
                </Link>
                <Link to="/#sobre-mi" className={hashSection === 'sobre-mi' ? 'is-active' : ''} role="menuitem">
                  Sobre mí
                </Link>
                <Link to="/#contacto" className={hashSection === 'contacto' ? 'is-active' : ''} role="menuitem">
                  Contacto
                </Link>
                <Link to="/" className={`nav-dropdown-foot${hashSection === 'portada' ? ' is-active' : ''}`} role="menuitem">
                  Ver portada completa
                </Link>
              </div>
            </div>
            <NavLink to="/experiencias" className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}>
              Experiencias
            </NavLink>
          </div>

          <span className="nav-divider" aria-hidden="true" />

          <div className="nav-actions">
            <NavLink to="/reservar" className={({ isActive }) => `btn btn-small${isActive ? ' is-active' : ''}`}>
              Reservar sesión
            </NavLink>
            <NavLink to="/eventos" className={({ isActive }) => `btn btn-small btn-nav-alt${isActive ? ' is-active' : ''}`}>
              Unirme a evento grupal
            </NavLink>
          </div>
        </nav>

        <button
          type="button"
          className="nav-toggle"
          aria-label="Abrir menú"
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
