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

  const handleAnchorClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;

    const y = el.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace('#', '');
    const el = document.getElementById(id);
    if (!el) return;

    const y = el.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }, [location.hash]);

  const priceFor = (planId: string) => {
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return 0;
    return billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
  };

  return (
    <div className="bg-black text-white min-h-screen font-sans overflow-x-hidden">
      {/* Nav */}
      <header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-3xl border-b border-white/5"
        style={{ height: NAV_HEIGHT }}
      >
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg" />
            <div className="flex flex-col leading-none">
              <div className="text-[12px] font-black tracking-tight">PageFlow</div>
              <div className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">LinkFlow</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
            <a href="#recursos" onClick={(e) => handleAnchorClick(e, 'recursos')} className="hover:text-white transition-colors">Recursos</a>
            <a href="#precos" onClick={(e) => handleAnchorClick(e, 'precos')} className="hover:text-white transition-colors">Planos</a>
            <a href="#faq" onClick={(e) => handleAnchorClick(e, 'faq')} className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <button
            type="button"
            onClick={handleStart}
            className="px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-[0.22em]"
          >
            Começar <ArrowRight size={14} className="inline ml-2" />
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(37,99,235,0.18),transparent_60%),radial-gradient(circle_at_80%_60%,rgba(99,102,241,0.12),transparent_55%)]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                <Zap size={16} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.28em] text-zinc-400">
                  Perfis digitais premium
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.95]">
                Um perfil que parece
                <span className="block bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                  um produto
                </span>
              </h1>

              <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
                Página pública, QR Code, analytics e editor avançado de estilo. Crie e gerencie múltiplos perfis por cliente,
                com templates e personalização premium.
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

            <div className="lg:col-span-5">
              <div className="h-[520px] md:h-[620px] flex items-center justify-center relative">
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

                        {/* Phone Frame */}
                        <PhoneFrame>
                          {profile ? (
                            <PublicProfileRenderer
                              profile={profile}
                              isPreview={true}
                              clientPlan={plan}
                              source="direct"
                            />
                          ) : (
                            <div className="h-full flex items-center justify-center p-10">
                              <div className="text-center space-y-2">
                                <div className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.28em]">
                                  Sem vitrine
                                </div>
                                <div className="text-zinc-500 text-sm font-medium">
                                  Escolha um perfil em <span className="text-white">/admin</span> para aparecer aqui.
                                </div>
                              </div>
                            </div>
                          )}
                        </PhoneFrame>
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
            <div className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em]">Recursos</div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Tudo que você precisa</h2>
            <p className="text-zinc-500 text-lg font-medium max-w-2xl">
              Editor avançado, analytics, QR Code/NFC e estrutura multi-tenant para escalar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Palette size={20} />}
              title="Editor de Perfil"
              description="Templates, paleta avançada, fontes e background com gradiente ou imagem."
            />
            <FeatureCard
              icon={<QrCode size={20} />}
              title="QR Code e NFC"
              description="Cartão físico guarda apenas o link. O perfil muda sem trocar o cartão."
            />
            <FeatureCard
              icon={<BarChart3 size={20} />}
              title="Analytics"
              description="Visualizações, cliques e performance dos botões em tempo real."
            />
            <FeatureCard
              icon={<Users size={20} />}
              title="Multi-tenant"
              description="Clientes com múltiplos perfis, com controle e replicação de estilo."
            />
            <FeatureCard
              icon={<Shield size={20} />}
              title="Painel Admin"
              description="Gestão de clientes, planos, vitrine da landing e auditoria de perfis."
            />
            <FeatureCard
              icon={<Zap size={20} />}
              title="Performance"
              description="Render rápido, visual premium e escalável para redes e times."
            />
          </div>
        </div>
      </section>

      <section id="precos" className="py-28 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center space-y-4">
            <div className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em]">Planos</div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Escolha seu ritmo</h2>
            <p className="text-zinc-500 text-lg font-medium max-w-2xl mx-auto">
              Comece simples e evolua conforme seu uso. Sem surpresas.
            </p>

            <div className="inline-flex p-1 rounded-full bg-white/5 border border-white/10">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={clsx(
                  'px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.22em] transition-all',
                  billingCycle === 'monthly' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                )}
              >
                Mensal
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={clsx(
                  'px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.22em] transition-all',
                  billingCycle === 'annual' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                )}
              >
                Anual
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {PLANS.map((p) => (
              <PricingCard
                key={p.id}
                name={p.name}
                price={priceFor(p.id)}
                period={billingCycle === 'annual' ? 'ano' : 'mês'}
                description={p.description}
                features={p.features}
                highlight={p.highlight}
                onClick={handleStart}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 text-center space-y-4">
            <div className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em]">FAQ</div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Perguntas frequentes</h2>
            <p className="text-zinc-500 text-lg font-medium max-w-2xl mx-auto">
              Respostas objetivas para você decidir rápido.
            </p>
          </div>

          <div className="space-y-4">
            <FAQItem
              q="Dá para ter vários perfis no mesmo cliente?"
              a="Sim. O sistema é multi-tenant: um cliente pode ter múltiplos perfis e replicar estilo."
            />
            <FAQItem
              q="O cartão NFC precisa ser trocado se eu mudar o perfil?"
              a="Não. O cartão guarda só o link do perfil. Você muda o conteúdo sem trocar o cartão."
            />
            <FAQItem
              q="O preview na landing abre links externos?"
              a="No preview, os cliques são simulados (sem abrir nova aba), mas você consegue navegar e rolar dentro do celular."
            />
          </div>
        </div>
      </section>

      <footer className="py-14 px-6 border-t border-white/5 text-center text-zinc-600 text-sm">
        © {new Date().getFullYear()} PageFlow / LinkFlow — Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default LandingPage;
