import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import type { User } from '../types';
import { LogOut } from 'lucide-react';
import { SessionTimer } from './SessionTimer';

export interface NavbarProps {
    initialUser?: User | null;
}

export const Navbar: React.FC<NavbarProps> = ({ initialUser = null }) => {
    const storeUser = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const user = storeUser || initialUser;
    const [greeting, setGreeting] = useState('Bienvenido');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Buenos días');
        else if (hour < 18) setGreeting('Buenas tardes');
        else setGreeting('Buenas noches');
    }, []);

    const handleLogout = () => {
        logout();
        window.location.replace('/login');
    };

    return (
        <nav className="bg-surface/80 backdrop-blur-md sticky top-0 z-50 border-b border-border-subtle transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    {/* Logo area */}
                    <a href="/" className="group">
                        <span className="text-2xl font-serif text-primary tracking-tight group-hover:opacity-70 transition-opacity">
                            UGD
                        </span>
                    </a>

                    {/* Right side actions */}
                    {user && (
                        <div className="flex items-center gap-6">
                            <SessionTimer />

                            <div className="h-8 w-px bg-border-subtle hidden sm:block"></div>

                            <div className="text-right hidden sm:block">
                                <p className="text-xs text-muted uppercase tracking-widest mb-0.5">
                                    {greeting},
                                </p>
                                <p className="text-sm font-medium text-text-main flex items-center justify-end gap-2">
                                    {user.full_name}
                                </p>
                            </div>

                            <div className="h-8 w-px bg-border-subtle hidden sm:block"></div>

                            <button
                                onClick={handleLogout}
                                className="group flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-muted hover:text-primary hover:bg-surface-subtle transition-all duration-200 cursor-pointer"
                                title="Cerrar Sesión"
                            >
                                <span>Salir</span>
                                <LogOut className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};
