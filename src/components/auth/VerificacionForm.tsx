/** Isla del paso 1 de la activación: verifica cédula y correo en el padrón de la UGD. */
import React, { useState } from 'react';
import { ArrowRight, CreditCard, Mail } from 'lucide-react';
import api from '../../lib/api';
import { toast } from '../../lib/toast';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import { guardarActivacion } from '../../lib/activacion';
import type { VerifyDoctorandoResponse } from '../../types';
import { BotonPrincipal, Campo } from './Campo';

export const VerificacionForm: React.FC = () => {
    useAuthGuard(false);
    const [cedula, setCedula] = useState('');
    const [correo, setCorreo] = useState('');
    const [cargando, setCargando] = useState(false);

    const verificar = async (e: React.FormEvent) => {
        e.preventDefault();
        const datos = { cedula: cedula.trim(), correo: correo.trim().toLowerCase() };
        if (!datos.cedula || !datos.correo) {
            toast.warning('Campos incompletos', { description: 'Ingresa tu cédula y tu correo institucional.' });
            return;
        }

        setCargando(true);
        try {
            const { data } = await api.post<VerifyDoctorandoResponse>('/api/auth/verificar-doctorando', datos);
            if (data.valid && data.doctorando) {
                guardarActivacion({ ...datos, doctorando: data.doctorando });
                window.location.assign('/activar/contrasena');
                return;
            }
            toast.error('Doctorando no registrado', { description: 'Tus datos no constan en el padrón oficial de la UGD.' });
        } catch (error: any) {
            const status = error.response?.status;
            const res = error.response?.data;
            if (status === 409 || res?.alreadyActivated) {
                toast.info('Cuenta ya activada', { description: res?.error || 'Tu cuenta ya está activa. Inicia sesión.' });
            } else if (status === 404) {
                toast.error('Doctorando no registrado', {
                    description: res?.error || 'Verifica tu cédula y tu correo institucional (@uce.edu.ec).',
                });
            } else {
                toast.error('No se pudo verificar', { description: res?.error || 'Intenta de nuevo en unos minutos.' });
            }
        } finally {
            setCargando(false);
        }
    };

    return (
        <form className="space-y-4" onSubmit={verificar}>
            <Campo
                id="cedula"
                label="Cédula"
                icon={CreditCard}
                inputMode="numeric"
                placeholder="Ej. 1729876543"
                autoComplete="off"
                required
                disabled={cargando}
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
            />
            <Campo
                id="correo"
                type="email"
                label="Correo institucional (@uce.edu.ec)"
                icon={Mail}
                placeholder="usuario@uce.edu.ec"
                autoComplete="email"
                required
                disabled={cargando}
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                ayuda="Debe coincidir con el correo registrado en la UGD."
            />
            <div className="pt-2">
                <BotonPrincipal cargando={cargando} textoCargando="Consultando el padrón…">
                    Verificar mis datos <ArrowRight className="h-4 w-4" />
                </BotonPrincipal>
            </div>
        </form>
    );
};
