import { Outlet } from 'react-router-dom';
import { HashScroll } from './HashScroll';
import { Nav } from './Nav';

export function Layout() {
  return (
    <>
      <HashScroll />
      <Nav />
      <Outlet />
      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <p className="footer-brand">Romina Cruces</p>
            <p className="footer-tagline">Acompañamiento terapéutico para adultos mayores</p>
          </div>
          <p className="footer-copy">&copy; {new Date().getFullYear()} · Cuidado con calma y respeto</p>
        </div>
      </footer>
    </>
  );
}
