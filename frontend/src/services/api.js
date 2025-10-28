import axios from 'axios';

const env = (window && (window).ENV) || {};
const baseURL = env.API_BASE_URL || process.env.REACT_APP_API_URL || 'http://localhost:8888';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

