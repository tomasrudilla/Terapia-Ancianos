import { TIMEZONE } from './config.js';

/** Fecha local YYYY-MM-DD en la zona horaria del sitio (Argentina). */
export function todayISOInTimezone() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}
