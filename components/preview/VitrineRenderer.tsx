import {
    ShoppingBag, MessageCircle, Sparkles, ChevronLeft, ChevronRight, X, Zap,
    Instagram, Linkedin, Globe, Phone, Mail, MapPin, Youtube, Github, Facebook, Twitter, Music2, Send, AtSign, Tv, MessageSquare, ExternalLink
} from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import { Profile, Showcase, ShowcaseItem, ShowcaseImage, ShowcaseOption, ShowcaseTestimonial } from '../../types';
import clsx from 'clsx';
import { getIconColor, formatLink } from '../../lib/linkHelpers';

interface Props {
    profile: Profile;
    showcase: (Showcase & { items: (ShowcaseItem & { images: ShowcaseImage[], options: ShowcaseOption[], testimonials: ShowcaseTestimonial[] })[] }) | null;
    isPreview?: boolean;
}

const iconMap: Record<string, any> = {
    whatsapp: MessageCircle,
    instagram: Instagram,
    linkedin: Linkedin,
    website: Globe,
    phone: Phone,
    email: Mail,
    maps: MapPin,
    youtube: Youtube,
    github: Github,
    facebook: Facebook,
    twitter: Twitter,
    x: Twitter,
    tiktok: Music2,
    telegram: Send,
    threads: AtSign,
    twitch: Tv,
    discord: MessageSquare
};

const getIconForType = (type: string) => iconMap[type] || Globe;

const hexToRgb = (hex: string) => {
    if (!hex || typeof hex !== 'string') return null;
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
    if (!hexBg || typeof hexBg !== 'string') return light;
    const lum = relativeLuminance(hexBg);
    if (lum === null) return light;
    return lum > 0.62 ? dark : light;
};

