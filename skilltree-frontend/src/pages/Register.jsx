import { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerUser } from '../api/auth';

// ✅ UI-only wrapper that provides the forest background + PNG frame overlay.
// This does NOT change your backend/auth logic, it only changes presentation.
import AuthLayout from '../components/AuthLayout';

// ✅ The “register parchment/frame” PNG you uploaded.
// This is the image with 4 gold input bars + a button area.
import registerFrame from '../assets/auth/register_UI.png';

export default function Register() {
  // ✅ Keep your original form structure because your backend expects:
  // firstName, lastName, username, email, password
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: ''
  });

  // ✅ ADDED: UI-only field to fit your PNG which has ONLY 4 slots.
  // We use "Full Name" as one slot, then split into firstName/lastName on submit.
  const [fullName, setFullName] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Existing: updates username/email/password in `form`
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // ✅ ADDED: Split fullName -> firstName + lastName right before sending to backend.
    // This lets you keep the backend the same while using only 4 visible fields.
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';

    // ✅ ADDED: Simple validation so backend doesn't receive empty first/last name.
    if (!firstName || !lastName) {
      setError('Please enter your first and last name.');
      return;
    }

    try {
      // ✅ ADDED: Create the payload with your split names.
      // This is what gets sent to your existing /api/register endpoint.
      const payload = { ...form, firstName, lastName };

      const { data } = await registerUser(payload);
      setSuccess(data.message || 'Registered! Check your email.');

      // ✅ Optional: reset UI fields after successful registration
      setFullName('');
      setForm({ firstName: '', lastName: '', username: '', email: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <>
      {/* ✅ ADDED: Toast-style message so errors/success can appear on top of the background/frame */}
      {error && <div className="authErrorToast">{error}</div>}
      {success && (
        <div className="authErrorToast" style={{ color: '#c8ffd8' }}>
          {success}
        </div>
      )}

      {/* ✅ ADDED: Wrap the screen with the background + PNG frame.
          This doesn’t affect form logic; it just positions your inputs over the gold bars. */}
      <AuthLayout frameSrc={registerFrame}>
        {/* ✅ IMPORTANT: Keep a REAL <form> for Enter-to-submit and browser autofill.
            `display: contents` makes the form not create a layout box so inputs can align to the overlay. */}
        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          {/* Slot 1 (gold bar #1): Full Name (UI-only) */}
          <input
            name="fullName"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          {/* Slot 2 (gold bar #2): Username (goes into form.username) */}
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />

          {/* Slot 3 (gold bar #3): Email (goes into form.email) */}
          <input
            name="email"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          {/* Slot 4 (gold bar #4): Password (goes into form.password) */}
          <input
            name="password"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {/* ✅ ADDED: This is still a REAL submit button (so the form submits normally),
              but your CSS makes it transparent and sizes it to sit over the PNG “Create Account” button area. */}
          <button type="submit" aria-label="Create Account">
            Register
          </button>
        </form>

        {/* ✅ ADDED: Link below the form. If you want it to appear inside the PNG area,
            we can absolute-position it later, but this keeps it simple and readable. */}
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Link to="/login" style={{ color: '#eaffef', fontWeight: 800 }}>
            Login
          </Link>
        </div>
      </AuthLayout>
    </>
  );
}
