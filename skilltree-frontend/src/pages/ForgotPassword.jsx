import { useState } from 'react';
import { Link } from 'react-router-dom';

import { forgotPassword } from '../api/auth';
import AuthLayout from '../components/AuthLayout';
import loginFrame from '../assets/auth/login_UI.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const { data } = await forgotPassword(email);
      setSuccess(data.message || 'If that email exists, a reset link has been sent.');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Request failed');
    }
  };

  return (
    <>
      {error && <div className="authErrorToast">{error}</div>}
      {success && (
        <div className="authErrorToast" style={{ color: '#c8ffd8' }}>
          {success}
        </div>
      )}

      <AuthLayout frameSrc={loginFrame} overlayClassName="authOverlay">
        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          {/* Use the first gold bar for email */}
          <input
            name="email"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* We don’t need the 2nd bar, but it's okay if it stays empty visually */}
          {/* Invisible submit button aligned with PNG button area */}
          <button type="submit" aria-label="Send reset link">
            Send
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Link to="/login" style={{ color: '#eaffef', fontWeight: 800 }}>
            Back to Login
          </Link>
        </div>
      </AuthLayout>
    </>
  );
}
