import { Link } from 'react-router-dom';
import ThemeImage from './ThemeImage';
import { eventDateTime, getSeatInfo } from '../utils/helpers';

export default function EventCard({ event, compact = false, showStatus = false }) {
  const seatInfo = getSeatInfo(event);

  return (
    <Link to={`/events/${event.id}`} className={`event-card event-card-link ${compact ? 'compact' : ''}`}>
      <ThemeImage theme={event.coverTheme} title={event.title} imageData={event.imageData} />
      <div className="event-card-body">
        <div className="event-card-head">
          <h3>{event.title}</h3>
          <span className="pill pill-soft">{event.category}</span>
        </div>
        <p>{event.description}</p>
        <ul className="event-meta-list">
          <li>{eventDateTime(event)}</li>
          <li>{event.location}</li>
          <li>
            {seatInfo.available} seats available
            {showStatus && <span className={`status-tag status-${event.status}`}>{event.status}</span>}
          </li>
        </ul>
        <div className="progress-line">
          <span style={{ width: `${seatInfo.percent}%` }} />
        </div>
        <div className="event-footer">
          <small>
            {event.registered} / {event.capacity} registered
          </small>
          <span className="card-link-text">View Details</span>
        </div>
      </div>
    </Link>
  );
}
