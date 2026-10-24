import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { apiDelete, apiPost, clearAdminToken, getAdminToken } from '../api';

export function AdminDashboard() {
  const token = getAdminToken();
  const [tab, setTab] = useState('bookings');
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [msg, setMsg] = useState('');

  const authHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  const loadBookings = async () => {
    const [y, m] = month.split('-').map(Number);
    const last = new Date(y, m, 0).getDate();
    const from = `${month}-01`;
    const to = `${month}-${String(last).padStart(2, '0')}`;
    const res = await fetch(`/api/admin/bookings?from=${from}&to=${to}`, authHeaders());
    const data = await res.json();
    setBookings(data.bookings || []);
  };

  const loadEvents = async () => {
    const res = await fetch('/api/admin/events', authHeaders());
    const data = await res.json();
    setEvents(data.events || []);
  };

  const loadBlocks = async () => {
    const res = await fetch('/api/admin/blocks', authHeaders());
    const data = await res.json();
    setBlocks(data.blocks || []);
  };

  useEffect(() => {
    if (!token) return;
    loadBookings().catch(console.error);
    loadEvents().catch(console.error);
    loadBlocks().catch(console.error);
  }, [token, month]);

  if (!token) return <Navigate to="/admin/login" replace />;

  const logout = () => {
    clearAdminToken();
    window.location.href = '/admin/login';
  };

  const updateBooking = async (id, status) => {
    await apiPost('/api/admin/bookings', { id, status }, true);
    loadBookings();
  };

  const deleteBooking = async (id) => {
    if (!confirm('¿Eliminar esta reserva permanentemente?')) return;
    await apiDelete('/api/admin/bookings', { id });
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
        <div className="container">
          <Link to="/admin" className="logo">
            <span className="logo-mark" />
            <span>Espacio Calma</span>
          </Link>
          <div className="actions-inline">
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
            <button type="button" className={`tab-btn${tab === 'bookings' ? ' active' : ''}`} onClick={() => setTab('bookings')}>
              Reservas
            </button>
            <button type="button" className={`tab-btn${tab === 'events' ? ' active' : ''}`} onClick={() => setTab('events')}>
              Eventos
            </button>
            <button type="button" className={`tab-btn${tab === 'blocks' ? ' active' : ''}`} onClick={() => setTab('blocks')}>
              Bloquear horarios
            </button>
          </nav>
        </aside>

        <div className="admin-main">
          {msg && <div className="alert alert-success">{msg}</div>}

          {tab === 'bookings' && (
            <div className="admin-card">
              <h2>Reservas de terapia individual</h2>
              <div className="form-row" style={{ marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label htmlFor="filter-month">Mes</label>
                  <input type="month" id="filter-month" value={month} onChange={(e) => setMonth(e.target.value)} />
                </div>
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Paciente</th>
                      <th>Contacto</th>
                      <th>Estado</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id}>
                        <td>{b.booking_date}</td>
                        <td>{b.booking_time}</td>
                        <td>{b.client_name}</td>
                        <td>
                          {b.client_email}
                          {b.client_phone ? <br /> : null}
                          {b.client_phone}
                        </td>
                        <td>
                          <span className={`badge badge-${b.status === 'confirmed' ? 'confirmed' : 'block'}`}>
                            {b.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                          </span>
                        </td>
                        <td className="actions-inline">
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'events' && (
            <div className="admin-card">
              <h2>Eventos y talleres</h2>
              <form onSubmit={submitEvent}>
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
                  <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <label>
                      <input name="blocks_booking" type="checkbox" defaultChecked /> Bloquear turnos individuales
                    </label>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">
                  Guardar evento
                </button>
              </form>
              <h3 style={{ fontFamily: 'var(--font-display)', marginTop: '2rem' }}>Próximos eventos</h3>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Horario</th>
                      <th>Título</th>
                      <th>Inscriptos</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((ev) => (
                      <tr key={ev.id}>
                        <td>{ev.event_date}</td>
                        <td>
                          {ev.start_time} – {ev.end_time}
                        </td>
                        <td>{ev.title}</td>
                        <td>
                          {ev.registration_count != null ? (
                            <>
                              <strong>
                                {ev.registration_count}/{ev.max_participants}
                              </strong>
                              {ev.participants?.length ? (
                                <br />
                              ) : null}
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {ev.participants?.map((p) => p.name).join(', ')}
                              </span>
                            </>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-danger btn-icon"
                            onClick={async () => {
                              if (!confirm('¿Eliminar evento?')) return;
                              await apiDelete('/api/admin/events', { id: ev.id });
                              loadEvents();
                            }}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'blocks' && (
            <div className="admin-card">
              <h2>Bloquear horarios</h2>
              <form onSubmit={submitBlock}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha *</label>
                    <input name="block_date" type="date" required />
                  </div>
                  <div className="form-group">
                    <label>Motivo</label>
                    <input name="reason" />
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
              <h3 style={{ fontFamily: 'var(--font-display)', marginTop: '2rem' }}>Bloqueos activos</h3>
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
                    {blocks.map((bl) => (
                      <tr key={bl.id}>
                        <td>{bl.block_date}</td>
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
                              loadBlocks();
                            }}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
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
