import React, { useEffect, useState, useCallback } from 'react';
import { toast } from '../lib/toast';
import api from '../lib/api';
import type { Representative, AvailabilitySlot } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ArrowLeft, Clock, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';
import { SettingsService } from '../lib/settings.service';
import { useAuthStore, getStoredToken } from '../store/useAuthStore';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { MotivoCita } from './citas/MotivoCita';

export interface BookingPageProps {
    labId: string;
    initialRepresentative?: Representative | null;
    initialSettings?: Record<string, any> | null;
    /** Token conocido en el servidor: evita que el HTML del servidor y el del navegador difieran. */
    initialToken?: string | null;
}

export const BookingPage: React.FC<BookingPageProps> = ({
    labId,
    initialRepresentative = null,
    initialSettings = null,
    initialToken = null,
}) => {
    useAuthGuard(true);
    const storeToken = useAuthStore((state) => state.token);
    const token = storeToken || initialToken || getStoredToken();
    const [representative, setRepresentative] = useState<Representative | null>(initialRepresentative);
    const [date, setDate] = useState('');
    const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
    const [selectedHours, setSelectedHours] = useState<string[]>([]);
    const [materia, setMateria] = useState('');
    const [loading, setLoading] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [settings, setSettings] = useState<any>(initialSettings);

    useEffect(() => {
        const fetchContext = async () => {
            try {
                const [repsRes, settingsRes] = await Promise.all([
                    api.get('/representatives')
                        .catch(() => api.get('/labs'))
                        .catch(() => ({ data: [] })),
                    SettingsService.getSettings()
                        .catch(() => [])
                ]);

                const repsList = Array.isArray(repsRes?.data) ? repsRes.data : [];
                const found = repsList.find((r: Representative) => r.id === Number(labId));
                setRepresentative(found || null);

                const settingsMap: any = {};
                if (Array.isArray(settingsRes)) {
                    settingsRes.forEach((s: any) => {
                        if (s?.key) settingsMap[s.key] = s.value;
                    });
                }
                setSettings(settingsMap);
            } catch (err) {
                console.error(err);
            }
        };
        if (token) {
            fetchContext();
        }
    }, [labId, token]);

    const fetchAvailability = useCallback(async (isInitial = false) => {
        if (!labId || !date) return;
        if (isInitial) setLoading(true);
        try {
            const response = await api.get(`/representatives/disponibilidad?representative_id=${labId}&fecha=${date}`)
                .catch(() => api.get(`/labs/disponibilidad?lab_id=${labId}&fecha=${date}`));
            const fetchedSlots: AvailabilitySlot[] = response.data || [];
            setAvailability(fetchedSlots);

            // Filter out any selected hours that are no longer free
            setSelectedHours(prev => prev.filter(hour => {
                const slot = fetchedSlots.find(s => s.hora === hour);
                return slot ? slot.estado !== 'ocupado' : true;
            }));
        } catch (err) {
            console.error(err);
        } finally {
            if (isInitial) setLoading(false);
        }
    }, [labId, date]);

    useEffect(() => {
        if (date && labId && token) {
            fetchAvailability(true);
            const interval = setInterval(() => fetchAvailability(false), 20000);
            return () => clearInterval(interval);
        }
    }, [date, labId, token, fetchAvailability]);

    const maxAdvanceDays = parseInt(settings?.max_advance_days || "4") || 4;
    const maxTurnsLimit = parseInt(settings?.max_turns_per_day || "4") || 4;
    const slotInterval = settings?.slot_interval || "30";
    const todayObj = new Date();
    const todayStr = todayObj.toISOString().split('T')[0];

    const maxDateObj = new Date();
    maxDateObj.setDate(todayObj.getDate() + maxAdvanceDays);
    const maxDateStr = maxDateObj.toISOString().split('T')[0];

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDate = e.target.value;
        if (!selectedDate) return;

        if (selectedDate < todayStr) {
            toast.warning('Fecha Inválida', { description: 'No puedes seleccionar fechas pasadas.' });
            setDate('');
            setAvailability([]);
            setSelectedHours([]);
            return;
        }

        if (selectedDate > maxDateStr) {
            toast.warning('Ventana de Agendamiento', { description: `Las citas solo están disponibles hasta el ${maxDateStr} (${maxAdvanceDays} días de anticipación).` });
            setDate('');
            setAvailability([]);
            setSelectedHours([]);
            return;
        }

        const d = new Date(selectedDate + 'T12:00:00');
        const day = d.getDay();

        if (day === 0 || day === 6) {
            toast.warning('Día No Laborable', { description: 'Las citas presenciales UGD solo se atiende de Lunes a Viernes.' });
            setDate('');
            setAvailability([]);
            setSelectedHours([]);
            return;
        }

        setDate(selectedDate);
        setSelectedHours([]);
    };

    const toggleHour = (slotStr: string) => {
        if (selectedHours.includes(slotStr)) {
            setSelectedHours(prev => prev.filter(s => s !== slotStr));
        } else {
            if (selectedHours.length >= maxTurnsLimit) {
                toast.warning('Límite de Turnos Alcanzado', { description: `El límite configurado es de máximo ${maxTurnsLimit} turno(s) por cita.` });
                return;
            }
            setSelectedHours(prev => [...prev, slotStr].sort());
        }
    };

    const isPastSlot = (slotStr: string) => {
        if (!date) return false;
        const nowStr = new Date().toLocaleString("en-US", { timeZone: "America/Guayaquil" });
        const today = new Date(nowStr);

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayFormatted = `${year}-${month}-${day}`;

        if (date === todayFormatted) {
            const [sh, sm] = slotStr.split(':').map(Number);
            const slotTotalMin = sh * 60 + sm;
            const currentTotalMin = today.getHours() * 60 + today.getMinutes();
            return slotTotalMin <= currentTotalMin;
        }

        if (date < todayFormatted) return true;

        return false;
    };

    const handleBooking = async () => {
        if (selectedHours.length === 0 || !materia) {
            toast.warning('Campos Requeridos', { description: 'Seleccione al menos un turno e ingrese el motivo de su cita.' });
            return;
        }
        setBookingLoading(true);

        try {
            const response = await api.post('/appointments/agendar', {
                representative_id: Number(labId),
                fecha: date,
                horas: selectedHours,
                materia
            }).catch(() => api.post('/labs/reservar', {
                lab_id: Number(labId),
                fecha: date,
                horas: selectedHours,
                materia
            }));

            const count = response.data.length;
            toast.success('¡Cita Presencial Agendada!', { description: `Cita agendada (${count} turno(s) de ${slotInterval} min) con ${representative?.nombre || 'Personal UGD'}.` });
            window.location.replace('/citas');

        } catch (err: any) {
            console.error(err);
            const errorData = err.response?.data?.error;
            let errorMsg = 'Error al agendar la cita presencial';

            if (typeof errorData === 'string') {
                errorMsg = errorData;
            } else if (Array.isArray(errorData)) {
                errorMsg = errorData.map((e: any) => e.message || e.path?.join('.') + ' es inválido').join(', ');
            } else if (errorData?.message) {
                errorMsg = errorData.message;
            }

            toast.error('Error al Agendar Cita', { description: errorMsg });

            // Clear selected hours summary on booking failure to prevent stale occupied hours from persisting
            setSelectedHours([]);

            // Immediately re-fetch availability to reflect newly occupied slot(s)
            fetchAvailability(false);
        } finally {
            setBookingLoading(false);
        }
    };

    if (!token || !representative) return <div className="text-center mt-20 font-serif text-xl text-muted animate-pulse">Cargando información...</div>;

    const isBannerActive = settings?.banner_active === 'true' || settings?.communication_banners?.is_active;
    const bannerMessage = settings?.global_message || settings?.communication_banners?.global_message;

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-20">
            {/* Banner global */}
            {isBannerActive && bannerMessage && (
                <div className="bg-status-info-bg border-l-4 border-status-info p-5 mb-8 rounded-r-xl shadow-sm font-sans flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-status-info shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-status-info-text font-bold text-sm uppercase tracking-wider mb-1">Aviso Institucional UGD</h3>
                        <p className="text-status-info-text text-sm leading-relaxed whitespace-pre-line">{bannerMessage}</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-12">
                <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-muted transition-colors cursor-pointer" onClick={() => { window.location.href = '/agendar'; }}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver a representantes
                </Button>
                <div className="flex items-center gap-3 mb-2">
                    <UserCheck className="w-8 h-8 text-primary" />
                    <h1 className="text-4xl md:text-5xl font-serif text-primary tracking-tight">
                        Cita con: {representative.nombre}
                    </h1>
                </div>
                <p className="text-muted font-light text-lg">
                    {['Unidad de Gestión de Doctorados (UGD)', representative.title, representative.ubicacion].filter(Boolean).join(' • ')}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Column: Controls */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-text-main mb-1 uppercase tracking-wider">Fecha de Atención</label>
                            <Input
                                type="date"
                                value={date}
                                onChange={handleDateChange}
                                className="w-full bg-surface-subtle border-border focus:border-primary focus:ring-2 focus:ring-gold/25 transition-all p-4 cursor-pointer"
                                min={todayStr}
                                max={maxDateStr}
                            />
                            <p className="text-[11px] text-muted mt-1.5 font-medium">
                                📅 Rango permitido: desde hoy hasta el <strong className="text-primary">{maxDateStr}</strong> ({maxAdvanceDays} días de anticipación).
                            </p>
                        </div>

                        <div>
                            <label htmlFor="motivo" className="block text-sm font-medium text-text-main mb-2 uppercase tracking-wider">Motivo de la Cita / Trámite</label>
                            <MotivoCita representante={representative} onChange={setMateria} />
                        </div>
                    </div>

                    {/* Summary Box */}
                    <div className="bg-surface-subtle p-6 rounded-lg border border-border-subtle">
                        <h4 className="font-serif text-lg text-primary mb-4">Resumen de Cita</h4>
                        {selectedHours.length === 0 ? (
                            <p className="text-sm text-muted font-light">Selecciona los turnos de {slotInterval} minutos disponibles a la derecha.</p>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex justify-between items-baseline border-b border-border pb-2">
                                    <span className="text-sm text-muted">Turnos ({slotInterval} min c/u):</span>
                                    <span className="font-medium text-xl">{selectedHours.length} ({selectedHours.length * parseInt(slotInterval)} min)</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedHours.map(slot => (
                                        <span key={slot} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                                            {slot} HS
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-8">
                            <Button
                                onClick={handleBooking}
                                disabled={selectedHours.length === 0 || !materia || bookingLoading}
                                className="w-full bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg py-4 text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                {bookingLoading ? 'Confirmando Cita...' : 'Confirmar Cita Presencial'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Availability Grid */}
                <div className="lg:col-span-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-serif text-primary">Turnos de {slotInterval} minutos ({settings?.start_hour || '08:00'} - {settings?.end_hour || '16:00'})</h3>
                        <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-1"><div className="w-3 h-3 border border-border rounded"></div> Libre</div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-primary rounded"></div> Seleccionado</div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-surface-muted rounded"></div> Ocupado</div>
                        </div>
                    </div>

                    {!date ? (
                        <div className="h-96 flex flex-col items-center justify-center border border-dashed border-border rounded-lg bg-surface-subtle/50">
                            <Clock className="h-10 w-10 text-muted-foreground/50 mb-4" />
                            <p className="text-muted font-light">Selecciona una fecha (hasta {maxDateStr}) para consultar la agenda de {representative.nombre}.</p>
                        </div>
                    ) : loading ? (
                        <div className="h-96 flex items-center justify-center">
                            <p className="text-muted animate-pulse font-serif">Consultando disponibilidad en tiempo real...</p>
                        </div>
                    ) : settings?.system_status === 'offline' ? (
                         <div className="h-96 flex justify-center items-center">
                             <h2 className="text-2xl font-serif text-status-danger">El agendamiento de la UGD se encuentra temporalmente suspendido.</h2>
                         </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {availability.map((slot) => {
                                const slotStr = slot.hora;
                                const past = isPastSlot(slotStr);
                                const occupied = slot.estado === 'ocupado';
                                const selected = selectedHours.includes(slotStr);
                                const disabled = occupied || past;

                                return (
                                    <button
                                        key={slotStr}
                                        onClick={() => !disabled && toggleHour(slotStr)}
                                        disabled={disabled}
                                        className={`
                                            relative h-28 p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between group cursor-pointer
                                            ${disabled
                                                ? 'bg-surface-subtle border-transparent text-muted-foreground/60 cursor-not-allowed'
                                                : selected
                                                    ? 'bg-primary border-primary text-primary-foreground shadow-xl transform -translate-y-1'
                                                    : 'bg-surface border-border-subtle hover:border-primary hover:shadow-md text-text-main'
                                            }
                                        `}
                                    >
                                        <div className="flex justify-between items-start w-full">
                                            <span className={`text-base font-bold ${selected ? 'text-primary-foreground' : 'text-text-main'}`}>
                                                {slotStr}
                                            </span>
                                            {selected && <CheckCircle2 className="h-5 w-5 text-primary-foreground" />}
                                        </div>

                                        <div className="text-left">
                                            {occupied ? (
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Ocupado</span>
                                            ) : past ? (
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">Pasado</span>
                                            ) : (
                                                <span className={`text-[10px] font-medium uppercase tracking-wider ${selected ? 'text-muted' : 'text-status-success'}`}>
                                                    {slotInterval} min Libre
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
