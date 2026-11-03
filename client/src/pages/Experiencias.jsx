import { Link } from 'react-router-dom';
import { experiencias } from '../experienciasData.js';

function PhoneFrame({ children }) {
  return (
    <div className="experience-phone experience-phone--iphone">
      <span className="experience-phone-btn experience-phone-btn-silent" aria-hidden="true" />
      <span className="experience-phone-btn experience-phone-btn-volume" aria-hidden="true" />
      <span className="experience-phone-btn experience-phone-btn-power" aria-hidden="true" />
      <div className="experience-phone-screen">
        <div className="experience-phone-island" aria-hidden="true" />
        {children}
        <div className="experience-phone-home-bar" aria-hidden="true" />
      </div>
    </div>
  );
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
        <div className="container experiencias-gallery">
          {experiencias.map((item) => (
            <figure key={item.slug} className="experience-screenshot" id={item.slug}>
              <PhoneFrame>
                {item.src ? (
                  <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
                ) : (
                  <div className="experience-phone-chat">
                    <div className="experience-phone-bubble">
                      {item.text.split('\n\n').map((paragraph, pi) => (
                        <p key={`${item.slug}-${pi}`}>{paragraph}</p>
                      ))}
                      {item.footer ? <p className="experience-phone-bubble-footer">{item.footer}</p> : null}
                    </div>
                    {item.author ? (
                      <p className="experience-phone-chat-author">{item.author}</p>
                    ) : null}
                  </div>
                )}
              </PhoneFrame>
            </figure>
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
