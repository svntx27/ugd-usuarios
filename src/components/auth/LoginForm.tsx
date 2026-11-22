/** Isla del formulario de inicio de sesión. */
import React, { useState } from 'react';
import { AlertTriangle, Lock, Mail } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import { toast } from '../../lib/toast';
import { BotonPrincipal, Campo } from './Campo';

export const LoginForm: React.FC<{ mantenimientoInicial?: boolean }> = ({ mantenimientoInicial = false }) => {
    useAuthGuard(false);
    const login = useAuthStore((s) => s.login);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cargando, setCargando] = useState(false);
    const [mantenimiento, setMantenimiento] = useState(mantenimientoInicial);

    const enviar = async (e: React.FormEvent) => {
        e.preventDefault();
        setCargando(true);
        try {
            await login(email, password);
            toast.success('Sesión iniciada', { description: 'Bienvenido al portal de la UGD.' });
            window.location.replace('/');
        } catch (error: any) {
            const datos = error.response?.data;
            if (error.response?.status === 503 || datos?.code === 'PLATFORM_LOCKDOWN' || String(datos?.error || '').includes('PLATFORM_LOCKDOWN')) {
                setMantenimiento(true);
            }
            toast.error('No se pudo iniciar sesión', {
                description: typeof datos?.error === 'string' ? datos.error : 'Verifica tu correo y contraseña.',
            });
        } finally {
            setCargando(false);
        }
    };

    return (
        <>
            {mantenimiento && (
                <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-status-warning-border bg-status-warning-bg p-4 text-status-warning-text">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-status-warning" />
                    <div>
                        <p className="text-sm font-semibold">Portal en mantenimiento</p>
                        <p className="mt-1 text-xs leading-relaxed">
                            El acceso está suspendido temporalmente por trabajos técnicos. Por favor, intenta más tarde.
                        </p>
                    </div>
                </div>
            )}

            <form className="space-y-4" onSubmit={enviar}>
                <Campo
                    id="email"
                    type="email"
                    icon={Mail}
                    placeholder="Correo institucional"
                    autoComplete="email"
                    required
                    disabled={cargando}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Campo
                    id="password"
                    type="password"
                    icon={Lock}
                    placeholder="Contraseña"
                    autoComplete="current-password"
                    required
                    disabled={cargando}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <div className="pt-2">
                    <BotonPrincipal cargando={cargando} textoCargando="Conectando…">
                        Iniciar sesión
                    </BotonPrincipal>
                </div>
            </form>
        </>
    );
};
