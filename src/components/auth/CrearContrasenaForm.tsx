/** Isla del paso 2 de la activación: contraseña con reglas en tiempo real, activación e inicio de sesión. */
import React, { useEffect, useState } from 'react';
import { Check, CheckCircle2, Lock, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import { toast } from '../../lib/toast';
import { borrarActivacion, leerActivacion, REGLAS_PASSWORD, resumenDoctorando, type DatosActivacion } from '../../lib/activacion';
import { BotonPrincipal, Campo } from './Campo';

export const CrearContrasenaForm: React.FC = () => {
    useAuthGuard(false);
    const activateAccount = useAuthStore((s) => s.activateAccount);
    const [datos, setDatos] = useState<DatosActivacion | null>(null);
    const [password, setPassword] = useState('');
    const [confirmacion, setConfirmacion] = useState('');
    const [cargando, setCargando] = useState(false);

    // Sin la verificación del paso 1 no hay nada que activar
    useEffect(() => {
        const guardados = leerActivacion();
        if (!guardados) window.location.replace('/activar');
        else setDatos(guardados);
    }, []);

    if (!datos) return null;

    const reglas = REGLAS_PASSWORD.map((r) => ({ ...r, ok: r.cumple(password) }));
    const valida = reglas.every((r) => r.ok);
    const coinciden = confirmacion.length > 0 && password === confirmacion;
    const { nombre, facultad, carrera } = resumenDoctorando(datos.doctorando);

    const volver = () => {
        borrarActivacion();
        window.location.assign('/activar');
    };

    const activar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!valida || !coinciden) return;
        setCargando(true);
        try {
            await activateAccount(datos.cedula, datos.correo, password);
            borrarActivacion();
            toast.success('Cuenta activada', { description: 'Bienvenido al portal de la UGD.' });
            window.location.replace('/');
        } catch (error: any) {
            const status = error.response?.status;
            const res = error.response?.data;
            if (status === 409) {
                borrarActivacion();
                toast.info('Tu cuenta ya estaba activada', { description: 'Te llevamos al inicio de sesión.' });
                setTimeout(() => window.location.replace('/login'), 1500);
            } else {
                toast.error('No se pudo activar la cuenta', { description: res?.error || 'Intenta de nuevo en unos minutos.' });
            }
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* En celular el panel lateral no se ve: resumen compacto del doctorando */}
            <div className="space-y-1 rounded-xl border border-border bg-surface-subtle p-4 lg:hidden">
                <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-status-success">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Padrón UGD verificado
                    </span>
                    <button type="button" onClick={volver} className="cursor-pointer text-xs text-muted hover:text-primary">
                        Cambiar
                    </button>
                </div>
                <p className="font-serif text-base font-semibold text-text-main">¡Hola, {nombre}!</p>
                {(facultad || carrera) && <p className="text-xs text-muted">{[facultad, carrera].filter(Boolean).join(' · ')}</p>}
            </div>

            <form className="space-y-4" onSubmit={activar}>
                <Campo
                    id="password"
                    type="password"
                    label="Nueva contraseña"
                    icon={Lock}
                    placeholder="Escribe tu nueva contraseña"
                    autoComplete="new-password"
                    required
                    disabled={cargando}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <ul aria-live="polite" className="space-y-1.5 rounded-xl border border-border-subtle bg-muted-bg p-4 text-xs">
                    {reglas.map((r) => (
                        <li key={r.id} className={`flex items-center gap-2 ${r.ok ? 'font-medium text-status-success' : 'text-muted'}`}>
                            {r.ok ? <Check className="h-3.5 w-3.5 shrink-0" /> : <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-muted-foreground/40" />}
                            {r.label}
                        </li>
                    ))}
                </ul>

                <div>
                    <Campo
                        id="confirmacion"
                        type="password"
                        label="Confirmar contraseña"
                        icon={Lock}
                        placeholder="Repite tu contraseña"
                        autoComplete="new-password"
                        required
                        disabled={cargando}
                        value={confirmacion}
                        onChange={(e) => setConfirmacion(e.target.value)}
                    />
                    {confirmacion.length > 0 && (
                        <p className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${coinciden ? 'text-status-success' : 'text-status-danger'}`}>
                            {coinciden ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                            {coinciden ? 'Las contraseñas coinciden' : 'Las contraseñas aún no coinciden'}
                        </p>
                    )}
                </div>

                <div className="pt-2">
                    <BotonPrincipal cargando={cargando} textoCargando="Activando cuenta…" disabled={!valida || !coinciden}>
                        Activar cuenta e iniciar sesión <CheckCircle2 className="h-4 w-4" />
                    </BotonPrincipal>
                </div>
            </form>

            <button type="button" onClick={volver} className="hidden cursor-pointer text-sm text-muted hover:text-primary lg:block">
                ← ¿No eres tú? Volver a verificar
            </button>
        </div>
    );
};
