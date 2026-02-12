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
        'p-8 rounded-[2rem] border border-blue-500/10 bg-zinc-900/20 backdrop-blur-sm hover:border-blue-500/30 hover:bg-blue-500/5 transition-all duration-500 group relative overflow-hidden',
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div
        className={clsx(
          'w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6 border border-blue-500/10 relative z-10',
          'group-hover:scale-110 group-hover:text-blue-300 transition-all duration-500 shadow-[0_0_20px_rgba(37,99,235,0.1)]'
        )}
        aria-hidden="true"
      >
        <Icon size={22} strokeWidth={1.5} />
      </div>

      <h4 className="text-lg font-bold mb-2 text-white tracking-tight relative z-10">{title}</h4>
      <p className="text-zinc-500 text-sm leading-relaxed font-medium relative z-10">{desc}</p>
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
        'p-10 rounded-[2.5rem] border transition-all duration-700 flex flex-col justify-between relative group overflow-hidden',
        highlighted
          ? 'bg-zinc-900/40 border-blue-500/30 shadow-[0_0_50px_rgba(37,99,235,0.15)] md:scale-105 z-10'
          : 'bg-black/40 border-white/5 text-zinc-400 hover:border-blue-500/20',
        className
      )}
    >
      {highlighted && (
        <div className="absolute -inset-24 bg-blue-600/5 blur-[80px] rounded-full pointer-events-none" />
      )}

      {highlighted && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-black px-4 py-2 rounded-bl-2xl uppercase tracking-widest shadow-lg">
          Recomendado
        </div>
      )}

      <div className="relative z-10">
        <h4 className={clsx(
          "font-black text-[10px] uppercase tracking-[0.25em] mb-6",
          highlighted ? "text-blue-400" : "text-zinc-500"
        )}>{plan}</h4>

        <div className="flex items-baseline gap-1 mb-10">
          <span className="text-5xl font-black tracking-tighter text-white">
            {price}
          </span>
          {!isFree && (
            <span className="text-[11px] opacity-40 font-bold uppercase tracking-widest text-zinc-400">
              /mês
            </span>
          )}
        </div>

        <ul className="space-y-4 mb-12">
          {features.map((f, i) => (
            <li
              key={`${plan}-feat-${i}`}
              className="flex items-center gap-3 text-xs font-semibold text-zinc-400 group-hover:text-zinc-300 transition-colors"
            >
              <div className={clsx(
                "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                highlighted ? "bg-blue-600/20 text-blue-400" : "bg-white/5 text-zinc-600"
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
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30'
            : 'bg-zinc-900 text-zinc-300 border border-white/5 hover:border-white/10 hover:bg-zinc-800'
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
            'text-sm md:text-base font-bold transition-all duration-300',
            isOpen ? 'text-blue-400' : 'text-zinc-400 group-hover:text-zinc-200'
          )}
        >
          {question}
        </span>

        <div
          className={clsx(
            'w-8 h-8 rounded-full border border-white/5 flex items-center justify-center transition-all duration-500',
            isOpen ? 'bg-blue-600 text-white border-blue-600 rotate-180' : 'text-zinc-500 group-hover:border-white/20'
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