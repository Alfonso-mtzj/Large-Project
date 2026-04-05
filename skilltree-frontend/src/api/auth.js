import axios from 'axios';

const baseURL = 'http://134.209.72.180:5000';

const API = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});



export const registerUser = (formData) => API.post('/api/register', formData);
export const loginUser = (formData) => API.post('/api/login', formData);

export default API;
