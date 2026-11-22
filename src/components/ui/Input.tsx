import React, { forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-text-body mb-1">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={cn(
                        'block w-full rounded-md border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-gold/25 sm:text-sm p-2 border text-text-main bg-surface placeholder-muted',
                        error && 'border-status-danger focus:border-status-danger focus:ring-status-danger',
                        className
                    )}
                    {...props}
                />
                {error && <p className="mt-1 text-sm text-status-danger">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
