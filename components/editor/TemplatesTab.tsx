import React from 'react';
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
  Maximize2,
  Square
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

const ThumbShell: React.FC<{ active: boolean; label: string; icon: React.ReactNode; children: React.ReactNode }> = ({
  active,
  label,
  icon,
  children,
}) => {
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
  const templates: Tpl[] = [
    {
      id: 'Full Cover Hero',
      label: 'Full Cover Hero',
      icon: <Maximize2 size={14} />,
      preview: (
        <div className="h-full flex flex-col">
          <div className="h-full rounded-lg bg-white/15 border border-white/10 flex flex-col items-center justify-center p-2">
            <div className="w-8 h-8 rounded-full bg-white/20 border border-white/20 mb-2" />
            <div className="w-2/3 h-1 bg-white/20 rounded-full mb-1" />
            <div className="w-1/2 h-1 bg-white/10 rounded-full" />
          </div>
        </div>
      ),
    },
    {
      id: 'Dynamic Overlap',
      label: 'Dynamic Overlap',
      icon: <Square size={14} />,
      preview: (
        <div className="h-full flex flex-col">
          <div className="h-16 rounded-t-lg bg-white/15 border-x border-t border-white/10" />
          <div className="mx-2 -mt-4 flex-1 bg-zinc-900 border border-white/10 rounded-xl p-2">
            <div className="w-6 h-6 rounded-lg bg-white/10 mb-2" />
            <div className="w-full h-1 bg-white/10 rounded-full mb-1" />
            <div className="w-full h-3 bg-white/5 rounded-lg" />
          </div>
        </div>
      ),
    },
    {
      id: 'Cover Centered',
      label: 'Cover Centered',
      icon: <ImageIcon size={14} />,
      preview: (
        <div className="h-full flex flex-col">
          <div className="h-12 rounded-lg bg-white/10 border border-white/10 mb-2" />
          <div className="flex-1 flex flex-col items-center">
             <div className="w-10 h-10 rounded-full bg-white/10 border border-white/15 mb-2" />
             <div className="w-3/4 h-3 rounded-lg bg-white/5 border border-white/5" />
          </div>
        </div>
      ),
    },
    {
      id: 'Cover Clean',
      label: 'Cover Clean',
      icon: <ImageIcon size={14} />,
      preview: (
        <div className="h-full flex flex-col">
          <div className="h-10 rounded-lg bg-white/10 border border-white/10" />
          <div className="-mt-4 mx-auto w-10 h-10 rounded-full bg-white/10 border border-white/15" />
          <div className="mt-2 w-2/3 h-1 rounded-full bg-white/15 mx-auto" />
          <div className="mt-3 space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-3 rounded-xl bg-white/8 border border-white/10" />
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
          <div className="h-12 rounded-lg bg-white/10 border border-white/10" />
          <div className="-mt-3 mx-auto w-8 h-8 rounded-full bg-white/10 border border-white/15" />
          <div className="mt-2 w-2/3 h-1 rounded-full bg-white/15 mx-auto" />
          <div className="mt-3 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-3 rounded-xl bg-white/8 border border-white/10" />
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'Magazine',
      label: 'Magazine',
      icon: <Newspaper size={14} />,
      preview: (
        <div className="h-full">
          <div className="h-10 rounded-lg bg-white/10 border border-white/10 mt-2" />
          <div className="mt-3 w-3/4 h-1 rounded-full bg-white/15" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="h-8 rounded-xl bg-white/8 border border-white/10" />
            <div className="h-8 rounded-xl bg-white/8 border border-white/10" />
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
            <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/15" />
            <div className="flex-1 pt-1">
              <div className="w-3/4 h-1 rounded-full bg-white/15" />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-3 rounded-xl bg-white/8 border border-white/10" />
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'Button Grid',
      label: 'Button Grid',
      icon: <Grid3X3 size={14} />,
      preview: (
        <div className="h-full flex flex-col">
          <div className="mx-auto mt-2 w-9 h-9 rounded-full bg-white/10 border border-white/15" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-6 rounded-xl bg-white/8 border border-white/10" />
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'Minimal Card',
      label: 'Minimal Card',
      icon: <Layout size={14} />,
      preview: (
        <div className="h-full flex flex-col">
          <div className="mx-auto mt-2 w-9 h-9 rounded-full bg-white/10 border border-white/15" />
          <div className="mt-2 w-2/3 h-1 rounded-full bg-white/15 mx-auto" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-3 rounded-xl bg-white/8 border border-white/10" />
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'Glassmorphism',
      label: 'Glassmorphism',
      icon: <Shield size={14} />,
      preview: (
        <div className="h-full p-2 rounded-xl bg-white/5 border border-white/10">
          <div className="mx-auto mt-1 w-9 h-9 rounded-full bg-white/10 border border-white/15" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
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
            <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/15" />
            <div className="flex-1">
              <div className="w-3/4 h-1 rounded-full bg-white/15" />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-3 rounded-xl bg-white/8 border border-white/10" />
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'Creator',
      label: 'Creator',
      icon: <UserCircle2 size={14} />,
      preview: (
        <div className="h-full">
          <div className="h-6 rounded-lg bg-white/10 border border-white/10 mt-2" />
          <div className="-mt-3 mx-auto w-9 h-9 rounded-full bg-white/10 border border-white/15" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-7 rounded-xl bg-white/8 border border-white/10" />
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-1 duration-300">
      <header className="flex items-center justify-between px-1">
        <h3 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Biblioteca de Layouts</h3>
        <div className="text-[8px] font-black text-blue-400 uppercase tracking-widest bg-blue-400/5 px-2 py-0.5 rounded">
          {profile.layoutTemplate}
        </div>
      </header>

      <div className="grid grid-cols-4 gap-2">
        {templates.map((tpl) => {
          const active = profile.layoutTemplate === tpl.id;
          return (
            <button
              key={tpl.id}
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