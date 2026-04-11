import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

const emailPattern = /^[a-zA-Z0-9._%+-]+@kfupm\.edu\.sa$/;
const strongPassword = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export default function LoginPage() {
  const { login, loginAs, pushToast } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!emailPattern.test(form.email.trim())) {
      setError('Enter a valid KFUPM email address.');
      return;
    }
    if (!strongPassword.test(form.password)) {
      setError('Password must be at least 8 characters and include letters and numbers.');
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
        <div className="auth-icon">📅</div>
        <h1>Sign in to KFUPMEvents</h1>
        <p>Use your KFUPM credentials to continue</p>

        <form className="form-grid" onSubmit={handleSubmit} noValidate>
          <label>
            KFUPM Email
            <input
              type="email"
              required
              placeholder="your.name@kfupm.edu.sa"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength="8"
              placeholder="Enter your password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            />
          </label>
          <div className="login-meta-row">
            <span className="muted">Use your university account</span>
            <button
              type="button"
              className="text-link"
              onClick={() => pushToast('Password reset link will be available after backend integration.', 'info')}
            >
              Forgot password?
            </button>
          </div>
          <button type="submit" className="btn btn-primary wide">
            Sign In
          </button>
        </form>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="divider">Quick Demo Login</div>
        <div className="stack-buttons">
          <button className="btn btn-outline wide" onClick={() => quickLogin('attendee')}>
            Login as Attendee
          </button>
          <button className="btn btn-outline wide" onClick={() => quickLogin('organizer')}>
            Login as Organizer
          </button>
          <button className="btn btn-outline wide" onClick={() => quickLogin('admin')}>
            Login as Admin
          </button>
        </div>

        <button className="link-btn" onClick={() => navigate('/become-organizer')}>
          New organizer? Apply for organizer privileges
        </button>
      </div>
    </section>
  );
}
