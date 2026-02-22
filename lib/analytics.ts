// ============================================
// ANALYTICS - Supabase Backend
// ============================================
// Este arquivo mantém a interface pública original
// mas delega para o sistema Supabase (lib/api/analytics.ts)

import { AnalyticsEvent, AnalyticsSummary, EventType, AnalyticsSource, UtmParams, Profile } from '../types';
import {
    trackEvent as trackEventSupabase,
    captureSessionOrigin as captureSessionOriginSupabase,
    getAnalyticsEvents,
    getAnalyticsSummaryRPC,
    flushEvents
} from './api/analytics';
import { normalizeEvent } from './eventNormalizer';
import { profilesApi } from './api/profiles';

// ============================================
// TRACK EVENT (Delegação para Supabase)
// ============================================

export const trackEvent = (params: {
    profileId: string;
    clientId: string;
    type: EventType;
    linkId?: string;
    category?: 'button' | 'portfolio' | 'catalog' | 'video';
    source?: AnalyticsSource;
    utm?: UtmParams;
    referrer?: string;
    landingPath?: string;
    assetId?: string;
    assetType?: 'button' | 'portfolio' | 'catalog' | 'video' | 'pix' | 'nps';
    assetLabel?: string;
    score?: number;
    comment?: string;
}) => {
    // Delegar para o sistema Supabase
    trackEventSupabase({
        profileId: params.profileId,
        clientId: params.clientId,
        type: params.type,
        assetId: params.assetId || params.linkId, // Compatibilidade com linkId antigo
        assetType: params.assetType || params.category, // Compatibilidade com category antigo
        assetLabel: params.assetLabel,
        source: params.source,
        utm: params.utm,
        referrer: params.referrer,
        landingPath: params.landingPath,
        score: params.score,
        comment: params.comment,
    });
};

// ============================================
// GET FILTERED EVENTS (Query do Supabase)
// ============================================

export const getFilteredEvents = async (
    profileId: string | 'all',
    days: number = 7,
    clientId?: string,
    startDate?: number,
    endDate?: number,
    source?: string
): Promise<AnalyticsEvent[]> => {
    try {
        console.log(`[getFilteredEvents] Buscando: profile=${profileId}, days=${days}, client=${clientId}, source=${source}`);

        // Calcular datas
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate
            ? new Date(startDate)
            : new Date(end.getTime() - (days || 7) * 24 * 60 * 60 * 1000);

        // Buscar do Supabase
        const events = await getAnalyticsEvents(profileId, start, end, clientId, source);

        if (!events || events.length === 0) {
            console.warn(`[getFilteredEvents] Nenhum evento encontrado para o período.`);
            return [];
        }

        console.log(`[getFilteredEvents] ${events.length} eventos brutos encontrados.`);

        // Converter formato do Supabase para formato interno (blindagem total)
        return events.map((e: any) => {
            // Mapeamento defensivo para suportar snake_case (banco) e camelCase
            const mapped: AnalyticsEvent = {
                id: e.id,
                clientId: e.client_id || e.clientId,
                profileId: e.profile_id || e.profileId,
                type: e.type as EventType,
                linkId: e.link_id || e.asset_id || e.linkId,
                category: (e.category || e.asset_type) as any,
                source: e.source as AnalyticsSource,
                utm: (e.utm_source || e.utm?.source) ? {
                    source: e.utm_source || e.utm?.source,
                    medium: e.utm_medium || e.utm?.medium,
                    campaign: e.utm_campaign || e.utm?.campaign,
                    content: e.utm_content || e.utm?.content,
                    term: e.utm_term || e.utm?.term,
                } : undefined,
                ts: e.ts ? (typeof e.ts === 'number' ? e.ts : new Date(e.ts).getTime()) : Date.now(),
                assetId: e.asset_id || e.assetId || e.link_id || e.linkId,
                assetType: (e.asset_type || e.category) as any,
                assetLabel: e.asset_label || e.assetLabel || '',
                assetUrl: e.asset_url || e.assetUrl,
                device: e.device,
                referrer: e.referrer,
                landingPath: e.landing_path || e.landingPath,
                score: e.score,
                comment: e.comment,
            };
            return mapped;
        });
    } catch (error) {
        console.error('❌ Erro crítico ao buscar eventos do Supabase:', error);
        return [];
    }
};

// ============================================
// GET PROFILE SUMMARY (Agregação de dados)
// ============================================

