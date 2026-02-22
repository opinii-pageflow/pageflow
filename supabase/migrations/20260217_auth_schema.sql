-- ============================================
-- AUTH SCHEMA (Companies & Members)
-- Necessário para o sistema de cadastro funcionar
-- ============================================

-- 1. Tabela Companies (Empresas/Clientes)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'starter',
  max_profiles INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabela Company Members (Vínculo Usuário -> Empresa)
CREATE TABLE IF NOT EXISTS company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- Referência ao auth.users
  role TEXT NOT NULL DEFAULT 'owner',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

-- 3. RLS Policies (Segurança)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública de companies (necessário para login/cadastro inicial em alguns fluxos)
CREATE POLICY "Enable read access for all users" ON companies FOR SELECT USING (true);

-- Permitir leitura de membros (necessário para identificar empresa do usuário)
CREATE POLICY "Enable read access for all users" ON company_members FOR SELECT USING (true);


-- 4. Trigger Automático: Cria Empresa ao Criar Usuário
-- Esta função é executada automaticamente quando um usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_company_id UUID;
  company_name TEXT;
  company_slug TEXT;
BEGIN
  -- Obter nome da empresa dos metadados ou usar fallback
  company_name := new.raw_user_meta_data->>'company_name';
  IF company_name IS NULL OR company_name = '' THEN
    company_name := new.raw_user_meta_data->>'name';
  END IF;
  
  IF company_name IS NULL OR company_name = '' THEN
    company_name := 'Minha Empresa';
  END IF;

  -- Gerar slug único
  company_slug := lower(regexp_replace(company_name, '[^a-zA-Z0-9]+', '-', 'g'));
  -- Adicionar sufixo aleatório para garantir unicidade
  company_slug := company_slug || '-' || substr(md5(random()::text), 1, 4);

  -- 1. Criar a Company
  INSERT INTO public.companies (name, slug, plan, max_profiles)
  VALUES (company_name, company_slug, 'starter', 3)
  RETURNING id INTO new_company_id;

  -- 2. Criar o Member (Owner)
  INSERT INTO public.company_members (company_id, user_id, role)
  VALUES (new_company_id, new.id, 'owner');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Ativar o Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- FIM
-- Copie tudo e rode no SQL Editor do Supabase
-- ============================================
