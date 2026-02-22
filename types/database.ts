// ============================================
// SUPABASE DATABASE TYPES
// Auto-generated from schema
// ============================================

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            clients: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    email: string | null
                    user_type: 'admin' | 'client' | null
                    plan: 'starter' | 'pro' | 'business' | 'enterprise'
                    max_profiles: number
                    max_templates: number | null
                    is_active: boolean
                    scheduling_scope: 'global' | 'per_profile' | null
                    enable_scheduling: boolean | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    email?: string | null
                    user_type?: 'admin' | 'client' | null
                    plan?: 'starter' | 'pro' | 'business' | 'enterprise'
                    max_profiles?: number
                    max_templates?: number | null
                    is_active?: boolean
                    scheduling_scope?: 'global' | 'per_profile' | null
                    enable_scheduling?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    email?: string | null
                    user_type?: 'admin' | 'client' | null
                    plan?: 'starter' | 'pro' | 'business' | 'enterprise'
                    max_profiles?: number
                    max_templates?: number | null
                    is_active?: boolean
                    scheduling_scope?: 'global' | 'per_profile' | null
                    enable_scheduling?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
            }
            client_members: {
                Row: {
                    id: string
                    client_id: string
                    user_id: string
                    role: string
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    client_id: string
                    user_id: string
                    role?: string
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    client_id?: string
                    user_id?: string
                    role?: string
                    is_active?: boolean
                    created_at?: string
                }
            }
            profiles: {
                Row: {
                    id: string
                    client_id: string
                    slug: string
                    profile_type: 'personal' | 'business'
                    display_name: string
                    headline: string | null
                    bio_short: string | null
                    bio_long: string | null
                    avatar_url: string | null
                    cover_url: string | null
                    layout_template: string
                    visibility_mode: 'public' | 'private' | 'password'
                    password: string | null
                    theme: Json
                    fonts: Json
                    pix_key: string | null
                    enable_lead_capture: boolean | null
                    enable_nps: boolean | null
                    nps_redirect_url: string | null
                    hide_branding: boolean | null
                    enable_scheduling: boolean | null
                    scheduling_mode: 'external' | 'native' | null
                    external_booking_url: string | null
                    booking_whatsapp: string | null
                    show_in_community: boolean | null
                    community_segment: string | null
                    community_city: string | null
                    community_service_mode: 'online' | 'presencial' | 'hibrido' | null
                    community_punchline: string | null
                    community_primary_cta: 'whatsapp' | 'instagram' | 'site' | null
                    community_gmb_link: string | null
                    sponsored_enabled: boolean | null
                    sponsored_until: string | null
                    sponsored_segment: string | null
                    module_themes: Json | null
                    general_module_theme: Json | null
                    email: string | null
                    role: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    client_id: string
                    slug: string
                    profile_type: 'personal' | 'business'
                    display_name: string
                    headline?: string | null
                    bio_short?: string | null
                    bio_long?: string | null
                    avatar_url?: string | null
                    cover_url?: string | null
                    layout_template: string
                    visibility_mode: 'public' | 'private' | 'password'
                    password?: string | null
                    theme?: Json
                    fonts?: Json
                    pix_key?: string | null
                    enable_lead_capture?: boolean | null
                    enable_nps?: boolean | null
                    nps_redirect_url?: string | null
                    hide_branding?: boolean | null
                    enable_scheduling?: boolean | null
                    scheduling_mode?: 'external' | 'native' | null
                    external_booking_url?: string | null
                    booking_whatsapp?: string | null
                    show_in_community?: boolean | null
                    community_segment?: string | null
                    community_city?: string | null
                    community_service_mode?: 'online' | 'presencial' | 'hibrido' | null
                    community_punchline?: string | null
                    community_primary_cta?: 'whatsapp' | 'instagram' | 'site' | null
                    community_gmb_link?: string | null
                    sponsored_enabled?: boolean | null
                    sponsored_until?: string | null
                    sponsored_segment?: string | null
                    module_themes?: Json | null
                    general_module_theme?: Json | null
                    email?: string | null
                    role?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    client_id?: string
                    slug?: string
                    profile_type?: 'personal' | 'business'
                    display_name?: string
                    headline?: string | null
                    bio_short?: string | null
                    bio_long?: string | null
                    avatar_url?: string | null
                    cover_url?: string | null
                    layout_template?: string
                    visibility_mode?: 'public' | 'private' | 'password'
                    password?: string | null
                    theme?: Json
                    fonts?: Json
                    pix_key?: string | null
                    enable_lead_capture?: boolean | null
                    enable_nps?: boolean | null
                    nps_redirect_url?: string | null
                    hide_branding?: boolean | null
                    enable_scheduling?: boolean | null
                    scheduling_mode?: 'external' | 'native' | null
                    external_booking_url?: string | null
                    booking_whatsapp?: string | null
                    show_in_community?: boolean | null
                    community_segment?: string | null
                    community_city?: string | null
                    community_service_mode?: 'online' | 'presencial' | 'hibrido' | null
                    community_punchline?: string | null
                    community_primary_cta?: 'whatsapp' | 'instagram' | 'site' | null
                    community_gmb_link?: string | null
                    sponsored_enabled?: boolean | null
                    sponsored_until?: string | null
                    sponsored_segment?: string | null
                    module_themes?: Json | null
                    general_module_theme?: Json | null
                    email?: string | null
                    role?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            profile_buttons: {
                Row: {
                    id: string
                    profile_id: string
                    client_id: string | null
                    type: string
                    label: string
                    value: string
                    enabled: boolean
                    visibility: 'public' | 'private'
                    pinned: boolean
                    sort_order: number
                    style: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    profile_id: string
                    client_id?: string | null
                    type: string
                    label: string
                    value: string
                    enabled?: boolean
                    visibility: 'public' | 'private'
                    pinned?: boolean
                    sort_order?: number
                    style?: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    profile_id?: string
                    client_id?: string | null
                    type?: string
                    label?: string
                    value?: string
                    enabled?: boolean
                    visibility?: 'public' | 'private'
                    pinned?: boolean
                    sort_order?: number
                    style?: Json
                    created_at?: string
                }
            }
            catalog_items: {
                Row: {
                    id: string
                    profile_id: string
                    client_id: string | null
                    kind: 'product' | 'service'
                    title: string
                    description: string | null
                    price_text: string | null
                    image_url: string | null
                    cta_label: string | null
                    cta_link: string | null
                    sort_order: number
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    profile_id: string
                    client_id?: string | null
                    kind: 'product' | 'service'
                    title: string
                    description?: string | null
                    price_text?: string | null
                    image_url?: string | null
                    cta_label?: string | null
                    cta_link?: string | null
                    sort_order?: number
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    profile_id?: string
                    client_id?: string | null
                    kind?: 'product' | 'service'
                    title?: string
                    description?: string | null
                    price_text?: string | null
                    image_url?: string | null
                    cta_label?: string | null
                    cta_link?: string | null
                    sort_order?: number
                    is_active?: boolean
                    created_at?: string
                }
            }
            portfolio_items: {
                Row: {
                    id: string
                    profile_id: string
                    client_id: string | null
                    title: string | null
                    image_url: string
                    sort_order: number
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    profile_id: string
                    client_id?: string | null
                    title?: string | null
                    image_url: string
                    sort_order?: number
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    profile_id?: string
                    client_id?: string | null
                    title?: string | null
                    image_url?: string
                    sort_order?: number
                    is_active?: boolean
                    created_at?: string
                }
            }
            youtube_videos: {
                Row: {
                    id: string
                    profile_id: string
                    client_id: string | null
                    title: string | null
                    url: string
                    sort_order: number
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    profile_id: string
                    client_id?: string | null
                    title?: string | null
                    url: string
                    sort_order?: number
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    profile_id?: string
                    client_id?: string | null
                    title?: string | null
                    url?: string
                    sort_order?: number
                    is_active?: boolean
                    created_at?: string
                }
            }
            scheduling_slots: {
                Row: {
                    id: string
                    client_id: string | null
                    profile_id: string | null
                    day_of_week: number
                    start_time: string
                    end_time: string
                    is_active: boolean
                    status: 'available' | 'pending' | 'booked'
                    booked_by: string | null
                    booked_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    client_id?: string | null
                    profile_id?: string | null
                    day_of_week: number
                    start_time: string
                    end_time: string
                    is_active?: boolean
                    status?: 'available' | 'pending' | 'booked'
                    booked_by?: string | null
                    booked_at?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    client_id?: string | null
                    profile_id?: string | null
                    day_of_week?: number
                    start_time?: string
                    end_time?: string
                    is_active?: boolean
                    status?: 'available' | 'pending' | 'booked'
                    booked_by?: string | null
                    booked_at?: string | null
                    created_at?: string
                }
            }
            analytics_events: {
                Row: {
                    id: string
                    client_id: string
                    profile_id: string
                    type: string
                    asset_type: 'button' | 'portfolio' | 'catalog' | 'video' | 'pix' | 'nps' | 'unknown' | null
                    asset_id: string | null
                    asset_label: string | null
                    asset_url: string | null
                    source: string
                    utm_source: string | null
                    utm_medium: string | null
                    utm_campaign: string | null
                    utm_content: string | null
                    utm_term: string | null
                    referrer: string | null
                    landing_path: string | null
                    device: 'mobile' | 'desktop' | 'tablet' | null
                    score: number | null
                    comment: string | null
                    ts: string
                    link_id: string | null
                    category: string | null
                }
                Insert: {
                    id?: string
                    client_id: string
                    profile_id: string
                    type: string
                    asset_type?: 'button' | 'portfolio' | 'catalog' | 'video' | 'pix' | 'nps' | 'unknown' | null
                    asset_id?: string | null
                    asset_label?: string | null
                    asset_url?: string | null
                    source?: string
                    utm_source?: string | null
                    utm_medium?: string | null
                    utm_campaign?: string | null
                    utm_content?: string | null
                    utm_term?: string | null
                    referrer?: string | null
                    landing_path?: string | null
                    device?: 'mobile' | 'desktop' | 'tablet' | null
                    score?: number | null
                    comment?: string | null
                    ts?: string
                    link_id?: string | null
                    category?: string | null
                }
                Update: {
                    id?: string
                    client_id?: string
                    profile_id?: string
                    type?: string
                    asset_type?: 'button' | 'portfolio' | 'catalog' | 'video' | 'pix' | 'nps' | 'unknown' | null
                    asset_id?: string | null
                    asset_label?: string | null
                    asset_url?: string | null
                    source?: string
                    utm_source?: string | null
                    utm_medium?: string | null
                    utm_campaign?: string | null
                    utm_content?: string | null
                    utm_term?: string | null
                    referrer?: string | null
                    landing_path?: string | null
                    device?: 'mobile' | 'desktop' | 'tablet' | null
                    score?: number | null
                    comment?: string | null
                    ts?: string
                    link_id?: string | null
                    category?: string | null
                }
            }
            leads: {
                Row: {
                    id: string
                    client_id: string
                    profile_id: string
                    name: string
                    contact: string
                    phone: string | null
                    email: string | null
                    message: string | null
                    status: 'novo' | 'contatado' | 'negociando' | 'fechado' | 'perdido' | 'respondido' | 'arquivado'
                    notes: string | null
                    history: Json
                    source: string
                    capture_type: 'form' | 'nps' | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    client_id: string
                    profile_id: string
                    name: string
                    contact: string
                    phone?: string | null
                    email?: string | null
                    message?: string | null
                    status?: 'novo' | 'contatado' | 'negociando' | 'fechado' | 'perdido' | 'respondido' | 'arquivado'
                    notes?: string | null
                    history?: Json
                    source?: string
                    capture_type?: 'form' | 'nps' | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    client_id?: string
                    profile_id?: string
                    name?: string
                    contact?: string
                    phone?: string | null
                    email?: string | null
                    message?: string | null
                    status?: 'novo' | 'contatado' | 'negociando' | 'fechado' | 'perdido' | 'respondido' | 'arquivado'
                    notes?: string | null
                    history?: Json
                    source?: string
                    capture_type?: 'form' | 'nps' | null
                    created_at?: string
                }
            }
            nps_entries: {
                Row: {
                    id: string
                    client_id: string
                    profile_id: string
                    score: number
                    comment: string | null
                    source: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    client_id: string
                    profile_id: string
                    score: number
                    comment?: string | null
                    source?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    client_id?: string
                    profile_id?: string
                    score?: number
                    comment?: string | null
                    source?: string
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
