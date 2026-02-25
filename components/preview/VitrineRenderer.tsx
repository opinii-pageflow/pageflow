import {
    ShoppingBag, MessageCircle, Sparkles, ChevronLeft, ChevronRight, X, Zap, Box,
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
    const [currentImageIdxModal, setCurrentImageIdxModal] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, ShowcaseOption>>({});
    const [filterKind, setFilterKind] = useState<'all' | 'physical' | 'digital'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredItems = useMemo(() => {
        const items = (showcase?.items || [])
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

        // Se estiver no preview, mostramos apenas o primeiro item para focar no layout e botões
        if (isPreview) {
            return items.slice(0, 1);
        }

        return items;
    }, [showcase?.items, filterKind, searchQuery, isPreview]);

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

    const itemTemplate = showcase.itemTemplate || 'modern';

    const getButtonStyle = (isGradient: boolean, color1: string, color2?: string) => {
        if (isGradient && color2) {
            return {
                background: `linear-gradient(135deg, ${color1}, ${color2})`,
                color: pickReadableOn(color1),
                fontFamily: buttonFontStack
            };
        }
        return {
            background: color1 || '#ffffff',
            color: pickReadableOn(color1 || '#ffffff'),
            fontFamily: buttonFontStack
        };
    };

    return (
        <div
            className={clsx(
                "w-full text-white bg-[#050505] selection:bg-blue-500/30 selection:text-white",
                !isPreview && "min-h-screen pb-20"
            )}
            style={{ fontFamily: bodyFontStack }}
        >
            {/* Cabeçalho do Perfil na Vitrine - Sempre presente */}
            <header className="max-w-7xl mx-auto px-4 pt-12 pb-8 flex flex-col items-center text-center">
                <div className="relative mb-6">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] overflow-hidden ring-4 ring-white/5 shadow-2xl">
                        <img
                            src={profile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'}
                            alt={profile.displayName}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2 italic uppercase" style={{ fontFamily: headingFontStack }}>
                    {profile.displayName}
                </h1>
                <p className="text-blue-500 text-xs md:text-sm font-black uppercase tracking-[0.3em] mb-4">
                    {profile.headline || 'Profissional'}
                </p>

                {profile.bioShort && (
                    <p className="max-w-lg text-zinc-500 text-xs md:text-sm leading-relaxed mb-8 font-medium">
                        {profile.bioShort}
                    </p>
                )}

                {/* Redes Sociais Rápidas */}
                <div className="flex flex-wrap justify-center gap-3">
                    {profile.buttons?.filter(b => b.enabled && b.visibility === 'public').slice(0, 6).map((btn) => {
                        const Icon = getIconForType(btn.type);
                        const brandColor = getIconColor(btn.type);
                        return (
                            <a
                                key={btn.id}
                                href={formatLink(btn.type, btn.value)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: brandColor }}
                                className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 hover:border-white/10 transition-all active:scale-90 shadow-lg shadow-black/20"
                            >
                                <Icon size={18} />
                            </a>
                        );
                    })}
                </div>

                {/* Filtros de Categoria */}
                <div className="mt-12 flex items-center justify-center p-1.5 bg-zinc-950/50 border border-white/5 rounded-2xl gap-1">
                    {[
                        { id: 'all', label: 'Todos', icon: ShoppingBag },
                        { id: 'physical', label: 'Físicos', icon: Box },
                        { id: 'digital', label: 'Digitais', icon: Zap }
                    ].map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setFilterKind(f.id as any)}
                            className={clsx(
                                "flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                filterKind === f.id
                                    ? "bg-white text-black shadow-xl scale-105"
                                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <f.icon size={12} />
                            {f.label}
                        </button>
                    ))}
                </div>

                <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mt-12" />
            </header>

            <main className={clsx("max-w-7xl mx-auto px-4 relative z-10", isPreview ? "py-4" : "py-8")}>
                {/* Se houver apenas um item no preview, centralizamos e destacamos */}
                <div className={clsx(
                    "grid gap-6",
                    isPreview && filteredItems.length === 1 ? "max-w-md mx-auto grid-cols-1" :
                        itemTemplate === 'list' ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start"
                )}>
                    {filteredItems.map((item) => {
                        const currentImageIdx = activeImages[item.id] || 0;
                        const allImages = [
                            ...(item.mainImageUrl ? [{ id: 'main', storagePath: item.mainImageUrl }] : []),
                            ...(item.images || []),
                            ...(item.videoUrl ? [{ id: 'video', storagePath: 'video', type: 'video' }] : [])
                        ];

                        // Definição de estilos baseados no template
                        const cardClasses = clsx(
                            "group overflow-hidden flex flex-col transition-all duration-500 cursor-pointer",
                            itemTemplate === 'modern' && "bg-zinc-950 border border-white/5 rounded-[2.5rem] shadow-2xl hover:border-white/10 hover:translate-y-[-4px]",
                            itemTemplate === 'list' && "bg-zinc-950/50 border border-white/5 rounded-3xl flex-row items-center p-4 gap-6",
                            itemTemplate === 'glassy' && "bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl hover:bg-white/10",
                            itemTemplate === 'transparent' && "bg-transparent border-none rounded-none p-0 group-hover:opacity-90",
                            itemTemplate === 'neon' && "bg-zinc-950 border-2 rounded-[2.5rem] transition-all duration-300",
                            itemTemplate === '3d' && "bg-zinc-900 border border-white/10 rounded-[2.5rem] shadow-[20px_20px_60px_#000000,-5px_-5px_30px_#1a1a1a] hover:rotate-2 hover:scale-105"
                        );

                        const cardStyle: any = {};
                        if (itemTemplate === 'neon') {
                            cardStyle.borderColor = showcase.buttonColor || '#3b82f6';
                            cardStyle.boxShadow = `0 0 20px ${(showcase.buttonColor || '#3b82f6')}20`;
                        }

                        return (
                            <div
                                key={item.id}
                                onClick={() => { setSelectedItem(item); setCurrentImageIdxModal(0); }}
                                className={cardClasses}
                                style={cardStyle}
                            >
                                <div className={clsx(
                                    "relative overflow-hidden",
                                    itemTemplate === 'list' ? "w-24 h-24 rounded-2xl flex-shrink-0" : "aspect-square bg-zinc-900"
                                )}>
                                    {allImages.length > 0 ? (
                                        <div className="relative w-full h-full group/gallery">
                                            {allImages[currentImageIdx]?.type === 'video' ? (
                                                <div className="w-full h-full bg-black flex items-center justify-center relative">
                                                    <iframe
                                                        src={item.videoUrl && (item.videoUrl.includes('youtube.com') || item.videoUrl.includes('youtu.be'))
                                                            ? `https://www.youtube.com/embed/${item.videoUrl.split('v=')[1]?.split('&')[0] || item.videoUrl.split('/').pop()}`
                                                            : item.videoUrl}
                                                        className="absolute inset-0 w-full h-full"
                                                        allowFullScreen
                                                    />
                                                </div>
                                            ) : (
                                                <img src={allImages[currentImageIdx]?.storagePath} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                            )}

                                            {allImages.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handlePrevImage(item.id, allImages.length); }}
                                                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover/gallery:opacity-100 transition-all hover:bg-black/80 z-10"
                                                    >
                                                        <ChevronLeft size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleNextImage(item.id, allImages.length); }}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover/gallery:opacity-100 transition-all hover:bg-black/80 z-10"
                                                    >
                                                        <ChevronRight size={16} />
                                                    </button>

                                                    {/* Indicadores */}
                                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover/gallery:opacity-100 transition-opacity">
                                                        {allImages.map((_, i) => (
                                                            <div key={i} className={clsx("w-1.5 h-1.5 rounded-full transition-all", i === currentImageIdx ? "bg-white w-4" : "bg-white/30")} />
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-800">
                                            <Sparkles size={itemTemplate === 'list' ? 24 : 48} />
                                        </div>
                                    )}
                                    {item.tag && (
                                        <div className="absolute top-4 left-4 px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-xl z-20">
                                            {item.tag}
                                        </div>
                                    )}
                                    {/* Tag de Categoria (Físico/Digital) */}
                                    <div className={clsx(
                                        "absolute top-4 right-4 px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full shadow-xl z-20 flex items-center gap-1.5 backdrop-blur-md border",
                                        item.kind === 'digital'
                                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                                            : "bg-blue-500/20 text-blue-400 border-blue-500/20"
                                    )}>
                                        {item.kind === 'digital' ? <Zap size={8} /> : <Box size={8} />}
                                        {item.kind === 'digital' ? 'Digital' : 'Físico'}
                                    </div>
                                </div>
                                <div className={clsx(
                                    itemTemplate === 'list' ? "flex flex-col flex-1" : "p-6 flex flex-col flex-1 space-y-4"
                                )}>
                                    <div className="flex-1">
                                        <h2 className={clsx(
                                            "font-black text-white leading-tight",
                                            itemTemplate === 'list' ? "text-sm mb-1" : "text-lg mb-2"
                                        )} style={{ fontFamily: headingFontStack }}>{item.title}</h2>
                                        <div className="flex flex-col mb-4">
                                            {item.originalPrice && item.originalPrice > item.basePrice && (
                                                <span className="text-[11px] font-black text-zinc-600 line-through">R${item.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                            )}
                                            <div className={clsx(
                                                "font-black text-emerald-400",
                                                itemTemplate === 'list' ? "text-base" : "text-2xl"
                                            )}>R${item.basePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                        </div>
                                        {itemTemplate !== 'list' && (
                                            <p className="text-xs italic line-clamp-3 whitespace-pre-wrap opacity-80" style={{ color: showcase.descriptionColor || '#71717a' }}>
                                                {item.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        {itemTemplate !== 'list' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCTA(item);
                                                }}
                                                style={getButtonStyle(showcase.buttonGradientEnabled || false, showcase.buttonColor || '#ffffff', showcase.buttonSecondaryColor)}
                                                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
                                            >
                                                <ShoppingBag size={16} /> Comprar
                                            </button>
                                        )}

                                        {/* Variações no Card - Agora visíveis em todos os templates e empilhadas */}
                                        {item.options && item.options.length > 0 && (
                                            <div className="pt-2 flex flex-col gap-2">
                                                {item.options.slice(0, 5).map(opt => (
                                                    <div key={opt.id} className="flex items-center justify-between gap-3 bg-white/[0.03] border border-white/5 px-3 py-2.5 rounded-xl group/opt hover:bg-white/[0.06] transition-all">
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-[10px] font-black text-white truncate mb-0.5">{opt.label}</span>
                                                            <div className="flex items-baseline gap-1.5">
                                                                <span className="text-xs font-black text-emerald-400">R${opt.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                                {opt.originalPrice && opt.originalPrice > opt.price && (
                                                                    <span className="text-[9px] font-bold text-zinc-600 line-through">R${opt.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {opt.link && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    window.open(opt.link, '_blank');
                                                                }}
                                                                style={getButtonStyle(showcase.buttonGradientEnabled || false, showcase.buttonColor || '#ffffff', showcase.buttonSecondaryColor)}
                                                                className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-black text-[8px] uppercase tracking-widest shadow-lg active:scale-95 transition-all flex-shrink-0"
                                                            >
                                                                <ShoppingBag size={10} /> Comprar
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                {item.options.length > 5 && (
                                                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest text-center pt-1">+{item.options.length - 5} outras opções</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Modal de Detalhes do Item */}
            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setSelectedItem(null)} />

                    <div className="relative w-full max-w-6xl h-full max-h-[90vh] bg-zinc-950 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col md:flex-row group">
                        {/* Fechar */}
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="absolute top-6 right-6 z-50 p-3 bg-white/5 hover:bg-white/10 text-white rounded-full border border-white/5 transition-all active:scale-90"
                        >
                            <X size={20} />
                        </button>

                        {(() => {
                            const allImagesModal = [
                                ...(selectedItem.mainImageUrl ? [{ id: 'main', storagePath: selectedItem.mainImageUrl }] : []),
                                ...(selectedItem.images || []),
                                ...(selectedItem.videoUrl ? [{ id: 'video', storagePath: 'video', type: 'video' }] : [])
                            ];

                            return (
                                <>

                                    <div className="w-full md:w-1/2 aspect-square md:aspect-auto bg-zinc-900 relative overflow-hidden flex flex-col">
                                        {/* Imagem/Vídeo Principal do Modal */}
                                        <div className="relative flex-1 group/modal-gall">
                                            {allImagesModal.length > 0 ? (
                                                allImagesModal[currentImageIdxModal]?.type === 'video' ? (
                                                    <div className="w-full h-full bg-black flex items-center justify-center relative">
                                                        <iframe
                                                            src={selectedItem.videoUrl && (selectedItem.videoUrl.includes('youtube.com') || selectedItem.videoUrl.includes('youtu.be'))
                                                                ? `https://www.youtube.com/embed/${selectedItem.videoUrl.split('v=')[1]?.split('&')[0] || selectedItem.videoUrl.split('/').pop()}`
                                                                : selectedItem.videoUrl}
                                                            className="absolute inset-0 w-full h-full"
                                                            allowFullScreen
                                                        />
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={allImagesModal[currentImageIdxModal]?.storagePath}
                                                        alt={selectedItem.title}
                                                        className="w-full h-full object-cover transition-all duration-500"
                                                    />
                                                )
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-800">
                                                    <Sparkles size={64} />
                                                </div>
                                            )}

                                            {allImagesModal.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={() => setCurrentImageIdxModal(prev => (prev - 1 + allImagesModal.length) % allImagesModal.length)}
                                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-black/50 text-white rounded-full backdrop-blur-md opacity-0 group-hover/modal-gall:opacity-100 transition-all border border-white/10"
                                                    >
                                                        <ChevronLeft size={24} />
                                                    </button>
                                                    <button
                                                        onClick={() => setCurrentImageIdxModal(prev => (prev + 1) % allImagesModal.length)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-black/50 text-white rounded-full backdrop-blur-md opacity-0 group-hover/modal-gall:opacity-100 transition-all border border-white/10"
                                                    >
                                                        <ChevronRight size={24} />
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        {/* Miniaturas da Galeria no Modal */}
                                        {allImagesModal.length > 1 && (
                                            <div className="p-4 bg-black/20 backdrop-blur-md border-t border-white/5 flex gap-2 overflow-x-auto custom-scrollbar shrink-0">
                                                {allImagesModal.map((img, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setCurrentImageIdxModal(i)}
                                                        className={clsx(
                                                            "w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 relative",
                                                            i === currentImageIdxModal ? "border-blue-500 scale-105" : "border-transparent opacity-50 hover:opacity-100"
                                                        )}
                                                    >
                                                        {img.type === 'video' ? (
                                                            <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                                                                <Youtube size={24} className="text-red-500" />
                                                            </div>
                                                        ) : (
                                                            <img src={img.storagePath} alt="" className="w-full h-full object-cover" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Removido duplicidade de vídeo abaixo da galeria, agora está na sequência */}
                                    </div>

                                    <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col bg-zinc-950">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-6">
                                                {selectedItem.tag && (
                                                    <span className="px-3 py-1 bg-blue-600/10 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-500/20">
                                                        {selectedItem.tag}
                                                    </span>
                                                )}
                                                <span className={clsx(
                                                    "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border flex items-center gap-1.5",
                                                    selectedItem.kind === 'digital'
                                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                        : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                )}>
                                                    {selectedItem.kind === 'digital' ? <Zap size={10} /> : <Box size={10} />}
                                                    {selectedItem.kind === 'digital' ? 'Conteúdo Digital' : 'Produto Físico'}
                                                </span>
                                            </div>
                                            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4" style={{ fontFamily: headingFontStack }}>
                                                {selectedItem.title}
                                            </h2>

                                            <div className="flex items-baseline gap-4 mb-8">
                                                <div className="text-4xl md:text-5xl font-black text-emerald-400">
                                                    R${selectedItem.basePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </div>
                                                {selectedItem.originalPrice && selectedItem.originalPrice > selectedItem.basePrice && (
                                                    <div className="text-lg font-bold text-zinc-600 line-through">
                                                        R${selectedItem.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-6">
                                                <div>
                                                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">Descrição</h4>
                                                    <p className="leading-relaxed text-sm md:text-base whitespace-pre-wrap opacity-90" style={{ color: showcase.descriptionColor || '#9ca3af' }}>
                                                        {selectedItem.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8">
                                            <button
                                                onClick={() => handleCTA(selectedItem)}
                                                style={getButtonStyle(showcase.buttonGradientEnabled || false, showcase.buttonColor || '#ffffff', showcase.buttonSecondaryColor)}
                                                className="w-full py-5 rounded-[1.5rem] flex items-center justify-center gap-3 font-black text-sm uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all mb-10"
                                            >
                                                {selectedItem.ctaType === 'whatsapp' ? <MessageCircle size={22} /> : <ShoppingBag size={22} />}
                                                {selectedItem.ctaType === 'whatsapp' ? 'Chamar no WhatsApp' : 'Comprar Agora'}
                                            </button>

                                            {/* Variações no Modal - Agora embaixo do botão */}
                                            {selectedItem.options && selectedItem.options.length > 0 && (
                                                <div className="animate-in slide-in-from-bottom-4 duration-500 delay-100 mb-10">
                                                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                                        <div className="h-px flex-1 bg-white/5" />
                                                        Outras Opções
                                                        <div className="h-px flex-1 bg-white/5" />
                                                    </h4>
                                                    <div className="flex flex-col gap-4">
                                                        {selectedItem.options.map((opt) => (
                                                            <div
                                                                key={opt.id}
                                                                className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group/opt hover:bg-white/[0.05] transition-all"
                                                            >
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-black text-white mb-2">{opt.label}</span>
                                                                    <div className="flex items-baseline gap-2">
                                                                        <span className="text-xl font-black text-emerald-400">
                                                                            R${opt.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                                        </span>
                                                                        {opt.originalPrice && opt.originalPrice > opt.price && (
                                                                            <span className="text-xs font-bold text-zinc-600 line-through">
                                                                                R${opt.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {opt.link && (
                                                                    <button
                                                                        onClick={() => window.open(opt.link, '_blank')}
                                                                        style={getButtonStyle(showcase.buttonGradientEnabled || false, showcase.buttonColor || '#ffffff', showcase.buttonSecondaryColor)}
                                                                        className="w-full sm:w-auto px-8 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                                                                    >
                                                                        <ShoppingBag size={14} /> Comprar
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest text-center">
                                                Transação Segura via {profile.displayName}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default VitrineRenderer;