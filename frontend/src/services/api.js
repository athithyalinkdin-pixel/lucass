import axios from 'axios';

// Get API base URL from environment or fall back to the Render deployment API
const API_URL = import.meta.env.VITE_API_URL || 'https://lucass-7.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Crucial for cookie-based authentication
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;
