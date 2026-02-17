import axios from 'axios';

// Use environment variable with fallback for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Log API URL in development for debugging
if (process.env.NODE_ENV === 'development') {
    console.log('🔗 API Base URL:', API_BASE_URL);
}

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add user ID from localStorage to all requests
apiClient.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.id) {
            config.headers['X-User-ID'] = user.id;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
