import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MonthCalendar } from '../components/MonthCalendar';
import { EventCard } from '../components/EventCard';
import { apiGet, apiPost } from '../api';

function fmtEventSummary(ev) {
  const [y, m, day] = ev.event_date.split('-').map(Number);
  const dt = new Date(y, m - 1, day);
  const label = dt.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  return `${ev.title} · ${label} · ${ev.start_time}–${ev.end_time} hs`;
}

export function Eventos() {
  const [params] = useSearchParams();
  const [view, setView] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [daysWithEvents, setDaysWithEvents] = useState(new Set());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form, setForm] = useState({ participant_name: '', participant_email: '', participant_phone: '' });
  const [alert, setAlert] = useState(null);

  const monthKey = `${view.getFullYear()}-${String(view.getMonth() + 1).padStart(2, '0')}`;

  const loadMonth = useCallback(async () => {
    const data = await apiGet(`/api/events?month=${monthKey}`);
    setDaysWithEvents(new Set(data.days_with_events || []));
  }, [monthKey]);

  useEffect(() => {
    loadMonth().catch(console.error);
  }, [loadMonth]);

  const selectDate = async (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedEvent(null);
    const data = await apiGet(`/api/events?date=${dateStr}`);
    setEvents(data.events || []);
  };

  useEffect(() => {
    const id = params.get('event');
    if (!id) return;
    (async () => {
      const data = await apiGet(`/api/events?id=${id}`);
      if (data.event) {
        const [y, m] = data.event.event_date.split('-').map(Number);
        setView(new Date(y, m - 1, 1));
        await selectDate(data.event.event_date);
        setSelectedEvent(data.event);
      }
    })().catch(console.error);
  }, [params]);

  const submit = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;
    try {
      const data = await apiPost('/api/event-register', {
        event_id: selectedEvent.id,
        ...form,
      });
      setAlert({ type: 'success', msg: data.message });
      setForm({ participant_name: '', participant_email: '', participant_phone: '' });
      setSelectedEvent(null);
      if (selectedDate) await selectDate(selectedDate);
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    }
  };

  return (
    <main>
      <div className="page-hero container">
        <h1>Eventos y talleres grupales</h1>
        <p>Elegí un día con actividad, mirá quién ya se anotó y sumate al encuentro.</p>
      </div>

      <div className="container booking-layout">
        <div className="calendar-panel">
          <MonthCalendar
            view={view}
            onPrev={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
            onNext={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
            daysWithEvents={daysWithEvents}
            selectedDate={selectedDate}
            onSelectDate={selectDate}
            eventsOnly
          />
          <p className="calendar-legend">
            <span className="legend-dot legend-event" /> Día con evento grupal
          </p>
          <div className="slots-section">
            <h3>Eventos del día</h3>
            {!selectedDate && <p className="empty-slots">Seleccioná una fecha marcada en el calendario.</p>}
            {selectedDate && events.length === 0 && <p className="empty-slots">No hay eventos este día.</p>}
            {events.length > 0 && (
              <div className="events-list">
                {events.map((ev) => (
                  <EventCard
                    key={ev.id}
                    event={ev}
                    selectable
                    selected={selectedEvent?.id === ev.id}
                    onSelect={setSelectedEvent}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="form-panel" id="signup-panel">
          <h3>Inscripción al evento</h3>
          {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
          <div className="form-summary">
            <strong>Evento</strong>
            <span>{selectedEvent ? fmtEventSummary(selectedEvent) : 'Elegí un evento de la lista'}</span>
          </div>
          <form onSubmit={submit}>
            <div className="form-group">
              <label htmlFor="participant_name">Nombre completo *</label>
              <input
                id="participant_name"
                required
                value={form.participant_name}
                onChange={(e) => setForm({ ...form, participant_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="participant_email">Email *</label>
              <input
                id="participant_email"
                type="email"
                required
                value={form.participant_email}
                onChange={(e) => setForm({ ...form, participant_email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="participant_phone">Teléfono</label>
              <input
                id="participant_phone"
                value={form.participant_phone}
                onChange={(e) => setForm({ ...form, participant_phone: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={!selectedEvent}>
              Confirmar inscripción
            </button>
          </form>
          <p className="panel-note">
            ¿Preferís atención uno a uno? <Link to="/reservar">Reservar sesión individual</Link>
          </p>
        </aside>
      </div>
    </main>
  );
}
