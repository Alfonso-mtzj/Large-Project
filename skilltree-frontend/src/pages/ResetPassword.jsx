import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api/auth';
import AuthLayout from '../components/AuthLayout';
import resetFrame from '../assets/auth/new_password.png';

export default function ResetPassword() {
  const { token }               = useParams();
  const navigate                = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.');                 return; }
    try {
      const { data } = await resetPassword(token, password);
      setSuccess(data.message || 'Password reset successfully.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed');
    }
  };

  return (
    <>
      {error   && <div className="authErrorToast">{error}</div>}
      {success && <div className="authErrorToast" style={{ color: '#c8ffd8' }}>{success}</div>}

      <AuthLayout
        frameSrc={resetFrame}
        overlayClassName="authOverlayNewPassword"
        frameWrapClassName="authFrameWrapResetPassword"
      >
        <form onSubmit={handleSubmit} style={{ position: 'absolute', inset: 0 }}>

          <h1 className="authSlotTitle"></h1>

          <label className="authSlotLabel"></label>
          <input
            className="authSlotInput"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <label className="authSlotLabel"></label>
          <input
            className="authSlotInput"
            name="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          /> 
          
          <button className="authSlotBtn" type="submit">Reset Password</button>

          <div className="authSlotLinks">
            <Link to="/login">Back to Login</Link>
          </div>

        </form>
      </AuthLayout>
    </>
  );
}
