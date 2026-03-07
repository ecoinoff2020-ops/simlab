import axios from 'axios';

let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://simlab-backend-q4cn.onrender.com/api';

// Si el baseUrl no termina en /api o /api/, se lo añadimos para evitar errores 404
if (!baseUrl.toLowerCase().includes('/api')) {
    baseUrl = baseUrl.replace(/\/$/, '') + '/api';
}

const api = axios.create({
    baseURL: baseUrl.replace(/\/$/, '') + '/',
    headers: {
        'Content-Type': 'application/json',
    },
});

console.log('API Base URL:', api.defaults.baseURL);

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
