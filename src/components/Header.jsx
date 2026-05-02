import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

function Brand({ t }) {
  return (
    <Link to="/" className="brand">
      <div className="brand-icon">CE</div>
      <div>
        <strong>KFUPMEvents</strong>
        <span>{t('brandSubtitle')}</span>
      </div>
    </Link>
  );
}

function roleLabel(role, t) {
  const labels = {
    attendee: t('attendee'),
    organizer: t('organizer'),
    admin: t('admin')
  };
  return labels[role] || role;
}

export default function Header() {
  const { currentUser, logout } = useApp();
  const { language, t, toggleLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/' && (!currentUser || currentUser.role === 'attendee')) return null;

  const primaryLinks = [{ label: t('events'), to: '/' }];

  if (currentUser?.role === 'attendee') primaryLinks.push({ label: t('myTickets'), to: '/tickets' });
  if (currentUser?.role === 'organizer') primaryLinks.push({ label: t('dashboard'), to: '/organizer/dashboard' });
  if (currentUser?.role === 'admin') primaryLinks.push({ label: t('adminPanel'), to: '/admin' });

  return (
    <header className="site-header">
      <div className="navbar shell">
        <Brand t={t} />

        <button className="menu-toggle" onClick={() => setMenuOpen((value) => !value)} aria-label={t('openMenu')}>
          {t('menu')}
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
            <button className="language-toggle" type="button" onClick={toggleLanguage} aria-label={t('switchLanguage')}>
              {language === 'en' ? 'AR' : 'EN'}
            </button>
            {!currentUser ? (
              <button className="btn btn-primary" onClick={() => navigate('/login')}>
                {t('signIn')}
              </button>
            ) : (
              <>
                <div className="user-chip">
                  <strong>
                    {currentUser.role === 'organizer'
                      ? currentUser.organization || t('organizerAccount')
                      : t(`${currentUser.role}Account`)}
                  </strong>
                  <span>{roleLabel(currentUser.role, t)}</span>
                </div>
                <button
                  className="icon-btn"
                  aria-label={t('signOut')}
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  -&gt;
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
