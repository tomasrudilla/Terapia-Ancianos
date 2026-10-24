import { withDb } from '../lib/db.js';
import { verifyAdmin } from '../lib/auth.js';
import { json, readJson } from '../lib/http.js';
import { enrichEvent } from '../lib/events.js';
import { timeToMinutes } from '../lib/availability.js';

export default async function handler(req, res) {
  if (!(await verifyAdmin(req))) return json(res, 401, { error: 'No autorizado' });

  try {
    if (req.method === 'GET') {
      const from = req.query?.from || new Date().toISOString().slice(0, 8) + '01';
      const to = req.query?.to || new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10);
      const rows = await withDb((sql) => sql`
        SELECT * FROM events WHERE event_date BETWEEN ${from} AND ${to}
        ORDER BY event_date, start_time
      `);
      const events = await withDb(async (sql) => {
        const out = [];
        for (const ev of rows) {
          out.push(ev.event_type === 'event' ? await enrichEvent(sql, ev) : ev);
        }
        return out;
      });
      return json(res, 200, { events });
    }

    const body = await readJson(req);

    if (req.method === 'POST') {
      const title = String(body.title || '').trim();
      const event_date = String(body.event_date || '').trim();
      const start_time = String(body.start_time || '').trim();
      const end_time = String(body.end_time || '').trim();
      const description = String(body.description || '').trim();
      const event_type = body.event_type || 'event';
      const blocks_booking = body.blocks_booking ? 1 : 0;
      const max_participants = Math.max(1, Number(body.max_participants) || 12);

      if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(event_date) || !/^\d{2}:\d{2}$/.test(start_time) || !/^\d{2}:\d{2}$/.test(end_time)) {
        return json(res, 400, { error: 'Completá título, fecha y horarios' });
      }
      if (timeToMinutes(end_time) <= timeToMinutes(start_time)) {
        return json(res, 400, { error: 'La hora de fin debe ser posterior al inicio' });
      }

      const inserted = await withDb((sql) => sql`
        INSERT INTO events (title, description, event_date, start_time, end_time, event_type, blocks_booking, max_participants)
        VALUES (${title}, ${description}, ${event_date}, ${start_time}, ${end_time}, ${event_type}, ${blocks_booking}, ${max_participants})
        RETURNING id
      `);
      return json(res, 200, { ok: true, id: inserted[0].id });
    }

    if (req.method === 'DELETE') {
      const id = Number(body.id || req.query?.id);
      if (!id) return json(res, 400, { error: 'ID inválido' });
      await withDb((sql) => sql`DELETE FROM events WHERE id = ${id}`);
      return json(res, 200, { ok: true });
    }

    return json(res, 405, { error: 'Método no permitido' });
  } catch (e) {
    console.error(e);
    return json(res, 500, { error: e.message || 'Error del servidor' });
  }
}
