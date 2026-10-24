<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/layout.php';
render_head('Inicio');
render_nav();
?>
<main>
    <section class="hero">
        <div class="container hero-grid">
            <div>
                <p class="hero-eyebrow">Terapia humanizada</p>
                <h1>Un espacio de calma para acompañar la vejez con dignidad</h1>
                <p class="hero-lead">
                    Sesiones individuales pensadas para adultos mayores y sus familias:
                    escucha, contención y herramientas concretas para el día a día.
                </p>
                <div class="hero-actions">
                    <a href="reservar.php" class="btn btn-primary">Reservar sesión individual</a>
                    <a href="eventos.php" class="btn btn-secondary">Unirme a evento grupal</a>
                </div>
            </div>
            <div class="hero-visual">
                <div class="hero-card">
                    <blockquote>
                        «Cada persona mayor tiene una historia única; mi trabajo es escucharla con tiempo y respeto.»
                    </blockquote>
                    <cite>— Lic. en Psicología · enfoque gerontológico</cite>
                    <dl class="hero-stats">
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

    <section class="section section-alt" id="servicios">
        <div class="container">
            <header class="section-header">
                <h2>Servicios</h2>
                <p>Propuestas claras, en un ambiente tranquilo y accesible.</p>
            </header>
            <div class="cards-grid">
                <article class="card">
                    <div class="card-icon" aria-hidden="true">🌿</div>
                    <h3>Terapia individual</h3>
                    <p>Sesiones de 60 minutos para trabajar emociones, adaptación al cambio, duelos y vínculos familiares.</p>
                </article>
                <article class="card">
                    <div class="card-icon" aria-hidden="true">🤝</div>
                    <h3>Acompañamiento familiar</h3>
                    <p>Orientación a cuidadores y familiares sobre comunicación, límites y autocuidado.</p>
                </article>
                <article class="card">
                    <div class="card-icon" aria-hidden="true">🧘</div>
                    <h3>Talleres y encuentros</h3>
                    <p>Actividades grupales de memoria, relajación y socialización (consultar calendario de eventos).</p>
                </article>
            </div>
        </div>
    </section>

    <section class="section" id="sobre-mi">
        <div class="container about-grid">
            <div class="about-image" role="img" aria-label="Espacio terapéutico cálido y luminoso"></div>
            <div class="about-content">
                <h2>Sobre mí</h2>
                <p>
                    Soy psicóloga especializada en adultos mayores. Trabajo desde un enfoque integrador,
                    combinando escucha clínica, psicoeducación y recursos prácticos para mejorar la calidad de vida.
                </p>
                <p>
                    El consultorio está preparado para personas con movilidad reducida. También ofrezco
                    modalidad online para quienes prefieren atención desde casa.
                </p>
                <ul class="list-check">
                    <li>Primera consulta sin compromiso (30 min)</li>
                    <li>Horarios de lunes a viernes, 9 a 18 hs</li>
                    <li>Reserva online con confirmación inmediata</li>
                </ul>
            </div>
        </div>
    </section>

    <section class="section experiencias-teaser">
        <div class="container experiencias-teaser-inner">
            <div>
                <h2>Experiencias de quienes pasaron por acá</h2>
                <p>
                    Conocé historias de adultos mayores: qué les preocupaba, qué tratamiento o taller
                    recibieron y cómo se sintieron en el proceso.
                </p>
            </div>
            <a href="experiencias.php" class="btn btn-primary">Ver todas las experiencias</a>
        </div>
    </section>

    <section class="section section-alt" id="contacto">
        <div class="container">
            <header class="section-header">
                <h2>Contacto</h2>
                <p>Escribime o reservá directamente desde el calendario.</p>
            </header>
            <div class="contact-box">
                <div class="contact-item">
                    <span aria-hidden="true">📍</span>
                    <div>
                        <strong>Consultorio</strong>
                        <span>Av. Corrientes 1234, CABA<br>Planta baja · acceso sin escaleras</span>
                    </div>
                </div>
                <div class="contact-item">
                    <span aria-hidden="true">✉️</span>
                    <div>
                        <strong>Email</strong>
                        <span><a href="mailto:contacto@espaciocalma.com">contacto@espaciocalma.com</a></span>
                    </div>
                </div>
                <div class="contact-item">
                    <span aria-hidden="true">📞</span>
                    <div>
                        <strong>Teléfono</strong>
                        <span><a href="tel:+541112345678">+54 11 1234-5678</a></span>
                    </div>
                </div>
                <div class="contact-item">
                    <span aria-hidden="true">📅</span>
                    <div>
                        <strong>Reservas</strong>
                        <span><a href="reservar.php">Sesión individual</a> · <a href="eventos.php">Eventos grupales</a></span>
                    </div>
                </div>
            </div>
        </div>
    </section>
</main>
<?php render_footer(); ?>
