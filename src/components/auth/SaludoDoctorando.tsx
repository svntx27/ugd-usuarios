/** Isla del panel lateral del paso 2: saluda al doctorando verificado con sus datos del padrón. */
import React, { useEffect, useState } from 'react';
import { BookOpen, Building2, CheckCircle2, Mail } from 'lucide-react';
import { leerActivacion, resumenDoctorando, type DatosActivacion } from '../../lib/activacion';

export const SaludoDoctorando: React.FC = () => {
    const [datos, setDatos] = useState<DatosActivacion | null>(null);
    useEffect(() => setDatos(leerActivacion()), []);

    if (!datos) return null;
    const { nombre, facultad, carrera } = resumenDoctorando(datos.doctorando);
    const filas = [
        { icon: Building2, label: 'Facultad', valor: facultad },
        { icon: BookOpen, label: 'Carrera o programa', valor: carrera },
        { icon: Mail, label: 'Correo vinculado', valor: datos.correo },
    ].filter((f) => f.valor);

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-border">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Padrón UGD verificado
                </span>
                <h1 className="font-serif text-4xl font-medium leading-tight tracking-tight sm:text-5xl">¡Hola, {nombre}!</h1>
            </div>

            {filas.length > 0 && (
                <dl className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm">
                    {filas.map(({ icon: Icon, label, valor }) => (
                        <div key={label} className="flex items-start gap-3.5">
                            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                            <div>
                                <dt className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/70">{label}</dt>
                                <dd className="font-medium text-white">{valor}</dd>
                            </div>
                        </div>
                    ))}
                </dl>
            )}

            <p className="text-sm font-light leading-relaxed text-white/80">
                Tus datos fueron validados en el padrón oficial de la Unidad de Gestión de Doctorados. Define tu contraseña para activar tu acceso al portal.
            </p>
        </div>
    );
};
