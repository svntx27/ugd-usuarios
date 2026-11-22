import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'gold' | 'outline' | 'ghost' | 'danger' | 'link';
    size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
    className,
    variant = 'primary',
    size = 'md',
    ...props
}) => {
    const variants = {
        primary: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm border border-primary',
        secondary: 'bg-surface border border-border hover:bg-surface-subtle text-text-body shadow-sm',
        gold: 'bg-gold text-gold-foreground hover:bg-gold-hover shadow-sm border border-gold',
        outline: 'border border-border bg-transparent hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all text-secondary-foreground',
        ghost: 'bg-transparent hover:bg-secondary-hover text-muted hover:text-primary',
        danger: 'bg-status-danger-bg text-status-danger hover:bg-status-danger-hover',
        link: 'bg-transparent text-primary hover:underline underline-offset-4 p-0 shadow-none',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs font-medium uppercase tracking-wide',
        md: 'px-5 py-2.5 text-sm font-medium',
        lg: 'px-8 py-3 text-base font-medium',
    };

    return (
        <button
            className={cn(
                'inline-flex items-center justify-center rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
};
