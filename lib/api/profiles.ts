import { supabase } from '@/lib/supabase';
import { Profile, ProfileButton, CatalogItem, PortfolioItem, YoutubeVideoItem, SchedulingSlot } from '@/types';

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
        password: p.password,
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
        communityState: p.community_state,
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
        visibility: b.visibility as any,
        pinned: b.pinned,
        sortOrder: b.sort_order,
        style: b.style || {},
        clientId: b.client_id
    };
}

export const profilesApi = {
    listAll: async (): Promise<Profile[]> => {
        const { data, error } = await (supabase.from('profiles') as any)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching all profiles:', error);
            return [];
        }

        return (data || []).map(mapProfile);
    },

    listCommunity: async (): Promise<Profile[]> => {
        const { data: profiles, error } = await (supabase.from('profiles') as any)
            .select('*')
            .eq('show_in_community', true)
            .eq('visibility_mode', 'public')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching community profiles:', error);
            return [];
        }

        const result: Profile[] = [];
        for (const p of (profiles || [])) {
            const profile = mapProfile(p);

            // Parallel fetch for this profile's sub-collections to avoid one-by-one waterfall if possible, 
            // but for simplicity and small lists, this is reliable.
            const [
                { data: buttons },
                { data: catalog },
                { data: portfolio },
                { data: videos }
            ] = await Promise.all([
                (supabase.from('profile_buttons') as any).select('*').eq('profile_id', p.id).order('sort_order', { ascending: true }),
                (supabase.from('catalog_items') as any).select('*').eq('profile_id', p.id).order('sort_order', { ascending: true }),
                (supabase.from('portfolio_items') as any).select('*').eq('profile_id', p.id).order('sort_order', { ascending: true }),
                (supabase.from('youtube_videos') as any).select('*').eq('profile_id', p.id).order('sort_order', { ascending: true })
            ]);

            profile.buttons = (buttons || []).map(mapButton);
            profile.catalogItems = (catalog || []).map(mapCatalogItem);
            profile.portfolioItems = (portfolio || []).map(mapPortfolioItem);
            profile.youtubeVideos = (videos || []).map(mapVideoItem);

            result.push(profile);
        }

        return result;
    },

    listLandingProfiles: async (): Promise<Profile[]> => {
        const { data: profiles, error } = await (supabase.from('profiles') as any)
            .select('*')
            .eq('show_on_landing', true)
            .eq('visibility_mode', 'public')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching landing profiles:', error);
            return [];
        }

        const result: Profile[] = [];
        for (const p of (profiles || [])) {
            const profile = mapProfile(p);
            const [
                { data: buttons },
                { data: catalog },
                { data: portfolio },
                { data: videos }
            ] = await Promise.all([
                (supabase.from('profile_buttons') as any).select('*').eq('profile_id', p.id).order('sort_order', { ascending: true }),
                (supabase.from('catalog_items') as any).select('*').eq('profile_id', p.id).order('sort_order', { ascending: true }),
                (supabase.from('portfolio_items') as any).select('*').eq('profile_id', p.id).order('sort_order', { ascending: true }),
                (supabase.from('youtube_videos') as any).select('*').eq('profile_id', p.id).order('sort_order', { ascending: true })
            ]);
            profile.buttons = (buttons || []).map(mapButton);
            profile.catalogItems = (catalog || []).map(mapCatalogItem);
            profile.portfolioItems = (portfolio || []).map(mapPortfolioItem);
            profile.youtubeVideos = (videos || []).map(mapVideoItem);
            result.push(profile);
        }
        return result;
    },

    listFeaturedProfiles: async (): Promise<Profile[]> => {
        const { data: profiles, error } = await (supabase.from('profiles') as any)
            .select('*')
            .eq('featured', true)
            .eq('visibility_mode', 'public')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching featured profiles:', error);
            return [];
        }

        return (profiles || []).map(mapProfile);
    },

    listByClient: async (clientId: string): Promise<Profile[]> => {
        const { data: profiles, error } = await (supabase.from('profiles') as any)
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching profiles:', error);
            return [];
        }

        const result: Profile[] = [];
        for (const p of (profiles || [])) {
            const profile = mapProfile(p);
            const { data: buttons } = await (supabase.from('profile_buttons') as any)
                .select('*')
                .eq('profile_id', p.id)
                .order('sort_order', { ascending: true });

            profile.buttons = (buttons || []).map(mapButton);
            result.push(profile);
        }

        return result;
    },

    getBySlug: async (slug: string) => {
        const { data, error } = await (supabase.from('profiles') as any)
            .select('*')
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

        return profile;
    },

    getById: async (id: string): Promise<Profile | null> => {
        console.log(`[profilesApi] Fetching full profile for ${id}...`);
        const { data, error } = await (supabase.from('profiles') as any)
            .select('*')
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
        if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
        if (updates.coverUrl !== undefined) dbUpdates.cover_url = updates.coverUrl;
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
        if (updates.communityState !== undefined) dbUpdates.community_state = updates.communityState;
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

        if (activeIds.length > 0) {
            await (supabase.from('profile_buttons') as any).delete().eq('profile_id', profileId).not('id', 'in', `(${activeIds.join(',')})`);
        } else {
            await (supabase.from('profile_buttons') as any).delete().eq('profile_id', profileId);
        }

        const upsertData = buttons.map((b, idx) => {
            const data: any = {
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
            };
            if (b.id && isUUID(b.id)) data.id = b.id;
            return data;
        });

        if (upsertData.length > 0) {
            const { error } = await (supabase.from('profile_buttons') as any).upsert(upsertData);
            if (error) throw error;
        }
    },

    syncCatalogItems: async (profileId: string, items: CatalogItem[], clientId?: string) => {
        console.log(`[profilesApi] Syncing catalog for ${profileId}...`);
        const activeIds = items.map(i => i.id).filter(id => id && isUUID(id));

        if (activeIds.length > 0) {
            await (supabase.from('catalog_items') as any).delete().eq('profile_id', profileId).not('id', 'in', `(${activeIds.join(',')})`);
        } else {
            await (supabase.from('catalog_items') as any).delete().eq('profile_id', profileId);
        }

        if (!items || items.length === 0) return;

        const upsertData = items.map((item, idx) => {
            const data: any = {
                profile_id: profileId,
                client_id: clientId || item.clientId,
                kind: item.kind || 'service',
                title: item.title || '',
                description: item.description || '',
                price_text: item.priceText || '',
                image_url: item.imageUrl || '',
                cta_label: item.ctaLabel || '',
                cta_link: item.ctaLink || '',
                is_active: item.isActive !== false,
                sort_order: idx
            };
            if (item.id && isUUID(item.id)) data.id = item.id;
            return data;
        });

        const { error } = await (supabase.from('catalog_items') as any).upsert(upsertData);
        if (error) throw error;
    },

    syncPortfolioItems: async (profileId: string, items: PortfolioItem[], clientId?: string) => {
        console.log(`[profilesApi] Syncing portfolio for ${profileId}...`);
        const activeIds = items.map(i => i.id).filter(id => id && isUUID(id));

        if (activeIds.length > 0) {
            await (supabase.from('portfolio_items') as any).delete().eq('profile_id', profileId).not('id', 'in', `(${activeIds.join(',')})`);
        } else {
            await (supabase.from('portfolio_items') as any).delete().eq('profile_id', profileId);
        }

        if (!items || items.length === 0) return;

        const upsertData = items.map((item, idx) => {
            const data: any = {
                profile_id: profileId,
                client_id: clientId || item.clientId,
                title: item.title || '',
                image_url: item.imageUrl || '',
                is_active: item.isActive !== false,
                sort_order: idx
            };
            if (item.id && isUUID(item.id)) data.id = item.id;
            return data;
        });

        const { error } = await (supabase.from('portfolio_items') as any).upsert(upsertData);
        if (error) throw error;
    },

    syncYoutubeVideos: async (profileId: string, items: YoutubeVideoItem[], clientId?: string) => {
        console.log(`[profilesApi] Syncing videos for ${profileId}...`);
        const activeIds = items.map(i => i.id).filter(id => id && isUUID(id));

        if (activeIds.length > 0) {
            await (supabase.from('youtube_videos') as any).delete().eq('profile_id', profileId).not('id', 'in', `(${activeIds.join(',')})`);
        } else {
            await (supabase.from('youtube_videos') as any).delete().eq('profile_id', profileId);
        }

        if (!items || items.length === 0) return;

        const upsertData = items.map((item, idx) => {
            const data: any = {
                profile_id: profileId,
                client_id: clientId || item.clientId,
                title: item.title || '',
                url: item.url || '',
                is_active: item.isActive !== false,
                sort_order: idx
            };
            if (item.id && isUUID(item.id)) data.id = item.id;
            return data;
        });

        const { error } = await (supabase.from('youtube_videos') as any).upsert(upsertData);
        if (error) throw error;
    },

    syncSchedulingSlots: async (profileId: string, items: SchedulingSlot[], clientId?: string) => {
        console.log(`[profilesApi] Syncing slots for ${profileId}...`);
        const activeIds = items.map(i => i.id).filter(id => id && isUUID(id));

        if (activeIds.length > 0) {
            await (supabase.from('scheduling_slots') as any).delete().eq('profile_id', profileId).not('id', 'in', `(${activeIds.join(',')})`);
        } else {
            await (supabase.from('scheduling_slots') as any).delete().eq('profile_id', profileId);
        }

        if (!items || items.length === 0) return;

        const upsertData = items.map((item) => {
            const data: any = {
                profile_id: profileId,
                client_id: clientId || item.clientId,
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
