import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatDate, getStatusTone } from '../utils/helpers';

export default function AdminPage() {
  const {
    analytics,
    applications,
    events,
    reviewApplication,
    reviewEvent,
    deleteEvent,
    toggleBanUser,
    updateUserRole,
    users
  } = useApp();
  const [tab, setTab] = useState('reviews');
  const [query, setQuery] = useState('');

  const pendingEvents = events.filter((event) => event.status === 'pending');
  const filteredUsers = useMemo(
    () => users.filter((user) => `${user.name} ${user.email} ${user.universityId}`.toLowerCase().includes(query.toLowerCase())),
    [query, users]
  );

  return (
    <section className="shell page-section">
      <h1>Admin Dashboard</h1>
      <p className="muted strong">Manage events, users, and organizer applications</p>

      <div className="stats-grid four-col">
        <StatCard label="Pending Events" value={analytics.pendingEvents} tone="warning" />
        <StatCard label="Pending Applications" value={analytics.pendingApplications} tone="info" />
        <StatCard label="Total Users" value={analytics.totalUsers} tone="purple" />
        <StatCard label="All Events" value={analytics.totalEvents} tone="success" />
      </div>

      <div className="tabs admin-tabs admin-tabs-4">
        <button className={tab === 'reviews' ? 'active' : ''} onClick={() => setTab('reviews')}>
          Event Reviews ({pendingEvents.length})
        </button>
        <button className={tab === 'all-events' ? 'active' : ''} onClick={() => setTab('all-events')}>
          All Events ({events.length})
        </button>
        <button className={tab === 'applications' ? 'active' : ''} onClick={() => setTab('applications')}>
          Organizer Applications ({applications.filter((app) => app.status === 'pending').length})
        </button>
        <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>
          User Management
        </button>
      </div>

      {tab === 'reviews' && (
        <div className="table-card">
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Organizer</th>
                  <th>Date</th>
                  <th>Capacity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingEvents.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <strong>{event.title}</strong>
                      <div className="subtext">{event.category}</div>
                    </td>
                    <td>{event.organizerName}</td>
                    <td>{formatDate(event.date)}</td>
                    <td>{event.capacity}</td>
                    <td>
                      <div className="action-row compact-row">
                        <Link className="icon-btn muted-btn" to={`/events/${event.id}`}>
                          👁
                        </Link>
                        <button className="icon-btn success-btn" onClick={() => reviewEvent(event.id, 'approve')}>
                          ✓
                        </button>
                        <button className="icon-btn danger-btn" onClick={() => reviewEvent(event.id, 'reject')}>
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'all-events' && (
        <div className="table-card">
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Organizer</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Registrations</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <strong>{event.title}</strong>
                      <div className="subtext">{event.category}</div>
                    </td>
                    <td>{event.organizerName}</td>
                    <td><span className={`pill pill-${getStatusTone(event.status)}`}>{event.status}</span></td>
                    <td>{formatDate(event.date)}</td>
                    <td>{event.registered} / {event.capacity}</td>
                    <td>
                      <div className="action-row compact-row">
                        <Link className="icon-btn muted-btn" to={`/events/${event.id}`}>
                          👁
                        </Link>
                        <button className="btn btn-outline small danger-text" onClick={() => deleteEvent(event.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'applications' && (
        <div className="table-card">
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Organization</th>
                  <th>Type</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.filter((app) => app.status === 'pending').map((application) => (
                  <tr key={application.id}>
                    <td>
                      <strong>{application.applicantName}</strong>
                      <div className="subtext">{application.officialEmail}</div>
                    </td>
                    <td>
                      <strong>{application.organization}</strong>
                      <div className="subtext">{application.advisorName}</div>
                    </td>
                    <td>{application.type}</td>
                    <td>{application.submittedAt}</td>
                    <td>
                      <div className="action-row compact-row">
                        <button className="btn btn-primary small" onClick={() => reviewApplication(application.id, 'approve')}>
                          Approve
                        </button>
                        <button className="btn btn-outline small danger-text" onClick={() => reviewApplication(application.id, 'reject')}>
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="table-card">
          <input
            className="search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search users by name or email..."
          />
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>KFUPM ID</th>
                  <th>Role</th>
                  <th>Organization</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.name}</strong>
                      <div className="subtext">{user.email}</div>
                    </td>
                    <td>{user.universityId}</td>
                    <td>
                      <span className={`pill pill-${getStatusTone(user.role)}`}>{user.role}</span>
                    </td>
                    <td>{user.organization || '-'}</td>
                    <td>
                      <div className="action-row compact-row">
                        <select value={user.role} onChange={(event) => updateUserRole(user.id, event.target.value)}>
                          <option value="attendee">Attendee</option>
                          <option value="organizer">Organizer</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button className="btn btn-outline small danger-text" onClick={() => toggleBanUser(user.id)}>
                          {user.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
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
