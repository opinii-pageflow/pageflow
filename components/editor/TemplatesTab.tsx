import React, { useMemo } from 'react';
import { Profile } from '../../types';
import {
  Check,
  Layout,
  Sparkles,
  Shield,
  Grid3X3,
  Rows3,
  Newspaper,
  RectangleHorizontal,
  PanelLeft,
  Grip,
  Image as ImageIcon,
  Tabs,
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

// helper bem simples pra “linhas” de texto do thumb
const Line: React.FC<{ w: string; o?: string }> = ({ w, o = 'bg-white/12' }) => (
  <div className={[w, 'h-1 rounded-full', o].join(' ')} />
);

const TemplatesTab: React.FC<Props> = ({ profile, onUpdate }) => {
  const templates: Tpl[] = useMemo(() => {
    const raw: Tpl[] = [
      // 1) HERO (capa forte + avatar sobreposto)
      {
        id: 'Hero Banner',
        label: 'Hero Banner',
        icon: <RectangleHorizontal size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="h-16 rounded-lg bg-white/12 border border-white/10" />
            <div className="-mt-5 mx-auto w-10 h-10 rounded-full bg-white/10 border border-white/15" />
            <div className="mt-2 flex flex-col items-center gap-1">
              <Line w="w-2/3" o="bg-white/16" />
              <Line w="w-1/2" o="bg-white/10" />
            </div>
            <div className="mt-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/8 border border-white/10" />
              ))}
            </div>
          </div>
        ),
      },

      // 2) COVER (capa média + lista)
      {
        id: 'Cover Clean',
        label: 'Cover Clean',
        icon: <ImageIcon size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="h-12 rounded-lg bg-white/12 border border-white/10" />
            <div className="-mt-4 mx-auto w-10 h-10 rounded-full bg-white/10 border border-white/15" />
            <div className="mt-2 flex flex-col items-center gap-1">
              <Line w="w-2/3" o="bg-white/16" />
              <Line w="w-1/2" o="bg-white/10" />
            </div>
            <div className="mt-4 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-4 rounded-lg bg-white/8 border border-white/10" />
              ))}
            </div>
          </div>
        ),
      },

      // 3) SPLIT LEFT (avatar lado + conteúdo)
      {
        id: 'Avatar Left',
        label: 'Avatar Left',
        icon: <PanelLeft size={14} />,
        preview: (
          <div className="h-full">
            <div className="flex gap-2 mt-2">
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15" />
              <div className="flex-1 pt-1 space-y-1">
                <Line w="w-4/5" o="bg-white/16" />
                <Line w="w-2/3" o="bg-white/10" />
                <div className="mt-2 h-6 rounded-lg bg-white/8 border border-white/10" />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-4 rounded-lg bg-white/8 border border-white/10" />
              ))}
            </div>
          </div>
        ),
      },

      // 4) MINIMAL (bem limpo)
      {
        id: 'Minimal Card',
        label: 'Minimal',
        icon: <Layout size={14} />,
        preview: (
          <div className="h-full flex flex-col items-center">
            <div className="mx-auto mt-2 w-10 h-10 rounded-full bg-white/10 border border-white/15" />
            <div className="mt-3 w-full px-1 space-y-2">
              <div className="h-9 rounded-xl bg-white/8 border border-white/10" />
              <div className="h-9 rounded-xl bg-white/8 border border-white/10" />
              <div className="h-9 rounded-xl bg-white/8 border border-white/10" />
            </div>
          </div>
        ),
      },

      // 5) GLASS (card interno)
      {
        id: 'Glassmorphism',
        label: 'Glass',
        icon: <Shield size={14} />,
        preview: (
          <div className="h-full p-2 rounded-xl bg-white/5 border border-white/10">
            <div className="h-10 rounded-lg bg-white/10 border border-white/10" />
            <div className="-mt-4 mx-auto w-9 h-9 rounded-full bg-white/10 border border-white/15" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/8 border border-white/10" />
              ))}
            </div>
          </div>
        ),
      },

      // 6) NEON (glow)
      {
        id: 'Neon',
        label: 'Neon',
        icon: <Sparkles size={14} />,
        preview: (
          <div className="h-full relative">
            <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-blue-400/15 blur-2xl" />
            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-purple-400/12 blur-2xl" />
            <div className="mx-auto mt-2 w-10 h-10 rounded-full bg-white/10 border border-blue-400/20" />
            <div className="mt-2 w-2/3 h-1 rounded-full bg-white/18 mx-auto" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-4 rounded-xl bg-white/8 border border-blue-400/15" />
              ))}
            </div>
          </div>
        ),
      },

      // 7) GRID 2x (botões grid)
      {
        id: 'Button Grid',
        label: 'Grid 2x',
        icon: <Grid3X3 size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="mx-auto mt-2 w-9 h-9 rounded-full bg-white/10 border border-white/15" />
            <div className="mt-2 w-2/3 h-1 rounded-full bg-white/18 mx-auto" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-8 rounded-xl bg-white/8 border border-white/10" />
              ))}
            </div>
          </div>
        ),
      },

      // 8) ICON GRID (3 col)
      {
        id: 'Icon Grid',
        label: 'Icon Grid',
        icon: <Grip size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="mx-auto mt-2 w-9 h-9 rounded-full bg-white/10 border border-white/15" />
            <div className="mt-3 grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-7 rounded-lg bg-white/8 border border-white/10" />
              ))}
            </div>
          </div>
        ),
      },

      // 9) MAGAZINE (editorial)
      {
        id: 'Magazine',
        label: 'Magazine',
        icon: <Newspaper size={14} />,
        preview: (
          <div className="h-full">
            <div className="h-12 rounded-lg bg-white/12 border border-white/10 mt-2" />
            <div className="mt-3 space-y-1">
              <Line w="w-4/5" o="bg-white/18" />
              <Line w="w-3/5" o="bg-white/10" />
              <Line w="w-2/5" o="bg-white/8" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="h-10 rounded-xl bg-white/8 border border-white/10" />
              <div className="h-10 rounded-xl bg-white/8 border border-white/10" />
            </div>
            <div className="mt-2 h-8 rounded-xl bg-white/8 border border-white/10" />
          </div>
        ),
      },

      // 10) CHIPS/TABS (diferente de todos)
      {
        id: 'Chips',
        label: 'Chips',
        icon: <Tabs size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="mx-auto mt-2 w-9 h-9 rounded-full bg-white/10 border border-white/15" />
            <div className="mt-3 flex gap-1">
              <div className="h-4 flex-1 rounded-full bg-white/10 border border-white/10" />
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
    ];

    // ✅ trava anti-duplicado por id
    const seen = new Set<string>();
    return raw.filter((tpl) => {
      const key = (tpl.id || '').trim();
      if (!key) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, []);

  const currentTpl = (profile.layoutTemplate || '').trim() || 'Minimal Card';

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-1 duration-300">
      <header className="flex items-center justify-between px-1">
        <h3 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">
          Biblioteca de Layouts
        </h3>
        <div className="text-[8px] font-black text-blue-400 uppercase tracking-widest bg-blue-400/5 px-2 py-0.5 rounded">
          {currentTpl}
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {templates.map((tpl) => {
          const active = currentTpl === tpl.id;
          return (
            <button
              key={tpl.id}
              onClick={() => onUpdate({ layoutTemplate: tpl.id })}
              className="group active:scale-95 transition-transform text-left"
              title={tpl.label}
              type="button"
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
