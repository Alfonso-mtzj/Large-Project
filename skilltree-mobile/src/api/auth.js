import { api } from './client';

export const registerUser = (payload) => 
  api.post('/api/register', payload);

export const loginUser = (payload) => 
  api.post('/api/login', payload);

export const verifyEmail = (token) => 
  api.post(`/api/verify/${token}`);

export const forgotPassword = (email) => 
  api.post('/api/forgot-password', { email });

export const resetPassword = (token, newPassword) => 
  api.post(`/api/reset-password/${token}`, { newPassword });
