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

export default API;
