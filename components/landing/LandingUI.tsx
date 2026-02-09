import React from 'react';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';

export const FeatureCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-white/10 transition-all duration-300 group">
    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform border border-white/5">
      <Icon size={22} strokeWidth={1.5} />
    </div>
    <h4 className="text-xl font-bold mb-3 text-white tracking-tight">{title}</h4>
    <p className="text-zinc-500 text-sm leading-relaxed font-medium">{desc}</p>
  </div>
);

export const PricingCard = ({ plan, price, features, highlighted, ctaLabel, onCta }: any) => (
  <div className={clsx(
    "p-10 rounded-[2.5rem] border transition-all duration-500 flex flex-col justify-between relative overflow-hidden group",
    highlighted 
      ? "bg-zinc-900 border-blue-500/30 shadow-2xl shadow-blue-900/20 scale-105 z-10" 
      : "bg-black/40 border-white/5 text-zinc-400 hover:border-white/10"
  )}>
    {highlighted && (
      <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-black px-3 py-1.5 rounded-bl-2xl uppercase tracking-widest">
        Mais Escolhido
      </div>
    )}
    
    <div>
      <h4 className="font-black text-sm uppercase tracking-[0.2em] mb-4 opacity-70">{plan}</h4>
      <div className="flex items-baseline gap-1 mb-8">
        <span className={clsx("text-5xl font-black tracking-tighter", highlighted ? "text-white" : "text-zinc-300")}>{price}</span>
        {price !== 'Grátis' && <span className="text-xs opacity-50 font-bold uppercase">/mês</span>}
      </div>
      
      <ul className="space-y-4 mb-10">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-center gap-3 text-sm font-medium text-zinc-400">
            <div className={clsx("w-1.5 h-1.5 rounded-full", highlighted ? "bg-blue-500" : "bg-zinc-700")} />
            {f}
          </li>
        ))}
      </ul>
    </div>

    <button 
      onClick={onCta}
      className={clsx(
        "w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95",
        highlighted 
          ? "bg-white text-black hover:bg-zinc-200 shadow-xl shadow-white/5" 
          : "bg-white/5 text-white hover:bg-white/10 border border-white/5"
      )}
    >
      {ctaLabel}
    </button>
  </div>
);