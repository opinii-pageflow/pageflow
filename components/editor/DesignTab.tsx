import React, { useState, useRef, useEffect } from 'react';
import { Profile, BackgroundType, ButtonStyle } from '../../types';
import { themePresets } from '../../lib/themePresets';
import { getStyleFromClipboard, copyStyleToClipboard, StyleConfig } from '../../lib/storage';
import { canUseTheme, canAccessFeature } from '../../lib/permissions';
import { getStorage, getCurrentUser } from '../../lib/storage';
import ColorPickerButton from '../common/ColorPickerButton';
import { 
  ChevronDown, 
  Palette as PaletteIcon, 
  MousePointer2, 
  Image as ImageIcon, 
  Type as TypeIcon, 
  Paintbrush,
  Layers,
  Upload,
  Link as LinkIcon,
  Copy,
  ClipboardPaste,
  Check,
  Lock
} from 'lucide-react';
import clsx from 'clsx';

interface Props {
  profile: Profile;
  onUpdate: (updates: Partial<Profile>) => void;
}

const DesignTab: React.FC<Props> = ({ profile, onUpdate }) => {
  const user = getCurrentUser();
  const data = getStorage();
  const client = data.clients.find(c => c.id === user?.clientId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [clipboard, setClipboard] = useState<StyleConfig | null>(getStyleFromClipboard());
  const [justCopied, setJustCopied] = useState(false);

  const canUseImages = canAccessFeature(client?.plan, 'background_image');

  useEffect(() => {
    const checkClipboard = () => setClipboard(getStyleFromClipboard());
    window.addEventListener('focus', checkClipboard);
    return () => window.removeEventListener('focus', checkClipboard);
  }, []);

  const updateTheme = (updates: Partial<typeof profile.theme>) => {
    onUpdate({ theme: { ...profile.theme, ...updates } });
  };

  const applyPreset = (name: string) => {
    if (themePresets[name]) {
      onUpdate({ theme: themePresets[name] });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canUseImages) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateTheme({ 
          backgroundType: 'image', 
          backgroundValue: reader.result as string 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Temas Rápidos */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Layers size={14} className="text-blue-500" />
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Temas Rápidos</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Object.keys(themePresets).map(name => {
            const isLocked = !canUseTheme(client?.plan, name);
            const isActive = profile.theme.backgroundValue === themePresets[name].backgroundValue;
            
            return (
              <button
                key={name}
                disabled={isLocked}
                onClick={() => !isLocked && applyPreset(name)}
                className={`
                  group p-4 rounded-[1.8rem] border-2 text-xs font-bold transition-all text-left flex flex-col gap-3 relative overflow-hidden
                  ${isActive ? 'border-blue-600 bg-blue-600/10' : 'border-white/5 bg-zinc-900/50 hover:border-white/20'}
                  ${isLocked ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                `}
              >
                {isLocked && (
                  <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
                    <Lock size={16} className="text-zinc-500" />
                  </div>
                )}
                <div className="w-full h-10 rounded-xl shadow-inner overflow-hidden flex" style={{ background: themePresets[name].backgroundValue }}>
                   {themePresets[name].backgroundType === 'gradient' && (
                     <div className="w-full h-full" style={{ background: `linear-gradient(${themePresets[name].backgroundDirection}, ${themePresets[name].backgroundValue}, ${themePresets[name].backgroundValueSecondary})` }}></div>
                   )}
                </div>
                <span className={isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}>
                  {name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Plano de Fundo */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Paintbrush size={14} className="text-purple-500" />
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Plano de Fundo</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-zinc-900/50 border border-white/5 rounded-2xl">
          {(['solid', 'gradient', 'image'] as BackgroundType[]).map(type => {
            const isImageLocked = type === 'image' && !canUseImages;
            return (
              <button
                key={type}
                disabled={isImageLocked}
                onClick={() => !isImageLocked && updateTheme({ backgroundType: type })}
                className={`
                  py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5
                  ${profile.theme.backgroundType === type ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}
                  ${isImageLocked ? 'opacity-40 cursor-not-allowed' : ''}
                `}
              >
                {isImageLocked && <Lock size={10} />}
                {type === 'solid' ? 'Sólido' : type === 'gradient' ? 'Gradiente' : 'Imagem'}
              </button>
            );
          })}
        </div>

        {profile.theme.backgroundType === 'image' && canUseImages && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
             <div className="relative group h-48 w-full rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-white/5 shadow-inner">
                {profile.theme.backgroundValue && (profile.theme.backgroundValue.startsWith('http') || profile.theme.backgroundValue.startsWith('data:')) ? (
                  <img src={profile.theme.backgroundValue} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt="Background" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-800">
                    <ImageIcon size={48} />
                    <span className="text-[10px] font-black uppercase mt-3 tracking-widest">Aguardando Imagem</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4 backdrop-blur-sm">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 bg-white text-black rounded-2xl hover:scale-110 active:scale-90 transition-transform shadow-xl"
                  >
                    <Upload size={24} />
                  </button>
                </div>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
          </div>
        )}
      </section>
    </div>
  );
};

export default DesignTab;