/** Desplegable de motivos de cita según el rol del representante; "Otro motivo" permite escribirlo. */
import React, { useState } from 'react';
import { MOTIVOS_POR_ROL, OTRO_MOTIVO, rolDeRepresentante } from '../../lib/motivos-cita';
import type { Representative } from '../../types';

interface MotivoCitaProps {
    representante: Representative & { roleCode?: string | null };
    onChange: (motivo: string) => void;
}

const CLASES =
    'w-full rounded-lg border border-border bg-surface-subtle p-4 text-sm text-text-main transition-all focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-gold/25';

export const MotivoCita: React.FC<MotivoCitaProps> = ({ representante, onChange }) => {
    const opciones = MOTIVOS_POR_ROL[rolDeRepresentante(representante)];
    const [seleccion, setSeleccion] = useState('');
    const [otro, setOtro] = useState('');

    const elegir = (valor: string) => {
        setSeleccion(valor);
        onChange(valor === OTRO_MOTIVO ? otro.trim() : valor);
    };

    const escribirOtro = (texto: string) => {
        setOtro(texto);
        onChange(texto.trim());
    };

    return (
        <div className="space-y-3">
            <select id="motivo" value={seleccion} onChange={(e) => elegir(e.target.value)} className={`${CLASES} cursor-pointer`} required>
                <option value="" disabled>
                    Selecciona el motivo de tu cita
                </option>
                {opciones.map((motivo) => (
                    <option key={motivo} value={motivo}>
                        {motivo}
                    </option>
                ))}
                <option value={OTRO_MOTIVO}>{OTRO_MOTIVO}…</option>
            </select>

            {seleccion === OTRO_MOTIVO && (
                <input
                    id="motivo-otro"
                    type="text"
                    value={otro}
                    onChange={(e) => escribirOtro(e.target.value)}
                    maxLength={200}
                    placeholder="Describe brevemente el motivo"
                    aria-label="Describe el motivo de la cita"
                    className={CLASES}
                    autoFocus
                />
            )}
        </div>
    );
};
