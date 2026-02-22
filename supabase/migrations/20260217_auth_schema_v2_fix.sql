-- ============================================
-- AUTH SCHEMA CORRIGIDO (Usando tabela CLIENTS existente)
-- Substitui a abordagem anterior de criar tabelas 'companies'
-- ============================================

-- 1. Limpeza (caso tenha rodado o script anterior)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS company_members;
DROP TABLE IF EXISTS companies;

-- 2. Tabela Client Members (Vínculo Usuário -> Cliente)
-- A tabela 'clients' JÁ EXISTE no schema inicial.
CREATE TABLE IF NOT EXISTS client_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- Referência ao auth.users
  role TEXT NOT NULL DEFAULT 'owner',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, user_id)
);

-- 3. RLS para Client Members
ALTER TABLE client_members ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública (necessário para login/identificação)
CREATE POLICY "Public read access" ON client_members FOR SELECT USING (true);


-- 4. Trigger Automático: Cria Cliente e Membro ao Criar Usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_client_id UUID;
  client_name TEXT;
  client_slug TEXT;
  base_slug TEXT;
  slug_suffix INT;
BEGIN
  -- Obter nome da empresa dos metadados ou usar fallback
  client_name := COALESCE(new.raw_user_meta_data->>'company_name', new.raw_user_meta_data->>'name', 'Minha Empresa');
  
  -- Gerar slug base
  base_slug := lower(regexp_replace(client_name, '[^a-zA-Z0-9]+', '-', 'g'));
  -- Garantir que slug não comece/termine com hifen
  base_slug := trim(both '-' from base_slug);
  
  -- Se slug ficar vazio, usar padrão
  IF length(base_slug) < 2 THEN
    base_slug := 'empresa-' || substr(md5(random()::text), 1, 4);
  END IF;

  client_slug := base_slug;

  -- 1. Tentar criar o Client (loop simples para evitar colisão de slug)
  BEGIN
    INSERT INTO public.clients (name, slug, email, plan, max_profiles)
    VALUES (client_name, client_slug, new.email, 'starter', 3)
    RETURNING id INTO new_client_id;
  EXCEPTION WHEN unique_violation THEN
    -- Se der conflito, tenta com sufixo aleatório
    client_slug := base_slug || '-' || substr(md5(random()::text), 1, 4);
    INSERT INTO public.clients (name, slug, email, plan, max_profiles)
    VALUES (client_name, client_slug, new.email, 'starter', 3)
    RETURNING id INTO new_client_id;
  END;

  -- 2. Criar o Member (Owner)
  INSERT INTO public.client_members (client_id, user_id, role)
  VALUES (new_client_id, new.id, 'owner');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Ativar o Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- FIM
-- Copie tudo e rode no SQL Editor do Supabase para corrigir a estrutura
-- ============================================
