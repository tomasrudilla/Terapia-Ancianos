import { withDb } from '../../lib/db.js';
import { verifyAdmin } from '../../lib/auth.js';
import { json } from '../../lib/http.js';

export default async function handler(req, res) {
  if (!(await verifyAdmin(req))) return json(res, 401, { error: 'No autorizado' });

  if (req.method !== 'GET') return json(res, 405, { error: 'Método no permitido' });

  try {
    const registrations = await withDb((sql) => sql`
      SELECT
        er.id,
        er.participant_name,
        er.participant_email,
        er.participant_phone,
        er.created_at,
        e.id AS event_id,
        e.title AS event_title,
        e.event_date,
        e.start_time,
        e.end_time
      FROM event_registrations er
      INNER JOIN events e ON e.id = er.event_id
      ORDER BY e.event_date DESC, e.start_time DESC, er.created_at DESC
      LIMIT 500
    `);
    return json(res, 200, { registrations });
  } catch (e) {
    console.error(e);
    return json(res, 500, { error: e.message || 'Error del servidor' });
  }
}
