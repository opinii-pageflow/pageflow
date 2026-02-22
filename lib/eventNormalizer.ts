import { AnalyticsEvent, Profile } from '../types';

/**
 * Tipo normalizado de asset - fonte única da verdade
 */
export type NormalizedAssetType = 'button' | 'portfolio' | 'catalog' | 'video' | 'pix' | 'nps' | 'unknown';

/**
 * Evento normalizado - estrutura padronizada
 */
export interface NormalizedEvent {
    assetType: NormalizedAssetType;
    assetLabel: string; // NUNCA vazio, NUNCA "Desconhecido"
    assetId: string | undefined;
    profileId: string;
    clientId: string;
    type: string;
    ts: number;
    device?: 'mobile' | 'desktop' | 'tablet';
    source: string;
    utm?: {
        source?: string;
        medium?: string;
        campaign?: string;
        content?: string;
        term?: string;
    };
    score?: number;
    comment?: string;
    moduleOrigin?: string; // Origem específica (ex: 'whatsapp', 'instagram' ou o próprio assetType)
}

/**
 * Sanitiza labels para evitar placeholders como "Rótulo", "Label", etc.
 */
export const sanitizeAssetLabel = (value: any): string | null => {
    if (typeof value !== 'string') return null;
    const v = value.trim();
    if (!v) return null;

    const normalized = v
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const blocked = new Set([
        'rotulo', 'rótulo', 'label', 'titulo', 'title', 'nome', 'name',
        'sem rotulo', 'sem rótulo', 'desconhecido', 'undefined', 'null',
        'foto sem titulo', 'foto sem título', 'produto sem titulo', 'produto sem título',
        'video sem titulo', 'vídeo sem título', 'botao sem rotulo', 'botao sem rótulo'
    ]);

    if (blocked.has(normalized)) return null;
    return v;
};

/**
 * Resolve o tipo do asset com base no evento, mapeando campos antigos e variados.
 */
export const resolveAssetType = (event: AnalyticsEvent): NormalizedAssetType => {
    // 1. Tentar campos diretos do objeto (incluindo extensões dinâmicas)
    const raw = event as any;
    const candidates = [
        event.assetType,
        event.category,
        raw.module,
        raw.contentType,
        raw.type // Cuidado: 'type' geralmente é o nome do evento, mas checamos se é um dos tipos
    ];

    for (const cand of candidates) {
        if (typeof cand === 'string') {
            const t = cand.toLowerCase();
            if (['button', 'portfolio', 'catalog', 'video', 'pix', 'nps'].includes(t)) {
                return t as NormalizedAssetType;
            }
        }
    }

    // 2. Inferir pelo nome do evento (protocolo infalível)
    switch (event.type) {
        case 'pix_copied': return 'pix';
        case 'nps_response': return 'nps';
        case 'portfolio_click': return 'portfolio';
        case 'catalog_zoom':
        case 'catalog_cta_click': return 'catalog';
        case 'video_view': return 'video';
        case 'click': return 'button';
        default: return 'unknown';
    }
};

/**
 * Resolve o ID do asset mapeando diversos campos possíveis.
 */
export const resolveAssetId = (event: AnalyticsEvent): string | undefined => {
    const raw = event as any;
    const id = event.assetId || event.linkId || raw.itemId || raw.contentId || raw.videoId || raw.productId;

    if (!id || id === 'unknown' || id === 'undefined' || id === 'null') return undefined;
    return String(id);
};

/**
 * Resolve o label de um asset com fallback robusto buscando no profile correspondente.
 */
export const resolveAssetLabel = (
    event: AnalyticsEvent,
    profiles: Profile[]
): string => {
    const assetId = resolveAssetId(event);
    const assetType = resolveAssetType(event);

    // 1. Fallbacks imediatos por tipo (Hardcoded)
    if (assetType === 'pix') return 'Chave Pix';
    if (assetType === 'nps') return 'Avaliação NPS';

    // 2. Tentar resolver pelo profile atual (Fonte da Verdade)
    if (assetId) {
        const profile = (profiles ?? []).find(p => p.id === event.profileId);
        if (profile) {
            switch (assetType) {
                case 'button': {
                    const btn = (profile.buttons ?? []).find(b => b.id === assetId);
                    const label = sanitizeAssetLabel(btn?.label);
                    if (label) return label;
                    break;
                }
                case 'portfolio': {
                    const item = (profile.portfolioItems ?? []).find(i => i.id === assetId);
                    const label = sanitizeAssetLabel(item?.title);
                    if (label) return label;
                    break;
                }
                case 'catalog': {
                    const item = (profile.catalogItems ?? []).find(i => i.id === assetId);
                    const label = sanitizeAssetLabel(item?.title);
                    if (label) return label;
                    break;
                }
                case 'video': {
                    const item = (profile.youtubeVideos ?? []).find(i => i.id === assetId);
                    const label = sanitizeAssetLabel(item?.title);
                    if (label) return label;
                    break;
                }
            }
        }
    }

    // 3. Se não resolveu via profile, usar o label salvo no evento (se for real)
    const savedLabel = sanitizeAssetLabel(event.assetLabel);
    if (savedLabel) return savedLabel;

    // 4. Fallbacks finais por tipo (descritivo)
    switch (assetType) {
        case 'portfolio': return 'Foto sem título';
        case 'catalog': return 'Produto sem título';
        case 'video': return 'Vídeo sem título';
        case 'button': return 'Botão sem rótulo';
        default: return 'Interação sem nome';
    }
};

/**
 * Resolve a origem específica do módulo (ex: para botões, retorna o tipo do botão)
 */
export const resolveModuleOrigin = (
    event: AnalyticsEvent,
    profiles: Profile[]
): string => {
    const assetId = resolveAssetId(event);
    const assetType = resolveAssetType(event);

    if (assetId && assetType === 'button') {
        const profile = (profiles ?? []).find(p => p.id === event.profileId);
        if (profile) {
            const btn = (profile.buttons ?? []).find(b => b.id === assetId);
            if (btn?.type) return btn.type;
        }
    }

    return assetType;
};

/**
 * Normaliza um evento do Analytics para o padrão 2026.
 */
export const normalizeEvent = (
    event: AnalyticsEvent,
    profiles: Profile[]
): NormalizedEvent => {
    const assetType = resolveAssetType(event);
    const assetId = resolveAssetId(event);
    const assetLabel = resolveAssetLabel(event, profiles);

    return {
        assetType,
        assetLabel,
        assetId: assetType === 'pix' && !assetId ? 'pix' : assetId,
        profileId: event.profileId,
        clientId: event.clientId,
        type: event.type,
        ts: event.ts,
        device: event.device,
        source: event.source || 'direct',
        utm: event.utm,
        score: event.score,
        comment: event.comment,
        moduleOrigin: resolveModuleOrigin(event, profiles)
    };
};
