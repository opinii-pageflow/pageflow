import React, { memo, useId, useState } from 'react';
import { Check, Minus, Plus, type LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

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

// Card de Recurso: Ícone, Título, Texto curto.
export const FeatureCard = memo(function FeatureCard({
  icon: Icon,
  title,
  desc,
  className,
}: FeatureCardProps) {
  return (
    <div
      className={clsx(
        'p-8 rounded-[1.5rem] border border-white/10 bg-zinc-900/30 hover:border-white/20 hover:bg-zinc-900/50 transition-all duration-300 group',
        'focus-within:border-white/25',
        className
      )}
    >
      <div
        className={clsx(
          'w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white mb-5 border border-white/5',
          'group-hover:scale-110 transition-transform'
        )}
        aria-hidden="true"
      >
        <Icon size={20} strokeWidth={1.5} />
      </div>

      <h4 className="text-lg font-bold mb-2 text-white tracking-tight">{title}</h4>
      <p className="text-zinc-500 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
  );
});

// Card de Preço: Simples, bullets limitados, destaque no Pro.
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
        'p-8 rounded-[2rem] border transition-all duration-300 flex flex-col justify-between relative',
        highlighted
          ? 'bg-white text-black border-white shadow-2xl md:scale-105 z-10'
          : 'bg-black border-white/10 text-zinc-400 hover:border-white/20',
        className
      )}
    >
      {highlighted && (
        <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-black px-3 py-1.5 rounded-bl-xl rounded-tr-[1.8rem] uppercase tracking-widest">
          Mais Escolhido
        </div>
      )}

      <div>
        <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-4 opacity-60">{plan}</h4>

        <div className="flex items-baseline gap-1 mb-8">
          <span
            className={clsx(
              'text-4xl font-black tracking-tighter',
              highlighted ? 'text-black' : 'text-white'
            )}
          >
            {price}
          </span>
          {!isFree && (
            <span className={clsx('text-[10px] opacity-50 font-bold uppercase', highlighted ? 'text-zinc-700' : 'text-zinc-500')}>
              /mês
            </span>
          )}
        </div>

        <ul className="space-y-3 mb-10">
          {features.map((f, i) => (
            <li
              key={`${plan}-feat-${i}`}
              className={clsx(
                'flex items-center gap-3 text-xs font-bold',
                highlighted ? 'text-zinc-800' : 'text-zinc-500'
              )}
            >
              <Check
                size={14}
                className={clsx(highlighted ? 'text-blue-600' : 'text-white')}
                aria-hidden="true"
              />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={onCta}
        className={clsx(
          'w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border',
          'active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/60 focus:ring-white/25',
          highlighted
            ? 'bg-black text-white border-black hover:bg-zinc-800'
            : 'bg-transparent text-white border-white/20 hover:bg-white/5 hover:border-white/40'
        )}
      >
        {ctaLabel}
      </button>
    </div>
  );
});

// FAQ Accordion: Minimalista (com acessibilidade)
export const FAQItem = memo(function FAQItem({
  question,
  answer,
  defaultOpen = false,
  className,
}: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div className={clsx('border-b border-white/5 last:border-0', className)}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className={clsx(
          'w-full py-6 flex items-center justify-between text-left group',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/60 focus:ring-white/20 rounded-lg'
        )}
      >
        <span
          className={clsx(
            'text-sm font-bold transition-colors',
            isOpen ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'
          )}
        >
          {question}
        </span>

        <div
          className={clsx(
            'text-zinc-500 transition-transform duration-300',
            isOpen && 'rotate-180 text-white'
          )}
          aria-hidden="true"
        >
          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </div>
      </button>

      <div
        id={contentId}
        role="region"
        aria-label={question}
        className={clsx(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <p className="text-zinc-500 text-xs leading-relaxed font-medium pr-8">{answer}</p>
      </div>
    </div>
  );
});
