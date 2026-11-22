import React from 'react';
import { Toaster } from 'sileo';
import 'sileo/styles.css';

export const ToastProvider: React.FC = () => {
    // duration en milisegundos (ej: 4000ms = 4 segundos de visibilidad activa)
    return <Toaster theme="dark" position="bottom-right" options={{ duration: 4000 }} />;
};
