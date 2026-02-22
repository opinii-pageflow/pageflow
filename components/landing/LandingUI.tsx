import React, { memo, useId, useState } from 'react';
import { Check, Minus, Plus, type LucideIcon } from 'lucide-react';
import clsx from 'clsx';

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  desc: string;
  className?: string;
};

type PricingCardProps = {
  plan: string;
  price: string;
  features: string[];
  highlighted?: boolean;
  ctaLabel: string;
  onCta: () => void;
  className?: string;
};

type FAQItemProps = {
  question: string;
  answer: string;
  defaultOpen?: boolean;
  className?: string;
};

export const FeatureCard = memo(function FeatureCard({
  icon: Icon,
  title,
  desc,
  className,
}: FeatureCardProps) {
  return (
    <div
      className={clsx(
        'p-8 rounded-[2rem] glass-neon-blue group relative overflow-hidden',
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/0 to-neon-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div
        className={clsx(
          'w-12 h-12 bg-neon-blue/10 rounded-2xl flex items-center justify-center text-neon-blue mb-6 border border-neon-blue/20 relative z-10',
          'group-hover:scale-110 group-hover:text-white transition-all duration-500 shadow-[0_0_20px_rgba(0,242,255,0.2)]'
        )}
        aria-hidden="true"
      >
        <Icon size={22} strokeWidth={1.5} />
      </div>

      <h4 className="text-lg font-black mb-2 text-white tracking-tight relative z-10">{title}</h4>
      <p className="text-zinc-500 text-sm leading-relaxed font-medium relative z-10 group-hover:text-zinc-400 transition-colors">{desc}</p>
    </div>
  );
});

export const PricingCard = memo(function PricingCard({
  plan,
  price,
  features,
  highlighted = false,
  ctaLabel,
  onCta,
  className,
}: PricingCardProps) {
  const isFree = price.toLowerCase() === 'grátis';

  return (
    <div
      className={clsx(
        'p-10 rounded-[2.5rem] transition-all duration-700 flex flex-col justify-between relative group overflow-hidden',
        highlighted
          ? 'glass-neon-blue border-neon-blue/40 shadow-[0_0_50px_rgba(0,242,255,0.15)] md:scale-105 z-10'
          : 'bg-black/40 border border-white/5 text-zinc-400 hover:border-neon-blue/20',
        className
      )}
    >
      {highlighted && (
        <div className="absolute -inset-24 bg-neon-blue/5 blur-[80px] rounded-full pointer-events-none" />
      )}

      {highlighted && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-neon-blue to-indigo-600 text-black text-[9px] font-black px-4 py-2 rounded-bl-2xl uppercase tracking-widest shadow-lg">
          Recomendado
        </div>
      )}

      <div className="relative z-10">
        <h4 className={clsx(
          "font-black text-[10px] uppercase tracking-[0.25em] mb-6",
          highlighted ? "text-neon-blue" : "text-zinc-500"
        )}>{plan}</h4>

        <div className="flex items-baseline gap-1 mb-10">
          <span className="text-5xl font-black tracking-tighter text-white">
            {price}
          </span>
          {!isFree && (
            <span className="text-[11px] opacity-40 font-black uppercase tracking-widest text-zinc-400">
              /mês
            </span>
          )}
        </div>

        <ul className="space-y-4 mb-12">
          {features.map((f, i) => (
            <li
              key={`${plan}-feat-${i}`}
              className="flex items-center gap-3 text-xs font-bold text-zinc-400 group-hover:text-zinc-300 transition-colors"
            >
              <div className={clsx(
                "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                highlighted ? "bg-neon-blue/20 text-neon-blue" : "bg-white/5 text-zinc-600"
              )}>
                <Check size={12} strokeWidth={3} />
              </div>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={onCta}
        className={clsx(
          'w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all relative z-10 active:scale-95',
          highlighted
            ? 'bg-gradient-to-r from-neon-blue to-indigo-600 text-black shadow-xl shadow-neon-blue/20 hover:shadow-neon-blue/40'
            : 'bg-zinc-900 text-zinc-300 border border-white/5 hover:border-neon-blue/30 hover:bg-zinc-800'
        )}
      >
        {ctaLabel}
      </button>
    </div>
  );
});

export const FAQItem = memo(function FAQItem({
  question,
  answer,
  defaultOpen = false,
  className,
}: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div className={clsx('border-b border-white/5 last:border-0 group', className)}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className={clsx(
          'w-full py-8 flex items-center justify-between text-left transition-all',
          'focus:outline-none'
        )}
      >
        <span
          className={clsx(
            'text-sm md:text-base font-black transition-all duration-300',
            isOpen ? 'text-neon-blue' : 'text-zinc-400 group-hover:text-zinc-200'
          )}
        >
          {question}
        </span>

        <div
          className={clsx(
            'w-8 h-8 rounded-full border border-white/5 flex items-center justify-center transition-all duration-500',
            isOpen ? 'bg-neon-blue text-black border-neon-blue rotate-180 shadow-[0_0_15px_rgba(0,242,255,0.4)]' : 'text-zinc-500 group-hover:border-neon-blue/50 group-hover:text-neon-blue'
          )}
          aria-hidden="true"
        >
          {isOpen ? <Minus size={14} /> : <Plus size={14} />}
        </div>
      </button>

      <div
        id={contentId}
        role="region"
        aria-label={question}
        className={clsx(
          'overflow-hidden transition-all duration-500 ease-in-out',
          isOpen ? 'max-h-96 pb-8 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <p className="text-zinc-500 text-sm leading-relaxed font-medium pr-12">{answer}</p>
      </div>
    </div>
  );
});