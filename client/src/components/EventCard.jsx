import { Link } from 'react-router-dom';

export function EventCard({ event, selectable, selected, onSelect }) {
  return (
    <article className={`event-card${event.is_full ? ' event-card-full' : ''}${selected ? ' event-card-selected' : ''}`}>
      <div className="event-card-head">
        <span className="badge badge-event">Grupal</span>
        <span className="event-time">
          {event.start_time} – {event.end_time} hs
        </span>
      </div>
      <h4 className="event-title">{event.title}</h4>
      {event.description ? <p className="event-desc">{event.description}</p> : null}
      <p className="event-meta">
        <strong>{event.registration_count}/{event.max_participants}</strong> personas inscriptas
      </p>
      {event.registration_count === 0 ? (
        <p className="event-participants-empty">Todavía no hay inscriptos. ¡Sé el primero!</p>
      ) : (
        <ul className="participant-list">
          {event.participants.map((p) => (
            <li key={p.name}>{p.name}</li>
          ))}
        </ul>
      )}
      <p className="event-block-note">En este horario no hay turnos individuales.</p>
      {selectable && !event.is_full && (
        <button type="button" className="btn btn-secondary btn-block event-select-btn" onClick={() => onSelect?.(event)}>
          Anotarme a este evento
        </button>
      )}
      {selectable && event.is_full && <p className="event-full-label">Cupos completos</p>}
      {!selectable && (
        <Link to={`/eventos?event=${event.id}`} className="btn btn-secondary btn-block">
          {event.is_full ? 'Ver evento (completo)' : 'Unirme a este evento'}
        </Link>
      )}
    </article>
  );
}
