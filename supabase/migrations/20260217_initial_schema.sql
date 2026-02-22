-- ============================================
-- PAGEFLOW - INITIAL DATABASE SCHEMA
-- Migration: 20260217_initial_schema
-- ============================================

-- ============================================
-- CLIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'pro', 'business', 'enterprise')),
  max_profiles INTEGER NOT NULL DEFAULT 1,
  max_templates INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  scheduling_scope TEXT CHECK (scheduling_scope IN ('global', 'per_profile')),
  enable_scheduling BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_slug ON clients(slug);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_is_active ON clients(is_active) WHERE is_active = true;

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  profile_type TEXT NOT NULL CHECK (profile_type IN ('personal', 'business')),
  display_name TEXT NOT NULL,
  headline TEXT,
  bio_short TEXT,
  bio_long TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  layout_template TEXT NOT NULL,
  visibility_mode TEXT NOT NULL CHECK (visibility_mode IN ('public', 'private', 'password')),
  password TEXT,
  
  -- Theme (JSONB)
  theme JSONB NOT NULL DEFAULT '{}',
  
  -- Fonts (JSONB)
  fonts JSONB NOT NULL DEFAULT '{}',
  
  -- Pro Features
  pix_key TEXT,
  enable_lead_capture BOOLEAN DEFAULT false,
  enable_nps BOOLEAN DEFAULT false,
  nps_redirect_url TEXT,
  hide_branding BOOLEAN DEFAULT false,
  
  -- Scheduling
  enable_scheduling BOOLEAN DEFAULT false,
  scheduling_mode TEXT CHECK (scheduling_mode IN ('external', 'native')),
  external_booking_url TEXT,
  booking_whatsapp TEXT,
  
  -- Community
  show_in_community BOOLEAN DEFAULT false,
  community_segment TEXT,
  community_city TEXT,
  community_service_mode TEXT CHECK (community_service_mode IN ('online', 'presencial', 'hibrido')),
  community_punchline TEXT,
  community_primary_cta TEXT CHECK (community_primary_cta IN ('whatsapp', 'instagram', 'site')),
  community_gmb_link TEXT,
  
  -- Sponsorship
  sponsored_enabled BOOLEAN DEFAULT false,
  sponsored_until TIMESTAMPTZ,
  sponsored_segment TEXT,
  
  -- Module Themes (JSONB)
  module_themes JSONB DEFAULT '{}',
  general_module_theme JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(client_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_profiles_client_id ON profiles(client_id);
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON profiles(slug);
CREATE INDEX IF NOT EXISTS idx_profiles_show_in_community ON profiles(show_in_community) WHERE show_in_community = true;
CREATE INDEX IF NOT EXISTS idx_profiles_visibility_mode ON profiles(visibility_mode);

-- ============================================
-- PROFILE BUTTONS
-- ============================================
CREATE TABLE IF NOT EXISTS profile_buttons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'private')),
  pinned BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_buttons_profile_id ON profile_buttons(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_buttons_enabled ON profile_buttons(enabled) WHERE enabled = true;

-- ============================================
-- ANALYTICS EVENTS
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  
  -- Asset Information (Normalized)
  asset_type TEXT CHECK (asset_type IN ('button', 'portfolio', 'catalog', 'video', 'pix', 'nps', 'unknown')),
  asset_id UUID,
  asset_label TEXT,
  asset_url TEXT,
  
  -- Session Information
  source TEXT NOT NULL DEFAULT 'direct',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  referrer TEXT,
  landing_path TEXT,
  device TEXT CHECK (device IN ('mobile', 'desktop', 'tablet')),
  
  -- NPS Specific
  score INTEGER CHECK (score BETWEEN 0 AND 10),
  comment TEXT,
  
  -- Timestamp
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Legacy fields (deprecated, mantidos para compatibilidade)
  link_id UUID,
  category TEXT
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_client_id ON analytics_events(client_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_profile_id ON analytics_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_ts ON analytics_events(ts DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_asset_type ON analytics_events(asset_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_source ON analytics_events(source);

-- ============================================
-- LEADS
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'contatado', 'negociando', 'fechado', 'perdido', 'respondido', 'arquivado')),
  notes TEXT,
  history JSONB DEFAULT '[]',
  source TEXT NOT NULL DEFAULT 'direct',
  capture_type TEXT CHECK (capture_type IN ('form', 'nps')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_client_id ON leads(client_id);
CREATE INDEX IF NOT EXISTS idx_leads_profile_id ON leads(profile_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- ============================================
-- NPS ENTRIES
-- ============================================
CREATE TABLE IF NOT EXISTS nps_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 10),
  comment TEXT,
  source TEXT NOT NULL DEFAULT 'direct',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nps_entries_client_id ON nps_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_nps_entries_profile_id ON nps_entries(profile_id);
CREATE INDEX IF NOT EXISTS idx_nps_entries_created_at ON nps_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nps_entries_score ON nps_entries(score);

-- ============================================
-- CATALOG ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('product', 'service')),
  title TEXT NOT NULL,
  description TEXT,
  price_text TEXT,
  image_url TEXT,
  cta_label TEXT,
  cta_link TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catalog_items_profile_id ON catalog_items(profile_id);
CREATE INDEX IF NOT EXISTS idx_catalog_items_is_active ON catalog_items(is_active) WHERE is_active = true;

-- ============================================
-- PORTFOLIO ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_items_profile_id ON portfolio_items(profile_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_is_active ON portfolio_items(is_active) WHERE is_active = true;

-- ============================================
-- YOUTUBE VIDEOS
-- ============================================
CREATE TABLE IF NOT EXISTS youtube_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_youtube_videos_profile_id ON youtube_videos(profile_id);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_is_active ON youtube_videos(is_active) WHERE is_active = true;

-- ============================================
-- SCHEDULING SLOTS
-- ============================================
CREATE TABLE IF NOT EXISTS scheduling_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'pending', 'booked')),
  booked_by TEXT,
  booked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CHECK (
    (client_id IS NOT NULL AND profile_id IS NULL) OR
    (client_id IS NULL AND profile_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_scheduling_slots_client_id ON scheduling_slots(client_id);
CREATE INDEX IF NOT EXISTS idx_scheduling_slots_profile_id ON scheduling_slots(profile_id);
CREATE INDEX IF NOT EXISTS idx_scheduling_slots_status ON scheduling_slots(status);

-- ============================================
-- TRIGGERS - Updated At
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for clients
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_buttons ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_slots ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - PUBLIC ACCESS
-- ============================================

-- Profiles: Public read for public profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (visibility_mode = 'public');

-- Profile Buttons: Public read for enabled buttons on public profiles
CREATE POLICY "Public profile buttons are viewable by everyone"
  ON profile_buttons FOR SELECT
  USING (
    enabled = true AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_buttons.profile_id
      AND profiles.visibility_mode = 'public'
    )
  );

-- Catalog Items: Public read for active items on public profiles
CREATE POLICY "Public catalog items are viewable by everyone"
  ON catalog_items FOR SELECT
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = catalog_items.profile_id
      AND profiles.visibility_mode = 'public'
    )
  );

