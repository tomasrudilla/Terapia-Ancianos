import { Link } from 'react-router-dom';

export function Home() {
  return (
    <main>
      <section className="hero" id="portada">
        <div className="container hero-grid">
          <div>
            <p className="hero-eyebrow">Encuentros y contención</p>
            <h1>Un espacio de encuentros y herramientas para vos que sos el familiar que cuida</h1>
            <p className="hero-lead">
              Sesiones individuales y grupales pensadas para armar una red de contención, escucha y herramientas
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
                «Sé lo agotador que es cuando todo es nuevo y no sabés cómo reaccionar. Mi objetivo es escucharte con
                tiempo y respeto para darte el alivio que necesitás en el día a día.»
              </blockquote>
              <cite>— Acompañante terapéutico · especialidad en gerontología</cite>
              <dl className="hero-stats">
                <div>
                  <dt>Experiencia</dt>
                  <dd>
                    4 años en la dirección de discapacidad
                    <br />
                    6 años como acompañante terapéutico de adultos mayores.
                  </dd>
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
            <h2>Servicios:</h2>
          </header>
          <div className="cards-grid cards-grid-three">
            <article className="card">
              <div className="card-icon" aria-hidden="true">🏡</div>
              <h3 className="card-title-compact">
                Propuestas claras en un ambiente tranquilo y accesible
              </h3>
              <p>
                Encuentros con calma para familiares y adultos mayores, en consultorio u online, con pasos claros y
                respuestas a las dudas del día a día.
              </p>
            </article>
            <article className="card">
              <div className="card-icon" aria-hidden="true">🌿</div>
              <h3>Acompañamiento Familiar</h3>
              <p>
                Para trabajar las emociones, adaptarnos al cambio, vínculos, como aprender a desarrollar las
                herramientas.
              </p>
            </article>
            <article className="card">
              <div className="card-icon" aria-hidden="true">📋</div>
              <h3>Modalidad que vos vas a elegir</h3>
              <ul className="card-modalidad-list">
                <li>
                  <strong>Individual</strong>
                  <br />
                  1 hora
                </li>
                <li>
                  <strong>Grupal</strong>
                  <br />
                  2 horas
                </li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="section" id="sobre-mi">
        <div className="container about-grid">
          <div className="about-image" role="img" aria-label="Espacio terapéutico cálido y luminoso" />
          <div className="about-content">
            <h2>Sobre mí...</h2>
            <p>
              En los años trabajados para Discapacidad más la experiencia como Acompañante Terapéutica, siempre mi
              pregunta era ¿quién cuida y guía a los familiares? ¿Quién los contiene? Me llenan de preguntas, que no
              saben cómo actuar o qué hacer con su familiar.
            </p>
            <p>
              Ahí decidí armar estas charlas, que les van a servir para aprender nuevamente a conectar con su ser
              querido.
            </p>
            <p>A generar recuerdos nuevos.</p>
            <p>Que no están solos.</p>
            <p>Que hay que romper con los patrones de que todo lo pueden hacer solos.</p>
            <p>Este espacio es para ellos.</p>
            <p>Entre ellos y yo vamos a formar comunidades para ir para adelante.</p>
            <p>Van a aprender a encontrar EL DÍA GANADO</p>
          </div>
        </div>
      </section>

      <section className="section experiencias-teaser">
        <div className="container experiencias-teaser-inner">
          <div>
            <h2>Experiencias de familiares</h2>
            <p>
              Leé testimonios de quienes participaron de charlas y acompañamiento: palabras reales de familias que
              transitaron el camino junto a Romina.
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
              <span aria-hidden="true">📞</span>
              <div>
                <strong>Teléfono</strong>
                <span>
                  <a
                    href="https://wa.me/541140224577"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    +54 11 4022-4577
                  </a>
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
