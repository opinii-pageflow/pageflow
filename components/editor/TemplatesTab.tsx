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

      <div className="flex-1 p-2">
        <div className="w-full h-full rounded-lg bg-black/25 border border-white/5 overflow-hidden p-2">
          {children}
        </div>
      </div>

      <div
        className={[
          'px-2 pb-2 text-[8px] font-black uppercase tracking-widest',
          active ? 'text-blue-300' : 'text-white/40',
        ].join(' ')}
      >
        {label}
      </div>
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
            <div className="mt-3 grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-6 rounded-xl bg-white/8 border border-white/10" />
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
          <div className="h-full grid grid-cols-[18px_1fr] gap-2">
            <div className="rounded-lg border border-white/12 bg-white/6 flex flex-col items-center py-2 gap-2">
              <div className="w-3 h-3 rounded-full bg-white/18" />
              <div className="w-3 h-3 rounded-full bg-white/12" />
              <div className="w-3 h-3 rounded-full bg-white/12" />
              <div className="w-3 h-8 rounded-full bg-white/8 border border-white/10" />
            </div>
            <div className="flex flex-col">
              <div className="h-10 rounded-lg bg-white/10 border border-white/12" />
              <div className="mt-2 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-4 rounded-xl bg-white/8 border border-white/10" />
                ))}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'Big Avatar',
        label: 'Avatar Big',
        icon: <UserCircle2 size={14} />,
        preview: (
          <div className="h-full flex flex-col items-center">
            <div className="mt-2 w-16 h-16 rounded-full bg-gradient-to-b from-white/18 to-white/10 border border-white/22" />
            <div className="mt-2 w-3/4 h-1 rounded-full bg-white/22" />
            <div className="mt-1 w-1/2 h-1 rounded-full bg-white/12" />
            <div className="mt-3 w-full space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-4 rounded-xl bg-white/8 border border-white/10" />
              ))}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-6 rounded-xl bg-white/7 border border-white/10" />
                ))}
              </div>
            </div>
          </div>
        ),
      },

      // 3) Identidades visuais (Neon / Chips / Glass / Minimal)
      {
        id: 'Neon',
        label: 'Neon',
        icon: <Sparkles size={14} />,
        preview: (
          <div className="h-full relative">
            <div className="absolute -top-6 -left-6 w-28 h-28 rounded-full bg-blue-500/22 blur-2xl" />
            <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-fuchsia-500/20 blur-2xl" />
            <div className="h-12 rounded-lg bg-black/40 border border-blue-400/25 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.35),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(217,70,239,0.25),transparent_55%)]" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/6 to-transparent" />
            </div>
            <div className="-mt-4 mx-auto w-10 h-10 rounded-full bg-black/40 border border-blue-400/28" />
            <div className="mt-2 w-2/3 h-1 rounded-full bg-white/20 mx-auto" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-4 rounded-xl bg-black/30 border border-fuchsia-400/18" />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Chips',
        label: 'Chips',
        icon: <Rows3 size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="mx-auto mt-2 w-10 h-10 rounded-2xl bg-white/10 border border-white/15" />
            <div className="mt-3 flex flex-wrap gap-1 justify-center">
              {['Live', 'Links', 'Pix'].map((t) => (
                <div
                  key={t}
                  className="h-4 px-2 rounded-full bg-white/10 border border-white/12 text-[6px] font-black uppercase tracking-wider flex items-center"
                >
                  {t}
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 rounded-xl bg-white/8 border border-white/10" />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Glassmorphism',
        label: 'Glass',
        icon: <Layers size={14} />,
        preview: (
          <div className="h-full relative">
            <div className="absolute -top-6 left-6 w-24 h-24 rounded-full bg-blue-500/14 blur-2xl" />
            <div className="absolute -bottom-6 right-4 w-24 h-24 rounded-full bg-indigo-500/12 blur-2xl" />
            <div className="h-12 rounded-lg bg-white/10 border border-white/18 backdrop-blur-xl" />
            <div className="-mt-4 mx-auto w-10 h-10 rounded-full bg-white/10 border border-white/22 backdrop-blur-xl" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-4 rounded-xl bg-white/8 border border-white/16 backdrop-blur-xl" />
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="h-6 rounded-xl bg-white/6 border border-white/14 backdrop-blur-xl" />
              <div className="h-6 rounded-xl bg-white/6 border border-white/14 backdrop-blur-xl" />
            </div>
          </div>
        ),
      },
      {
        id: 'Minimal Card',
        label: 'Minimal',
        icon: <Layout size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="mt-2 w-3/4 h-2 rounded-full bg-white/14 mx-auto" />
            <div className="mt-2 w-1/2 h-1 rounded-full bg-white/10 mx-auto" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/7 border border-white/9" />
              ))}
            </div>
          </div>
        ),
      },

      // 4) Grid / Lista / Cards / Editorial
      {
        id: 'Button Grid',
        label: 'Grid (Buttons)',
        icon: <Grid3X3 size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="mt-2 w-10 h-10 rounded-2xl bg-white/10 border border-white/15" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-6 rounded-xl bg-white/8 border border-white/10" />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Icon Grid',
        label: 'Grid (Icons)',
        icon: <Grid3X3 size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="mt-2 grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center"
                >
                  <div className="w-3 h-3 rounded-full bg-white/14" />
                </div>
              ))}
            </div>
            <div className="mt-3 w-3/4 h-1 rounded-full bg-white/12 mx-auto" />
          </div>
        ),
      },
      {
        id: 'Two Columns',
        label: 'Two Columns',
        icon: <Columns2 size={14} />,
        preview: (
          <div className="h-full grid grid-cols-2 gap-2">
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 rounded-xl bg-white/8 border border-white/10" />
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-10 rounded-xl bg-white/10 border border-white/12" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-4 rounded-xl bg-white/7 border border-white/10" />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Button List Bold',
        label: 'Lista (Bold)',
        icon: <Rows3 size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="mt-2 flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/15" />
              <div className="flex-1">
                <div className="w-4/5 h-1.5 rounded-full bg-white/18" />
                <div className="w-1/2 h-1 rounded-full bg-white/10 mt-1" />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-5 rounded-2xl bg-white/8 border border-white/10" />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Stacked Cards',
        label: 'Cards',
        icon: <Layers size={14} />,
        preview: (
          <div className="h-full relative">
            <div className="absolute top-3 left-4 right-2 h-10 rounded-2xl bg-white/6 border border-white/10 rotate-[-2deg]" />
            <div className="absolute top-5 left-2 right-4 h-10 rounded-2xl bg-white/7 border border-white/10 rotate-[2deg]" />
            <div className="absolute top-7 left-3 right-3 h-12 rounded-2xl bg-white/10 border border-white/12" />
            <div className="absolute top-[78px] left-0 right-0 px-1 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-4 rounded-xl bg-white/7 border border-white/10" />
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
            <div className="mt-2 flex justify-between gap-2">
              <div className="h-4 w-1/3 rounded-full bg-white/10 border border-white/12" />
              <div className="h-4 w-1/3 rounded-full bg-white/8 border border-white/10" />
              <div className="h-4 w-1/3 rounded-full bg-white/8 border border-white/10" />
            </div>
            <div className="mt-3 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-5 rounded-full bg-white/8 border border-white/10" />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Magazine',
        label: 'Editorial / Magazine',
        icon: <Newspaper size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="h-10 rounded-lg bg-white/10 border border-white/12 grid grid-cols-3 gap-1 p-1">
              <div className="rounded-md bg-white/14" />
              <div className="rounded-md bg-white/8 col-span-2" />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-2">
                <div className="h-2 rounded bg-white/16" />
                <div className="h-2 rounded bg-white/10" />
                <div className="h-2 rounded bg-white/10" />
              </div>
              <div className="space-y-2">
                <div className="h-6 rounded-lg bg-white/8 border border-white/10" />
                <div className="h-6 rounded-lg bg-white/8 border border-white/10" />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-5 rounded-lg bg-white/8 border border-white/10" />
              ))}
            </div>
          </div>
        ),
      },

      // 5) Perfis “Pro / Corporate / Creator” (compatíveis com renderer)
      {
        id: 'Verified Pro',
        label: 'Verified Pro',
        icon: <Badge size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="mt-2 flex items-center justify-between">
              <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/15" />
              <div className="h-4 w-10 rounded-full bg-blue-500/20 border border-blue-400/25" />
            </div>
            <div className="mt-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 rounded-xl bg-white/8 border border-white/10" />
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="h-6 rounded-xl bg-white/7 border border-white/10" />
              <div className="h-6 rounded-xl bg-white/7 border border-white/10" />
              <div className="h-6 rounded-xl bg-white/7 border border-white/10" />
            </div>
          </div>
        ),
      },
      {
        id: 'Corporate',
        label: 'Corporate',
        icon: <Briefcase size={14} />,
        preview: (
          <div className="h-full">
            <div className="h-10 rounded-lg bg-white/10 border border-white/12 flex items-center gap-2 px-2">
              <div className="w-8 h-8 rounded-2xl bg-white/10 border border-white/15" />
              <div className="flex-1">
                <div className="w-4/5 h-1 rounded-full bg-white/18" />
                <div className="w-1/2 h-1 rounded-full bg-white/10 mt-1" />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 rounded-xl bg-white/8 border border-white/10" />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Avatar Left',
        label: 'Avatar Left',
        icon: <PanelLeft size={14} />,
        preview: (
          <div className="h-full">
            <div className="flex items-start gap-2 mt-2">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15" />
              <div className="flex-1 pt-1">
                <div className="w-4/5 h-1 rounded-full bg-white/18" />
                <div className="w-1/2 h-1 rounded-full bg-white/10 mt-1" />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/8 border border-white/10" />
              ))}
              <div className="mt-2 h-8 rounded-2xl bg-white/7 border border-white/10" />
            </div>
          </div>
        ),
      },
      {
        id: 'Creator',
        label: 'Creator',
        icon: <Sparkles size={14} />,
        preview: (
          <div className="h-full flex flex-col relative">
            <div className="h-12 rounded-lg bg-gradient-to-r from-fuchsia-500/18 via-purple-500/14 to-blue-500/16 border border-white/12 overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.10),transparent_40%,rgba(255,255,255,0.06))]" />
            </div>
            <div className="-mt-5 mx-auto w-12 h-12 rounded-full bg-white/12 border border-white/20" />
            <div className="mt-2 flex gap-1 justify-center">
              <div className="h-4 w-12 rounded-full bg-white/10 border border-white/12" />
              <div className="h-4 w-12 rounded-full bg-white/10 border border-white/12" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-7 rounded-2xl bg-white/8 border border-white/10" />
              ))}
            </div>
          </div>
        ),
      },
    ];

    // segurança: remove duplicados por id
    const seen = new Set<string>();
    return t.filter((tpl) => {
      const key = (tpl.id || '').trim();
      if (!key) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, []);

  const uniqueLabelOk = useMemo(() => {
    const seen = new Set<string>();
    return templates.every((tpl) => {
      const key = (tpl.label || '').trim().toLowerCase();
      if (!key) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [templates]);

  const currentTplId = (profile.layoutTemplate || '').trim() || 'Minimal Card';

  // Mostra o label do template quando conhecido; mantém compatibilidade se vier um id “antigo/desconhecido”.
  const currentTplLabel =
    templates.find((t) => t.id === currentTplId)?.label || currentTplId || 'Minimal Card';

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-1 duration-300">
      <header className="flex items-center justify-between px-1">
        <h3 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">
          Biblioteca de Layouts
        </h3>
        <div className="flex items-center gap-2">
          {!uniqueLabelOk ? (
            <div className="text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-300 border border-amber-400/20 px-2 py-0.5 rounded">
              Labels duplicados
            </div>
          ) : null}
          <div className="text-[8px] font-black text-blue-400 uppercase tracking-widest bg-blue-400/5 px-2 py-0.5 rounded">
            {currentTplLabel}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {templates.map((tpl) => {
          const active = (profile.layoutTemplate || 'Minimal Card').trim() === tpl.id;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onUpdate({ layoutTemplate: tpl.id })}
              className="group active:scale-95 transition-transform text-left"
              title={tpl.label}
            >
              <ThumbShell active={active} label={tpl.label} icon={tpl.icon}>
                {tpl.preview}
              </ThumbShell>
            </button>
          );
        })}
      </div>

      <div className="p-3 bg-zinc-950/30 border border-white/5 rounded-xl">
        <p className="text-[8px] text-zinc-600 font-bold leading-relaxed uppercase tracking-wider text-center">
          Selecione um preset estrutural acima
        </p>
      </div>
    </div>
  );
};

export default TemplatesTab;
