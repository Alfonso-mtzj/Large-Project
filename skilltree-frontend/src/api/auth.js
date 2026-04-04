import axios from 'axios';

/*
const baseURL = import.meta.env.VITE_API_URL || 'http://lifexpskilltree.xyz/api/register';

const API = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});
*/

const API = axios.create({
  baseURL: 'http://134.209.72.180:5000'
});

export const registerUser = (formData) => API.post('/api/register', formData);
export const loginUser = (formData) => API.post('/api/login', formData);

//export default API;
