import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../lib/api';
import type { AuthResponse, User, ActivateDoctorandoResponse } from '../types';
import {
    setCookie,
    getCookie,
    deleteCookie,
    AUTH_TOKEN_KEY,
    AUTH_USER_KEY,
    AUTH_EXPIRY_KEY,
    SESSION_DURATION_SECONDS,
    SESSION_DURATION_MS,
} from '../lib/cookies';

interface AuthState {
    token: string | null;
    user: User | null;
    role: string | null;
    loginTime?: number;
    expiresAt?: number;
    setAuth: (data: AuthResponse) => void;
    logout: () => void;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    activateAccount: (cedula: string, correo: string, password: string) => Promise<ActivateDoctorandoResponse>;
}

/**
 * Recupera el estado síncrono inicial combinando sessionStorage y Cookies.
 * Valida de forma estricta que la sesión no haya superado el tiempo límite de 10 minutos.
 * Si ya venció (por ejemplo, tras reiniciar la máquina o cerrar el navegador), revoca la sesión inmediatamente.
 */
export const getStoredAuthData = (): {
    token: string | null;
    user: User | null;
    role: string | null;
    loginTime?: number;
    expiresAt?: number;
} => {
    if (typeof window === 'undefined') {
        return { token: null, user: null, role: null, loginTime: undefined, expiresAt: undefined };
    }

    const now = Date.now();

    // 1. Intentar desde sessionStorage
    try {
        const raw = sessionStorage.getItem('auth-storage');
        if (raw) {
            const parsed = JSON.parse(raw);
            const state = parsed?.state;
            if (state?.token) {
                const targetExpiry = state.expiresAt || (state.loginTime ? state.loginTime + SESSION_DURATION_MS : null);
                
                // Si la sesión ya expiró, purgarla inmediatamente
                if (targetExpiry && now >= targetExpiry) {
                    sessionStorage.removeItem('auth-storage');
                    deleteCookie(AUTH_TOKEN_KEY);
                    deleteCookie(AUTH_USER_KEY);
                    deleteCookie(AUTH_EXPIRY_KEY);
                    return { token: null, user: null, role: null, loginTime: undefined, expiresAt: undefined };
                }

                return {
                    token: state.token,
                    user: state.user || null,
                    role: state.role || null,
                    loginTime: state.loginTime,
                    expiresAt: targetExpiry || (now + SESSION_DURATION_MS),
                };
            }
        }
    } catch {
        // Ignorar errores de parsing
    }

    // 2. Fallback: Intentar desde Cookies
    const cookieToken = getCookie(AUTH_TOKEN_KEY);
    const cookieExpiry = getCookie(AUTH_EXPIRY_KEY);

    if (cookieToken) {
        const targetExpiry = cookieExpiry ? Number(cookieExpiry) : null;
        if (targetExpiry && now >= targetExpiry) {
            deleteCookie(AUTH_TOKEN_KEY);
            deleteCookie(AUTH_USER_KEY);
            deleteCookie(AUTH_EXPIRY_KEY);
            return { token: null, user: null, role: null, loginTime: undefined, expiresAt: undefined };
        }

        let cookieUser: User | null = null;
        try {
            const rawUser = getCookie(AUTH_USER_KEY);
            if (rawUser) cookieUser = JSON.parse(rawUser);
        } catch {
            // Ignorar errores de parsing en cookie
        }

        const validExpiry = targetExpiry || (now + SESSION_DURATION_MS);
        const validLoginTime = validExpiry - SESSION_DURATION_MS;

        return {
            token: cookieToken,
            user: cookieUser,
            role: cookieUser?.role || 'student',
            loginTime: validLoginTime,
            expiresAt: validExpiry,
        };
    }

    return { token: null, user: null, role: null, loginTime: undefined, expiresAt: undefined };
};

/**
 * Helper síncrono para obtener el token activo sin esperar ciclos de rehidratación
 */
export const getStoredToken = (): string | null => {
    const stored = getStoredAuthData();
    if (stored.token) return stored.token;
    return null;
};

