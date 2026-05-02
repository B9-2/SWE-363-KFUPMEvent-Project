import { formatDate, formatTime } from './helpers';
import { qrDataUri } from './qr';

function downloadBlob(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toIcsDate(date, time) {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
  return utc.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

export function downloadEventCalendar(event) {
  const start = toIcsDate(event.date, event.time);
  const endDate = new Date(`${event.date}T${event.time}:00`);
  endDate.setHours(endDate.getHours() + 2);
  const end = endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//KFUPMEvents//CampusEvents//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@kfupmevents.local`,
    `DTSTAMP:${start}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title}`,
    `LOCATION:${event.location}`,
    `DESCRIPTION:${(event.longDescription || event.description || '').replace(/\n/g, '\\n')}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  downloadBlob(`${event.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'event'}.ics`, body, 'text/calendar');
}

export async function shareEvent(event) {
  const url = window.location.href;
  const language = event.language;
  const at = event.at || 'at';
  const payload = {
    title: event.title,
    text: `${event.title} - ${formatDate(event.date, language)} ${at} ${formatTime(event.time, language)} - ${event.location}`,
    url
  };

  if (navigator.share) {
    await navigator.share(payload);
    return 'shared';
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return 'copied';
  }

  window.prompt('Copy this event link:', url);
  return 'prompted';
}

export function downloadTicket(booking, event, attendeeLabel, labels = {}) {
  const text = {
    yourTicket: 'Your Ticket',
    presentQr: 'Present this QR code at the event entrance for check-in',
    attendee: 'Attendee',
    date: 'Date',
    time: 'Time',
    location: 'Location',
    at: 'at',
    language: undefined,
    ...labels
  };
  const qrUri = qrDataUri(booking.ticketCode, { moduleSize: 12, padding: 20 });
  const html = `<!DOCTYPE html>
  <html lang="${text.language === 'ar' ? 'ar' : 'en'}" dir="${text.language === 'ar' ? 'rtl' : 'ltr'}">
    <head>
      <meta charset="UTF-8" />
      <title>${escapeHtml(event.title)} Ticket</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; background: #f3f4f6; color: #101828; }
        .ticket { max-width: 760px; margin: 24px auto; background: #ffffff; border-radius: 32px; padding: 36px; box-shadow: 0 20px 50px rgba(16,24,40,.12); }
        h1 { margin: 0 0 24px; font-size: 52px; }
        .center { text-align: center; }
        .event-title { font-size: 34px; font-weight: 700; margin-bottom: 12px; }
        .meta { color: #475467; font-size: 20px; line-height: 1.6; }
        .qr-wrap { background: #f8fafc; border-radius: 28px; padding: 28px; margin: 36px 0; text-align: center; }
        .code { background: #eef4ff; border: 1px solid #b2ccff; color: #23479a; font-size: 22px; font-weight: 600; padding: 22px; border-radius: 22px; text-align: center; }
        .hint { color: #475467; text-align: center; margin: 28px 0; font-size: 18px; }
        .info { display: grid; gap: 10px; color: #344054; font-size: 18px; }
      </style>
    </head>
    <body>
      <div class="ticket">
        <h1>${escapeHtml(text.yourTicket)}</h1>
        <div class="center">
          <div class="event-title">${escapeHtml(event.title)}</div>
          <div class="meta">${escapeHtml(`${formatDate(event.date, text.language)} ${text.at} ${formatTime(event.time, text.language)}`)}</div>
          <div class="meta">${escapeHtml(event.location)}</div>
        </div>
        <div class="qr-wrap">
          <img src="${qrUri}" width="390" height="390" alt="QR code" />
        </div>
        <div class="code">${escapeHtml(booking.ticketCode)}</div>
        <p class="hint">${escapeHtml(text.presentQr)}</p>
        <div class="info">
          <div><strong>${escapeHtml(text.attendee)}:</strong> ${escapeHtml(attendeeLabel)}</div>
          <div><strong>${escapeHtml(text.date)}:</strong> ${escapeHtml(formatDate(event.date, text.language))}</div>
          <div><strong>${escapeHtml(text.time)}:</strong> ${escapeHtml(formatTime(event.time, text.language))}</div>
          <div><strong>${escapeHtml(text.location)}:</strong> ${escapeHtml(event.location)}</div>
        </div>
      </div>
    </body>
  </html>`;

  downloadBlob(`${booking.ticketCode}.html`, html, 'text/html');
}
