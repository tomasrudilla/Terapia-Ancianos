import { withDb } from './lib/db.js';
import { json } from './lib/http.js';
import { getGroupEventsForDate, datesWithGroupEventsInMonth } from './lib/availability.js';
import { getEventById } from './lib/events.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Método no permitido' });

  try {
    const { month, date, id } = req.query || {};

    if (id) {
      const event = await withDb((sql) => getEventById(sql, Number(id)));
      if (!event) return json(res, 404, { error: 'Evento no encontrado' });
      return json(res, 200, { event });
    }

    if (date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json(res, 400, { error: 'Fecha inválida' });
      const events = await withDb((sql) => getGroupEventsForDate(sql, date));
      return json(res, 200, { date, events });
    }

    const m = month || new Date().toISOString().slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(m)) return json(res, 400, { error: 'Mes inválido' });
    const days_with_events = await withDb((sql) => datesWithGroupEventsInMonth(sql, m));
    return json(res, 200, { month: m, days_with_events });
  } catch (e) {
    console.error(e);
    return json(res, 500, { error: e.message || 'Error del servidor' });
  }
}
