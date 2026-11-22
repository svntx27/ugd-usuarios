/** Secciones del panel del doctorando: una ruta por sección. */
export type SeccionPanel = 'resumen' | 'datos' | 'formacion' | 'contrato' | 'citas' | 'agendar';

export interface ItemMenu {
    id: SeccionPanel;
    label: string;
    href: string;
}

export const MENU_PANEL: { grupo: string; items: ItemMenu[] }[] = [
    {
        grupo: 'Expediente doctoral',
        items: [
            { id: 'resumen', label: 'Resumen doctoral', href: '/' },
            { id: 'datos', label: 'Datos personales', href: '/expediente/datos-personales' },
            { id: 'formacion', label: 'Formación y títulos', href: '/expediente/formacion' },
            { id: 'contrato', label: 'Contrato y convenio', href: '/expediente/contrato' },
        ],
    },
    {
        grupo: 'Servicios presenciales',
        items: [
            { id: 'citas', label: 'Mis citas agendadas', href: '/citas' },
            { id: 'agendar', label: 'Agendar cita presencial', href: '/agendar' },
        ],
    },
];

export const etiquetaSeccion = (id: SeccionPanel) =>
    MENU_PANEL.flatMap((g) => g.items).find((i) => i.id === id)?.label || 'Expediente doctoral';
