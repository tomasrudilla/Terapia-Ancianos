<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/layout.php';
render_head('Reservar sesión');
render_nav();
?>
<main>
    <div class="page-hero container">
        <h1>Reservar terapia individual</h1>
        <p>Elegí un día y horario disponible. La sesión dura <?= SLOT_MINUTES ?> minutos.</p>
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
                <span class="legend-dot legend-slot"></span> Turno individual
                <span class="legend-dot legend-event"></span> Evento grupal (sin turno individual)
            </p>

            <div class="slots-section" id="day-events-section" hidden>
                <h3>Eventos grupales este día</h3>
                <div id="day-events-list" class="events-list"></div>
            </div>

            <div class="slots-section">
                <h3>Horarios para sesión individual</h3>
                <p class="empty-slots" id="slots-empty">Seleccioná una fecha en el calendario.</p>
                <div class="slots-grid hidden" id="slots-grid"></div>
            </div>
        </div>

        <aside class="form-panel">
            <h3>Tus datos</h3>
            <div id="booking-alert" class="alert hidden" role="alert"></div>
            <div class="form-summary" id="form-summary">
                <strong>Fecha y hora</strong>
                <span id="summary-datetime">Aún no elegiste horario</span>
            </div>
            <form id="booking-form" novalidate>
                <input type="hidden" name="date" id="field-date">
                <input type="hidden" name="time" id="field-time">
                <div class="form-group">
                    <label for="client_name">Nombre completo *</label>
                    <input type="text" id="client_name" name="client_name" required autocomplete="name">
                </div>
                <div class="form-group">
                    <label for="client_email">Email *</label>
                    <input type="email" id="client_email" name="client_email" required autocomplete="email">
                </div>
                <div class="form-group">
                    <label for="client_phone">Teléfono</label>
                    <input type="tel" id="client_phone" name="client_phone" autocomplete="tel">
                </div>
                <div class="form-group">
                    <label for="notes">Motivo o comentario (opcional)</label>
                    <textarea id="notes" name="notes" rows="3" placeholder="Ej.: primera consulta, preferencia presencial u online"></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-block" id="submit-booking" disabled>
                    Confirmar reserva
                </button>
            </form>
        </aside>
    </div>
</main>
<script>
window.BOOKING_API = '<?= htmlspecialchars(page_base() . '/api/slots.php') ?>';
window.BOOKING_POST = '<?= htmlspecialchars(page_base() . '/api/book.php') ?>';
window.EVENTOS_PAGE = '<?= htmlspecialchars(page_base() . '/eventos.php') ?>';
</script>
<script src="<?= asset('js/calendar.js') ?>"></script>
<?php render_footer(); ?>
