/**
 * Arma la trayectoria doctoral (contrato → adendas → graduación → devengamiento)
 * solo con los datos que existen en el expediente. No inventa fechas.
 */
import type { ExpedienteDoctoralReal } from '../types/student';
import { diasEntre, diferenciaYMD, hoyEcuador, parseFecha, type DuracionYMD } from './fechas';

export type EstadoHito = 'completado' | 'en_curso' | 'pendiente' | 'sin_fecha';
export type TipoHito = 'contrato' | 'adenda' | 'graduacion' | 'devengamiento';

export interface Hito {
    id: string;
    tipo: TipoHito;
    titulo: string;
    detalle?: string | null;
    inicio: Date | null;
    fin: Date | null;
    estado: EstadoHito;
}

export interface ResumenDevengamiento {
    inicio: Date | null;
    fin: Date | null;
    /** Tiempo total entre inicio y fin, calculado exacto. */
    total: DuracionYMD | null;
    /** Lo que le queda desde hoy hasta el fin (null si ya terminó o no hay fecha de fin). */
    restante: DuracionYMD | null;
    /** Porcentaje transcurrido 0-100 (null si faltan fechas). */
    progreso: number | null;
    cumplido: boolean;
    /** Texto oficial registrado por la UGD, si existe. */
    tiempoOficial: string | null;
    estadoRegistrado: string | null;
}

export interface Trayectoria {
    hitos: Hito[];
    contratoVigenteHasta: Date | null;
    graduacion: Date | null;
    devengamiento: ResumenDevengamiento | null;
}

const estadoPorFechas = (inicio: Date | null, fin: Date | null, hoy: Date): EstadoHito => {
    if (!inicio && !fin) return 'sin_fecha';
    if (fin && fin < hoy) return 'completado';
    if (inicio && inicio > hoy) return 'pendiente';
    return 'en_curso';
};

const maxFecha = (fechas: (Date | null)[]) =>
    fechas.filter((f): f is Date => !!f).sort((a, b) => b.getTime() - a.getTime())[0] || null;

export const construirTrayectoria = (expediente: ExpedienteDoctoralReal | null, hoy: Date = hoyEcuador()): Trayectoria => {
    if (!expediente) return { hitos: [], contratoVigenteHasta: null, graduacion: null, devengamiento: null };

    const hitos: Hito[] = [];
    const contratoInicio = parseFecha(expediente.contratoInicio);
    const contratoFin = parseFecha(expediente.contratoFin);

    if (contratoInicio || contratoFin) {
        hitos.push({
            id: 'contrato',
            tipo: 'contrato',
            titulo: 'Contrato de beca',
            detalle: expediente.contratoMeses ? `${expediente.contratoMeses} meses` : null,
            inicio: contratoInicio,
            fin: contratoFin,
            estado: estadoPorFechas(contratoInicio, contratoFin, hoy),
        });
    }

    const adendas = [...(expediente.adendas || [])].sort((a, b) => a.numeroAdenda - b.numeroAdenda);
    for (const adenda of adendas) {
        const inicio = parseFecha(adenda.fechaInicio);
        const fin = parseFecha(adenda.fechaFin);
        hitos.push({
            id: adenda.id,
            tipo: 'adenda',
            titulo: `Adenda N° ${adenda.numeroAdenda}`,
            detalle: [adenda.tipoModificacion, adenda.meses != null ? `${adenda.meses} meses` : null].filter(Boolean).join(' · ') || null,
            inicio,
            fin,
            estado: estadoPorFechas(inicio, fin, hoy),
        });
    }

    const dev = expediente.devengamiento;
    const devInicio = parseFecha(dev?.fechaInicio);
    const devFin = parseFecha(dev?.fechaFinEstimada);

    // La graduación coincide con el inicio del devengamiento; solo se muestra si el expediente está graduado
    const graduacion = expediente.estado?.toUpperCase() === 'GRADUADO' ? devInicio : null;
    if (graduacion) {
        hitos.push({
            id: 'graduacion',
            tipo: 'graduacion',
            titulo: 'Graduación',
            detalle: 'Fecha registrada por la UGD',
            inicio: graduacion,
            fin: graduacion,
            estado: graduacion <= hoy ? 'completado' : 'pendiente',
        });
    }

    let devengamiento: ResumenDevengamiento | null = null;
    if (dev) {
        const cumplido = !!devFin && devFin < hoy;
        let progreso: number | null = null;
        if (devInicio && devFin && devFin > devInicio) {
            const total = diasEntre(devInicio, devFin);
            progreso = Math.min(100, Math.max(0, Math.round((diasEntre(devInicio, hoy) / total) * 100)));
        }
        devengamiento = {
            inicio: devInicio,
            fin: devFin,
            total: devInicio && devFin && devFin >= devInicio ? diferenciaYMD(devInicio, devFin) : null,
            restante: devFin && !cumplido ? diferenciaYMD(devInicio && devInicio > hoy ? devInicio : hoy, devFin) : null,
            progreso,
            cumplido,
            tiempoOficial: dev.tiempoTexto || null,
            estadoRegistrado: dev.estado || null,
        };
        hitos.push({
            id: 'devengamiento',
            tipo: 'devengamiento',
            titulo: 'Devengamiento',
            detalle: dev.tiempoTexto || null,
            inicio: devInicio,
            fin: devFin,
            estado: estadoPorFechas(devInicio, devFin, hoy),
        });
    }

    return {
        hitos,
        contratoVigenteHasta: maxFecha([contratoFin, ...adendas.map((a) => parseFecha(a.fechaFin))]),
        graduacion,
        devengamiento,
    };
};
