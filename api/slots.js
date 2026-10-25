import { withDb } from '../lib/db.js';
import { json } from '../lib/http.js';
import { WORK_DAYS } from '../lib/config.js';
import {
  getAvailability,
  getDaysWithSlotsInMonth,
  getGroupEventsForDate,
  datesWithGroupEventsInMonth,
} from '../lib/availability.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Método no permitido' });

  try {
    const { month, date } = req.query || {};

    if (date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json(res, 400, { error: 'Fecha inválida' });
      const data = await withDb(async (sql) => ({
        date,
        slots: await getAvailability(sql, date),
        events: await getGroupEventsForDate(sql, date),
      }));
      return json(res, 200, data);
    }

    const m = month || new Date().toISOString().slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(m)) return json(res, 400, { error: 'Mes inválido' });

    const data = await withDb(async (sql) => ({
      month: m,
      days_with_slots: await getDaysWithSlotsInMonth(sql, m),
      days_with_events: await datesWithGroupEventsInMonth(sql, m),
      work_days: WORK_DAYS,
    }));
    return json(res, 200, data);
  } catch (e) {
    console.error(e);
    return json(res, 500, { error: e.message || 'Error del servidor' });
  }
}
