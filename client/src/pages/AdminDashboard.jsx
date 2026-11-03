import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
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

const TABS = [
  { id: 'overview', label: 'Resumen' },
  { id: 'bookings', label: 'Reservas individuales' },
  { id: 'registrations', label: 'Inscripciones eventos' },
  { id: 'events', label: 'Eventos' },
  { id: 'blocks', label: 'Bloqueos' },
];

export function AdminDashboard() {
  const token = getAdminToken();
  const [tab, setTab] = useState('overview');
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [allBookings, setAllBookings] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const loadBookings = useCallback(async () => {
    let path = '/api/admin/bookings?all=1';
    if (!allBookings) {
      const [y, m] = month.split('-').map(Number);
      const last = new Date(y, m, 0).getDate();
      path = `/api/admin/bookings?from=${month}-01&to=${month}-${String(last).padStart(2, '0')}`;
    }
    const data = await apiGetAdmin(path);
    setBookings(data.bookings || []);
  }, [allBookings, month]);

  const loadRegistrations = useCallback(async () => {
    const data = await apiGetAdmin('/api/admin/registrations');
    setRegistrations(data.registrations || []);
  }, []);

  const loadEvents = useCallback(async () => {
    const data = await apiGetAdmin('/api/admin/events?all=1');
    setEvents(data.events || []);
  }, []);

  const loadBlocks = useCallback(async () => {
    const data = await apiGetAdmin('/api/admin/blocks');
    setBlocks(data.blocks || []);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([loadBookings(), loadRegistrations(), loadEvents(), loadBlocks()]);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el panel');
    } finally {
      setLoading(false);
    }
  }, [loadBookings, loadRegistrations, loadEvents, loadBlocks]);

  useEffect(() => {
    if (!token) return;
    refresh();
  }, [token, refresh]);

  useEffect(() => {
    if (!token) return;
    loadBookings().catch((err) => setError(err.message));
  }, [token, loadBookings]);

  const stats = useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === 'confirmed');
    const cancelled = bookings.filter((b) => b.status === 'cancelled');
    const upcomingEvents = events.filter((e) => e.event_date >= new Date().toISOString().slice(0, 10));
    return {
      confirmed: confirmed.length,
      cancelled: cancelled.length,
      registrations: registrations.length,
      upcomingEvents: upcomingEvents.length,
    };
  }, [bookings, registrations, events]);

  if (!token) return <Navigate to="/admin/login" replace />;

  const logout = () => {
    clearAdminToken();
    window.location.href = '/admin/login';
  };

  const updateBooking = async (id, status) => {
    await apiPost('/api/admin/bookings', { id, status }, true);
    setMsg(status === 'confirmed' ? 'Reserva reactivada' : 'Reserva cancelada');
    loadBookings();
  };

  const deleteBooking = async (id) => {
    if (!confirm('¿Eliminar esta reserva permanentemente?')) return;
    await apiDelete('/api/admin/bookings', { id });
    setMsg('Reserva eliminada');
    loadBookings();
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
    loadEvents();
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
    loadBlocks();
  };

  return (
    <div className="admin-body">
      <header className="admin-header">
        <div className="container admin-header-inner">
          <Link to="/admin" className="logo">
            <span className="logo-mark" />
            <span>Espacio Calma</span>
          </Link>
          <div className="actions-inline admin-header-actions">
            <span className="admin-badge">Administrador</span>
            <Link to="/" className="btn btn-ghost btn-icon">
              Ver sitio
            </Link>
            <button type="button" className="btn btn-secondary btn-icon" onClick={logout}>
              Salir
            </button>
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
          {loading && <p className="admin-loading">Cargando datos…</p>}

          {tab === 'overview' && (
            <div className="admin-card">
              <h2>Resumen</h2>
              <p className="admin-lead">Vista rápida de reservas, inscripciones y eventos.</p>
              <div className="admin-stats">
                <div className="admin-stat">
                  <span className="admin-stat-value">{stats.confirmed}</span>
                  <span className="admin-stat-label">Reservas confirmadas {allBookings ? '(todas)' : `(mes ${month})`}</span>
                </div>
                <div className="admin-stat">
                  <span className="admin-stat-value">{stats.cancelled}</span>
                  <span className="admin-stat-label">Reservas canceladas</span>
                </div>
                <div className="admin-stat">
                  <span className="admin-stat-value">{stats.registrations}</span>
                  <span className="admin-stat-label">Inscripciones a eventos</span>
                </div>
                <div className="admin-stat">
                  <span className="admin-stat-value">{stats.upcomingEvents}</span>
                  <span className="admin-stat-label">Eventos con fecha futura</span>
                </div>
              </div>
              <div className="admin-overview-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setTab('bookings')}>
                  Ver reservas
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setTab('registrations')}>
                  Ver inscripciones
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
              <div className="admin-toolbar">
                <div className="form-group admin-toolbar-field">
                  <label htmlFor="filter-month">Filtrar por mes</label>
                  <input
                    type="month"
                    id="filter-month"
                    value={month}
                    disabled={allBookings}
                    onChange={(e) => setMonth(e.target.value)}
                  />
                </div>
                <label className="admin-check">
                  <input type="checkbox" checked={allBookings} onChange={(e) => setAllBookings(e.target.checked)} />
                  Ver todas las reservas
                </label>
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Persona</th>
                      <th>Contacto</th>
                      <th>Notas</th>
                      <th>Estado</th>
                      <th>Alta</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="admin-empty">
                          No hay reservas en este período.
                        </td>
                      </tr>
                    ) : (
                      bookings.map((b) => (
                        <tr key={b.id}>
                          <td>{fmtDate(b.booking_date)}</td>
                          <td>{b.booking_time}</td>
                          <td>{b.client_name}</td>
                          <td>
                            <a href={`mailto:${b.client_email}`}>{b.client_email}</a>
                            {b.client_phone ? (
                              <>
                                <br />
                                <a href={`tel:${b.client_phone}`}>{b.client_phone}</a>
                              </>
                            ) : null}
                          </td>
                          <td className="admin-notes">{b.notes || '—'}</td>
                          <td>
                            <span className={`badge badge-${b.status === 'confirmed' ? 'confirmed' : 'block'}`}>
                              {b.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                            </span>
                          </td>
                          <td className="admin-muted">{fmtDateTime(b.created_at)}</td>
                          <td className="actions-inline admin-row-actions">
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
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'registrations' && (
            <div className="admin-card">
              <h2>Inscripciones a eventos grupales</h2>
              <p className="admin-lead">Todas las personas inscriptas, con evento y contacto.</p>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Evento</th>
                      <th>Fecha</th>
                      <th>Horario</th>
                      <th>Participante</th>
                      <th>Contacto</th>
                      <th>Inscripto el</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="admin-empty">
                          Todavía no hay inscripciones.
                        </td>
                      </tr>
                    ) : (
                      registrations.map((r) => (
                        <tr key={r.id}>
                          <td>{r.event_title}</td>
                          <td>{fmtDate(r.event_date)}</td>
                          <td>
                            {r.start_time} – {r.end_time}
                          </td>
                          <td>{r.participant_name}</td>
                          <td>
                            <a href={`mailto:${r.participant_email}`}>{r.participant_email}</a>
                            {r.participant_phone ? (
                              <>
                                <br />
                                <a href={`tel:${r.participant_phone}`}>{r.participant_phone}</a>
                              </>
                            ) : null}
                          </td>
                          <td className="admin-muted">{fmtDateTime(r.created_at)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
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
                    <input name="event_date" type="date" required />
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

              <h3 className="admin-subtitle">Listado de eventos</h3>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Horario</th>
                      <th>Título</th>
                      <th>Inscriptos</th>
                      <th>Detalle inscriptos</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {events.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="admin-empty">
                          No hay eventos cargados.
                        </td>
                      </tr>
                    ) : (
                      events.map((ev) => (
                        <tr key={ev.id}>
                          <td>{fmtDate(ev.event_date)}</td>
                          <td>
                            {ev.start_time} – {ev.end_time}
                          </td>
                          <td>{ev.title}</td>
                          <td>
                            <strong>
                              {ev.registration_count ?? 0}/{ev.max_participants}
                            </strong>
                          </td>
                          <td className="admin-participants-cell">
                            {ev.participants?.length ? (
                              <ul className="admin-participant-list">
                                {ev.participants.map((p, i) => (
                                  <li key={`${ev.id}-${i}`}>
                                    <strong>{p.name}</strong>
                                    {p.email ? ` · ${p.email}` : ''}
                                    {p.phone ? ` · ${p.phone}` : ''}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-danger btn-icon"
                              onClick={async () => {
                                if (!confirm('¿Eliminar evento e inscripciones?')) return;
                                await apiDelete('/api/admin/events', { id: ev.id });
                                setMsg('Evento eliminado');
                                loadEvents();
                                loadRegistrations();
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

          {tab === 'blocks' && (
            <div className="admin-card">
              <h2>Bloquear horarios</h2>
              <p className="admin-lead">Impide reservas individuales en franjas puntuales (vacaciones, permisos, etc.).</p>
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
                                loadBlocks();
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
    </div>
  );
}
