import React, { useCallback, useEffect } from 'react';
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

const NAV_HEIGHT = 80; // h-20

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();

  const handleStart = useCallback(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/app');
    }
  }, [navigate, user]);

  // Scroll suave com offset para navbar fixa
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

  // Se abrir a página com hash (#precos etc), rolar com offset
  useEffect(() => {
    const hash = (location.hash || '').replace('#', '').trim();
    if (!hash) return;
    // pequena espera para garantir render
    const t = window.setTimeout(() => scrollToId(hash), 50);
    return () => window.clearTimeout(t);
  }, [location.hash, scrollToId]);

  const features = [
    { icon: Palette, title: 'Templates Prontos', desc: 'Designs clean otimizados para conversão.' },
    { icon: QrCode, title: 'QR Code & NFC', desc: 'Conexão física e digital instantânea.' },
    { icon: Users, title: 'Múltiplos Perfis', desc: 'Gerencie várias marcas em uma conta.' },
    { icon: BarChart3, title: 'Insights e Cliques', desc: 'Métricas de quem visita seu perfil.' },
  ] as const;

  return (
    <div className="bg-black text-white min-h-screen font-['Inter'] selection:bg-white selection:text-black overflow-x-hidden">
      {/* Fundo sutil (sem exagero) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(900px 500px at 20% 10%, rgba(255,255,255,0.06), transparent 60%), radial-gradient(700px 450px at 80% 15%, rgba(59,130,246,0.12), transparent 55%), radial-gradient(900px 700px at 50% 90%, rgba(255,255,255,0.04), transparent 60%)',
        }}
      />

      {/* 1) NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 h-20 flex items-center">
        <div className="w-full max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-black text-black text-xs">
              LF
            </div>
            <span className="font-bold text-lg tracking-tight">LinkFlow</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#recursos"
              onClick={(e) => handleAnchorClick(e, 'recursos')}
              className="text-[11px] font-bold text-zinc-500 hover:text-white transition-colors"
            >
              Recursos
            </a>
            <a
              href="#precos"
              onClick={(e) => handleAnchorClick(e, 'precos')}
              className="text-[11px] font-bold text-zinc-500 hover:text-white transition-colors"
            >
              Preços
            </a>
            <a
              href="#faq"
              onClick={(e) => handleAnchorClick(e, 'faq')}
              className="text-[11px] font-bold text-zinc-500 hover:text-white transition-colors"
            >
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-4">
            {!user && (
              <Link
                to="/login"
                className="text-[11px] font-bold text-white hover:text-zinc-300 transition-colors uppercase tracking-widest hidden sm:block"
              >
                Entrar
              </Link>
            )}
            <button
              type="button"
              onClick={handleStart}
              className="bg-white text-black px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.15em] hover:bg-zinc-200 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black/60"
            >
              {user ? 'Acessar' : 'Começar'}
            </button>
          </div>
        </div>
      </nav>

      {/* 2) HERO */}
      <section className="relative pt-40 pb-20 px-6 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-10 min-h-[85vh]">
        <div className="flex-1 space-y-8 text-center md:text-left relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5">
            <Zap size={10} className="text-white fill-white" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              QR + NFC + Insights em um só lugar
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1] text-white">
              Seu perfil digital <br /> em um único link.
            </h1>
            <p className="text-lg text-zinc-500 font-medium leading-relaxed max-w-md mx-auto md:mx-0">
              Compartilhe contatos, links e presença online com QR Code e NFC — sem complicação.
            </p>

            {/* Micro-copy de confiança (simples) */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest border border-white/5 bg-white/5 px-3 py-1 rounded-full">
                Sem app
              </span>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest border border-white/5 bg-white/5 px-3 py-1 rounded-full">
                Atualiza sem regravar
              </span>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest border border-white/5 bg-white/5 px-3 py-1 rounded-full">
                Multi-perfis
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            <button
              type="button"
              onClick={handleStart}
              className="bg-white text-black px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-200 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black/60"
            >
              Criar meu perfil
              <ArrowRight size={14} />
            </button>
            <Link
              to="/u/israel"
              className="px-8 py-4 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all font-black text-xs uppercase tracking-widest flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black/60"
            >
              Ver exemplo
              <ExternalLink size={14} />
            </Link>
          </div>

          <p className="text-[11px] text-zinc-600 font-bold uppercase tracking-widest">
            Dica: sem cartão NFC? Use só o QR Code e pronto.
          </p>
        </div>

        <div className="flex-1 flex justify-center md:justify-end relative z-10">
          {/* Mockup CSS puro (um pouco mais limpo) */}
          <div className="relative w-[260px] h-[500px] bg-black border-[6px] border-zinc-800 rounded-[3rem] shadow-2xl flex flex-col items-center pt-8 px-4 overflow-hidden">
            {/* Dynamic Island Fake */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-zinc-900 rounded-full z-20" />

            {/* Header */}
            <div className="w-full h-24 rounded-2xl bg-white/5 border border-white/5 mt-4 mb-4 overflow-hidden relative">
              <div className="absolute inset-0 opacity-70" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(255,255,255,0.05))' }} />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            </div>

            {/* Avatar + nome */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 mb-3 -mt-10 border border-white/10" />
            <div className="w-32 h-3 bg-zinc-800 rounded-full mb-2" />
            <div className="w-24 h-2 bg-zinc-900 rounded-full mb-8" />

            {/* Botões */}
            <div className="w-full space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-full h-12 bg-zinc-900/50 border border-white/5 rounded-xl flex items-center px-3 gap-3"
                >
                  <div className="w-6 h-6 rounded bg-white/5" />
                  <div className="w-24 h-2 bg-white/5 rounded-full" />
                  <div className="ml-auto w-10 h-2 bg-white/5 rounded-full opacity-60" />
                </div>
              ))}
            </div>

            {/* Fade Bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
          </div>
        </div>
      </section>

      {/* 3) RECURSOS */}
      <section id="recursos" className="py-24 px-6 bg-zinc-950 border-y border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-black tracking-tight mb-4">Tudo o que você precisa.</h2>
            <p className="text-zinc-500 max-w-sm">O essencial para um perfil rápido, bonito e mensurável.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} />
            ))}
          </div>
        </div>
      </section>

      {/* 4) PREÇOS */}
      <section id="precos" className="py-24 px-6 max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black tracking-tight">Escolha seu plano.</h2>
          <p className="text-zinc-500 mt-3 text-sm font-medium">Comece no grátis. Suba quando precisar de mais perfis.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          <PricingCard
            plan={PLANS.starter.name}
            price={PLANS.starter.price || 'Grátis'}
            features={PLANS.starter.features}
            ctaLabel="Começar Grátis"
            onCta={handleStart}
          />
          <PricingCard
            plan={PLANS.pro.name}
            price={PLANS.pro.price || ''}
            features={PLANS.pro.features}
            highlighted={true}
            ctaLabel="Começar Pro"
            onCta={handleStart}
          />
          <PricingCard
            plan={PLANS.business.name}
            price={PLANS.business.price || ''}
            features={PLANS.business.features}
            ctaLabel="Começar Business"
            onCta={handleStart}
          />
        </div>

        <p className="text-center text-[11px] text-zinc-600 font-bold uppercase tracking-widest mt-10">
          NFC grava apenas o link do perfil — você atualiza tudo sem regravar o cartão.
        </p>
      </section>

      {/* 5) FAQ & FOOTER */}
      <section id="faq" className="py-24 px-6 border-t border-white/5 bg-zinc-950 relative z-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-black tracking-tight mb-10 text-center">Dúvidas Frequentes</h2>

          <div className="space-y-2 mb-20">
            <FAQItem
              question="Funciona com iPhone e Android?"
              answer="Sim. O perfil abre no navegador em qualquer smartphone moderno, sem instalar nada."
            />
            <FAQItem
              question="Precisa de app para o NFC?"
              answer="Na maioria dos celulares, não. A leitura é nativa: aproximou, abriu o link."
            />
            <FAQItem
              question="Posso ter mais de 1 perfil?"
              answer="Sim. No plano Pro você tem até 3 perfis e no Business, até 10."
            />
            <FAQItem
              question="Consigo replicar o design em todos?"
              answer="Sim. Você pode aplicar tema/layout/fonts de um perfil para os demais."
            />
          </div>

          {/* CTA FINAL */}
          <div className="text-center py-10 border-t border-white/5">
            <h3 className="text-2xl font-black tracking-tight mb-6">Comece agora seu perfil digital.</h3>
            <button
              type="button"
              onClick={handleStart}
              className="bg-white text-black px-10 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black/60"
            >
              Criar meu perfil
            </button>
          </div>

          {/* RODAPÉ MINIMAL */}
          <footer className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
              © 2024 LinkFlow
            </span>
            <div className="flex gap-6">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest cursor-pointer hover:text-white">
                Termos
              </span>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest cursor-pointer hover:text-white">
                Privacidade
              </span>
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;