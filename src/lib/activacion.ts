/**
 * Datos que pasan del paso 1 (verificación) al paso 2 (contraseña) de la activación.
 * Se guardan en sessionStorage: desaparecen al cerrar la pestaña.
 */
import type { DoctorandoInfo } from '../types';

const CLAVE = 'ugd-activacion';

export interface DatosActivacion {
    cedula: string;
    correo: string;
    doctorando: DoctorandoInfo;
}

export const guardarActivacion = (datos: DatosActivacion) => sessionStorage.setItem(CLAVE, JSON.stringify(datos));

export const leerActivacion = (): DatosActivacion | null => {
    try {
        const datos = JSON.parse(sessionStorage.getItem(CLAVE) || 'null');
        return datos?.doctorando && datos?.cedula && datos?.correo ? datos : null;
    } catch {
        return null;
    }
};

export const borrarActivacion = () => sessionStorage.removeItem(CLAVE);

/** Nombre, facultad y carrera para mostrar, sea cual sea la forma en que la API los envíe. */
export const resumenDoctorando = (d: DoctorandoInfo) => ({
    nombre: d.fullName || d.nombreCompleto || `${d.nombres || ''} ${d.apellidos || ''}`.trim(),
    facultad: typeof d.facultad === 'object' && d.facultad ? d.facultad.nombre : d.facultad || null,
    carrera: typeof d.carrera === 'object' && d.carrera ? d.carrera.nombre : d.carrera || d.programa || null,
});

/** Reglas de contraseña; deben coincidir con express-backend-api/src/lib/password-policy.ts. */
export const REGLAS_PASSWORD: { id: string; label: string; cumple: (p: string) => boolean }[] = [
    { id: 'largo', label: 'Mínimo 8 caracteres', cumple: (p) => p.length >= 8 },
    { id: 'mayuscula', label: 'Una mayúscula (A-Z)', cumple: (p) => /[A-Z]/.test(p) },
    { id: 'minuscula', label: 'Una minúscula (a-z)', cumple: (p) => /[a-z]/.test(p) },
    { id: 'numero', label: 'Al menos un número (0-9)', cumple: (p) => /[0-9]/.test(p) },
    { id: 'especial', label: 'Un carácter especial (@, #, $, etc.)', cumple: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(p) },
];
