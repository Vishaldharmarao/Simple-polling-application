import axios from 'axios';

// Build base URL without trailing slash
const RAW_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const BASE = RAW_BASE.replace(/\/$/, '');

// Create centralized axios instance that ensures '/api' prefix
const API = axios.create({
    baseURL: `${BASE}/api`,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Log resolved base URL in development for debugging
if (process.env.NODE_ENV === 'development') {
    console.log('🔗 Resolved API baseURL:', API.defaults.baseURL);
}

// Add user ID from localStorage to all requests
API.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.id) {
            config.headers['X-User-ID'] = user.id;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default API;
