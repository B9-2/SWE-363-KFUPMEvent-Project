import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
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
  const { categoryLabel, eventText, language, statusLabel, t } = useLanguage();
  const [tab, setTab] = useState('reviews');
  const [query, setQuery] = useState('');

  const pendingEvents = events.filter((event) => event.status === 'pending');
  const applicationTypeLabel = (type) => {
    const map = { Club: t('club'), Department: t('department'), Unit: t('unit') };
    return map[type] || type;
  };
  const filteredUsers = useMemo(
    () => users.filter((user) => `${user.name} ${user.email} ${user.universityId}`.toLowerCase().includes(query.toLowerCase())),
    [query, users]
  );

  return (
    <section className="shell page-section">
      <h1>{t('adminDashboard')}</h1>
      <p className="muted strong">{t('adminSubtitle')}</p>

      <div className="stats-grid four-col">
        <StatCard label={t('pendingEvents')} value={analytics.pendingEvents} tone="warning" />
        <StatCard label={t('pendingApplications')} value={analytics.pendingApplications} tone="info" />
        <StatCard label={t('totalUsers')} value={analytics.totalUsers} tone="purple" />
        <StatCard label={t('allEventsStat')} value={analytics.totalEvents} tone="success" />
      </div>

      <div className="tabs admin-tabs admin-tabs-4">
        <button className={tab === 'reviews' ? 'active' : ''} onClick={() => setTab('reviews')}>
          {t('eventReviews')} ({pendingEvents.length})
        </button>
        <button className={tab === 'all-events' ? 'active' : ''} onClick={() => setTab('all-events')}>
          {t('allEventsTab')} ({events.length})
        </button>
        <button className={tab === 'applications' ? 'active' : ''} onClick={() => setTab('applications')}>
          {t('organizerApplications')} ({applications.filter((app) => app.status === 'pending').length})
        </button>
        <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>
          {t('userManagement')}
        </button>
      </div>

      {tab === 'reviews' && (
        <div className="table-card">
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>{t('event')}</th>
                  <th>{t('organizer')}</th>
                  <th>{t('date')}</th>
                  <th>{t('capacity')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {pendingEvents.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <strong>{eventText(event, 'title')}</strong>
                      <div className="subtext">{categoryLabel(event.category)}</div>
                    </td>
                    <td>{eventText(event, 'organizerName')}</td>
                    <td>{formatDate(event.date, language)}</td>
                    <td>{event.capacity}</td>
                    <td>
                      <div className="action-row compact-row">
                        <Link className="icon-btn muted-btn" to={`/events/${event.id}`}>
                          {t('view')}
                        </Link>
                        <button className="icon-btn success-btn" onClick={() => reviewEvent(event.id, 'approve')}>
                          {t('approve')}
                        </button>
                        <button className="icon-btn danger-btn" onClick={() => reviewEvent(event.id, 'reject')}>
                          {t('reject')}
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
                  <th>{t('event')}</th>
                  <th>{t('organizer')}</th>
                  <th>{t('status')}</th>
                  <th>{t('date')}</th>
                  <th>{t('registrations')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <strong>{eventText(event, 'title')}</strong>
                      <div className="subtext">{categoryLabel(event.category)}</div>
                    </td>
                    <td>{eventText(event, 'organizerName')}</td>
                    <td><span className={`pill pill-${getStatusTone(event.status)}`}>{statusLabel(event.status)}</span></td>
                    <td>{formatDate(event.date, language)}</td>
                    <td>{event.registered} / {event.capacity}</td>
                    <td>
                      <div className="action-row compact-row">
                        <Link className="icon-btn muted-btn" to={`/events/${event.id}`}>
                          {t('view')}
                        </Link>
                        <button className="btn btn-outline small danger-text" onClick={() => deleteEvent(event.id)}>
                          {t('delete')}
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
                  <th>{t('applicant')}</th>
                  <th>{t('organization')}</th>
                  <th>{t('type')}</th>
                  <th>{t('submitted')}</th>
                  <th>{t('actions')}</th>
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
                    <td>{applicationTypeLabel(application.type)}</td>
                    <td>{application.submittedAt}</td>
                    <td>
                      <div className="action-row compact-row">
                        <button className="btn btn-primary small" onClick={() => reviewApplication(application.id, 'approve')}>
                          {t('approve')}
                        </button>
                        <button className="btn btn-outline small danger-text" onClick={() => reviewApplication(application.id, 'reject')}>
                          {t('reject')}
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
            placeholder={t('searchUsersPlaceholder')}
          />
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>{t('user')}</th>
                  <th>{t('kfupmId')}</th>
                  <th>{t('role')}</th>
                  <th>{t('organization')}</th>
                  <th>{t('actions')}</th>
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
                      <span className={`pill pill-${getStatusTone(user.role)}`}>{statusLabel(user.role)}</span>
                    </td>
                    <td>{user.organization || '-'}</td>
                    <td>
                      <div className="action-row compact-row">
                        <select value={user.role} onChange={(event) => updateUserRole(user.id, event.target.value)}>
                          <option value="attendee">{t('attendee')}</option>
                          <option value="organizer">{t('organizer')}</option>
                          <option value="admin">{t('admin')}</option>
                        </select>
                        <button className="btn btn-outline small danger-text" onClick={() => toggleBanUser(user.id)}>
                          {user.isBanned ? t('unban') : t('ban')}
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
