import { supabase } from '@/lib/supabase';
import { Profile, ProfileButton, CatalogItem, PortfolioItem, YoutubeVideoItem, SchedulingSlot } from '@/types';
import { storageApi } from './storage';

const isUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// Mapear do Banco para App
function mapProfile(p: any): Profile {
    return {
        id: p.id,
        clientId: p.client_id,
        slug: p.slug,
        profileType: p.profile_type,
        displayName: p.display_name,
        headline: p.headline,
        bioShort: p.bio_short,
        bioLong: p.bio_long,
        avatarUrl: p.avatar_url,
        coverUrl: p.cover_url,
        layoutTemplate: p.layout_template,
        visibilityMode: p.visibility_mode,
        // password intentionally removed for security
        theme: p.theme || {},
        fonts: p.fonts || {},
        createdAt: p.created_at,
        updatedAt: p.updated_at,

        // Pro Features
        pixKey: p.pix_key,
        enableLeadCapture: p.enable_lead_capture,
        enableNps: p.enable_nps,
        npsRedirectUrl: p.nps_redirect_url,
        hideBranding: p.hide_branding,

        // Scheduling
        enableScheduling: p.enable_scheduling,
        schedulingMode: p.scheduling_mode,
        externalBookingUrl: p.external_booking_url,
        bookingWhatsapp: p.booking_whatsapp,

        // Community
        showInCommunity: p.show_in_community,
        communitySegment: p.community_segment,
        communityCity: p.community_city,
        // communityState removed (not in DB)
        communityServiceMode: p.community_service_mode,
        communityPunchline: p.community_punchline,
        communityPrimaryCta: p.community_primary_cta,
        communityGmbLink: p.community_gmb_link,

        // Promotion
        promotionEnabled: p.promotion_enabled,
        promotionTitle: p.promotion_title,
        promotionDescription: p.promotion_description,
        promotionDiscountPercentage: p.promotion_discount_percentage,
        promotionCurrentPrice: p.promotion_current_price,
        promotionImageUrl: p.promotion_image_url,
        promotionWhatsApp: p.promotion_whatsapp,

        // Sponsorship
        sponsored_enabled: p.sponsored_enabled,
        sponsored_until: p.sponsored_until,
        sponsored_segment: p.sponsored_segment,

        // Admin Curation
        featured: p.featured || false,
        showOnLanding: p.show_on_landing || false,

        // Module Styling
        moduleThemes: p.module_themes || {},
        generalModuleTheme: p.general_module_theme,

        // Collections (mapped from joined data or loaded separate)
        buttons: [],
        catalogItems: [],
        portfolioItems: [],
        youtubeVideos: [],
        nativeSlots: []
    };
}

function mapCatalogItem(i: any): CatalogItem {
    return {
        id: i.id,
        profileId: i.profile_id,
        kind: i.kind,
        title: i.title,
        description: i.description,
        priceText: i.price_text,
        imageUrl: i.image_url,
        ctaLabel: i.cta_label,
        ctaLink: i.cta_link,
        sortOrder: i.sort_order,
        isActive: i.is_active,
        clientId: i.client_id
    };
}

function mapPortfolioItem(i: any): PortfolioItem {
    return {
        id: i.id,
        profileId: i.profile_id,
        title: i.title,
        imageUrl: i.image_url,
        sortOrder: i.sort_order,
        isActive: i.is_active,
        clientId: i.client_id
    };
}

function mapVideoItem(i: any): YoutubeVideoItem {
    return {
        id: i.id,
        profileId: i.profile_id,
        title: i.title,
        url: i.url,
        sortOrder: i.sort_order,
        isActive: i.is_active,
        clientId: i.client_id
    };
}

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
        clientId: s.client_id
    };
}

function mapButton(b: any): ProfileButton {
    return {
        id: b.id,
        profileId: b.profile_id,
        type: b.type,
        label: b.label,
        value: b.value,
        enabled: b.enabled,
        visibility: b.visibility as ProfileButton['visibility'],
        pinned: b.pinned,
        sortOrder: b.sort_order,
        style: b.style || {},
        clientId: b.client_id
    };
}

