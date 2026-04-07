
import axios from 'axios';

const baseURL = 'http://lifexpskilltree.xyz';

const API = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const registerUser = (formData) => API.post('/api/register', formData);
export const loginUser = (formData) => API.post('/api/login', formData);

export const verifyEmail = (token) => API.get(`/api/verify/${token}`, {
  headers: {
    'Cache-Control': 'no-cache'
  }
});

/**
 * NEW: request a password reset email
 * POST /api/forgot-password  body: { email }
 */
export const forgotPassword = (email) =>
  API.post('/api/forgot-password', { email });

/**
 * NEW: reset password using token from email link
 * POST /api/reset-password/:token  body: { password }
 */
export const resetPassword = (token, password) =>
  API.post(`/api/reset-password/${token}`, { password });

export default API;

