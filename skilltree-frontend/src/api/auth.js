import axios from 'axios';

const API = axios.create({ baseURL: 'mongodb+srv://admin:<db_password>@cluster0.8mpvvxu.mongodb.net/?appName=Cluster0' });

export const registerUser = (formData) => API.post('/api/register', formData);
export const loginUser    = (formData) => API.post('/api/login', formData);
