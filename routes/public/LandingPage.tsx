import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Palette, 
  QrCode, 
  Users, 
  BarChart3, 
  ArrowRight, 
  ArrowUpRight,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { clsx } from 'clsx';
import { getCurrentUser } from '../../lib/storage';
import { FeatureCard, PricingCard } from '../../components/landing/LandingUI';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  // Logic for redirection based on auth state
  const handleStart = () => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/app');
    }
  };

  return (
    <div className="bg-[#030303] text-white min-h-screen font-['Inter'] selection:bg-white selection:text-black overflow-x-hidden">
      
      {/* 1) TOPO (Navbar) */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-[2px]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center font-black text-black text-xs shadow-[0_0_15px_rgba(255,255,255,0.3)]">LF</div>
            <span className="font-bold text-lg tracking-tight hidden sm:block">LinkFlow SaaS</span>
          </div>

          <div className="flex items-center gap-4">
            {!user && (
              <Link 
                to="/login" 
                className="text-xs font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest px-4"
              >
                Entrar
              </Link>
            )}
            <button 
              onClick={handleStart}
              className="bg-white text-black px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all active:scale-95"
            >
              {user ? 'Acessar Painel' : 'Começar'}
            </button>
          </div>
        </div>
      </nav>

      {/* 2) HERO (Principal) */}
      <section className="pt-48 pb-32 px-6 relative flex flex-col items-center justify-center min-h-[90vh]">
        {/* Ambient Background */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-white/[0.03] rounded-[100%] blur-[120px] pointer-events-none"></div>

        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          
          {/* Text Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Novo: NFC 2.0 Suportado</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95]">
                Seu perfil digital <br/>
                <span className="text-zinc-500">em um único link.</span>
              </h1>
              <p className="text-lg text-zinc-400 font-medium leading-relaxed max-w-md mx-auto lg:mx-0">
                Compartilhe contatos, links e presença online com QR Code e tecnologia NFC instantânea.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center lg:justify-start">
              <button 
                onClick={handleStart}
                className="bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-zinc-200 transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
              >
                Criar meu perfil
                <ArrowRight size={16} />
              </button>
              <Link 
                to="/u/israel" 
                className="px-8 py-4 rounded-2xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-all font-black text-xs uppercase tracking-widest flex items-center gap-2"
              >
                Ver exemplo
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>

          {/* Phone Mockup (CSS Only) */}
          <div className="flex justify-center lg:justify-end">
             <div className="relative w-[280px] h-[540px] bg-[#080808] border-[8px] border-[#1a1a1a] rounded-[3rem] shadow-2xl rotate-[-6deg] hover:rotate-0 transition-all duration-700 ease-out group">
                {/* Screen */}
                <div className="w-full h-full bg-[#050505] rounded-[2.3rem] overflow-hidden relative flex flex-col items-center pt-12 px-5">
                   {/* Dynamic Island */}
                   <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-20"></div>
                   
                   {/* Profile Content */}
                   <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 mb-4 shadow-lg group-hover:scale-110 transition-transform"></div>
                   <div className="w-32 h-4 bg-zinc-800 rounded-full mb-2"></div>
                   <div className="w-20 h-2 bg-zinc-900 rounded-full mb-8"></div>

                   {/* Buttons */}
                   <div className="w-full space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-full h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center px-4 gap-3 group-hover:bg-zinc-800 transition-colors">
                           <div className="w-6 h-6 rounded-md bg-white/5"></div>
                           <div className="w-20 h-2 bg-white/10 rounded-full"></div>
                        </div>
                      ))}
                   </div>

                   {/* Floating Label */}
                   <div className="absolute bottom-8 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white">Visual Premium</p>
                   </div>
                </div>
                {/* Glow behind phone */}
                <div className="absolute -inset-10 bg-blue-500/20 blur-[60px] -z-10 rounded-full opacity-50"></div>
             </div>
          </div>

        </div>
      </section>

      {/* 3) RECURSOS */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="mb-16">
           <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6">Tudo o que você precisa.</h2>
           <p className="text-zinc-500 max-w-md">Ferramentas essenciais para profissionais modernos e empresas.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon={Palette} 
            title="Templates" 
            desc="Designs minimalistas prontos para uso." 
          />
          <FeatureCard 
            icon={QrCode} 
            title="QR & NFC" 
            desc="Conexão física e digital instantânea." 
          />
          <FeatureCard 
            icon={Users} 
            title="Multi-perfil" 
            desc="Gerencie várias marcas em uma conta." 
          />
          <FeatureCard 
            icon={BarChart3} 
            title="Insights" 
            desc="Monitore cliques e visualizações reais." 
          />
        </div>
      </section>

      {/* 4) PREÇOS */}
      <section className="py-32 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
           <h2 className="text-3xl md:text-5xl font-black tracking-tighter">Planos simples.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <PricingCard 
            plan="Gratuito" 
            price="Grátis" 
            features={['1 Perfil Ativo', 'QR Code Básico', 'Tema Dark']}
            ctaLabel="Começar Agora"
            onCta={handleStart}
          />
          <PricingCard 
            plan="Pro Master" 
            price="R$ 29" 
            features={['5 Perfis Ativos', 'Analytics Avançado', 'Remover Marca LinkFlow']}
            highlighted={true}
            ctaLabel="Experimentar Pro"
            onCta={handleStart}
          />
          <PricingCard 
            plan="Enterprise" 
            price="R$ 89" 
            features={['Perfis Ilimitados', 'API de Integração', 'Domínio Personalizado']}
            ctaLabel="Falar com Vendas"
            onCta={handleStart}
          />
        </div>
      </section>

      {/* 5) CTA FINAL */}
      <section className="py-32 px-6 text-center border-t border-white/5">
         <div className="max-w-2xl mx-auto space-y-10">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
              Comece agora seu <br/> perfil digital.
            </h2>
            <button 
              onClick={handleStart}
              className="bg-white text-black px-12 py-6 rounded-full font-black text-sm uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl"
            >
              Criar meu perfil
            </button>
            <p className="text-zinc-600 text-xs font-medium">
              Sem cartão de crédito necessário para começar.
            </p>
         </div>
      </section>

      {/* Footer Minimal */}
      <footer className="py-12 text-center border-t border-white/5 bg-black">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">
          © {new Date().getFullYear()} LinkFlow SaaS • Privacidade • Termos
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;