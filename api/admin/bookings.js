import { withDb } from '../lib/db.js';
import { verifyAdmin } from '../lib/auth.js';
import { json, readJson } from '../lib/http.js';

export default async function handler(req, res) {
  if (!(await verifyAdmin(req))) return json(res, 401, { error: 'No autorizado' });

  try {
    if (req.method === 'GET') {
      const from = req.query?.from || new Date().toISOString().slice(0, 8) + '01';
      const to = req.query?.to || new Date().toISOString().slice(0, 10);
      const bookings = await withDb((sql) => sql`
        SELECT * FROM bookings WHERE booking_date BETWEEN ${from} AND ${to}
        ORDER BY booking_date, booking_time
      `);
      return json(res, 200, { bookings });
    }

    const body = await readJson(req);
    const id = Number(body.id);

    if (req.method === 'POST' || req.method === 'PATCH') {
      const status = body.status;
      if (!id || !['confirmed', 'cancelled'].includes(status)) {
        return json(res, 400, { error: 'Datos inválidos' });
      }
      await withDb((sql) => sql`UPDATE bookings SET status = ${status} WHERE id = ${id}`);
      return json(res, 200, { ok: true });
    }

    if (req.method === 'DELETE') {
      if (!id) return json(res, 400, { error: 'ID inválido' });
      await withDb((sql) => sql`DELETE FROM bookings WHERE id = ${id}`);
      return json(res, 200, { ok: true });
    }

    return json(res, 405, { error: 'Método no permitido' });
  } catch (e) {
    console.error(e);
    return json(res, 500, { error: e.message || 'Error del servidor' });
  }
}
