import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import QRCodePlaceholder from '../components/QRCodePlaceholder';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { downloadEventCalendar, downloadTicket } from '../utils/actions';
import { formatDate, formatTime, getStatusTone, isPastEvent } from '../utils/helpers';

export function TicketsPage() {
  const { userBookings, events, cancelBooking } = useApp();
  const { eventText, language, statusLabel, t } = useLanguage();
  const [tab, setTab] = useState('upcoming');

  const allMapped = useMemo(
    () => userBookings.map((booking) => ({ booking, event: events.find((item) => item.id === booking.eventId) })).filter((item) => item.event),
    [events, userBookings]
  );

  const mapped = useMemo(() => {
    return allMapped.filter(({ booking, event }) => {
      if (tab === 'cancelled') return booking.status === 'cancelled';
      if (tab === 'past') return booking.status === 'confirmed' && isPastEvent(event);
      return booking.status === 'confirmed' && !isPastEvent(event);
    });
  }, [allMapped, tab]);

  const counts = useMemo(() => ({
    upcoming: allMapped.filter(({ booking, event }) => booking.status === 'confirmed' && !isPastEvent(event)).length,
    past: allMapped.filter(({ booking, event }) => booking.status === 'confirmed' && isPastEvent(event)).length,
    cancelled: allMapped.filter(({ booking }) => booking.status === 'cancelled').length
  }), [allMapped]);

  return (
    <section className="shell page-section">
      <h1>{t('myTickets')}</h1>
      <div className="tabs">
        <button className={tab === 'upcoming' ? 'active' : ''} onClick={() => setTab('upcoming')}>
          {t('upcoming')} ({counts.upcoming})
        </button>
        <button className={tab === 'past' ? 'active' : ''} onClick={() => setTab('past')}>
          {t('past')} ({counts.past})
        </button>
        <button className={tab === 'cancelled' ? 'active' : ''} onClick={() => setTab('cancelled')}>
          {t('cancelled')} ({counts.cancelled})
        </button>
      </div>

      {mapped.length === 0 ? (
        <div className="empty-card">
          <h3>{t('noTicketsFound')}</h3>
          <p>{t('noTicketsHint')}</p>
          <Link className="btn btn-primary" to="/">
            {t('browseEvents')}
          </Link>
        </div>
      ) : (
        <div className="tickets-grid">
          {mapped.map(({ booking, event }) => (
            <article key={booking.id} className="ticket-card">
              <div className={`ticket-preview ${event.coverTheme}`} />
              <div className="ticket-body">
                <h3>{eventText(event, 'title')}</h3>
                <p>{formatDate(event.date, language)}</p>
                <p>{formatTime(event.time, language)}</p>
                <p>{eventText(event, 'location')}</p>
                <div className="ticket-row">
                  <span>
                    {booking.quantity} {booking.quantity > 1 ? t('tickets') : t('ticket')}
                  </span>
                  <span className={`pill pill-${getStatusTone(booking.status)}`}>{statusLabel(booking.status)}</span>
                </div>
                <div className="ticket-actions">
                  <Link className="btn btn-primary wide" to={`/tickets/${booking.id}`}>
                    {t('viewQrCode')}
                  </Link>
                  {booking.status === 'confirmed' && !isPastEvent(event) && (
                    <button className="btn btn-outline wide" onClick={() => cancelBooking(booking.id)}>
                      {t('cancelTicket')}
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function TicketDetailsPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { userBookings, events, currentUser, cancelBooking, pushToast } = useApp();
  const { eventText, language, t } = useLanguage();
  const booking = userBookings.find((item) => item.id === bookingId);
  const event = events.find((item) => item.id === booking?.eventId);

  if (!booking || !event) {
    return (
      <section className="shell page-section">
        <div className="empty-card">
          <h2>{t('ticketNotFound')}</h2>
          <button className="btn btn-primary" onClick={() => navigate('/tickets')}>
            {t('backToMyTickets')}
          </button>
        </div>
      </section>
    );
  }

  const attendeeLabel = currentUser?.name || t('attendee');
  const localizedEvent = {
    ...event,
    title: eventText(event, 'title'),
    description: eventText(event, 'description'),
    longDescription: eventText(event, 'longDescription'),
    location: eventText(event, 'location'),
    language,
    at: t('at')
  };

  return (
    <section className="ticket-modal-shell">
      <div className="ticket-modal-card">
        <div className="ticket-modal-header">
          <h1>{t('yourTicket')}</h1>
          <button className="modal-close" onClick={() => navigate('/tickets')} aria-label={t('closeTicketView')}>
            x
          </button>
        </div>

        <div className="ticket-modal-center">
          <h2>{eventText(event, 'title')}</h2>
          <p>{formatDate(event.date, language)} {t('at')} {formatTime(event.time, language)}</p>
          <p>{eventText(event, 'location')}</p>
        </div>

        <div className="ticket-qr-panel">
          <QRCodePlaceholder value={booking.ticketCode} size={420} className="ticket-qr-large" />
        </div>

        <div className="ticket-code-box">{booking.ticketCode}</div>
        <p className="ticket-instruction">{t('presentQr')}</p>

        <div className="ticket-modal-actions">
          <button
            className="btn btn-outline wide"
            onClick={() => {
              downloadTicket(booking, localizedEvent, attendeeLabel, {
                yourTicket: t('yourTicket'),
                presentQr: t('presentQr'),
                attendee: t('attendee'),
                date: t('date'),
                time: t('time'),
                location: t('location'),
                at: t('at'),
                language
              });
              pushToast(t('ticketDownloaded'), 'success');
            }}
          >
            {t('downloadTicket')}
          </button>
          <button
            className="btn btn-outline wide"
            onClick={() => {
              downloadEventCalendar(localizedEvent);
              pushToast(t('calendarDownloaded'), 'success');
            }}
          >
            {t('addToCalendar')}
          </button>
          {booking.status === 'confirmed' && !isPastEvent(event) && (
            <button
              className="btn btn-primary wide"
              onClick={() => {
                cancelBooking(booking.id);
                navigate('/tickets');
              }}
            >
              {t('cancelTicket')}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
