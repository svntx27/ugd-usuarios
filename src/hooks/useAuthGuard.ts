import { useEffect } from 'react';
import { useAuthStore, getStoredToken } from '../store/useAuthStore';

/**
 * Custom hook to enforce client-side route authorization and handle browser back/forward navigation.
 * 
 * @param requireAuth - If true, page requires an active session token (redirects unauthenticated users to /login).
 *                      If false, page is for unauthenticated users (redirects logged-in users to /).
 */
export const useAuthGuard = (requireAuth: boolean) => {
    const token = useAuthStore((state) => state.token);

    useEffect(() => {
        const checkAuth = () => {
            const currentToken = getStoredToken();
            if (requireAuth && !currentToken) {
                window.location.replace('/login');
            } else if (!requireAuth && currentToken) {
                window.location.replace('/');
            }
        };

        checkAuth();

        // Handle browser BFCache restoration (back/forward navigation)
        const handlePageShow = () => {
            checkAuth();
        };

        const handlePopState = () => {
            checkAuth();
        };

        window.addEventListener('pageshow', handlePageShow);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('pageshow', handlePageShow);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [requireAuth, token]);
};
