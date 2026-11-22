/**
 * Carga de datos en el servidor de Astro (SSR).
 * Cada página pide solo lo que muestra; si un endpoint falla, devuelve un valor vacío
 * para que la página se renderice igual.
 */
import type { DoctorandoProfile } from '../types/student';
import type { Representative } from '../types';
import { conMemoria } from './server-cache';
import { normalizarCitas, type CitaConRepresentante } from './citas';

export { normalizarCitas, type CitaConRepresentante };

// 127.0.0.1 y no "localhost": en Windows "localhost" prueba primero IPv6 y cada petición se demora
const API_BASE = import.meta.env.PUBLIC_API_URL || import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';

const PERFIL_TTL_MS = 2 * 60 * 1000;
const CATALOGO_TTL_MS = 30 * 1000;

export type SettingsMap = Record<string, any>;


async function getJson<T>(token: string, path: string, vacio: T): Promise<T> {
    try {
        const res = await fetch(`${API_BASE}${path}`, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        return res.ok ? ((await res.json()) as T) : vacio;
    } catch (error) {
        console.error(`Error al consultar ${path}:`, error);
        return vacio;
    }
}

export function fetchPerfil(token: string): Promise<DoctorandoProfile | null> {
    return conMemoria(
        `perfil:${token}`,
        PERFIL_TTL_MS,
        async () => {
            const data = await getJson<any>(token, '/api/auth/me', null);
            return data?.user?.doctorando || data?.doctorando || null;
        },
        (perfil) => perfil !== null,
    );
}

export function fetchSettings(token: string): Promise<SettingsMap> {
    return conMemoria(
        `ajustes:${token}`,
        CATALOGO_TTL_MS,
        async () => {
            const lista = await getJson<any[]>(token, '/api/settings', []);
            const mapa: SettingsMap = {};
            if (Array.isArray(lista)) lista.forEach((s) => s?.key && (mapa[s.key] = s.value));
            return mapa;
        },
        (mapa) => Object.keys(mapa).length > 0,
    );
}

export function fetchRepresentantes(token: string): Promise<Representative[]> {
    return conMemoria(
        `representantes:${token}`,
        CATALOGO_TTL_MS,
        async () => {
            const data = await getJson<Representative[]>(token, '/api/representatives', []);
            return Array.isArray(data) ? data : [];
        },
        (lista) => lista.length > 0,
    );
}

/** Citas del doctorando. Se guardan poco tiempo: la isla "Mis citas" las refresca al cargar. */
export function fetchCitas(token: string): Promise<CitaConRepresentante[]> {
    return conMemoria(`citas:${token}`, 15 * 1000, async () => {
        const data = await getJson<any[]>(token, '/api/appointments/mis-citas', []);
        return normalizarCitas(Array.isArray(data) ? data : []);
    });
}

/** Datos para la vista de agendamiento (/agendar/[id]). */
export async function fetchServerBookingData(token: string, labId: string) {
    const [representantes, settings] = await Promise.all([fetchRepresentantes(token), fetchSettings(token)]);
    return {
        representative: representantes.find((r: any) => String(r.id) === String(labId)) || null,
        settings,
    };
}
