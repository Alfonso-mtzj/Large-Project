import { api } from './client';

export const registerUser = (payload) => api.post('/api/register', payload);
export const loginUser = (payload) => api.post('/api/login', payload);
export const verifyEmail = (token) => api.get(`/api/verify/${token}`);
