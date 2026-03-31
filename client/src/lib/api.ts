import axios from 'axios';

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api')
    .trim()
    .replace(/[^\x20-\x7E]/g, '') // Strip all non-ASCII characters (including emojis)
    .replace(/\s/g, '');          // Strip any accidental spaces


const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for auth
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        // Use admin token for admin routes, user token for everything else
        const isAdminRoute = config.url?.includes('/admin') || config.url?.includes('/auth/');
        const token = isAdminRoute
            ? localStorage.getItem('admin_token')
            : localStorage.getItem('user_token') || localStorage.getItem('admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Response interceptor for auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            if (window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/login')) {
                window.location.href = '/admin/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
