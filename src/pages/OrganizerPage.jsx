import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { formatDate, formatTime, getStatusTone } from '../utils/helpers';

const coverThemes = [
  ['theme-ai', 'technology'],
  ['theme-career', 'career'],
  ['theme-cultural', 'cultural'],
  ['theme-startup', 'competition'],
  ['theme-sports', 'sports'],
  ['theme-environment', 'seminar']
];

export function OrganizerDashboardPage() {
  const { organizerEvents, analytics, submitEventForApproval } = useApp();
  const { categoryLabel, eventText, language, statusLabel, t } = useLanguage();

  return (
    <section className="shell page-section">
      <h1>{t('organizerDashboard')}</h1>
      <p className="muted strong">{t('organizerDashboardSubtitle')}</p>

      <div className="stats-grid four-col">
        <StatCard label={t('activeEvents')} value={organizerEvents.filter((event) => event.status === 'approved').length} />
        <StatCard label={t('pendingApproval')} value={analytics.organizerPending} tone="warning" />
        <StatCard label={t('totalRegistrations')} value={analytics.organizerRegistrations} tone="info" />
        <StatCard label={t('drafts')} value={analytics.organizerDrafts} tone="neutral" />
      </div>

      <div className="action-row">
        <Link className="btn btn-primary" to="/organizer/events/new">
          + {t('createNewEvent')}
        </Link>
        <Link className="btn btn-outline" to="/organizer/scanner">
          {t('scanTickets')}
        </Link>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h2>{t('myEvents')}</h2>
        </div>
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>{t('event')}</th>
                <th>{t('date')}</th>
                <th>{t('status')}</th>
                <th>{t('registrations')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {organizerEvents.map((event) => (
                <tr key={event.id}>
                  <td>
                    <strong>{eventText(event, 'title')}</strong>
                    <div className="subtext">{categoryLabel(event.category)}</div>
                  </td>
                  <td>{formatDate(event.date, language)}</td>
                  <td>
                    <span className={`pill pill-${getStatusTone(event.status)}`}>{statusLabel(event.status)}</span>
                  </td>
                  <td>
                    {event.registered} / {event.capacity}
                  </td>
                  <td>
                    <div className="action-row compact-row">
                      <Link className="btn btn-outline small" to={`/events/${event.id}`}>
                        {t('view')}
                      </Link>
                      {event.status !== 'approved' && (
                        <Link className="btn btn-outline small" to={`/organizer/events/${event.id}/edit`}>
                          {t('edit')}
                        </Link>
                      )}
                      {event.status === 'draft' && (
                        <button className="btn btn-outline small" onClick={() => submitEventForApproval(event.id)}>
                          {t('submit')}
                        </button>
                      )}
                      <Link className="btn btn-outline small" to={`/organizer/registrations/${event.id}`}>
                        {t('registrations')}
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function OrganizerEventFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { categories, events, saveEventDraft, submitEventForApproval } = useApp();
  const { categoryLabel, language, t } = useLanguage();
  const existing = events.find((event) => event.id === id);
  const [error, setError] = useState('');

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(
    existing || {
      title: '',
      category: 'Workshop',
      description: '',
      longDescription: '',
      location: '',
      date: '2026-04-25',
      time: '12:00',
      capacity: 50,
      perUserLimit: 1,
      visibility: 'university',
      tags: 'Workshop, Campus',
      policy: '',
      mode: 'Offline',
      priceType: 'Free',
      coverTheme: 'theme-ai',
      imageData: ''
    }
  );

  const steps = [t('basicInfo'), t('schedule'), t('tickets'), t('review')];

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError(t('imageFileError'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      update('imageData', reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const validateStep = (targetStep = step) => {
    if (targetStep === 1) {
      if (!form.title.trim() || !form.description.trim() || !form.longDescription.trim()) {
        setError(t('completeBasicInfo'));
        return false;
      }
    }
    if (targetStep === 2) {
      if (!form.location.trim() || !form.date || !form.time) {
        setError(t('completeSchedule'));
        return false;
      }
    }
    if (targetStep === 3) {
      if (Number(form.capacity) < 1 || Number(form.perUserLimit) < 1 || !form.policy.trim()) {
        setError(t('completeTicketPolicy'));
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleSave = () => {
    if (!validateStep(Math.min(step, 3))) return;
    const eventId = saveEventDraft(form, existing?.id);
    navigate(`/organizer/events/${eventId}/edit`);
  };

  return (
    <section className="shell page-section">
      <div className="card form-card">
        <h1>{existing ? t('editEvent') : t('createNewEvent')}</h1>
        <div className="stepper">
          {steps.map((item, index) => (
            <button key={item} className={step === index + 1 ? 'active' : ''} onClick={() => setStep(index + 1)}>
              {index + 1}. {item}
            </button>
          ))}
        </div>

        {step === 1 && (
          <div className="form-grid two-col">
            <label>
              {t('eventTitle')}*
              <input required value={form.title} onChange={(event) => update('title', event.target.value)} />
            </label>
            <label>
              {t('category')}*
              <select value={form.category} onChange={(event) => update('category', event.target.value)}>
                {categories.map((item) => (
                  <option key={item} value={item}>{categoryLabel(item)}</option>
                ))}
              </select>
            </label>
            <label className="full-span">
              {t('shortDescription')}*
              <textarea rows="3" required value={form.description} onChange={(event) => update('description', event.target.value)} />
            </label>
            <label className="full-span">
              {t('longDescription')}*
              <textarea rows="5" required value={form.longDescription} onChange={(event) => update('longDescription', event.target.value)} />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="form-grid two-col">
            <label>
              {t('date')}*
              <input type="date" required value={form.date} onChange={(event) => update('date', event.target.value)} />
            </label>
            <label>
              {t('time')}*
              <input type="time" required value={form.time} onChange={(event) => update('time', event.target.value)} />
            </label>
            <label className="full-span">
              {t('location')}*
              <input required value={form.location} onChange={(event) => update('location', event.target.value)} placeholder={t('locationPlaceholder')} />
            </label>
            <label>
              {t('visibility')}
              <select value={form.visibility} onChange={(event) => update('visibility', event.target.value)}>
                <option value="university">{t('university')}</option>
                <option value="public">{t('public')}</option>
              </select>
            </label>
            <label>
              {t('eventMode')}
              <select value={form.mode} onChange={(event) => update('mode', event.target.value)}>
                <option value="Offline">{t('offline')}</option>
                <option value="Online">{t('online')}</option>
                <option value="Hybrid">{t('hybrid')}</option>
              </select>
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="form-grid two-col">
            <label>
              {t('capacity')}*
              <input type="number" min="1" required value={form.capacity} onChange={(event) => update('capacity', Number(event.target.value))} />
            </label>
            <label>
              {t('perUserLimit')}
              <input type="number" min="1" required value={form.perUserLimit} onChange={(event) => update('perUserLimit', Number(event.target.value))} />
            </label>
            <label>
              {t('priceType')}
              <select value={form.priceType} onChange={(event) => update('priceType', event.target.value)}>
                <option value="Free">{t('free')}</option>
                <option value="Paid">{t('paid')}</option>
              </select>
            </label>
            <label>
              {t('coverTheme')}
              <select value={form.coverTheme} onChange={(event) => update('coverTheme', event.target.value)}>
                {coverThemes.map(([value, labelKey]) => (
                  <option key={value} value={value}>{t(labelKey)}</option>
                ))}
              </select>
            </label>
            <label>
              {t('eventPicture')}
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              <small className="subtext">{t('uploadCoverHint')}</small>
            </label>
            {form.imageData && (
              <div className="full-span image-upload-preview">
                <img src={form.imageData} alt={t('eventPicture')} />
              </div>
            )}
            <label className="full-span">
              {t('tags')}
              <input value={form.tags} onChange={(event) => update('tags', event.target.value)} placeholder={t('tagsPlaceholder')} />
            </label>
            <label className="full-span">
              {t('eventPolicy')}*
              <textarea rows="4" required value={form.policy} onChange={(event) => update('policy', event.target.value)} />
            </label>
          </div>
        )}

        {step === 4 && (
          <div className="review-box">
            <h3>{form.title || t('untitledEvent')}</h3>
            <p>{form.description || t('addShortDescription')}</p>
            {form.imageData && (
              <div className="image-upload-preview review-image">
                <img src={form.imageData} alt={t('eventPicture')} />
              </div>
            )}
            <ul className="event-meta-list">
              <li>{formatDate(form.date, language)} {t('at')} {formatTime(form.time, language)}</li>
              <li>{form.location || t('setLocation')}</li>
              <li>{form.capacity} {t('seatsAvailable')} / {form.visibility}</li>
              <li>{t('tags')}: {typeof form.tags === 'string' ? form.tags : form.tags.join(', ')}</li>
            </ul>
          </div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="action-row wrap-row">
          <button className="btn btn-outline" onClick={handleSave}>
            {t('saveDraft')}
          </button>
          {step > 1 && (
            <button className="btn btn-outline" onClick={() => setStep((value) => value - 1)}>
              {t('previous')}
            </button>
          )}
          {step < 4 ? (
            <button
              className="btn btn-primary"
              onClick={() => {
                if (validateStep(step)) setStep((value) => value + 1);
              }}
            >
              {t('next')}
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => {
                if (!validateStep(3)) return;
                const eventId = saveEventDraft(form, existing?.id);
                submitEventForApproval(eventId);
                navigate('/organizer/dashboard');
              }}
            >
              {t('submitForApproval')}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export function OrganizerRegistrationsPage() {
  const { eventId } = useParams();
  const { events, bookings, users, checkInBooking } = useApp();
  const { eventText, t } = useLanguage();
  const [query, setQuery] = useState('');
  const event = events.find((item) => item.id === eventId);

  const rows = useMemo(() => {
    return bookings
      .filter((booking) => booking.eventId === eventId && booking.status === 'confirmed')
      .map((booking) => ({
        booking,
        attendee: users.find((user) => user.id === booking.userId)
      }))
      .filter(({ attendee, booking }) => {
        const haystack = `${attendee?.name || ''} ${attendee?.universityId || ''} ${booking.ticketCode}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      });
  }, [bookings, eventId, query, users]);

  if (!event) {
    return <section className="shell page-section"><div className="empty-card">{t('eventNotFound')}</div></section>;
  }

  return (
    <section className="shell page-section">
      <div className="table-card">
        <div className="table-header split-heading">
          <div>
            <h1>{t('registrationsCheckIn')}</h1>
            <p>{eventText(event, 'title')}</p>
          </div>
          <div className="action-row">
            <Link className="btn btn-outline" to={`/organizer/scanner/${event.id}`}>{t('scanQr')}</Link>
            <button className="btn btn-outline">{t('exportCsv')}</button>
          </div>
        </div>

        <input
          className="search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('searchAttendeePlaceholder')}
        />

        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>{t('name')}</th>
                <th>{t('universityId')}</th>
                <th>{t('ticket')}</th>
                <th>{t('status')}</th>
                <th>{t('action')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ attendee, booking }) => (
                <tr key={booking.id}>
                  <td>{attendee?.name}</td>
                  <td>{attendee?.universityId}</td>
                  <td>{booking.ticketCode}</td>
                  <td>{booking.checkedIn ? t('checkedIn') : t('notIn')}</td>
                  <td>
                    <button className="btn btn-outline small" disabled={booking.checkedIn} onClick={() => checkInBooking(booking.id)}>
                      {booking.checkedIn ? t('done') : t('checkIn')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, tone = 'success' }) {
  return (
    <div className="stat-card">
      <span className={`dot dot-${tone}`} />
      <h3>{label}</h3>
      <strong>{value}</strong>
    </div>
  );
}
