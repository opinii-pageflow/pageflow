import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

export const FeatureCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/20 hover:border-white/10 transition-all group">
    <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
      <Icon size={20} />
    </div>
    <h4 className="text-lg font-bold mb-2 text-white">{title}</h4>
    <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

export const PricingCard = ({ plan, price, features, highlighted, ctaLabel, onCta }: any) => (
  <div className={clsx(
    "p-8 rounded-[2.5rem] border transition-all flex flex-col justify-between",
    highlighted 
      ? "bg-white text-black border-white shadow-2xl scale-105 z-10" 
      : "bg-zinc-900/40 border-white/5 text-white"
  )}>
    <div>
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-black text-xs uppercase tracking-widest opacity-60">{plan}</h4>
        {highlighted && (
          <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest">
            Mais Escolhido
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1 mb-8">
        <span className="text-4xl font-black">{price}</span>
        <span className="text-[10px] opacity-40 uppercase font-black">/mês</span>
      </div>
      <ul className="space-y-4 mb-10">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-center gap-3 text-xs font-medium">
            <Check size={14} className={highlighted ? "text-blue-600" : "text-emerald-500"} />
            {f}
          </li>
        ))}
      </ul>
    </div>
    <button 
      onClick={onCta}
      className={clsx(
        "w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95",
        highlighted ? "bg-black text-white hover:opacity-90" : "bg-white text-black hover:bg-zinc-200"
      )}
    >
      {ctaLabel}
    </button>
  </div>
);

export const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/5">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-base font-bold text-zinc-300 group-hover:text-white transition-colors">{question}</span>
        <ChevronDown className={clsx("text-zinc-600 transition-transform", isOpen && "rotate-180")} size={20} />
      </button>
      <div className={clsx(
        "overflow-hidden transition-all duration-300",
        isOpen ? "max-h-40 pb-6 opacity-100" : "max-h-0 opacity-0"
      )}>
        <p className="text-zinc-500 text-sm leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};