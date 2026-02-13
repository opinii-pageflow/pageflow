import React, { useMemo } from 'react';
import { Profile } from '../../types';
import {
  Check,
  Layout,
  Sparkles,
  Shield,
  Briefcase,
  UserCircle2,
  Grid3X3,
  Rows3,
  Newspaper,
  RectangleHorizontal,
  PanelLeft,
  Layers,
  Grip,
  Image as ImageIcon,
  // ⚠️ Columns3 e BadgeCheck podem não existir dependendo da versão do lucide-react
  // Columns3,
  // BadgeCheck,
  Columns2,
  Badge,
} from 'lucide-react';

interface Props {
  profile: Profile;
  onUpdate: (updates: Partial<Profile>) => void;
}

type Tpl = {
  id: string;
  label: string;
  icon: React.ReactNode;
  preview: React.ReactNode;
};

const ThumbShell: React.FC<{
  active: boolean;
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ active, label, icon, children }) => {
  return (
    <div
      className={[
        'w-full aspect-[4/5] rounded-xl border transition-all relative overflow-hidden flex flex-col',
        active
          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
          : 'border-white/10 bg-zinc-950/40 hover:border-white/25',
      ].join(' ')}
    >
      <div className="px-2 pt-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className={[
              'w-6 h-6 rounded-lg grid place-items-center border',
              active ? 'border-blue-400/30 bg-blue-400/10' : 'border-white/10 bg-white/5',
            ].join(' ')}
          >
            {icon}
          </span>
          <span className="text-[9px] font-extrabold tracking-wider text-white/70 uppercase">
            {label}
          </span>
        </div>

        {active ? (
          <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-400/30 grid place-items-center">
            <Check size={12} className="text-blue-300" />
          </span>
        ) : (
          <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10" />
        )}
      </div>

      <div className="flex-1 p-2">{children}</div>
    </div>
  );
};

