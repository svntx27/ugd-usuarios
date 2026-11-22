export interface User {
    id: number | string;
    full_name: string;
    email: string;
    role: string;
}

export interface AuthResponse {
    token: string;
    role: string;
    full_name: string;
    user?: {
        id?: number | string;
        name?: string;
        email?: string;
        role?: any;
    };
    role_code?: string;
    message?: string;
}

export interface DoctorandoInfo {
    id: string | number;
    cedula?: string;
    nombres: string;
    apellidos: string;
    fullName?: string;
    nombreCompleto?: string;
    correoInstitucional?: string;
    facultad?: string | { nombre: string } | null;
    carrera?: string | { nombre: string } | null;
    programa?: string | null;
    estadoAcademico?: string;
    hasAccount?: boolean;
    alreadyActivated?: boolean;
}

export interface VerifyDoctorandoResponse {
    valid: boolean;
    alreadyActivated?: boolean;
    message?: string;
    error?: string;
    doctorando?: DoctorandoInfo;
    nombres?: string;
    apellidos?: string;
}

export interface ActivateDoctorandoResponse {
    message: string;
    token: string;
    role?: string;
    role_code?: string;
    full_name?: string;
    user?: {
        id: string | number;
        name: string;
        email: string;
        role?: any;
    };
}

export interface Representative {
    id: number;
    nombre: string;
    name?: string;
    title?: string;
    /** Código del rol del usuario vinculado (DIRECTOR, ANALISTA_PROCESOS...), si existe. */
    roleCode?: string | null;
    ubicacion: string;
    location?: string;
    capacidad: number;
    capacity?: number;
    estado?: 'disponible' | 'mantenimiento' | 'inhabilitado' | 'activo' | 'inactivo';
    status?: string;
}

export interface Appointment {
    id: number;
    representative_id: number;
    lab_id?: number;
    user_id: number | string;
    fecha: string;
    hora_inicio: string | number;
    start_time?: string;
    materia: string;
    representative_nombre?: string;
    lab_nombre?: string;
    estado?: string;
}

// Aliases para compatibilidad de tipos
export type Lab = Representative;
export type Reservation = Appointment;

export interface AvailabilitySlot {
    hora: string;
    time_slot?: string;
    estado: 'libre' | 'ocupado';
}
