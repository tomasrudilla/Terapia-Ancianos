function mapPublicParticipants(registrations) {
  return registrations.map((r) => ({ name: r.participant_name }));
}

function mapAdminParticipants(registrations) {
  return registrations.map((r) => ({
    name: r.participant_name,
    email: r.participant_email,
    phone: r.participant_phone || '',
    created_at: r.created_at,
  }));
}

async function loadRegistrations(sql, eventId) {
  return sql`
    SELECT participant_name, participant_email, participant_phone, created_at
    FROM event_registrations WHERE event_id = ${eventId} ORDER BY created_at
  `;
}

async function loadVotes(sql, eventId) {
  return sql`
    SELECT voter_name, voter_email, created_at
    FROM event_votes WHERE event_id = ${eventId} ORDER BY created_at
  `;
}

async function countVotes(sql, eventId) {
  const rows = await sql`SELECT COUNT(*)::int AS c FROM event_votes WHERE event_id = ${eventId}`;
  return rows[0]?.c ?? 0;
}

function mapAdminVoters(votes) {
  return votes.map((v) => ({
    name: v.voter_name,
    email: v.voter_email,
    created_at: v.created_at,
  }));
}

export async function listEventsForPoll(sql) {
  const today = new Date().toISOString().slice(0, 10);
  const rows = await sql`
    SELECT e.*, COUNT(v.id)::int AS vote_count
    FROM events e
    LEFT JOIN event_votes v ON v.event_id = e.id
    WHERE e.event_type = 'event' AND e.event_date >= ${today}
    GROUP BY e.id
    ORDER BY vote_count DESC, e.event_date ASC, e.start_time ASC
  `;
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description || '',
    event_date: row.event_date,
    start_time: row.start_time,
    end_time: row.end_time,
    max_participants: row.max_participants ?? 12,
    vote_count: row.vote_count ?? 0,
  }));
}

export async function addEventVote(sql, { event_id, voter_name, voter_email }) {
  const ev = await sql`
    SELECT id, title, description, event_date, start_time, end_time
    FROM events WHERE id = ${event_id} AND event_type = 'event' LIMIT 1
  `;
  if (!ev.length) return { error: 'not_found' };
  const event = ev[0];

  try {
    await sql`
      INSERT INTO event_votes (event_id, voter_name, voter_email)
      VALUES (${event_id}, ${voter_name}, ${voter_email})
    `;
  } catch (e) {
    if (String(e?.message || e).includes('unique') || e?.code === '23505') {
      return { error: 'duplicate' };
    }
    throw e;
  }

  const vote_count = await countVotes(sql, event_id);
  return {
    ok: true,
    vote_count,
    event: {
      title: event.title,
      description: event.description || '',
      event_date: event.event_date,
      start_time: event.start_time,
      end_time: event.end_time,
    },
  };
}

export async function enrichEvent(sql, event) {
  const registrations = await loadRegistrations(sql, event.id);
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
    participants: mapPublicParticipants(registrations),
  };
}

export async function enrichEventAdmin(sql, event) {
  const registrations = await loadRegistrations(sql, event.id);
  const votes = await loadVotes(sql, event.id);
  const max = event.max_participants ?? 12;
  const count = registrations.length;
  const vote_count = votes.length;
  return {
    ...event,
    blocks_booking: event.blocks_booking === 1,
    max_participants: max,
    registration_count: count,
    vote_count,
    spots_left: Math.max(0, max - count),
    is_full: count >= max,
    participants: mapAdminParticipants(registrations),
    voters: mapAdminVoters(votes),
  };
}

export async function getEventById(sql, id) {
  const rows = await sql`SELECT * FROM events WHERE id = ${id} AND event_type = 'event'`;
  if (!rows.length) return null;
  return enrichEvent(sql, rows[0]);
}
