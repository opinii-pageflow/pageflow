import React, { useState } from 'react';
import { Check, ChevronDown, Minus, Plus } from 'lucide-react';
import { clsx } from 'clsx';

// Card de Recurso: Icone, Título, Texto curto.
export const FeatureCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="p-8 rounded-[1.5rem] border border-white/10 bg-zinc-900/30 hover:border-white/20 hover:bg-zinc-900/50 transition-all duration-300 group">
    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform border border-white/5">
      <Icon size={20} strokeWidth={1.5} />
    </div>
    <h4 className="text-lg font-bold mb-2 text-white tracking-tight">{title}</h4>
    <p className="text-zinc-500 text-sm leading-relaxed font-medium">{desc}</p>
  </div>
);

// Card de Preço: Simples, bullets limitados, destaque no Pro.
export const PricingCard = ({ plan, price, features, highlighted, ctaLabel, onCta }: any) => (
  <div className={clsx(
    "p-8 rounded-[2rem] border transition-all duration-300 flex flex-col justify-between relative",
    highlighted 
      ? "bg-white text-black border-white shadow-2xl scale-105 z-10" 
      : "bg-black border-white/10 text-zinc-400 hover:border-white/20"
  )}>
    {highlighted && (
      <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-black px-3 py-1.5 rounded-bl-xl rounded-tr-[1.8rem] uppercase tracking-widest">
        Mais Escolhido
      </div>
    )}
    
    <div>
      <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-4 opacity-60">{plan}</h4>
      <div className="flex items-baseline gap-1 mb-8">
        <span className={clsx("text-4xl font-black tracking-tighter", highlighted ? "text-black" : "text-white")}>{price}</span>
        {price !== 'Grátis' && <span className="text-[10px] opacity-50 font-bold uppercase">/mês</span>}
      </div>
      
      <ul className="space-y-3 mb-10">
        {features.map((f: string, i: number) => (
          <li key={i} className={clsx("flex items-center gap-3 text-xs font-bold", highlighted ? "text-zinc-800" : "text-zinc-500")}>
            <Check size={14} className={highlighted ? "text-blue-600" : "text-white"} />
            {f}
          </li>
        ))}
      </ul>
    </div>

    <button 
      onClick={onCta}
      className={clsx(
        "w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 border",
        highlighted 
          ? "bg-black text-white border-black hover:bg-zinc-800" 
          : "bg-transparent text-white border-white/20 hover:bg-white/5 hover:border-white/40"
      )}
    >
      {ctaLabel}
    </button>
  </div>
);

// FAQ Accordion: Minimalista
export const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/5 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className={clsx("text-sm font-bold transition-colors", isOpen ? "text-white" : "text-zinc-400 group-hover:text-zinc-200")}>
          {question}
        </span>
        <div className={clsx("text-zinc-500 transition-transform duration-300", isOpen && "rotate-180 text-white")}>
           {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </div>
      </button>
      <div className={clsx(
        "overflow-hidden transition-all duration-300 ease-in-out",
        isOpen ? "max-h-40 pb-6 opacity-100" : "max-h-0 opacity-0"
      )}>
        <p className="text-zinc-500 text-xs leading-relaxed font-medium pr-8">{answer}</p>
      </div>
    </div>
  );
};