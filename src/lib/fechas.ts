/**
 * Utilidades de fechas del expediente doctoral.
 * La base guarda las fechas a medianoche UTC, así que todo se calcula y formatea en UTC
 * para no correr el día al convertir a la hora de Ecuador (UTC-5).
 */

export const NO_REGISTRADO = 'No registrado';

export interface DuracionYMD {
    anios: number;
    meses: number;
    dias: number;
}

/** Convierte un valor de la API en fecha UTC válida, o null. */
export const parseFecha = (valor?: string | null): Date | null => {
    if (!valor) return null;
    const fecha = new Date(valor);
    return isNaN(fecha.getTime()) ? null : fecha;
};

/** Fecha de hoy a medianoche UTC según el calendario de Ecuador. */
export const hoyEcuador = (): Date => {
    const [anio, mes, dia] = new Date()
        .toLocaleDateString('en-CA', { timeZone: 'America/Guayaquil' })
        .split('-')
        .map(Number);
    return new Date(Date.UTC(anio, mes - 1, dia));
};

/** "28 de junio de 2023" */
export const formatFecha = (valor?: string | Date | null): string => {
    const fecha = valor instanceof Date ? valor : parseFecha(valor);
    if (!fecha) return NO_REGISTRADO;
    return fecha.toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
};

/** "jun 2023": para etiquetas compactas en la línea de tiempo. */
export const formatMesAnio = (valor?: string | Date | null): string => {
    const fecha = valor instanceof Date ? valor : parseFecha(valor);
    if (!fecha) return NO_REGISTRADO;
    return fecha.toLocaleDateString('es-EC', { year: 'numeric', month: 'short', timeZone: 'UTC' }).replace('.', '');
};

const diasDelMes = (anio: number, mes: number) => new Date(Date.UTC(anio, mes + 1, 0)).getUTCDate();

/** Suma meses a una fecha; si el día no existe en el mes destino, usa el último día (31 ene + 1 mes = 29 feb). */
const sumarMeses = (fecha: Date, meses: number): Date => {
    const total = fecha.getUTCMonth() + meses;
    const anio = fecha.getUTCFullYear() + Math.floor(total / 12);
    const mes = ((total % 12) + 12) % 12;
    return new Date(Date.UTC(anio, mes, Math.min(fecha.getUTCDate(), diasDelMes(anio, mes))));
};

/** Diferencia exacta en años, meses y días entre dos fechas (desde <= hasta). */
export const diferenciaYMD = (desde: Date, hasta: Date): DuracionYMD => {
    let totalMeses = (hasta.getUTCFullYear() - desde.getUTCFullYear()) * 12 + (hasta.getUTCMonth() - desde.getUTCMonth());
    if (sumarMeses(desde, totalMeses) > hasta) totalMeses -= 1;
    const dias = Math.round((hasta.getTime() - sumarMeses(desde, totalMeses).getTime()) / 86_400_000);
    return { anios: Math.floor(totalMeses / 12), meses: totalMeses % 12, dias };
};

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

/** "8 años, 7 meses y 3 días" (omite las partes en cero). */
export const formatDuracion = ({ anios, meses, dias }: DuracionYMD): string => {
    const partes = [
        anios ? plural(anios, 'año', 'años') : null,
        meses ? plural(meses, 'mes', 'meses') : null,
        dias ? plural(dias, 'día', 'días') : null,
    ].filter(Boolean) as string[];
    if (partes.length === 0) return '0 días';
    if (partes.length === 1) return partes[0];
    return `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`;
};

export const diasEntre = (desde: Date, hasta: Date) => Math.round((hasta.getTime() - desde.getTime()) / 86_400_000);
