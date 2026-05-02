import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

const emailPattern = /^[a-zA-Z0-9._%+-]+@kfupm\.edu\.sa$/;
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export default function OrganizerApplicationPage() {
  const { submitOrganizerApplication } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    organization: '',
    type: 'Club',
    officialEmail: '',
    advisorName: '',
    documentName: '',
    password: '',
    confirmPassword: '',
    notes: ''
  });
  const [error, setError] = useState('');

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (!form.organization.trim() || !form.advisorName.trim() || !form.documentName.trim()) {
      setError(t('requiredFields'));
      return;
    }
    if (!emailPattern.test(form.officialEmail.trim())) {
      setError(t('invalidEmail'));
      return;
    }
    if (!form.documentName.toLowerCase().endsWith('.pdf')) {
      setError(t('pdfRequired'));
      return;
    }
    if (!passwordPattern.test(form.password)) {
      setError(t('weakPassword'));
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    submitOrganizerApplication(form);
    navigate('/login');
  };

  return (
    <section className="shell page-section">
      <div className="card form-card narrow-card">
        <h1>{t('organizerApplication')}</h1>
        <p>{t('organizerApplicationSubtitle')}</p>
        <div className="form-grid">
          <label>
            {t('organizationName')}*
            <input required value={form.organization} onChange={(event) => update('organization', event.target.value)} />
          </label>
          <label>
            {t('type')}*
            <select value={form.type} onChange={(event) => update('type', event.target.value)}>
              <option value="Club">{t('club')}</option>
              <option value="Department">{t('department')}</option>
              <option value="Unit">{t('unit')}</option>
            </select>
          </label>
          <label>
            {t('officialEmail')}*
            <input type="email" required value={form.officialEmail} onChange={(event) => update('officialEmail', event.target.value)} placeholder="club@kfupm.edu.sa" />
          </label>
          <label>
            {t('advisorName')}*
            <input required value={form.advisorName} onChange={(event) => update('advisorName', event.target.value)} />
          </label>
          <label>
            {t('verificationDocument')}* (PDF)
            <input required value={form.documentName} onChange={(event) => update('documentName', event.target.value)} placeholder="verification.pdf" />
          </label>
          <label>
            {t('password')}*
            <input type="password" required minLength="8" value={form.password} onChange={(event) => update('password', event.target.value)} placeholder={t('createPassword')} />
          </label>
          <label>
            {t('confirmPassword')}*
            <input type="password" required minLength="8" value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} placeholder={t('confirmPasswordPlaceholder')} />
          </label>
          <label>
            {t('notes')}
            <textarea rows="4" value={form.notes} onChange={(event) => update('notes', event.target.value)} />
          </label>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="action-row wrap-row">
          <button className="btn btn-outline" onClick={() => navigate(-1)}>
            {t('cancel')}
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {t('submit')}
          </button>
        </div>
      </div>
    </section>
  );
}
