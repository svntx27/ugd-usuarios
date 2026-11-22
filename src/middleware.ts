import { defineMiddleware } from 'astro:middleware';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, AUTH_EXPIRY_KEY } from './lib/cookies';

const GUEST_ONLY_ROUTES = ['/login', '/register', '/activar'];

export const onRequest = defineMiddleware(async (context, next) => {
    const { url, cookies, redirect } = context;
    const pathname = url.pathname;

    // Ignorar recursos estáticos, imágenes y assets internos de Astro
    if (
        pathname.startsWith('/_astro') ||
        pathname.startsWith('/_image') ||
        pathname.startsWith('/favicon') ||
        /\.(png|jpe?g|gif|svg|webp|ico|css|js|woff2?|map)$/i.test(pathname)
    ) {
        return next();
    }

    const token = cookies.get(AUTH_TOKEN_KEY)?.value || null;
    const expiryStr = cookies.get(AUTH_EXPIRY_KEY)?.value || null;

    let isExpired = false;
    if (expiryStr) {
        const expiryTime = Number(expiryStr);
        if (!isNaN(expiryTime) && Date.now() >= expiryTime) {
            isExpired = true;
            // Destruir cookies en el servidor si ya expiró el tiempo de sesión
            cookies.delete(AUTH_TOKEN_KEY, { path: '/' });
            cookies.delete(AUTH_USER_KEY, { path: '/' });
            cookies.delete(AUTH_EXPIRY_KEY, { path: '/' });
        }
    }

    const isAuthenticated = Boolean(token && !isExpired);

    context.locals.token = isAuthenticated ? token : null;
    context.locals.isAuthenticated = isAuthenticated;

    const isGuestOnlyRoute = GUEST_ONLY_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

    // Si la sesión no existe o ya venció e intenta acceder a una ruta protegida -> Redirigir al login
    if (!isAuthenticated && !isGuestOnlyRoute) {
        return redirect('/login', 302);
    }

    // Si el usuario ya está autenticado e intenta acceder a una ruta de invitados (login/activar/register) -> Redirigir al dashboard
    if (isAuthenticated && isGuestOnlyRoute) {
        return redirect('/', 302);
    }

    return next();
});
