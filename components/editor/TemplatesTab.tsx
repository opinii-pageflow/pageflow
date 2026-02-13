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
  Columns2,
  Badge,
  SplitSquareVertical,
  UserRound,
  Cpu,
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
        <div
          className={[
            'w-6 h-6 rounded-lg flex items-center justify-center',
            active ? 'bg-blue-500/20 text-blue-200' : 'bg-white/5 text-white/70',
          ].join(' ')}
        >
          {icon}
        </div>
        {active && (
          <div className="bg-blue-500 text-white rounded-full p-0.5 shadow-sm">
            <Check size={10} />
          </div>
        )}
      </div>

      <div className="flex-1 px-2 pb-2 pt-1">{children}</div>

      <div
        className={[
          'py-1 px-1 text-[8px] font-black uppercase tracking-[0.18em] text-center border-t',
          active ? 'border-blue-500/20 text-blue-200' : 'border-white/10 text-white/40',
        ].join(' ')}
      >
        {label}
      </div>
    </div>
  );
};

const TemplatesTab: React.FC<Props> = ({ profile, onUpdate }) => {
  const templates: Tpl[] = useMemo(() => {
    const list: Tpl[] = [
      // ==== CAPA / HERO (capa bem presente) ====
      {
        id: 'Cover Clean',
        label: 'Cover Clean',
        icon: <ImageIcon size={14} />,
        preview: (
          <div className="h-full flex flex-col relative">
            <div className="h-14 rounded-lg bg-white/22 border border-white/15 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-black/10 to-black/40" />
              <div className="absolute -right-6 -top-6 w-16 h-16 rounded-full bg-blue-500/20 blur-2xl" />
            </div>
            <div className="-mt-6 mx-auto w-12 h-12 rounded-full bg-white/12 border border-white/20" />
            <div className="mt-2 w-2/3 h-1 rounded-full bg-white/24 mx-auto" />
            <div className="mt-1 w-1/2 h-1 rounded-full bg-white/14 mx-auto" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/9 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Hero Banner',
        label: 'Hero Banner',
        icon: <RectangleHorizontal size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="h-16 rounded-lg bg-white/22 border border-white/15 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/22 via-black/10 to-black/45" />
              <div className="absolute left-3 top-3 w-12 h-1 rounded-full bg-white/35" />
              <div className="absolute left-3 top-6 w-20 h-1 rounded-full bg-white/18" />
            </div>
            <div className="-mt-5 mx-auto w-10 h-10 rounded-full bg-white/12 border border-white/20" />
            <div className="mt-2 w-3/4 h-1 rounded-full bg-white/22 mx-auto" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/9 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Split Header',
        label: 'Split',
        icon: <SplitSquareVertical size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="mt-2 flex gap-2 items-start">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15" />
              <div className="flex-1">
                <div className="w-4/5 h-1 rounded-full bg-white/22" />
                <div className="w-1/2 h-1 rounded-full bg-white/12 mt-1" />
                <div className="mt-2 h-8 rounded-xl bg-white/8 border border-white/10" />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/8 border border-white/10" />
              ))}
            </div>
          </div>
        ),
      },

      // ==== AVATAR / PERFIL ====
      {
        id: 'Big Avatar',
        label: 'Avatar Big',
        icon: <UserRound size={14} />,
        preview: (
          <div className="h-full flex flex-col items-center">
            <div className="mt-2 w-16 h-16 rounded-[1.6rem] bg-white/10 border border-white/15" />
            <div className="mt-2 w-2/3 h-1 rounded-full bg-white/20" />
            <div className="mt-1 w-1/2 h-1 rounded-full bg-white/12" />
            <div className="mt-4 space-y-2 w-full">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/8 border border-white/10" />
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
            <div className="flex items-center gap-2 mt-2">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15" />
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15" />
              <div className="flex-1">
                <div className="w-3/4 h-1 rounded-full bg-white/18" />
                <div className="w-1/2 h-1 rounded-full bg-white/10 mt-1" />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 rounded-lg bg-white/8 border border-white/10" />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Creator',
        label: 'Creator',
        icon: <Cpu size={14} />,
        preview: (
          <div className="h-full relative">
            <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-purple-500/18 blur-2xl" />
            <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full bg-blue-500/16 blur-2xl" />
            <div className="mt-2 flex items-center gap-2">
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15" />
              <div className="flex-1">
                <div className="w-4/5 h-1 rounded-full bg-white/22" />
                <div className="w-1/2 h-1 rounded-full bg-white/12 mt-1" />
                <div className="mt-2 flex gap-1">
                  <div className="h-3 w-10 rounded-full bg-white/12 border border-white/10" />
                  <div className="h-3 w-14 rounded-full bg-white/8 border border-white/10" />
                  <div className="h-3 w-12 rounded-full bg-white/8 border border-white/10" />
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-6 rounded-xl bg-white/8 border border-white/10" />
              ))}
            </div>
          </div>
        ),
      },

      // ==== IDENTIDADE / ESTILO ====
      {
        id: 'Neon',
        label: 'Neon',
        icon: <Sparkles size={14} />,
        preview: (
          <div className="h-full relative">
            <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-blue-500/22 blur-2xl" />
            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-fuchsia-500/18 blur-2xl" />
            <div className="h-12 rounded-lg bg-white/10 border border-blue-400/25 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/25 to-transparent" />
            </div>
            <div className="-mt-4 mx-auto w-10 h-10 rounded-full bg-white/10 border border-blue-400/25" />
            <div className="mt-2 w-2/3 h-1 rounded-full bg-white/20 mx-auto" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-4 rounded-xl bg-white/8 border border-blue-400/18" />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Glassmorphism',
        label: 'Glass',
        icon: <Shield size={14} />,
        preview: (
          <div className="h-full p-2 rounded-xl bg-white/5 border border-white/10">
            <div className="mx-auto mt-1 w-10 h-10 rounded-[1.2rem] bg-white/10 border border-white/15" />
            <div className="mt-2 w-2/3 h-1 rounded-full bg-white/18 mx-auto" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/8 border border-white/10" />
              ))}
            </div>
            <div className="mt-3 h-8 rounded-2xl bg-white/7 border border-white/10" />
          </div>
        ),
      },
      {
        id: 'Verified Pro',
        label: 'Verified',
        icon: <Badge size={14} />,
        preview: (
          <div className="h-full">
            <div className="mt-2 flex items-center justify-center gap-2">
              <div className="w-11 h-11 rounded-full bg-white/10 border border-white/15" />
              <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-400/20 flex items-center justify-center">
                <Check size={12} className="text-blue-200" />
              </div>
            </div>
            <div className="mt-2 w-2/3 h-1 rounded-full bg-white/18 mx-auto" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/8 border border-white/10" />
              ))}
            </div>
          </div>
        ),
      },

      // ==== CHIPS / PILLS / LISTA ====
      {
        id: 'Chips',
        label: 'Chips',
        icon: <Rows3 size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="mx-auto mt-2 w-9 h-9 rounded-full bg-white/10 border border-white/15" />
            <div className="mt-3 flex gap-1">
              <div className="h-4 flex-1 rounded-full bg-white/12 border border-white/12" />
              <div className="h-4 flex-1 rounded-full bg-white/8 border border-white/10" />
              <div className="h-4 flex-1 rounded-full bg-white/8 border border-white/10" />
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
        id: 'Rounded Pills',
        label: 'Pills',
        icon: <Sparkles size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="mx-auto mt-2 w-11 h-11 rounded-full bg-white/10 border border-white/15" />
            <div className="mt-2 w-2/3 h-1 rounded-full bg-white/18 mx-auto" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-3 rounded-full bg-white/8 border border-white/10" />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Button List Bold',
        label: 'Lista Bold',
        icon: <Rows3 size={14} />,
        preview: (
          <div className="h-full">
            <div className="mx-auto mt-2 w-9 h-9 rounded-full bg-white/10 border border-white/15" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={[
                    'h-4 rounded-2xl bg-white/10 border border-white/12',
                    i % 2 === 0 ? 'rotate-[1deg]' : '-rotate-[1deg]',
                  ].join(' ')}
                />
              ))}
            </div>
          </div>
        ),
      },

      // ==== CARDS / STACK ====
      {
        id: 'Stacked Cards',
        label: 'Cards Stack',
        icon: <Layers size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="mx-auto mt-2 w-9 h-9 rounded-full bg-white/10 border border-white/15" />
            <div className="mt-2 w-2/3 h-1 rounded-full bg-white/18 mx-auto" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={['h-8 rounded-2xl bg-white/8 border border-white/10', i === 0 ? 'rotate-[1deg]' : i === 1 ? '-rotate-[1deg]' : 'rotate-[0.5deg]'].join(' ')}
                />
              ))}
            </div>
          </div>
        ),
      },

      // ==== EDITORIAL / MAGAZINE ====
      {
        id: 'Magazine',
        label: 'Editorial',
        icon: <Newspaper size={14} />,
        preview: (
          <div className="h-full">
            <div className="h-12 rounded-lg bg-white/14 border border-white/12 mt-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/30" />
            </div>
            <div className="mt-3 w-4/5 h-1 rounded-full bg-white/20" />
            <div className="mt-2 space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-1 rounded-full bg-white/8" />
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="h-10 rounded-xl bg-white/8 border border-white/10" />
              <div className="h-10 rounded-xl bg-white/8 border border-white/10" />
            </div>
          </div>
        ),
      },

      // ==== GRIDS ====
      {
        id: 'Button Grid',
        label: 'Grid',
        icon: <Grid3X3 size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="mx-auto mt-2 w-9 h-9 rounded-full bg-white/10 border border-white/15" />
            <div className="mt-2 w-2/3 h-1 rounded-full bg-white/18 mx-auto" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-7 rounded-xl bg-white/8 border border-white/10" />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Icon Grid',
        label: 'Icon Grid',
        icon: <Grip size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="mx-auto mt-2 w-9 h-9 rounded-full bg-white/10 border border-white/15" />
            <div className="mt-3 grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-6 rounded-lg bg-white/8 border border-white/10" />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Two Columns',
        label: '2 Colunas',
        icon: <Columns2 size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="mx-auto mt-2 w-9 h-9 rounded-full bg-white/10 border border-white/15" />
            <div className="mt-2 w-2/3 h-1 rounded-full bg-white/18 mx-auto" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-5 rounded-lg bg-white/8 border border-white/10" />
              ))}
            </div>
          </div>
        ),
      },

      // ==== FALLBACK CLÁSSICO ====
      {
        id: 'Minimal Card',
        label: 'Minimal Card',
        icon: <Layout size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="mx-auto mt-2 w-9 h-9 rounded-full bg-white/10 border border-white/15" />
            <div className="mt-2 w-2/3 h-1 rounded-full bg-white/18 mx-auto" />
            <div className="mt-1 w-1/2 h-1 rounded-full bg-white/10 mx-auto" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/8 border border-white/10" />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Profile Classic',
        label: 'Classic',
        icon: <UserCircle2 size={14} />,
        preview: (
          <div className="h-full flex flex-col items-center">
            <div className="mt-2 w-10 h-10 rounded-full bg-white/10 border border-white/15" />
            <div className="mt-2 w-3/4 h-1 rounded-full bg-white/18" />
            <div className="mt-1 w-1/2 h-1 rounded-full bg-white/10" />
            <div className="mt-4 space-y-2 w-full">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/8 border border-white/10" />
              ))}
            </div>
          </div>
        ),
      },
    ];

    // segurança: remove duplicados por id E por label (e mantém ordem estável)
    const seenId = new Set<string>();
    const seenLabel = new Set<string>();

    return list.filter((tpl) => {
      const id = (tpl.id || '').trim();
      const label = (tpl.label || '').trim();
      if (!id || !label) return false;

      const idKey = id.toLowerCase();
      const labelKey = label.toLowerCase();

      if (seenId.has(idKey)) return false;
      if (seenLabel.has(labelKey)) return false;

      seenId.add(idKey);
      seenLabel.add(labelKey);
      return true;
    });
  }, []);

  const tplIdRaw = (profile.layoutTemplate || '').trim();
  const currentTplId = tplIdRaw || 'Minimal Card';

  const currentTplLabel = useMemo(() => {
    const map = new Map<string, string>();
    templates.forEach(t => map.set(t.id, t.label));
    return map.get(currentTplId) || currentTplId || 'Minimal Card';
  }, [templates, currentTplId]);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-1 duration-300">
      <header className="flex items-center justify-between px-1">
        <h3 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">
          Biblioteca de Layouts
        </h3>
        <div className="text-[8px] font-black text-blue-400 uppercase tracking-widest bg-blue-400/5 px-2 py-0.5 rounded">
          {currentTplLabel || 'Minimal Card'}
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {templates.map((tpl) => {
          const active = currentTplId === tpl.id;
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
