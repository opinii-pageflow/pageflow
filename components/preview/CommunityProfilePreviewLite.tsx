
import React, { useMemo } from 'react';
import { Profile } from '@/types';
import { themePresets } from '@/lib/themePresets';
import { backgroundPresets } from '@/lib/backgroundPresets';
import { User, Building2 } from 'lucide-react';
import clsx from 'clsx';
import * as LucideIcons from 'lucide-react';

interface Props {
    profile: Profile;
}

const safeString = (v: any, fallback: string) =>
    typeof v === 'string' && v.trim() ? v : fallback;

const normalizeFontStack = (font: string) => {
    const name = safeString(font, 'Inter');
    const needsQuotes = /\s/.test(name) || /["']/.test(name);
    const quoted = needsQuotes ? `"${name.replace(/"/g, '')}"` : name;
    return `${quoted}, Inter, system-ui, -apple-system, sans-serif`;
};

const getIcon = (type: string) => {
    switch (type) {
        case 'whatsapp': return LucideIcons.MessageCircle;
        case 'instagram': return LucideIcons.Instagram;
        case 'linkedin': return LucideIcons.Linkedin;
        case 'website': return LucideIcons.Globe;
        default: return LucideIcons.Link;
    }
};

const hexToRgb = (hex: string) => {
    const h = hex.replace('#', '').trim();
    if (![3, 6].includes(h.length)) return null;
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const n = parseInt(full, 16);
    if (Number.isNaN(n)) return null;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const relativeLuminance = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    const srgb = [rgb.r, rgb.g, rgb.b].map(v => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
};

const pickReadableOn = (hexBg: string, light = '#F8FAFC', dark = '#0B1220') => {
    const lum = relativeLuminance(hexBg);
    if (lum === null) return light;
    return lum > 0.62 ? dark : light;
};

const CommunityProfilePreviewLite: React.FC<Props> = ({ profile }) => {
    const theme = profile.theme || themePresets['Crimson Noir'] || {
        primary: '#3b82f6',
        text: '#ffffff',
        muted: 'rgba(255,255,255,0.7)',
        border: 'rgba(255,255,255,0.10)',
        cardBg: 'rgba(0,0,0,0.30)',
        shadow: '0 12px 40px rgba(0,0,0,0.35)',
        radius: '18px',
        buttonStyle: 'glass',
        backgroundType: 'color',
        backgroundValue: '#0A0A0A',
        backgroundDirection: 'to bottom',
        backgroundValueSecondary: '#0A0A0A',
    };

    const fonts = profile.fonts || {
        headingFont: 'Poppins',
        bodyFont: 'Inter',
        buttonFont: 'Inter',
    };

    // Fontes normalizadas
    const headingFont = normalizeFontStack(fonts.headingFont);
    const bodyFont = normalizeFontStack(fonts.bodyFont);
    const buttonFont = normalizeFontStack(fonts.buttonFont);

    // Background
    const bgComputed = useMemo(() => {
        if (theme.backgroundType === 'preset') {
            return theme.backgroundValue;
        }
        if (theme.backgroundType === 'gradient') {
            const colors = [theme.backgroundValue];
            if (theme.backgroundValueSecondary) colors.push(theme.backgroundValueSecondary);
            if (theme.backgroundValueTertiary) colors.push(theme.backgroundValueTertiary);
            return `linear-gradient(${theme.backgroundDirection || 'to bottom'}, ${colors.join(', ')})`;
        }
        if (theme.backgroundType === 'image') {
            return theme.backgroundValue.startsWith('url') ? theme.backgroundValue : `url(${theme.backgroundValue})`;
        }
        return theme.backgroundValue || '#0A0A0A';
    }, [theme]);

    const activePreset = useMemo(() => {
        if (theme.backgroundType !== 'preset') return null;
        return backgroundPresets.find(p => p.gradient === theme.backgroundValue);
    }, [theme.backgroundType, theme.backgroundValue]);

    const bgStyle: React.CSSProperties = {
        background: theme.backgroundType === 'image' || theme.backgroundType === 'preset' ? undefined : bgComputed,
        backgroundImage: theme.backgroundType === 'image' || theme.backgroundType === 'preset' ? bgComputed : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100%',
        height: '100%',
        position: 'absolute',
        inset: 0,
        zIndex: 0
    };

    const buttons = (profile.buttons || []).filter(b => b.enabled).slice(0, 2); // Exibe no máximo 2 botões

    const borderWidth = theme.borderWidth || '1px';

    const getButtonStyle = () => {
        const baseBorder = `${borderWidth} solid ${theme.border}`;
        const backgroundColor =
            theme.buttonStyle === 'solid'
                ? theme.primary
                : theme.buttonStyle === 'outline'
                    ? 'transparent'
                    : 'rgba(255,255,255,0.08)';

        const color =
            theme.buttonStyle === 'solid'
                ? pickReadableOn(theme.primary)
                : theme.text;

        let border = baseBorder;
        switch (theme.buttonStyle) {
            case 'solid':
                border = `${borderWidth} solid rgba(255,255,255,0.12)`;
                break;
            case 'glass':
                border = `${borderWidth} solid ${theme.border}`;
                break;
            case 'outline':
                border = `${borderWidth} solid ${theme.primary}`;
                break;
        }

        return {
            borderRadius: theme.radius,
            border,
            backgroundColor,
            color,
            fontFamily: buttonFont
        };
    };

    const buttonStyle = getButtonStyle();

    // Dados simulados ou reais limitados
    const activeCatalog = (profile.catalogItems || []).filter(i => i.isActive).slice(0, 1);
    const hasPix = profile.pixKey && profile.pixKey.length > 0;

    return (
        <div className="w-full relative bg-black flex flex-col items-center pt-10 px-6 pb-12"
            style={{ fontFamily: bodyFont, minHeight: '100%' }}>

            <div style={bgStyle} />

            {/* Efeitos de Preset */}
            {activePreset?.config?.noise && <div className="bg-effect-noise absolute inset-0 z-0 opacity-30 pointer-events-none" />}
            {activePreset?.config?.grain && <div className="bg-effect-grain absolute inset-0 z-0 opacity-30 pointer-events-none" />}

            {/* Overlay para legibilidade */}
            <div className="absolute inset-0 bg-black/10 z-0 pointer-events-none" />

            <div className="relative z-10 w-full flex flex-col items-center text-center space-y-6">

                {/* Header Section */}
                <div className="flex flex-col items-center space-y-3">
                    <div className="w-24 h-24 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden">
                        <img src={profile.avatarUrl || 'https://picsum.photos/200'} className="w-full h-full object-cover" alt="" />
                    </div>

                    <div className="space-y-1 w-full">
                        <h3 className="text-lg font-black leading-tight break-words"
                            style={{ fontFamily: headingFont, color: theme.text }}>
                            {profile.displayName}
                        </h3>
                        {profile.headline && (
                            <p className="text-xs opacity-90 leading-relaxed max-w-[90%] mx-auto" style={{ color: theme.text }}>
                                {profile.headline}
                            </p>
                        )}
                    </div>

                    {/* Tag de Tipo */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">
                        {profile.profileType === 'business' ? <Building2 size={10} className="text-white/70" /> : <User size={10} className="text-white/70" />}
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/90">
                            {profile.profileType === 'business' ? 'Empresa' : 'Profissional'}
                        </span>
                    </div>
                </div>

                {/* Buttons Lite */}
                <div className="w-full space-y-3">
                    {buttons.map(btn => {
                        const Icon = getIcon(btn.type);
                        return (
                            <div key={btn.id}
                                className="w-full py-3 px-4 flex items-center gap-4 transition-transform active:scale-95 shadow-lg relative overflow-hidden group"
                                style={buttonStyle}>
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Icon size={18} className="shrink-0" />
                                <span className="truncate text-xs flex-1 text-left">{btn.label}</span>
                                <LucideIcons.ChevronRight size={14} className="opacity-50" />
                            </div>
                        )
                    })}
                </div>

                {/* Pix Lite */}
                {hasPix && (
                    <div className="w-full p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm flex items-center justify-between gap-3">
                        <div className="flex flex-col items-start gap-0.5">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-70" style={{ color: theme.text }}>Chave Pix</span>
                            <span className="text-xs font-bold truncate max-w-[180px]" style={{ color: theme.text }}>{profile.pixKey}</span>
                        </div>
                        <LucideIcons.Copy size={16} style={{ color: theme.primary }} />
                    </div>
                )}

                {/* Catalog Lite */}
                {activeCatalog.length > 0 && (
                    <div className="w-full space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 w-full text-left ml-1" style={{ color: theme.text }}>
                            Destaque
                        </h4>
                        {activeCatalog.map(item => (
                            <div key={item.id} className="w-full aspect-square rounded-2xl overflow-hidden relative group border border-white/10 shadow-lg">
                                <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 text-left">
                                    <span className="text-sm font-black text-white">{item.title}</span>
                                    <span className="text-xs font-bold text-white/80">{item.priceText}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Spacer final para garantir scroll */}
                <div className="h-4" />
            </div>
        </div>
    );
};

export default CommunityProfilePreviewLite;
