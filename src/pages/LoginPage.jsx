import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

const emailPattern = /^[a-zA-Z0-9._%+-]+@kfupm\.edu\.sa$/;
const strongPassword = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export default function LoginPage() {
  const { login, loginAs, pushToast } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!emailPattern.test(form.email.trim())) {
      setError(t('invalidEmail'));
      return;
    }
    if (!strongPassword.test(form.password)) {
      setError(t('weakPassword'));
      return;
    }

    const result = login(form.email.trim(), form.password);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError('');
    navigate(result.user.role === 'attendee' ? '/' : result.user.role === 'organizer' ? '/organizer/dashboard' : '/admin');
  };

  const quickLogin = (role) => {
    loginAs(role);
    navigate(role === 'attendee' ? '/' : role === 'organizer' ? '/organizer/dashboard' : '/admin');
  };

  return (
    <section className="shell auth-shell">
      <div className="auth-card">
        <div className="auth-icon">CE</div>
        <h1>{t('loginTitle')}</h1>
        <p>{t('loginSubtitle')}</p>

        <form className="form-grid" onSubmit={handleSubmit} noValidate>
          <label>
            {t('kfupmEmail')}
            <input
              type="email"
              required
              placeholder={t('emailPlaceholder')}
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </label>
          <label>
            {t('password')}
            <input
              type="password"
              required
              minLength="8"
              placeholder={t('passwordPlaceholder')}
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            />
          </label>
          <div className="login-meta-row">
            <span className="muted">{t('universityAccount')}</span>
            <button
              type="button"
              className="text-link"
              onClick={() => pushToast(t('passwordResetSoon'), 'info')}
            >
              {t('forgotPassword')}
            </button>
          </div>
          <button type="submit" className="btn btn-primary wide">
            {t('signIn')}
          </button>
        </form>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="divider">{t('quickDemoLogin')}</div>
        <div className="stack-buttons">
          <button className="btn btn-outline wide" onClick={() => quickLogin('attendee')}>
            {t('loginAsAttendee')}
          </button>
          <button className="btn btn-outline wide" onClick={() => quickLogin('organizer')}>
            {t('loginAsOrganizer')}
          </button>
          <button className="btn btn-outline wide" onClick={() => quickLogin('admin')}>
            {t('loginAsAdmin')}
          </button>
        </div>

        <button className="link-btn" onClick={() => navigate('/become-organizer')}>
          {t('organizerApplyCta')}
        </button>
      </div>
    </section>
  );
}
