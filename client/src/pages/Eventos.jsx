import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet, apiPost } from '../api';

function fmtEventDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function Eventos() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votingFor, setVotingFor] = useState(null);
  const [form, setForm] = useState({ voter_name: '', voter_email: '' });
  const [alert, setAlert] = useState(null);

  const loadPoll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet('/api/events?poll=1');
      setEvents(data.events || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPoll().catch(console.error);
  }, [loadPoll]);

  const openVote = (ev) => {
    setAlert(null);
    setVotingFor(ev);
  };

  const closeVote = () => {
    setVotingFor(null);
    setForm({ voter_name: '', voter_email: '' });
  };

  const submitVote = async (e) => {
    e.preventDefault();
    if (!votingFor) return;
    try {
      const data = await apiPost('/api/event-vote', {
        event_id: votingFor.id,
        ...form,
      });
      setAlert({ type: 'success', msg: data.message });
      closeVote();
      await loadPoll();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    }
  };

  const maxVotes = events.reduce((m, ev) => Math.max(m, ev.vote_count || 0), 0);

  return (
    <main>
      <div className="page-hero container">
        <h1>Eventos y talleres grupales</h1>
        <p>
          Estas son las propuestas cargadas en la agenda. Votá las que más te interesen para ayudarnos a priorizar
          fechas y encuentros.
        </p>
      </div>

      <div className="container events-poll-wrap">
        {alert && !votingFor && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
        {loading && <p className="events-poll-loading">Cargando propuestas…</p>}
        {!loading && events.length === 0 && (
          <div className="events-poll-empty" role="status">
            <div className="events-poll-notice">
              <span className="events-poll-notice-icon" aria-hidden="true">
                !
              </span>
              <p className="events-poll-notice-title">Atención</p>
              <p className="events-poll-notice-text">Todavía no hay eventos grupales publicados. Volvé pronto.</p>
            </div>
          </div>
        )}

        <ol className="events-poll-list">
          {events.map((ev, index) => {
            const pct = maxVotes > 0 ? Math.round((100 * (ev.vote_count || 0)) / maxVotes) : 0;
            return (
              <li key={ev.id} className="event-poll-card">
                <div className="event-poll-rank" aria-hidden="true">
                  {index + 1}
                </div>
                <div className="event-poll-body">
                  <div className="event-poll-head">
                    <span className="badge badge-event">Propuesta grupal</span>
                    <span className="event-poll-votes">
                      <strong>{ev.vote_count || 0}</strong> {ev.vote_count === 1 ? 'voto' : 'votos'}
                    </span>
                  </div>
                  <h2 className="event-poll-title">{ev.title}</h2>
                  {ev.description ? <p className="event-poll-desc">{ev.description}</p> : null}
                  <p className="event-poll-meta">
                    {fmtEventDate(ev.event_date)} · {ev.start_time} – {ev.end_time} hs
                  </p>
                  <div className="event-poll-bar" aria-hidden="true">
                    <span className="event-poll-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <button type="button" className="btn btn-primary" onClick={() => openVote(ev)}>
                    Me interesa — votar
                  </button>
                </div>
              </li>
            );
          })}
        </ol>

        <p className="panel-note events-poll-note">
          ¿Preferís atención uno a uno? <Link to="/reservar">Reservar sesión individual</Link>
        </p>
      </div>

      {votingFor && (
        <div className="admin-modal-overlay" role="presentation" onClick={closeVote}>
          <div
            className="admin-modal event-vote-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vote-modal-title"
            onClick={(ev) => ev.stopPropagation()}
          >
            <h3 id="vote-modal-title" className="admin-modal-title">
              Votar: {votingFor.title}
            </h3>
            <p className="admin-modal-text">
              {fmtEventDate(votingFor.event_date)} · {votingFor.start_time} – {votingFor.end_time} hs
            </p>
            {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
            <form onSubmit={submitVote} className="event-vote-form">
              <div className="form-group">
                <label htmlFor="voter_name">Nombre *</label>
                <input
                  id="voter_name"
                  required
                  value={form.voter_name}
                  onChange={(e) => setForm({ ...form, voter_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="voter_email">Email *</label>
                <input
                  id="voter_email"
                  type="email"
                  required
                  value={form.voter_email}
                  onChange={(e) => setForm({ ...form, voter_email: e.target.value })}
                />
              </div>
              <p className="admin-modal-text event-vote-hint">Un voto por evento y email. No es una inscripción definitiva.</p>
              <div className="admin-modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeVote}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirmar voto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
