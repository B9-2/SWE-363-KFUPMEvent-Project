import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ThemeImage from '../components/ThemeImage';
import { useApp } from '../context/AppContext';
import { downloadEventCalendar, shareEvent } from '../utils/actions';
import { eventDateTime, formatDate, formatTime, getSeatInfo } from '../utils/helpers';

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, currentUser, addBooking, pushToast } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [error, setError] = useState('');
  const [bookingResult, setBookingResult] = useState(null);

  const event = events.find((item) => item.id === id);
  const seatInfo = useMemo(() => (event ? getSeatInfo(event) : null), [event]);
  const canBook = currentUser?.role === 'attendee';

  if (!event) {
    return (
      <section className="shell page-section">
        <div className="empty-card">
          <h2>Event not available</h2>
          <Link className="btn btn-primary" to="/">
            Back to Events
          </Link>
        </div>
      </section>
    );
  }

  const handleBooking = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (!canBook) {
      setError('Only attendee accounts can reserve tickets.');
      return;
    }
    if (!acceptPolicy) {
      setError('Please agree to the event rules and cancellation policy.');
      return;
    }
    const result = addBooking(event.id, quantity);
    if (!result.ok) {
      const messages = {
        limit: 'Per-user limit reached for this event.',
        capacity: 'This event is full.',
        auth: 'Please sign in first.',
        approval: 'Event is not open for booking yet.',
        role: 'Only attendee accounts can reserve tickets.'
      };
      setError(messages[result.reason] || 'Booking failed.');
      return;
    }
    setError('');
    setBookingResult(result.booking);
  };

  const handleAddToCalendar = () => {
    downloadEventCalendar(event);
    pushToast('Calendar file downloaded.', 'success');
  };

  const handleShareEvent = async () => {
    try {
      const result = await shareEvent(event);
      pushToast(result === 'shared' ? 'Event shared.' : 'Event link copied.', 'info');
    } catch {
      pushToast('Sharing was cancelled.', 'warning');
    }
  };

  return (
    <section className="shell page-section">
      <div className="detail-layout">
        <div className="detail-main card">
          <ThemeImage theme={event.coverTheme} title={event.title} imageData={event.imageData} />
          <div className="detail-body">
            <div className="detail-title-row">
              <div>
                <h1>{event.title}</h1>
                <p className="muted">Organized by {event.organizerName}</p>
              </div>
              <span className="pill pill-soft">{event.category}</span>
            </div>
            <div className="detail-facts">
              <span>{formatDate(event.date)}</span>
              <span>{formatTime(event.time)}</span>
              <span>{event.location}</span>
              <span>{seatInfo.available} of {event.capacity} seats available</span>
            </div>

            <div className="detail-section">
              <h3>About This Event</h3>
              <p>{event.longDescription}</p>
            </div>

            <div className="detail-section">
              <h3>Event Tags</h3>
              <div className="tag-row">
                {event.tags.map((tag) => (
                  <span key={tag} className="pill pill-muted">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="policy-box">
              <h3>Event Policy</h3>
              <p>{event.policy}</p>
              <small>Registration closes: {formatDate(event.registrationDeadline)}</small>
              <small>Cancellation deadline: {formatDate(event.cancellationDeadline)}</small>
            </div>
          </div>
        </div>

        <aside className="detail-sidebar card">
          {bookingResult ? (
            <div className="success-panel">
              <h3>You're registered!</h3>
              <button className="btn btn-primary wide" onClick={() => navigate(`/tickets/${bookingResult.id}`)}>
                View My Ticket
              </button>
            </div>
          ) : null}

          <div className="sidebar-block">
            <h3>{eventDateTime(event)}</h3>
            <p>{seatInfo.available} seats left</p>

            {canBook ? (
              <>
                <div className="qty-row">
                  <button onClick={() => setQuantity((value) => Math.max(value - 1, 1))}>−</button>
                  <strong>{quantity}</strong>
                  <button onClick={() => setQuantity((value) => Math.min(value + 1, event.perUserLimit))}>+</button>
                </div>
                <label className="checkbox-row">
                  <input type="checkbox" checked={acceptPolicy} onChange={(event) => setAcceptPolicy(event.target.checked)} />
                  <span>I agree to event rules and cancellation policy</span>
                </label>
                <button className="btn btn-primary wide" onClick={handleBooking}>
                  Book Ticket
                </button>
              </>
            ) : (
              <div className="info-panel">
                {currentUser ? 'Booking is available for attendee accounts only.' : 'Sign in with an attendee account to book this event.'}
              </div>
            )}

            {error && <div className="alert alert-danger">{error}</div>}
            <button className="btn btn-outline wide" onClick={handleAddToCalendar}>
              Add to Calendar
            </button>
            <button className="btn btn-outline wide" onClick={handleShareEvent}>
              Share Event
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
