/**
 * Motivos de cita sugeridos según el rol del representante de la UGD.
 * Para agregar o cambiar motivos basta con editar estas listas.
 */
import type { Representative } from '../types';

export type RolRepresentante = 'DIRECTOR' | 'ANALISTA_PROCESOS' | 'ANALISTA_TECNICO' | 'GENERAL';

export const OTRO_MOTIVO = 'Otro motivo';

export const MOTIVOS_POR_ROL: Record<RolRepresentante, string[]> = {
    DIRECTOR: [
        'Reunión sobre el estado de mi expediente doctoral',
        'Firma o aprobación de documentos oficiales',
        'Solicitud de adenda o prórroga del contrato de beca',
        'Consulta sobre el periodo de devengamiento',
        'Consulta sobre el convenio con la institución de destino',
        'Situación legal o de cobro del expediente',
    ],
    ANALISTA_PROCESOS: [
        'Entrega de informe de avance',
        'Trámite de adenda al contrato de beca',
        'Requisitos de graduación y cierre del contrato',
        'Inicio o seguimiento del devengamiento',
        'Actualización de datos del expediente',
        'Entrega o revisión de documentación',
    ],
    ANALISTA_TECNICO: [
        'Problemas para ingresar al portal',
        'Actualización de correo o datos de contacto',
        'Ayuda con el agendamiento de citas',
        'Problemas al ver mi información en el portal',
        'Otra consulta técnica sobre el sistema',
    ],
    GENERAL: [
        'Consulta sobre mi expediente doctoral',
        'Entrega de documentación',
        'Consulta sobre contrato y adendas',
        'Consulta sobre devengamiento',
    ],
};

const quitarTildes = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Usa el rol del usuario vinculado; si no hay, lo deduce del cargo del representante. */
export function rolDeRepresentante(rep: Pick<Representative, 'title'> & { roleCode?: string | null }): RolRepresentante {
    if (rep.roleCode && rep.roleCode in MOTIVOS_POR_ROL) return rep.roleCode as RolRepresentante;
    const cargo = quitarTildes(rep.title || '');
    if (cargo.includes('director')) return 'DIRECTOR';
    if (cargo.includes('proceso')) return 'ANALISTA_PROCESOS';
    if (cargo.includes('tecnic')) return 'ANALISTA_TECNICO';
    return 'GENERAL';
}
