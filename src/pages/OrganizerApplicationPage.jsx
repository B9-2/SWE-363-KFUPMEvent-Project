import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const emailPattern = /^[a-zA-Z0-9._%+-]+@kfupm\.edu\.sa$/;
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export default function OrganizerApplicationPage() {
  const { submitOrganizerApplication } = useApp();
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
      setError('Please fill in all required fields.');
      return;
    }
    if (!emailPattern.test(form.officialEmail.trim())) {
      setError('Enter a valid KFUPM email address.');
      return;
    }
    if (!form.documentName.toLowerCase().endsWith('.pdf')) {
      setError('Verification document must be a PDF file.');
      return;
    }
    if (!passwordPattern.test(form.password)) {
      setError('Password must be at least 8 characters and include letters and numbers.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    submitOrganizerApplication(form);
    navigate('/login');
  };

  return (
    <section className="shell page-section">
      <div className="card form-card narrow-card">
        <h1>Organizer Application</h1>
        <p>For clubs, departments, and university units that want to publish events.</p>
        <div className="form-grid">
          <label>
            Organization Name*
            <input required value={form.organization} onChange={(event) => update('organization', event.target.value)} />
          </label>
          <label>
            Type*
            <select value={form.type} onChange={(event) => update('type', event.target.value)}>
              <option>Club</option>
              <option>Department</option>
              <option>Unit</option>
            </select>
          </label>
          <label>
            Official Email*
            <input type="email" required value={form.officialEmail} onChange={(event) => update('officialEmail', event.target.value)} placeholder="club@kfupm.edu.sa" />
          </label>
          <label>
            Supervisor / Advisor Name*
            <input required value={form.advisorName} onChange={(event) => update('advisorName', event.target.value)} />
          </label>
          <label>
            Verification Document* (PDF)
            <input required value={form.documentName} onChange={(event) => update('documentName', event.target.value)} placeholder="verification.pdf" />
          </label>
          <label>
            Password*
            <input type="password" required minLength="8" value={form.password} onChange={(event) => update('password', event.target.value)} placeholder="Create a password" />
          </label>
          <label>
            Confirm Password*
            <input type="password" required minLength="8" value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} placeholder="Confirm your password" />
          </label>
          <label>
            Notes
            <textarea rows="4" value={form.notes} onChange={(event) => update('notes', event.target.value)} />
          </label>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="action-row wrap-row">
          <button className="btn btn-outline" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>
    </section>
  );
}
