import { Link } from 'react-router-dom';
import ThemeImage from './ThemeImage';
import { useLanguage } from '../context/LanguageContext';
import { eventDateTime, getSeatInfo } from '../utils/helpers';

export default function EventCard({ event, compact = false, showStatus = false }) {
  const { categoryLabel, eventText, language, statusLabel, t } = useLanguage();
  const seatInfo = getSeatInfo(event);

  return (
    <Link to={`/events/${event.id}`} className={`event-card event-card-link ${compact ? 'compact' : ''}`}>
      <ThemeImage theme={event.coverTheme} title={eventText(event, 'title')} imageData={event.imageData} />
      <div className="event-card-body">
        <div className="event-card-head">
          <h3>{eventText(event, 'title')}</h3>
          <span className="pill pill-soft">{categoryLabel(event.category)}</span>
        </div>
        <p>{eventText(event, 'description')}</p>
        <ul className="event-meta-list">
          <li>{eventDateTime(event, language)}</li>
          <li>{eventText(event, 'location')}</li>
          <li>
            {seatInfo.available} {t('seatsAvailable')}
            {showStatus && <span className={`status-tag status-${event.status}`}>{statusLabel(event.status)}</span>}
          </li>
        </ul>
        <div className="progress-line">
          <span style={{ width: `${seatInfo.percent}%` }} />
        </div>
        <div className="event-footer">
          <small>
            {event.registered} / {event.capacity} {t('registered')}
          </small>
          <span className="card-link-text">{t('viewDetails')}</span>
        </div>
      </div>
    </Link>
  );
}
