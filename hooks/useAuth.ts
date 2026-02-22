import { useAuthContext } from '@/contexts/AuthContext';
import { useMemo } from 'react';

export function useAuth() {
    const { user, loading, refreshAuth } = useAuthContext();

    const value = useMemo(() => ({
        user,
        loading,
        isAuthenticated: !!user,
        refreshAuth
    }), [user, loading, refreshAuth]);

    return value;
}
