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
    const t: Tpl[] = [
      // 1) foco na capa (capa menos apagada: bg/12 -> bg/18 e overlay de “brilho”)
      {
        id: 'Cover Clean',
        label: 'Cover Clean',
        icon: <ImageIcon size={14} />,
        preview: (
          <div className="h-full flex flex-col relative">
            <div className="h-12 rounded-lg bg-white/18 border border-white/12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
            </div>
            <div className="-mt-5 mx-auto w-11 h-11 rounded-full bg-white/12 border border-white/18" />
            <div className="mt-2 w-2/3 h-1 rounded-full bg-white/22 mx-auto" />
            <div className="mt-1 w-1/2 h-1 rounded-full bg-white/12 mx-auto" />
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
            <div className="h-14 rounded-lg bg-white/18 border border-white/12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
            </div>
            <div className="-mt-4 mx-auto w-9 h-9 rounded-full bg-white/12 border border-white/18" />
            <div className="mt-2 w-3/4 h-1 rounded-full bg-white/22 mx-auto" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/9 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },

      // ✅ NOVO: Neon (thumb diferente e claro)
      {
        id: 'Neon',
        label: 'Neon',
        icon: <Sparkles size={14} />,
        preview: (
          <div className="h-full relative">
            <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-blue-500/20 blur-2xl" />
            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-purple-500/18 blur-2xl" />
            <div className="h-12 rounded-lg bg-white/10 border border-blue-400/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-transparent" />
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

      // ✅ NOVO: Chips (thumb realmente diferente)
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

      // 2) avatar à esquerda / corporativo
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

      // 3) grid
      {
        id: 'Button Grid',
        label: 'Button Grid',
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

      // 4) lista bold
      {
        id: 'Button List Bold',
        label: 'Button List Bold',
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

      // 5) cards empilhados
      {
        id: 'Stacked Cards',
        label: 'Stacked Cards',
        icon: <Layers size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="mx-auto mt-2 w-9 h-9 rounded-full bg-white/10 border border-white/15" />
            <div className="mt-2 w-2/3 h-1 rounded-full bg-white/18 mx-auto" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-7 rounded-2xl bg-white/8 border border-white/10" />
              ))}
            </div>
          </div>
        ),
      },

      // 6) “pílulas”
      {
        id: 'Rounded Pills',
        label: 'Rounded Pills',
        icon: <Sparkles size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="mx-auto mt-2 w-11 h-11 rounded-full bg-white/10 border border-white/15" />
            <div className="mt-2 w-2/3 h-1 rounded-full bg-white/18 mx-auto" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-3 rounded-full bg-white/8 border border-white/10" />
              ))}
            </div>
          </div>
        ),
      },

      // 7) revista
      {
        id: 'Magazine',
        label: 'Magazine',
        icon: <Newspaper size={14} />,
        preview: (
          <div className="h-full">
            <div className="h-11 rounded-lg bg-white/12 border border-white/10 mt-2" />
            <div className="mt-3 w-4/5 h-1 rounded-full bg-white/18" />
            <div className="mt-2 space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-1 rounded-full bg-white/7" />
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="h-9 rounded-xl bg-white/8 border border-white/10" />
              <div className="h-9 rounded-xl bg-white/8 border border-white/10" />
            </div>
          </div>
        ),
      },

      // 8) premium / “verificado” (sem BadgeCheck pra não quebrar)
      {
        id: 'Verified Pro',
        label: 'Verified Pro',
        icon: <Badge size={14} />,
        preview: (
          <div className="h-full">
            <div className="mt-2 flex items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/15" />
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

      // 9) fallback clássico
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

      // 10) “glass”
      {
        id: 'Glassmorphism',
        label: 'Glassmorphism',
        icon: <Shield size={14} />,
        preview: (
          <div className="h-full p-2 rounded-xl bg-white/5 border border-white/10">
            <div className="mx-auto mt-1 w-9 h-9 rounded-full bg-white/10 border border-white/15" />
            <div className="mt-2 w-2/3 h-1 rounded-full bg-white/18 mx-auto" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/8 border border-white/10" />
              ))}
            </div>
          </div>
        ),
      },

      // 11) dois blocos/colunas (troquei Columns3 por Columns2 pra não quebrar)
      {
        id: 'Two Columns',
        label: 'Two Columns',
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
