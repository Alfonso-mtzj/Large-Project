import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

import { resetPassword } from '../api/auth';
import AuthLayout from '../components/AuthLayout';
import loginFrame from '../assets/auth/login_UI.png';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const { data } = await resetPassword(token, password);
      setSuccess(data.message || 'Password reset successfully.');

      // Optional: send them to login after a short moment
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed');
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
          {/* Gold bar #1 */}
          <input
            name="password"
            placeholder="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Gold bar #2 */}
          <input
            name="confirm"
            placeholder="Confirm Password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          {/* Invisible submit button aligned with PNG button area */}
          <button type="submit" aria-label="Reset password">
            Reset
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
