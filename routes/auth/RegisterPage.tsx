import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Loader2, Mail, ChevronRight, Building, ShieldCheck } from 'lucide-react';
import { loginAs, updateStorage } from '../../lib/storage';
import { Client } from '../../types';
import { PLANS } from '../../lib/plans';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ⚠️ No seu app atual esse campo "name" está sendo usado como "Nome da Empresa / Profissional"
  // Para o trigger do Supabase, vamos mandar:
  // - company_name = name (este input)
  // - name = name (fallback simples)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const getSupabaseEnv = () => {
    const url = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
    const anon = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;
    return { url, anon };
  };

  const safeSlug = (input: string) =>
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { url, anon } = getSupabaseEnv();
      if (!url || !anon) {
        throw new Error(
          'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no seu ambiente (.env / Dyad).'
        );
      }

      const companyName = name.trim();
      if (!companyName) {
        throw new Error('Informe o nome da empresa/profissional.');
      }

      // 1) Signup no Supabase Auth via HTTP (sem supabase-js)
      // Envia meta que o trigger usa: raw_user_meta_data.name e raw_user_meta_data.company_name
      const signupRes = await fetch(`${url}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: anon,
        },
        body: JSON.stringify({
          email,
          password,
          data: {
            name: companyName,
            company_name: companyName,
          },
        }),
      });

      const signupJson = await signupRes.json().catch(() => null);

      if (!signupRes.ok) {
        const msg =
          signupJson?.msg ||
          signupJson?.error_description ||
          signupJson?.error ||
          'Erro ao criar conta. Verifique os dados e tente novamente.';
        throw new Error(msg);
      }

      // Quando confirmação de email está DESATIVADA, normalmente vem session aqui.
      // Mesmo assim, por segurança, se não vier session, fazemos login logo em seguida.
      let accessToken: string | undefined = signupJson?.session?.access_token;
      let userId: string | undefined = signupJson?.user?.id;

      if (!accessToken) {
        // 2) Fallback: login pra obter session/token
        const loginRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: anon,
          },
          body: JSON.stringify({ email, password }),
        });

        const loginJson = await loginRes.json().catch(() => null);

        if (!loginRes.ok) {
          const msg =
            loginJson?.msg ||
            loginJson?.error_description ||
            loginJson?.error ||
            'Conta criada, mas falhou ao autenticar. Tente fazer login.';
          throw new Error(msg);
        }

        accessToken = loginJson?.access_token;
        userId = loginJson?.user?.id;
      }

      if (!accessToken || !userId) {
        throw new Error('Não foi possível autenticar após o cadastro. Tente fazer login.');
      }

      // 3) Buscar a company_id via PostgREST (company_members)
      // O trigger handle_new_user já criou company + membership automaticamente.
      const membersRes = await fetch(
        `${url}/rest/v1/company_members?select=company_id&user_id=eq.${userId}&limit=1`,
        {
          method: 'GET',
          headers: {
            apikey: anon,
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const membersJson = await membersRes.json().catch(() => null);

      if (!membersRes.ok || !Array.isArray(membersJson) || !membersJson[0]?.company_id) {
        // Se isso falhar, é porque RLS/policy de read está errada ou trigger não rodou.
        throw new Error(
          'Conta criada, mas não consegui localizar sua companhia. Verifique RLS de company_members e o trigger handle_new_user.'
        );
      }

      const companyId = membersJson[0].company_id as string;

      // 4) Buscar dados da company (plan/maxProfiles) para manter compatibilidade com o app atual
      const companyRes = await fetch(
        `${url}/rest/v1/companies?select=id,name,slug,plan,max_profiles,is_active&id=eq.${companyId}&limit=1`,
        {
          method: 'GET',
          headers: {
            apikey: anon,
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const companyJson = await companyRes.json().catch(() => null);
      const company = Array.isArray(companyJson) ? companyJson[0] : null;

      const starterPlan = PLANS.starter;

      // 5) Compat: salvar um "Client" mínimo no storage, sem password
      // (para não quebrar páginas que ainda dependem de data.clients)
      const newClient: Client = {
        id: company?.id || companyId,
        name: company?.name || companyName,
        slug: company?.slug || safeSlug(companyName),
        email,
        password: '', // não armazenar senha local
        plan: company?.plan || starterPlan.id,
        maxProfiles: typeof company?.max_profiles === 'number' ? company.max_profiles : starterPlan.maxProfiles,
        createdAt: new Date().toISOString(),
        isActive: company?.is_active !== false,
      };

      updateStorage(prev => {
        const existing = (prev.clients || []).find(c => c.id === newClient.id);
        return {
          ...prev,
          clients: existing ? prev.clients : [...prev.clients, newClient],
        };
      });

      // 6) Compat: login do app local com clientId = companyId
      loginAs({
        id: `user-${companyId}`,
        role: 'client',
        clientId: companyId,
        name: companyName,
        email,
      });

      // ✅ Aqui você pode escolher rota inicial
      navigate('/app/profiles');
    } catch (err: any) {
      setError(err?.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-8 flex flex-col items-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <img src="/logo.png" className="h-16 md:h-20 w-auto object-contain" alt="PageFlow" />
          </Link>
          <h1 className="text-2xl font-black tracking-tight mb-2">Comece seu Legado Digital</h1>
          <p className="text-zinc-500 text-sm font-medium">Crie seu primeiro cartão digital em menos de 1 minuto.</p>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-8 md:p-10 rounded-[3rem] shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold flex items-center gap-3">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">
                Nome da Empresa / Profissional
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors">
                  <Building size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Israel Tech"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pl-14 pr-5 py-4 text-sm font-bold focus:border-blue-500/50 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">E-mail</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pl-14 pr-5 py-4 text-sm font-bold focus:border-blue-500/50 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pl-14 pr-5 py-4 text-sm font-bold focus:border-indigo-500/50 transition-all outline-none"
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50 shadow-xl mt-4"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Criar minha conta grátis
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-zinc-500 text-xs font-medium">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-white font-black hover:underline">
                Fazer Login
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 opacity-40">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck size={14} /> Dados Protegidos
          </div>
          <div className="w-1 h-1 rounded-full bg-zinc-800"></div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            Plano Starter Ativo
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
