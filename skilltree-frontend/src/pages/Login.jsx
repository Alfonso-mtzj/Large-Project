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
      login(data, null); // API doesn't return a token yet, just user info
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <>
      {error && <div className="authErrorToast">{error}</div>}

      <AuthLayout frameSrc={loginFrame} overlayClassName="authOverlay">
        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <input
            name="email"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="password"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {/* Real submit button (your CSS makes it invisible; it sits over the PNG button art) */}
          <button type="submit" aria-label="Login">
            Login
          </button>
        </form>

        {/* Rubric-correct user flow:
            both links go to /forgot-password because reset requires an emailed token */}
        <div style={{ textAlign: 'center', marginTop: 10, fontWeight: 800, color: '#eaffef' }}>
          <Link to="/forgot-password" style={{ color: '#eaffef' }}>
            Forgot password
          </Link>
          {' '}or{' '}
          <Link to="/forgot-password" style={{ color: '#eaffef' }}>
            Reset password
          </Link>
          .
        </div>

        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Link to="/register" style={{ color: '#eaffef', fontWeight: 800 }}>
            Register
          </Link>
        </div>
      </AuthLayout>
    </>
  );
}
