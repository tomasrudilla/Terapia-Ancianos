<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/layout.php';
require_once __DIR__ . '/includes/experiencias_data.php';

$experiencias = get_experiencias();
$base = page_base();

render_head('Experiencias');
render_nav();
?>
<main>
    <section class="page-hero container">
        <p class="hero-eyebrow">Historias reales de acompañamiento</p>
        <h1>Experiencias</h1>
        <p class="page-hero-lead">
            Personas mayores que confiaron en este espacio: qué necesitaban, qué hicimos juntos
            y cómo fue el proceso. Cada historia es única; los nombres se comparten con permiso.
        </p>
    </section>

    <section class="section section-alt experiencias-section">
        <div class="container experiencias-stack">
            <?php foreach ($experiencias as $i => $exp): ?>
            <article class="experience-card<?= $i % 2 === 1 ? ' experience-card-reverse' : '' ?>" id="<?= htmlspecialchars($exp['slug']) ?>">
                <div class="experience-media">
                    <img
                        src="<?= htmlspecialchars(asset($exp['image'])) ?>"
                        alt="<?= htmlspecialchars($exp['image_alt']) ?>"
                        width="640"
                        height="800"
                        loading="lazy"
                    >
                </div>
                <div class="experience-body">
                    <header class="experience-header">
                        <h2><?= htmlspecialchars($exp['name']) ?></h2>
                        <p class="experience-meta">
                            <?= (int) $exp['age'] ?> años · <?= htmlspecialchars($exp['location']) ?>
                        </p>
                    </header>

                    <dl class="experience-facts">
                        <div>
                            <dt>Qué se hizo</dt>
                            <dd><?= htmlspecialchars($exp['service']) ?></dd>
                        </div>
                        <div>
                            <dt>Duración</dt>
                            <dd><?= htmlspecialchars($exp['duration']) ?></dd>
                        </div>
                        <div class="experience-facts-wide">
                            <dt>Situación inicial</dt>
                            <dd><?= htmlspecialchars($exp['summary']) ?></dd>
                        </div>
                    </dl>

                    <p class="experience-story"><?= htmlspecialchars($exp['story']) ?></p>

                    <blockquote class="experience-quote">
                        «<?= htmlspecialchars($exp['quote']) ?>»
                        <cite>— <?= htmlspecialchars($exp['name']) ?></cite>
                    </blockquote>
                </div>
            </article>
            <?php endforeach; ?>
        </div>
    </section>

    <section class="section experiencias-cta">
        <div class="container experience-cta-box">
            <div>
                <h2>¿Querés empezar tu propio proceso?</h2>
                <p>Podés reservar una sesión individual o sumarte a un taller grupal cuando haya cupo.</p>
            </div>
            <div class="hero-actions">
                <a href="<?= htmlspecialchars($base) ?>/reservar.php" class="btn btn-primary">Reservar sesión individual</a>
                <a href="<?= htmlspecialchars($base) ?>/eventos.php" class="btn btn-secondary">Ver eventos grupales</a>
            </div>
        </div>
    </section>

    <section class="container experiencias-disclaimer">
        <p>
            Las historias son relatos clínicos anonimizados o publicados con consentimiento informado.
            Los datos sensibles fueron modificados para proteger la privacidad. Las fotografías son
            ilustrativas con fines demostrativos del sitio.
        </p>
    </section>
</main>
<?php render_footer(); ?>
