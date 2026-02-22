import { supabase } from '@/lib/supabase';
import { NpsEntry } from '@/types';

export const npsApi = {
    // Listar entradas de NPS de um cliente
    listByClient: async (clientId: string): Promise<NpsEntry[]> => {
        const { data, error } = await (supabase.from('nps_entries') as any)
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[npsApi] Error listing NPS entries:', error);
            return [];
        }

        return (data || []).map(mapNps);
    },

    // Criar uma nova entrada de NPS
    create: async (entry: Omit<NpsEntry, 'id' | 'createdAt'>): Promise<NpsEntry | null> => {
        const dbEntry = {
            client_id: entry.clientId,
            profile_id: entry.profileId,
            score: entry.score,
            comment: entry.comment,
            source: entry.source || 'direct',
            utm_source: entry.utm?.source || null,
            utm_medium: entry.utm?.medium || null,
            utm_campaign: entry.utm?.campaign || null,
            utm_content: entry.utm?.content || null,
            utm_term: entry.utm?.term || null
        };

        const { data, error } = await (supabase.from('nps_entries') as any)
            .insert(dbEntry)
            .select()
            .single();

        if (error) {
            console.error('[npsApi] Error creating NPS entry:', error);
            throw error;
        }

        return mapNps(data);
    }
};

function mapNps(n: any): NpsEntry {
    return {
        id: n.id,
        clientId: n.client_id,
        profileId: n.profile_id,
        score: n.score,
        comment: n.comment,
        createdAt: n.created_at,
        source: n.source,
        utm: n.utm_source ? {
            source: n.utm_source,
            medium: n.utm_medium,
            campaign: n.utm_campaign,
            content: n.utm_content,
            term: n.utm_term
        } : undefined
    };
}
