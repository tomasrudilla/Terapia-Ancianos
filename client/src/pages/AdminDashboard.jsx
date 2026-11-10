import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { MonthCalendar } from '../components/MonthCalendar';
import { apiDelete, apiGetAdmin, apiPost, clearAdminToken, getAdminToken } from '../api';
import { todayISOInTimezone } from '../lib/dates';

function fmtDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function fmtDateTime(iso) {
  if (!iso) return '—';
  const dt = new Date(iso);
  return dt.toLocaleString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function monthStart(d) {
  const x = new Date(d);
  x.setDate(1);
  return x;
}

const TABS = [
  { id: 'new-event', label: 'Nuevo evento online' },
  { id: 'bookings', label: 'Reservas individuales online' },
  { id: 'event-reservations', label: 'Votos eventos' },
  { id: 'blocks', label: 'Bloqueos' },
];

function AdminMobileNav({ tab, open, onToggle, onSelect }) {
  const current = TABS.find((t) => t.id === tab) ?? TABS[0];

  return (
    <nav className={`admin-mobile-menu${open ? ' is-open' : ''}`} aria-label="Secciones del panel">
      <button
        type="button"
        className="admin-mobile-menu-trigger"
        aria-expanded={open}
        aria-controls="admin-mobile-menu-list"
        onClick={onToggle}
      >
        <span className="admin-mobile-menu-trigger-text">
          <span className="admin-mobile-menu-kicker">Menú</span>
          <span className="admin-mobile-menu-current">{current.label}</span>
        </span>
        <span className="nav-chevron" aria-hidden="true" />
      </button>
      {open ? (
        <ul id="admin-mobile-menu-list" className="admin-mobile-menu-list">
          {TABS.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                className={`admin-mobile-menu-item${tab === t.id ? ' is-active' : ''}`}
                aria-current={tab === t.id ? 'page' : undefined}
                onClick={() => onSelect(t.id)}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </nav>
  );
}

function AdminVotersDialog({ data, onClose }) {
  if (!data) return null;

  return (
    <div className="admin-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="admin-modal admin-voters-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-voters-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="admin-voters-title" className="admin-modal-title">
          Votos: {data.title}
        </h3>
        <p className="admin-modal-text">{data.subtitle}</p>
        {data.voters.length === 0 ? (
          <p className="admin-muted">No hay votos registrados.</p>
        ) : (
          <ul className="admin-voters-modal-list">
            {data.voters.map((v, i) => (
              <li key={`${v.email}-${i}`}>
                <strong>{v.name}</strong>
                <span>
                  {' '}
                  · <a href={`mailto:${v.email}`}>{v.email}</a>
                </span>
                {v.created_at ? <span className="admin-muted"> · {fmtDateTime(v.created_at)}</span> : null}
              </li>
            ))}
          </ul>
        )}
        <div className="admin-modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminConfirmDialog({ dialog, onCancel, onConfirm }) {
  if (!dialog) return null;

  return (
    <div className="admin-modal-overlay" role="presentation" onClick={onCancel}>
      <div
        className="admin-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        aria-describedby="admin-confirm-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="admin-confirm-title" className="admin-modal-title">
          {dialog.title}
        </h3>
        <p id="admin-confirm-desc" className="admin-modal-text">
          {dialog.message}
        </p>
        <div className="admin-modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>
            {dialog.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const token = getAdminToken();
  const [tab, setTab] = useState('new-event');
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [bookingCalView, setBookingCalView] = useState(() => monthStart(new Date()));
  const [eventCalView, setEventCalView] = useState(() => monthStart(new Date()));
  const [selectedBookingDate, setSelectedBookingDate] = useState(null);
  const [selectedEventDate, setSelectedEventDate] = useState(null);
  const [eventFormDate, setEventFormDate] = useState('');
  const [showEventHistory, setShowEventHistory] = useState(false);
  const [votersDialog, setVotersDialog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const loadBookings = useCallback(async () => {
    const data = await apiGetAdmin('/api/admin/bookings?all=1');
    setBookings(data.bookings || []);
  }, []);

  const loadEvents = useCallback(async () => {
    const data = await apiGetAdmin('/api/admin/events?all=1');
    setEvents(data.events || []);
  }, []);

  const loadBlocks = useCallback(async () => {
    const data = await apiGetAdmin('/api/admin/blocks?all=1');
    setBlocks(data.blocks || []);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([loadBookings(), loadEvents(), loadBlocks()]);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el panel');
    } finally {
      setLoading(false);
    }
  }, [loadBookings, loadEvents, loadBlocks]);

  useEffect(() => {
    if (!token) return;
    refresh();
  }, [token, refresh]);

  useEffect(() => {
    const today = todayISOInTimezone();
    if (tab === 'bookings') {
      setSelectedBookingDate(today);
      const [y, m] = today.split('-').map(Number);
      setBookingCalView(new Date(y, m - 1, 1));
    }
    if (tab === 'event-reservations') {
      setSelectedEventDate(today);
      const [y, m] = today.split('-').map(Number);
      setEventCalView(new Date(y, m - 1, 1));
    }
  }, [tab]);

  useEffect(() => {
    if (!confirmDialog && !votersDialog && !adminMenuOpen) return;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      setConfirmDialog(null);
      setVotersDialog(null);
      setAdminMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [confirmDialog, votersDialog, adminMenuOpen]);

  useEffect(() => {
    setAdminMenuOpen(false);
  }, [tab]);

  const openConfirm = (options) => {
    setConfirmDialog({
      title: options.title || 'Confirmar',
      message: options.message,
      confirmLabel: options.confirmLabel || 'Eliminar',
      onConfirm: options.onConfirm,
    });
  };

  const runConfirm = async () => {
    if (!confirmDialog?.onConfirm) return;
    const action = confirmDialog.onConfirm;
    setConfirmDialog(null);
    await action();
  };

  const daysWithBookings = useMemo(() => {
    const set = new Set();
    bookings.forEach((b) => set.add(b.booking_date));
    return set;
  }, [bookings]);

  const bookingsOnSelectedDay = useMemo(() => {
    if (!selectedBookingDate) return [];
    return bookings
      .filter((b) => b.booking_date === selectedBookingDate)
      .sort((a, b) => a.booking_time.localeCompare(b.booking_time));
  }, [bookings, selectedBookingDate]);

  const groupEvents = useMemo(() => events.filter((ev) => ev.event_type === 'event'), [events]);

  const eventsPast = useMemo(() => {
    const today = todayISOInTimezone();
    return groupEvents
      .filter((ev) => ev.event_date < today)
      .sort((a, b) => {
        const d = b.event_date.localeCompare(a.event_date);
        if (d !== 0) return d;
        return b.start_time.localeCompare(a.start_time);
      });
  }, [groupEvents]);

  const daysWithGroupEvents = useMemo(() => {
    const set = new Set();
    groupEvents.forEach((ev) => set.add(ev.event_date));
    return set;
  }, [groupEvents]);

  const eventsOnSelectedDay = useMemo(() => {
    if (!selectedEventDate) return [];
    return groupEvents
      .filter((ev) => ev.event_date === selectedEventDate)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [groupEvents, selectedEventDate]);

  if (!token) return <Navigate to="/admin/login" replace />;

  const logout = () => {
    clearAdminToken();
    window.location.href = '/admin/login';
  };

  const updateBooking = async (id, status) => {
    await apiPost('/api/admin/bookings', { id, status }, true);
    setMsg(status === 'confirmed' ? 'Reserva reactivada' : 'Reserva cancelada');
    await loadBookings();
  };

  const deleteBooking = (id) => {
    openConfirm({
      title: 'Eliminar reserva',
      message: '¿Eliminar esta reserva permanentemente?',
      onConfirm: async () => {
        await apiDelete('/api/admin/bookings', { id });
        setMsg('Reserva eliminada');
        await loadBookings();
      },
    });
  };

  const submitEvent = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await apiPost(
      '/api/admin/events',
      {
        title: fd.get('title'),
        description: fd.get('description'),
        event_date: fd.get('event_date'),
        start_time: fd.get('start_time'),
        end_time: fd.get('end_time'),
        event_type: fd.get('event_type'),
        max_participants: fd.get('max_participants'),
        blocks_booking: fd.get('blocks_booking') === 'on' ? 1 : 0,
      },
      true,
    );
    const createdDate = fd.get('event_date');
    setMsg('Evento creado');
    e.target.reset();
    setEventFormDate('');
    await loadEvents();
    if (createdDate) {
      setTab('event-reservations');
      pickEventDate(String(createdDate));
    }
  };

  const submitBlock = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await apiPost(
      '/api/admin/blocks',
      {
        block_date: fd.get('block_date'),
        start_time: fd.get('start_time'),
        end_time: fd.get('end_time'),
        reason: fd.get('reason'),
      },
      true,
    );
    setMsg('Horario bloqueado');
    e.target.reset();
    await loadBlocks();
  };

  const pickBookingDate = (dateStr) => {
    setSelectedBookingDate(dateStr);
    const [y, m] = dateStr.split('-').map(Number);
    setBookingCalView(new Date(y, m - 1, 1));
  };

  const pickEventDate = (dateStr) => {
    setSelectedEventDate(dateStr);
    const [y, m] = dateStr.split('-').map(Number);
    setEventCalView(new Date(y, m - 1, 1));
  };

  const openVotersDialog = (ev) => {
    setVotersDialog({
      title: ev.title,
      subtitle: `${fmtDate(ev.event_date)} · ${ev.start_time} – ${ev.end_time} hs`,
      voters: ev.voters || [],
    });
  };

  const deleteEvent = (id) => {
    openConfirm({
      title: 'Eliminar evento',
      message: '¿Eliminar evento e inscripciones?',
      onConfirm: async () => {
        await apiDelete('/api/admin/events', { id });
        setMsg('Evento eliminado');
        await loadEvents();
      },
    });
  };

  const renderEventRows = (list) =>
    list.map((ev) => (
      <tr key={ev.id} className={ev.event_date < todayISOInTimezone() ? 'admin-row-past' : undefined}>
        <td>{fmtDate(ev.event_date)}</td>
        <td>
          {ev.start_time} – {ev.end_time}
        </td>
        <td>{ev.title}</td>
        <td>
          <strong>{ev.vote_count ?? 0}</strong>
        </td>
        <td className="admin-participants-cell">
          {(ev.vote_count ?? 0) > 0 ? (
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={() => openVotersDialog(ev)}
            >
              Ver votos ({ev.vote_count})
            </button>
          ) : (
            '—'
          )}
        </td>
        <td>
          <button type="button" className="btn btn-danger btn-icon" onClick={() => deleteEvent(ev.id)}>
            Eliminar
          </button>
        </td>
      </tr>
    ));

  return (
    <div className="admin-body">
      <header className="admin-header">
        <div className="container admin-header-inner">
          <Link to="/" className="logo admin-header-logo" title="Ir al sitio web">
            <span className="logo-mark" />
            <span>Gerontología y Familia</span>
          </Link>
          <div className="admin-header-toolbar">
            <div className="admin-header-identity">
              <span className="admin-header-avatar" aria-hidden="true">
                R
              </span>
              <div className="admin-header-identity-text">
                <span className="admin-header-role">Administrador</span>
                <span className="admin-header-name">Romina Cruces</span>
              </div>
            </div>
            <div className="admin-header-actions">
              <button type="button" className="btn btn-secondary btn-small admin-btn-logout" onClick={logout}>
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container admin-layout">
        <AdminMobileNav
          tab={tab}
          open={adminMenuOpen}
          onToggle={() => setAdminMenuOpen((v) => !v)}
          onSelect={(id) => {
            setTab(id);
            setAdminMenuOpen(false);
          }}
        />

        <aside className="admin-sidebar admin-desktop-sidebar">
          <nav>
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`tab-btn${tab === t.id ? ' active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="admin-main">
          {error && <div className="alert alert-error">{error}</div>}
          {msg && (
            <div className="alert alert-success">
              {msg}
              <button type="button" className="admin-alert-dismiss" onClick={() => setMsg('')} aria-label="Cerrar">
                ×
              </button>
            </div>
          )}
          {loading && <p className="admin-loading">Cargando…</p>}

          {tab === 'bookings' && (
            <div className="admin-card">
              <h2>Reserva de sesión individual online</h2>
              <p className="admin-lead">Elegí un día en el calendario para ver los turnos reservados.</p>
              <div className="admin-calendar-layout">
                <div className="calendar-panel admin-calendar-panel">
                  <MonthCalendar
                    adminMode
                    view={bookingCalView}
                    onPrev={() => setBookingCalView(new Date(bookingCalView.getFullYear(), bookingCalView.getMonth() - 1, 1))}
                    onNext={() => setBookingCalView(new Date(bookingCalView.getFullYear(), bookingCalView.getMonth() + 1, 1))}
                    daysWithSlots={daysWithBookings}
                    selectedDate={selectedBookingDate}
                    onSelectDate={pickBookingDate}
                  />
                  <p className="calendar-legend">
                    <span className="legend-dot legend-slot" /> Día con reserva
                  </p>
                </div>
                <div className="admin-day-detail">
                  <h3 className="admin-subtitle">
                    {selectedBookingDate ? fmtDate(selectedBookingDate) : 'Seleccioná un día'}
                  </h3>
                  {!selectedBookingDate && (
                    <p className="admin-empty-inline">Marcá una fecha en el calendario.</p>
                  )}
                  {selectedBookingDate && bookingsOnSelectedDay.length === 0 && (
                    <p className="admin-empty-inline">No hay reservas este día.</p>
                  )}
                  <ul className="admin-day-list">
                    {bookingsOnSelectedDay.map((b) => (
                      <li key={b.id} className="admin-day-item">
                        <div className="admin-day-item-head">
                          <strong>{b.booking_time}</strong>
                          <span className={`badge badge-${b.status === 'confirmed' ? 'confirmed' : 'block'}`}>
                            {b.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                          </span>
                        </div>
                        <p className="admin-day-item-name">{b.client_name}</p>
                        <p className="admin-day-item-meta">
                          <a href={`mailto:${b.client_email}`}>{b.client_email}</a>
                          {b.client_phone ? (
                            <>
                              {' · '}
                              <a href={`tel:${b.client_phone}`}>{b.client_phone}</a>
                            </>
                          ) : null}
                        </p>
                        {b.notes ? <p className="admin-day-item-notes">{b.notes}</p> : null}
                        <p className="admin-muted">Alta: {fmtDateTime(b.created_at)}</p>
                        <div className="actions-inline admin-row-actions">
                          {b.status === 'confirmed' ? (
                            <button type="button" className="btn btn-ghost btn-icon" onClick={() => updateBooking(b.id, 'cancelled')}>
                              Cancelar
                            </button>
                          ) : (
                            <button type="button" className="btn btn-ghost btn-icon" onClick={() => updateBooking(b.id, 'confirmed')}>
                              Reactivar
                            </button>
                          )}
                          <button type="button" className="btn btn-danger btn-icon" onClick={() => deleteBooking(b.id)}>
                            Eliminar
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {tab === 'event-reservations' && (
            <div className="admin-card">
              <h2>Votos eventos</h2>
              <p className="admin-lead">
                Elegí un día en el calendario para ver propuestas publicadas, votos y gestionar cada evento.
              </p>
              <div className="admin-calendar-layout">
                <div className="calendar-panel admin-calendar-panel">
                  <MonthCalendar
                    adminMode
                    view={eventCalView}
                    onPrev={() => setEventCalView(new Date(eventCalView.getFullYear(), eventCalView.getMonth() - 1, 1))}
                    onNext={() => setEventCalView(new Date(eventCalView.getFullYear(), eventCalView.getMonth() + 1, 1))}
                    daysWithEvents={daysWithGroupEvents}
                    selectedDate={selectedEventDate}
                    onSelectDate={pickEventDate}
                  />
                  <p className="calendar-legend">
                    <span className="legend-dot legend-event" /> Día con evento grupal
                  </p>
                </div>
                <div className="admin-day-detail">
                  <h3 className="admin-subtitle">{selectedEventDate ? fmtDate(selectedEventDate) : 'Seleccioná un día'}</h3>
                  {!selectedEventDate && <p className="admin-empty-inline">Marcá una fecha en el calendario.</p>}
                  {selectedEventDate && eventsOnSelectedDay.length === 0 && (
                    <p className="admin-empty-inline">No hay eventos grupales este día.</p>
                  )}
                  <ul className="admin-day-list">
                    {eventsOnSelectedDay.map((ev) => (
                      <li key={ev.id} className="admin-day-item">
                        <div className="admin-day-item-head">
                          <strong>{ev.title}</strong>
                          <span className="badge badge-confirmed">{ev.vote_count ?? 0} votos</span>
                        </div>
                        <p className="admin-day-item-meta">
                          {ev.start_time} – {ev.end_time} hs
                        </p>
                        {ev.description ? <p className="admin-day-item-notes">{ev.description}</p> : null}
                        <div className="actions-inline admin-row-actions">
                          {(ev.vote_count ?? 0) > 0 ? (
                            <button type="button" className="btn btn-ghost btn-icon" onClick={() => openVotersDialog(ev)}>
                              Ver votos
                            </button>
                          ) : null}
                          <button type="button" className="btn btn-danger btn-icon" onClick={() => deleteEvent(ev.id)}>
                            Eliminar
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {eventsPast.length > 0 && (
                <div className="admin-events-history">
                  <button
                    type="button"
                    className="btn btn-ghost admin-history-toggle"
                    aria-expanded={showEventHistory}
                    onClick={() => setShowEventHistory((v) => !v)}
                  >
                    {showEventHistory ? 'Ocultar historial de eventos' : 'Ver historial de eventos'}
                    <span className="admin-history-count">({eventsPast.length})</span>
                  </button>
                  {showEventHistory && (
                    <div className="table-wrap admin-history-table">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>Horario</th>
                            <th>Título</th>
                            <th>Votos</th>
                            <th>Detalle votos</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>{renderEventRows(eventsPast)}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === 'new-event' && (
            <div className="admin-card">
              <h2>Nuevo evento online</h2>
              <p className="admin-lead">Cargá una propuesta grupal. En el sitio se publica desde hoy en adelante para que la voten.</p>
              <form onSubmit={submitEvent} className="admin-form-section">
                <div className="form-group">
                  <label>Título *</label>
                  <input name="title" required />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea name="description" rows={2} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha *</label>
                    <input
                      name="event_date"
                      type="date"
                      required
                      value={eventFormDate}
                      onChange={(e) => {
                        setEventFormDate(e.target.value);
                        if (e.target.value) pickEventDate(e.target.value);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tipo</label>
                    <select name="event_type" defaultValue="event">
                      <option value="event">Evento / taller</option>
                      <option value="meeting">Reunión interna</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Desde *</label>
                    <input name="start_time" type="time" defaultValue="10:00" required />
                  </div>
                  <div className="form-group">
                    <label>Hasta *</label>
                    <input name="end_time" type="time" defaultValue="12:00" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Cupo máximo</label>
                    <input name="max_participants" type="number" min={1} defaultValue={12} />
                  </div>
                  <div className="form-group admin-check-wrap">
                    <label className="admin-check">
                      <input name="blocks_booking" type="checkbox" defaultChecked /> Bloquear turnos individuales en ese horario
                    </label>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">
                  Guardar evento
                </button>
              </form>
            </div>
          )}

          {tab === 'blocks' && (
            <div className="admin-card">
              <h2>Bloquear horarios</h2>
              <p className="admin-lead">Impide reservas individuales en franjas puntuales.</p>
              <form onSubmit={submitBlock} className="admin-form-section">
                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha *</label>
                    <input name="block_date" type="date" required />
                  </div>
                  <div className="form-group">
                    <label>Motivo</label>
                    <input name="reason" placeholder="Opcional" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Desde *</label>
                    <input name="start_time" type="time" defaultValue="09:00" required />
                  </div>
                  <div className="form-group">
                    <label>Hasta *</label>
                    <input name="end_time" type="time" defaultValue="13:00" required />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">
                  Agregar bloqueo
                </button>
              </form>

              <h3 className="admin-subtitle">Bloqueos activos</h3>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Horario</th>
                      <th>Motivo</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {blocks.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="admin-empty">
                          No hay bloqueos.
                        </td>
                      </tr>
                    ) : (
                      blocks.map((bl) => (
                        <tr key={bl.id}>
                          <td>{fmtDate(bl.block_date)}</td>
                          <td>
                            {bl.start_time} – {bl.end_time}
                          </td>
                          <td>{bl.reason || '—'}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-danger btn-icon"
                              onClick={async () => {
                                await apiDelete('/api/admin/blocks', { id: bl.id });
                                setMsg('Bloqueo eliminado');
                                await loadBlocks();
                              }}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <AdminConfirmDialog
        dialog={confirmDialog}
        onCancel={() => setConfirmDialog(null)}
        onConfirm={runConfirm}
      />
      <AdminVotersDialog data={votersDialog} onClose={() => setVotersDialog(null)} />
    </div>
  );
}
