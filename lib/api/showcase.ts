import { supabase } from '../supabase';
import { Showcase, ShowcaseItem, ShowcaseImage, ShowcaseOption, ShowcaseTestimonial } from '../../types';
import { storageApi } from './storage';

const isUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

function mapShowcase(s: any): Showcase {
    return {
        id: s.id,
        profileId: s.profile_id,
        clientId: s.client_id,
        isActive: s.is_active,
        createdAt: s.created_at,
        buttonColor: s.button_color,
        buttonSecondaryColor: s.button_secondary_color,
        buttonGradientEnabled: s.button_gradient_enabled,
        itemTemplate: s.item_template,
        headerButtonIds: s.header_button_ids || [],
        communityClickDestination: s.community_click_destination || 'profile',
        items: (s.items || []).map(mapShowcaseItem)
    };
}

function mapShowcaseItem(i: any): ShowcaseItem {
    return {
        id: i.id,
        showcaseId: i.showcase_id,
        title: i.title,
        description: i.description,
        mainImageUrl: i.main_image_url,
        videoUrl: i.video_url,
        basePrice: Number(i.base_price || 0),
        originalPrice: i.original_price ? Number(i.original_price) : undefined,
        tag: i.tag,
        ctaType: i.cta_type || 'whatsapp',
        ctaValue: i.cta_value,
        sortOrder: i.sort_order || 0,
        isActive: i.is_active !== false,
        kind: i.kind || 'physical',
        createdAt: i.created_at,
        images: (i.images || []).map(mapShowcaseImage),
        options: (i.options || []).map(mapShowcaseOption),
        testimonials: (i.testimonials || []).map(mapShowcaseTestimonial)
    };
}

function mapShowcaseImage(img: any): ShowcaseImage {
    return {
        id: img.id,
        itemId: img.item_id,
        storagePath: img.storage_path,
        sortOrder: img.sort_order || 0
    };
}

function mapShowcaseOption(opt: any): ShowcaseOption {
    return {
        id: opt.id,
        itemId: opt.item_id,
        label: opt.label,
        price: Number(opt.price || 0),
        originalPrice: opt.original_price ? Number(opt.original_price) : undefined,
        link: opt.link,
        sortOrder: opt.sort_order || 0
    };
}

function mapShowcaseTestimonial(t: any): ShowcaseTestimonial {
    return {
        id: t.id,
        itemId: t.item_id,
        name: t.name,
        text: t.text,
        avatarUrl: t.avatar_url,
        imageUrl: t.image_url,
        videoUrl: t.video_url,
        sortOrder: t.sort_order || 0
    };
}

