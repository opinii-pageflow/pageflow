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
  UserCircle2,
  Zap,
  Smartphone,
  Layers,
  LayoutGrid,
  Grip,
  Rows3,
  Palette
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
};

const ThumbShell: React.FC<{ active: boolean; locked: boolean; label: string; icon: React.ReactNode }> = ({
  active,
  locked,
  label,
  icon,
}) => {
  return (
    <div
      className={clsx(
        'w-full aspect-square rounded-2xl border transition-all relative overflow-hidden flex flex-col items-center justify-center gap-2 p-2',
        active
          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
          : 'border-white/10 bg-zinc-950/40 hover:border-white/25',
        locked && 'opacity-60 grayscale-[0.5]'
      )}
    >
      {locked && (
        <div className="absolute top-2 right-2 z-10">
          <Lock size={10} className="text-zinc-500" />
        </div>
      )}
      
      <div className={clsx(
        'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
        active ? 'bg-blue-500 text-white' : 'bg-white/5 text-zinc-500 group-hover:text-zinc-300'
      )}>
        {icon}
      </div>

      <div className={clsx(
        'text-[8px] font-black uppercase tracking-widest text-center truncate w-full px-1',
        active ? 'text-blue-400' : 'text-zinc-600'
      )}>
        {label}
      </div>

      {active && (
        <div className="absolute top-2 left-2 text-blue-500">
          <Check size={12} strokeWidth={4} />
        </div>
      )}
    </div>
  );
};

const TemplatesTab: React.FC<Props> = ({ profile, onUpdate }) => {
  const user = getCurrentUser();
  const data = getStorage();
  const client = data.clients.find(c => c.id === user?.clientId);

  const templates: Tpl[] = [
    // Essenciais / Starter
    { id: 'Minimal Card', label: 'Minimal Card', icon: <Layout size={20} /> },
    { id: 'Button List Bold', label: 'Bold List', icon: <Rows3 size={20} /> },
    { id: 'Avatar Left', label: 'Avatar Left', icon: <PanelLeft size={20} /> },
    { id: 'Corporate', label: 'Corporate', icon: <Briefcase size={20} /> },
    { id: 'Button Grid', label: 'Button Grid', icon: <Grid3X3 size={20} /> },
    { id: 'Light Clean', label: 'Light Clean', icon: <Palette size={20} /> },
    
    // Pro / Premium (Capa e Estilo)
    { id: 'Full Cover Hero', label: 'Full Hero', icon: <Maximize2 size={20} /> },
    { id: 'Dynamic Overlap', label: 'Overlap', icon: <Square size={20} /> },
    { id: 'Cover Centered', label: 'Centered', icon: <ImageIcon size={20} /> },
    { id: 'Cover Clean', label: 'Cover Clean', icon: <ImageIcon size={20} /> },
    { id: 'Hero Banner', label: 'Hero Banner', icon: <RectangleHorizontal size={20} /> },
    { id: 'Magazine', label: 'Magazine', icon: <Newspaper size={20} /> },
    { id: 'Glassmorphism', label: 'Glass', icon: <Shield size={20} /> },
    { id: 'Creator', label: 'Creator', icon: <UserCircle2 size={20} /> },
    { id: 'Neon', label: 'Neon', icon: <Zap size={20} /> },
    { id: 'Dark Elegant', label: 'Elegant', icon: <Smartphone size={20} /> },
    { id: 'Stacked Cards', label: 'Stacked', icon: <Layers size={20} /> },
    { id: 'Icon Grid', label: 'Icon Grid', icon: <LayoutGrid size={20} /> },
    { id: 'Split Header', label: 'Split Header', icon: <Grip size={20} /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-1 duration-300">
      <header className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Biblioteca de Layouts</h3>
          <p className="text-xs text-zinc-500">Selecione a estrutura visual do seu perfil.</p>
        </div>
      </header>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
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
              <ThumbShell active={active} locked={locked} label={tpl.label} icon={tpl.icon} />
            </button>
          );
        })}
      </div>

      <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-600/10 text-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Zap size={20} />
        </div>
        <p className="text-[10px] text-zinc-500 font-bold leading-relaxed uppercase tracking-wider">
          Templates com <Lock size={10} className="inline mx-1" /> requerem plano <b>Pro ou superior</b>.
        </p>
      </div>
    </div>
  );
};

export default TemplatesTab;