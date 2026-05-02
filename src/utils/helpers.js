export const getLocale = (language) => {
  if (language) return language === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-US';
  if (typeof document === 'undefined') return 'en-US';
  return document.documentElement.lang === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-US';
};

export const formatDate = (value, language) =>
  new Intl.DateTimeFormat(getLocale(language), {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value));

export const formatShortDate = (value, language) =>
  new Intl.DateTimeFormat(getLocale(language), {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value));

export const formatTime = (value, language) => {
  const [hours, minutes] = value.split(':');
  const date = new Date();
  date.setHours(Number(hours), Number(minutes));
  return new Intl.DateTimeFormat(getLocale(language), {
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
};

export const eventDateTime = (event, language) => `${formatDate(event.date, language)} / ${formatTime(event.time, language)}`;

export const getSeatInfo = (event) => {
  const available = Math.max(event.capacity - event.registered, 0);
  const percent = Math.min((event.registered / event.capacity) * 100, 100);
  return { available, percent };
};

export const getStatusTone = (status) => {
  const map = {
    approved: 'success',
    confirmed: 'success',
    pending: 'warning',
    draft: 'neutral',
    rejected: 'danger',
    cancelled: 'danger',
    checked_in: 'success',
    attendee: 'neutral',
    organizer: 'info',
    admin: 'purple'
  };
  return map[status] || 'neutral';
};

export const isPastEvent = (event) => new Date(`${event.date}T${event.time}:00`) < new Date('2026-04-10T19:00:00');

export const randomId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
