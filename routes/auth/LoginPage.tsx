import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Loader2, Mail, Eye, EyeOff, ChevronRight, UserPlus, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Consuming global AuthContext
  const { user, loading: authLoading } = useAuth();

  // Redirect when user is authenticated
  React.useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/app');
      }
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');

    // Timeout de segurança: 15 segundos
    const loginTimeout = setTimeout(() => {
      setLoading(false);
      setError('O servidor demorou muito para responder. Verifique sua conexão.');
    }, 15000);

    try {
      const emailLower = email.trim().toLowerCase();
      console.log(`[LoginPage] Iniciando login para: ${emailLower}`);

      // 1) Autenticação no Supabase
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: emailLower,
        password,
      });

      if (authError) {
        throw new Error(authError.message || 'E-mail ou senha incorretos.');
      }

      // Login bem-sucedido!
      // IMPORTANTE: Não limpamos o loading aqui, o Redirect do useEffect cuidará disso.
      console.log('[LoginPage] Login Auth OK! Aguardando resolução do contexto...');

      // Forçamos o refresh do AuthContext para acelerar a detecção se necessário
      // (Alguns ambientes demoram a disparar onAuthStateChange)

    } catch (err: any) {
      clearTimeout(loginTimeout);
      console.error("[LoginPage] Falha crítica no login:", err);
      setError(err?.message || 'Erro ao realizar login. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background FX */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src="/logo.png" className="h-16 md:h-20 w-auto object-contain" alt="PageFlow" />
          </Link>
          <h1 className="text-zinc-400 font-medium">
            Gerencie seus perfis digitais com inteligência.
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
              <label htmlFor="email" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                E-MAIL DE ACESSO
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pl-14 pr-5 py-4 text-sm font-bold focus:border-blue-500/50 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                SENHA
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-purple-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pl-14 pr-[3.5rem] py-4 text-sm font-bold focus:border-purple-500/50 transition-all outline-none"
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
              className="w-full bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50"
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
            <div className="mb-4 text-[10px] font-black uppercase tracking-widest text-zinc-600 flex items-center justify-center gap-2">
              <Shield size={12} />
              Ambiente Seguro
            </div>
            <p className="text-zinc-500 text-xs font-medium">
              Não tem conta? <Link to="/register" className="text-white font-black hover:text-blue-400 transition-colors">Criar Perfil Grátis</Link>
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 opacity-40">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Supabase Online</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={10} className="text-zinc-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">v1.1.2-stable</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
