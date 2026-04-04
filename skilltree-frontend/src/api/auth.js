import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://lifexpskilltree.xyz/api/register';

const API = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});



export const registerUser = (formData) => API.post('/api/register', formData);
export const loginUser = (formData) => API.post('/api/login', formData);

export default API;
