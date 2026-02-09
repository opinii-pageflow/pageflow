import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Palette, 
  QrCode, 
  Users, 
  BarChart3, 
  ArrowRight,
  ExternalLink,
  Zap
} from 'lucide-react';
import { clsx } from 'clsx';
import { getCurrentUser } from '../../lib/storage';
import { FeatureCard, PricingCard, FAQItem } from '../../components/landing/LandingUI';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const user = getCurrentUser();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const ctaTarget = !user ? "/login" : (user.role === 'admin' ? "/admin" : "/app");

  const navigateToCta = () => navigate(ctaTarget);

  return (
    <div className="bg-[#050505] text-white min-h-screen selection:bg-blue-500 selection:text-white font-['Inter']">
      
      {/* Navbar */}
      <nav className={clsx(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 h-20 flex items-center justify-center",
        isScrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
      )}>
        <div className="max-w-6xl w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white text-xs">LF</div>
            <span className="font-black text-lg tracking-tighter">LinkFlow</span>
          </div>

          <div className="hidden md:flex items-center gap-10">
            <a href="#recursos" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">Recursos</a>
            <a href="#precos" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">Preços</a>
            <a href="#faq" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-6">
            {!user && (
              <Link to="/login" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">Entrar</Link>
            )}
            <button 
              onClick={navigateToCta}
              className="bg-white text-black px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5"
            >
              {user ? 'Acessar Painel' : 'Começar'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-32 px-6 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-4xl space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
            <Zap size={10} className="text-blue-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">QR + NFC + Insights em um só lugar</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white">
            Sua identidade digital <br /> em um toque.
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            Crie perfis profissionais de elite para compartilhar suas redes, portfólio e contatos via QR Code ou tecnologia NFC.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={navigateToCta}
              className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-blue-500 transition-all active:scale-95 shadow-2xl shadow-blue-600/20"
            >
              Criar meu perfil grátis
              <ArrowRight size={18} />
            </button>
            <Link to="/u/israel" className="px-10 py-5 rounded-2xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-all font-black text-xs uppercase tracking-widest flex items-center gap-2">
              Ver exemplo
              <ExternalLink size={18} />
            </Link>
          </div>
        </div>

        {/* Mockup */}
        <div className="mt-24 w-full max-w-lg mx-auto p-4 bg-zinc-900/20 border border-white/5 rounded-[3rem] shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="bg-black rounded-[2.5rem] overflow-hidden border border-white/5 aspect-[9/16] relative group">
            <div className="h-40 bg-zinc-900 relative">
               <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-blue-600 border-8 border-black shadow-xl"></div>
            </div>
            <div className="pt-16 px-6 text-center space-y-6">
              <div className="h-4 w-32 bg-zinc-800 rounded-full mx-auto"></div>
              <div className="h-2 w-48 bg-zinc-900 rounded-full mx-auto"></div>
              
              <div className="space-y-3 pt-6">
                {[1,2,3].map(i => (
                  <div key={i} className="h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center px-4 gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white/5"></div>
                    <div className="h-2 w-24 bg-white/5 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recursos */}
      <section id="recursos" className="py-32 px-6 max-w-6xl mx-auto">
        <header className="mb-20">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-4">Recursos</h2>
          <h3 className="text-4xl md:text-5xl font-black tracking-tighter">Focado em performance.</h3>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FeatureCard 
            icon={Palette} 
            title="Templates Prontos" 
            desc="Designs de elite otimizados para conversão e leitura em qualquer dispositivo." 
          />
          <FeatureCard 
            icon={QrCode} 
            title="QR Code & NFC" 
            desc="Compartilhe instantaneamente encostando seu celular ou lendo seu código exclusivo." 
          />
          <FeatureCard 
            icon={Users} 
            title="Múltiplos Perfis" 
            desc="Gerencie diferentes identidades (pessoal, business, eventos) em uma única conta." 
          />
          <FeatureCard 
            icon={BarChart3} 
            title="Insights & Cliques" 
            desc="Telemetria completa para saber quem, quando e de onde seus links foram clicados." 
          />
        </div>
      </section>

      {/* Preços */}
      <section id="precos" className="py-32 px-6 max-w-6xl mx-auto">
        <header className="mb-20 text-center">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-4">Investimento</h2>
          <h3 className="text-4xl md:text-5xl font-black tracking-tighter">Escolha seu plano.</h3>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingCard 
            plan="Free" 
            price="R$ 0" 
            features={['1 Perfil Ativo', 'Analytics Básico', 'Layouts Padrão']}
            ctaLabel="Começar Grátis"
            onCta={() => navigate('/login')}
          />
          <PricingCard 
            plan="Pro" 
            price="R$ 29" 
            features={['5 Perfis Ativos', 'Advanced Insights', 'NFC Ativado']}
            highlighted
            ctaLabel="Assinar Pro"
            onCta={() => navigate('/login')}
          />
          <PricingCard 
            plan="Business" 
            price="R$ 89" 
            features={['Perfis Ilimitados', 'API Access', 'Custom Domain']}
            ctaLabel="Falar com Vendas"
            onCta={() => navigate('/login')}
          />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-32 px-6 max-w-3xl mx-auto">
        <h3 className="text-3xl font-black tracking-tighter mb-12 text-center">Dúvidas Frequentes</h3>
        <div className="space-y-2">
          <FAQItem 
            question="Funciona com iPhone e Android?" 
            answer="Sim! O LinkFlow é otimizado para ambos os sistemas operacionais, utilizando leitura nativa de QR Code e NFC." 
          />
          <FAQItem 
            question="Preciso de um app para ler o NFC?" 
            answer="Não. O receptor não precisa de nada instalado. Ao aproximar o celular, o seu perfil abre automaticamente no navegador." 
          />
          <FAQItem 
            question="Posso ter mais de um perfil?" 
            answer="Sim. Dependendo do seu plano (Pro ou Business), você pode gerenciar vários perfis independentes em uma mesma conta." 
          />
          <FAQItem 
            question="Consigo replicar o design para meus perfis?" 
            answer="Sim! Nosso editor permite copiar estilos e configurações entre seus perfis com apenas um clique." 
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 text-center">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center font-black text-white text-[10px]">L</div>
            <span className="font-black text-sm tracking-tighter">LinkFlow</span>
          </div>
          
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-700">
            © 2024 LinkFlow Master Industries
          </div>

          <div className="flex gap-8">
            <a href="#" className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Termos</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;