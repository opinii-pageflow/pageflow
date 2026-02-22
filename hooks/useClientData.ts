import { useState, useEffect, useCallback } from 'react';
import { clientsApi } from '@/lib/api/clients';
import { profilesApi } from '@/lib/api/profiles';
import { Client, Profile } from '@/types';
import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Hook centralizado para buscar dados do cliente e seus perfis.
 * Consome o usuário do AuthContext para garantir reatividade e evitar race conditions.
 */
export function useClientData() {
    const { user, loading: authLoading } = useAuthContext();
    const [client, setClient] = useState<Client | null>(null);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (clientId: string, silent = false) => {
        if (!clientId) {
            setLoading(false);
            return;
        }

        if (!silent) setLoading(true);
        setError(null);
        try {
            // Busca dados do cliente e perfis em paralelo
            const [clientData, profilesData] = await Promise.all([
                clientsApi.getById(clientId),
                profilesApi.listByClient(clientId)
            ]);

            setClient(clientData);
            setProfiles(profilesData || []);
        } catch (err: any) {
            console.error('[useClientData] Erro ao carregar dados:', err);
            setError(err.message || 'Falha ao carregar dados do protocolo.');
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    // Reage a mudanças no usuário ou no estado de carregamento da auth
    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            setLoading(false);
            setClient(null);
            setProfiles([]);
            return;
        }

        if (user.clientId) {
            fetchData(user.clientId);
        } else {
            console.warn("[useClientData] Usuário logado mas sem clientId resolvido");
            setLoading(false);
        }
    }, [user?.id, user?.clientId, authLoading, fetchData]);

    const refresh = useCallback(async (silent = false) => {
        if (user?.clientId) {
            await fetchData(user.clientId, silent);
        }
    }, [user?.clientId, fetchData]);

    return {
        client,
        profiles,
        loading: authLoading || loading,
        error,
        refresh
    };
}
