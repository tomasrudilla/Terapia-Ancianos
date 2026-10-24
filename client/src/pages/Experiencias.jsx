import { Link } from 'react-router-dom';
import { experiencias } from '../experienciasData.js';

export function Experiencias() {
  return (
    <main>
      <section className="page-hero container">
        <p className="hero-eyebrow">Historias reales de acompañamiento</p>
        <h1>Experiencias</h1>
        <p className="page-hero-lead">
          Personas mayores que confiaron en este espacio: qué necesitaban, qué hicimos juntos y cómo fue el proceso.
        </p>
      </section>

      <section className="section section-alt experiencias-section">
        <div className="container experiencias-stack">
          {experiencias.map((exp, i) => (
            <article
              key={exp.slug}
              className={`experience-card${i % 2 === 1 ? ' experience-card-reverse' : ''}`}
              id={exp.slug}
            >
              <div className="experience-media">
                <img src={exp.image} alt={exp.imageAlt} width={640} height={800} loading="lazy" />
              </div>
              <div className="experience-body">
                <header className="experience-header">
                  <h2>{exp.name}</h2>
                  <p className="experience-meta">
                    {exp.age} años · {exp.location}
                  </p>
                </header>
                <dl className="experience-facts">
                  <div>
                    <dt>Qué se hizo</dt>
                    <dd>{exp.service}</dd>
                  </div>
                  <div>
                    <dt>Duración</dt>
                    <dd>{exp.duration}</dd>
                  </div>
                  <div className="experience-facts-wide">
                    <dt>Situación inicial</dt>
                    <dd>{exp.summary}</dd>
                  </div>
                </dl>
                <p className="experience-story">{exp.story}</p>
                <blockquote className="experience-quote">
                  «{exp.quote}»
                  <cite>— {exp.name}</cite>
                </blockquote>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section experiencias-cta">
        <div className="container experience-cta-box">
          <div>
            <h2>¿Querés empezar tu propio proceso?</h2>
            <p>Podés reservar una sesión individual o sumarte a un taller grupal cuando haya cupo.</p>
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

      <section className="container experiencias-disclaimer">
        <p>
          Las historias son relatos clínicos anonimizados o publicados con consentimiento informado. Las fotografías son
          ilustrativas con fines demostrativos del sitio.
        </p>
      </section>
    </main>
  );
}
