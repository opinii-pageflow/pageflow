import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { UserAuth } from '@/types';

interface AuthContextType {
    user: UserAuth | null;
    loading: boolean;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cache fora do componente para persistir entre re-renders
let cachedUserAuth: UserAuth | null = null;
let resolutionPromise: Promise<UserAuth | null> | null = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserAuth | null>(null);
    const [loading, setLoading] = useState(true);

    const resolveUser = useCallback(async (session: any) => {
        if (!session?.user) {
            cachedUserAuth = null;
            resolutionPromise = null;
            return null;
        }

        // Se já temos uma resolução em andamento para este usuário, esperamos por ela
        if (resolutionPromise && cachedUserAuth?.id === session.user.id) {
            return resolutionPromise;
        }

        // Se já resolvemos e o ID não mudou, retorna o cache
        if (cachedUserAuth && cachedUserAuth.id === session.user.id && cachedUserAuth.clientId) {
            return cachedUserAuth;
        }

        // Iniciamos nova resolução
        resolutionPromise = (async () => {
            const email = session.user.email?.toLowerCase() || '';
            const appMetadata = session.user.app_metadata || {};
            const userMetadata = session.user.user_metadata || {};

            // ESTRATÉGIA PRIORITÁRIA: JWT CLAIMS (App Metadata)
            // Sincronizado pelo backend para performance máxima
            let role = appMetadata.user_role || userMetadata.role || userMetadata.user_type || 'client';
            let clientId = appMetadata.client_id || userMetadata.clientId || userMetadata.id;
            let name = userMetadata.name || userMetadata.company_name || email.split('@')[0];

            // Super Admin Hardcoded Bypass
            if (email === 'israel.souza@ent.app.br' || role === 'admin') {
                const adminUser: UserAuth = {
                    id: session.user.id,
                    email: email,
                    name: name,
                    role: 'admin',
                    clientId: clientId || 'admin-master'
                };
                cachedUserAuth = adminUser;
                return adminUser;
            }

            try {
                // Se o clientId ainda estiver faltando nos metadados (usuário novo ou logando pela 1ª vez após migração)
                if (!clientId) {
                    console.log("[AuthProvider] Metadata empty, hitting DB for:", session.user.id);
                    const { data: clientObj } = await supabase
                        .from('clients')
                        .select('id, user_type')
                        .eq('email', email)
                        .maybeSingle();

                    if (clientObj) {
                        clientId = (clientObj as any).id;
                        if ((clientObj as any).user_type) role = (clientObj as any).user_type;
                    } else {
                        const { data: member } = await supabase
                            .from('client_members')
                            .select('client_id')
                            .eq('user_id', session.user.id)
                            .maybeSingle();

                        if (member) {
                            clientId = (member as any).client_id;
                        }
                    }
                }
            } catch (err) {
                console.warn("[AuthProvider] Resolve data error:", err);
            }

            const finalUser: UserAuth = {
                id: session.user.id,
                email: email,
                name: name,
                role: (role || 'client') as any,
                clientId: clientId
            };

            if (finalUser.clientId) {
                cachedUserAuth = finalUser;
            }
            return finalUser;
        })();

        return resolutionPromise;
    }, []);

    const checkUser = useCallback(async () => {
        try {
            // Se já temos um usuário e clientId, não forçamos loading
            const { data: { session } } = await supabase.auth.getSession();
            const resolved = await resolveUser(session);

            setUser(prev => {
                if (prev?.id === resolved?.id && prev?.clientId === resolved?.clientId && prev?.role === resolved?.role) return prev;
                return resolved;
            });
        } catch (err) {
            console.error("[AuthProvider] Check user error:", err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [resolveUser]);

    useEffect(() => {
        let mounted = true;

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`[AuthProvider] Auth Event: ${event}`);

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                const resolved = await resolveUser(session);
                if (mounted && resolved) {
                    setUser(prev => {
                        // Só atualiza se houver mudança real profunda
                        if (prev && resolved &&
                            prev.id === resolved.id &&
                            prev.clientId === resolved.clientId &&
                            prev.role === resolved.role) {
                            return prev;
                        }
                        console.log("[AuthProvider] Updating user state:", resolved.email, resolved.role);
                        return resolved;
                    });
                }
                if (mounted) setLoading(false);
            } else if (event === 'SIGNED_OUT') {
                console.log("[AuthProvider] SIGNED_OUT detected, clearing cache and redirecting");
                cachedUserAuth = null;
                if (mounted) {
                    setUser(null);
                    setLoading(false);
                    // Redirecionamento forçado para garantir limpeza
                    window.location.href = '/#/login';
                }
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [checkUser, resolveUser]);

    return (
        <AuthContext.Provider value={{ user, loading, refreshAuth: checkUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}
