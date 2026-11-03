import { withDb } from '../lib/db.js';
import { json, readJson } from '../lib/http.js';
import { addEventVote } from '../lib/events.js';
import { sendEventVoteEmails } from '../lib/mail.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Método no permitido' });

  try {
    const body = await readJson(req);
    const event_id = Number(body.event_id);
    const voter_name = String(body.voter_name || '').trim();
    const voter_email = String(body.voter_email || '').trim();

    if (!event_id || !voter_name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(voter_email)) {
      return json(res, 400, { error: 'Completá nombre, email y elegí un evento' });
    }

    const result = await withDb((sql) => addEventVote(sql, { event_id, voter_name, voter_email }));

    if (result.error === 'not_found') {
      return json(res, 404, { error: 'Evento no encontrado' });
    }
    if (result.error === 'duplicate') {
      return json(res, 409, { error: 'Ya registraste tu voto para este evento con ese email' });
    }

    try {
      await sendEventVoteEmails({
        voter_name,
        voter_email,
        event: result.event,
        vote_count: result.vote_count,
      });
    } catch (mailErr) {
      console.error('[event-vote] email', mailErr);
    }

    return json(res, 200, {
      ok: true,
      message: '¡Gracias! Tu voto quedó registrado. Te enviamos un correo de confirmación.',
      vote_count: result.vote_count,
    });
  } catch (e) {
    console.error(e);
    return json(res, 500, { error: e.message || 'Error del servidor' });
  }
}
