import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Lock, Loader2, Mail, ChevronRight, Building, ShieldCheck } from 'lucide-react';
import { loginAs, updateStorage } from '../../lib/storage';
import { Client } from '../../types';
import { PLANS } from '../../lib/plans';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      try {
        const clientId = 'client-' + Math.random().toString(36).substring(7);
        const slug = name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-');
        const starterPlan = PLANS.starter;
        
        const newClient: Client = {
          id: clientId,
          name: name,
          slug: slug,
          email: email,
          password: password,
          plan: starterPlan.id,
          maxProfiles: starterPlan.maxProfiles,
          createdAt: new Date().toISOString(),
          isActive: true
        };

        updateStorage(prev => ({
          ...prev,
          clients: [...prev.clients, newClient]
        }));

        loginAs({ 
          id: `user-${clientId}`, 
          role: 'client', 
          clientId: clientId, 
          name: name, 
          email: email 
        });

        navigate('/app/profiles');
      } catch (err) {
        setError('Erro ao criar conta. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }, 1500);
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
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Nome da Empresa / Profissional</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors">
                  <Building size={18} />
                </div>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
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
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
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
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
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
              Já tem uma conta? <Link to="/login" className="text-white font-black hover:underline">Fazer Login</Link>
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 opacity-40">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><ShieldCheck size={14} /> Dados Protegidos</div>
           <div className="w-1 h-1 rounded-full bg-zinc-800"></div>
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">Plano Starter Ativo</div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;