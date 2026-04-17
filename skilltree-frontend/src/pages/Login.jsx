import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import loginFrame from '../assets/auth/login_UI.png';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await loginUser(form);
      login(data, null);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <>
      {error && <div className="authErrorToast">{error}</div>}

      <AuthLayout
        frameSrc={loginFrame}
        overlayClassName="authOverlay"
        frameWrapClassName="authFrameWrapLogin"
      >
        <form onSubmit={handleSubmit} style={{ position: 'absolute', inset: 0 }}>

          <h1 className="authSlotTitle"></h1>

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

          <label className="authSlotLabel"></label>
          <input
            className="authSlotInput"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button className="authSlotBtn" type="submit">Login</button>

          <div className="authSlotLinks">
            <Link to="/forgot-password">Forgot Password?</Link>
            <Link to="/register">Create Account</Link>
          </div>

        </form>
      </AuthLayout>
    </>
  );
}
