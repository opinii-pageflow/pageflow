import React, { useMemo } from 'react';
import { Profile } from '../../types';
import {
  Check,
  Layout,
  Sparkles,
  ImageIcon,
  Columns2,
  UserCircle2,
  Layers,
  Maximize2,
  Grid3X3,
  Lock,
  Crown
} from 'lucide-react';
import clsx from 'clsx';
import { getStorage, getCurrentUser } from '../../lib/storage';
import { PLAN_RANK } from '../../lib/permissions';
import { PlanType } from '../../types';

interface Props {
  profile: Profile;
  clientPlan?: PlanType;
  onUpdate: (updates: Partial<Profile>) => void;
}

type Tpl = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  preview: React.ReactNode;
  minPlan: PlanType;
};

const TemplatesTab: React.FC<Props> = ({ profile, clientPlan, onUpdate }) => {
  const templates: Tpl[] = useMemo(() => {
    return [
      {
        id: 'Minimal Pro',
        label: 'Minimal Pro',
        description: 'Clean, focado no essencial e extremamente profissional.',
        minPlan: 'starter',
        icon: <Layout size={14} />,
        preview: (
          <div className="h-full flex flex-col gap-2">
            <div className="h-2 w-1/3 bg-white/20 rounded-full mx-auto" />
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 mx-auto" />
            <div className="space-y-2 mt-2">
              <div className="h-4 rounded-xl bg-white/10 border border-white/10" />
              <div className="h-4 rounded-xl bg-white/10 border border-white/10" />
            </div>
          </div>
        ),
      },
      {
        id: 'Full Cover Hero',
        label: 'Full Cover Hero',
        description: 'Capa expansiva e impacto visual imediato.',
        minPlan: 'starter',
        icon: <ImageIcon size={14} />,
        preview: (
          <div className="h-full flex flex-col relative -mx-2 -mt-2">
            <div className="h-20 rounded-b-2xl bg-gradient-to-br from-white/30 to-white/10 border-b border-white/20" />
            <div className="-mt-6 mx-auto w-12 h-12 rounded-2xl bg-white/20 border border-white/30 shadow-xl" />
            <div className="p-4 space-y-2">
              <div className="h-3 rounded-lg bg-white/10 w-full" />
              <div className="h-3 rounded-lg bg-white/10 w-full" />
            </div>
          </div>
        ),
      },
      {
        id: 'Split Modern',
        label: 'Split Modern',
        description: 'Layout assimétrico, moderno e dinâmico.',
        minPlan: 'pro',
        icon: <Columns2 size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="h-10 rounded-xl bg-white/10 border border-white/20 flex items-center px-3 gap-3">
              <div className="w-6 h-6 rounded-lg bg-white/20" />
              <div className="h-2 w-1/2 bg-white/10 rounded-full" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="h-12 rounded-xl bg-white/10 border border-white/10" />
              <div className="h-12 rounded-xl bg-white/10 border border-white/10" />
            </div>
          </div>
        ),
      },
      {
        id: 'Big Avatar Story',
        label: 'Big Avatar Story',
        description: 'Destaque total para sua imagem de perfil.',
        minPlan: 'pro',
        icon: <UserCircle2 size={14} />,
        preview: (
          <div className="h-full flex flex-col items-center pt-2">
            <div className="w-16 h-16 rounded-full border-2 border-blue-500 p-1">
              <div className="w-full h-full rounded-full bg-white/20" />
            </div>
            <div className="mt-3 w-3/4 h-2 bg-white/20 rounded-full" />
            <div className="mt-4 space-y-2 w-full">
              <div className="h-4 rounded-full bg-white/10 border border-white/10" />
            </div>
          </div>
        ),
      },
      {
        id: 'Neon Modern Dark',
        label: 'Neon Modern Dark',
        description: 'Vibrante, tecnológico e com alta profundidade.',
        minPlan: 'pro',
        icon: <Sparkles size={14} />,
        preview: (
          <div className="h-full flex flex-col p-2 bg-black/40 rounded-xl">
            <div className="h-12 rounded-lg border border-blue-500/30 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.2)] flex items-center justify-center">
              <div className="w-3/4 h-1 bg-blue-500/40 rounded-full" />
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-3 rounded-lg bg-white/5 border border-white/10" />
              <div className="h-3 rounded-lg bg-white/5 border border-white/10" />
            </div>
          </div>
        ),
      },
      {
        id: 'Stack Sections',
        label: 'Stack Sections',
        description: 'Visual modular por blocos. SaaS moderno e estruturado.',
        minPlan: 'business',
        icon: <Layers size={14} />,
        preview: (
          <div className="h-full flex flex-col gap-3 py-1">
            <div className="h-8 w-full bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-zinc-900 -mb-4" />
            </div>
            <div className="space-y-2 mt-2">
              <div className="h-8 rounded-xl bg-white/10 border border-white/10" />
              <div className="h-8 rounded-xl bg-white/10 border border-white/10" />
            </div>
          </div>
        ),
      },
      {
        id: 'Centered Hero',
        label: 'Centered Hero',
        description: 'Foco total na marca pessoal com impacto visual.',
        minPlan: 'business',
        icon: <Maximize2 size={14} />,
        preview: (
          <div className="h-full flex flex-col relative -mx-2 -mt-2">
            <div className="h-28 rounded-b-[2rem] bg-white/10 border-b border-white/10" />
            <div className="absolute top-16 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border-4 border-zinc-900 bg-white/20" />
            <div className="mt-8 px-4 space-y-2">
              <div className="h-3 w-1/2 bg-white/20 rounded-full mx-auto" />
              <div className="h-2 w-full bg-white/10 rounded-full mx-auto" />
            </div>
          </div>
        ),
      },
      {
        id: 'Card Grid Profile',
        label: 'Card Grid Profile',
        description: 'Layout interativo em grid. Visual dinâmico e funcional.',
        minPlan: 'business',
        icon: <Grid3X3 size={14} />,
        preview: (
          <div className="h-full flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20" />
              <div className="h-2 w-1/3 bg-white/10 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-10 rounded-xl bg-white/10 border border-white/10" />
              <div className="h-10 rounded-xl bg-white/10 border border-white/10" />
              <div className="h-14 col-span-2 rounded-xl bg-white/10 border border-white/10" />
            </div>
          </div>
        ),
      },
    ];
  }, []);

  const userPlan = clientPlan || 'starter';
  const currentRank = PLAN_RANK[userPlan];

  const selected = profile.layoutTemplate || 'Minimal Pro';

  const handleSelect = (tpl: Tpl) => {
    const isLocked = currentRank < PLAN_RANK[tpl.minPlan];
    const isCurrentlyUsed = selected === tpl.id;

    if (isLocked && !isCurrentlyUsed) {
      alert(`O template "${tpl.label}" está disponível a partir do plano ${tpl.minPlan.toUpperCase()}. Faça upgrade para desbloquear!`);
      return;
    }

    onUpdate({ layoutTemplate: tpl.id });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {templates.map((tpl) => {
          const active = selected === tpl.id;
          const isLocked = currentRank < PLAN_RANK[tpl.minPlan];

          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => handleSelect(tpl)}
              className={clsx(
                "group text-left focus:outline-none transition-all",
                isLocked && !active && "opacity-60 grayscale-[0.5]"
              )}
            >
              <div
                className={clsx(
                  "w-full rounded-[2rem] border transition-all duration-300 overflow-hidden flex flex-col relative",
                  active
                    ? "border-blue-500 bg-blue-600/5 shadow-2xl shadow-blue-500/10 ring-2 ring-blue-500/20"
                    : "border-white/5 bg-zinc-900/40 hover:border-white/20 hover:bg-zinc-900/60"
                )}
              >
                {isLocked && !active && (
                  <div className="absolute top-4 right-4 z-10 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-amber-400 transition-colors">
                    <Lock size={12} />
                  </div>
                )}

                <div className="p-4 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      "w-8 h-8 rounded-xl grid place-items-center border",
                      active ? "border-blue-500 bg-blue-500 text-white" : "border-white/10 bg-white/5 text-zinc-500"
                    )}>
                      {tpl.icon}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">
                          {tpl.label}
                        </span>
                        {isLocked && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[7px] font-black text-amber-500 uppercase tracking-tighter">
                            <Crown size={8} /> Pro
                          </span>
                        )}
                        {active && isLocked && (
                          <span className="text-[7px] font-bold text-blue-400 uppercase tracking-tighter bg-blue-500/10 px-1.5 py-0.5 rounded-md border border-blue-500/20">Em Uso</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {active && (
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check size={12} className="text-white" strokeWidth={4} />
                    </div>
                  )}
                </div>

                <div className="p-6 bg-black/20">
                  <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden bg-zinc-950/20 shadow-inner p-4 relative">
                    {tpl.preview}
                  </div>
                  <p className="mt-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                    {tpl.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TemplatesTab;
