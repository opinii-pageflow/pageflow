import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Client } from '@/types';

// Mapea objeto do banco para tipo Client da aplicação
function mapClient(data: any): Client {
    return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        email: data.email,
        password: data.password, // Added mapping
        plan: data.plan,
        userType: data.user_type || 'client',
        maxProfiles: data.max_profiles,
        maxTemplates: data.max_templates,
        isActive: data.is_active,
        createdAt: data.created_at,
        schedulingScope: data.scheduling_scope,
        enableScheduling: data.enable_scheduling,
        globalSlots: []
    };
}

function mapSlot(s: any) {
    return {
        id: s.id,
        dayOfWeek: s.day_of_week,
        startTime: s.start_time,
        endTime: s.end_time,
        isActive: s.is_active,
        status: s.status,
        bookedBy: s.booked_by,
        bookedAt: s.booked_at,
        clientId: s.client_id
    };
}

export const clientsApi = {
    // Listar todos os clientes
    listAll: async (): Promise<Client[]> => {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error listing clients:', error);
            return [];
        }

        return (data || []).map(mapClient);
    },

    // Buscar cliente por ID
    getById: async (id: string): Promise<Client | null> => {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) {
            console.error('Error fetching client:', error);
            return null;
        }

        if (data) {
            const client = mapClient(data);
            const { data: slots } = await supabase
                .from('scheduling_slots')
                .select('*')
                .eq('client_id', id)
                .order('day_of_week', { ascending: true });

            client.globalSlots = (slots || []).map(mapSlot);
            return client;
        }
        return null;
    },

    // Buscar cliente por Slug
    getBySlug: async (slug: string): Promise<Client | null> => {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) return null;
        return mapClient(data);
    },

    // Criar novo cliente (agora cria também no Supabase Auth)
    create: async (client: Omit<Client, 'id' | 'createdAt'>): Promise<Client | null> => {
        // Para criar um usuário sem deslogar o admin atual, usamos um cliente secundário temporário
        const authClient = createClient(
            import.meta.env.VITE_SUPABASE_URL,
            import.meta.env.VITE_SUPABASE_ANON_KEY,
            { auth: { persistSession: false } }
        );

        if (!client.email || !client.password) {
            throw new Error("Email e senha são obrigatórios para criar um acesso.");
        }

        // 1. Criar o usuário no Auth
        // Isso vai disparar o trigger 'on_auth_user_created' no banco
        const { data: authData, error: authError } = await authClient.auth.signUp({
            email: client.email,
            password: client.password,
            options: {
                data: {
                    company_name: client.name,
                    slug: client.slug,
                    plan: client.plan,
                    max_profiles: client.maxProfiles,
                    user_type: client.userType || 'client',
                    password: client.password
                }
            }
        });

        if (authError) {
            console.error('Error in Auth SignUp:', authError);
            throw authError;
        }

        if (!authData.user) {
            throw new Error("Falha ao criar usuário de autenticação.");
        }

        // 2. Buscar o cliente criado pelo trigger (tentar por alguns segundos se necessário)
        // O trigger é AFTER INSERT, então deve ser quase instantâneo
        let retry = 0;
        while (retry < 5) {
            const { data: dbClient, error: dbError } = await supabase
                .from('clients')
                .select('*')
                .eq('email', client.email)
                .maybeSingle();

            if (dbClient) return mapClient(dbClient);

            await new Promise(resolve => setTimeout(resolve, 500));
            retry++;
        }

        throw new Error("Usuário criado, mas o registro da empresa não foi encontrado. Verifique os logs do banco.");
    },

    // Atualizar cliente
    update: async (id: string, updates: Partial<Client>) => {
        // Converter camelCase para snake_case
        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.slug) dbUpdates.slug = updates.slug;
        if (updates.plan) dbUpdates.plan = updates.plan;
        if (updates.email) dbUpdates.email = updates.email; // Added email update
        if (updates.password) dbUpdates.password = updates.password; // Added password update
        if (updates.maxProfiles !== undefined) dbUpdates.max_profiles = updates.maxProfiles;
        if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
        if (updates.schedulingScope) dbUpdates.scheduling_scope = updates.schedulingScope;
        if (updates.enableScheduling !== undefined) dbUpdates.enable_scheduling = updates.enableScheduling;
        if (updates.userType) dbUpdates.user_type = updates.userType;

        const { data, error } = await (supabase.from('clients') as any)
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .maybeSingle();

        if (error) {
            console.error('Error updating client:', error);
            throw error;
        }

        // Se RLS não permitir SELECT de volta, buscar manualmente
        if (data) return mapClient(data);

        const refreshed = await clientsApi.getById(id);
        if (refreshed) return refreshed;

        // Fallback: retornar dados parciais para não quebrar o fluxo
        return { id, ...dbUpdates } as any;
    },

    // Excluir cliente
    delete: async (id: string) => {
        const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting client:', error);
            throw error;
        }
        return true;
    },

    // Sincronizar slots globais
    syncGlobalSlots: async (clientId: string, slots: any[]) => {
        const isUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        const activeIds = slots.map(s => s.id).filter(id => id && isUUID(id));

        if (activeIds.length > 0) {
            await (supabase.from('scheduling_slots') as any).delete().eq('client_id', clientId).not('id', 'in', `(${activeIds.join(',')})`);
        } else {
            await (supabase.from('scheduling_slots') as any).delete().eq('client_id', clientId);
        }

        if (!slots || slots.length === 0) return;

        const upsertData = slots.map((item) => {
            const data: any = {
                client_id: clientId,
                day_of_week: item.dayOfWeek,
                start_time: item.startTime,
                end_time: item.endTime,
                is_active: item.isActive !== false,
                status: item.status || 'available'
            };
            if (item.id && isUUID(item.id)) data.id = item.id;
            return data;
        });

        const { error } = await (supabase.from('scheduling_slots') as any).upsert(upsertData);
        if (error) throw error;
    }
};