export const showcaseApi = {
    async getByProfileId(profileId: string) {
        const { data, error } = await (supabase.from('showcases') as any)
            .select(`
        *,
        items:showcase_items(
          *,
          images:showcase_images(*),
          options:showcase_options(*),
          testimonials:showcase_testimonials(*)
        )
      `)
            .eq('profile_id', profileId)
            .eq('is_active', true)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data ? mapShowcase(data) : null;
    },

    async getAdminByProfileId(profileId: string) {
        const { data, error } = await (supabase.from('showcases') as any)
            .select(`
        *,
        items:showcase_items(
          *,
          images:showcase_images(*),
          options:showcase_options(*),
          testimonials:showcase_testimonials(*)
        )
      `)
            .eq('profile_id', profileId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data ? mapShowcase(data) : null;
    },

    async ensureShowcase(profileId: string, clientId: string) {
        const { data: existing } = await (supabase.from('showcases') as any)
            .select('id')
            .eq('profile_id', profileId)
            .maybeSingle();

        if (existing) return existing.id;

        const { data, error } = await (supabase.from('showcases') as any)
            .insert({ profile_id: profileId, client_id: clientId })
            .select('id')
            .single();

        if (error) throw error;
        return data.id;
    },

    async saveItem(
        item: Partial<ShowcaseItem>,
        images: Partial<ShowcaseImage>[],
        options: Partial<ShowcaseOption>[],
        testimonials: Partial<ShowcaseTestimonial>[] = []
    ): Promise<{ itemId: string, mainImageUrl?: string, galleryUrls: string[] }> {
        if (!item.showcaseId) throw new Error('showcaseId is required');

        const dbItem: any = {
            showcase_id: item.showcaseId,
            title: item.title,
            description: item.description,
            video_url: item.videoUrl,
            base_price: item.basePrice,
            original_price: item.originalPrice,
            tag: item.tag,
            cta_type: item.ctaType,
            cta_value: item.ctaValue,
            sort_order: item.sortOrder,
            is_active: item.isActive !== false,
            kind: item.kind || 'physical'
        };

        // Handle Main Image Upload
        if (item.mainImageUrl && item.mainImageUrl.startsWith('data:')) {
            try {
                dbItem.main_image_url = await storageApi.uploadImage(`showcase/main_${item.showcaseId}_${Date.now()}.jpg`, item.mainImageUrl);
            } catch (err) {
                console.warn("[showcaseApi] Failed to upload main image:", err);
                dbItem.main_image_url = item.mainImageUrl;
            }
        } else {
            dbItem.main_image_url = item.mainImageUrl;
        }

        let itemId = item.id;

        if (!itemId || !isUUID(itemId)) {
            const { data, error } = await (supabase.from('showcase_items') as any)
                .insert(dbItem)
                .select('id')
                .single();
            if (error) throw error;
            itemId = data.id;
        } else {
            const { error } = await (supabase.from('showcase_items') as any)
                .update(dbItem)
                .eq('id', itemId);
            if (error) throw error;
        }

        // --- ATOMIC SYNC: Options ---
        const { data: existingOptions } = await (supabase.from('showcase_options') as any).select('id').eq('item_id', itemId);
        const existingOptionIds = new Set(existingOptions?.map((o: any) => o.id) || []);

        if (options.length > 0) {
            for (const o of options) {
                const dbOpt = {
                    item_id: itemId,
                    label: o.label,
                    price: o.price,
                    original_price: o.originalPrice,
                    link: o.link,
                    sort_order: o.sortOrder || 0
                };
                if (o.id && existingOptionIds.has(o.id) && isUUID(o.id)) {
                    await (supabase.from('showcase_options') as any).update(dbOpt).eq('id', o.id);
                    existingOptionIds.delete(o.id);
                } else {
                    await (supabase.from('showcase_options') as any).insert(dbOpt);
                }
            }
        }
        if (existingOptionIds.size > 0) {
            await (supabase.from('showcase_options') as any).delete().in('id', Array.from(existingOptionIds));
        }

        // --- ATOMIC SYNC: Images ---
        let finalGalleryUrls: string[] = [];
        const { data: existingImages } = await (supabase.from('showcase_images') as any).select('id, storage_path').eq('item_id', itemId);
        const existingImageIds = new Set(existingImages?.map((i: any) => i.id) || []);

        if (images.length > 0) {
            for (let idx = 0; idx < images.length; idx++) {
                const img = images[idx];
                let storagePath = img.storagePath;
                if (storagePath && storagePath.startsWith('data:')) {
                    try {
                        storagePath = await storageApi.uploadImage(`showcase/gallery_${itemId}_${idx}_${Date.now()}.jpg`, storagePath);
                    } catch (err) {
                        console.warn("[showcaseApi] Failed to upload gallery image:", err);
                    }
                }

                const dbImg = {
                    item_id: itemId,
                    storage_path: storagePath,
                    sort_order: img.sortOrder || idx
                };

                if (img.id && existingImageIds.has(img.id) && isUUID(img.id)) {
                    await (supabase.from('showcase_images') as any).update(dbImg).eq('id', img.id);
                    existingImageIds.delete(img.id);
                } else {
                    await (supabase.from('showcase_images') as any).insert(dbImg);
                }
                if (storagePath) finalGalleryUrls.push(storagePath);
            }
        }
        if (existingImageIds.size > 0) {
            await (supabase.from('showcase_images') as any).delete().in('id', Array.from(existingImageIds));
        }

        // --- ATOMIC SYNC: Testimonials ---
        const { data: existingTestimonials } = await (supabase.from('showcase_testimonials') as any).select('id').eq('item_id', itemId);
        const existingTestimonialIds = new Set(existingTestimonials?.map((t: any) => t.id) || []);

        if (testimonials && testimonials.length > 0) {
            for (let idx = 0; idx < testimonials.length; idx++) {
                const t = testimonials[idx];
                const dbTestimonial = {
                    item_id: itemId,
                    name: t.name,
                    text: t.text,
                    avatar_url: t.avatarUrl,
                    image_url: t.imageUrl,
                    video_url: t.videoUrl,
                    sort_order: t.sortOrder || idx
                };
                if (t.id && existingTestimonialIds.has(t.id) && isUUID(t.id)) {
                    await (supabase.from('showcase_testimonials') as any).update(dbTestimonial).eq('id', t.id);
                    existingTestimonialIds.delete(t.id);
                } else {
                    await (supabase.from('showcase_testimonials') as any).insert(dbTestimonial);
                }
            }
        }
        if (existingTestimonialIds.size > 0) {
            await (supabase.from('showcase_testimonials') as any).delete().in('id', Array.from(existingTestimonialIds));
        }

        return {
            itemId,
            mainImageUrl: dbItem.main_image_url,
            galleryUrls: finalGalleryUrls
        };
    },

    async deleteItem(itemId: string) {
        const { error } = await (supabase.from('showcase_items') as any)
            .delete()
            .eq('id', itemId);
        if (error) throw error;
    },

    async saveSettings(showcaseId: string, updates: Partial<Showcase>) {
        const dbUpdates: any = {};
        if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
        if (updates.buttonColor !== undefined) dbUpdates.button_color = updates.buttonColor;
        if (updates.buttonSecondaryColor !== undefined) dbUpdates.button_secondary_color = updates.buttonSecondaryColor;
        if (updates.buttonGradientEnabled !== undefined) dbUpdates.button_gradient_enabled = updates.buttonGradientEnabled;
        if (updates.itemTemplate !== undefined) dbUpdates.item_template = updates.itemTemplate;
        if (updates.headerButtonIds !== undefined) dbUpdates.header_button_ids = updates.headerButtonIds;
        if (updates.communityClickDestination !== undefined) dbUpdates.community_click_destination = updates.communityClickDestination;

        const { error } = await (supabase.from('showcases') as any)
            .update(dbUpdates)
            .eq('id', showcaseId);
        if (error) throw error;
    },

    async updateItemOrder(itemOrders: { id: string, sortOrder: number }[]) {
        await Promise.all(itemOrders.map(order =>
            (supabase.from('showcase_items') as any).update({ sort_order: order.sortOrder }).eq('id', order.id)
        ));
    },

    async countActiveShowcases(clientId: string): Promise<number> {
        const { count, error } = await (supabase.from('showcases') as any)
            .select('*', { count: 'exact', head: true })
            .eq('client_id', clientId)
            .eq('is_active', true);

        if (error) {
            console.warn("[showcaseApi] Error counting active showcases:", error);
            return 0;
        }
        return count || 0;
    }
};