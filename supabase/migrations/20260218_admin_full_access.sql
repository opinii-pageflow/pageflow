-- ============================================
-- ADMIN FULL ACCESS & PERFORMANCE & TENANT FIXES
-- Aplicada em 2026-02-18
-- ============================================

-- 1. Definir israel.souza25@outlook.com.br como admin
UPDATE public.clients 
SET user_type = 'admin'
WHERE email = 'israel.souza25@outlook.com.br';

-- 2. Garantir que Admins tenham plano Enterprise
UPDATE public.clients
SET plan = 'enterprise'
WHERE user_type = 'admin';

-- 3. Função SECURITY DEFINER para verificar admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clients c
    JOIN public.client_members cm ON cm.client_id = c.id
    WHERE cm.user_id = auth.uid()
    AND c.user_type = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 4. OTIMIZAÇÃO DE PERFORMANCE (TIMEOUT FIX)
CREATE INDEX IF NOT EXISTS idx_client_members_user_id ON public.client_members(user_id);

DROP POLICY IF EXISTS "Users can read own client membership" ON client_members;
CREATE POLICY "Users can read own client membership" ON client_members 
  FOR SELECT USING (user_id = auth.uid());

-- 5. Policies de Admin na tabela CLIENTS
DROP POLICY IF EXISTS "Admins can view all clients" ON clients;
CREATE POLICY "Admins can view all clients" ON clients FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all clients" ON clients;
CREATE POLICY "Admins can update all clients" ON clients FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert clients" ON clients;
CREATE POLICY "Admins can insert clients" ON clients FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete clients" ON clients;
CREATE POLICY "Admins can delete clients" ON clients FOR DELETE USING (public.is_admin());

-- 6. CORREÇÃO TENANT ISOLATION (TABELAS FILHAS)
-- Permite que Admins editem dados de outros clientes nas tabelas de itens

-- Helper function para tenant check (opcional, inline na policy é mais seguro)
-- Usamos subquery direta para evitar dependência de claims

-- Catalog Items
DROP POLICY IF EXISTS "tenant_isolation" ON catalog_items;
CREATE POLICY "tenant_isolation" ON catalog_items 
  AS PERMISSIVE FOR ALL 
  USING (client_id = (SELECT client_id FROM client_members WHERE user_id = auth.uid() LIMIT 1) OR public.is_admin()) 
  WITH CHECK (client_id = (SELECT client_id FROM client_members WHERE user_id = auth.uid() LIMIT 1) OR public.is_admin());

-- Portfolio Items
DROP POLICY IF EXISTS "tenant_isolation" ON portfolio_items;
CREATE POLICY "tenant_isolation" ON portfolio_items 
  AS PERMISSIVE FOR ALL 
  USING (client_id = (SELECT client_id FROM client_members WHERE user_id = auth.uid() LIMIT 1) OR public.is_admin()) 
  WITH CHECK (client_id = (SELECT client_id FROM client_members WHERE user_id = auth.uid() LIMIT 1) OR public.is_admin());

-- Youtube Videos
DROP POLICY IF EXISTS "tenant_isolation" ON youtube_videos;
CREATE POLICY "tenant_isolation" ON youtube_videos 
  AS PERMISSIVE FOR ALL 
  USING (client_id = (SELECT client_id FROM client_members WHERE user_id = auth.uid() LIMIT 1) OR public.is_admin()) 
  WITH CHECK (client_id = (SELECT client_id FROM client_members WHERE user_id = auth.uid() LIMIT 1) OR public.is_admin());

-- Scheduling Slots
DROP POLICY IF EXISTS "tenant_isolation" ON scheduling_slots;
CREATE POLICY "tenant_isolation" ON scheduling_slots 
  AS PERMISSIVE FOR ALL 
  USING (client_id = (SELECT client_id FROM client_members WHERE user_id = auth.uid() LIMIT 1) OR public.is_admin()) 
  WITH CHECK (client_id = (SELECT client_id FROM client_members WHERE user_id = auth.uid() LIMIT 1) OR public.is_admin());

-- Profile Buttons
DROP POLICY IF EXISTS "tenant_isolation" ON profile_buttons;
CREATE POLICY "tenant_isolation" ON profile_buttons 
  AS PERMISSIVE FOR ALL 
  USING (client_id = (SELECT client_id FROM client_members WHERE user_id = auth.uid() LIMIT 1) OR public.is_admin()) 
  WITH CHECK (client_id = (SELECT client_id FROM client_members WHERE user_id = auth.uid() LIMIT 1) OR public.is_admin());
