-- ============================================
-- RESET COMPLETO DE DADOS & PREPARAÇÃO PARA ADMIN
-- ============================================

-- 1. Limpar dados de negócio (Cascata vai limpar filhos)
TRUNCATE TABLE client_members CASCADE;
TRUNCATE TABLE clients CASCADE;
TRUNCATE TABLE profiles CASCADE;

-- 2. Tentar remover usuário antigo da auth (Se tiver permissão)
-- NOTA: Normalmente requires role 'supabase_admin' ou 'postgres'
-- Se falhar, o usuário pode deletar manualmente no painel Authentication
DO $$
BEGIN
  -- Tenta remover usuário antigo se existir (pelo email que provavelmente foi usado antes)
  -- Substitua 'email-antigo@exemplo.com' pelo email que deseja remover se souber,
  -- ou deixe o usuário remover via interface.
  NULL; 
END $$;

-- 3. Instruções:
-- O usuário 'israel.souza@ent.app.br' deve se cadastrar via tela de Registro (/register).
-- O trigger 'handle_new_user' já configurado vai criar o Client e o Member automaticamente.

-- Se precisar forçar um ID específico ou algo do tipo, faça UPDATE após o cadastro:
-- UPDATE auth.users SET password = ... (NÃO RECOMENDADO via SQL puro por causa do hash)
