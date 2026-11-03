import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { MonthCalendar } from '../components/MonthCalendar';
import { apiDelete, apiGetAdmin, apiPost, clearAdminToken, getAdminToken } from '../api';

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
  { id: 'overview', label: 'Resumen' },
  { id: 'bookings', label: 'Reservas individuales' },
  { id: 'registrations', label: 'Inscripciones eventos' },
  { id: 'events', label: 'Eventos' },
  { id: 'blocks', label: 'Bloqueos' },
];

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
  const [tab, setTab] = useState('overview');
  const [overviewStats, setOverviewStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [bookingCalView, setBookingCalView] = useState(() => monthStart(new Date()));
  const [regCalView, setRegCalView] = useState(() => monthStart(new Date()));
  const [selectedBookingDate, setSelectedBookingDate] = useState(null);
  const [selectedRegDate, setSelectedRegDate] = useState(null);
  const [eventFormDate, setEventFormDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(null);

  const loadOverview = useCallback(async () => {
    const data = await apiGetAdmin('/api/admin/overview');
    setOverviewStats(data.stats || null);
  }, []);

  const loadBookings = useCallback(async () => {
    const data = await apiGetAdmin('/api/admin/bookings?all=1');
    setBookings(data.bookings || []);
  }, []);

  const loadRegistrations = useCallback(async () => {
    const data = await apiGetAdmin('/api/admin/registrations');
    setRegistrations(data.registrations || []);
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
      await Promise.all([loadOverview(), loadBookings(), loadRegistrations(), loadEvents(), loadBlocks()]);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el panel');
    } finally {
      setLoading(false);
    }
  }, [loadOverview, loadBookings, loadRegistrations, loadEvents, loadBlocks]);

  useEffect(() => {
    if (!token) return;
    refresh();
  }, [token, refresh]);

  useEffect(() => {
    if (!confirmDialog) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setConfirmDialog(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [confirmDialog]);

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

  const daysWithRegistrations = useMemo(() => {
    const set = new Set();
    registrations.forEach((r) => set.add(r.event_date));
    return set;
  }, [registrations]);

  const bookingsOnSelectedDay = useMemo(() => {
    if (!selectedBookingDate) return [];
    return bookings
      .filter((b) => b.booking_date === selectedBookingDate)
      .sort((a, b) => a.booking_time.localeCompare(b.booking_time));
  }, [bookings, selectedBookingDate]);

  const registrationsOnSelectedDay = useMemo(() => {
    if (!selectedRegDate) return [];
    return registrations.filter((r) => r.event_date === selectedRegDate);
  }, [registrations, selectedRegDate]);

  const eventsSorted = useMemo(
    () =>
      [...events].sort((a, b) => {
        const d = b.event_date.localeCompare(a.event_date);
        if (d !== 0) return d;
        return b.start_time.localeCompare(a.start_time);
      }),
    [events],
  );

  if (!token) return <Navigate to="/admin/login" replace />;

  const logout = () => {
    clearAdminToken();
    window.location.href = '/admin/login';
  };

  const updateBooking = async (id, status) => {
    await apiPost('/api/admin/bookings', { id, status }, true);
    setMsg(status === 'confirmed' ? 'Reserva reactivada' : 'Reserva cancelada');
    await Promise.all([loadBookings(), loadOverview()]);
  };

  const deleteBooking = (id) => {
    openConfirm({
      title: 'Eliminar reserva',
      message: '¿Eliminar esta reserva permanentemente?',
      onConfirm: async () => {
        await apiDelete('/api/admin/bookings', { id });
        setMsg('Reserva eliminada');
        await Promise.all([loadBookings(), loadOverview()]);
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
    setMsg('Evento creado');
    e.target.reset();
    setEventFormDate('');
    await Promise.all([loadEvents(), loadOverview(), loadRegistrations()]);
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
    await Promise.all([loadBlocks(), loadOverview()]);
  };

  const pickBookingDate = (dateStr) => {
    setSelectedBookingDate(dateStr);
    const [y, m] = dateStr.split('-').map(Number);
    setBookingCalView(new Date(y, m - 1, 1));
  };

  const pickRegDate = (dateStr) => {
    setSelectedRegDate(dateStr);
    const [y, m] = dateStr.split('-').map(Number);
    setRegCalView(new Date(y, m - 1, 1));
  };

  const deleteEvent = (id) => {
    openConfirm({
      title: 'Eliminar evento',
      message: '¿Eliminar evento e inscripciones?',
      onConfirm: async () => {
        await apiDelete('/api/admin/events', { id });
        setMsg('Evento eliminado');
        await Promise.all([loadEvents(), loadRegistrations(), loadOverview()]);
      },
    });
  };

  return (
    <div className="admin-body">
      <header className="admin-header">
        <div className="container admin-header-inner">
          <Link to="/admin" className="logo admin-header-logo">
            <span className="logo-mark" />
            <span>Espacio Calma</span>
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
        <aside className="admin-sidebar">
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

          {tab === 'overview' && (
            <div className="admin-card">
              <h2>Resumen</h2>
              <div className="admin-stats">
                <div className="admin-stat">
                  <span className="admin-stat-value">{overviewStats?.bookings_confirmed ?? '—'}</span>
                  <span className="admin-stat-label">Reservas confirmadas</span>
                </div>
                <div className="admin-stat">
                  <span className="admin-stat-value">{overviewStats?.bookings_cancelled ?? '—'}</span>
                  <span className="admin-stat-label">Reservas canceladas</span>
                </div>
                <div className="admin-stat">
                  <span className="admin-stat-value">{overviewStats?.registrations_total ?? '—'}</span>
                  <span className="admin-stat-label">Inscripciones a eventos</span>
                </div>
                <div className="admin-stat">
                  <span className="admin-stat-value">{overviewStats?.events_upcoming ?? '—'}</span>
                  <span className="admin-stat-label">Eventos futuros</span>
                </div>
              </div>
              <div className="admin-overview-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setTab('bookings')}>
                  Calendario de reservas
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setTab('registrations')}>
                  Calendario de inscripciones
                </button>
                <button type="button" className="btn btn-ghost" onClick={refresh}>
                  Actualizar
                </button>
              </div>
            </div>
          )}

          {tab === 'bookings' && (
            <div className="admin-card">
              <h2>Reservas de sesión individual</h2>
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

          {tab === 'registrations' && (
            <div className="admin-card">
              <h2>Inscripciones a eventos grupales</h2>
              <p className="admin-lead">Elegí un día para ver las inscripciones a eventos grupales.</p>
              <div className="admin-calendar-layout">
                <div className="calendar-panel admin-calendar-panel">
                  <MonthCalendar
                    adminMode
                    view={regCalView}
                    onPrev={() => setRegCalView(new Date(regCalView.getFullYear(), regCalView.getMonth() - 1, 1))}
                    onNext={() => setRegCalView(new Date(regCalView.getFullYear(), regCalView.getMonth() + 1, 1))}
                    daysWithEvents={daysWithRegistrations}
                    selectedDate={selectedRegDate}
                    onSelectDate={pickRegDate}
                  />
                  <p className="calendar-legend">
                    <span className="legend-dot legend-event" /> Día con inscripciones
                  </p>
                </div>
                <div className="admin-day-detail">
                  <h3 className="admin-subtitle">{selectedRegDate ? fmtDate(selectedRegDate) : 'Seleccioná un día'}</h3>
                  {!selectedRegDate && <p className="admin-empty-inline">Marcá una fecha en el calendario.</p>}
                  {selectedRegDate && registrationsOnSelectedDay.length === 0 && (
                    <p className="admin-empty-inline">No hay inscripciones en eventos de este día.</p>
                  )}
                  <ul className="admin-day-list">
                    {registrationsOnSelectedDay.map((r) => (
                      <li key={r.id} className="admin-day-item">
                        <div className="admin-day-item-head">
                          <strong>{r.event_title}</strong>
                        </div>
                        <p className="admin-day-item-meta">
                          {r.start_time} – {r.end_time} hs
                        </p>
                        <p className="admin-day-item-name">{r.participant_name}</p>
                        <p className="admin-day-item-meta">
                          <a href={`mailto:${r.participant_email}`}>{r.participant_email}</a>
                          {r.participant_phone ? (
                            <>
                              {' · '}
                              <a href={`tel:${r.participant_phone}`}>{r.participant_phone}</a>
                            </>
                          ) : null}
                        </p>
                        <p className="admin-muted">Inscripto: {fmtDateTime(r.created_at)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {tab === 'events' && (
            <div className="admin-card">
              <h2>Eventos y talleres</h2>
              <form onSubmit={submitEvent} className="admin-form-section">
                <h3 className="admin-subtitle">Nuevo evento</h3>
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
                      onChange={(e) => setEventFormDate(e.target.value)}
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

              <h3 className="admin-subtitle">Propuestas publicadas</h3>
              <p className="admin-lead">En el sitio los visitantes votan cuáles les interesan más (no es inscripción).</p>
              <div className="table-wrap">
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
                  <tbody>
                    {eventsSorted.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="admin-empty">
                          No hay eventos cargados.
                        </td>
                      </tr>
                    ) : (
                      eventsSorted.map((ev) => (
                        <tr key={ev.id}>
                          <td>{fmtDate(ev.event_date)}</td>
                          <td>
                            {ev.start_time} – {ev.end_time}
                          </td>
                          <td>{ev.title}</td>
                          <td>
                            <strong>{ev.vote_count ?? 0}</strong>
                          </td>
                          <td className="admin-participants-cell">
                            {ev.voters?.length ? (
                              <ul className="admin-participant-list">
                                {ev.voters.map((v, i) => (
                                  <li key={`${ev.id}-v-${i}`}>
                                    <strong>{v.name}</strong>
                                    {v.email ? ` · ${v.email}` : ''}
                                  </li>
                                ))}
                              </ul>
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
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
                                await Promise.all([loadBlocks(), loadOverview()]);
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
    </div>
  );
}
