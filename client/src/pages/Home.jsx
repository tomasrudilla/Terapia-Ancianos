import { Link } from 'react-router-dom';

export function Home() {
  return (
    <main>
      <section className="hero" id="portada">
        <div className="container hero-grid">
          <div>
            <p className="hero-eyebrow">Terapia humanizada</p>
            <h1>Un espacio de calma para acompañar la vejez con dignidad</h1>
            <p className="hero-lead">
              Sesiones individuales pensadas para adultos mayores y sus familias: escucha, contención y herramientas
              concretas para el día a día.
            </p>
            <div className="hero-actions">
              <Link to="/reservar" className="btn btn-primary">
                Reservar sesión individual
              </Link>
              <Link to="/eventos" className="btn btn-secondary">
                Unirme a evento grupal
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <blockquote>
                «Cada persona mayor tiene una historia única; mi trabajo es escucharla con tiempo y respeto.»
              </blockquote>
              <cite>— Lic. en Psicología · enfoque gerontológico</cite>
              <dl className="hero-stats">
                <div>
                  <dt>+10</dt>
                  <dd>Años de experiencia</dd>
                </div>
                <div>
                  <dt>100%</dt>
                  <dd>Atención personalizada</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="servicios">
        <div className="container">
          <header className="section-header">
            <h2>Servicios</h2>
            <p>Propuestas claras, en un ambiente tranquilo y accesible.</p>
          </header>
          <div className="cards-grid">
            <article className="card">
              <div className="card-icon" aria-hidden="true">🌿</div>
              <h3>Terapia individual</h3>
              <p>Sesiones de 60 minutos para trabajar emociones, adaptación al cambio, duelos y vínculos familiares.</p>
            </article>
            <article className="card">
              <div className="card-icon" aria-hidden="true">🤝</div>
              <h3>Acompañamiento familiar</h3>
              <p>Orientación a cuidadores y familiares sobre comunicación, límites y autocuidado.</p>
            </article>
            <article className="card">
              <div className="card-icon" aria-hidden="true">🧘</div>
              <h3>Talleres y encuentros</h3>
              <p>Actividades grupales de memoria, relajación y socialización (consultar calendario de eventos).</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section" id="sobre-mi">
        <div className="container about-grid">
          <div className="about-image" role="img" aria-label="Espacio terapéutico cálido y luminoso" />
          <div className="about-content">
            <h2>Sobre mí</h2>
            <p>
              Soy psicóloga especializada en adultos mayores. Trabajo desde un enfoque integrador, combinando escucha
              clínica, psicoeducación y recursos prácticos para mejorar la calidad de vida.
            </p>
            <p>
              El consultorio está preparado para personas con movilidad reducida. También ofrezco modalidad online para
              quienes prefieren atención desde casa.
            </p>
            <ul className="list-check">
              <li>Primera consulta sin compromiso (30 min)</li>
              <li>Horarios de lunes a viernes, 9 a 18 hs</li>
              <li>Reserva online con confirmación inmediata</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section experiencias-teaser">
        <div className="container experiencias-teaser-inner">
          <div>
            <h2>Experiencias de quienes pasaron por acá</h2>
            <p>
              Conocé historias de adultos mayores: qué les preocupaba, qué tratamiento o taller recibieron y cómo se
              sintieron en el proceso.
            </p>
          </div>
          <Link to="/experiencias" className="btn btn-primary">
            Ver todas las experiencias
          </Link>
        </div>
      </section>

      <section className="section section-alt" id="contacto">
        <div className="container">
          <header className="section-header">
            <h2>Contacto</h2>
            <p>Escribime o reservá directamente desde el calendario.</p>
          </header>
          <div className="contact-box">
            <div className="contact-item">
              <span aria-hidden="true">📍</span>
              <div>
                <strong>Consultorio</strong>
                <span>
                  Av. Corrientes 1234, CABA
                  <br />
                  Planta baja · acceso sin escaleras
                </span>
              </div>
            </div>
            <div className="contact-item">
              <span aria-hidden="true">✉️</span>
              <div>
                <strong>Email</strong>
                <span>
                  <a href="mailto:contacto@espaciocalma.com">contacto@espaciocalma.com</a>
                </span>
              </div>
            </div>
            <div className="contact-item">
              <span aria-hidden="true">📞</span>
              <div>
                <strong>Teléfono</strong>
                <span>
                  <a href="tel:+541112345678">+54 11 1234-5678</a>
                </span>
              </div>
            </div>
            <div className="contact-item">
              <span aria-hidden="true">📅</span>
              <div>
                <strong>Reservas</strong>
                <span>
                  <Link to="/reservar">Sesión individual</Link> · <Link to="/eventos">Eventos grupales</Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
