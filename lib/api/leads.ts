import { supabase } from '@/lib/supabase';
import { LeadCapture } from '@/types';

export const leadsApi = {
    // Listar leads de um cliente
    listByClient: async (clientId: string): Promise<LeadCapture[]> => {
        const { data, error } = await (supabase.from('leads') as any)
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[leadsApi] Error listing leads:', error);
            return [];
        }

        return (data || []).map(mapLead);
    },

    // Criar um novo lead
    create: async (lead: Omit<LeadCapture, 'id' | 'createdAt'>): Promise<LeadCapture | null> => {
        const dbLead = {
            client_id: lead.clientId,
            profile_id: lead.profileId,
            name: lead.name,
            contact: lead.contact,
            message: lead.message,
            status: lead.status || 'novo',
            source: lead.source || 'direct',
            capture_type: lead.captureType || 'form',
            notes: lead.notes,
            utm_source: lead.utm?.source || null,
            utm_medium: lead.utm?.medium || null,
            utm_campaign: lead.utm?.campaign || null,
            utm_content: lead.utm?.content || null,
            utm_term: lead.utm?.term || null
        };

        const { data, error } = await (supabase.from('leads') as any)
            .insert(dbLead)
            .select()
            .single();

        if (error) {
            console.error('[leadsApi] Error creating lead:', error);
            throw error;
        }

        return mapLead(data);
    },

    // Atualizar status ou notas de um lead
    update: async (id: string, updates: Partial<LeadCapture>) => {
        const dbUpdates: any = {};
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

        const { data, error } = await (supabase.from('leads') as any)
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('[leadsApi] Error updating lead:', error);
            throw error;
        }

        return mapLead(data);
    },

    // Excluir lead
    delete: async (id: string) => {
        const { error } = await (supabase.from('leads') as any)
            .delete()
            .eq('id', id);

        if (error) {
            console.error('[leadsApi] Error deleting lead:', error);
            throw error;
        }
        return true;
    }
};

// Helper para mapear banco -> aplicação
function mapLead(l: any): LeadCapture {
    return {
        id: l.id,
        clientId: l.client_id,
        profileId: l.profile_id,
        name: l.name,
        contact: l.contact,
        message: l.message,
        status: l.status,
        notes: l.notes,
        createdAt: l.created_at,
        source: l.source,
        captureType: l.capture_type,
        utm: l.utm_source ? {
            source: l.utm_source,
            medium: l.utm_medium,
            campaign: l.utm_campaign,
            content: l.utm_content,
            term: l.utm_term
        } : undefined
    };
}
