/** Tipos y normalización de citas, compartidos por el servidor y la isla de "Mis citas". */

export interface CitaConRepresentante {
    id: number;
    fecha: string;
    hora_inicio: string;
    materia: string;
    estado?: string;
    representative_id?: number;
    representative_nombre: string;
    [key: string]: any;
}

/** Normaliza y ordena las citas: las más recientes primero. */
export const normalizarCitas = (lista: any[]): CitaConRepresentante[] =>
    lista
        .map((a) => ({
            ...a,
            representative_nombre: a.representative_nombre || a.lab_nombre || 'Representante UGD',
            representative_id: a.representative_id || a.lab_id,
        }))
        .sort((a, b) => {
            const fa = String(a.fecha || '').split('T')[0];
            const fb = String(b.fecha || '').split('T')[0];
            if (fa !== fb) return fa > fb ? -1 : 1;
            return String(b.hora_inicio || '').localeCompare(String(a.hora_inicio || ''));
        });