export const getProfileSummary = async (
    profileId: string | 'all',
    days: number = 7,
    clientId?: string,
    startDate?: number,
    endDate?: number,
    source?: string
): Promise<AnalyticsSummary> => {
    try {
        // Tentar usar RPC se tivermos clientId (Otimização de Egress)
        if (clientId) {
            const end = endDate ? new Date(endDate) : new Date();
            const start = startDate
                ? new Date(startDate)
                : new Date(end.getTime() - (days || 7) * 24 * 60 * 60 * 1000);

            try {
                const rpcData = await getAnalyticsSummaryRPC(profileId, clientId, start, end, source);
                if (rpcData) {
                    // Converter formato do RPC para AnalyticsSummary
                    const totalViewsVal = rpcData.totalViews || 0;
                    const totalClicksVal = rpcData.totalClicks || 0;

                    // Devices: calcular percentuais
                    const rpcDevices = rpcData.devices || [];
                    const totalDevViews = rpcDevices.reduce((acc: number, d: any) => acc + (d.count || 0), 0) || 1;
                    const devices = rpcDevices.map((d: any) => ({
                        name: (d.name || 'mobile').charAt(0).toUpperCase() + (d.name || 'mobile').slice(1),
                        value: d.count || 0,
                        percentage: Math.round(((d.count || 0) / totalDevViews) * 100)
                    }));

                    // Sources: calcular percentuais
                    const rpcSources = rpcData.sources || [];
                    const sources = rpcSources.map((s: any) => ({
                        name: s.name || 'direct',
                        value: s.count || 0,
                        percentage: totalViewsVal > 0 ? Math.round(((s.count || 0) / totalViewsVal) * 100) : 0
                    }));

                    // Content Performance: calcular percentuais
                    const rpcCategories = rpcData.byCategory || [];
                    const totalCatActions = rpcCategories.reduce((acc: number, c: any) => acc + (c.count || 0), 0) || 1;
                    const byCategory = rpcCategories.map((c: any) => ({
                        category: c.category || 'other',
                        count: c.count || 0,
                        percentage: Math.round(((c.count || 0) / totalCatActions) * 100)
                    }));

                    return {
                        totalViews: totalViewsVal,
                        totalClicks: totalClicksVal,
                        ctr: totalViewsVal > 0 ? (totalClicksVal / totalViewsVal) * 100 : 0,
                        viewsByDate: (rpcData.daily || []).map((d: any) => ({ date: d.day.split('T')[0], value: d.views })),
                        clicksByDate: (rpcData.daily || []).map((d: any) => ({ date: d.day.split('T')[0], value: d.clicks })),
                        sources,
                        devices,
                        topLinks: (rpcData.topAssets || []).map((a: any) => ({
                            label: a.label,
                            clicks: a.clicks,
                            percentage: totalClicksVal > 0 ? (a.clicks / totalClicksVal) * 100 : 0
                        })),
                        peakHours: [],
                        utmSummary: { sources: [], mediums: [], campaigns: [] },
                        contentPerformance: {
                            byCategory,
                            totalActions: totalClicksVal,
                            bestAsset: rpcData.topAssets?.[0] ? { label: rpcData.topAssets[0].label, count: rpcData.topAssets[0].clicks, type: 'clique' } : null,
                            zeroInteractionItems: [],
                            pixCopies: 0
                        }
                    };
                }
            } catch (rpcErr) {
                console.warn("[Analytics] RPC falhou ou não existe, usando fallback... ", rpcErr);
            }
        }

        const rawFiltered = await getFilteredEvents(profileId, days, clientId, startDate, endDate, source);

        // Fetch profiles to resolve labels correctly
        let profiles: Profile[] = [];
        if (clientId) {
            profiles = await profilesApi.listByClient(clientId);
        } else if (rawFiltered.length > 0) {
            // If no clientId but we have events, try to get unique profileIds
            const uniqueProfileIds = Array.from(new Set(rawFiltered.map(e => e.profileId)));
            const profilePromises = uniqueProfileIds.map(id => profilesApi.getById(id));
            const results = await Promise.all(profilePromises);
            profiles = results.filter((p): p is Profile => p !== null);
        }

        const filteredEvents = rawFiltered.map(e => normalizeEvent(e, profiles));

        const now = Date.now();
        let effectiveDays = days;
        let effectiveEnd = now;

        if (startDate && endDate) {
            effectiveDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            effectiveEnd = endDate;
        }

        const totalViews = filteredEvents.filter(e => e.type === 'view').length;
        const interactions = filteredEvents.filter(e => e.type !== 'view' && e.type !== 'nps_response');
        const totalActions = interactions.length;

        // Chart data
        const dateMap: Record<string, { views: number; clicks: number }> = {};
        for (let i = effectiveDays - 1; i >= 0; i--) {
            const d = new Date(effectiveEnd - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            dateMap[d] = { views: 0, clicks: 0 };
        }

        filteredEvents.forEach(e => {
            const d = new Date(e.ts).toISOString().split('T')[0];
            if (dateMap[d]) {
                if (e.type === 'view') dateMap[d].views++;
                else if (e.type !== 'nps_response') dateMap[d].clicks++;
            }
        });

        // Interaction Map (Content Performance)
        const categoryMap: Record<string, number> = { button: 0, portfolio: 0, catalog: 0, video: 0, pix: 0, nps: 0 };
        const assetDetailMap: Record<string, { label: string; count: number; type: string }> = {};

        interactions.forEach(normalized => {
            if (normalized.assetType && categoryMap.hasOwnProperty(normalized.assetType)) {
                categoryMap[normalized.assetType]++;
            }

            if (normalized.assetId) {
                const key = `${normalized.profileId}-${normalized.assetId}`;
                if (!assetDetailMap[key]) {
                    assetDetailMap[key] = {
                        label: normalized.assetLabel,
                        count: 0,
                        type: normalized.assetType
                    };
                }
                assetDetailMap[key].count++;
            }
        });

        const topAssets = Object.values(assetDetailMap)
            .sort((a, b) => b.count - a.count)
            .map(l => ({
                label: l.label,
                clicks: l.count,
                percentage: totalActions > 0 ? (l.count / totalActions) * 100 : 0
            }))
            .slice(0, 10);

        // Peak Hours
        const hourMap: Record<number, number> = {};
        for (let i = 0; i < 24; i++) hourMap[i] = 0;
        filteredEvents.forEach(e => {
            const hour = new Date(e.ts).getHours();
            hourMap[hour]++;
        });

        // Sources
        const sourceMap: Record<string, number> = {};
        filteredEvents.filter(e => e.type === 'view').forEach(e => {
            const src = e.source || 'direct';
            sourceMap[src] = (sourceMap[src] || 0) + 1;
        });

        // Devices
        const deviceMap: Record<string, number> = { Mobile: 0, Desktop: 0, Tablet: 0 };
        filteredEvents.filter(e => e.type === 'view').forEach(e => {
            const d = e.device || 'Mobile';
            const label = d.charAt(0).toUpperCase() + d.slice(1);
            deviceMap[label] = (deviceMap[label] || 0) + 1;
        });

        const totalDeviceViews = Object.values(deviceMap).reduce((a, b) => a + b, 0) || 1;

        // UTM Summary
        const utmSources: Record<string, number> = {};
        const utmMediums: Record<string, number> = {};
        const utmCampaigns: Record<string, number> = {};

        filteredEvents.forEach(e => {
            if (e.utm?.source) utmSources[e.utm.source] = (utmSources[e.utm.source] || 0) + 1;
            if (e.utm?.medium) utmMediums[e.utm.medium] = (utmMediums[e.utm.medium] || 0) + 1;
            if (e.utm?.campaign) utmCampaigns[e.utm.campaign] = (utmCampaigns[e.utm.campaign] || 0) + 1;
        });

        const mapToSortedArray = (map: Record<string, number>) =>
            Object.entries(map)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 10);

        return {
            totalViews,
            totalClicks: totalActions,
            ctr: totalViews > 0 ? (totalActions / totalViews) * 100 : 0,
            viewsByDate: Object.entries(dateMap).map(([date, val]) => ({ date, value: val.views })),
            clicksByDate: Object.entries(dateMap).map(([date, val]) => ({ date, value: val.clicks })),
            sources: Object.entries(sourceMap).map(([name, value]) => ({
                name,
                value,
                percentage: totalViews > 0 ? (value / totalViews) * 100 : 0
            })),
            devices: Object.entries(deviceMap).map(([name, value]) => ({
                name,
                value,
                percentage: Math.round((value / totalDeviceViews) * 100)
            })).sort((a, b) => b.value - a.value),
            topLinks: topAssets,
            peakHours: Object.entries(hourMap).map(([hour, value]) => ({ hour: parseInt(hour), value })),
            utmSummary: {
                sources: mapToSortedArray(utmSources),
                mediums: mapToSortedArray(utmMediums),
                campaigns: mapToSortedArray(utmCampaigns)
            },
            contentPerformance: {
                byCategory: Object.entries(categoryMap).map(([cat, count]) => ({
                    category: cat,
                    count,
                    percentage: totalActions > 0 ? (count / totalActions) * 100 : 0
                })),
                totalActions,
                bestAsset: topAssets.length > 0 ? { label: topAssets[0].label, count: topAssets[0].clicks, type: 'clique' } : null,
                zeroInteractionItems: [],
                pixCopies: interactions.filter(e => e.type === 'pix_copied').length
            }
        };
    } catch (error) {
        console.error('Erro ao gerar resumo de analytics:', error);

        // Fallback: retornar dados vazios
        return {
            totalViews: 0,
            totalClicks: 0,
            ctr: 0,
            viewsByDate: [],
            clicksByDate: [],
            sources: [],
            devices: [],
            topLinks: [],
            peakHours: [],
            utmSummary: { sources: [], mediums: [], campaigns: [] },
            contentPerformance: {
                byCategory: [],
                totalActions: 0,
                bestAsset: null,
                zeroInteractionItems: [],
                pixCopies: 0
            }
        };
    }
};

// ============================================
// CAPTURE SESSION ORIGIN (Delegação)
// ============================================

export const captureSessionOrigin = captureSessionOriginSupabase;

// ============================================
// FLUSH EVENTS (Expor para uso manual)
// ============================================

export { flushEvents };

