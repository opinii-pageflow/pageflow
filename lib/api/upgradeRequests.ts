import { supabase } from '@/lib/supabase';

export interface UpgradeRequest {
    id: string;
    clientId: string;
    name: string;
    email: string;
    whatsapp: string;
    requestedPlan: string;
    status: 'pending' | 'contacted' | 'closed';
    requestSource: 'new_client' | 'existing_client';
    createdAt: string;
}

export const upgradeRequestsApi = {
    // Create a new upgrade request
    create: async (request: Omit<UpgradeRequest, 'id' | 'createdAt' | 'status'>): Promise<UpgradeRequest | null> => {
        const payload = {
            client_id: request.clientId || null,
            name: request.name,
            email: request.email,
            whatsapp: request.whatsapp,
            requested_plan: request.requestedPlan,
            request_source: request.requestSource,
            status: 'pending'
        };

        // Usa insert comum. O select() pode falhar com 401 para anon se não houver política de SELECT.
        // Se falhar o select, retornamos os dados enviados com um ID temporário.
        const { data, error } = await (supabase.from('upgrade_requests') as any)
            .insert(payload)
            .select();

        if (error) {
            console.error('[upgradeRequestsApi] Error creating request:', error);
            throw error;
        }

        if (!data || data.length === 0) {
            // Fallback se o RLS bloqueou a leitura mas permitiu a inserção
            return {
                ...request,
                id: 'temp-' + Date.now(),
                status: 'pending',
                createdAt: new Date().toISOString()
            } as any;
        }

        return mapUpgradeRequest(data[0]);
    },

    // List all requests (Admin only)
    listAll: async (): Promise<UpgradeRequest[]> => {
        const { data, error } = await (supabase.from('upgrade_requests') as any)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[upgradeRequestsApi] Error listing requests:', error);
            return [];
        }

        return (data || []).map(mapUpgradeRequest);
    },

    // Update request status
    updateStatus: async (id: string, status: UpgradeRequest['status']): Promise<UpgradeRequest | null> => {
        const { data, error } = await (supabase.from('upgrade_requests') as any)
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('[upgradeRequestsApi] Error updating status:', error);
            throw error;
        }

        return mapUpgradeRequest(data);
    }
};

function mapUpgradeRequest(r: any): UpgradeRequest {
    return {
        id: r.id,
        clientId: r.client_id,
        name: r.name,
        email: r.email,
        whatsapp: r.whatsapp,
        requestedPlan: r.requested_plan,
        status: r.status,
        requestSource: r.request_source || 'existing_client',
        createdAt: r.created_at
    };
}
