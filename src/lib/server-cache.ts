/**
 * Memoria temporal en el servidor del portal (por sesión).
 * La consulta del perfil a la API tarda varios segundos; con esto solo la primera página la paga
 * y cambiar de sección es inmediato. Guarda la promesa, así varias páginas pedidas a la vez
 * (por ejemplo, por la precarga al pasar el mouse) comparten una sola consulta.
 */
interface Entrada<T> {
    expira: number;
    valor: Promise<T>;
}

const memoria = new Map<string, Entrada<unknown>>();
const MAX_ENTRADAS = 500;

export async function conMemoria<T>(clave: string, ttlMs: number, cargar: () => Promise<T>, guardarSi: (v: T) => boolean = () => true): Promise<T> {
    const ahora = Date.now();
    const existente = memoria.get(clave) as Entrada<T> | undefined;
    if (existente && existente.expira > ahora) return existente.valor;

    if (memoria.size >= MAX_ENTRADAS) {
        for (const [k, e] of memoria) if (e.expira <= ahora) memoria.delete(k);
        if (memoria.size >= MAX_ENTRADAS) memoria.clear();
    }

    const valor = cargar();
    memoria.set(clave, { expira: ahora + ttlMs, valor });
    // Los resultados vacíos o fallidos no se conservan: la siguiente página vuelve a intentar
    valor.then((v) => !guardarSi(v) && memoria.delete(clave), () => memoria.delete(clave));
    return valor;
}
