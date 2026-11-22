import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'sonner';
import { Clock } from 'lucide-react';
import { SESSION_DURATION_MS } from '../lib/cookies';

export const SessionTimer: React.FC = () => {
    const { token, expiresAt, loginTime, logout } = useAuthStore();
    
    // El límite exacto de expiración es expiresAt o loginTime + SESSION_DURATION_MS
    const targetExpiry = expiresAt || (loginTime ? loginTime + SESSION_DURATION_MS : null);

    const getRemaining = () => {
        if (!targetExpiry) return SESSION_DURATION_MS;
        return Math.max(0, targetExpiry - Date.now());
    };

    const [timeLeft, setTimeLeft] = useState<number>(getRemaining);
    // El servidor no conoce la sesión ni la hora del navegador: hasta montarse se muestra
    // el mismo marcador en ambos lados para que la hidratación coincida.
    const [montado, setMontado] = useState(false);
    useEffect(() => setMontado(true), []);

    useEffect(() => {
        if (!token || !targetExpiry) return;

        const updateTimer = () => {
            const remaining = targetExpiry - Date.now();

            if (remaining <= 0) {
                clearInterval(interval);
                logout();
                toast.info('Su tiempo de sesión ha terminado.', {
                    description: 'Por seguridad, debes iniciar sesión nuevamente.'
                });
                if (typeof window !== 'undefined') {
                    window.location.replace('/login');
                }
            } else {
                setTimeLeft(remaining);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [token, targetExpiry, logout]);

    if (montado && !token) return null;

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    const isWarning = montado && timeLeft < 2 * 60 * 1000; // Alerta sutil en los últimos 2 minutos
    const reloj = montado ? `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}` : '--:--';

    return (
        <div className={`flex items-center gap-2 text-sm transition-colors duration-300 ${isWarning ? 'text-status-danger' : 'text-muted'}`}>
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline font-light tracking-wide">Tiempo restante:</span>
            <span className={`font-mono font-medium tabular-nums ${isWarning ? 'animate-pulse font-bold' : 'text-primary'}`}>
                {reloj}
            </span>
        </div>
    );
};
