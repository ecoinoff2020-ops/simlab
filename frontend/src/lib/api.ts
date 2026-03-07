import axios from 'axios';

const api = axios.create({
    baseURL: (process.env.NEXT_PUBLIC_API_URL || 'https://simlab-backend-q4cn.onrender.com/api').replace(/\/$/, '') + '/',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para incluir el token JWT en las peticiones
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;
