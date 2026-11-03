import { APP_NAME } from './config.js';

const DEFAULT_NOTIFY = 'tomasrudilla@gmail.com';

function bookingNotifyEmail() {
  return (process.env.BOOKING_NOTIFY_EMAIL || DEFAULT_NOTIFY).trim();
}

function mailFrom() {
  return process.env.MAIL_FROM || `${APP_NAME} <onboarding@resend.dev>`;
}

export async function sendEmail({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[mail] RESEND_API_KEY no configurada; no se envió:', subject, '→', to);
    return { ok: false, skipped: true };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: mailFrom(),
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend ${res.status}: ${body}`);
  }
  return { ok: true };
}

function fmtBookingDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export async function sendBookingConfirmationEmails(booking) {
  const { booking_date, booking_time, client_name, client_email, client_phone, notes } = booking;
  const dateLabel = fmtBookingDate(booking_date);
  const phoneLine = client_phone ? `\nTeléfono: ${client_phone}` : '';
  const notesLine = notes ? `\nNotas: ${notes}` : '';

  const clientText = `Hola ${client_name},

Tu reserva en ${APP_NAME} quedó confirmada.

Fecha: ${dateLabel}
Horario: ${booking_time} hs

Si necesitás reprogramar, respondé a este correo o contactanos por WhatsApp.

Gracias,
${APP_NAME}`;

  const clientHtml = clientText.replace(/\n/g, '<br>');

  const adminText = `Nueva reserva de sesión individual en ${APP_NAME}.

Cliente: ${client_name}
Email: ${client_email}${phoneLine}
Fecha: ${dateLabel}
Horario: ${booking_time} hs${notesLine}`;

  const adminHtml = adminText.replace(/\n/g, '<br>');

  await sendEmail({
    to: client_email,
    subject: `Reserva confirmada — ${APP_NAME}`,
    text: clientText,
    html: clientHtml,
  });

  await sendEmail({
    to: bookingNotifyEmail(),
    subject: `Nueva reserva: ${client_name} (${booking_date} ${booking_time})`,
    text: adminText,
    html: adminHtml,
  });
}