const initialAuth = getStoredAuthData();

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: initialAuth.token,
            user: initialAuth.user,
            role: initialAuth.role,
            loginTime: initialAuth.loginTime,
            expiresAt: initialAuth.expiresAt,
            setAuth: (data) => {
                const now = Date.now();
                const expiresAt = now + SESSION_DURATION_MS;
                const userObj: User = {
                    id: data.user?.id || 0,
                    full_name: data.full_name || data.user?.name || '',
                    email: data.user?.email || '',
                    role: data.role || data.role_code || 'student',
                };

                setCookie(AUTH_TOKEN_KEY, data.token, SESSION_DURATION_SECONDS);
                setCookie(AUTH_USER_KEY, JSON.stringify(userObj), SESSION_DURATION_SECONDS);
                setCookie(AUTH_EXPIRY_KEY, String(expiresAt), SESSION_DURATION_SECONDS);

                set({
                    token: data.token,
                    user: userObj,
                    role: userObj.role,
                    loginTime: now,
                    expiresAt,
                });
            },
            logout: () => {
                deleteCookie(AUTH_TOKEN_KEY);
                deleteCookie(AUTH_USER_KEY);
                deleteCookie(AUTH_EXPIRY_KEY);
                if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('auth-storage');
                }
                set({ token: null, user: null, role: null, loginTime: undefined, expiresAt: undefined });
            },
            login: async (email, password) => {
                const response = await api.post('/auth/login', { email, password });
                const data = response.data;
                const now = Date.now();
                const expiresAt = now + SESSION_DURATION_MS;
                const userObj: User = {
                    id: data.user?.id || 0,
                    full_name: data.full_name || data.user?.name || '',
                    email,
                    role: data.role || 'student',
                };

                setCookie(AUTH_TOKEN_KEY, data.token, SESSION_DURATION_SECONDS);
                setCookie(AUTH_USER_KEY, JSON.stringify(userObj), SESSION_DURATION_SECONDS);
                setCookie(AUTH_EXPIRY_KEY, String(expiresAt), SESSION_DURATION_SECONDS);

                set({
                    token: data.token,
                    user: userObj,
                    role: userObj.role,
                    loginTime: now,
                    expiresAt,
                });
            },
            register: async (name, email, password) => {
                const response = await api.post('/auth/register', { full_name: name, email, password });
                const data = response.data;
                const now = Date.now();
                const expiresAt = now + SESSION_DURATION_MS;
                const userObj: User = {
                    id: data.user?.id || 0,
                    full_name: data.full_name || data.user?.name || name,
                    email,
                    role: data.role || 'student',
                };

                setCookie(AUTH_TOKEN_KEY, data.token, SESSION_DURATION_SECONDS);
                setCookie(AUTH_USER_KEY, JSON.stringify(userObj), SESSION_DURATION_SECONDS);
                setCookie(AUTH_EXPIRY_KEY, String(expiresAt), SESSION_DURATION_SECONDS);

                set({
                    token: data.token,
                    user: userObj,
                    role: userObj.role,
                    loginTime: now,
                    expiresAt,
                });
            },
            activateAccount: async (cedula, correo, password) => {
                const response = await api.post<ActivateDoctorandoResponse>('/api/auth/activar-cuenta', {
                    cedula,
                    correo,
                    password
                }).catch(() => api.post<ActivateDoctorandoResponse>('/auth/activar-cuenta', {
                    cedula,
                    correo,
                    password
                }));
                const data = response.data;
                const now = Date.now();
                const expiresAt = now + SESSION_DURATION_MS;
                const userFullName = data.full_name || data.user?.name || 'Estudiante';
                const userRole = data.role || data.role_code || 'student';
                const userObj: User = {
                    id: data.user?.id || 0,
                    full_name: userFullName,
                    email: data.user?.email || correo,
                    role: userRole,
                };

                setCookie(AUTH_TOKEN_KEY, data.token, SESSION_DURATION_SECONDS);
                setCookie(AUTH_USER_KEY, JSON.stringify(userObj), SESSION_DURATION_SECONDS);
                setCookie(AUTH_EXPIRY_KEY, String(expiresAt), SESSION_DURATION_SECONDS);

                set({
                    token: data.token,
                    user: userObj,
                    role: userRole,
                    loginTime: now,
                    expiresAt,
                });

                return data;
            }
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => (typeof window !== 'undefined' ? sessionStorage : (null as any))),
        }
    )
);
