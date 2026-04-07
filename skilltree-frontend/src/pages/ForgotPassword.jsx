import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth';
import AuthLayout from '../components/AuthLayout';
import resetFrame from '../assets/auth/ResetPassword.png';

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
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
      {error   && <div className="authErrorToast">{error}</div>}
      {success && <div className="authErrorToast" style={{ color: '#c8ffd8' }}>{success}</div>}

      <AuthLayout
        frameSrc={resetFrame}
        overlayClassName="authOverlayReset"
        frameWrapClassName="authFrameWrapResetPassword"
      >
        <form onSubmit={handleSubmit} style={{ position: 'absolute', inset: 0 }}>

          <h1 className="authSlotTitle"></h1>

          {/* Uses slot 1 only — slot 2 bar stays empty */}
          <label className="authSlotLabel"></label>
          <input
            className="authSlotInput"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button className="authSlotBtn" type="submit">Send Link</button>

          <div className="authSlotLinks">
            <Link to="/login">Back to Login</Link>
          </div>

        </form>
      </AuthLayout>
    </>
  );
}
