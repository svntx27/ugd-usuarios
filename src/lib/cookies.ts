export const AUTH_TOKEN_KEY = 'auth_token';
export const AUTH_USER_KEY = 'auth_user';
export const AUTH_EXPIRY_KEY = 'auth_expiry';

// Duración de la sesión activa para el portal de usuarios: 10 minutos (600 segundos)
export const SESSION_DURATION_SECONDS = 10 * 60; // 600 segundos
export const SESSION_DURATION_MS = SESSION_DURATION_SECONDS * 1000; // 600,000 milisegundos

/**
 * Lee una cookie por su nombre en el entorno del navegador.
 */
export function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Establece una cookie en el navegador con tiempo de vida sincronizado (en segundos).
 */
export function setCookie(name: string, value: string, maxAgeSeconds: number = SESSION_DURATION_SECONDS): void {
    if (typeof document === 'undefined') return;
    const expires = new Date(Date.now() + maxAgeSeconds * 1000).toUTCString();
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
    document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; expires=${expires}; path=/; SameSite=Lax${isSecure ? '; Secure' : ''}`;
}

/**
 * Elimina una cookie en el navegador revocando su fecha de expiración y max-age.
 */
export function deleteCookie(name: string): void {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}
