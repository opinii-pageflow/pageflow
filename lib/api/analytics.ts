import { supabase, handleSupabaseError, ApiError } from '../supabase';
import type { Database } from '@/types/database';
import { AnalyticsEvent, EventType, AnalyticsSource, UtmParams } from '@/types';

type AnalyticsEventInsert = Database['public']['Tables']['analytics_events']['Insert'];

// ============================================
// BATCH PROCESSING CONFIGURATION
// ============================================

const BATCH_SIZE = 50; // Enviar eventos em lotes de 50
const FLUSH_INTERVAL = 5000; // Flush automático a cada 5 segundos
const LOCAL_STORAGE_KEY = 'pageflow:analytics:queue';

// Queue de eventos pendentes
let eventQueue: AnalyticsEventInsert[] = [];
let flushTimer: NodeJS.Timeout | null = null;

// ============================================
// TRACK EVENT (Principal função de rastreamento)
// ============================================

export interface TrackEventParams {
    profileId: string;
    clientId: string;
    type: EventType;

    // Asset information
    assetId?: string;
    assetType?: 'button' | 'portfolio' | 'catalog' | 'video' | 'pix' | 'nps';
    assetLabel?: string;
    assetUrl?: string;

    // Session information
    source?: AnalyticsSource;
    utm?: UtmParams;
    referrer?: string;
    landingPath?: string;
    device?: 'mobile' | 'desktop' | 'tablet';

    // NPS specific
    score?: number;
    comment?: string;

    // Legacy (deprecated)
    linkId?: string;
    category?: 'button' | 'portfolio' | 'catalog' | 'video';
}

/**
 * Rastreia um evento de analytics
 * Adiciona ao queue para batch processing
 */
export function trackEvent(params: TrackEventParams): void {
    const event: AnalyticsEventInsert = {
        client_id: params.clientId,
        profile_id: params.profileId,
        type: params.type,

        // Asset
        asset_type: params.assetType || null,
        asset_id: params.assetId || null,
        asset_label: params.assetLabel || null,
        asset_url: params.assetUrl || null,

        // Session
        source: params.source || 'direct',
        utm_source: params.utm?.source || null,
        utm_medium: params.utm?.medium || null,
        utm_campaign: params.utm?.campaign || null,
        utm_content: params.utm?.content || null,
        utm_term: params.utm?.term || null,
        referrer: params.referrer || null,
        landing_path: params.landingPath || null,
        device: params.device || detectDevice(),

        // NPS
        score: params.score || null,
        comment: params.comment || null,

        // Legacy
        link_id: params.linkId || null,
        category: params.category || null,

        // Timestamp
        ts: new Date().toISOString(),
    };

    // Adicionar ao queue
    eventQueue.push(event);

    // Salvar em localStorage como backup
    saveToLocalStorage(event);

    // Flush se atingir batch size
    if (eventQueue.length >= BATCH_SIZE) {
        flushEvents();
    } else {
        // Agendar flush automático
        scheduleFlush();
    }
}

// ============================================
// BATCH PROCESSING
// ============================================

/**
 * Agenda flush automático
 */
function scheduleFlush(): void {
    if (flushTimer) return; // Já agendado

    flushTimer = setTimeout(() => {
        flushTimer = null;
        flushEvents();
    }, FLUSH_INTERVAL);
}

/**
 * Envia todos os eventos pendentes para o Supabase
 */
export async function flushEvents(): Promise<void> {
    if (eventQueue.length === 0) return;

    const batch = [...eventQueue];
    eventQueue = [];

    try {
        const { data, error } = await supabase
            .from('analytics_events')
            .insert(batch as any); // Type assertion necessária devido a limitação do Supabase client

        if (error) {
            throw new ApiError(error.code || 'INSERT_ERROR', error.message, error);
        }

        // Sucesso: limpar localStorage
        clearLocalStorageBackup(batch);

        console.log(`✅ Analytics: ${batch.length} eventos enviados`);
    } catch (error) {
        console.error('❌ Falha ao enviar eventos:', error);

        // Erro: retornar ao queue para retry
        eventQueue = [...batch, ...eventQueue];

        // Manter no localStorage para não perder dados
        saveToLocalStorage(batch);
    }
}

