import { withDb } from '../../lib/db.js';
import { verifyAdmin } from '../../lib/auth.js';
import { json, readJson } from '../../lib/http.js';
import { timeToMinutes } from '../../lib/availability.js';

export default async function handler(req, res) {
  if (!(await verifyAdmin(req))) return json(res, 401, { error: 'No autorizado' });

  try {
    if (req.method === 'GET') {
      const from = req.query?.from || new Date().toISOString().slice(0, 8) + '01';
      const to = req.query?.to || new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10);
      const blocks = await withDb((sql) => sql`
        SELECT * FROM blocked_slots WHERE block_date BETWEEN ${from} AND ${to}
        ORDER BY block_date, start_time
      `);
      return json(res, 200, { blocks });
    }

    const body = await readJson(req);

    if (req.method === 'POST') {
      const block_date = String(body.block_date || '').trim();
      const start_time = String(body.start_time || '').trim();
      const end_time = String(body.end_time || '').trim();
      const reason = String(body.reason || '').trim();

      if (!/^\d{4}-\d{2}-\d{2}$/.test(block_date) || !/^\d{2}:\d{2}$/.test(start_time) || !/^\d{2}:\d{2}$/.test(end_time)) {
        return json(res, 400, { error: 'Fecha u horarios inválidos' });
      }
      if (timeToMinutes(end_time) <= timeToMinutes(start_time)) {
        return json(res, 400, { error: 'La hora de fin debe ser posterior al inicio' });
      }

      const inserted = await withDb((sql) => sql`
        INSERT INTO blocked_slots (block_date, start_time, end_time, reason)
        VALUES (${block_date}, ${start_time}, ${end_time}, ${reason || null})
        RETURNING id
      `);
      return json(res, 200, { ok: true, id: inserted[0].id });
    }

    if (req.method === 'DELETE') {
      const id = Number(body.id || req.query?.id);
      if (!id) return json(res, 400, { error: 'ID inválido' });
      await withDb((sql) => sql`DELETE FROM blocked_slots WHERE id = ${id}`);
      return json(res, 200, { ok: true });
    }

    return json(res, 405, { error: 'Método no permitido' });
  } catch (e) {
    console.error(e);
    return json(res, 500, { error: e.message || 'Error del servidor' });
  }
}
