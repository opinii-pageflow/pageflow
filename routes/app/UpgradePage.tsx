import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getStorage } from '../../lib/storage';
import { PLANS, PLAN_TYPES } from '../../lib/plans';
import TopBar from '../../components/common/TopBar';
import { Check, Zap, Shield, Rocket, Crown, ChevronRight, Star } from 'lucide-react';
import { BillingCycle } from '../../types';
import clsx from 'clsx';

const UpgradePage: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const data = getStorage();
  const client = data.clients.find(c => c.id === user?.clientId);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  const planIcons: Record<string, any> = {
    starter: Shield,
    pro: Zap,
    business: Rocket,
    enterprise: Crown
  };

  const calculatePrice = (basePrice: number) => {
    if (basePrice === 0) return 'Grátis';
    const price = billingCycle === 'yearly' ? basePrice * 0.8 : basePrice;
    return `R$ ${price.toFixed(0)}`;
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
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
            Escolha o Próximo <span className="text-zinc-600">Nível</span>
          </h1>
          
          <div className="pt-8 flex flex-col items-center gap-4">
             <div className="flex bg-zinc-900/60 p-1 rounded-2xl border border-white/5 shadow-2xl">
                <button 
                  onClick={() => setBillingCycle('monthly')}
                  className={clsx(
                    "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    billingCycle === 'monthly' ? "bg-white text-black" : "text-zinc-500 hover:text-white"
                  )}
                >
                  Mensal
                </button>
                <button 
                  onClick={() => setBillingCycle('yearly')}
                  className={clsx(
                    "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                    billingCycle === 'yearly' ? "bg-white text-black" : "text-zinc-500 hover:text-white"
                  )}
                >
                  Anual
                  <span className={clsx(
                    "text-[8px] px-1.5 py-0.5 rounded-full font-black",
                    billingCycle === 'yearly' ? "bg-blue-600 text-white" : "bg-blue-500/10 text-blue-400"
                  )}>-20%</span>
                </button>
             </div>
             <p className="text-zinc-500 text-sm font-medium">Economize com o faturamento anual.</p>
          </div>
        </header>

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
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-blue-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                    Mais Popular
                  </div>
                )}

                <div className="mb-8">
                  <div className={clsx(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-2xl",
                    isFeatured ? "bg-white text-blue-600" : "bg-white/5 text-zinc-400"
                  )}>
                    <Icon size={28} />
                  </div>
                  <h3 className={clsx("text-2xl font-black tracking-tight", isFeatured ? "text-white" : "text-zinc-100")}>
                    {plan.name}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className={clsx("text-4xl font-black", isFeatured ? "text-white" : "text-white")}>
                      {calculatePrice(plan.priceValue)}
                    </span>
                    {planId !== 'starter' && (
                      <span className={clsx("text-xs font-bold uppercase", isFeatured ? "text-blue-100/60" : "text-zinc-500")}>
                        /mês
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-4 mb-10">
                  <div className={clsx("text-[10px] font-black uppercase tracking-widest opacity-60", isFeatured ? "text-blue-100" : "text-zinc-500")}>
                    O que está incluído:
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-3">
                        <div className={clsx("p-1 rounded-full", isFeatured ? "bg-white/20" : "bg-white/5")}>
                          <Check size={12} className={isFeatured ? "text-white" : "text-blue-500"} />
                        </div>
                        <span className={clsx("text-xs font-medium", isFeatured ? "text-blue-50" : "text-zinc-400")}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  disabled={isCurrent}
                  onClick={() => alert(`Iniciando upgrade para ${plan.name} (${billingCycle})...`)}
                  className={clsx(
                    "w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2",
                    isCurrent 
                      ? "bg-white/5 text-zinc-600 border border-white/5 cursor-default" 
                      : isFeatured
                        ? "bg-white text-blue-600 hover:bg-zinc-100 shadow-xl"
                        : "bg-zinc-800 text-white hover:bg-zinc-700 border border-white/5"
                  )}
                >
                  {isCurrent ? 'Plano Atual' : 'Fazer Upgrade'}
                  {!isCurrent && <ChevronRight size={14} />}
                </button>
              </div>
            );
          })}
        </div>

        <footer className="mt-20 text-center">
          <p className="text-zinc-600 text-xs font-medium">
            Precisa de mais? Entre em contato para planos <span className="text-white">Custom Enterprise</span>.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default UpgradePage;