/**
 * Isla interactiva de "Mis citas": lista las citas, permite cancelarlas y se actualiza sola.
 * Recibe las citas ya cargadas en el servidor para que la primera vista no espere a la API.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import { toast } from '../../lib/toast';
import { normalizarCitas, type CitaConRepresentante } from '../../lib/citas';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface MisCitasProps {
    initialCitas: CitaConRepresentante[];
    duracionTurno?: string | number;
}

const ACTUALIZAR_CADA_MS = 15000;

const formatearFecha = (fecha: string) => {
    const [anio, mes, dia] = String(fecha).split('T')[0].split('-');
    return dia && mes && anio ? `${dia}/${mes}/${anio}` : String(fecha);
};

export const MisCitas: React.FC<MisCitasProps> = ({ initialCitas, duracionTurno = 30 }) => {
    const [citas, setCitas] = useState<CitaConRepresentante[]>(initialCitas);
    const [citaACancelar, setCitaACancelar] = useState<number | null>(null);
    const [cancelando, setCancelando] = useState(false);

    const recargar = useCallback(async () => {
        try {
            const res = await api.get('/appointments/mis-citas');
            if (Array.isArray(res.data)) setCitas(normalizarCitas(res.data));
        } catch {
            // Si falla una actualización periódica se conserva la última lista conocida
        }
    }, []);

    useEffect(() => {
        // La lista del servidor puede tener unos segundos: se refresca apenas carga la página
        recargar();
        const intervalo = setInterval(recargar, ACTUALIZAR_CADA_MS);
        return () => clearInterval(intervalo);
    }, [recargar]);

    const confirmarCancelacion = async () => {
        if (citaACancelar === null) return;
        setCancelando(true);
        try {
            await api.delete(`/appointments/citas/${citaACancelar}`);
            toast.success('Cita cancelada', { description: 'El turno quedó libre para otros estudiantes.' });
            await recargar();
        } catch {
            toast.error('No se pudo cancelar la cita', { description: 'Inténtalo de nuevo en unos minutos.' });
        } finally {
            setCancelando(false);
            setCitaACancelar(null);
        }
    };

    if (citas.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center">
                <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted">No tienes citas presenciales agendadas.</p>
                <a href="/agendar" className="mt-3 inline-block text-sm font-medium text-primary underline underline-offset-4">
                    Agendar una cita
                </a>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto rounded-xl border border-border bg-surface">
                <table className="w-full text-left text-sm">
                    <caption className="sr-only">Citas presenciales agendadas</caption>
                    <thead>
                        <tr className="text-[11px] uppercase tracking-wide text-muted">
                            <th scope="col" className="px-6 py-3 font-medium">Representante</th>
                            <th scope="col" className="px-4 py-3 font-medium">Fecha</th>
                            <th scope="col" className="px-4 py-3 font-medium">Hora</th>
                            <th scope="col" className="px-4 py-3 font-medium">Motivo</th>
                            <th scope="col" className="px-4 py-3 font-medium">Duración</th>
                            <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                            <th scope="col" className="px-6 py-3 font-medium text-right">
                                <span className="sr-only">Acciones</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle border-t border-border-subtle tabular-nums">
                        {citas.map((cita: CitaConRepresentante) => {
                            const activa = cita.estado === 'active';
                            return (
                                <tr key={cita.id}>
                                    <td className="px-6 py-4 font-serif text-base text-text-main">{cita.representative_nombre}</td>
                                    <td className="px-4 py-4 text-text-body whitespace-nowrap">{formatearFecha(cita.fecha)}</td>
                                    <td className="px-4 py-4 font-medium text-text-main">{cita.hora_inicio}</td>
                                    <td className="px-4 py-4 text-text-body">{cita.materia}</td>
                                    <td className="px-4 py-4 text-muted whitespace-nowrap">{duracionTurno} min</td>
                                    <td className="px-4 py-4">
                                        <span className="inline-flex items-center gap-1.5 text-xs text-text-body whitespace-nowrap">
                                            <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${activa ? 'bg-status-success' : 'bg-muted-foreground'}`} />
                                            {activa ? 'Confirmada' : 'Finalizada'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {activa && (
                                            <button
                                                type="button"
                                                onClick={() => setCitaACancelar(cita.id)}
                                                className="rounded p-2 text-muted transition-colors hover:text-status-danger focus:outline-none focus:ring-2 focus:ring-gold cursor-pointer"
                                                aria-label={`Cancelar la cita del ${formatearFecha(cita.fecha)} a las ${cita.hora_inicio}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={citaACancelar !== null}
                onClose={() => setCitaACancelar(null)}
                title="Cancelar cita presencial"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setCitaACancelar(null)}>
                            Mantener cita
                        </Button>
                        <Button onClick={confirmarCancelacion} disabled={cancelando}>
                            {cancelando ? 'Cancelando…' : 'Confirmar cancelación'}
                        </Button>
                    </>
                }
            >
                <p className="py-2 text-text-body">El turno quedará libre de inmediato para otros estudiantes.</p>
            </Modal>
        </>
    );
};
