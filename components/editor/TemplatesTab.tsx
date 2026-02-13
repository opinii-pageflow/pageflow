import React from 'react';
import { Profile } from '../../types';
import { Check } from 'lucide-react';

interface Props {
  profile: Profile;
  onUpdate: (updates: Partial<Profile>) => void;
}

const TemplateThumb: React.FC<{ type: string; active: boolean }> = ({ type, active }) => {
  const renderMockup = () => {
    switch (type) {
      case 'Minimal Card':
        return (
          <div className="w-full h-full flex flex-col gap-0.5 p-1.5">
            <div className="w-3 h-3 rounded-full bg-current/20 mx-auto" />
            <div className="w-2/3 h-0.5 bg-current/25 rounded-full mx-auto" />
            <div className="w-1/2 h-0.5 bg-current/10 rounded-full mx-auto mb-1" />
            <div className="space-y-0.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-full h-1 bg-current/10 rounded-sm" />
              ))}
            </div>
          </div>
        );
      case 'Glassmorphism':
        return (
          <div className="w-full h-full p-1.5">
            <div className="w-full h-full rounded-md border border-current/15 bg-current/5 backdrop-blur-sm p-1.5 flex flex-col gap-0.5">
              <div className="w-3 h-3 rounded-full bg-current/20 mx-auto" />
              <div className="w-3/4 h-0.5 bg-current/25 rounded-full mx-auto" />
              <div className="w-1/2 h-0.5 bg-current/10 rounded-full mx-auto" />
              <div className="mt-1 space-y-0.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="w-full h-1 bg-current/10 rounded-sm" />
                ))}
              </div>
            </div>
          </div>
        );
      case 'Neon':
        return (
          <div className="w-full h-full p-1.5">
            <div className="w-full h-full rounded-md border border-current/25 bg-current/5 p-1.5 relative overflow-hidden">
              <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-current/10 blur-md" />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-current/10 blur-md" />
              <div className="w-3 h-3 rounded-full bg-current/25 mx-auto mb-1" />
              <div className="w-full h-1 bg-current/15 rounded-sm" />
              <div className="w-full h-1 bg-current/15 rounded-sm" />
              <div className="w-full h-1 bg-current/15 rounded-sm" />
            </div>
          </div>
        );
      case 'Corporate':
        return (
          <div className="w-full h-full flex flex-col gap-0.5 p-1.5">
            <div className="flex gap-0.5 items-center">
              <div className="w-3 h-3 rounded-sm bg-current/20" />
              <div className="flex-1">
                <div className="w-2/3 h-0.5 bg-current/25 rounded-full" />
                <div className="w-1/2 h-0.5 bg-current/10 rounded-full mt-0.5" />
              </div>
            </div>
            <div className="mt-1 space-y-0.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-full h-1 bg-current/10 rounded-sm" />
              ))}
            </div>
          </div>
        );
      case 'Creator':
        return (
          <div className="w-full h-full flex flex-col gap-0.5 p-1.5">
            <div className="w-full h-2 rounded-sm bg-current/10" />
            <div className="w-3 h-3 rounded-full bg-current/20 mx-auto -mt-1" />
            <div className="w-3/4 h-0.5 bg-current/25 rounded-full mx-auto" />
            <div className="grid grid-cols-2 gap-0.5 mt-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-2 bg-current/10 rounded-[2px]" />
              ))}
            </div>
          </div>
        );
      case 'Dark Elegant':
        return (
          <div className="w-full h-full flex flex-col gap-0.5 p-1.5">
            <div className="w-3 h-3 rounded-full bg-current/15 mx-auto" />
            <div className="w-3/5 h-0.5 bg-current/20 rounded-full mx-auto" />
            <div className="w-2/5 h-0.5 bg-current/10 rounded-full mx-auto" />
            <div className="mt-1 flex-1 flex flex-col justify-end gap-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-full h-1 bg-current/8 rounded-sm" />
              ))}
            </div>
          </div>
        );
      case 'Light Clean':
        return (
          <div className="w-full h-full p-1.5">
            <div className="w-full h-full rounded-md border border-current/10 bg-current/5 p-1.5 flex flex-col gap-0.5">
              <div className="w-3 h-3 rounded-full bg-current/15 mx-auto" />
              <div className="w-2/3 h-0.5 bg-current/20 rounded-full mx-auto" />
              <div className="w-full h-0.5 bg-current/10 rounded-full mt-1" />
              <div className="w-full h-0.5 bg-current/10 rounded-full" />
              <div className="w-full h-0.5 bg-current/10 rounded-full" />
            </div>
          </div>
        );
      case 'Icon Grid':
        return (
          <div className="w-full h-full flex flex-col gap-0.5 p-1.5">
            <div className="w-3 h-3 rounded-full bg-current/20 mx-auto mb-1" />
            <div className="grid grid-cols-3 gap-0.5 flex-1">
              {Array.from({ length: 9 }).map((_, i) => <div key={i} className="bg-current/10 rounded-[1px]" />)}
            </div>
          </div>
        );
      case 'Button List Bold':
        return (
          <div className="w-full h-full flex flex-col gap-0.5 p-1.5">
            <div className="w-3 h-3 rounded-full bg-current/20 mx-auto mb-1" />
            <div className="space-y-0.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`w-full h-1.5 bg-current/12 rounded-[2px] ${i % 2 === 0 ? 'rotate-[1deg]' : '-rotate-[1deg]'}`} />
              ))}
            </div>
          </div>
        );
      case 'Big Avatar':
        return (
          <div className="w-full h-full flex flex-col gap-0.5 p-1.5">
            <div className="w-6 h-6 rounded-full bg-current/20 mx-auto" />
            <div className="w-3/4 h-0.5 bg-current/25 rounded-full mx-auto" />
            <div className="w-1/2 h-0.5 bg-current/10 rounded-full mx-auto mb-1" />
            <div className="space-y-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-full h-1 bg-current/10 rounded-sm" />
              ))}
            </div>
          </div>
        );
      case 'Magazine':
        return (
          <div className="w-full h-full flex flex-col gap-0.5 p-1.5">
            <div className="w-full h-1/4 bg-current/10 rounded-sm mb-0.5" />
            <div className="w-3/4 h-0.5 bg-current/20 mb-0.5" />
            <div className="w-full h-0.5 bg-current/5" />
            <div className="w-full h-0.5 bg-current/5" />
          </div>
        );
      case 'Split Header':
        return (
          <div className="w-full h-full flex gap-0.5 p-1.5">
            <div className="w-1/3 h-2/3 bg-current/10 rounded-sm" />
            <div className="flex-1 flex flex-col gap-0.5 pt-1">
              <div className="h-1 bg-current/20 rounded-full w-2/3" />
              <div className="h-0.5 bg-current/5 rounded-full" />
              <div className="h-0.5 bg-current/5 rounded-full" />
            </div>
          </div>
        );
      default:
        return (
          <div className="w-full h-full flex flex-col gap-0.5 p-1.5">
            <div className="w-3 h-3 rounded-full bg-current/20 mx-auto mb-1" />
            <div className="w-full h-1 bg-current/20 rounded-full" />
            <div className="w-full h-1 bg-current/20 rounded-full" />
            <div className="w-full h-1 bg-current/20 rounded-full" />
          </div>
        );
    }
  };

  return (
    <div className={`w-full aspect-[4/5] rounded-lg border transition-all relative overflow-hidden flex flex-col ${active ? 'border-blue-500 bg-blue-500/10 text-blue-500 shadow-lg shadow-blue-500/10' : 'border-white/5 bg-zinc-900 text-zinc-700 group-hover:border-white/20'}`}>
      <div className="flex-1">
        {renderMockup()}
      </div>
      <div className={`py-1 px-0.5 text-[6px] font-black uppercase tracking-tighter text-center border-t ${active ? 'border-blue-500/20' : 'border-white/5'}`}>
        {type}
      </div>
      {active && (
        <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-0.5 shadow-sm">
          <Check size={6} />
        </div>
      )}
    </div>
  );
};

const TemplatesTab: React.FC<Props> = ({ profile, onUpdate }) => {
  const templates = [
    "Minimal Card", "Glassmorphism", "Neon", "Corporate", "Creator", 
    "Dark Elegant", "Light Clean", "Split Header", "Big Avatar", 
    "Icon Grid", "Button List Bold", "Magazine"
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
        {templates.map(tpl => (
          <button
            key={tpl}
            onClick={() => onUpdate({ layoutTemplate: tpl })}
            className="group active:scale-95 transition-transform"
          >
            <TemplateThumb type={tpl} active={profile.layoutTemplate === tpl} />
          </button>
        ))}
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
