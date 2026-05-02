import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ThemeImage from '../components/ThemeImage';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { downloadEventCalendar, shareEvent } from '../utils/actions';
import { eventDateTime, formatDate, formatTime, getSeatInfo } from '../utils/helpers';

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, currentUser, addBooking, pushToast } = useApp();
  const { categoryLabel, eventText, language, t } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [error, setError] = useState('');
  const [bookingResult, setBookingResult] = useState(null);

  const event = events.find((item) => item.id === id);
  const seatInfo = useMemo(() => (event ? getSeatInfo(event) : null), [event]);
  const canBook = currentUser?.role === 'attendee';
  const localizedEvent = event
    ? {
        ...event,
        title: eventText(event, 'title'),
        description: eventText(event, 'description'),
        longDescription: eventText(event, 'longDescription'),
        location: eventText(event, 'location'),
        language,
        at: t('at')
      }
    : null;

  if (!event) {
    return (
      <section className="shell page-section">
        <div className="empty-card">
          <h2>{t('eventNotAvailable')}</h2>
          <Link className="btn btn-primary" to="/">
            {t('backToEvents')}
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
      setError(t('onlyAttendeesReserve'));
      return;
    }
    if (!acceptPolicy) {
      setError(t('agreePolicyError'));
      return;
    }
    const result = addBooking(event.id, quantity);
    if (!result.ok) {
      const messages = {
        limit: t('limitReached'),
        capacity: t('eventFull'),
        auth: t('signInFirst'),
        approval: t('bookingNotOpen'),
        role: t('onlyAttendeesReserve')
      };
      setError(messages[result.reason] || t('bookingFailed'));
      return;
    }
    setError('');
    setBookingResult(result.booking);
  };

  const handleAddToCalendar = () => {
    downloadEventCalendar(localizedEvent);
    pushToast(t('calendarDownloaded'), 'success');
  };

  const handleShareEvent = async () => {
    try {
      const result = await shareEvent(localizedEvent);
      pushToast(result === 'shared' ? t('eventShared') : t('eventLinkCopied'), 'info');
    } catch {
      pushToast(t('sharingCancelled'), 'warning');
    }
  };

  return (
    <section className="shell page-section">
      <div className="detail-layout">
        <div className="detail-main card">
          <ThemeImage theme={event.coverTheme} title={eventText(event, 'title')} imageData={event.imageData} />
          <div className="detail-body">
            <div className="detail-title-row">
              <div>
                <h1>{eventText(event, 'title')}</h1>
                <p className="muted">{t('organizedBy')} {eventText(event, 'organizerName')}</p>
              </div>
              <span className="pill pill-soft">{categoryLabel(event.category)}</span>
            </div>
            <div className="detail-facts">
              <span>{formatDate(event.date, language)}</span>
              <span>{formatTime(event.time, language)}</span>
              <span>{eventText(event, 'location')}</span>
              <span>{seatInfo.available} {t('of')} {event.capacity} {t('seatsAvailable')}</span>
            </div>

            <div className="detail-section">
              <h3>{t('aboutThisEvent')}</h3>
              <p>{eventText(event, 'longDescription')}</p>
            </div>

            <div className="detail-section">
              <h3>{t('eventTags')}</h3>
              <div className="tag-row">
                {event.tags.map((tag) => (
                  <span key={tag} className="pill pill-muted">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="policy-box">
              <h3>{t('eventPolicy')}</h3>
              <p>{eventText(event, 'policy')}</p>
              <small>{t('registrationCloses')} {formatDate(event.registrationDeadline, language)}</small>
              <small>{t('cancellationDeadline')} {formatDate(event.cancellationDeadline, language)}</small>
            </div>
          </div>
        </div>

        <aside className="detail-sidebar card">
          {bookingResult ? (
            <div className="success-panel">
              <h3>{t('youreRegistered')}</h3>
              <button className="btn btn-primary wide" onClick={() => navigate(`/tickets/${bookingResult.id}`)}>
                {t('viewMyTicket')}
              </button>
            </div>
          ) : null}

          <div className="sidebar-block">
            <h3>{eventDateTime(event, language)}</h3>
            <p>{seatInfo.available} {t('seatsLeft')}</p>

            {canBook ? (
              <>
                <div className="qty-row">
                  <button onClick={() => setQuantity((value) => Math.max(value - 1, 1))}>-</button>
                  <strong>{quantity}</strong>
                  <button onClick={() => setQuantity((value) => Math.min(value + 1, event.perUserLimit))}>+</button>
                </div>
                <label className="checkbox-row">
                  <input type="checkbox" checked={acceptPolicy} onChange={(event) => setAcceptPolicy(event.target.checked)} />
                  <span>{t('agreePolicy')}</span>
                </label>
                <button className="btn btn-primary wide" onClick={handleBooking}>
                  {t('bookTicket')}
                </button>
              </>
            ) : (
              <div className="info-panel">
                {currentUser ? t('attendeeOnlyBooking') : t('signInToBook')}
              </div>
            )}

            {error && <div className="alert alert-danger">{error}</div>}
            <button className="btn btn-outline wide" onClick={handleAddToCalendar}>
              {t('addToCalendar')}
            </button>
            <button className="btn btn-outline wide" onClick={handleShareEvent}>
              {t('shareEvent')}
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
