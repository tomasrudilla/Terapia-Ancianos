import { useCallback, useEffect, useState } from 'react';
import { MonthCalendar } from '../components/MonthCalendar';
import { EventCard } from '../components/EventCard';
import { apiGet, apiPost } from '../api';

function fmtDisplay(dateStr, timeStr) {
  const [y, m, day] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, day);
  const label = dt.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  return `${label} · ${timeStr} hs`;
}

export function Reservar() {
  const [view, setView] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [daysWithSlots, setDaysWithSlots] = useState(new Set());
  const [daysWithEvents, setDaysWithEvents] = useState(new Set());
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [form, setForm] = useState({ client_name: '', client_email: '', client_phone: '', notes: '' });
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const monthKey = `${view.getFullYear()}-${String(view.getMonth() + 1).padStart(2, '0')}`;

  const loadMonth = useCallback(async () => {
    const data = await apiGet(`/api/slots?month=${monthKey}`);
    setDaysWithSlots(new Set(data.days_with_slots || []));
    setDaysWithEvents(new Set(data.days_with_events || []));
  }, [monthKey]);

  useEffect(() => {
    loadMonth().catch(console.error);
  }, [loadMonth]);

  const selectDate = async (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedTime(null);
    setLoading(true);
    try {
      const data = await apiGet(`/api/slots?date=${dateStr}`);
      setSlots(data.slots || []);
      setEvents(data.events || []);
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;
    try {
      const data = await apiPost('/api/book', {
        date: selectedDate,
        time: selectedTime,
        ...form,
      });
      setAlert({ type: 'success', msg: data.message });
      setForm({ client_name: '', client_email: '', client_phone: '', notes: '' });
      setSelectedTime(null);
      await loadMonth();
      if (selectedDate) await selectDate(selectedDate);
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    }
  };

  return (
    <main>
      <div className="page-hero container">
        <h1>Reservar terapia individual</h1>
        <p>Elegí un día y horario disponible. La sesión dura 60 minutos.</p>
      </div>

      <div className="container booking-layout">
        <div className="calendar-panel">
          <MonthCalendar
            view={view}
            onPrev={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
            onNext={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
            daysWithSlots={daysWithSlots}
            daysWithEvents={daysWithEvents}
            selectedDate={selectedDate}
            onSelectDate={selectDate}
          />
          <p className="calendar-legend">
            <span className="legend-dot legend-slot" /> Turno individual
            <span className="legend-dot legend-event" /> Evento grupal (sin turno individual)
          </p>

          {events.length > 0 && (
            <div className="slots-section">
              <h3>Eventos grupales este día</h3>
              <div className="events-list">
                {events.map((ev) => (
                  <EventCard key={ev.id} event={ev} selectable={false} />
                ))}
              </div>
            </div>
          )}

          <div className="slots-section">
            <h3>Horarios para sesión individual</h3>
            {!selectedDate && <p className="empty-slots">Seleccioná una fecha en el calendario.</p>}
            {selectedDate && loading && <p className="empty-slots">Cargando…</p>}
            {selectedDate && !loading && slots.length === 0 && (
              <p className="empty-slots">
                {events.length > 0
                  ? 'No quedan turnos individuales libres este día (solo eventos grupales).'
                  : 'No hay horarios disponibles este día.'}
              </p>
            )}
            {slots.length > 0 && (
              <div className="slots-grid">
                {slots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    className={`slot-btn${selectedTime === time ? ' selected' : ''}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="form-panel">
          <h3>Tus datos</h3>
          {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
          <div className="form-summary">
            <strong>Fecha y hora</strong>
            <span>
              {selectedDate && selectedTime
                ? fmtDisplay(selectedDate, selectedTime)
                : 'Aún no elegiste horario'}
            </span>
          </div>
          <form onSubmit={submit}>
            <div className="form-group">
              <label htmlFor="client_name">Nombre completo *</label>
              <input
                id="client_name"
                required
                value={form.client_name}
                onChange={(e) => setForm({ ...form, client_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="client_email">Email *</label>
              <input
                id="client_email"
                type="email"
                required
                value={form.client_email}
                onChange={(e) => setForm({ ...form, client_email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="client_phone">Teléfono</label>
              <input
                id="client_phone"
                value={form.client_phone}
                onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="notes">Motivo o comentario (opcional)</label>
              <textarea
                id="notes"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={!selectedTime}>
              Confirmar reserva
            </button>
          </form>
        </aside>
      </div>
    </main>
  );
}
