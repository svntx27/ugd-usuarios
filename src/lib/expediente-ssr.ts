/** Carga el expediente del doctorando autenticado y su trayectoria, para las páginas del expediente. */
import { fetchPerfil } from './server-api';
import { construirTrayectoria } from './trayectoria';

export async function cargarExpediente(token: string | null | undefined) {
    const doctorando = token ? await fetchPerfil(token) : null;
    const expediente = doctorando?.expedientes?.[0] ?? null;
    return { doctorando, expediente, trayectoria: construirTrayectoria(expediente) };
}