export const profilesApi = {
    listAll: async (): Promise<Profile[]> => {
        const { data, error } = await (supabase.from('profiles') as any)
            .select('id, client_id, display_name, slug, avatar_url, updated_at, layout_template, featured, show_on_landing')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching all profiles:', error);
            return [];
        }

        return (data || []).map(mapProfile);
    },

    getByIds: async (ids: string[]): Promise<Profile[]> => {
        if (!ids.length) return [];
        const { data, error } = await (supabase.from('profiles') as any)
            .select('id, client_id, slug, display_name, headline, bio_short, avatar_url, updated_at')
            .in('id', ids);

        if (error) {
            console.error('Error fetching profiles by ids:', error);
            return [];
        }

        return (data || []).map(mapProfile);
    },

    listCommunity: async (): Promise<Profile[]> => {
        const { data: profiles, error } = await (supabase.from('profiles') as any)
            .select(`
                id, client_id, slug, profile_type, display_name, headline, bio_short, avatar_url, cover_url, 
                layout_template, visibility_mode, theme, fonts, module_themes, created_at, updated_at,
                show_in_community, community_segment, community_city, 
                community_punchline, sponsored_enabled, sponsored_until, sponsored_segment,
                promotion_enabled, promotion_title, promotion_description, promotion_discount_percentage,
                promotion_current_price, promotion_image_url, promotion_whatsapp, booking_whatsapp, featured,
                pix_key, enable_lead_capture, enable_nps, hide_branding,
                profile_buttons(id, type, label, value, enabled, visibility, sort_order),
                catalog_items(id, title, description, price_text, image_url, cta_label, cta_link, sort_order, is_active),
                portfolio_items(id, title, image_url, sort_order, is_active),
                youtube_videos(id, title, url, sort_order, is_active),
                showcases(id, is_active, community_click_destination)
            `)
            .eq('show_in_community', true)
            .eq('visibility_mode', 'public')
            .order('created_at', { ascending: false })
            .order('sort_order', { foreignTable: 'profile_buttons', ascending: true })
            .order('sort_order', { foreignTable: 'catalog_items', ascending: true })
            .order('sort_order', { foreignTable: 'portfolio_items', ascending: true })
            .order('sort_order', { foreignTable: 'youtube_videos', ascending: true });

        if (error) {
            console.error('Error fetching community profiles:', error);
            return [];
        }

        return (profiles || []).map(p => {
            const profile = mapProfile(p);
            profile.buttons = (p.profile_buttons || []).map(mapButton);
            profile.catalogItems = (p.catalog_items || []).map(mapCatalogItem);
            profile.portfolioItems = (p.portfolio_items || []).map(mapPortfolioItem);
            profile.youtubeVideos = (p.youtube_videos || []).map(mapVideoItem);
            const showcase = Array.isArray(p.showcases) ? p.showcases[0] : (p.showcases as any);
            profile.communityClickDestination = showcase?.community_click_destination || 'profile';
            profile.hasShowcase = showcase?.is_active === true;
            return profile;
        });
    },

    listLandingProfiles: async (): Promise<Profile[]> => {
        const { data: profiles, error } = await (supabase.from('profiles') as any)
            .select(`
                id, client_id, slug, profile_type, display_name, headline, bio_short, avatar_url, cover_url, 
                layout_template, visibility_mode, theme, fonts, module_themes, created_at, updated_at,
                show_on_landing, community_segment, community_city,
                community_punchline, sponsored_enabled, sponsored_until, sponsored_segment,
                promotion_enabled, promotion_title, promotion_description, promotion_discount_percentage,
                promotion_current_price, promotion_image_url, promotion_whatsapp, booking_whatsapp, featured,
                pix_key, enable_lead_capture, enable_nps, hide_branding,
                profile_buttons(id, type, label, value, enabled, visibility, sort_order),
                catalog_items(id, title, description, price_text, image_url, cta_label, cta_link, sort_order, is_active),
                portfolio_items(id, title, image_url, sort_order, is_active),
                youtube_videos(id, title, url, sort_order, is_active),
                showcases(id, is_active, community_click_destination)
            `)
            .eq('show_on_landing', true)
            .eq('visibility_mode', 'public')
            .order('created_at', { ascending: false })
            .order('sort_order', { foreignTable: 'profile_buttons', ascending: true })
            .order('sort_order', { foreignTable: 'catalog_items', ascending: true })
            .order('sort_order', { foreignTable: 'portfolio_items', ascending: true })
            .order('sort_order', { foreignTable: 'youtube_videos', ascending: true });

        if (error) {
            console.error('Error fetching landing profiles:', error);
            return [];
        }

        return (profiles || []).map(p => {
            const profile = mapProfile(p);
            profile.buttons = (p.profile_buttons || []).map(mapButton);
            profile.catalogItems = (p.catalog_items || []).map(mapCatalogItem);
            profile.portfolioItems = (p.portfolio_items || []).map(mapPortfolioItem);
            profile.youtubeVideos = (p.youtube_videos || []).map(mapVideoItem);
            const showcase = Array.isArray(p.showcases) ? p.showcases[0] : (p.showcases as any);
            profile.communityClickDestination = showcase?.community_click_destination || 'profile';
            profile.hasShowcase = showcase?.is_active === true;
            return profile;
        });
    },

    listFeaturedProfiles: async (): Promise<Profile[]> => {
        const { data: profiles, error } = await (supabase.from('profiles') as any)
            .select('id, client_id, slug, profile_type, display_name, headline, bio_short, avatar_url, cover_url, layout_template, theme, fonts, module_themes, featured, updated_at, showcases(id, is_active, community_click_destination)')
            .eq('featured', true)
            .eq('visibility_mode', 'public')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching featured profiles:', error);
            return [];
        }

        return (profiles || []).map(p => {
            const profile = mapProfile(p);
            const showcase = Array.isArray(p.showcases) ? p.showcases[0] : (p.showcases as any);
            profile.communityClickDestination = showcase?.community_click_destination || 'profile';
            profile.hasShowcase = showcase?.is_active === true;
            return profile;
        });
    },

    listByClient: async (clientId: string): Promise<Profile[]> => {
        const { data: profiles, error } = await (supabase.from('profiles') as any)
            .select(`
                id, client_id, display_name, slug, avatar_url, updated_at, layout_template, 
                theme, fonts,
                profile_buttons(*),
                scheduling_slots(*)
            `)
            .eq('client_id', clientId)
            .order('created_at', { ascending: true })
            .order('sort_order', { foreignTable: 'profile_buttons', ascending: true });

        if (error) {
            console.error('Error fetching profiles:', error);
            return [];
        }

        return (profiles || []).map(p => {
            const profile = mapProfile(p);
            profile.buttons = (p.profile_buttons || []).map(mapButton);
            profile.nativeSlots = (p.scheduling_slots || []).map(mapSlot);
            return profile;
        });
    },

    getBySlug: async (slug: string) => {
        const { data, error } = await (supabase.from('profiles') as any)
            .select(`
                id, client_id, slug, profile_type, display_name, headline, bio_short, bio_long, avatar_url, cover_url, 
                layout_template, visibility_mode, theme, fonts, created_at, updated_at,
                pix_key, enable_lead_capture, enable_nps, nps_redirect_url, hide_branding,
                enable_scheduling, scheduling_mode, external_booking_url, booking_whatsapp,
                show_in_community, community_segment, community_city, community_service_mode, 
                community_punchline, community_primary_cta, community_gmb_link,
                promotion_enabled, promotion_title, promotion_description, promotion_discount_percentage,
                promotion_current_price, promotion_image_url, promotion_whatsapp,
                sponsored_enabled, sponsored_until, sponsored_segment,
                featured, show_on_landing, module_themes, general_module_theme
            `)
            .eq('slug', slug)
            .maybeSingle();

        if (error || !data) return null;

        const profile = mapProfile(data);
        const id = profile.id;

        const [
            { data: buttons },
            { data: catalog },
            { data: portfolio },
            { data: videos },
            { data: slots }
        ] = await Promise.all([
            (supabase.from('profile_buttons') as any).select('id, profile_id, type, label, value, enabled, visibility, pinned, sort_order, style, client_id').eq('profile_id', id).order('sort_order', { ascending: true }),
            (supabase.from('catalog_items') as any).select('id, profile_id, kind, title, description, price_text, image_url, cta_label, cta_link, sort_order, is_active, client_id').eq('profile_id', id).order('sort_order', { ascending: true }),
            (supabase.from('portfolio_items') as any).select('id, profile_id, title, image_url, sort_order, is_active, client_id').eq('profile_id', id).order('sort_order', { ascending: true }),
            (supabase.from('youtube_videos') as any).select('id, profile_id, title, url, sort_order, is_active, client_id').eq('profile_id', id).order('sort_order', { ascending: true }),
            (supabase.from('scheduling_slots') as any).select('id, day_of_week, start_time, end_time, is_active, status, booked_by, booked_at, client_id').eq('profile_id', id).order('day_of_week', { ascending: true })
        ]);

        profile.buttons = (buttons || []).map(mapButton);
        profile.catalogItems = (catalog || []).map(mapCatalogItem);
        profile.portfolioItems = (portfolio || []).map(mapPortfolioItem);
        profile.youtubeVideos = (videos || []).map(mapVideoItem);
        profile.nativeSlots = (slots || []).map(mapSlot);

        return profile;
    },

    getById: async (id: string): Promise<Profile | null> => {
        console.log(`[profilesApi] Fetching full profile for ${id}...`);
        const { data, error } = await (supabase.from('profiles') as any)
            .select(`
                id, client_id, slug, profile_type, display_name, headline, bio_short, bio_long, avatar_url, cover_url, 
                layout_template, visibility_mode, theme, fonts, created_at, updated_at,
                pix_key, enable_lead_capture, enable_nps, nps_redirect_url, hide_branding,
                enable_scheduling, scheduling_mode, external_booking_url, booking_whatsapp,
                show_in_community, community_segment, community_city, community_service_mode, 
                community_punchline, community_primary_cta, community_gmb_link,
                promotion_enabled, promotion_title, promotion_description, promotion_discount_percentage,
                promotion_current_price, promotion_image_url, promotion_whatsapp,
                sponsored_enabled, sponsored_until, sponsored_segment,
                featured, show_on_landing, module_themes, general_module_theme
            `)
            .eq('id', id)
            .maybeSingle();

        if (error || !data) {
            if (error) console.error('[profilesApi] Error fetching profile:', error);
            return null;
        }

        const profile = mapProfile(data);
        console.log(`[profilesApi] Fetching sub-collections for ${id}...`);

        const [
            { data: buttons },
            { data: catalog },
            { data: portfolio },
            { data: videos },
            { data: slots }
        ] = await Promise.all([
            (supabase.from('profile_buttons') as any).select('*').eq('profile_id', id).order('sort_order', { ascending: true }),
            (supabase.from('catalog_items') as any).select('*').eq('profile_id', id).order('sort_order', { ascending: true }),
            (supabase.from('portfolio_items') as any).select('*').eq('profile_id', id).order('sort_order', { ascending: true }),
            (supabase.from('youtube_videos') as any).select('*').eq('profile_id', id).order('sort_order', { ascending: true }),
            (supabase.from('scheduling_slots') as any).select('*').eq('profile_id', id).order('day_of_week', { ascending: true })
        ]);

        profile.buttons = (buttons || []).map(mapButton);
        profile.catalogItems = (catalog || []).map(mapCatalogItem);
        profile.portfolioItems = (portfolio || []).map(mapPortfolioItem);
        profile.youtubeVideos = (videos || []).map(mapVideoItem);
        profile.nativeSlots = (slots || []).map(mapSlot);

        console.log(`[profilesApi] Fetch complete for ${id}.`);
        return profile;
    },

    create: async (profile: Partial<Profile> & { clientId: string }): Promise<Profile | null> => {
        const dbProfile: any = {
            client_id: profile.clientId,
            slug: profile.slug,
            profile_type: profile.profileType || 'personal',
            display_name: profile.displayName,
            layout_template: profile.layoutTemplate || 'Minimal Card',
            visibility_mode: profile.visibilityMode || 'public',
            theme: profile.theme,
            fonts: profile.fonts,
            module_themes: profile.moduleThemes,
            general_module_theme: profile.generalModuleTheme,
            community_primary_cta: profile.communityPrimaryCta,
            community_gmb_link: profile.communityGmbLink
        };

        const { data, error } = await (supabase.from('profiles') as any)
            .insert(dbProfile)
            .select()
            .single();

        if (error || !data) throw error || new Error("Failed to create profile");

        if (profile.buttons && profile.buttons.length > 0) {
            const dbButtons = profile.buttons.map((b, idx) => ({
                profile_id: data.id,
                type: b.type,
                label: b.label,
                value: b.value,
                sort_order: idx,
                enabled: b.enabled !== false,
                style: b.style || {},
                client_id: profile.clientId,
                visibility: b.visibility || 'public'
            }));

            await (supabase.from('profile_buttons') as any).insert(dbButtons);
        }

        return mapProfile(data);
    },

    update: async (id: string, updates: Partial<Profile>) => {
        console.log(`[profilesApi] Updating profile ${id}...`, updates);
        const dbUpdates: any = {};

        if (updates.displayName) dbUpdates.display_name = updates.displayName;
        if (updates.headline !== undefined) dbUpdates.headline = updates.headline;
        if (updates.bioShort !== undefined) dbUpdates.bio_short = updates.bioShort;
        if (updates.bioLong !== undefined) dbUpdates.bio_long = updates.bioLong;
        if (updates.bioLong !== undefined) dbUpdates.bio_long = updates.bioLong;

        // Handle Avatar and Cover Uploads
        if (updates.avatarUrl && updates.avatarUrl.startsWith('data:')) {
            try {
                dbUpdates.avatar_url = await storageApi.uploadImage(`avatars/${id}.jpg`, updates.avatarUrl);
            } catch (err) {
                console.error("[profilesApi] Critical: Failed to upload avatar:", err);
                throw new Error("Falha ao enviar avatar. Tente novamente.");
            }
        } else if (updates.avatarUrl !== undefined) {
            dbUpdates.avatar_url = updates.avatarUrl;
        }

        if (updates.coverUrl && updates.coverUrl.startsWith('data:')) {
            try {
                dbUpdates.cover_url = await storageApi.uploadImage(`covers/${id}.jpg`, updates.coverUrl);
            } catch (err) {
                console.error("[profilesApi] Critical: Failed to upload cover:", err);
                throw new Error("Falha ao enviar capa. Tente novamente.");
            }
        } else if (updates.coverUrl !== undefined) {
            dbUpdates.cover_url = updates.coverUrl;
        }

        // Handle Promotion Image Upload
        if (updates.promotionImageUrl && updates.promotionImageUrl.startsWith('data:')) {
            try {
                dbUpdates.promotion_image_url = await storageApi.uploadImage(`promotions/${id}.jpg`, updates.promotionImageUrl);
            } catch (err) {
                console.error("[profilesApi] Critical: Failed to upload promotion image:", err);
                throw new Error("Falha ao enviar imagem da promoção.");
            }
        } else if (updates.promotionImageUrl !== undefined) {
            dbUpdates.promotion_image_url = updates.promotionImageUrl;
        }

        if (updates.theme) dbUpdates.theme = updates.theme;
        if (updates.fonts) dbUpdates.fonts = updates.fonts;
        if (updates.slug) dbUpdates.slug = updates.slug;
        if (updates.layoutTemplate) dbUpdates.layout_template = updates.layoutTemplate;
        if (updates.profileType) dbUpdates.profile_type = updates.profileType;
        if (updates.visibilityMode) dbUpdates.visibility_mode = updates.visibilityMode;
        if (updates.pixKey !== undefined) dbUpdates.pix_key = updates.pixKey;
        if (updates.enableLeadCapture !== undefined) dbUpdates.enable_lead_capture = updates.enableLeadCapture;
        if (updates.enableNps !== undefined) dbUpdates.enable_nps = updates.enableNps;
        if (updates.npsRedirectUrl !== undefined) dbUpdates.nps_redirect_url = updates.npsRedirectUrl;
        if (updates.hideBranding !== undefined) dbUpdates.hide_branding = updates.hideBranding;
        if (updates.enableScheduling !== undefined) dbUpdates.enable_scheduling = updates.enableScheduling;
        if (updates.schedulingMode !== undefined) dbUpdates.scheduling_mode = updates.schedulingMode;
        if (updates.externalBookingUrl !== undefined) dbUpdates.external_booking_url = updates.externalBookingUrl;
        if (updates.bookingWhatsapp !== undefined) dbUpdates.booking_whatsapp = updates.bookingWhatsapp;
        if (updates.showInCommunity !== undefined) dbUpdates.show_in_community = updates.showInCommunity;
        if (updates.communitySegment !== undefined) dbUpdates.community_segment = updates.communitySegment;
        if (updates.communityCity !== undefined) dbUpdates.community_city = updates.communityCity;
        if (updates.communityPunchline !== undefined) dbUpdates.community_punchline = updates.communityPunchline;
        if (updates.communityServiceMode !== undefined) dbUpdates.community_service_mode = updates.communityServiceMode;
        if (updates.communityPrimaryCta !== undefined) dbUpdates.community_primary_cta = updates.communityPrimaryCta;
        if (updates.communityGmbLink !== undefined) dbUpdates.community_gmb_link = updates.communityGmbLink;
        if (updates.promotionEnabled !== undefined) dbUpdates.promotion_enabled = updates.promotionEnabled;
        if (updates.promotionTitle !== undefined) dbUpdates.promotion_title = updates.promotionTitle;
        if (updates.promotionDescription !== undefined) dbUpdates.promotion_description = updates.promotionDescription;
        if (updates.promotionDiscountPercentage !== undefined) dbUpdates.promotion_discount_percentage = updates.promotionDiscountPercentage;
        if (updates.promotionCurrentPrice !== undefined) dbUpdates.promotion_current_price = updates.promotionCurrentPrice;
        if (updates.promotionImageUrl !== undefined) dbUpdates.promotion_image_url = updates.promotionImageUrl;
        if (updates.promotionWhatsApp !== undefined) dbUpdates.promotion_whatsapp = updates.promotionWhatsApp;
        if (updates.moduleThemes !== undefined) dbUpdates.module_themes = updates.moduleThemes;
        if (updates.generalModuleTheme !== undefined) dbUpdates.general_module_theme = updates.generalModuleTheme;
        if (updates.featured !== undefined) dbUpdates.featured = updates.featured;
        if (updates.showOnLanding !== undefined) dbUpdates.show_on_landing = updates.showOnLanding;

        dbUpdates.updated_at = new Date().toISOString();

        const { data, error } = await (supabase.from('profiles') as any)
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('[profilesApi] Error updating profile:', error);
            throw error;
        }

        console.log(`[profilesApi] Profile metadata updated for ${id}.`);
        return mapProfile(data);
    },

    syncButtons: async (profileId: string, buttons: ProfileButton[], clientId?: string) => {
        console.log(`[profilesApi] Syncing buttons for ${profileId}...`);
        const activeIds = buttons.map(b => b.id).filter(id => id && isUUID(id));

        const deleteQuery = (supabase.from('profile_buttons') as any).delete().eq('profile_id', profileId);
        if (activeIds.length > 0) {
            await deleteQuery.not('id', 'in', `(${activeIds.join(',')})`);
        } else {
            await deleteQuery;
        }

        if (buttons.length === 0) return;

        const upsertData = buttons.map((b, idx) => ({
            id: (b.id && isUUID(b.id)) ? b.id : undefined,
            profile_id: profileId,
            client_id: clientId || b.clientId,
            type: b.type || 'link',
            label: b.label || '',
            value: b.value || '',
            enabled: b.enabled !== false,
            pinned: b.pinned || false,
            visibility: b.visibility || 'public',
            style: b.style || {},
            sort_order: idx
        }));

        const { error } = await (supabase.from('profile_buttons') as any).upsert(upsertData);
        if (error) throw error;
    },

    syncCatalogItems: async (profileId: string, items: CatalogItem[], clientId?: string) => {
        console.log(`[profilesApi] Syncing catalog for ${profileId}...`);
        const activeIds = items.map(i => i.id).filter(id => id && isUUID(id));

        const deleteQuery = (supabase.from('catalog_items') as any).delete().eq('profile_id', profileId);
        if (activeIds.length > 0) {
            await deleteQuery.not('id', 'in', `(${activeIds.join(',')})`);
        } else {
            await deleteQuery;
        }

        if (!items || items.length === 0) return [];

        const processed = await Promise.all(items.map(async (item, idx) => {
            let imageUrl = item.imageUrl;
            if (imageUrl && imageUrl.startsWith('data:')) {
                try {
                    imageUrl = await storageApi.uploadImage(`catalog/${profileId}_${item.id || idx}.jpg`, imageUrl);
                } catch (err) {
                    console.error("[profilesApi] Failed to upload catalog image:", err);
                }
            }

            const data: any = {
                id: (item.id && isUUID(item.id)) ? item.id : undefined,
                profile_id: profileId,
                client_id: clientId || item.clientId,
                kind: item.kind || 'service',
                title: item.title || '',
                description: item.description || '',
                price_text: item.priceText || '',
                image_url: imageUrl,
                cta_label: item.ctaLabel || '',
                cta_link: item.ctaLink || '',
                is_active: item.isActive !== false,
                sort_order: idx
            };

            return { data, obj: { ...item, imageUrl } };
        }));

        const { error } = await (supabase.from('catalog_items') as any).upsert(processed.map(p => p.data));
        if (error) throw error;

        return processed.map(p => p.obj);
    },

    syncPortfolioItems: async (profileId: string, items: PortfolioItem[], clientId?: string) => {
        console.log(`[profilesApi] Syncing portfolio for ${profileId}...`);
        const activeIds = items.map(i => i.id).filter(id => id && isUUID(id));

        const deleteQuery = (supabase.from('portfolio_items') as any).delete().eq('profile_id', profileId);
        if (activeIds.length > 0) {
            await deleteQuery.not('id', 'in', `(${activeIds.join(',')})`);
        } else {
            await deleteQuery;
        }

        if (!items || items.length === 0) return [];

        const processed = await Promise.all(items.map(async (item, idx) => {
            let imageUrl = item.imageUrl;
            if (imageUrl && imageUrl.startsWith('data:')) {
                try {
                    imageUrl = await storageApi.uploadImage(`portfolio/${profileId}_${item.id || idx}.jpg`, imageUrl);
                } catch (err) {
                    console.error("[profilesApi] Failed to upload portfolio image:", err);
                }
            }

            const data: any = {
                id: (item.id && isUUID(item.id)) ? item.id : undefined,
                profile_id: profileId,
                client_id: clientId || item.clientId,
                title: item.title || '',
                image_url: imageUrl || '',
                is_active: item.isActive !== false,
                sort_order: idx
            };

            return { data, obj: { ...item, imageUrl } };
        }));

        const { error } = await (supabase.from('portfolio_items') as any).upsert(processed.map(p => p.data));
        if (error) throw error;

        return processed.map(p => p.obj);
    },

    syncYoutubeVideos: async (profileId: string, items: YoutubeVideoItem[], clientId?: string) => {
        console.log(`[profilesApi] Syncing videos for ${profileId}...`);
        const activeIds = items.map(i => i.id).filter(id => id && isUUID(id));

        const deleteQuery = (supabase.from('youtube_videos') as any).delete().eq('profile_id', profileId);
        if (activeIds.length > 0) {
            await deleteQuery.not('id', 'in', `(${activeIds.join(',')})`);
        } else {
            await deleteQuery;
        }

        if (!items || items.length === 0) return;

        const upsertData = items.map((item, idx) => ({
            id: (item.id && isUUID(item.id)) ? item.id : undefined,
            profile_id: profileId,
            client_id: clientId || item.clientId,
            title: item.title || '',
            url: item.url || '',
            is_active: item.isActive !== false,
            sort_order: idx
        }));

        const { error } = await (supabase.from('youtube_videos') as any).upsert(upsertData);
        if (error) throw error;
    },

    syncSchedulingSlots: async (profileId: string, items: SchedulingSlot[], clientId?: string) => {
        console.log(`[profilesApi] Syncing slots for ${profileId}...`);
        const activeIds = items.map(i => i.id).filter(id => id && isUUID(id));

        const deleteQuery = (supabase.from('scheduling_slots') as any).delete().eq('profile_id', profileId);
        if (activeIds.length > 0) {
            await deleteQuery.not('id', 'in', `(${activeIds.join(',')})`);
        } else {
            await deleteQuery;
        }

        if (!items || items.length === 0) return;

        const upsertData = items.map((item) => ({
            id: (item.id && isUUID(item.id)) ? item.id : undefined,
            profile_id: profileId,
            client_id: clientId || item.clientId,
            day_of_week: item.dayOfWeek,
            start_time: item.startTime,
            end_time: item.endTime,
            is_active: item.isActive !== false,
            status: item.status || 'available'
        }));

        const { error } = await (supabase.from('scheduling_slots') as any).upsert(upsertData);
        if (error) throw error;
    },

    deleteButton: async (buttonId: string) => {
        await (supabase.from('profile_buttons') as any).delete().eq('id', buttonId);
    },

    checkSlugAvailability: async (slug: string, excludeProfileId?: string): Promise<boolean> => {
        const query = (supabase.from('profiles') as any).select('id').eq('slug', slug);
        if (excludeProfileId) {
            query.neq('id', excludeProfileId);
        }
        const { data, error } = await query.maybeSingle();
        if (error) return false;
        return !data;
    }
};
