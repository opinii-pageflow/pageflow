import React, { useState, useRef, useEffect } from 'react';
import { Profile, BackgroundType, BackgroundMode, ButtonStyle, IconStyle, Theme, ModuleType, ModuleTheme } from '@/types';
import { themePresets } from '@/lib/themePresets';
import { backgroundPresets } from '@/lib/backgroundPresets';
import { getStyleFromClipboard, copyStyleToClipboard, StyleConfig, getStorage, getCurrentUser } from '@/lib/storage';
import { canAccessFeature } from '@/lib/permissions';
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
    Frame,
    Crown,
    Maximize,
    AlignCenter,
    ArrowUp,
    MoveHorizontal,
    Grid as GridIcon,
    Sliders
} from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { PLAN_RANK } from '../../lib/permissions';
import { PlanType } from '../../types';

interface Props {
    profile: Profile;
    clientPlan?: PlanType;
    onUpdate: (updates: Partial<Profile>) => void;
}

const DEFAULT_THEME: Theme = {
    primary: '#3b82f6',
    text: '#ffffff',
    muted: 'rgba(255,255,255,0.7)',
    border: 'rgba(255,255,255,0.10)',
    cardBg: 'rgba(0,0,0,0.30)',
    shadow: '0 12px 40px rgba(0,0,0,0.35)',
    radius: '18px',
    buttonStyle: 'glass',
    backgroundType: 'solid',
    backgroundValue: '#0A0A0A',
    backgroundDirection: 'to bottom',
    backgroundValueSecondary: '#0A0A0A',
    backgroundValueTertiary: '',
    backgroundMode: 'fill',
    borderWidth: '1px',
    overlayIntensity: 0,
    iconStyle: 'mono'
};

