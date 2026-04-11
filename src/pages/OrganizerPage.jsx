import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatDate, getStatusTone } from '../utils/helpers';

export function OrganizerDashboardPage() {
  const { organizerEvents, analytics, submitEventForApproval } = useApp();

  return (
    <section className="shell page-section">
      <h1>Organizer Dashboard</h1>
      <p className="muted strong">Manage your events, approvals, registrations, and drafts.</p>

      <div className="stats-grid four-col">
        <StatCard label="Active Events" value={organizerEvents.filter((event) => event.status === 'approved').length} />
        <StatCard label="Pending Approval" value={analytics.organizerPending} tone="warning" />
        <StatCard label="Total Registrations" value={analytics.organizerRegistrations} tone="info" />
        <StatCard label="Drafts" value={analytics.organizerDrafts} tone="neutral" />
      </div>

      <div className="action-row">
        <Link className="btn btn-primary" to="/organizer/events/new">
          + Create New Event
        </Link>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h2>My Events</h2>
        </div>
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Status</th>
                <th>Registrations</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizerEvents.map((event) => (
                <tr key={event.id}>
                  <td>
                    <strong>{event.title}</strong>
                    <div className="subtext">{event.category}</div>
                  </td>
                  <td>{formatDate(event.date)}</td>
                  <td>
                    <span className={`pill pill-${getStatusTone(event.status)}`}>{event.status}</span>
                  </td>
                  <td>
                    {event.registered} / {event.capacity}
                  </td>
                  <td>
                    <div className="action-row compact-row">
                      <Link className="icon-btn muted-btn" to={`/events/${event.id}`}>
                        👁
                      </Link>
                      {event.status !== 'approved' && (
                        <Link className="icon-btn muted-btn" to={`/organizer/events/${event.id}/edit`}>
                          ✎
                        </Link>
                      )}
                      {event.status === 'draft' && (
                        <button className="btn btn-outline small" onClick={() => submitEventForApproval(event.id)}>
                          Submit
                        </button>
                      )}
                      <Link className="icon-btn muted-btn" to={`/organizer/registrations/${event.id}`}>
                        👥
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
  const { events, saveEventDraft, submitEventForApproval } = useApp();
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

  const steps = ['Basic Info', 'Schedule', 'Tickets', 'Review'];

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file for the event cover.');
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
        setError('Complete all required basic information fields.');
        return false;
      }
    }
    if (targetStep === 2) {
      if (!form.location.trim() || !form.date || !form.time) {
        setError('Complete all required schedule fields.');
        return false;
      }
    }
    if (targetStep === 3) {
      if (Number(form.capacity) < 1 || Number(form.perUserLimit) < 1 || !form.policy.trim()) {
        setError('Capacity, per-user limit, and event policy are required.');
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
        <h1>{existing ? 'Edit Event' : 'Create New Event'}</h1>
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
              Event Title*
              <input required value={form.title} onChange={(event) => update('title', event.target.value)} />
            </label>
            <label>
              Category*
              <select value={form.category} onChange={(event) => update('category', event.target.value)}>
                <option>Workshop</option>
                <option>Career</option>
                <option>Cultural</option>
                <option>Competition</option>
                <option>Sports</option>
                <option>Seminar</option>
              </select>
            </label>
            <label className="full-span">
              Short Description*
              <textarea rows="3" required value={form.description} onChange={(event) => update('description', event.target.value)} />
            </label>
            <label className="full-span">
              Long Description*
              <textarea rows="5" required value={form.longDescription} onChange={(event) => update('longDescription', event.target.value)} />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="form-grid two-col">
            <label>
              Date*
              <input type="date" required value={form.date} onChange={(event) => update('date', event.target.value)} />
            </label>
            <label>
              Time*
              <input type="time" required value={form.time} onChange={(event) => update('time', event.target.value)} />
            </label>
            <label className="full-span">
              Location*
              <input required value={form.location} onChange={(event) => update('location', event.target.value)} placeholder="Building/Room or Online link" />
            </label>
            <label>
              Visibility
              <select value={form.visibility} onChange={(event) => update('visibility', event.target.value)}>
                <option value="university">University</option>
                <option value="public">Public</option>
              </select>
            </label>
            <label>
              Event Mode
              <select value={form.mode} onChange={(event) => update('mode', event.target.value)}>
                <option>Offline</option>
                <option>Online</option>
                <option>Hybrid</option>
              </select>
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="form-grid two-col">
            <label>
              Capacity*
              <input type="number" min="1" required value={form.capacity} onChange={(event) => update('capacity', Number(event.target.value))} />
            </label>
            <label>
              Per-user Limit
              <input type="number" min="1" required value={form.perUserLimit} onChange={(event) => update('perUserLimit', Number(event.target.value))} />
            </label>
            <label>
              Price Type
              <select value={form.priceType} onChange={(event) => update('priceType', event.target.value)}>
                <option>Free</option>
                <option>Paid</option>
              </select>
            </label>
            <label>
              Cover Theme
              <select value={form.coverTheme} onChange={(event) => update('coverTheme', event.target.value)}>
                <option value="theme-ai">Technology</option>
                <option value="theme-career">Career</option>
                <option value="theme-cultural">Cultural</option>
                <option value="theme-startup">Competition</option>
                <option value="theme-sports">Sports</option>
                <option value="theme-environment">Seminar</option>
              </select>
            </label>
            <label>
              Event Picture
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              <small className="subtext">Upload a cover image for this event card and details page.</small>
            </label>
            {form.imageData && (
              <div className="full-span image-upload-preview">
                <img src={form.imageData} alt="Event cover preview" />
              </div>
            )}
            <label className="full-span">
              Tags
              <input value={form.tags} onChange={(event) => update('tags', event.target.value)} placeholder="AI, Campus, Workshop" />
            </label>
            <label className="full-span">
              Event Policy*
              <textarea rows="4" required value={form.policy} onChange={(event) => update('policy', event.target.value)} />
            </label>
          </div>
        )}

        {step === 4 && (
          <div className="review-box">
            <h3>{form.title || 'Untitled event'}</h3>
            <p>{form.description || 'Add a short description.'}</p>
            {form.imageData && (
              <div className="image-upload-preview review-image">
                <img src={form.imageData} alt="Event cover preview" />
              </div>
            )}
            <ul className="event-meta-list">
              <li>{form.date} at {form.time}</li>
              <li>{form.location || 'Set a location'}</li>
              <li>{form.capacity} seats · {form.visibility}</li>
              <li>Tags: {typeof form.tags === 'string' ? form.tags : form.tags.join(', ')}</li>
            </ul>
          </div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="action-row wrap-row">
          <button className="btn btn-outline" onClick={handleSave}>
            Save Draft
          </button>
          {step > 1 && (
            <button className="btn btn-outline" onClick={() => setStep((value) => value - 1)}>
              Previous
            </button>
          )}
          {step < 4 ? (
            <button
              className="btn btn-primary"
              onClick={() => {
                if (validateStep(step)) setStep((value) => value + 1);
              }}
            >
              Next
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
              Submit for Approval
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
    return <section className="shell page-section"><div className="empty-card">Event not found.</div></section>;
  }

  return (
    <section className="shell page-section">
      <div className="table-card">
        <div className="table-header split-heading">
          <div>
            <h1>Organizer - Registrations & Check-in</h1>
            <p>{event.title}</p>
          </div>
          <div className="action-row">
            <button className="btn btn-outline">Scan QR</button>
            <button className="btn btn-outline">Export CSV</button>
          </div>
        </div>

        <input
          className="search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search attendee by name / ID / ticket code"
        />

        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>University ID</th>
                <th>Ticket</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ attendee, booking }) => (
                <tr key={booking.id}>
                  <td>{attendee?.name}</td>
                  <td>{attendee?.universityId}</td>
                  <td>{booking.ticketCode}</td>
                  <td>{booking.checkedIn ? 'Checked-in' : 'Not in'}</td>
                  <td>
                    <button className="btn btn-outline small" disabled={booking.checkedIn} onClick={() => checkInBooking(booking.id)}>
                      {booking.checkedIn ? 'Done' : 'Check-in'}
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
