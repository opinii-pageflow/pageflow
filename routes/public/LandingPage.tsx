import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Palette,
  QrCode,
  Users,
  BarChart3,
  ArrowRight,
  Zap,
  ExternalLink,
} from 'lucide-react';
import { getCurrentUser } from '../../lib/storage';
import { FeatureCard, PricingCard, FAQItem } from '../../components/landing/LandingUI';
import { PLANS } from '../../lib/plans';
import clsx from 'clsx';

const NAV_HEIGHT = 80;

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const handleStart = useCallback(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/app');
    }
  }, [navigate, user]);

  const scrollToId = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT - 16;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }, []);

  const handleAnchorClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      scrollToId(id);
    },
    [scrollToId]
  );

  useEffect(() => {
    const hash = (location.hash || '').replace('#', '').trim();
    if (!hash) return;
    const t = window.setTimeout(() => scrollToId(hash), 50);
    return () => window.clearTimeout(t);
  }, [location.hash, scrollToId]);

  const features = [
    { icon: Palette, title: 'Templates Prontos', desc: 'Designs clean otimizados para conversão.' },
    { icon: QrCode, title: 'QR Code & NFC', desc: 'Conexão física e digital instantânea.' },
    { icon: Users, title: 'Múltiplos Perfis', desc: 'Gerencie várias marcas em uma conta.' },
    { icon: BarChart3, title: 'Insights e Cliques', desc: 'Métricas de quem visita seu perfil.' },
  ] as const;

  const getDisplayPrice = (planId: keyof typeof PLANS) => {
    const plan = PLANS[planId];
    if (plan.monthlyPrice === 0) return 'Grátis';
    
    if (billingCycle === 'annual') {
      const discounted = plan.monthlyPrice * 0.8;
      return `R$ ${Math.floor(discounted)}`;
    }
    return `R$ ${plan.monthlyPrice}`;
  };

  return (
    <div className="bg-black text-white min-h-screen font-['Inter'] selection:bg-white selection:text-black overflow-x-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(900px 500px at 20% 10%, rgba(255,255,255,0.06), transparent 60%), radial-gradient(700px 450px at 80% 15%, rgba(59,130,246,0.12), transparent 55%), radial-gradient(900px 700px at 50% 90%, rgba(255,255,255,0.04), transparent 60%)',
        }}
      />

      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 h-20 flex items-center">
        <div className="w-full max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-black text-black text-xs">
              LF
            </div>
            <span className="font-bold text-lg tracking-tight">LinkFlow</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#recursos" onClick={(e) => handleAnchorClick(e, 'recursos')} className="text-[11px] font-bold text-zinc-500 hover:text-white transition-colors">Recursos</a>
            <a href="#precos" onClick={(e) => handleAnchorClick(e, 'precos')} className="text-[11px] font-bold text-zinc-500 hover:text-white transition-colors">Preços</a>
            <a href="#faq" onClick={(e) => handleAnchorClick(e, 'faq')} className="text-[11px] font-bold text-zinc-500 hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-4">
            {!user && (
              <Link to="/login" className="text-[11px] font-bold text-white hover:text-zinc-300 transition-colors uppercase tracking-widest hidden sm:block">Entrar</Link>
            )}
            <button type="button" onClick={handleStart} className="bg-white text-black px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.15em] hover:bg-zinc-200 transition-all active:scale-95">
              {user ? 'Acessar' : 'Começar'}
            </button>
          </div>
        </div>
      </nav>

      <section className="relative pt-40 pb-20 px-6 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-10 min-h-[85vh]">
        <div className="flex-1 space-y-8 text-center md:text-left relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5">
            <Zap size={10} className="text-white fill-white" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">QR + NFC + Insights em um só lugar</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1] text-white">Seu perfil digital <br /> em um único link.</h1>
            <p className="text-lg text-zinc-500 font-medium leading-relaxed max-w-md mx-auto md:mx-0">Compartilhe contatos, links e presença online com QR Code e NFC — sem complicação.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            <button type="button" onClick={handleStart} className="bg-white text-black px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-200 transition-all active:scale-95">
              Criar meu perfil <ArrowRight size={14} />
            </button>
            <Link to="/u/israel" className="px-8 py-4 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all font-black text-xs uppercase tracking-widest flex items-center gap-2">
              Ver exemplo <ExternalLink size={14} />
            </Link>
          </div>
        </div>

        <div className="flex-1 flex justify-center md:justify-end relative z-10">
          <div className="relative w-[260px] h-[500px] bg-black border-[6px] border-zinc-800 rounded-[3rem] shadow-2xl flex flex-col items-center pt-8 px-4 overflow-hidden">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-zinc-900 rounded-full z-20" />
            <div className="w-full h-24 rounded-2xl bg-white/5 border border-white/5 mt-4 mb-4 overflow-hidden relative">
              <div className="absolute inset-0 opacity-70" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(255,255,255,0.05))' }} />
            </div>
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 mb-3 -mt-10 border border-white/10" />
            <div className="w-32 h-3 bg-zinc-800 rounded-full mb-2" />
            <div className="w-24 h-2 bg-zinc-900 rounded-full mb-8" />
            <div className="w-full space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-full h-12 bg-zinc-900/50 border border-white/5 rounded-xl flex items-center px-3 gap-3">
                  <div className="w-6 h-6 rounded bg-white/5" />
                  <div className="w-24 h-2 bg-white/5 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="recursos" className="py-24 px-6 bg-zinc-950 border-y border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 text-center md:text-left">
            <h2 className="text-3xl font-black tracking-tight mb-4">Tudo o que você precisa.</h2>
            <p className="text-zinc-500 max-w-sm mx-auto md:mx-0">O essencial para um perfil rápido, bonito e mensurável.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} />
            ))}
          </div>
        </div>
      </section>

      <section id="precos" className="py-24 px-6 max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black tracking-tight">Escolha seu plano.</h2>
          <p className="text-zinc-500 mt-3 text-sm font-medium">Preços transparentes para todos os tamanhos de marca.</p>
        </div>

        {/* BILLING TOGGLE */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <span className={clsx("text-xs font-bold transition-colors", billingCycle === 'monthly' ? "text-white" : "text-zinc-500")}>Mensal</span>
          <button 
            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')}
            className="w-12 h-6 bg-zinc-800 rounded-full relative p-1 transition-all"
          >
            <div className={clsx("w-4 h-4 bg-white rounded-full transition-transform duration-300", billingCycle === 'annual' ? "translate-x-6" : "translate-x-0")} />
          </button>
          <div className="flex items-center gap-2">
            <span className={clsx("text-xs font-bold transition-colors", billingCycle === 'annual' ? "text-white" : "text-zinc-500")}>Anual</span>
            <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest">-20% OFF</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          <PricingCard
            plan={PLANS.starter.name}
            price={getDisplayPrice('starter')}
            features={PLANS.starter.features}
            ctaLabel="Começar Grátis"
            onCta={handleStart}
          />
          <PricingCard
            plan={PLANS.pro.name}
            price={getDisplayPrice('pro')}
            features={PLANS.pro.features}
            ctaLabel="Assinar Pro"
            highlighted={true}
            onCta={handleStart}
          />
          <PricingCard
            plan={PLANS.business.name}
            price={getDisplayPrice('business')}
            features={PLANS.business.features}
            ctaLabel="Assinar Business"
            onCta={handleStart}
          />
          <PricingCard
            plan={PLANS.enterprise.name}
            price={getDisplayPrice('enterprise')}
            features={PLANS.enterprise.features}
            ctaLabel="Falar com Vendas"
            onCta={handleStart}
          />
        </div>
      </section>

      <section id="faq" className="py-24 px-6 border-t border-white/5 bg-zinc-950 relative z-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-black tracking-tight mb-10 text-center">Dúvidas Frequentes</h2>
          <div className="space-y-2 mb-20">
            <FAQItem question="Funciona com iPhone e Android?" answer="Sim. O perfil abre no navegador em qualquer smartphone moderno, sem instalar nada." />
            <FAQItem question="Posso ter mais de 1 perfil?" answer="Sim. Cada plano oferece um limite de perfis ativos. O plano Pro permite até 3, o Business até 10 e o Enterprise até 25." />
            <FAQItem question="Consigo alterar meu plano depois?" answer="Sim, você pode fazer upgrade ou downgrade a qualquer momento diretamente pelo painel." />
          </div>
          <footer className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">© 2024 LinkFlow</span>
          </footer>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;