-- Portfolio Items: Public read for active items on public profiles
CREATE POLICY "Public portfolio items are viewable by everyone"
  ON portfolio_items FOR SELECT
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = portfolio_items.profile_id
      AND profiles.visibility_mode = 'public'
    )
  );

-- YouTube Videos: Public read for active videos on public profiles
CREATE POLICY "Public youtube videos are viewable by everyone"
  ON youtube_videos FOR SELECT
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = youtube_videos.profile_id
      AND profiles.visibility_mode = 'public'
    )
  );

-- Analytics Events: Allow anonymous insert (for tracking)
CREATE POLICY "Anyone can insert analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

-- Leads: Allow anonymous insert (for lead capture)
CREATE POLICY "Anyone can insert leads"
  ON leads FOR INSERT
  WITH CHECK (true);

-- NPS Entries: Allow anonymous insert (for NPS)
CREATE POLICY "Anyone can insert NPS entries"
  ON nps_entries FOR INSERT
  WITH CHECK (true);

-- ============================================
-- RLS POLICIES - AUTHENTICATED ACCESS
-- (Policies específicas de auth serão adicionadas na Fase 2)
-- ============================================

-- Placeholder: Authenticated users can read their own data
-- TODO: Implementar após configurar Supabase Auth

-- ============================================
-- INITIAL DATA (Optional - Demo Client)
-- ============================================

-- Insert demo client (apenas se não existir)
INSERT INTO clients (id, name, slug, email, plan, max_profiles, is_active, created_at)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Israel Demo',
  'israel',
  'israel.cruzeiro@gmail.com',
  'enterprise',
  3,
  true,
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE clients IS 'Tabela de clientes (contas) do sistema';
COMMENT ON TABLE profiles IS 'Perfis de usuários (cada cliente pode ter múltiplos perfis)';
COMMENT ON TABLE analytics_events IS 'Eventos de analytics (views, clicks, etc)';
COMMENT ON TABLE leads IS 'Leads capturados através dos perfis';
COMMENT ON TABLE nps_entries IS 'Respostas de NPS (Net Promoter Score)';

COMMENT ON COLUMN analytics_events.asset_type IS 'Tipo normalizado do asset (button, portfolio, catalog, video, pix, nps, unknown)';
COMMENT ON COLUMN analytics_events.asset_id IS 'ID do asset (button_id, portfolio_item_id, etc)';
COMMENT ON COLUMN analytics_events.asset_label IS 'Label do asset (nome do botão, título do produto, etc)';
