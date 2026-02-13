import React, { useState, useRef, useEffect } from 'react';
import { Profile, BackgroundType, ButtonStyle, IconStyle } from '../../types';
import { themePresets } from '../../lib/themePresets';
import { getStyleFromClipboard, copyStyleToClipboard, StyleConfig, getStorage, getCurrentUser } from '../../lib/storage';
import { canAccessFeature } from '../../lib/permissions';
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
  ShieldAlert,
  Lock,
  Zap,
  Frame
} from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

interface Props {
  profile: Profile;
  onUpdate: (updates: Partial<Profile>) => void;
}

const DesignTab: React.FC<Props> = ({ profile, onUpdate }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [clipboard, setClipboard] = useState<StyleConfig | null>(getStyleFromClipboard());
  const [justCopied, setJustCopied] = useState(false);
  
  const user = getCurrentUser();
  const data = getStorage();
  const client = data.clients.find(c => c.id === user?.clientId);
  const canHideBranding = canAccessFeature(client?.plan, 'white_label');

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

  const handleCopyStyle = () => {
    copyStyleToClipboard(profile);
    setClipboard(getStyleFromClipboard());
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 2000);
  };

  const handlePasteStyle = () => {
    const config = getStyleFromClipboard();
    if (!config) return;
    onUpdate({
      theme: config.theme,
      fonts: config.fonts,
      layoutTemplate: config.layoutTemplate
    });
  };

  const setIconStyle = (style: IconStyle) => updateTheme({ iconStyle: style });

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Design & Estilo</h3>
          <p className="text-xs text-gray-500">Personalize a aparência do seu cartão digital.</p>
        </div>
        
        <div className="flex items-center gap-2">
           <button 
            onClick={handleCopyStyle}
            className={clsx(
              "px-4 py-2 rounded-xl flex items-center gap-2 text-[9px] font-black uppercase tracking-widest border transition-all",
              justCopied ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-white/5 border-white/10 text-zinc-500 hover:text-white"
            )}
           >
              {justCopied ? <Check size={14} /> : <Copy size={14} />}
              {justCopied ? "Copiado!" : "Copiar Estilo"}
           </button>
           
           {clipboard && clipboard.sourceProfileId !== profile.id && (
             <button 
              onClick={handlePasteStyle}
              className="px-4 py-2 rounded-xl bg-blue-600/10 border border-blue-600 text-blue-500 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all animate-pulse"
             >
                <ClipboardPaste size={14} />
                Colar Estilo
             </button>
           )}
        </div>
      </header>

      {/* Branding / Marca d'água */}
      <section className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h4 className="font-black text-base">Marca LinkFlow</h4>
              <p className="text-zinc-500 text-xs">Exibe o selo oficial no rodapé do perfil.</p>
            </div>
          </div>
          
          {canHideBranding ? (
            <button 
              onClick={() => onUpdate({ hideBranding: !profile.hideBranding })}
              className={clsx(
                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border",
                profile.hideBranding ? "bg-white text-black" : "bg-white/5 text-zinc-400 border-white/10"
              )}
            >
              {profile.hideBranding ? 'Marca Oculta' : 'Marca Ativa'}
            </button>
          ) : (
            <button 
              onClick={() => navigate('/app/upgrade')}
              className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center gap-2 group hover:bg-blue-600 hover:text-white transition-all"
            >
              <Lock size={12} />
              Remover Marca
            </button>
          )}
        </div>
        
        {!canHideBranding && (
          <div className="flex items-center gap-3 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
            <Zap size={14} className="text-blue-500 animate-pulse" />
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
              A remoção da marca d'água está disponível a partir do <span className="text-white">Plano Pro</span>.
            </p>
          </div>
        )}
      </section>

      {/* Temas Rápidos */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Layers size={14} className="text-blue-500" />
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Temas Rápidos</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Object.keys(themePresets).map(name => (
            <button
              key={name}
              onClick={() => applyPreset(name)}
              className={`
                group p-4 rounded-[1.8rem] border-2 text-xs font-bold transition-all text-left flex flex-col gap-3 relative overflow-hidden
                ${profile.theme.backgroundValue === themePresets[name].backgroundValue 
                  ? 'border-blue-600 bg-blue-600/10' 
                  : 'border-white/5 bg-zinc-900/50 hover:border-white/20'}
              `}
            >
              <div className="w-full h-10 rounded-xl shadow-inner overflow-hidden flex" style={{ background: themePresets[name].backgroundValue }}>
                {themePresets[name].backgroundType === 'gradient' && (
                   <div className="w-full h-full" style={{ background: `linear-gradient(${themePresets[name].backgroundDirection}, ${themePresets[name].backgroundValue}, ${themePresets[name].backgroundValueSecondary})` }}></div>
                )}
              </div>
              <span className={profile.theme.backgroundValue === themePresets[name].backgroundValue ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}>
                {name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Plano de Fundo */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Paintbrush size={14} className="text-purple-500" />
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Plano de Fundo</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-zinc-900/50 border border-white/5 rounded-2xl">
          {(['solid', 'gradient', 'image'] as BackgroundType[]).map(type => (
            <button
              key={type}
              onClick={() => updateTheme({ backgroundType: type })}
              className={`
                py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all
                ${profile.theme.backgroundType === type 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}
              `}
            >
              {type === 'solid' ? 'Sólido' : type === 'gradient' ? 'Gradiente' : 'Imagem'}
            </button>
          ))}
        </div>

        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {profile.theme.backgroundType === 'solid' && (
            <ColorPickerButton 
              label="Cor do Fundo"
              value={profile.theme.backgroundValue}
              onChange={(hex) => updateTheme({ backgroundValue: hex })}
            />
          )}

          {profile.theme.backgroundType === 'gradient' && (
            <div className="space-y-6">
              <ColorPickerButton 
                label="Cor Inicial"
                value={profile.theme.backgroundValue}
                onChange={(hex) => updateTheme({ backgroundValue: hex })}
              />
              <ColorPickerButton 
                label="Cor Final"
                value={profile.theme.backgroundValueSecondary || '#000000'}
                onChange={(hex) => updateTheme({ backgroundValueSecondary: hex })}
              />
              <div className="space-y-3">
                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Direção do Fluxo</label>
                <div className="relative">
                  <select 
                    value={profile.theme.backgroundDirection || 'to bottom'}
                    onChange={(e) => updateTheme({ backgroundDirection: e.target.value })}
                    className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold outline-none appearance-none cursor-pointer focus:border-blue-500/50 transition-all"
                  >
                    <option value="to bottom">Vertical (Baixo)</option>
                    <option value="to right">Horizontal (Direita)</option>
                    <option value="to top">Vertical (Cima)</option>
                    <option value="to left">Horizontal (Esquerda)</option>
                    <option value="135deg">Diagonal (135°)</option>
                    <option value="45deg">Diagonal (45°)</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500" size={16} />
                </div>
              </div>
            </div>
          )}

          {profile.theme.backgroundType === 'image' && (
            <div className="space-y-4">
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
              <div className="relative flex items-center">
                <div className="absolute left-5 text-zinc-600"><LinkIcon size={16} /></div>
                <input 
                  type="text" 
                  value={profile.theme.backgroundValue}
                  onChange={(e) => updateTheme({ backgroundValue: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-xs font-medium focus:border-blue-500/50 transition-all outline-none"
                  placeholder="Ou cole a URL da imagem..."
                />
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
            </div>
          )}
        </div>
      </section>

      {/* Cores de Elementos */}
      <section className="space-y-8">
        <div className="flex items-center gap-2 mb-4">
          <TypeIcon size={14} className="text-amber-500" />
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Cores de Elementos</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <ColorPickerButton 
            label="Cor Primária"
            value={profile.theme.primary}
            onChange={(hex) => updateTheme({ primary: hex })}
          />
          <ColorPickerButton 
            label="Cor do Texto"
            value={profile.theme.text}
            onChange={(hex) => updateTheme({ text: hex })}
          />
          <ColorPickerButton 
            label="Cor da Borda"
            value={profile.theme.border.startsWith('#') ? profile.theme.border : '#ffffff'}
            onChange={(hex) => updateTheme({ border: hex })}
          />
        </div>
      </section>

      {/* Estilo e Curvatura */}
      <section className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MousePointer2 size={14} className="text-emerald-500" />
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Formato dos Botões</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 p-2 bg-zinc-900/50 border border-white/5 rounded-2xl">
            {(['solid', 'outline', 'glass'] as ButtonStyle[]).map(style => (
              <button
                key={style}
                onClick={() => updateTheme({ buttonStyle: style })}
                className={`
                  py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all
                  ${profile.theme.buttonStyle === style 
                    ? 'bg-white text-black shadow-lg shadow-white/5' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}
                `}
              >
                {style === 'solid' ? 'Sólido' : style === 'outline' ? 'Borda' : 'Vidro'}
              </button>
            ))}
          </div>

          {/* Ícones */}
          <div className="mt-6 bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400">
                  <PaletteIcon size={18} />
                </div>
                <div>
                  <h4 className="font-black text-base">Ícones dos Botões</h4>
                  <p className="text-zinc-500 text-xs">Escolha entre mono, marca ou cores oficiais.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-zinc-900/60 border border-white/5 rounded-2xl p-1">
                {(['mono', 'brand', 'real'] as const).map(style => (
                  <button
                    key={style}
                    onClick={() => setIconStyle(style)}
                    className={clsx(
                      "px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                      profile.theme.iconStyle === style || (!profile.theme.iconStyle && style === 'mono')
                        ? 'bg-white text-black'
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                    )}
                  >
                    {style === 'mono' ? 'Mono' : style === 'brand' ? 'Cor' : 'Real'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
              Dica: “Real” aplica a cor oficial da marca ao fundo do botão.
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Frame size={14} className="text-zinc-500" />
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Bordas e Curvas</h3>
            </div>
          </div>
          
          <div className="bg-zinc-900/40 p-10 rounded-[2.5rem] border border-white/5 shadow-inner space-y-10">
            {/* Raio de Curvatura */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Raio de Curvatura</span>
                <span className="text-xs font-mono font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">{profile.theme.radius}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="40" 
                value={parseInt(profile.theme.radius)}
                onChange={(e) => updateTheme({ radius: `${e.target.value}px` })}
                className="w-full h-1.5 bg-zinc-800 accent-white rounded-full appearance-none cursor-pointer"
              />
              <div className="flex justify-between px-1">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-sm border-2 border-zinc-800"></div>
                  <span className="text-[8px] font-black uppercase text-zinc-700 tracking-widest">Reto</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-zinc-800"></div>
                  <span className="text-[8px] font-black uppercase text-zinc-700 tracking-widest">Círculo</span>
                </div>
              </div>
            </div>

            {/* Espessura da Borda */}
            <div className="space-y-4 border-t border-white/5 pt-8">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Espessura da Borda</span>
                <span className="text-xs font-mono font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">{profile.theme.borderWidth || '1px'}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="8" 
                value={parseInt(profile.theme.borderWidth || '1')}
                onChange={(e) => updateTheme({ borderWidth: `${e.target.value}px` })}
                className="w-full h-1.5 bg-zinc-800 accent-white rounded-full appearance-none cursor-pointer"
              />
              <div className="flex justify-between px-1">
                <span className="text-[8px] font-black uppercase text-zinc-700 tracking-widest">Fina</span>
                <span className="text-[8px] font-black uppercase text-zinc-700 tracking-widest">Grossa</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DesignTab;