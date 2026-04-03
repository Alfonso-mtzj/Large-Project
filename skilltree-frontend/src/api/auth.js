import axios from 'axios';

// In production (nginx proxy), use same-origin (empty string) so calls go to /api/...
// In development, fall back to http://localhost:5000 via VITE_API_BASE_URL in .env.development
const baseURL = import.meta.env.VITE_API_BASE_URL ?? '';

const API = axios.create({ baseURL });

export const registerUser = (formData) => API.post('/api/register', formData);
export const loginUser    = (formData) => API.post('/api/Login', formData);
