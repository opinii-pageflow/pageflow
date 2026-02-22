-- ============================================
-- FIX PROFILES RLS CRUD - LIBERAR CRIAÇÃO E EDIÇÃO
-- ============================================

-- 1. PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view client profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Members can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Members can update profiles" ON profiles;
DROP POLICY IF EXISTS "Members can delete profiles" ON profiles;

-- Leitura: Membros do cliente ou perfil público
CREATE POLICY "Members can view client profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_members cm
      WHERE cm.client_id = profiles.client_id
      AND cm.user_id = auth.uid()
    )
    OR visibility_mode = 'public'
  );

-- Inserção: Membros do cliente
CREATE POLICY "Members can insert profiles" ON profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_members cm
      WHERE cm.client_id = client_id
      AND cm.user_id = auth.uid()
    )
  );

-- Atualização: Membros do cliente
CREATE POLICY "Members can update profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM client_members cm
      WHERE cm.client_id = profiles.client_id
      AND cm.user_id = auth.uid()
    )
  );

-- Deleção: Membros do cliente
CREATE POLICY "Members can delete profiles" ON profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM client_members cm
      WHERE cm.client_id = profiles.client_id
      AND cm.user_id = auth.uid()
    )
  );

-- 2. PROFILE BUTTONS
ALTER TABLE profile_buttons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can manage profile buttons" ON profile_buttons;
DROP POLICY IF EXISTS "Public profile buttons are viewable by everyone" ON profile_buttons;

CREATE POLICY "Members can manage profile buttons" ON profile_buttons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN client_members cm ON cm.client_id = p.client_id
      WHERE p.id = profile_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Public profile buttons are viewable by everyone" ON profile_buttons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_id
      AND p.visibility_mode = 'public'
    )
  );

-- 3. CATALOG ITEMS
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can manage catalog items" ON catalog_items;
DROP POLICY IF EXISTS "Public catalog items are viewable by everyone" ON catalog_items;

CREATE POLICY "Members can manage catalog items" ON catalog_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN client_members cm ON cm.client_id = p.client_id
      WHERE p.id = profile_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Public catalog items are viewable by everyone" ON catalog_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_id
      AND p.visibility_mode = 'public'
    )
  );

-- 4. PORTFOLIO ITEMS
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can manage portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Public portfolio items are viewable by everyone" ON portfolio_items;

CREATE POLICY "Members can manage portfolio items" ON portfolio_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN client_members cm ON cm.client_id = p.client_id
      WHERE p.id = profile_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Public portfolio items are viewable by everyone" ON portfolio_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_id
      AND p.visibility_mode = 'public'
    )
  );

-- 5. YOUTUBE VIDEOS
ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can manage youtube videos" ON youtube_videos;
DROP POLICY IF EXISTS "Public youtube videos are viewable by everyone" ON youtube_videos;

CREATE POLICY "Members can manage youtube videos" ON youtube_videos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN client_members cm ON cm.client_id = p.client_id
      WHERE p.id = profile_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Public youtube videos are viewable by everyone" ON youtube_videos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_id
      AND p.visibility_mode = 'public'
    )
  );

-- 6. SCHEDULING SLOTS
ALTER TABLE scheduling_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can manage scheduling slots" ON scheduling_slots;
DROP POLICY IF EXISTS "Public scheduling slots are viewable" ON scheduling_slots;

CREATE POLICY "Members can manage scheduling slots" ON scheduling_slots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM client_members cm
      WHERE (cm.client_id = client_id OR cm.client_id = (SELECT client_id FROM profiles WHERE id = profile_id))
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Public scheduling slots are viewable" ON scheduling_slots
  FOR SELECT USING (true); -- Geralmente slots são públicos para reserva
