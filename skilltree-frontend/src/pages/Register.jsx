import { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerUser } from '../api/auth';
import AuthLayout from '../components/AuthLayout';
import registerFrame from '../assets/auth/register_UI.png';

export default function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
  });
  const [fullName, setFullName] = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const parts     = fullName.trim().split(/\s+/).filter(Boolean);
    const firstName = parts[0] || '';
    const lastName  = parts.slice(1).join(' ') || '';

    if (!firstName || !lastName) {
      setError('Please enter your first and last name.');
      return;
    }

    try {
      const { data } = await registerUser({ ...form, firstName, lastName });
      setSuccess(data.message || 'Registered! Check your email.');
      setFullName('');
      setForm({ firstName: '', lastName: '', username: '', email: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <>
      {error   && <div className="authErrorToast">{error}</div>}
      {success && <div className="authErrorToast" style={{ color: '#c8ffd8' }}>{success}</div>}

      <AuthLayout
        frameSrc={registerFrame}
        overlayClassName="authOverlayRegister"
        frameWrapClassName="authFrameWrapRegister"
      >
        <form onSubmit={handleSubmit} style={{ position: 'absolute', inset: 0 }}>

          <h1 className="authSlotTitle"></h1>

          <label className="authSlotLabel"></label>
          <input
            className="authSlotInput"
            name="fullName"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <label className="authSlotLabel"></label>
          <input
            className="authSlotInput"
            name="username"
            type="text"
            autoComplete="username"
            value={form.username}
            onChange={handleChange}
            required
          />

          <label className="authSlotLabel"></label>
          <input
            className="authSlotInput"
            name="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <label className="authSlotLabel"></label>
          <input
            className="authSlotInput"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <button className="authSlotBtn" type="submit">Create Account</button>

          <div className="authSlotLinks">
            <Link to="/login">Login</Link>
          </div>

        </form>
      </AuthLayout>
    </>
  );
}
