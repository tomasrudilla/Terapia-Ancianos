import { Outlet } from 'react-router-dom';
import { Nav } from './Nav';

export function Layout() {
  return (
    <>
      <Nav />
      <Outlet />
      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <p className="footer-brand">Espacio Calma</p>
            <p className="footer-tagline">Acompañamiento terapéutico para adultos mayores</p>
          </div>
          <p className="footer-copy">&copy; {new Date().getFullYear()} · Cuidado con calma y respeto</p>
        </div>
      </footer>
    </>
  );
}
