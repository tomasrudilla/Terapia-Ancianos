import { WORK_DAYS, WORK_START, WORK_END, SLOT_MINUTES } from './config.js';
import { enrichEvent } from './events.js';

function todayLocalISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function generateDaySlots(date) {
  const d = new Date(`${date}T12:00:00`);
  const dow = d.getDay() === 0 ? 7 : d.getDay();
  if (!WORK_DAYS.includes(dow)) return [];
  const start = timeToMinutes(WORK_START);
  const end = timeToMinutes(WORK_END);
  const slots = [];
  for (let t = start; t + SLOT_MINUTES <= end; t += SLOT_MINUTES) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
  return slots;
}

function slotOverlaps(slotTime, slotMinutes, start, end) {
  const s = timeToMinutes(slotTime);
  const e = s + slotMinutes;
  const bs = timeToMinutes(start);
  const be = timeToMinutes(end);
  return s < be && e > bs;
}

export async function getAvailability(sql, date) {
  const slots = generateDaySlots(date);
  if (!slots.length) return [];

  const booked = await sql`
    SELECT booking_time FROM bookings
    WHERE booking_date = ${date} AND status != 'cancelled'
  `;
  const bookedSet = new Set(booked.map((r) => r.booking_time));

  const blocks = await sql`SELECT start_time, end_time FROM blocked_slots WHERE block_date = ${date}`;
  const events = await sql`
    SELECT start_time, end_time FROM events
    WHERE event_date = ${date} AND blocks_booking = 1
  `;

  return slots.filter((slot) => {
    if (bookedSet.has(slot)) return false;
    for (const row of [...blocks, ...events]) {
      if (slotOverlaps(slot, SLOT_MINUTES, row.start_time, row.end_time)) return false;
    }
    return true;
  });
}

export async function getDaysWithSlotsInMonth(sql, month) {
  if (!/^\d{4}-\d{2}$/.test(month)) return [];
  const [y, m] = month.split('-').map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const today = todayLocalISO();
  const days = [];
  for (let d = 1; d <= lastDay; d++) {
    const dayStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (dayStr < today) continue;
    const avail = await getAvailability(sql, dayStr);
    if (avail.length) days.push(dayStr);
  }
  return days;
}

export async function getGroupEventsForDate(sql, date) {
  const rows = await sql`
    SELECT * FROM events WHERE event_date = ${date} AND event_type = 'event' ORDER BY start_time
  `;
  return Promise.all(rows.map((e) => enrichEvent(sql, e)));
}

export async function datesWithGroupEventsInMonth(sql, month) {
  if (!/^\d{4}-\d{2}$/.test(month)) return [];
  const [y, m] = month.split('-').map(Number);
  const from = `${y}-${String(m).padStart(2, '0')}-01`;
  const to = `${y}-${String(m).padStart(2, '0')}-${String(new Date(y, m, 0).getDate()).padStart(2, '0')}`;
  const today = todayLocalISO();
  const rows = await sql`
    SELECT DISTINCT event_date FROM events
    WHERE event_type = 'event' AND event_date BETWEEN ${from} AND ${to} AND event_date >= ${today}
    ORDER BY event_date
  `;
  return rows.map((r) => r.event_date);
}
