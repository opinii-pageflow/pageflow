import { supabase } from '@/lib/supabase';
import { SchedulingSlot } from '@/types';

export const schedulingApi = {
    // Atualizar status de um slot (usado para reservas)
    updateSlotStatus: async (slotId: string, status: 'available' | 'pending' | 'booked', details?: { bookedBy: string, bookedAt: string }) => {
        const updates: any = {
            status,
            booked_by: details?.bookedBy,
            booked_at: details?.bookedAt
        };

        const { error } = await (supabase.from('scheduling_slots') as any)
            .update(updates)
            .eq('id', slotId);

        if (error) {
            console.error('[schedulingApi] Error updating slot status:', error);
            throw error;
        }
        return true;
    },

    // Buscar slots por perfil
    listByProfile: async (profileId: string): Promise<SchedulingSlot[]> => {
        const { data, error } = await (supabase.from('scheduling_slots') as any)
            .select('id, day_of_week, start_time, end_time, is_active, status, booked_by, booked_at, client_id, profile_id')
            .eq('profile_id', profileId)
            .order('day_of_week', { ascending: true })
            .order('start_time', { ascending: true });

        if (error) return [];
        return (data || []).map(mapSlot);
    },

    // Buscar slots globais por cliente
    listByClient: async (clientId: string): Promise<SchedulingSlot[]> => {
        const { data, error } = await (supabase.from('scheduling_slots') as any)
            .select('id, day_of_week, start_time, end_time, is_active, status, booked_by, booked_at, client_id, profile_id')
            .eq('client_id', clientId)
            .is('profile_id', null)
            .order('day_of_week', { ascending: true })
            .order('start_time', { ascending: true });

        if (error) return [];
        return (data || []).map(mapSlot);
    }
};

function mapSlot(s: any): SchedulingSlot {
    return {
        id: s.id,
        dayOfWeek: s.day_of_week,
        startTime: s.start_time,
        endTime: s.end_time,
        isActive: s.is_active,
        status: s.status,
        bookedBy: s.booked_by,
        bookedAt: s.booked_at,
        clientId: s.client_id,
        profileId: s.profile_id
    };
}
