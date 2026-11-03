import nodemailer from 'nodemailer';
import { APP_NAME } from './config.js';

const DEFAULT_NOTIFY = 'tomasrudilla@gmail.com';

function bookingNotifyEmail() {
  return (process.env.BOOKING_NOTIFY_EMAIL || DEFAULT_NOTIFY).trim();
}

function smtpConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function mailFromAddress() {
  if (process.env.MAIL_FROM) return process.env.MAIL_FROM;
  const user = process.env.SMTP_USER;
  if (user) return `${APP_NAME} <${user}>`;
  return APP_NAME;
}

let transporterPromise = null;

function getTransporter() {
  if (!smtpConfigured()) return null;
  if (!transporterPromise) {
    const port = Number(process.env.SMTP_PORT || 587);
    transporterPromise = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporterPromise;
}

export async function sendEmail({ to, subject, html, text }) {
  const transport = getTransporter();
  if (!transport) {
    console.warn('[mail] SMTP no configurado (SMTP_USER / SMTP_PASS); no se envió:', subject, '→', to);
    return { ok: false, skipped: true };
  }

  await transport.sendMail({
    from: mailFromAddress(),
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    text,
    html,
  });
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