/**
 * Flush ao sair da página (usando sendBeacon para garantir envio)
 */
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        if (eventQueue.length > 0) {
            // Tentar enviar via sendBeacon (mais confiável em beforeunload)
            const blob = new Blob([JSON.stringify(eventQueue)], { type: 'application/json' });
            const sent = navigator.sendBeacon(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/analytics_events`, blob);

            if (!sent) {
                // Fallback: salvar em localStorage para enviar na próxima sessão
                saveToLocalStorage(eventQueue);
            }
        }
    });

    // Tentar enviar eventos pendentes do localStorage ao carregar
    window.addEventListener('load', () => {
        retryPendingEvents();
    });
}

// ============================================
// LOCAL STORAGE BACKUP
// ============================================

function saveToLocalStorage(events: AnalyticsEventInsert | AnalyticsEventInsert[]): void {
    try {
        const eventsArray = Array.isArray(events) ? events : [events];
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        const existing = stored ? JSON.parse(stored) : [];
        const updated = [...existing, ...eventsArray];

        // Limitar a 500 eventos no localStorage para não estourar quota
        const limited = updated.slice(-500);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(limited));
    } catch (error) {
        console.error('Erro ao salvar eventos no localStorage:', error);
    }
}

function clearLocalStorageBackup(sentEvents: AnalyticsEventInsert[]): void {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!stored) return;

        const existing: AnalyticsEventInsert[] = JSON.parse(stored);

        // Remover eventos que foram enviados com sucesso
        const remaining = existing.filter(e =>
            !sentEvents.some(sent => sent.ts === e.ts && sent.profile_id === e.profile_id)
        );

        if (remaining.length > 0) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remaining));
        } else {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    } catch (error) {
        console.error('Erro ao limpar localStorage:', error);
    }
}

async function retryPendingEvents(): Promise<void> {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!stored) return;

        const pending: AnalyticsEventInsert[] = JSON.parse(stored);
        if (pending.length === 0) return;

        console.log(`🔄 Reenviando ${pending.length} eventos pendentes...`);

        // Adicionar ao queue para envio
        eventQueue = [...pending, ...eventQueue];

        // Flush imediatamente
        await flushEvents();
    } catch (error) {
        console.error('Erro ao reenviar eventos pendentes:', error);
    }
}

// ============================================
// HELPERS
// ============================================

/**
 * Detecta o tipo de dispositivo
 */
function detectDevice(): 'mobile' | 'desktop' | 'tablet' {
    if (typeof window === 'undefined') return 'desktop';

    const ua = navigator.userAgent.toLowerCase();

    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'tablet';
    }

    if (/mobile|iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(ua)) {
        return 'mobile';
    }

    return 'desktop';
}

/**
 * Captura origem da sessão (UTM params, referrer, etc)
 */
export function captureSessionOrigin(
    searchParams: URLSearchParams,
    referrer: string,
    path: string
): { source: AnalyticsSource; utm: UtmParams } {
    const utm: UtmParams = {
        source: searchParams.get('utm_source') || undefined,
        medium: searchParams.get('utm_medium') || undefined,
        campaign: searchParams.get('utm_campaign') || undefined,
        content: searchParams.get('utm_content') || undefined,
        term: searchParams.get('utm_term') || undefined,
    };

    let source: AnalyticsSource = 'direct';
    const ref = referrer.toLowerCase();

    // Detectar source
    if (searchParams.has('qr')) source = 'qr';
    else if (searchParams.has('nfc')) source = 'nfc';
    else if (utm.source === 'community') source = 'community';
    else if (ref.includes('instagram.com')) source = 'instagram';
    else if (ref.includes('facebook.com')) source = 'facebook';
    else if (ref.includes('linkedin.com')) source = 'linkedin';
    else if (ref.includes('twitter.com') || ref.includes('t.co')) source = 'twitter';
    else if (ref.includes('whatsapp.com')) source = 'whatsapp';

    return { source, utm };
}

// ============================================
// QUERY FUNCTIONS (Para dashboard de analytics)
// ============================================

/**
 * Busca eventos filtrados por perfil e período
 */
export async function getAnalyticsEvents(
    profileId: string | 'all',
    startDate?: Date,
    endDate?: Date,
    clientId?: string,
    source?: string
): Promise<AnalyticsEvent[]> {
    let query = supabase
        .from('analytics_events')
        .select('id, client_id, profile_id, type, asset_id, asset_type, asset_label, source, utm_source, utm_medium, utm_campaign, ts, device');

    if (profileId !== 'all') {
        query = query.eq('profile_id', profileId);
    } else if (clientId) {
        query = query.eq('client_id', clientId);
    }

    if (source && source !== 'all') {
        query = query.eq('source', source);
    }

    query = query.order('ts', { ascending: false }).limit(1000);


    if (startDate) {
        query = query.gte('ts', startDate.toISOString());
    }

    if (endDate) {
        query = query.lte('ts', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
        throw new ApiError(error.code, error.message);
    }

    return (data || []) as AnalyticsEvent[];
}

/**
 * Busca resumo de analytics (para dashboard)
 */
export async function getAnalyticsSummary(
    profileId: string,
    days: number = 7
): Promise<{
    totalViews: number;
    totalClicks: number;
    ctr: number;
}> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const events = await getAnalyticsEvents(profileId, startDate);

    const totalViews = events.filter(e => e.type === 'view').length;
    const totalClicks = events.filter(e => e.type !== 'view' && e.type !== 'nps_response').length;
    const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

    return { totalViews, totalClicks, ctr };
}

/**
 * Busca resumo consolidado via RPC (Otimizado para Egress)
 */
export async function getAnalyticsSummaryRPC(
    profileId: string | 'all',
    clientId: string,
    startDate: Date,
    endDate: Date,
    source: string = 'all'
): Promise<any> {
    const { data, error } = await (supabase.rpc as any)('get_analytics_summary_v1', {
        p_profile_id: profileId,
        p_client_id: clientId,
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString(),
        p_source_filter: source
    } as any);

    if (error) {
        console.error('❌ RPC Analytics Error:', error);
        throw new ApiError(error.code, error.message);
    }

    return data;
}
