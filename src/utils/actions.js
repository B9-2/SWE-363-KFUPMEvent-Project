import { formatDate, formatTime } from './helpers';


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
  const payload = {
    title: event.title,
    text: `${event.title} — ${formatDate(event.date)} at ${formatTime(event.time)} — ${event.location}`,
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
