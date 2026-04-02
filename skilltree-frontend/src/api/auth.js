import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000' });

export const registerUser = (formData) => API.post('/api/register', formData);
export const loginUser    = (formData) => API.post('/api/Login', formData);