const TemplatesTab: React.FC<Props> = ({ profile, onUpdate }) => {
  const templates: Tpl[] = useMemo(() => {
    const t: Tpl[] = [
      /**
       * IMPORTANT:
       * - NÃO remover templates existentes (compatibilidade com perfis já criados).
       * - Pode adicionar novos ids, desde que o renderer tenha fallback (PublicProfileRenderer já tem).
       * - Previews aqui são “miniaturas” apenas (ThumbShell), mas devem ser visualmente bem diferentes.
       */

      // 1) Capa / Hero (capa mais presente e contrastada)
      {
        id: 'Cover Clean',
        label: 'Hero Cover (Clean)',
        icon: <ImageIcon size={14} />,
        preview: (
          <div className="h-full flex flex-col relative">
            <div className="h-14 rounded-lg bg-gradient-to-b from-white/30 via-white/16 to-white/8 border border-white/14 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.25),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.18),transparent_55%)]" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/25" />
            </div>
            <div className="-mt-6 mx-auto w-12 h-12 rounded-full bg-white/14 border border-white/22 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]" />
            <div className="mt-2 w-2/3 h-1 rounded-full bg-white/26 mx-auto" />
            <div className="mt-1 w-1/2 h-1 rounded-full bg-white/14 mx-auto" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-3 rounded-xl bg-white/9 border border-white/12"
                />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Hero Banner',
        label: 'Hero Cover (Banner)',
        icon: <RectangleHorizontal size={14} />,
        preview: (
          <div className="h-full flex flex-col relative">
            <div className="h-16 rounded-lg bg-gradient-to-r from-blue-500/22 via-indigo-500/18 to-purple-500/20 border border-white/12 relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.10),transparent_35%,rgba(255,255,255,0.06))]" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/35" />
            </div>
            <div className="-mt-5 mx-auto w-10 h-10 rounded-2xl bg-white/12 border border-white/20" />
            <div className="mt-2 w-3/4 h-1 rounded-full bg-white/24 mx-auto" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/9 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },

      {
        id: 'Full Cover',
        label: 'Full Cover (Edge)',
        icon: <ImageIcon size={14} />,
        preview: (
          <div className="h-full flex flex-col relative">
            <div className="h-24 -mx-2 -mt-2 rounded-b-2xl bg-gradient-to-b from-white/28 via-white/14 to-white/6 border border-white/12 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.20),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.18),transparent_55%)]" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/15 to-black/55" />
            </div>
            <div className="-mt-10 mx-auto w-14 h-14 rounded-2xl bg-white/14 border border-white/22 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]" />
            <div className="mt-2 w-2/3 h-1 rounded-full bg-white/24 mx-auto" />
            <div className="mt-1 w-1/2 h-1 rounded-full bg-white/12 mx-auto" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/9 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Full Cover Overlay',
        label: 'Full Cover (Overlay)',
        icon: <Layers size={14} />,
        preview: (
          <div className="h-full flex flex-col relative">
            <div className="h-24 -mx-2 -mt-2 rounded-b-2xl bg-gradient-to-r from-purple-500/18 via-blue-500/14 to-emerald-500/16 border border-white/12 relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.10),transparent_35%,rgba(255,255,255,0.06))]" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/60" />
            </div>
            <div className="-mt-10 mx-auto w-14 h-14 rounded-full bg-white/14 border border-white/22 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]" />
            <div className="mt-2 w-3/4 h-1 rounded-full bg-white/22 mx-auto" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/9 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },

      // 2) Split / Sidebar / Avatar grande (novos ids com fallback seguro no renderer público)
      {
        id: 'Split Header',
        label: 'Split',
        icon: <Columns2 size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="h-10 rounded-lg overflow-hidden border border-white/12 bg-white/10 grid grid-cols-2">
              <div className="bg-gradient-to-b from-blue-500/20 to-transparent" />
              <div className="bg-gradient-to-b from-white/10 to-transparent" />
            </div>
            <div className="-mt-4 mx-2 flex items-start gap-2">
              <div className="w-10 h-10 rounded-2xl bg-white/12 border border-white/18" />
              <div className="flex-1 pt-1">
                <div className="w-4/5 h-1 rounded-full bg-white/20" />
                <div className="w-1/2 h-1 rounded-full bg-white/10 mt-1" />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/9 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Sidebar',
        label: 'Sidebar',
        icon: <PanelLeft size={14} />,
        preview: (
          <div className="h-full grid grid-cols-[40%_1fr] gap-2">
            <div className="rounded-lg border border-white/12 bg-white/7 p-2 flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-white/12 border border-white/18" />
              <div className="w-4/5 h-1 rounded-full bg-white/18" />
              <div className="w-3/5 h-1 rounded-full bg-white/10" />
            </div>
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/9 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Big Avatar',
        label: 'Big Avatar',
        icon: <UserCircle2 size={14} />,
        preview: (
          <div className="h-full flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-white/14 border border-white/22 mt-4" />
            <div className="mt-3 w-3/4 h-1 rounded-full bg-white/24" />
            <div className="mt-1 w-1/2 h-1 rounded-full bg-white/12" />
            <div className="mt-4 space-y-2 w-full">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/9 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },

      // 3) Estilos / Efeitos
      {
        id: 'Neon',
        label: 'Neon',
        icon: <Sparkles size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="h-12 rounded-lg border border-white/12 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.20),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.16),transparent_55%)]" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/9 border border-white/12 shadow-[0_0_18px_rgba(59,130,246,0.10)]" />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Chips',
        label: 'Chips',
        icon: <Grip size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="mt-2 flex flex-wrap gap-2 justify-center">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-3 w-12 rounded-full bg-white/10 border border-white/14" />
              ))}
            </div>
            <div className="mt-4 h-10 rounded-lg bg-white/5 border border-white/10" />
          </div>
        ),
      },
      {
        id: 'Glassmorphism',
        label: 'Glass',
        icon: <Layers size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="h-12 rounded-lg bg-white/6 border border-white/12 backdrop-blur-xl" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/7 border border-white/12 backdrop-blur-xl" />
              ))}
            </div>
          </div>
        ),
      },

      // 4) Base / Minimal
      {
        id: 'Minimal Card',
        label: 'Minimal',
        icon: <Layout size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="h-10 rounded-lg bg-white/6 border border-white/12" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/9 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },

      // 5) Grid / Variantes de botões
      {
        id: 'Button Grid',
        label: 'Grid',
        icon: <Grid3X3 size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="grid grid-cols-2 gap-2 mt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 rounded-xl bg-white/9 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Icon Grid',
        label: 'Icon Grid',
        icon: <Grid3X3 size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="grid grid-cols-2 gap-2 mt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-white/9 border border-white/12 flex flex-col items-center justify-center gap-1">
                  <div className="w-5 h-5 rounded bg-white/10 border border-white/14" />
                  <div className="w-8 h-1 rounded-full bg-white/16" />
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Two Columns',
        label: '2 Cols',
        icon: <Columns2 size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="grid grid-cols-2 gap-2 mt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/9 border border-white/12" />
              ))}
            </div>
            <div className="mt-3 h-10 rounded-lg bg-white/6 border border-white/12" />
          </div>
        ),
      },

      // 6) Listas / Cards
      {
        id: 'Button List Bold',
        label: 'Bold List',
        icon: <Rows3 size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="space-y-2 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 rounded-2xl bg-white/10 border border-white/14" />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Stacked Cards',
        label: 'Stacked',
        icon: <Layers size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="space-y-2 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/9 border border-white/12" style={{ transform: `translateY(${Math.min(i, 4) * 2}px)` }} />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Rounded Pills',
        label: 'Pills',
        icon: <Grip size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="space-y-2 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-3 rounded-full bg-white/9 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },

      // 7) Editorial / Pro / Corporate
      {
        id: 'Magazine',
        label: 'Magazine',
        icon: <Newspaper size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="h-14 rounded-lg bg-white/6 border border-white/12" />
            <div className="-mt-5 ml-2 w-10 h-10 rounded-2xl bg-white/12 border border-white/20" />
            <div className="mt-2 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/9 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Verified Pro',
        label: 'Verified',
        icon: <Badge size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="h-12 rounded-lg bg-white/6 border border-white/12 flex items-center justify-between px-3">
              <div className="w-12 h-2 rounded-full bg-white/18" />
              <div className="w-7 h-7 rounded-full bg-white/10 border border-white/14" />
            </div>
            <div className="mt-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/9 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Corporate',
        label: 'Corporate',
        icon: <Briefcase size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="h-10 rounded-lg bg-white/6 border border-white/12 flex items-end gap-2 px-2 pb-2">
              <div className="w-8 h-8 rounded-2xl bg-white/12 border border-white/18" />
              <div className="flex-1">
                <div className="w-3/4 h-1 rounded-full bg-white/20" />
                <div className="w-1/2 h-1 rounded-full bg-white/10 mt-1" />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/9 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Avatar Left',
        label: 'Avatar Left',
        icon: <UserCircle2 size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="h-10 rounded-lg bg-white/6 border border-white/12 flex items-end gap-2 px-2 pb-2">
              <div className="w-8 h-8 rounded-full bg-white/12 border border-white/18" />
              <div className="flex-1">
                <div className="w-3/4 h-1 rounded-full bg-white/20" />
                <div className="w-1/2 h-1 rounded-full bg-white/10 mt-1" />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/9 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },

      // 8) Criador / Social
      {
        id: 'Creator',
        label: 'Creator',
        icon: <Shield size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="h-12 rounded-lg bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.20),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.16),transparent_55%)] border border-white/12" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 rounded-xl bg-white/9 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },
    ];

    return t;
  }, []);

  const selected = profile.layoutTemplate || 'Minimal Card';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {templates.map((tpl) => {
          const active = selected === tpl.id;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onUpdate({ layoutTemplate: tpl.id })}
              className="text-left"
            >
              <ThumbShell active={active} label={tpl.label} icon={tpl.icon}>
                {tpl.preview}
              </ThumbShell>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TemplatesTab;