const normalizeFontStack = (font: string) => {
    const name = font || 'Poppins';
    const needsQuotes = /\s/.test(name) || /["']/.test(name);
    const quoted = needsQuotes ? `"${name.replace(/"/g, '')}"` : name;
    return `${quoted}, Inter, system-ui, -apple-system, sans-serif`;
};

const VitrineRenderer: React.FC<Props> = ({ profile, showcase, isPreview }) => {
    const [activeImages, setActiveImages] = useState<Record<string, number>>({});
    const [showVideo, setShowVideo] = useState<Record<string, boolean>>({});
    const [selectedItem, setSelectedItem] = useState<(ShowcaseItem & { images: ShowcaseImage[], options: ShowcaseOption[], testimonials: ShowcaseTestimonial[] }) | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, ShowcaseOption>>({});
    const [filterKind, setFilterKind] = useState<'all' | 'physical' | 'digital'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredItems = useMemo(() => {
        return (showcase?.items || [])
            .filter(item => item.isActive)
            .filter(item => {
                if (filterKind === 'all') return true;
                return item.kind === filterKind;
            })
            .filter(item => {
                if (!searchQuery) return true;
                const search = searchQuery.toLowerCase();
                return item.title.toLowerCase().includes(search) ||
                    item.description?.toLowerCase().includes(search) ||
                    item.tag?.toLowerCase().includes(search);
            })
            .sort((a, b) => a.sortOrder - b.sortOrder);
    }, [showcase?.items, filterKind, searchQuery]);

    // Dynamic Fonts
    const fonts = useMemo(() => {
        return (profile as any).fonts || {
            headingFont: 'Poppins',
            bodyFont: 'Inter',
            buttonFont: 'Inter'
        };
    }, [profile]);

    const headingFontStack = useMemo(() => normalizeFontStack(fonts.headingFont), [fonts.headingFont]);
    const bodyFontStack = useMemo(() => normalizeFontStack(fonts.bodyFont), [fonts.bodyFont]);
    const buttonFontStack = useMemo(() => normalizeFontStack(fonts.buttonFont || fonts.bodyFont), [fonts.buttonFont, fonts.bodyFont]);

    useEffect(() => {
        const uniqueFamilies = Array.from(new Set([
            fonts.headingFont,
            fonts.bodyFont,
            fonts.buttonFont
        ].filter(Boolean))).map(f => f.split(',')[0].replace(/['"]/g, '').trim());

        if (uniqueFamilies.length === 0) return;

        const query = uniqueFamilies.map(name => `family=${name.replace(/ /g, '+')}:wght@400;500;600;700;800;900`).join('&');
        const url = `https://fonts.googleapis.com/css2?${query}&display=swap`;

        const linkId = `vitrine-fonts-${profile.id}`;
        let link = document.getElementById(linkId) as HTMLLinkElement;
        if (!link) {
            link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
        link.href = url;

        return () => {
            if (!isPreview) {
                const toRemove = document.getElementById(linkId);
                if (toRemove) toRemove.remove();
            }
        };
    }, [fonts, profile.id, isPreview]);

    const handleNextImage = (itemId: string, max: number) => {
        setActiveImages(prev => ({
            ...prev,
            [itemId]: ((prev[itemId] || 0) + 1) % max
        }));
    };

    const handlePrevImage = (itemId: string, max: number) => {
        setActiveImages(prev => ({
            ...prev,
            [itemId]: ((prev[itemId] || 0) - 1 + max) % max
        }));
    };

    const handleCTA = (item: ShowcaseItem) => {
        if (isPreview) return;
        const selectedOpt = selectedOptions[item.id];
        const ctaValue = (selectedOpt && selectedOpt.link) ? selectedOpt.link : item.ctaValue;

        if (item.ctaType === 'whatsapp') {
            const msg = encodeURIComponent(ctaValue || `Olá! Tenho interesse no item: ${item.title}${selectedOpt ? ` (${selectedOpt.label})` : ''}`);
            const phone = profile?.bookingWhatsapp?.replace(/\D/g, '') || '';
            window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
        } else if (ctaValue) {
            window.open(ctaValue, '_blank');
        }
    };

    if (!showcase || !showcase.isActive) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                <div className="w-20 h-20 rounded-[2rem] bg-zinc-900 border border-white/5 flex items-center justify-center mb-6">
                    <ShoppingBag size={32} className="text-zinc-700" />
                </div>
                <h1 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">Vitrine Indisponível</h1>
                <p className="text-zinc-500 text-sm max-w-xs font-medium">Esta vitrine ainda não possui itens ativos.</p>
            </div>
        );
    }

    return (
        <div
            className={clsx(
                "w-full h-full text-white selection:bg-blue-500/30 selection:text-white",
                isPreview ? "" : "min-h-screen pb-20 bg-[#050505]"
            )}
            style={{ fontFamily: bodyFontStack }}
        >
            {!isPreview && (
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/5 blur-[120px] rounded-full" />
                </div>
            )}

            <main className={clsx(
                "max-w-7xl mx-auto px-4 relative z-10",
                isPreview ? "py-4" : "py-8"
            )}>
                {/* Header / Search / Filter */}
                <div className="mb-12 space-y-12">
                    <header className="flex flex-col md:flex-row-reverse items-center justify-between gap-8 md:gap-12">
                        {profile.avatarUrl && (
                            <div className="relative group shrink-0">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-[2.5rem] border border-white/10 overflow-hidden bg-black shadow-2xl">
                                    <img
                                        src={profile.avatarUrl}
                                        alt={profile.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-4 max-w-2xl">
                            <div className="space-y-1">
                                <h1
                                    className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-white leading-tight"
                                    style={{ fontFamily: headingFontStack }}
                                >
                                    {profile.name}
                                </h1>
                                {profile.headline && (
                                    <p className="text-blue-500 text-base sm:text-xl font-black uppercase tracking-[0.2em]">
                                        {profile.headline}
                                    </p>
                                )}
                            </div>

                            {profile.bioShort && (
                                <p
                                    className="text-zinc-400 text-sm sm:text-base font-medium leading-relaxed max-w-xl"
                                    style={{ fontFamily: bodyFontStack }}
                                >
                                    {profile.bioShort}
                                </p>
                            )}

                            {/* Shortcut Buttons */}
                            {showcase.headerButtonIds && showcase.headerButtonIds.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {profile.buttons
                                        ?.filter(btn => showcase.headerButtonIds?.includes(btn.id))
                                        .map(btn => {
                                            const Icon = getIconForType(btn.type);
                                            const brandColor = getIconColor(btn.type);
                                            return (
                                                <a
                                                    key={btn.id}
                                                    href={formatLink(btn.type, btn.value)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2.5 shadow-2xl transition-all flex items-center gap-2.5 group"
                                                    style={{
                                                        fontFamily: buttonFontStack,
                                                        backgroundColor: profile.theme.primary || '#3b82f6',
                                                        color: pickReadableOn(profile.theme.primary || '#3b82f6'),
                                                        borderRadius: profile.theme.radius || '12px',
                                                        border: profile.theme.buttonStyle === 'outline' ? `1px solid ${profile.theme.primary}` : 'none',
                                                        borderBottom: `3px solid ${brandColor}`,
                                                        fontSize: '10px',
                                                        fontWeight: 900,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em'
                                                    }}
                                                >
                                                    {Icon && <Icon size={14} style={{ color: pickReadableOn(profile.theme.primary || '#3b82f6') }} className="group-hover:scale-110 transition-transform opacity-80" />}
                                                    <span>{btn.label || btn.type}</span>
                                                </a>
                                            );
                                        })
                                    }
                                </div>
                            )}
                        </div>
                    </header>

                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.02] border border-white/5 p-2 rounded-[2rem] backdrop-blur-xl">
                        <div className="flex items-center gap-2 p-2 bg-black/40 rounded-[1.5rem] border border-white/5 w-full md:w-auto">
                            <button
                                onClick={() => setFilterKind('all')}
                                className={clsx(
                                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    filterKind === 'all' ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-white"
                                )}
                                style={{ fontFamily: buttonFontStack }}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setFilterKind('physical')}
                                className={clsx(
                                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    filterKind === 'physical' ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-white"
                                )}
                                style={{ fontFamily: buttonFontStack }}
                            >
                                Físicos
                            </button>
                            <button
                                onClick={() => setFilterKind('digital')}
                                className={clsx(
                                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    filterKind === 'digital' ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-white"
                                )}
                                style={{ fontFamily: buttonFontStack }}
                            >
                                Digitas
                            </button>
                        </div>

                        <div className="relative w-full md:w-80">
                            <input
                                type="text"
                                placeholder="Buscar itens..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none text-white text-[10px] font-black uppercase tracking-widest outline-none w-full placeholder:text-zinc-700"
                                style={{ fontFamily: bodyFontStack }}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600">
                                <Sparkles size={14} />
                            </div>
                        </div>
                    </div>
                </div>

                {filteredItems.length === 0 ? (
                    <div className="py-20 text-center space-y-4">
                        <div className="w-20 h-20 rounded-[2rem] bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag size={32} className="text-zinc-700" />
                        </div>
                        <p className="text-zinc-500 font-medium">Nenhum item encontrado.</p>
                    </div>
                ) : (
                    <div className={clsx(
                        "grid grid-cols-1 gap-6",
                        !isPreview && "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    )}>
                        {filteredItems.map((item) => {
                            const currentImageIdx = activeImages[item.id] || 0;
                            const allImages = item.mainImageUrl
                                ? [{ id: 'main', storagePath: item.mainImageUrl }, ...item.images]
                                : item.images;

                            const isShowingVideo = showVideo[item.id];

                            return (
                                <div key={item.id} className={clsx(
                                    "group flex flex-col overflow-hidden transition-all duration-500",
                                    showcase.itemTemplate === 'premium'
                                        ? "bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] hover:border-blue-500/30 hover:scale-[1.02]"
                                        : showcase.itemTemplate === 'minimal'
                                            ? "bg-zinc-950/40 border border-white/5 rounded-[2rem] hover:border-zinc-700"
                                            : "bg-zinc-950 border border-white/5 rounded-[2.5rem] shadow-2xl hover:border-white/10 hover:translate-y-[-4px]"
                                )}>

                                    {/* Image/Video Area */}
                                    <div className="relative aspect-square bg-zinc-900 overflow-hidden">
                                        {isShowingVideo && item.videoUrl ? (
                                            <div className="absolute inset-0 bg-black">
                                                <iframe
                                                    src={item.videoUrl.replace('watch?v=', 'embed/').replace('vimeo.com/', 'player.vimeo.com/video/')}
                                                    className="w-full h-full"
                                                    allow="autoplay; fullscreen"
                                                />
                                                <button
                                                    onClick={() => setShowVideo(prev => ({ ...prev, [item.id]: false }))}
                                                    className="absolute top-4 right-4 p-2 bg-black/60 rounded-xl text-white border border-white/10"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                {allImages.length > 0 ? (
                                                    <img
                                                        src={allImages[currentImageIdx]?.storagePath}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <ShoppingBag size={40} className="text-zinc-800" />
                                                    </div>
                                                )}

                                                {allImages.length > 1 && (
                                                    <>
                                                        <div className="absolute inset-0 flex items-center justify-between px-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handlePrevImage(item.id, allImages.length); }}
                                                                className="p-2.5 bg-black/60 backdrop-blur-md rounded-xl text-white border border-white/10 hover:bg-black/80 transition-all"
                                                            >
                                                                <ChevronLeft size={18} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleNextImage(item.id, allImages.length); }}
                                                                className="p-2.5 bg-black/60 backdrop-blur-md rounded-xl text-white border border-white/10 hover:bg-black/80 transition-all"
                                                            >
                                                                <ChevronRight size={18} />
                                                            </button>
                                                        </div>
                                                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/5">
                                                            {allImages.map((_, i) => (
                                                                <div
                                                                    key={i}
                                                                    className={clsx(
                                                                        "w-1 h-1 rounded-full transition-all duration-300",
                                                                        i === currentImageIdx ? "bg-white w-3" : "bg-white/20"
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        )}

                                        {item.tag && (
                                            <div className="absolute top-4 left-4 px-3 py-1 bg-blue-600/90 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest text-white shadow-xl z-20">
                                                {item.tag}
                                            </div>
                                        )}

                                        {item.kind === 'digital' && (
                                            <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[8px] font-black uppercase tracking-widest text-blue-400 border border-blue-500/30 z-20 flex items-center gap-1.5">
                                                <Zap size={10} />
                                                Digital
                                            </div>
                                        )}

                                        {item.videoUrl && !isShowingVideo && (
                                            <button
                                                onClick={() => setShowVideo(prev => ({ ...prev, [item.id]: true }))}
                                                className="absolute top-4 right-4 p-2.5 bg-white/10 backdrop-blur-md rounded-xl text-white border border-white/10 hover:bg-white/20 transition-all z-20"
                                            >
                                                <Sparkles size={16} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Info Area (Template Based) */}
                                    <div className={clsx(
                                        "flex-1 flex flex-col",
                                        showcase.itemTemplate === 'premium' ? "p-8 space-y-8 backdrop-blur-3xl bg-white/[0.02]" : "p-6 space-y-6"
                                    )}>
                                        <div className="flex-1">
                                            <div className={clsx(
                                                "flex justify-between items-start gap-4 mb-2",
                                                showcase.itemTemplate === 'premium' && "flex-col gap-1"
                                            )}>
                                                <h2 className={clsx(
                                                    "font-black tracking-tight text-white leading-tight",
                                                    showcase.itemTemplate === 'premium' ? "text-2xl" : "text-lg"
                                                )}
                                                    style={{ fontFamily: headingFontStack }}
                                                >
                                                    {item.title}
                                                </h2>
                                                <div className="flex flex-col items-end shrink-0">
                                                    {item.originalPrice && item.originalPrice > item.basePrice && (
                                                        <span className="text-[10px] font-black text-zinc-600 line-through opacity-60">
                                                            R${item.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </span>
                                                    )}
                                                    {item.basePrice > 0 && (
                                                        <div className={clsx(
                                                            "font-black text-emerald-400 tracking-tighter",
                                                            showcase.itemTemplate === 'premium' ? "text-3xl" : "text-xl"
                                                        )}>
                                                            R${item.basePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <p className={clsx(
                                                "text-zinc-500 font-medium leading-relaxed italic whitespace-pre-wrap",
                                                showcase.itemTemplate === 'premium' ? "text-xs" : "text-[11px] line-clamp-3"
                                            )}
                                                style={{ fontFamily: bodyFontStack }}
                                            >
                                                {item.description}
                                            </p>
                                        </div>

                                        {item.options.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {item.options.map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => setSelectedOptions(prev => ({
                                                            ...prev,
                                                            [item.id]: prev[item.id]?.id === opt.id ? undefined : opt as any
                                                        }))}
                                                        className={clsx(
                                                            "px-3 py-1.5 rounded-lg border transition-all text-[9px] font-bold flex items-center gap-2 group/pill",
                                                            selectedOptions[item.id]?.id === opt.id
                                                                ? "bg-blue-600 border-blue-500 text-white shadow-lg"
                                                                : "bg-white/5 border-white/5 text-zinc-400 hover:border-white/10"
                                                        )}
                                                        style={{ fontFamily: bodyFontStack }}
                                                    >
                                                        {opt.label} •
                                                        {opt.originalPrice && opt.originalPrice > opt.price && (
                                                            <span className="line-through opacity-50 mr-1 ml-1">R${opt.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                        )}
                                                        +R${opt.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        {opt.link && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (opt.link) window.open(opt.link, '_blank');
                                                                }}
                                                                className="p-1.5 -mr-1.5 hover:bg-white/20 rounded-lg transition-all active:scale-90 group/link"
                                                                title="Abrir link da variação"
                                                            >
                                                                <ExternalLink size={11} className={clsx(
                                                                    "transition-all group-hover/link:scale-110",
                                                                    selectedOptions[item.id]?.id === opt.id ? "text-white" : "text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                                                )} />
                                                            </button>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {item.testimonials && item.testimonials.length > 0 && (
                                            <div className="space-y-3 pt-2 border-t border-white/5">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles size={10} className="text-emerald-400" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600"
                                                        style={{ fontFamily: buttonFontStack }}
                                                    >O que dizem</span>
                                                </div>
                                                <div className="space-y-2">
                                                    {item.testimonials.slice(0, 1).map(t => (
                                                        <div key={t.id} className="flex gap-2 items-start">
                                                            <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-white/10 shrink-0 overflow-hidden">
                                                                {t.avatarUrl && <img src={t.avatarUrl} alt="" className="w-full h-full object-cover" />}
                                                            </div>
                                                            <p className="text-[9px] text-zinc-400 italic line-clamp-2"
                                                                style={{ fontFamily: bodyFontStack }}
                                                            >"{t.text}"</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* CTA Button */}
                                        <div className="flex gap-2 mt-auto">
                                            <button
                                                onClick={() => setSelectedItem(item)}
                                                className="px-4 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                                            >
                                                <Sparkles size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleCTA(item)}
                                                style={{
                                                    fontFamily: buttonFontStack,
                                                    background: showcase.buttonGradientEnabled
                                                        ? `linear-gradient(135deg, ${showcase.buttonColor || '#ffffff'}, ${showcase.buttonSecondaryColor || '#000000'})`
                                                        : showcase.buttonColor || (item.ctaType === 'whatsapp' ? '#059669' : '#ffffff'),
                                                    color: (showcase.buttonColor && showcase.buttonColor !== '#ffffff') ? '#ffffff' : (item.ctaType === 'whatsapp' ? '#ffffff' : '#000000'),
                                                    boxShadow: showcase.itemTemplate === 'premium' ? `0 10px 30px -5px ${showcase.buttonColor || '#ffffff'}33` : 'none'
                                                }}
                                                className={clsx(
                                                    "flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-2xl relative overflow-hidden group/btn",
                                                    !showcase.buttonColor && (item.ctaType === 'whatsapp' ? "bg-emerald-600 hover:bg-emerald-500" : "bg-white hover:bg-zinc-200"),
                                                    showcase.itemTemplate === 'premium' && "py-5 rounded-[1.5rem]"
                                                )}
                                            >
                                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                                                {item.ctaType === 'whatsapp' ? <MessageCircle size={16} /> : <ShoppingBag size={16} />}
                                                {item.ctaType === 'whatsapp' ? 'Pedir WhatsApp' : 'Comprar'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Product Details Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedItem(null)} />

                    <div className="relative w-full max-w-5xl max-h-[90vh] bg-zinc-950 border border-white/10 rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-500">
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="absolute top-6 right-6 z-50 p-3 bg-black/60 backdrop-blur-md rounded-2xl text-white border border-white/10 hover:bg-black/80 transition-all hover:scale-110"
                        >
                            <X size={20} />
                        </button>

                        {/* Gallery Side */}
                        <div className="md:w-1/2 relative bg-zinc-900 aspect-square md:aspect-auto">
                            <img
                                src={selectedItem.mainImageUrl || selectedItem.images[0]?.storagePath}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                            {selectedItem.images.length > 0 && (
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5">
                                    {(selectedItem.mainImageUrl ? [selectedItem.mainImageUrl, ...selectedItem.images.map(i => i.storagePath)] : selectedItem.images.map(i => i.storagePath)).slice(0, 5).map((img, i) => (
                                        <div key={i} className="w-12 h-12 rounded-lg border border-white/10 overflow-hidden opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Info Side */}
                        <div className="md:w-1/2 p-8 sm:p-12 overflow-y-auto space-y-10 custom-scrollbar">
                            <div className="space-y-4">
                                {selectedItem.tag && (
                                    <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-500/20">
                                        {selectedItem.tag}
                                    </span>
                                )}
                                <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                                    {selectedItem.title}
                                </h2>
                                <div className="flex flex-col">
                                    {selectedItem.originalPrice && selectedItem.originalPrice > selectedItem.basePrice && (
                                        <span className="text-lg font-black text-zinc-600 line-through opacity-50">
                                            R${selectedItem.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    )}
                                    {selectedItem.basePrice > 0 && (
                                        <div className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tighter">
                                            R${selectedItem.basePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p className="text-zinc-500 text-sm sm:text-base leading-relaxed font-medium italic whitespace-pre-wrap">
                                {selectedItem.description}
                            </p>

                            {selectedItem.options.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Opções Disponíveis</h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {selectedItem.options.map((opt) => (
                                            <div
                                                key={opt.id}
                                                onClick={() => setSelectedOptions(prev => ({
                                                    ...prev,
                                                    [selectedItem.id]: prev[selectedItem.id]?.id === opt.id ? undefined : opt as any
                                                }))}
                                                className={clsx(
                                                    "flex justify-between items-center p-5 rounded-3xl border transition-all cursor-pointer group",
                                                    selectedOptions[selectedItem.id]?.id === opt.id
                                                        ? "bg-blue-600 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                                                        : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={clsx(
                                                        "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                                                        selectedOptions[selectedItem.id]?.id === opt.id ? "border-white bg-white" : "border-zinc-700 bg-black/40"
                                                    )}>
                                                        {selectedOptions[selectedItem.id]?.id === opt.id && (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                                        )}
                                                    </div>
                                                    <span className={clsx(
                                                        "text-sm font-bold transition-colors",
                                                        selectedOptions[selectedItem.id]?.id === opt.id ? "text-white" : "text-zinc-300"
                                                    )}>{opt.label}</span>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-col items-end">
                                                        {opt.originalPrice && opt.originalPrice > opt.price && (
                                                            <span className="text-[10px] font-black text-zinc-600 line-through opacity-60">
                                                                R${opt.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                            </span>
                                                        )}
                                                        <span className={clsx(
                                                            "text-sm font-black transition-colors",
                                                            selectedOptions[selectedItem.id]?.id === opt.id ? "text-white" : "text-emerald-400"
                                                        )}>+ R${opt.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                    </div>

                                                    {opt.link && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (opt.link) window.open(opt.link, '_blank');
                                                            }}
                                                            className={clsx(
                                                                "p-2 rounded-xl border transition-all hover:scale-110 active:scale-95 group/linkbtn",
                                                                selectedOptions[selectedItem.id]?.id === opt.id
                                                                    ? "bg-white/20 border-white/20 text-white"
                                                                    : "bg-blue-600/20 border-blue-500/20 text-blue-400 hover:bg-blue-600/30"
                                                            )}
                                                        >
                                                            <ExternalLink size={14} className="transition-transform group-hover/linkbtn:rotate-12" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedItem.testimonials.length > 0 && (
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">O que nossos clientes dizem</h4>
                                    <div className="space-y-4">
                                        {selectedItem.testimonials.map((t) => (
                                            <div key={t.id} className="p-6 rounded-3xl bg-zinc-900 border border-white/5 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-black border border-white/10 overflow-hidden">
                                                        {t.avatarUrl && <img src={t.avatarUrl} alt="" className="w-full h-full object-cover" />}
                                                    </div>
                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{t.name || 'Cliente'}</span>
                                                </div>
                                                <p className="text-xs text-zinc-400 italic leading-relaxed">"{t.text}"</p>
                                                {t.imageUrl && (
                                                    <div className="rounded-2xl overflow-hidden border border-white/5 aspect-video">
                                                        <img src={t.imageUrl} alt="" className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-700" />
                                                    </div>
                                                )}
                                                {t.videoUrl && (
                                                    <a
                                                        href={t.videoUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all"
                                                    >
                                                        <Sparkles size={12} className="text-blue-500" />
                                                        Ver Vídeo de Depoimento
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => handleCTA(selectedItem)}
                                style={{
                                    background: showcase.buttonGradientEnabled
                                        ? `linear-gradient(135deg, ${showcase.buttonColor || '#ffffff'}, ${showcase.buttonSecondaryColor || '#000000'})`
                                        : showcase.buttonColor || (selectedItem.ctaType === 'whatsapp' ? '#059669' : '#ffffff'),
                                    color: (showcase.buttonColor && showcase.buttonColor !== '#ffffff') ? '#ffffff' : (selectedItem.ctaType === 'whatsapp' ? '#ffffff' : '#000000')
                                }}
                                className="w-full py-6 rounded-[2rem] flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-95 shadow-2xl relative overflow-hidden group/modalbtn"
                            >
                                {selectedItem.ctaType === 'whatsapp' ? <MessageCircle size={20} /> : <ShoppingBag size={20} />}
                                {selectedItem.ctaType === 'whatsapp' ? 'Dizer Olá no WhatsApp' : 'Comprar Agora'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VitrineRenderer;
