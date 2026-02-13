import React from 'react';
import { Profile } from '../../types';
import { canUseTemplate } from '../../lib/permissions';
import { getStorage, getCurrentUser } from '../../lib/storage';
import {
  Check,
  Layout,
  Lock,
  ImageIcon,
  Maximize2,
  Square,
  RectangleHorizontal,
  Newspaper,
  PanelLeft,
  Grid3X3,
  Shield,
  Briefcase,
  UserCircle2
} from 'lucide-react';
import clsx from 'clsx';

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

const ThumbShell: React.FC<{ active: boolean; locked: boolean; label: string; icon: React.ReactNode; children: React.ReactNode }> = ({
  active,
  locked,
  label,
  icon,
  children,
}) => {
  return (
    <div
      className={clsx(
        'w-full aspect-[4/5] rounded-xl border transition-all relative overflow-hidden flex flex-col',
        active
          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
          : 'border-white/10 bg-zinc-950/40 hover:border-white/25',
        locked && 'opacity-60 grayscale-[0.5]'
      )}
    >
      {locked && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <div className="bg-zinc-900/80 p-1.5 rounded-lg border border-white/10 shadow-2xl">
            <Lock size={12} className="text-zinc-400" />
          </div>
        </div>
      )}
      <div className="px-2 pt-2 flex items-center justify-between">
        <div
          className={clsx(
            'w-6 h-6 rounded-lg flex items-center justify-center',
            active ? 'bg-blue-500/20 text-blue-200' : 'bg-white/5 text-white/70'
          )}
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
        className={clsx(
          'py-1 px-1 text-[8px] font-black uppercase tracking-[0.18em] text-center border-t',
          active ? 'border-blue-500/20 text-blue-200' : 'border-white/10 text-white/40'
        )}
      >
        {label}
      </div>
    </div>
  );
};

const TemplatesTab: React.FC<Props> = ({ profile, onUpdate }) => {
  const user = getCurrentUser();
  const data = getStorage();
  const client = data.clients.find(c => c.id === user?.clientId);

  const templates: Tpl[] = [
    { id: 'Minimal Card', label: 'Minimal Card', icon: <Layout size={14} />, preview: <div className="h-full flex flex-col items-center justify-center"><div className="w-8 h-8 rounded-full bg-white/10 mb-2" /><div className="w-full h-2 bg-white/5 rounded-full" /></div> },
    { id: 'Full Cover Hero', label: 'Full Hero', icon: <Maximize2 size={14} />, preview: <div className="h-full bg-white/10 rounded-lg" /> },
    { id: 'Dynamic Overlap', label: 'Overlap', icon: <Square size={14} />, preview: <div className="h-full flex flex-col"><div className="h-1/2 bg-white/10" /><div className="h-1/2 bg-zinc-900 border" /></div> },
    { id: 'Cover Centered', label: 'Centered', icon: <ImageIcon size={14} />, preview: <div className="h-full flex flex-col items-center justify-center"><div className="w-10 h-10 rounded-full bg-white/10" /></div> },
    { id: 'Magazine', label: 'Magazine', icon: <Newspaper size={14} />, preview: <div className="h-full grid grid-cols-2 gap-1"><div className="bg-white/10" /><div className="bg-white/5" /></div> },
    { id: 'Avatar Left', label: 'Avatar Left', icon: <PanelLeft size={14} />, preview: <div className="h-full flex gap-2"><div className="w-8 h-8 bg-white/10 rounded-lg" /><div className="flex-1 h-2 bg-white/5 mt-2" /></div> },
    { id: 'Button Grid', label: 'Grid', icon: <Grid3X3 size={14} />, preview: <div className="h-full grid grid-cols-2 gap-1 mt-2"><div className="h-4 bg-white/10" /><div className="h-4 bg-white/10" /></div> },
    { id: 'Glassmorphism', label: 'Glass', icon: <Shield size={14} />, preview: <div className="h-full bg-white/5 border border-white/10 backdrop-blur-sm" /> },
    { id: 'Corporate', label: 'Corporate', icon: <Briefcase size={14} />, preview: <div className="h-full space-y-2"><div className="h-2 bg-white/10 w-1/2" /><div className="h-6 bg-white/5" /></div> },
    { id: 'Creator', label: 'Creator', icon: <UserCircle2 size={14} />, preview: <div className="h-full flex flex-col items-center"><div className="w-10 h-10 rounded-full bg-white/10 mb-2" /><div className="w-full h-8 bg-white/5" /></div> }
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
          const locked = !canUseTemplate(client?.plan, tpl.id);

          return (
            <button
              key={tpl.id}
              disabled={locked}
              onClick={() => !locked && onUpdate({ layoutTemplate: tpl.id })}
              className={clsx(
                "group active:scale-95 transition-transform text-left",
                locked && "cursor-not-allowed"
              )}
            >
              <ThumbShell active={active} locked={locked} label={tpl.label} icon={tpl.icon}>
                {tpl.preview}
              </ThumbShell>
            </button>
          );
        })}
      </div>

      <div className="p-4 bg-zinc-950/30 border border-white/5 rounded-2xl">
        <p className="text-[9px] text-zinc-500 font-bold leading-relaxed uppercase tracking-wider text-center">
          Templates com <Lock size={8} className="inline mx-1" /> requerem plano Pro ou superior.
        </p>
      </div>
    </div>
  );
};

export default TemplatesTab;