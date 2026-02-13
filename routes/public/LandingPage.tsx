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
  ChevronRight
} from 'lucide-react';
import { getCurrentUser, getStorage } from '../../lib/storage';
import { FeatureCard, PricingCard, FAQItem } from '../../components/landing/LandingUI';
import PhoneFrame from '../../components/landing/PhoneFrame';
import { PLANS } from '../../lib/plans';
import clsx from 'clsx';
import PublicProfileRenderer from '../../components/preview/PublicProfileRenderer';

const NAV_HEIGHT = 80;

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Perfis vitrine (editáveis no /admin)
  const data = getStorage();
  const showcaseIds = (data.landing?.showcaseProfileIds || []).concat(['', '']).slice(0, 2);

  const getClientPlan = (profileId: string) => {
    const p = data.profiles.find(pr => pr.id === profileId);
    if (!p) return 'starter' as const;
    const client = data.clients.find(c => c.id === p.clientId);
    return (client?.plan || 'starter') as const;
  };

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
    { icon: Palette, title: 'Estilo Premium', desc: 'Identidade visual única com acabamento ultra-moderno.' },
    { icon: QrCode, title: 'QR Code & NFC', desc: 'Compartilhe seu legado digital em segundos.' },
    { icon: Users, title: 'Multifuncional', desc: 'Perfeito para criadores, agências e empresas.' },
    { icon: BarChart3, title: 'Telemetria Real', desc: 'Métricas avançadas de cliques e visualizações.' },
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
    <div className="bg-[#020202] text-white min-h-screen font-['Inter'] selection:bg-blue-600 selection:text-white overflow-x-hidden">
      {/* Premium Background Gradients */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
      >
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/5 h-20 flex items-center transition-all duration-500">
        <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.png" className="h-10 md:h-12 w-auto object-contain" alt="PageFlow" />
          </div>

          <div className="hidden lg:flex items-center gap-10">
            <a href="#recursos" onClick={(e) => handleAnchorClick(e, 'recursos')} className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 hover:text-blue-400 transition-all">Recursos</a>
            <a href="#precos" onClick={(e) => handleAnchorClick(e, 'precos')} className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 hover:text-blue-400 transition-all">Preços</a>
            <a href="#faq" onClick={(e) => handleAnchorClick(e, 'faq')} className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 hover:text-blue-400 transition-all">FAQ</a>
          </div>

          <div className="flex items-center gap-6">
            {!user && (
              <Link to="/login" className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 hover:text-white transition-all hidden sm:block">Login</Link>
            )}
            <button 
              type="button" 
              onClick={handleStart} 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 transition-all active:scale-95 shadow-lg shadow-blue-600/10"
            >
              {user ? 'Acessar Painel' : 'Começar Agora'}
            </button>
          </div>
        </div>
      </nav>

      <section className="relative pt-48 pb-32 px-6 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-blue-500/10 bg-blue-500/5 backdrop-blur-md">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,1)]" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400">Versão 2.0 - Tecnologia NFC Inclusa</span>
          </div>

          <div className="space-y-6 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/10 blur-[100px] pointer-events-none rounded-full" />
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] text-white relative z-10">
              Sua marca <br /> <span className="text-zinc-700">em outro</span> nível.
            </h1>
            <p className="text-lg md:text-2xl text-zinc-500 font-medium leading-relaxed max-w-2xl mx-auto relative z-10">
              Transforme contatos em conexões de alto valor com o cartão digital mais avançado do mercado.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 justify-center relative z-10 pt-4">
            <button 
              type="button" 
              onClick={handleStart} 
              className="bg-white text-black px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center gap-4 hover:bg-blue-50 transition-all active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
            >
              Criar Perfil <ArrowRight size={18} />
            </button>
            <Link 
              to="/u/israel" 
              className="px-12 py-6 rounded-[2rem] border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-all font-black text-xs uppercase tracking-[0.2em] flex items-center gap-4 active:scale-95"
            >
              Ver Demonstração <ExternalLink size={18} />
            </Link>
          </div>
        </div>

        <div className="mt-24 relative w-full max-w-5xl mx-auto group perspective-1000">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-[100px] opacity-30 group-hover:opacity-50 transition-all duration-1000 pointer-events-none" />
          <div className="bg-zinc-900/40 border border-white/10 rounded-[3rem] p-4 backdrop-blur-3xl shadow-2xl relative z-10 transform-gpu group-hover:rotate-x-2 transition-all duration-1000">
             <div className="bg-black/80 rounded-[2.5rem] overflow-hidden aspect-video flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 to-transparent pointer-events-none" />
                <div className="text-zinc-800 font-black text-4xl opacity-20 uppercase tracking-[1em] pointer-events-none">PageFlow Cloud</div>
                {/* iPhone Frame Placeholder */}
                <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-72 h-[500px] bg-black border-[8px] border-zinc-800 rounded-[3.5rem] shadow-2xl overflow-hidden hidden md:block">
                   <div className="w-full h-full bg-gradient-to-b from-blue-900/20 to-black p-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 mb-4" />
                      <div className="w-full h-4 bg-white/5 rounded-full mb-2" />
                      <div className="w-3/4 h-4 bg-white/5 rounded-full mb-8" />
                      <div className="space-y-3">
                         {[1,2,3,4].map(i => <div key={i} className="w-full h-12 bg-white/5 rounded-2xl border border-white/5" />)}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Showcase Profiles (admin-editável) */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">Demonstração Real</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
                Veja 2 perfis 
                <span className="text-zinc-700"> ao vivo</span>
              </h2>
              <p className="text-zinc-500 text-lg font-medium leading-relaxed">
                Seja para consolidar a força da sua marca corporativa ou destacar sua trajetória profissional, o PageFlow entrega o visual que você precisa. Crie hubs de links inteligentes que se adaptam ao seu estilo.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={handleStart}
                  className="px-10 py-5 rounded-[2rem] bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.22em] hover:shadow-[0_0_20px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 transition-all active:scale-95"
                >
                  Criar meu perfil
                </button>
                <a
                  href="#precos"
                  onClick={(e) => handleAnchorClick(e, 'precos')}
                  className="px-10 py-5 rounded-[2rem] border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-all font-black text-[10px] uppercase tracking-[0.22em] flex items-center justify-center gap-3 active:scale-95"
                >
                  Ver planos <ChevronRight size={16} />
                </a>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[0, 1].map((slot) => {
                  const id = showcaseIds[slot];
                  const profile = data.profiles.find(p => p.id === id);
                  const plan = id ? getClientPlan(id) : 'starter';

                  return (
                    <div key={slot} className="group relative">
                      <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/15 to-indigo-600/10 blur-[60px] opacity-30 group-hover:opacity-55 transition-all duration-700 pointer-events-none" />
                      <div className="relative bg-zinc-900/40 border border-white/10 rounded-[2.8rem] p-4 backdrop-blur-3xl shadow-2xl">
                        <div className="flex items-center justify-between px-3 pb-3">
                          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">Perfil {slot + 1}</div>
                          {profile ? (
                            <Link
                              to={`/u/${profile.slug}`}
                              className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-400 hover:text-white flex items-center gap-2"
                            >
                              Abrir <ExternalLink size={14} />
                            </Link>
                          ) : (
                            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-600">(configure no admin)</span>
                          )}
                        </div>

                        {/* Phone Frame (realista + scroll funcional no viewport) */}
                        <PhoneFrame>
                          {profile ? (
                            <div className="min-h-full">
                              <PublicProfileRenderer profile={profile} isPreview={true} clientPlan={plan} source="direct" />
                            </div>
                          ) : (
                            <div className="h-full min-h-[520px] flex items-center justify-center p-10">
                              <div className="text-center space-y-2">
                                <div className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.28em]">Sem vitrine</div>
                                <div className="text-zinc-500 text-sm font-medium">Escolha um perfil em <span className="text-white">/admin</span> para aparecer aqui.</div>
                              </div>
                            </div>
                          )}
                        </PhoneFrame>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="recursos" className="py-32 px-6 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center md:text-left space-y-4">
            <div className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em]">O Futuro é Digital</div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Recursos <span className="text-zinc-700">SaaS Premium</span></h2>
            <p className="text-zinc-500 max-w-xl text-lg font-medium leading-relaxed">Desenvolvido para máxima conversão e autoridade visual.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} />
            ))}
          </div>
        </div>
      </section>

      <section id="precos" className="py-32 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20 space-y-4">
          <div className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">Investimento</div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Planos de <span className="text-zinc-700">Expansão</span></h2>
          <p className="text-zinc-500 max-w-lg mx-auto text-lg font-medium leading-relaxed">Selecione a infraestrutura ideal para o seu perfil profissional.</p>
        </div>

        {/* BILLING TOGGLE */}
        <div className="flex items-center justify-center gap-6 mb-20">
          <span className={clsx("text-xs font-bold uppercase tracking-widest transition-all", billingCycle === 'monthly' ? "text-white" : "text-zinc-600")}>Faturamento Mensal</span>
          <button 
            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')}
            className="w-16 h-8 bg-zinc-900 rounded-full relative p-1.5 transition-all hover:bg-zinc-800 border border-white/5"
          >
            <div className={clsx("w-5 h-5 bg-white rounded-full transition-all duration-500 shadow-lg", billingCycle === 'annual' ? "translate-x-8 bg-blue-500" : "translate-x-0")} />
          </button>
          <div className="flex items-center gap-3">
            <span className={clsx("text-xs font-bold uppercase tracking-widest transition-all", billingCycle === 'annual' ? "text-white" : "text-zinc-600")}>Anual</span>
            <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-[0.15em]">Economize 20%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
          <PricingCard
            plan={PLANS.starter.name}
            price={getDisplayPrice('starter')}
            features={PLANS.starter.features}
            ctaLabel="Get Started"
            onCta={handleStart}
          />
          <PricingCard
            plan={PLANS.pro.name}
            price={getDisplayPrice('pro')}
            features={PLANS.pro.features}
            ctaLabel="Upgrade to Pro"
            highlighted={true}
            onCta={handleStart}
          />
          <PricingCard
            plan={PLANS.business.name}
            price={getDisplayPrice('business')}
            features={PLANS.business.features}
            ctaLabel="Go Business"
            onCta={handleStart}
          />
          <PricingCard
            plan={PLANS.enterprise.name}
            price={getDisplayPrice('enterprise')}
            features={PLANS.enterprise.features}
            ctaLabel="Contact Team"
            onCta={handleStart}
          />
        </div>
      </section>

      <section id="faq" className="py-32 px-6 border-t border-white/5 bg-zinc-950/50 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16 text-center">
            <div className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">FAQ</div>
            <h2 className="text-4xl font-black tracking-tight">Perguntas <span className="text-zinc-700">Frequentes</span></h2>
          </div>
          <div className="space-y-2 mb-20 bg-zinc-900/20 p-8 rounded-[3rem] border border-white/5">
            <FAQItem 
              question="Como funciona o compartilhamento via NFC?" 
              answer="Nossos cartões físicos premium utilizam tecnologia NFC de ponta. Basta aproximar o cartão de qualquer smartphone compatível para abrir seu perfil instantaneamente, sem necessidade de aplicativos ou leitura de câmera." 
            />
            <FAQItem 
              question="Posso personalizar as cores e fontes do meu perfil?" 
              answer="Com certeza! O PageFlow oferece liberdade total de design. Você pode ajustar paletas de cores, escolher entre dezenas de fontes premium e até criar fundos com gradientes exclusivos para que seu cartão seja único." 
            />
            <FAQItem 
              question="Existe um limite de links no meu cartão digital?" 
              answer="Não há limite de botões! Adicione quantos links desejar para suas redes sociais, sites, portfólios e canais de atendimento. Você ainda pode organizar a ordem dos links com facilidade." 
            />
            <FAQItem 
              question="Meus dados e métricas de visitantes são privados?" 
              answer="Sim. Valorizamos a sua privacidade e a dos seus clientes. Todas as métricas de acesso e cliques são acessíveis apenas por você através do seu painel administrativo protegido." 
            />
            <FAQItem 
              question="Posso cancelar ou alterar meu plano quando quiser?" 
              answer="Sim. O PageFlow não possui contratos de fidelidade. Você pode fazer o upgrade, downgrade ou cancelar sua assinatura a qualquer momento diretamente pelas configurações da sua conta." 
            />
          </div>
          
          <footer className="mt-40 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-4">
              <img src="/logo.png" className="h-8 w-auto grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" alt="PageFlow" />
              <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">© 2024 PAGEFLOW CLOUD OPERATIONS.</span>
            </div>
            
            <div className="flex items-center gap-10">
              <a href="#" className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-all">Termos</a>
              <a href="#" className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-all">Privacidade</a>
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                <ChevronRight size={16} className="-rotate-90" />
              </button>
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;