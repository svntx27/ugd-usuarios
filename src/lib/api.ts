import axios from 'axios';
import { useAuthStore, getStoredToken } from '../store/useAuthStore';

const api = axios.create({
    baseURL: import.meta.env.PUBLIC_API_URL || import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000',
});

api.interceptors.request.use((config) => {
    const token = getStoredToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const isLockdown = error.response.status === 503 && (
                error.response.data?.code === 'PLATFORM_LOCKDOWN' ||
                String(error.response.data?.error || '').includes('PLATFORM_LOCKDOWN')
            );
            const isAuthError = error.response.status === 401;

            if (isLockdown || isAuthError) {
                const activeToken = getStoredToken();
                if (activeToken) {
                    useAuthStore.getState().logout();
                    if (typeof window !== 'undefined') {
                        const pathname = window.location.pathname;
                        if (!['/login', '/activar', '/activar/contrasena', '/register'].includes(pathname)) {
                            window.location.replace(isLockdown ? '/login?maintenance=true' : '/login');
                        }
                    }
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
