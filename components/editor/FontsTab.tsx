import React, { useMemo } from 'react';
import { Profile, PlanType } from '../../types';
import { Check, Type, MousePointer2, AlignLeft, Lock, Crown } from 'lucide-react';
import clsx from 'clsx';
import { getStorage, getCurrentUser } from '../../lib/storage';
import { PLAN_RANK } from '../../lib/permissions';

interface Props {
  profile: Profile;
  clientPlan?: PlanType;
  onUpdate: (updates: Partial<Profile>) => void;
}

const headingFonts = [
  'Poppins', 'Montserrat', 'Oswald',
  'Space Grotesk', 'Playfair Display', 'Bebas Neue',
  'Cinzel', 'Abril Fatface', 'Plus Jakarta Sans'
];

const bodyFonts = [
  'Inter', 'Roboto', 'Nunito',
  'Source Sans 3', 'Lato', 'DM Sans',
  'Open Sans', 'Work Sans', 'IBM Plex Sans'
];

const buttonFonts = [
  'Inter', 'Montserrat', 'Space Grotesk',
  'Sora', 'Rubik', 'Rajdhani',
  'Manrope', 'Exo 2', 'Outfit'
];

const getFontMinPlan = (index: number): PlanType => {
  if (index < 4) return 'starter';
  if (index < 7) return 'pro';
  return 'business';
};

interface FontCardProps {
  font: string;
  isSelected: boolean;
  isLocked: boolean;
  onClick: () => void;
  previewText?: string;
  minPlan: PlanType;
}

const FontCard: React.FC<FontCardProps> = ({ font, isSelected, isLocked, onClick, previewText = "THE QUICK BROWN FOX", minPlan }) => (
  <button
    onClick={onClick}
    className={clsx(
      "relative group p-5 rounded-2xl border-2 text-left transition-all duration-300 overflow-hidden",
      isSelected
        ? "border-blue-500 bg-blue-600/5 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/30"
        : "border-white/5 bg-zinc-900/40 hover:border-white/20 hover:bg-zinc-900/60 hover:scale-[1.03] hover:shadow-xl hover:shadow-black/20",
      isLocked && !isSelected && "opacity-60 grayscale-[0.5]"
    )}
  >
    <div className="flex justify-between items-start mb-3">
      <div className="flex flex-col gap-1">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-zinc-400">
          {font}
        </span>
        {isLocked && (
          <span className="flex items-center gap-1 w-fit px-1 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[6px] font-black text-amber-500 uppercase tracking-tighter">
            <Crown size={6} /> {minPlan.toUpperCase()}
          </span>
        )}
        {isSelected && isLocked && (
          <span className="text-[6px] font-bold text-blue-400 uppercase tracking-tighter bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/20 w-fit">Em Uso</span>
        )}
      </div>

      {isSelected ? (
        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center animate-in zoom-in-50 duration-300">
          <Check size={10} className="text-white" strokeWidth={4} />
        </div>
      ) : isLocked && (
        <div className="text-zinc-500 group-hover:text-amber-400 transition-colors">
          <Lock size={12} />
        </div>
      )}
    </div>

    <div
      className="text-lg leading-tight truncate text-white"
      style={{ fontFamily: font }}
    >
      {previewText}
    </div>

    {/* Subtle glow on hover */}
    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
  </button>
);

const FontsTab: React.FC<Props> = ({ profile, clientPlan, onUpdate }) => {
  const userPlan = clientPlan || 'starter';
  const currentRank = PLAN_RANK[userPlan];

  const currentFonts = (profile as any).fonts || {
    headingFont: 'Poppins',
    bodyFont: 'Inter',
    buttonFont: 'Inter'
  };

  const updateFonts = (updates: Partial<typeof currentFonts>, index: number) => {
    const minPlan = getFontMinPlan(index);
    const isLocked = currentRank < PLAN_RANK[minPlan];

    // Allow if already selected (downgrade case)
    const [fontKey, fontValue] = Object.entries(updates)[0] as [keyof typeof currentFonts, string];
    const isCurrentlyUsed = currentFonts[fontKey] === fontValue;

    if (isLocked && !isCurrentlyUsed) {
      alert(`Esta fonte está disponível a partir do plano ${minPlan.toUpperCase()}. Faça upgrade para desbloquear!`);
      return;
    }

    onUpdate({ fonts: { ...currentFonts, ...updates } });
  };

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      {/* Headings */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
            <Type size={16} />
          </div>
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Fonte dos Títulos</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {headingFonts.map((font, idx) => {
            const minPlan = getFontMinPlan(idx);
            const isLocked = currentRank < PLAN_RANK[minPlan];
            return (
              <FontCard
                key={font}
                font={font}
                isSelected={currentFonts.headingFont === font}
                isLocked={isLocked}
                minPlan={minPlan}
                onClick={() => updateFonts({ headingFont: font }, idx)}
              />
            );
          })}
        </div>
      </section>

      {/* Body */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <AlignLeft size={16} />
          </div>
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Fonte do Corpo</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bodyFonts.map((font, idx) => {
            const minPlan = getFontMinPlan(idx);
            const isLocked = currentRank < PLAN_RANK[minPlan];
            return (
              <FontCard
                key={font}
                font={font}
                isSelected={currentFonts.bodyFont === font}
                isLocked={isLocked}
                minPlan={minPlan}
                onClick={() => updateFonts({ bodyFont: font }, idx)}
                previewText="A quick brown fox jumps..."
              />
            );
          })}
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
            <MousePointer2 size={16} />
          </div>
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Fonte dos Botões</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buttonFonts.map((font, idx) => {
            const minPlan = getFontMinPlan(idx);
            const isLocked = currentRank < PLAN_RANK[minPlan];
            return (
              <FontCard
                key={font}
                font={font}
                isSelected={currentFonts.buttonFont === font}
                isLocked={isLocked}
                minPlan={minPlan}
                onClick={() => updateFonts({ buttonFont: font }, idx)}
                previewText="CLICK HERE NOW"
              />
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default FontsTab;
