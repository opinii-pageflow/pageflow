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

    return (
        <div
            className={clsx(
                "w-full h-full text-white selection:bg-blue-500/30 selection:text-white",
                isPreview ? "" : "min-h-screen pb-20 bg-[#050505]"
            )}
            style={{ fontFamily: bodyFontStack }}
        >
            <main className={clsx("max-w-7xl mx-auto px-4 relative z-10", isPreview ? "py-4" : "py-8")}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map((item) => {
                        const currentImageIdx = activeImages[item.id] || 0;
                        const allImages = item.mainImageUrl ? [{ id: 'main', storagePath: item.mainImageUrl }, ...item.images] : item.images;

                        return (
                            <div key={item.id} className="bg-zinc-950 border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl">
                                <div className="relative aspect-square bg-zinc-900 overflow-hidden">
                                    <img src={allImages[currentImageIdx]?.storagePath} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-6 flex flex-col flex-1 space-y-4">
                                    <div className="flex-1">
                                        <h2 className="text-lg font-black text-white leading-tight mb-2" style={{ fontFamily: headingFontStack }}>{item.title}</h2>
                                        <div className="flex flex-col mb-4">
                                            {item.originalPrice && (
                                                <span className="text-[10px] font-black text-zinc-600 line-through">R${item.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                            )}
                                            <div className="text-xl font-black text-emerald-400">R${item.basePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                        </div>
                                        <p className="text-zinc-500 text-xs italic line-clamp-3">{item.description}</p>
                                    </div>

                                    {item.options.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {item.options.map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setSelectedOptions(prev => ({ ...prev, [item.id]: prev[item.id]?.id === opt.id ? undefined : opt as any }))}
                                                    className={clsx("px-3 py-1.5 rounded-lg border text-[9px] font-bold flex items-center gap-2", selectedOptions[item.id]?.id === opt.id ? "bg-blue-600 border-blue-500 text-white" : "bg-white/5 border-white/5 text-zinc-400")}
                                                >
                                                    {opt.label} • +R${opt.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleCTA(item)}
                                        style={{ background: showcase.buttonColor || '#ffffff', color: pickReadableOn(showcase.buttonColor || '#ffffff'), fontFamily: buttonFontStack }}
                                        className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-2xl"
                                    >
                                        <ShoppingBag size={16} /> Comprar
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

export default VitrineRenderer;