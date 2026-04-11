import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import QRCodePlaceholder from '../components/QRCodePlaceholder';
import { useApp } from '../context/AppContext';
import { downloadEventCalendar, downloadTicket } from '../utils/actions';
import { formatDate, formatTime, getStatusTone, isPastEvent } from '../utils/helpers';

export function TicketsPage() {
  const { userBookings, events, cancelBooking } = useApp();
  const [tab, setTab] = useState('upcoming');

  const allMapped = useMemo(() => userBookings.map((booking) => ({ booking, event: events.find((item) => item.id === booking.eventId) })).filter((item) => item.event), [events, userBookings]);

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
      <h1>My Tickets</h1>
      <div className="tabs">
        <button className={tab === 'upcoming' ? 'active' : ''} onClick={() => setTab('upcoming')}>
          Upcoming ({counts.upcoming})
        </button>
        <button className={tab === 'past' ? 'active' : ''} onClick={() => setTab('past')}>
          Past ({counts.past})
        </button>
        <button className={tab === 'cancelled' ? 'active' : ''} onClick={() => setTab('cancelled')}>
          Cancelled ({counts.cancelled})
        </button>
      </div>

      {mapped.length === 0 ? (
        <div className="empty-card">
          <h3>No tickets found</h3>
          <p>You do not have any events in this tab.</p>
          <Link className="btn btn-primary" to="/">
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="tickets-grid">
          {mapped.map(({ booking, event }) => (
            <article key={booking.id} className="ticket-card">
              <div className={`ticket-preview ${event.coverTheme}`} />
              <div className="ticket-body">
                <h3>{event.title}</h3>
                <p>{formatDate(event.date)}</p>
                <p>{formatTime(event.time)}</p>
                <p>{event.location}</p>
                <div className="ticket-row">
                  <span>
                    {booking.quantity} {booking.quantity > 1 ? 'tickets' : 'ticket'}
                  </span>
                  <span className={`pill pill-${getStatusTone(booking.status)}`}>{booking.status}</span>
                </div>
                <div className="ticket-actions">
                  <Link className="btn btn-primary wide" to={`/tickets/${booking.id}`}>
                    View QR Code
                  </Link>
                  {booking.status === 'confirmed' && !isPastEvent(event) && (
                    <button className="btn btn-outline wide" onClick={() => cancelBooking(booking.id)}>
                      Cancel Ticket
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
  const booking = userBookings.find((item) => item.id === bookingId);
  const event = events.find((item) => item.id === booking?.eventId);

  if (!booking || !event) {
    return (
      <section className="shell page-section">
        <div className="empty-card">
          <h2>Ticket not found</h2>
          <button className="btn btn-primary" onClick={() => navigate('/tickets')}>
            Back to My Tickets
          </button>
        </div>
      </section>
    );
  }

  const attendeeLabel = currentUser?.name || 'Attendee';

  return (
    <section className="ticket-modal-shell">
      <div className="ticket-modal-card">
        <div className="ticket-modal-header">
          <h1>Your Ticket</h1>
          <button className="modal-close" onClick={() => navigate('/tickets')} aria-label="Close ticket view">
            ×
          </button>
        </div>

        <div className="ticket-modal-center">
          <h2>{event.title}</h2>
          <p>{new Date(`${event.date}T00:00:00`).toLocaleDateString('en-US')} at {formatTime(event.time)}</p>
          <p>{event.location}</p>
        </div>

        <div className="ticket-qr-panel">
          <QRCodePlaceholder value={booking.ticketCode} size={420} className="ticket-qr-large" />
        </div>

        <div className="ticket-code-box">{booking.ticketCode}</div>
        <p className="ticket-instruction">Present this QR code at the event entrance for check-in</p>

        <div className="ticket-modal-actions">
          <button
            className="btn btn-outline wide"
            onClick={() => {
              downloadTicket(booking, event, attendeeLabel);
              pushToast('Ticket downloaded.', 'success');
            }}
          >
            ⬇ Download Ticket
          </button>
          <button
            className="btn btn-outline wide"
            onClick={() => {
              downloadEventCalendar(event);
              pushToast('Calendar file downloaded.', 'success');
            }}
          >
            Add to Calendar
          </button>
          {booking.status === 'confirmed' && !isPastEvent(event) && (
            <button
              className="btn btn-primary wide"
              onClick={() => {
                cancelBooking(booking.id);
                navigate('/tickets');
              }}
            >
              Cancel Ticket
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
