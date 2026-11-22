import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-surface rounded-xl border border-border-subtle shadow-2xl w-full max-w-md transform transition-all animate-in zoom-in-95 duration-200 overflow-hidden"
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-center justify-between p-6 border-b border-border-subtle">
                    <h3 className="text-xl font-serif text-primary">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-muted hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-subtle cursor-pointer"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-8">
                    {children}
                </div>

                {footer && (
                    <div className="flex justify-end gap-3 p-6 bg-surface-subtle/50">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};
