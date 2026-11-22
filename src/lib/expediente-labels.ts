/** Etiquetas y estilos compartidos del expediente doctoral. */
import { NO_REGISTRADO } from './fechas';

export interface EstadoBadge {
    label: string;
    classes: string;
}

export const getEstadoBadge = (estado?: string | null): EstadoBadge => {
    switch (estado?.toUpperCase()) {
        case 'EN_ESTUDIOS':
            return { label: 'En Estudios', classes: 'bg-status-success-bg text-status-success-text border-status-success-border' };
        case 'GRADUADO':
            return { label: 'Graduado', classes: 'bg-status-info-bg text-status-info-text border-status-info-border' };
        case 'EN_DEVENGAMIENTO':
        case 'DEVENGADO':
            return { label: 'En Devengamiento', classes: 'bg-gold-light text-gold-text border-gold-border' };
        case 'SUSPENDIDO':
            return { label: 'Suspendido', classes: 'bg-status-warning-bg text-status-warning-text border-status-warning-border' };
        case 'EN_COBRO':
        case 'DESTITUIDO':
        case 'RENUNCIA':
            return {
                label: estado!.replace('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
                classes: 'bg-status-danger-bg text-status-danger border-status-danger-border',
            };
        default:
            return { label: estado || NO_REGISTRADO, classes: 'bg-surface-subtle text-text-main border-border' };
    }
};

export const DEVENGAMIENTO_LABELS: Record<string, string> = {
    PENDIENTE: 'Pendiente',
    EN_CURSO: 'En curso',
    FINALIZADO: 'Finalizado',
};

/** En la base: "H" = hombre, "M" = mujer. */
export const etiquetaSexo = (sexo?: string | null): string => {
    if (sexo === 'H') return 'Masculino';
    if (sexo === 'M' || sexo === 'F') return 'Femenino';
    return sexo || NO_REGISTRADO;
};
