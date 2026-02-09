
import React, { useState, useRef, useEffect } from 'react';
import { Profile, BackgroundType, ButtonStyle } from '../../types';
import { themePresets } from '../../lib/themePresets';
import { hexToHsv, hsvToHex, hsvToRgb, hexToRgb, RGB, HSV } from '../../lib/colorPicker';
import { getStyleFromClipboard, copyStyleToClipboard, StyleConfig } from '../../lib/storage';
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
  Check
} from 'lucide-react';
import { clsx } from 'clsx';

const PRESET_PALETTE = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', 
  '#FFFF00', '#00FFFF', '#FF00FF', '#3b82f6', '#10b981', 
  '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'
];

interface Props {
  profile: Profile;
  onUpdate: (updates: Partial<Profile>) => void;
}

// Componente Unificado de Seleção de Cores Premium
const PremiumColorSelector: React.FC<{ 
  color: string; 
  label: string; 
  onChange: (hex: string) => void;
}> = ({ color, label, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hsv, setHsv] = useState<HSV>(hexToHsv(color));
  const [hex, setHex] = useState(color);
  
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (color.toLowerCase() !== hex.toLowerCase()) {
      setHex(color);
      setHsv(hexToHsv(color));
    }
  }, [color]);

  const updateAll = (newHsv: HSV) => {
    const newHex = hsvToHex(newHsv);
    setHsv(newHsv);
    setHex(newHex);
    onChange(newHex);
  };

  const handleSvMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const move = (e: any) => {
      if (!svRef.current) return;
      const rect = svRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const s = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
      const v = Math.min(100, Math.max(0, (1 - (clientY - rect.top) / rect.height) * 100));
      updateAll({ ...hsv, s, v });
    };
    move(e);
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend', up);
  };

  const handleHueMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const move = (e: any) => {
      if (!hueRef.current) return;
      const rect = hueRef.current.getBoundingClientRect();
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const h = Math.min(360, Math.max(0, ((clientY - rect.top) / rect.height) * 360));
      updateAll({ ...hsv, h });
    };
    move(e);
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend', up);
  };

  return (
    <div className="space-y-3">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between p-4 bg-zinc-900/40 border rounded-[1.5rem] transition-all group
          ${isOpen ? 'border-blue-500/50 bg-blue-500/5 ring-4 ring-blue-500/5' : 'border-white/5 hover:border-white/10'}
        `}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl border-2 border-white/10 shadow-xl transition-transform group-hover:scale-105" style={{ backgroundColor: color }}></div>
            {isOpen && <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-zinc-950 animate-pulse"></div>}
          </div>
          <div className="text-left">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-0.5">{label}</span>
            <span className="text-sm font-mono font-black uppercase text-zinc-200">{color}</span>
          </div>
        </div>
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : 'text-zinc-600'}`}>
          <ChevronDown size={20} />
        </div>
      </button>

      {isOpen && (
        <div className="p-6 bg-zinc-900 border border-white/10 rounded-[2.5rem] space-y-6 animate-in fade-in zoom-in-95 duration-300 shadow-2xl">
          <div className="space-y-2">
             <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Paleta Rápida</label>
             <div className="grid grid-cols-8 gap-1.5 p-1.5 bg-black/20 rounded-2xl">
                {PRESET_PALETTE.map(p => (
                  <button
                    key={p}
                    onClick={() => onChange(p)}
                    className={`aspect-square rounded-lg transition-all hover:scale-125 hover:z-10 ${color.toLowerCase() === p.toLowerCase() ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-80'}`}
                    style={{ backgroundColor: p }}
                  />
                ))}
             </div>
          </div>
          <div className="h-px bg-white/5 mx-2"></div>
          <div className="flex gap-5 h-48">
            <div 
              ref={svRef}
              onMouseDown={handleSvMouseDown}
              onTouchStart={handleSvMouseDown}
              className="flex-1 rounded-3xl relative cursor-crosshair overflow-hidden border border-white/10 shadow-inner"
              style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
              <div 
                className="absolute w-6 h-6 border-4 border-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-2xl ring-2 ring-black/20"
                style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%` }}
              ></div>
            </div>
            <div 
              ref={hueRef}
              onMouseDown={handleHueMouseDown}
              onTouchStart={handleHueMouseDown}
              className="w-10 rounded-3xl relative cursor-ns-resize border border-white/10 shadow-inner"
              style={{ background: 'linear-gradient(to bottom, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)' }}
            >
              <div 
                className="absolute w-full h-4 bg-white border-4 border-black/20 rounded-lg shadow-xl left-0 -translate-y-1/2"
                style={{ top: `${(hsv.h / 360) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5">
             <div className="flex-1">
                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Código HEX</label>
                <input 
                  type="text" 
                  value={hex}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHex(val);
                    if (/^#[0-9A-F]{6}$/i.test(val)) onChange(val);
                  }}
                  className="w-full bg-transparent border-none p-0 text-sm font-mono font-black uppercase text-white focus:ring-0 outline-none"
                />
             </div>
             <div className="w-12 h-12 rounded-xl border border-white/10 shadow-lg" style={{ backgroundColor: color }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

const DesignTab: React.FC<Props> = ({ profile, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [clipboard, setClipboard] = useState<StyleConfig | null>(getStyleFromClipboard());
  const [justCopied, setJustCopied] = useState(false);

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

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Design & Estilo</h3>
          <p className="text-xs text-gray-500">Personalize a aparência do seu cartão digital.</p>
        </div>
        
        {/* Style Cloner Toolset */}
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

      {/* Seção de Temas */}
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

      {/* Configuração de Plano de Fundo */}
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
            <PremiumColorSelector 
              label="Cor do Fundo"
              color={profile.theme.backgroundValue}
              onChange={(hex) => updateTheme({ backgroundValue: hex })}
            />
          )}

          {profile.theme.backgroundType === 'gradient' && (
            <div className="space-y-6">
              <PremiumColorSelector 
                label="Cor Inicial"
                color={profile.theme.backgroundValue}
                onChange={(hex) => updateTheme({ backgroundValue: hex })}
              />
              <PremiumColorSelector 
                label="Cor Final"
                color={profile.theme.backgroundValueSecondary || '#000000'}
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
        
        <PremiumColorSelector 
          label="Cor Primária (Destaques)"
          color={profile.theme.primary}
          onChange={(hex) => updateTheme({ primary: hex })}
        />

        <div className="h-px bg-white/5 mx-2"></div>

        <PremiumColorSelector 
          label="Cor do Texto Principal"
          color={profile.theme.text}
          onChange={(hex) => updateTheme({ text: hex })}
        />
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
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Raio de Curvatura</h3>
            <span className="text-xs font-mono font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">{profile.theme.radius}</span>
          </div>
          <div className="bg-zinc-900/40 p-10 rounded-[2.5rem] border border-white/5 shadow-inner">
            <input 
              type="range" 
              min="0" 
              max="40" 
              value={parseInt(profile.theme.radius)}
              onChange={(e) => updateTheme({ radius: `${e.target.value}px` })}
              className="w-full h-1.5 bg-zinc-800 accent-white rounded-full appearance-none cursor-pointer"
            />
            <div className="flex justify-between mt-8 px-1">
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
        </div>
      </section>
    </div>
  );
};

export default DesignTab;
