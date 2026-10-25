export async function enrichEvent(sql, event) {
  const registrations = await sql`
    SELECT participant_name, participant_email, participant_phone, created_at
    FROM event_registrations WHERE event_id = ${event.id} ORDER BY created_at
  `;
  const max = event.max_participants ?? 12;
  const count = registrations.length;
  return {
    id: event.id,
    title: event.title,
    description: event.description || '',
    event_date: event.event_date,
    start_time: event.start_time,
    end_time: event.end_time,
    blocks_booking: event.blocks_booking === 1,
    max_participants: max,
    registration_count: count,
    spots_left: Math.max(0, max - count),
    is_full: count >= max,
    participants: registrations.map((r) => ({ name: r.participant_name })),
  };
}

export async function getEventById(sql, id) {
  const rows = await sql`SELECT * FROM events WHERE id = ${id} AND event_type = 'event'`;
  if (!rows.length) return null;
  return enrichEvent(sql, rows[0]);
}
