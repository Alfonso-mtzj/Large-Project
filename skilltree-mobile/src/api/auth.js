import { api } from './client';

export const registerUser = (payload) => 
  api.post('/api/auth/register', payload);

export const loginUser = (payload) => 
  api.post('/api/auth/login', payload);

export const verifyEmail = (token) => 
  api.post(`/api/auth/verify/${token}`);

export const forgotPassword = (email) => 
  api.post('/api/auth/forgot-password', { email });

export const resetPassword = (token, newPassword) => 
  api.post(`/api/auth/reset-password/${token}`, { newPassword });
