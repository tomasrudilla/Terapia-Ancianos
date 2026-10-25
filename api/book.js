import { withDb } from '../lib/db.js';
import { json, readJson } from '../lib/http.js';
import { getAvailability } from '../lib/availability.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Método no permitido' });

  try {
    const body = await readJson(req);
    const date = String(body.date || '').trim();
    const time = String(body.time || '').trim();
    const client_name = String(body.client_name || '').trim();
    const client_email = String(body.client_email || '').trim();
    const client_phone = String(body.client_phone || '').trim();
    const notes = String(body.notes || '').trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
      return json(res, 400, { error: 'Fecha u hora inválida' });
    }
    if (!client_name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client_email)) {
      return json(res, 400, { error: 'Completá nombre y email válido' });
    }
    if (date < new Date().toISOString().slice(0, 10)) {
      return json(res, 400, { error: 'No se pueden reservar fechas pasadas' });
    }

    await withDb(async (sql) => {
      const available = await getAvailability(sql, date);
      if (!available.includes(time)) {
        json(res, 409, { error: 'Ese horario ya no está disponible' });
        return;
      }
      try {
        await sql`
          INSERT INTO bookings (booking_date, booking_time, client_name, client_email, client_phone, notes)
          VALUES (${date}, ${time}, ${client_name}, ${client_email}, ${client_phone || null}, ${notes || null})
        `;
      } catch {
        json(res, 409, { error: 'Ese horario acaba de ser reservado. Elegí otro.' });
        return;
      }
      json(res, 200, {
        ok: true,
        message: '¡Reserva confirmada! Te enviaremos un recordatorio por email.',
        booking: { date, time, name: client_name },
      });
    });
  } catch (e) {
    console.error(e);
    return json(res, 500, { error: e.message || 'Error del servidor' });
  }
}
