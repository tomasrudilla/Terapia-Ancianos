import { withDb } from '../../lib/db.js';
import { verifyAdmin } from '../../lib/auth.js';
import { json } from '../../lib/http.js';

export default async function handler(req, res) {
  if (!(await verifyAdmin(req))) return json(res, 401, { error: 'No autorizado' });
  if (req.method !== 'GET') return json(res, 405, { error: 'Método no permitido' });

  try {
    const today = new Date().toISOString().slice(0, 10);
    const stats = await withDb(async (sql) => {
      const bookings = await sql`
        SELECT
          COUNT(*) FILTER (WHERE status = 'confirmed')::int AS confirmed,
          COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled
        FROM bookings
      `;
      const registrations = await sql`SELECT COUNT(*)::int AS total FROM event_registrations`;
      const upcomingEvents = await sql`
        SELECT COUNT(*)::int AS total FROM events WHERE event_date >= ${today}
      `;
      const blocks = await sql`SELECT COUNT(*)::int AS total FROM blocked_slots WHERE block_date >= ${today}`;
      return {
        bookings_confirmed: bookings[0]?.confirmed ?? 0,
        bookings_cancelled: bookings[0]?.cancelled ?? 0,
        registrations_total: registrations[0]?.total ?? 0,
        events_upcoming: upcomingEvents[0]?.total ?? 0,
        blocks_upcoming: blocks[0]?.total ?? 0,
      };
    });
    return json(res, 200, { stats });
  } catch (e) {
    console.error(e);
    return json(res, 500, { error: e.message || 'Error del servidor' });
  }
}
