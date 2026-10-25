import { withDb } from '../lib/db.js';
import { json, readJson } from '../lib/http.js';
import { getEventById } from '../lib/events.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Método no permitido' });

  try {
    const body = await readJson(req);
    const eventId = Number(body.event_id);
    const participant_name = String(body.participant_name || '').trim();
    const participant_email = String(body.participant_email || '').trim();
    const participant_phone = String(body.participant_phone || '').trim();

    if (!eventId || !participant_name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participant_email)) {
      return json(res, 400, { error: 'Completá nombre, email y elegí un evento' });
    }

    await withDb(async (sql) => {
      const event = await getEventById(sql, eventId);
      if (!event) {
        json(res, 404, { error: 'Evento no encontrado' });
        return;
      }
      if (event.event_date < new Date().toISOString().slice(0, 10)) {
        json(res, 400, { error: 'Este evento ya finalizó' });
        return;
      }
      if (event.is_full) {
        json(res, 409, { error: 'El evento está completo' });
        return;
      }
      try {
        await sql`
          INSERT INTO event_registrations (event_id, participant_name, participant_email, participant_phone)
          VALUES (${eventId}, ${participant_name}, ${participant_email}, ${participant_phone || null})
        `;
      } catch {
        json(res, 409, { error: 'Ya estás inscripto con ese email en este evento' });
        return;
      }
      const updated = await getEventById(sql, eventId);
      json(res, 200, { ok: true, message: '¡Te anotaste al evento! Te esperamos.', event: updated });
    });
  } catch (e) {
    console.error(e);
    return json(res, 500, { error: e.message || 'Error del servidor' });
  }
}