const DesignTab: React.FC<Props> = ({ profile, clientPlan, onUpdate }) => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [clipboard, setClipboard] = useState<StyleConfig | null>(getStyleFromClipboard());
    const [justCopied, setJustCopied] = useState(false);

    // Merge defensivo para evitar crashes com themes incompletos
    const theme = { ...DEFAULT_THEME, ...(profile.theme || {}) };

    // Compatibilidade com legado 'color' -> 'solid'
    if ((theme.backgroundType as any) === 'color') {
        theme.backgroundType = 'solid';
    }

    const userPlan = clientPlan || 'starter';
    const currentRank = PLAN_RANK[userPlan];
    const canHideBranding = currentRank >= PLAN_RANK.pro;

    useEffect(() => {
        const checkClipboard = () => setClipboard(getStyleFromClipboard());
        window.addEventListener('focus', checkClipboard);
        return () => window.removeEventListener('focus', checkClipboard);
    }, []);

    const updateTheme = (updates: Partial<Theme>) => {
        onUpdate({ theme: { ...theme, ...updates } });
    };

    const getThemeMinPlan = (index: number): PlanType => {
        if (index < 6) return 'starter';
        if (index < 21) return 'pro';
        return 'business';
    };

    const applyPreset = (name: string, index: number) => {
        const minPlan = getThemeMinPlan(index);
        const isLocked = currentRank < PLAN_RANK[minPlan];

        // Check if already used (downgrade case)
        const preset = themePresets[name];
        const isCurrentlyUsed = theme.backgroundValue === preset.backgroundValue &&
            theme.backgroundValueSecondary === preset.backgroundValueSecondary;

        if (isLocked && !isCurrentlyUsed) {
            alert(`O tema "${name}" está disponível a partir do plano ${minPlan.toUpperCase()}. Faça upgrade para desbloquear!`);
            return;
        }

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
                            <h4 className="font-black text-base">Marca PageFlow</h4>
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
                <div className="flex items-center gap-2 mb-6">
                    <Layers size={14} className="text-blue-500" />
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Temas Rápidos</h3>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-y-8 gap-x-4">
                    {Object.keys(themePresets).map((name, idx) => {
                        const preset = themePresets[name];
                        const minPlan = getThemeMinPlan(idx);
                        const isLocked = currentRank < PLAN_RANK[minPlan];

                        const isSelected = theme.backgroundValue === preset.backgroundValue &&
                            theme.backgroundValueSecondary === preset.backgroundValueSecondary &&
                            theme.backgroundValueTertiary === preset.backgroundValueTertiary;

                        let bgPreview = preset.backgroundValue;
                        if (preset.backgroundType === 'gradient') {
                            const colors = [preset.backgroundValue];
                            if (preset.backgroundValueSecondary) colors.push(preset.backgroundValueSecondary);
                            if (preset.backgroundValueTertiary) colors.push(preset.backgroundValueTertiary);
                            bgPreview = `linear-gradient(${preset.backgroundDirection || 'to bottom'}, ${colors.join(', ')})`;
                        }

                        return (
                            <button
                                key={name}
                                onClick={() => applyPreset(name, idx)}
                                title={name}
                                className={clsx(
                                    "group relative flex flex-col items-center gap-3 transition-all duration-300 outline-none",
                                    isLocked && !isSelected && "opacity-60 grayscale-[0.5]"
                                )}
                            >
                                {/* The Circle Preview */}
                                <div
                                    className={clsx(
                                        "w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-white/20 shadow-lg relative flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]",
                                        isSelected ? "ring-[3px] ring-blue-500 ring-offset-4 ring-offset-[#080808]" : "hover:border-white/40"
                                    )}
                                    style={{ background: bgPreview }}
                                >
                                    {isLocked && !isSelected && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full text-zinc-400 group-hover:text-amber-400 transition-colors">
                                            <Lock size={12} />
                                        </div>
                                    )}
                                    {isSelected && (
                                        <div className="bg-blue-500 text-white p-1 rounded-full shadow-lg animate-in zoom-in-50 duration-300">
                                            <Check size={10} strokeWidth={4} />
                                        </div>
                                    )}
                                </div>

                                {/* Theme Name label (Premium small text) */}
                                <div className="flex flex-col items-center gap-1">
                                    <span className={clsx(
                                        "text-[9px] font-black uppercase tracking-widest text-center transition-colors duration-300 px-1",
                                        isSelected ? "text-white" : "text-zinc-600 group-hover:text-zinc-400"
                                    )}>
                                        {name}
                                    </span>
                                    {isLocked && (
                                        <span className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[6px] font-black text-amber-500 uppercase tracking-tighter">
                                            <Crown size={6} /> Pro
                                        </span>
                                    )}
                                    {isSelected && isLocked && (
                                        <span className="text-[6px] font-bold text-blue-400 uppercase tracking-tighter bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/20">Em Uso</span>
                                    )}
                                </div>

                                {/* Discrete Label hover effect (Premium) */}
                                <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all duration-300 bg-zinc-900 border border-white/10 px-3 py-1.5 rounded-lg shadow-2xl pointer-events-none z-50">
                                    <div className="text-[10px] font-black text-white whitespace-nowrap">{name}</div>
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 border-r border-b border-white/10 rotate-45" />
                                </div>
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

                <div className="grid grid-cols-4 gap-2 p-1.5 bg-zinc-900/50 border border-white/5 rounded-2xl">
                    {(['solid', 'gradient', 'image', 'preset'] as BackgroundType[]).map(type => {
                        const isLocked = userPlan === 'starter' && type !== 'solid';

                        return (
                            <button
                                key={type}
                                disabled={isLocked}
                                onClick={() => updateTheme({ backgroundType: type })}
                                className={clsx(
                                    "py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all relative flex items-center justify-center gap-2",
                                    theme.backgroundType === type
                                        ? 'bg-white text-black shadow-lg'
                                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5',
                                    isLocked && "opacity-40 cursor-not-allowed grayscale"
                                )}
                            >
                                {type === 'solid' ? 'Sólido' : type === 'gradient' ? 'Gradiente' : type === 'image' ? 'Imagem' : 'Presets'}
                                {isLocked && <Lock size={10} className="text-zinc-600" />}
                            </button>
                        );
                    })}
                </div>

                {/* Modos de Aplicação (Apenas se não for sólido) */}
                {theme.backgroundType !== 'solid' && (
                    <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Maximize size={12} className="text-zinc-500" />
                            <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Modo de Aplicação</h4>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            {([
                                { id: 'fill', label: 'Full', icon: <Maximize size={12} /> },
                                { id: 'center', label: 'Center', icon: <AlignCenter size={12} /> },
                                { id: 'top', label: 'Top', icon: <ArrowUp size={12} /> },
                                { id: 'parallax', label: 'Parallax', icon: <MoveHorizontal size={12} /> },
                                { id: 'repeat', label: 'Pattern', icon: <GridIcon size={12} /> }
                            ] as { id: BackgroundMode, label: string, icon: React.ReactNode }[]).map(mode => (
                                <button
                                    key={mode.id}
                                    onClick={() => updateTheme({ backgroundMode: mode.id })}
                                    className={clsx(
                                        "flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all",
                                        (theme.backgroundMode === mode.id || (!theme.backgroundMode && mode.id === 'fill'))
                                            ? "bg-blue-600/10 border-blue-500 text-blue-500 shadow-lg shadow-blue-500/10"
                                            : "bg-white/5 border-white/5 text-zinc-600 hover:text-zinc-400 hover:border-white/10"
                                    )}
                                >
                                    {mode.icon}
                                    <span className="text-[7px] font-black uppercase tracking-tighter">{mode.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {theme.backgroundType === 'solid' && (
                        <ColorPickerButton
                            label="Cor do Fundo"
                            value={theme.backgroundValue}
                            onChange={(hex) => updateTheme({ backgroundValue: hex })}
                        />
                    )}

                    {theme.backgroundType === 'gradient' && (
                        <div className="space-y-6">
                            <ColorPickerButton
                                label="Cor Inicial"
                                value={theme.backgroundValue}
                                onChange={(hex) => updateTheme({ backgroundValue: hex })}
                            />
                            <ColorPickerButton
                                label="Cor Final"
                                value={theme.backgroundValueSecondary || '#000000'}
                                onChange={(hex) => updateTheme({ backgroundValueSecondary: hex })}
                            />
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Direção do Gradiente</label>
                                <div className="relative">
                                    <select
                                        value={theme.backgroundDirection || 'to bottom'}
                                        onChange={(e) => updateTheme({ backgroundDirection: e.target.value })}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold text-white outline-none appearance-none cursor-pointer focus:border-blue-500/50 transition-all [&>option]:bg-zinc-900 [&>option]:text-white"
                                    >
                                        <option value="to bottom" className="bg-zinc-900 text-white">Vertical (Baixo)</option>
                                        <option value="to right" className="bg-zinc-900 text-white">Horizontal (Direita)</option>
                                        <option value="to top" className="bg-zinc-900 text-white">Vertical (Cima)</option>
                                        <option value="to left" className="bg-zinc-900 text-white">Horizontal (Esquerda)</option>
                                        <option value="135deg" className="bg-zinc-900 text-white">Diagonal (135°)</option>
                                        <option value="45deg" className="bg-zinc-900 text-white">Diagonal (45°)</option>
                                    </select>
                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500" size={16} />
                                </div>
                            </div>
                            <div className="pt-2">
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <div className="flex items-center gap-2">
                                        <Sliders size={12} className="text-zinc-500" />
                                        <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Intensidade do Brilho</span>
                                    </div>
                                    <span className="text-[10px] font-black text-blue-500">{theme.overlayIntensity || 0}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={theme.overlayIntensity || 0}
                                    onChange={(e) => updateTheme({ overlayIntensity: parseInt(e.target.value) })}
                                    className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>
                        </div>
                    )}

                    {theme.backgroundType === 'preset' && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            {backgroundPresets.map(preset => (
                                <button
                                    key={preset.id}
                                    onClick={() => updateTheme({
                                        backgroundValue: preset.gradient,
                                        backgroundType: 'preset',
                                        overlayIntensity: preset.config?.overlayIntensity || 0
                                    })}
                                    className={clsx(
                                        "group flex flex-col gap-2 p-1 rounded-2xl border transition-all h-24",
                                        theme.backgroundValue === preset.gradient
                                            ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                                            : "border-white/5 bg-zinc-900/40 hover:border-white/20"
                                    )}
                                >
                                    <div
                                        className="w-full h-full rounded-xl shadow-inner relative overflow-hidden"
                                        style={{ background: preset.gradient }}
                                    >
                                        {theme.backgroundValue === preset.gradient && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                                    <Check size={12} className="text-white" strokeWidth={4} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-center text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                        {preset.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {theme.backgroundType === 'image' && (
                        <div className="space-y-4">
                            <div className="relative group h-48 w-full rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-white/5 shadow-inner">
                                {theme.backgroundValue && (theme.backgroundValue.startsWith('http') || theme.backgroundValue.startsWith('data:')) ? (
                                    <div className="w-full h-full relative">
                                        <img src={theme.backgroundValue} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt="Background" />
                                        <div
                                            className="absolute inset-0 pointer-events-none transition-colors"
                                            style={{ backgroundColor: `rgba(0,0,0,${(theme.overlayIntensity || 0) / 100})` }}
                                        />
                                    </div>
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

                            <div className="space-y-4 bg-zinc-900/40 p-5 rounded-3xl border border-white/5">
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2">
                                        <Sliders size={12} className="text-zinc-500" />
                                        <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Intensidade do Overlay</span>
                                    </div>
                                    <span className="text-[10px] font-black text-blue-500">{theme.overlayIntensity || 0}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="70"
                                    value={theme.overlayIntensity || 0}
                                    onChange={(e) => updateTheme({ overlayIntensity: parseInt(e.target.value) })}
                                    className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                                />
                                <p className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest text-center">Garante o contraste dos textos sobre a imagem.</p>
                            </div>

                            <div className="relative flex items-center">
                                <div className="absolute left-5 text-zinc-600"><LinkIcon size={16} /></div>
                                <input
                                    type="text"
                                    value={theme.backgroundValue}
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
                        value={theme.primary}
                        onChange={(hex) => updateTheme({ primary: hex })}
                    />
                    <ColorPickerButton
                        label="Cor do Texto"
                        value={theme.text}
                        onChange={(hex) => updateTheme({ text: hex })}
                    />
                    <ColorPickerButton
                        label="Cor da Borda"
                        value={theme.border.startsWith('#') ? theme.border : '#ffffff'}
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
                  ${theme.buttonStyle === style
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
                                            theme.iconStyle === style || (!theme.iconStyle && style === 'mono')
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
                                <span className="text-xs font-mono font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">{theme.radius}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="40"
                                value={parseInt(theme.radius)}
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
                                <span className="text-xs font-mono font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">{theme.borderWidth || '1px'}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="8"
                                value={parseInt(theme.borderWidth || '1')}
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

            {/* Design de Módulos (Enhanced) */}
            <section className="space-y-8">
                <div className="flex items-center gap-2 mb-4">
                    <GridIcon size={14} className="text-neon-blue" />
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Design de Módulos</h3>
                </div>

                <div className="bg-zinc-900/40 p-8 rounded-[2.5rem] border border-white/5 space-y-8">
                    <p className="text-xs text-zinc-500 mb-4">Personalize o visual de todos os módulos ou de cada um individualmente.</p>

                    {(() => {
                        const currentTheme = profile.generalModuleTheme || { style: 'glass' };

                        const updateGeneralTheme = (updates: Partial<ModuleTheme>) => {
                            onUpdate({
                                generalModuleTheme: {
                                    ...currentTheme,
                                    ...updates
                                },
                                moduleThemes: {} // Reset individual overrides
                            });
                        };

                        return (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between gap-4">
                                    <p className="text-xs text-zinc-500 max-w-[300px]">
                                        Personalize o visual de todos os módulos de uma vez. As alterações são aplicadas instantaneamente a todas as seções.
                                    </p>
                                    <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                                        <span className="text-[8px] font-black uppercase text-blue-500">Controle Global Ativo</span>
                                    </div>
                                </div>

                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black uppercase text-zinc-600 tracking-widest ml-1">Estilo do Bloco</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                            {['minimal', 'neon', 'glass', 'solid', 'outline', 'soft', 'brutalist', '3d'].map((style) => (
                                                <button
                                                    key={style}
                                                    onClick={() => updateGeneralTheme({ style: style as any })}
                                                    className={clsx(
                                                        "py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border",
                                                        (currentTheme.style || 'glass') === style
                                                            ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                                            : "bg-black/20 text-zinc-500 border-white/5 hover:bg-white/5"
                                                    )}
                                                >
                                                    {style}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2 ml-1">
                                            <span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">Tom de Destaque</span>
                                        </div>
                                        <ColorPickerButton
                                            label="Principal"
                                            value={currentTheme.primaryColor || theme.primary}
                                            onChange={(hex) => updateGeneralTheme({ primaryColor: hex })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 ml-1">
                                            <span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">Cores de Ação</span>
                                        </div>
                                        <ColorPickerButton
                                            label="Botão"
                                            value={currentTheme.buttonColor || theme.primary}
                                            onChange={(hex) => updateGeneralTheme({ buttonColor: hex })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 ml-1">
                                                <span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">Cores de Texto</span>
                                            </div>
                                            <ColorPickerButton
                                                label="Texto"
                                                value={currentTheme.textColor || theme.text}
                                                onChange={(hex) => updateGeneralTheme({ textColor: hex })}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 ml-1">
                                                <span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">Cores de Título</span>
                                            </div>
                                            <ColorPickerButton
                                                label="Título"
                                                value={currentTheme.titleColor || theme.text}
                                                onChange={(hex) => updateGeneralTheme({ titleColor: hex })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {(currentTheme.style === 'neon' || currentTheme.style === '3d') && (
                                    <div className="space-y-4 p-6 bg-black/20 rounded-3xl border border-white/5">
                                        <div className="flex justify-between items-center text-[8px] font-black uppercase text-zinc-500">
                                            <span>Intensidade ({currentTheme.style === 'neon' ? 'Brilho' : 'Profundidade'})</span>
                                            <span className="text-blue-500">{currentTheme.glowIntensity || 50}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={currentTheme.glowIntensity || 50}
                                            onChange={(e) => updateGeneralTheme({ glowIntensity: parseInt(e.target.value) })}
                                            className="w-full h-1 bg-zinc-800 accent-blue-500 rounded-full cursor-pointer"
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black uppercase text-zinc-600 tracking-widest ml-1">Arredondamento</label>
                                        <select
                                            value={currentTheme.radius || ''}
                                            onChange={(e) => updateGeneralTheme({ radius: e.target.value || undefined })}
                                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-zinc-300 outline-none focus:border-blue-500/50 transition-all cursor-pointer"
                                        >
                                            <option value="">Padrão</option>
                                            <option value="0px">Quadrado (0px)</option>
                                            <option value="8px">Discreto (8px)</option>
                                            <option value="16px">Moderno (16px)</option>
                                            <option value="24px">Suave (24px)</option>
                                            <option value="999px">Orgânico (Full)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black uppercase text-zinc-600 tracking-widest ml-1">Sombra</label>
                                        <select
                                            value={currentTheme.shadow || ''}
                                            onChange={(e) => updateGeneralTheme({ shadow: e.target.value || undefined })}
                                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-zinc-300 outline-none focus:border-blue-500/50 transition-all cursor-pointer"
                                        >
                                            <option value="">Padrão</option>
                                            <option value="none">Sem Sombra</option>
                                            <option value="0 4px 6px -1px rgba(0, 0, 0, 0.1)">Discreta</option>
                                            <option value="0 10px 15px -3px rgba(0, 0, 0, 0.15)">Média</option>
                                            <option value="0 25px 50px -12px rgba(0, 0, 0, 0.25)">Profunda (3D)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </section>
        </div>
    );
};

export default DesignTab;
