-- Migração para adicionar e-mail e tipo de usuário

-- 1. Garante coluna email e user_type na tabela clients
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='email') THEN
        ALTER TABLE public.clients ADD COLUMN email text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='user_type') THEN
        ALTER TABLE public.clients ADD COLUMN user_type text DEFAULT 'client' CHECK (user_type IN ('admin', 'client'));
    END IF;
END $$;

-- 2. Garante coluna email e role na tabela profiles
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='email') THEN
        ALTER TABLE public.profiles ADD COLUMN email text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
        ALTER TABLE public.profiles ADD COLUMN role text DEFAULT 'client';
    END IF;
END $$;

-- 3. Agora podemos rodar o update com segurança
UPDATE public.clients 
SET user_type = 'admin', email = 'israel.souza@ent.app.br'
WHERE email = 'israel.souza@ent.app.br' OR id IN (SELECT client_id FROM public.client_members WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'israel.souza@ent.app.br'));

-- Se o registro não tinha email, vamos tentar setar pelo ID do usuário logado
UPDATE public.clients 
SET user_type = 'admin'
WHERE id IN (SELECT client_id FROM public.client_members WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'israel.souza@ent.app.br'));

UPDATE public.profiles 
SET role = 'admin', email = 'israel.souza@ent.app.br'
WHERE email = 'israel.souza@ent.app.br' OR id IN (SELECT id FROM auth.users WHERE email = 'israel.souza@ent.app.br');

