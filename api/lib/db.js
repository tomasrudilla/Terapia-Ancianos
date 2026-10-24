import { neon } from '@neondatabase/serverless';

let schemaReady = null;

export function getSql() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    throw new Error('DATABASE_URL no configurada (Neon)');
  }
  return neon(url);
}

export async function withDb(fn) {
  const sql = getSql();
  await ensureSchema(sql);
  return fn(sql);
}

async function ensureSchema(sql) {
  if (schemaReady) return schemaReady;

  schemaReady = (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        booking_date TEXT NOT NULL,
        booking_time TEXT NOT NULL,
        client_name TEXT NOT NULL,
        client_email TEXT NOT NULL,
        client_phone TEXT,
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'confirmed',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(booking_date, booking_time)
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        event_date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        event_type TEXT NOT NULL DEFAULT 'event',
        blocks_booking INTEGER NOT NULL DEFAULT 1,
        max_participants INTEGER NOT NULL DEFAULT 12,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS blocked_slots (
        id SERIAL PRIMARY KEY,
        block_date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        reason TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS event_registrations (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        participant_name TEXT NOT NULL,
        participant_email TEXT NOT NULL,
        participant_phone TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(event_id, participant_email)
      )
    `;

    const count = await sql`SELECT COUNT(*)::int AS c FROM events WHERE event_type = 'event'`;
    if (count[0].c === 0) {
      await seedDemoEvents(sql);
    }
  })();

  return schemaReady;
}

async function seedDemoEvents(sql) {
  const nextWed = new Date();
  nextWed.setDate(nextWed.getDate() + ((3 - nextWed.getDay() + 7) % 7 || 7));
  const nextFri = new Date();
  nextFri.setDate(nextFri.getDate() + ((5 - nextFri.getDay() + 7) % 7 || 7));
  const d1 = nextWed.toISOString().slice(0, 10);
  const d2 = nextFri.toISOString().slice(0, 10);

  const e1 = await sql`
    INSERT INTO events (title, description, event_date, start_time, end_time, event_type, blocks_booking, max_participants)
    VALUES (
      'Taller de memoria y relajación',
      'Ejercicios guiados de reminiscencia y respiración en un grupo reducido.',
      ${d1}, '10:00', '12:00', 'event', 1, 10
    )
    RETURNING id
  `;
  const e2 = await sql`
    INSERT INTO events (title, description, event_date, start_time, end_time, event_type, blocks_booking, max_participants)
    VALUES (
      'Encuentro grupal: vínculos y familia',
      'Espacio para compartir experiencias y estrategias de comunicación con seres queridos.',
      ${d2}, '15:00', '17:00', 'event', 1, 8
    )
    RETURNING id
  `;
  const id1 = e1[0].id;
  const id2 = e2[0].id;
  await sql`INSERT INTO event_registrations (event_id, participant_name, participant_email, participant_phone) VALUES
    (${id1}, 'María González', 'maria.demo@ejemplo.com', '11 5555-0101'),
    (${id1}, 'Roberto Sánchez', 'roberto.demo@ejemplo.com', NULL),
    (${id1}, 'Elena Ruiz', 'elena.demo@ejemplo.com', '11 5555-0103'),
    (${id2}, 'Jorge Pérez', 'jorge.demo@ejemplo.com', NULL),
    (${id2}, 'Ana Martínez', 'ana.demo@ejemplo.com', '11 5555-0202')`;
}
