import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Loader2, Mail, Eye, EyeOff, ChevronRight, UserPlus } from 'lucide-react';
import { loginAs, getStorage, updateStorage, ADMIN_MASTER } from '../../lib/storage';
import { Client } from '../../types';
import { PLANS } from '../../lib/plans';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const storage = getStorage();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const supabaseEnv = useMemo(() => {
    const url = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
    const anon = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;
    return { url, anon };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const emailLower = email.trim().toLowerCase();

      // 1) Admin Master (mantém o comportamento atual)
      if (emailLower === ADMIN_MASTER.email.toLowerCase() && password === ADMIN_MASTER.password) {
        loginAs({
          id: ADMIN_MASTER.id,
          role: 'admin',
          name: ADMIN_MASTER.name,
          email: ADMIN_MASTER.email,
        });
        navigate('/admin');
        return;
      }

      // 2) Se Supabase env não estiver configurado, faz fallback para o modo antigo (storage)
      // (Isso evita tela branca no Dyad se alguém esqueceu as envs)
      if (!supabaseEnv.url || !supabaseEnv.anon) {
        const client = storage.clients.find(
          (c) => c.email?.toLowerCase() === emailLower && c.password === password
        );

        if (client) {
          if (!client.isActive) {
            setError('Sua conta está desativada. Entre em contato com o suporte.');
            return;
          }
          loginAs({
            id: `user-${client.id}`,
            role: 'client',
            clientId: client.id,
            name: client.name,
            email: client.email || '',
          });
          navigate('/app');
        } else {
          setError('E-mail ou senha incorretos.');
        }
        return;
      }

      const { url, anon } = supabaseEnv;

      // 3) Login no Supabase via HTTP (token password grant)
      const loginRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: anon!,
        },
        body: JSON.stringify({
          email: emailLower,
          password,
        }),
      });

      const loginJson = await loginRes.json().catch(() => null);

      if (!loginRes.ok) {
        const msg =
          loginJson?.msg ||
          loginJson?.error_description ||
          loginJson?.error ||
          'E-mail ou senha incorretos.';
        throw new Error(msg);
      }

      const accessToken: string | undefined = loginJson?.access_token;
      const userId: string | undefined = loginJson?.user?.id;

      if (!accessToken || !userId) {
        throw new Error('Falha ao autenticar. Tente novamente.');
      }

      // 4) Descobrir company_id via company_members
      const membersRes = await fetch(
        `${url}/rest/v1/company_members?select=company_id,is_active&user_id=eq.${userId}&limit=1`,
        {
          method: 'GET',
          headers: {
            apikey: anon!,
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const membersJson = await membersRes.json().catch(() => null);

      if (!membersRes.ok || !Array.isArray(membersJson) || !membersJson[0]?.company_id) {
        throw new Error(
          'Não encontrei sua companhia. Verifique o membership (company_members) e as policies de leitura.'
        );
      }

      const companyId = membersJson[0].company_id as string;
      const memberActive = membersJson[0].is_active !== false;

      if (!memberActive) {
        setError('Seu acesso está desativado. Entre em contato com o suporte.');
        return;
      }

      // 5) Verificar se a company está ativa e trazer plan/limites
      const companyRes = await fetch(
        `${url}/rest/v1/companies?select=id,name,slug,plan,max_profiles,is_active&id=eq.${companyId}&limit=1`,
        {
          method: 'GET',
          headers: {
            apikey: anon!,
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const companyJson = await companyRes.json().catch(() => null);
      const company = Array.isArray(companyJson) ? companyJson[0] : null;

      if (!companyRes.ok || !company?.id) {
        throw new Error('Falha ao carregar sua companhia. Verifique as policies em companies.');
      }

      if (company.is_active === false) {
        setError('Sua conta está desativada. Entre em contato com o suporte.');
        return;
      }

      // 6) Compatibilidade com o app atual:
      // Garantir que exista um Client no storage, sem senha.
      const starterPlan = PLANS.starter;

      const newClient: Client = {
        id: company.id,
        name: company.name || emailLower,
        slug: company.slug || (company.name ? company.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') : ''),
        email: emailLower,
        password: '', // nunca guardar senha local
        plan: company.plan || starterPlan.id,
        maxProfiles:
          typeof company.max_profiles === 'number' ? company.max_profiles : starterPlan.maxProfiles,
        createdAt: new Date().toISOString(),
        isActive: company.is_active !== false,
      };

      updateStorage((prev) => {
        const clients = prev.clients || [];
        const exists = clients.some((c) => c.id === newClient.id);
        return {
          ...prev,
          clients: exists ? clients : [...clients, newClient],
        };
      });

      // 7) Login local (mantém ProtectedRoute e resto do app funcionando)
      loginAs({
        id: `user-${companyId}`,
        role: 'client',
        clientId: companyId,
        name: company.name || emailLower,
        email: emailLower,
      });

      navigate('/app');
    } catch (err: any) {
      setError(err?.message || 'Erro ao realizar login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Elementos Visuais de Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      </div>

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center mb-10 flex flex-col items-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <img src="/logo.png" className="h-16 md:h-20 w-auto object-contain" alt="PageFlow" />
          </Link>
          <h1 className="text-zinc-400 font-medium px-4">
            Entre na sua conta para gerenciar seus perfis digitais.
          </h1>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-8 md:p-10 rounded-[2.5rem] shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold flex items-center gap-3 animate-in slide-in-from-top-2">
                <Lock size={16} />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                E-mail de Acesso
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pl-14 pr-5 py-4 text-sm font-bold focus:border-blue-500/50 transition-all outline-none placeholder:text-zinc-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                Senha
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-purple-500 transition-colors pointer-events-none">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pl-14 pr-14 py-4 text-sm font-bold focus:border-purple-500/50 transition-all outline-none placeholder:text-zinc-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors z-20"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-white/5 mt-4"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Entrar na Plataforma
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <div className="mb-4 text-[10px] font-black uppercase tracking-widest text-zinc-600 flex items-center justify-center gap-2 pointer-events-none">
              <Shield size={12} />
              Sistema Seguro & Criptografado
            </div>

            <p className="text-zinc-500 text-xs font-medium">
              Ainda não tem uma conta? <br className="sm:hidden" />
              <Link
                to="/register"
                className="text-white font-black hover:text-blue-400 transition-colors inline-flex items-center gap-1 ml-1"
              >
                Criar Perfil Grátis <UserPlus size={14} />
              </Link>
            </p>
          </div>
        </div>

        {/* Aviso leve se env não estiver configurado (evita confusão) */}
        {(!supabaseEnv.url || !supabaseEnv.anon) && (
          <div className="mt-6 text-center text-[10px] font-black uppercase tracking-widest text-zinc-700">
            Supabase não configurado (fallback local ativo)
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
