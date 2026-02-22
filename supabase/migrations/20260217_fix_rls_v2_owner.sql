-- ============================================
-- FIX RLS V2 - PERMISSÃO POR EMAIL (SALVA-VIDAS)
-- ============================================

-- O problema: Se o vínculo na tabela 'client_members' não existir (falha no trigger), 
-- o usuário não consegue ler os dados do próprio cliente, mesmo sendo o dono (email igual).

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- 1. Política de Emails Iguais (Garante que o Owner sempre acesse, mesmo sem member)
DROP POLICY IF EXISTS "Owners can view own client by email" ON clients;

CREATE POLICY "Owners can view own client by email" ON clients
  FOR SELECT USING (
    email = auth.jwt() ->> 'email'
  );

-- 2. Garantir que a política de membros continue existindo
DROP POLICY IF EXISTS "Members can view own client" ON clients;

CREATE POLICY "Members can view own client" ON clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_members cm
      WHERE cm.client_id = id
      AND cm.user_id = auth.uid()
    )
  );

-- 3. Auto-correção de vínculo (Opcional, mas útil)
-- Se o usuário é owner (email bate) mas não tem membro, insere automaticamente se tentar ler? 
-- Não dá pra fazer INSERT em SELECT policy. 
-- Mas podemos criar uma função utilitária para chamar manualmente se precisar.

-- Apenas rode as policies acima. Elas devem liberar o acesso.
