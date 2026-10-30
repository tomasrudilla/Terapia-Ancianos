import { Link } from 'react-router-dom';
import { experiencias } from '../experienciasData.js';

function experienceAuthorLabel(name) {
  const trimmed = (name ?? '').trim();
  if (!trimmed || /^anónimo$/i.test(trimmed)) return 'Anónimo';
  return trimmed;
}

export function Experiencias() {
  return (
    <main className="page-experiencias">
      <section className="page-hero page-hero--experiencias container">
        <p className="hero-eyebrow">Palabras de familiares</p>
        <h1>Experiencias</h1>
        <p className="page-hero-lead">
          Testimonios de quienes pasaron por charlas, encuentros y acompañamiento con Romina.
        </p>
      </section>

      <section className="section section-alt experiencias-section">
        <div className="container experiencias-stack">
          {experiencias.map((item) => (
            <article key={item.slug} className="experience-card" id={item.slug}>
              <div className="experience-body">
                <p className="experience-author">{experienceAuthorLabel(item.name)}</p>
                <div className="experience-story">
                  {item.text.split('\n\n').map((paragraph, pi) => (
                    <p key={`${item.slug}-${pi}`}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section experiencias-cta">
        <div className="container experience-cta-box">
          <div>
            <h2>¿Querés empezar?</h2>
            <p>Podés reservar una sesión individual o sumarte a un encuentro grupal.</p>
          </div>
          <div className="hero-actions">
            <Link to="/reservar" className="btn btn-primary">
              Reservar sesión individual
            </Link>
            <Link to="/eventos" className="btn btn-secondary">
              Ver eventos grupales
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
