import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

function Brand() {
  return (
    <Link to="/" className="brand">
      <div className="brand-icon">📅</div>
      <div>
        <strong>KFUPMEvents</strong>
        <span>King Fahd University</span>
      </div>
    </Link>
  );
}

function roleLabel(role) {
  const labels = {
    attendee: 'Attendee',
    organizer: 'Organizer',
    admin: 'Admin'
  };
  return labels[role] || role;
}

export default function Header() {
  const { currentUser, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const primaryLinks = [{ label: 'Events', to: '/' }];

  if (currentUser?.role === 'attendee') primaryLinks.push({ label: 'My Tickets', to: '/tickets' });
  if (currentUser?.role === 'organizer') primaryLinks.push({ label: 'Dashboard', to: '/organizer/dashboard' });
  if (currentUser?.role === 'admin') primaryLinks.push({ label: 'Admin Panel', to: '/admin' });

  return (
    <header className="site-header">
      <div className="navbar shell">
        <Brand />

        <button className="menu-toggle" onClick={() => setMenuOpen((value) => !value)} aria-label="Open menu">
          ☰
        </button>

        <div className={`nav-group ${menuOpen ? 'open' : ''}`}>
          <nav className="nav-links">
            {primaryLinks.map((link) => (
              <NavLink key={link.to} to={link.to} onClick={() => setMenuOpen(false)}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-actions">
            {!currentUser ? (
              <button className="btn btn-primary" onClick={() => navigate('/login')}>
                Sign In
              </button>
            ) : (
              <>
                <div className="user-chip">
                  <strong>{currentUser.role === 'organizer' ? (currentUser.organization || 'Organizer Account') : `${roleLabel(currentUser.role)} Account`}</strong>
                  <span>{roleLabel(currentUser.role)}</span>
                </div>
                <button
                  className="icon-btn"
                  aria-label="Sign out"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  ↗
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
