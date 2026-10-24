<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';
require_admin();

$base = page_base();
render_head('Panel de administración');
?>
<body class="admin-body">
<header class="admin-header">
    <div class="container">
        <a href="dashboard.php" class="logo">
            <span class="logo-mark"></span>
            <span><?= htmlspecialchars(APP_NAME) ?></span>
        </a>
        <div class="actions-inline">
            <span class="admin-badge">Administrador</span>
            <a href="<?= htmlspecialchars($base) ?>/index.php" class="btn btn-ghost btn-icon">Ver sitio</a>
            <a href="logout.php" class="btn btn-secondary btn-icon">Salir</a>
        </div>
    </div>
</header>

<div class="container admin-layout">
    <aside class="admin-sidebar">
        <nav aria-label="Secciones del panel">
            <button type="button" class="tab-btn active" data-tab="bookings">Reservas</button>
            <button type="button" class="tab-btn" data-tab="events">Eventos</button>
            <button type="button" class="tab-btn" data-tab="blocks">Bloquear horarios</button>
        </nav>
    </aside>

    <div class="admin-main">
        <div id="tab-bookings" class="tab-panel active admin-card">
            <h2>Reservas de terapia individual</h2>
            <div class="form-row" style="margin-bottom:1.25rem">
                <div class="form-group">
                    <label for="filter-month">Mes</label>
                    <input type="month" id="filter-month" value="<?= date('Y-m') ?>">
                </div>
                <div class="form-group" style="display:flex;align-items:flex-end">
                    <button type="button" class="btn btn-secondary" id="reload-bookings">Actualizar</button>
                </div>
            </div>
            <div class="table-wrap">
                <table class="data-table" id="bookings-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Paciente</th>
                            <th>Contacto</th>
                            <th>Estado</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
            <p class="empty-slots hidden" id="bookings-empty">No hay reservas en este período.</p>
        </div>

        <div id="tab-events" class="tab-panel admin-card">
            <h2>Eventos y talleres</h2>
            <p style="color:var(--text-muted);margin-top:-0.75rem;margin-bottom:1.25rem;font-size:0.95rem">
                Creá encuentros grupales. Si marcás «bloquear turnos», esos horarios no estarán disponibles para reservas individuales.
            </p>
            <form id="event-form">
                <div class="form-group">
                    <label for="event_title">Título *</label>
                    <input type="text" id="event_title" name="title" required placeholder="Ej.: Taller de memoria">
                </div>
                <div class="form-group">
                    <label for="event_desc">Descripción</label>
                    <textarea id="event_desc" name="description" rows="2"></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="event_date">Fecha *</label>
                        <input type="date" id="event_date" name="event_date" required>
                    </div>
                    <div class="form-group">
                        <label for="event_type">Tipo</label>
                        <select id="event_type" name="event_type">
                            <option value="event">Evento / taller</option>
                            <option value="meeting">Reunión interna</option>
                            <option value="other">Otro</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="event_start">Desde *</label>
                        <input type="time" id="event_start" name="start_time" required value="10:00">
                    </div>
                    <div class="form-group">
                        <label for="event_end">Hasta *</label>
                        <input type="time" id="event_end" name="end_time" required value="12:00">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="event_max">Cupo máximo (inscripciones)</label>
                        <input type="number" id="event_max" name="max_participants" min="1" value="12">
                    </div>
                    <div class="form-group" style="display:flex;align-items:flex-end">
                        <label>
                            <input type="checkbox" name="blocks_booking" value="1" checked>
                            Bloquear turnos individuales
                        </label>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">Guardar evento</button>
            </form>
            <div id="event-alert" class="alert hidden" style="margin-top:1rem"></div>
            <h3 style="font-family:var(--font-display);margin-top:2rem">Próximos eventos</h3>
            <div class="table-wrap">
                <table class="data-table" id="events-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Horario</th>
                            <th>Título</th>
                            <th>Inscriptos</th>
                            <th>Bloquea turnos</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>

        <div id="tab-blocks" class="tab-panel admin-card">
            <h2>Bloquear horarios</h2>
            <p style="color:var(--text-muted);margin-top:-0.75rem;margin-bottom:1.25rem;font-size:0.95rem">
                Marcá franjas no disponibles (vacaciones, traslados, etc.) sin crear un evento público.
            </p>
            <form id="block-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="block_date">Fecha *</label>
                        <input type="date" id="block_date" name="block_date" required>
                    </div>
                    <div class="form-group">
                        <label for="block_reason">Motivo</label>
                        <input type="text" id="block_reason" name="reason" placeholder="Opcional">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="block_start">Desde *</label>
                        <input type="time" id="block_start" name="start_time" required value="09:00">
                    </div>
                    <div class="form-group">
                        <label for="block_end">Hasta *</label>
                        <input type="time" id="block_end" name="end_time" required value="13:00">
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">Agregar bloqueo</button>
            </form>
            <div id="block-alert" class="alert hidden" style="margin-top:1rem"></div>
            <h3 style="font-family:var(--font-display);margin-top:2rem">Bloqueos activos</h3>
            <div class="table-wrap">
                <table class="data-table" id="blocks-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Horario</th>
                            <th>Motivo</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<script>
window.ADMIN_API = {
    bookings: '<?= htmlspecialchars($base) ?>/api/admin/bookings.php',
    events: '<?= htmlspecialchars($base) ?>/api/admin/events.php',
    blocks: '<?= htmlspecialchars($base) ?>/api/admin/blocks.php',
};
</script>
<script src="<?= asset('js/admin.js') ?>"></script>
</body>
</html>
