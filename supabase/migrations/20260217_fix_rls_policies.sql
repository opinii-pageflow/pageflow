-- ============================================
-- FIX DE PERMISSÕES RLS (Leitura de Clients) - VERSÃO CORRIGIDA
-- ============================================

-- 1. Políticas para CLIENT_MEMBERS
DROP POLICY IF EXISTS "Public read access" ON client_members;
DROP POLICY IF EXISTS "Users can view own membership" ON client_members;

CREATE POLICY "Users can view own membership" ON client_members
  FOR SELECT USING (auth.uid() = user_id);

-- 2. Políticas para CLIENTS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view own client" ON clients;
DROP POLICY IF EXISTS "Authenticated can read clients" ON clients;

-- Permitir leitura se o usuário for membro do cliente
CREATE POLICY "Members can view own client" ON clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_members cm
      WHERE cm.client_id = id
      AND cm.user_id = auth.uid()
    )
  );

-- 3. Políticas para PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view client profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Permitir leitura se o usuário for membro do cliente dono do perfil
CREATE POLICY "Members can view client profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_members cm
      WHERE cm.client_id = client_id
      AND cm.user_id = auth.uid()
    )
  );

-- Permitir Public Read para perfis públicos
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (visibility_mode = 'public');

-- 4. Permissões de escrita (Update) para Clients
DROP POLICY IF EXISTS "Owners can update client" ON clients;

CREATE POLICY "Owners can update client" ON clients
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM client_members cm
      WHERE cm.client_id = id
      AND cm.user_id = auth.uid()
      AND cm.role = 'owner'
    )
  );
