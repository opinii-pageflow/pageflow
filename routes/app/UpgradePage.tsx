import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientData } from '@/hooks/useClientData';
import { PLANS, PLAN_TYPES } from '@/lib/plans';
import TopBar from '@/components/common/TopBar';
import { Check, Zap, Shield, Rocket, Crown, ChevronRight, Star, Loader2, X, MessageCircle, Mail, User as UserIcon, Phone } from 'lucide-react';
import clsx from 'clsx';
import { upgradeRequestsApi } from '@/lib/api/upgradeRequests';

const UpgradePage: React.FC = () => {
  const navigate = useNavigate();
  const { client, loading, error, refresh } = useClientData();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Request State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: client?.name || '',
    email: client?.email || '',
    whatsapp: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleOpenModal = (planId: string) => {
    setSelectedPlan(planId);
    setFormData({
      name: client?.name || '',
      email: client?.email || '',
      whatsapp: ''
    });
    setSuccess(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !selectedPlan) return;

    setSubmitting(true);
    try {
      await upgradeRequestsApi.create({
        clientId: client.id,
        name: formData.name,
        email: formData.email,
        whatsapp: formData.whatsapp,
        requestedPlan: selectedPlan,
        requestSource: 'existing_client'
      });

      // Analytics
      import('@/lib/analytics').then(({ trackEvent }) => {
        trackEvent({
          clientId: client.id,
          profileId: 'system',
          type: 'lead_capture',
          assetId: `upgrade-request-${selectedPlan}`,
          assetType: 'form',
          assetLabel: `Upgrade Request: ${selectedPlan}`,
          source: 'upgrade_page'
        });
      });

      setSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error submitting upgrade request:', err);
      alert('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center p-6 text-center">
        <Rocket className="w-10 h-10 text-rose-500 mb-6 animate-pulse" />
        <h2 className="text-2xl font-black text-white uppercase italic mb-2 tracking-tighter">Upgrade Protocolo Offline</h2>
        <p className="text-zinc-500 mb-8 max-w-sm">{error}</p>
        <button onClick={() => refresh()} className="bg-white text-black px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all">Restaurar Conexão</button>
      </div>
    );
  }

  const planIcons: Record<string, any> = {
    starter: Shield,
    pro: Zap,
    business: Rocket,
    enterprise: Crown
  };

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
    <div className="min-h-screen bg-[#020202] text-white overflow-x-hidden pb-20">
      <TopBar title="Upgrade de Plano" showBack />

      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <main className="max-w-7xl mx-auto p-6 lg:p-10 pt-32 relative z-10">
        <header className="text-center mb-12 space-y-4 animate-in fade-in slide-in-from-top-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <Star size={14} className="text-blue-400 fill-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Impulsione seu Alcance</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">Escolha o Próximo <span className="text-zinc-600">Nível</span></h1>
        </header>

        {/* BILLING TOGGLE */}
        <div className="flex items-center justify-center gap-4 mb-16 animate-in fade-in duration-1000 delay-200">
          <span className={clsx("text-xs font-bold transition-colors", billingCycle === 'monthly' ? "text-white" : "text-zinc-500")}>Pagamento Mensal</span>
          <button
            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')}
            className="w-12 h-6 bg-zinc-800 rounded-full relative p-1 transition-all"
          >
            <div className={clsx("w-4 h-4 bg-white rounded-full transition-transform duration-300", billingCycle === 'annual' ? "translate-x-6" : "translate-x-0")} />
          </button>
          <div className="flex items-center gap-2">
            <span className={clsx("text-xs font-bold transition-colors", billingCycle === 'annual' ? "text-white" : "text-zinc-500")}>Anual</span>
            <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest">Economize 20%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLAN_TYPES.map((planId, idx) => {
            const plan = PLANS[planId];
            const isCurrent = client?.plan === planId;
            const Icon = planIcons[planId];
            const isFeatured = planId === 'business';

            return (
              <div
                key={planId}
                className={clsx(
                  "relative p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col group",
                  isFeatured
                    ? "bg-blue-600 border-blue-500 shadow-[0_0_50px_rgba(37,99,235,0.2)] lg:scale-105 z-10"
                    : "bg-zinc-900/40 border-white/5 hover:border-white/10"
                )}
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                {isFeatured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-blue-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Mais Popular</div>
                )}

                <div className="mb-8">
                  <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-2xl", isFeatured ? "bg-white text-blue-600" : "bg-white/5 text-zinc-400")}>
                    <Icon size={28} />
                  </div>
                  <h3 className={clsx("text-2xl font-black tracking-tight", isFeatured ? "text-white" : "text-zinc-100")}>{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-black">{getDisplayPrice(planId)}</span>
                    {planId !== 'starter' && (
                      <span className={clsx("text-xs font-bold uppercase", isFeatured ? "text-blue-100/60" : "text-zinc-500")}>/mês</span>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-4 mb-10">
                  <ul className="space-y-3">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-3">
                        <Check size={12} className={isFeatured ? "text-white" : "text-blue-500"} />
                        <span className={clsx("text-xs font-medium", isFeatured ? "text-blue-50" : "text-zinc-400")}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  disabled={isCurrent}
                  onClick={() => handleOpenModal(planId)}
                  className={clsx(
                    "w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2",
                    isCurrent
                      ? "bg-white/5 text-zinc-600 border border-white/5 cursor-default"
                      : isFeatured ? "bg-white text-blue-600 hover:bg-zinc-100 shadow-xl" : "bg-zinc-800 text-white hover:bg-zinc-700 border border-white/5"
                  )}
                >
                  {isCurrent ? 'Plano Atual' : 'Fazer Upgrade'}
                  {!isCurrent && <ChevronRight size={14} />}
                </button>
              </div>
            );
          })}
        </div>
      </main>

      {/* INTEREST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative my-8 animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-all bg-white/5 rounded-full"
            >
              <X size={20} />
            </button>

            {success ? (
              <div className="p-12 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Check className="text-emerald-500 w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black italic tracking-tighter">Protocolo Recebido</h3>
                  <p className="text-zinc-500 text-sm">Nossa equipe entrará em contato via WhatsApp em breve para ativar seu novo plano.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-8">
                <div className="space-y-3">
                  <div className="inline-flex bg-blue-500/10 text-blue-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-500/20">
                    Upgrade Request
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter italic">Quase lá!</h2>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    Para sua segurança e rapidez, o código de pagamento **PIX será enviado em até 12 horas** para seu WhatsApp.
                    <br /><br />
                    Após o pagamento, seu plano será **atualizado automaticamente em no máximo 2 horas**.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Seu Nome</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                      <input
                        type="text"
                        required
                        placeholder="Nome completo"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">E-mail de Contato</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                      <input
                        type="email"
                        required
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">WhatsApp</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                      <input
                        type="tel"
                        required
                        placeholder="(00) 00000-0000"
                        value={formData.whatsapp}
                        onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-500 transition-all active:scale-95 shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <MessageCircle size={16} />
                      Solicitar Contato
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UpgradePage;