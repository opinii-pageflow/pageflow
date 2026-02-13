import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Loader2, Mail, Eye, EyeOff, ChevronRight, UserPlus } from 'lucide-react';
import { loginAs, getStorage, ADMIN_MASTER } from '../../lib/storage';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const storage = getStorage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      try {
        // 1. Verificar se é Admin Master
        if (email.toLowerCase() === ADMIN_MASTER.email.toLowerCase() && password === ADMIN_MASTER.password) {
          loginAs({ 
            id: ADMIN_MASTER.id, 
            role: 'admin', 
            name: ADMIN_MASTER.name, 
            email: ADMIN_MASTER.email 
          });
          navigate('/admin');
          return;
        }

        // 2. Verificar se é um Cliente cadastrado
        const client = storage.clients.find(c => 
          c.email?.toLowerCase() === email.toLowerCase() && c.password === password
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
            email: client.email || '' 
          });
          navigate('/app');
        } else {
          setError('E-mail ou senha incorretos.');
        }
      } catch (err) {
        setError('Erro ao realizar login. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }, 1200);
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
          <h1 className="text-zinc-400 font-medium px-4">Entre na sua conta para gerenciar seus perfis digitais.</h1>
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
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">E-mail de Acesso</label>
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
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-purple-500 transition-colors pointer-events-none">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
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
               <Link to="/register" className="text-white font-black hover:text-blue-400 transition-colors inline-flex items-center gap-1 ml-1">
                 Criar Perfil Grátis <UserPlus size={14} />
               </Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
