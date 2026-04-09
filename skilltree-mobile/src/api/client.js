import axios from 'axios';

// Expo uses EXPO_PUBLIC_* variables
const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://lifexpskilltree.xyz';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
});
