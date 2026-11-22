/** Campo de formulario de acceso con ícono y, para contraseñas, botón para mostrar u ocultar. */
import React, { useState } from 'react';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react';

interface CampoProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    id: string;
    label?: string;
    icon: LucideIcon;
    type?: 'text' | 'email' | 'password';
    ayuda?: string;
}

const CLASES_INPUT =
    'block w-full rounded-lg border border-border bg-muted-bg py-3.5 pl-12 text-sm text-text-main placeholder-muted transition-all focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-gold/25 disabled:bg-surface-muted disabled:opacity-60';

export const Campo: React.FC<CampoProps> = ({ id, label, icon: Icon, type = 'text', ayuda, ...props }) => {
    const [visible, setVisible] = useState(false);
    const esPassword = type === 'password';

    return (
        <div>
            {label && (
                <label htmlFor={id} className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-body">
                    {label}
                </label>
            )}
            <div className="relative">
                <Icon aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                    id={id}
                    name={id}
                    type={esPassword && visible ? 'text' : type}
                    aria-label={label ? undefined : (props.placeholder as string)}
                    className={`${CLASES_INPUT} ${esPassword ? 'pr-12' : 'pr-4'}`}
                    {...props}
                />
                {esPassword && (
                    <button
                        type="button"
                        onClick={() => setVisible((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-muted transition-colors hover:text-text-body focus:outline-none"
                        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                        {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                )}
            </div>
            {ayuda && <p className="mt-1 text-[11px] text-muted">{ayuda}</p>}
        </div>
    );
};

/** Botón principal de los formularios de acceso, con estado de carga. */
export const BotonPrincipal: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { cargando?: boolean; textoCargando?: string }> = ({
    cargando = false,
    textoCargando,
    disabled,
    children,
    ...props
}) => (
    <button
        type="submit"
        disabled={disabled || cargando}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-4 py-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        {...props}
    >
        {cargando ? (
            <>
                <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                {textoCargando}
            </>
        ) : (
            children
        )}
    </button>
);
