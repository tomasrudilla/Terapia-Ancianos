<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/layout.php';
render_head('Eventos grupales');
render_nav();
$base = page_base();
?>
<main>
    <div class="page-hero container">
        <h1>Eventos y talleres grupales</h1>
        <p>Elegí un día con actividad, mirá quién ya se anotó y sumate al encuentro.</p>
    </div>

    <div class="container booking-layout">
        <div class="calendar-panel">
            <div class="calendar-header">
                <h2 id="cal-month-label">—</h2>
                <div class="calendar-nav">
                    <button type="button" id="cal-prev" aria-label="Mes anterior">‹</button>
                    <button type="button" id="cal-next" aria-label="Mes siguiente">›</button>
                </div>
            </div>
            <div class="calendar-weekdays">
                <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
            </div>
            <div class="calendar-days" id="cal-days" role="grid" aria-labelledby="cal-month-label"></div>
            <p class="calendar-legend">
                <span class="legend-dot legend-event"></span> Día con evento grupal
            </p>

            <div class="slots-section">
                <h3>Eventos del día</h3>
                <p class="empty-slots" id="events-empty">Seleccioná una fecha marcada en el calendario.</p>
                <div id="events-list" class="events-list hidden"></div>
            </div>
        </div>

        <aside class="form-panel" id="signup-panel">
            <h3 id="signup-title">Inscripción al evento</h3>
            <div id="event-alert" class="alert hidden" role="alert"></div>
            <div class="form-summary" id="signup-summary">
                <strong>Evento</strong>
                <span id="summary-event">Elegí un evento de la lista</span>
            </div>
            <form id="event-signup-form" novalidate>
                <input type="hidden" name="event_id" id="field-event-id">
                <div class="form-group">
                    <label for="participant_name">Nombre completo *</label>
                    <input type="text" id="participant_name" name="participant_name" required autocomplete="name">
                </div>
                <div class="form-group">
                    <label for="participant_email">Email *</label>
                    <input type="email" id="participant_email" name="participant_email" required autocomplete="email">
                </div>
                <div class="form-group">
                    <label for="participant_phone">Teléfono</label>
                    <input type="tel" id="participant_phone" name="participant_phone" autocomplete="tel">
                </div>
                <button type="submit" class="btn btn-primary btn-block" id="submit-event" disabled>
                    Confirmar inscripción
                </button>
            </form>
            <p class="panel-note">
                ¿Preferís atención uno a uno?
                <a href="<?= htmlspecialchars($base) ?>/reservar.php">Reservar sesión individual</a>
            </p>
        </aside>
    </div>
</main>
<script>
window.EVENTS_API = '<?= htmlspecialchars($base) ?>/api/events.php';
window.EVENT_REGISTER_API = '<?= htmlspecialchars($base) ?>/api/event-register.php';
window.PRESELECT_EVENT = <?= json_encode(isset($_GET['event']) ? (int) $_GET['event'] : 0) ?>;
</script>
<script src="<?= asset('js/events-calendar.js') ?>"></script>
<?php render_footer(); ?>
