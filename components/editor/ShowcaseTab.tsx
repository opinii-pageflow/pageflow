import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import {
    Plus,
    Trash2,
    Image as ImageIcon,
    Save,
    ChevronDown,
    ChevronUp,
    Settings2,
    Palette,
    GripVertical,
    Check,
    X,
    MessageSquare,
    DollarSign,
    Box,
    Layout as LayoutIcon,
    Copy,
    Share2,
    QrCode,
    Square,
    Sparkles,
    MousePointer2,
    Eye,
    Zap,
    ShoppingBag,
    Upload,
    Store,
    Lock,
    Edit3,
    Video,
    Star,
    Tag,
    ShoppingCart,
    Smartphone,
    Globe,
    Instagram,
    Linkedin,
    Phone,
    Mail,
    MapPin,
    Youtube,
    Github,
    Facebook,
    Twitter,
    Music2,
    Send,
    AtSign,
    Tv
} from 'lucide-react';
import clsx from 'clsx';
import ColorPickerButton from '../common/ColorPickerButton';
import { Profile, PlanType, Showcase, ShowcaseItem, ShowcaseImage, ShowcaseOption, ShowcaseTestimonial } from '../../types';
import { showcaseApi } from '../../lib/api/showcase';
import { QRCodeSVG } from 'qrcode.react';
import { getIconColor, detectLinkType, formatLink } from '../../lib/linkHelpers';

type Props = {
    profile: Profile;
    clientPlan?: PlanType;
    onUpdate: (updates: Partial<Profile>) => void;
    onSync?: (showcase: any) => void;
};

const iconMap: Record<string, any> = {
    whatsapp: MessageSquare,
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

const ShowcaseTab: React.FC<Props> = ({ profile, clientPlan, onUpdate, onSync }) => {
    const [showcase, setShowcase] = useState<(Showcase & { items: (ShowcaseItem & { images: ShowcaseImage[], options: ShowcaseOption[], testimonials: ShowcaseTestimonial[] })[] }) | null>(null);

    useEffect(() => {
        if (onSync) onSync(showcase);
    }, [showcase, onSync]);

    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [localDraft, setLocalDraft] = useState<ShowcaseItem | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [globalIsSaving, setGlobalIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [addingShortcutType, setAddingShortcutType] = useState<string | null>(null);
    const [shortcutInputValue, setShortcutInputValue] = useState('');

    const hasAccess = clientPlan === 'business' || clientPlan === 'enterprise';

    // URL da Vitrine (Memoized para consistência e correção de bug de produção)
    const showcaseUrl = useMemo(() => {
        if (typeof window === 'undefined') return '';
        // Utiliza window.location.origin para garantir URL absoluta correta
        const baseUrl = window.location.origin;
        // Fallback seguro se o slug estiver vazio (evita links quebrados durante criação)
        const safeSlug = profile.slug || 'perfil';
        return `${baseUrl}/#/u/${safeSlug}/vitrine`;
    }, [profile.slug]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(val);
    };

    const parseCurrency = (val: string) => {
        const cleanValue = val.replace(/[^\d]/g, '');
        return parseFloat(cleanValue) / 100 || 0;
    };

    const getLimit = () => {
        if (clientPlan === 'enterprise') return 999;
        if (clientPlan === 'business') return 10;
        return 0;
    };

    useEffect(() => {
        if (!hasAccess) return;

        async function initShowcase() {
            try {
                setLoading(true);
                await showcaseApi.ensureShowcase(profile.id, profile.clientId);
                const data = await showcaseApi.getAdminByProfileId(profile.id);
                setShowcase(data);
            } catch (err) {
                console.error("Error loading showcase:", err);
            } finally {
                setLoading(false);
            }
        }

        initShowcase();
    }, [profile.id, profile.clientId, hasAccess]);

    // Update localDraft when editingItem changes
    useEffect(() => {
        if (editingItem && showcase) {
            const item = showcase.items.find(i => i.id === editingItem);
            if (item) {
                setLocalDraft({ ...item });
            }
        } else {
            setLocalDraft(null);
        }
    }, [editingItem, showcase]);

    const handleAddItem = async () => {
        if (!showcase) return;

        const limit = getLimit();
        const currentCount = showcase.items?.length || 0;

        if (currentCount >= limit) {
            alert(`Limite de itens atingido! Seu plano ${clientPlan?.toUpperCase()} permite até ${limit} itens na vitrine.`);
            return;
        }

        const newItem: Partial<ShowcaseItem> = {
            showcaseId: showcase.id,
            title: 'Novo Produto/Serviço',
            description: '',
            basePrice: 0,
            ctaType: 'whatsapp',
            ctaValue: '',
            sortOrder: showcase.items?.length || 0,
            isActive: true,
            kind: 'physical'
        };

        try {
            setIsSaving(true);
            const id = await showcaseApi.saveItem(newItem, [], [], []);
            const updated = await showcaseApi.getAdminByProfileId(profile.id);
            setShowcase(updated);
            setEditingItem(id);
        } catch (err) {
            console.error("Error adding item:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!window.confirm('Tem certeza que deseja remover este item?')) return;

        try {
            setIsSaving(true);
            await showcaseApi.deleteItem(itemId);
            const updated = await showcaseApi.getAdminByProfileId(profile.id);
            setShowcase(updated);
            if (editingItem === itemId) setEditingItem(null);
        } catch (err) {
            console.error("Error deleting item:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddShortcut = async () => {
        if (!addingShortcutType || !shortcutInputValue || !showcase) return;

        const existingBtn = profile.buttons?.find(b => b.type === addingShortcutType);

        if (existingBtn) {
            // Update existing button
            const updatedButtons = profile.buttons.map(b =>
                b.id === existingBtn.id ? { ...b, value: shortcutInputValue, enabled: true } : b
            );
            onUpdate({ buttons: updatedButtons });

            // Ensure it's selected
            if (!showcase.headerButtonIds?.includes(existingBtn.id)) {
                const nextIds = [...(showcase.headerButtonIds || []), existingBtn.id].slice(0, 5);
                handleSaveGlobalSettings({ headerButtonIds: nextIds });
            }
        } else {
            // Create new button
            const newButton = {
                id: crypto.randomUUID(),
                profileId: profile.id,
                type: addingShortcutType as any,
                label: addingShortcutType.charAt(0).toUpperCase() + addingShortcutType.slice(1),
                value: shortcutInputValue,
                enabled: true,
                visibility: 'public' as const,
                sortOrder: profile.buttons?.length || 0
            };

            const updatedButtons = [...(profile.buttons || []), newButton];
            onUpdate({ buttons: updatedButtons });

            const nextIds = [...(showcase.headerButtonIds || []), newButton.id].slice(0, 5);
            handleSaveGlobalSettings({ headerButtonIds: nextIds });
        }

        setAddingShortcutType(null);
        setShortcutInputValue('');
    };

    const handleSaveCurrentItem = async () => {
        if (!localDraft) return;
        try {
            setIsSaving(true);
            const { mainImageUrl, galleryUrls } = await showcaseApi.saveItem(
                { ...localDraft },
                localDraft.images || [],
                localDraft.options || [],
                localDraft.testimonials || []
            );

            // Build the final saved item with fresh Storage URLs
            const savedItem = {
                ...localDraft,
                mainImageUrl,
                images: localDraft.images?.map((img, idx) => ({
                    ...img,
                    storagePath: galleryUrls[idx] || img.storagePath
                }))
            };

            // Optimistic update: Update the item in the local list instead of full re-fetch
            if (showcase) {
                const nextItems = showcase.items.map(i =>
                    i.id === localDraft.id ? savedItem : i
                );
                setShowcase({ ...showcase, items: nextItems });
            }

            setEditingItem(null); // Fecha o editor após salvar
            alert('Item salvo com sucesso!');
        } catch (err) {
            console.error("Error updating item:", err);
            alert('Erro ao salvar item.');
        } finally {
            setIsSaving(false);
        }
    };

    // Use a ref to store the timeout for debouncing settings saves
    const saveSettingsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSaveGlobalSettings = (updates: any) => {
        if (!showcase) return;

        // Update locally for instant feedback
        const nextShowcase = { ...showcase, ...updates };
        setShowcase(nextShowcase);

        // Notify parent about the sync (for integrated preview)
        if (onSync) onSync(nextShowcase);

        // Debounce the database save
        if (saveSettingsTimeoutRef.current) {
            clearTimeout(saveSettingsTimeoutRef.current);
        }

        saveSettingsTimeoutRef.current = setTimeout(async () => {
            try {
                setGlobalIsSaving(true);
                await showcaseApi.saveSettings(showcase.id, {
                    buttonColor: nextShowcase.buttonColor,
                    buttonSecondaryColor: nextShowcase.buttonSecondaryColor,
                    buttonGradientEnabled: nextShowcase.buttonGradientEnabled,
                    itemTemplate: nextShowcase.itemTemplate,
                    headerButtonIds: nextShowcase.headerButtonIds,
                    communityClickDestination: nextShowcase.communityClickDestination
                });
            } catch (err) {
                console.error("Error saving global settings:", err);
                // We don't rollback here to avoid jumping UI, but show error
            } finally {
                setGlobalIsSaving(false);
            }
        }, 1000); // 1 second debounce
    };

    const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !localDraft) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setLocalDraft({ ...localDraft, mainImageUrl: base64 });
        };
        reader.readAsDataURL(file);
    };

    const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || !localDraft) return;

        const newImages = [...(localDraft.images || [])];
        let loadedCount = 0;

        Array.from(files).forEach((file: File) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                newImages.push({
                    id: crypto.randomUUID(),
                    itemId: localDraft.id,
                    storagePath: base64,
                    sortOrder: newImages.length
                });

                loadedCount++;
                if (loadedCount === files.length) {
                    setLocalDraft({ ...localDraft, images: newImages });
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (imageId: string) => {
        if (!localDraft) return;
        const nextImages = localDraft.images?.filter(img => img.id !== imageId) || [];
        setLocalDraft({ ...localDraft, images: nextImages });
    };

    const addTestimonial = () => {
        if (!localDraft) return;
        const newTestimonials = [...(localDraft.testimonials || [])];
        newTestimonials.push({
            id: crypto.randomUUID(),
            itemId: localDraft.id,
            name: 'Novo Cliente',
            text: '',
            sortOrder: newTestimonials.length
        });
        setLocalDraft({ ...localDraft, testimonials: newTestimonials });
    };

    const updateTestimonial = (testimonialId: string, updates: Partial<ShowcaseTestimonial>) => {
        if (!localDraft) return;
        const nextTestimonials = localDraft.testimonials?.map(t =>
            t.id === testimonialId ? { ...t, ...updates } : t
        ) || [];
        setLocalDraft({ ...localDraft, testimonials: nextTestimonials });
    };

    const removeTestimonial = (testimonialId: string) => {
        if (!localDraft) return;
        const nextTestimonials = localDraft.testimonials?.filter(t => t.id !== testimonialId) || [];
        setLocalDraft({ ...localDraft, testimonials: nextTestimonials });
    };

    if (!hasAccess) {
        return (
            <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-10 text-center">
                <div className="mx-auto w-16 h-16 rounded-[1.8rem] bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-zinc-500">
                    <Lock size={28} />
                </div>
                <h2 className="text-2xl font-black mb-2 tracking-tight">Vitrine Premium</h2>
                <p className="text-zinc-500 text-sm leading-relaxed max-w-md mx-auto mb-8">
                    A Vitrine é um recurso exclusivo do <b>Plano Business</b>.
                    Crie um catálogo independente com múltiplas fotos, variações de preço e design de alto impacto.
                </p>
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-blue-600/20">
                    Fazer Upgrade
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin mb-4" />
                <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Carregando Vitrine...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Palette size={18} className="text-blue-400" />
                        </span>
                        Vitrine Premium
                    </h2>
                    <p className="text-zinc-500 text-sm mt-2">Seu catálogo de elite independente do perfil principal.</p>
                </div>
                <button
                    onClick={handleAddItem}
                    disabled={isSaving}
                    className="bg-white text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5"
                >
                    <Plus size={14} />
                    Novo Item
                </button>
            </div>

            {/* Global Settings Section */}
            <section className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <Palette size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-black uppercase tracking-widest">Configurações de Estilo</h3>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Personalize a aparência do seu catálogo.</p>
                        </div>
                    </div>

                    <a
                        href={showcaseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em]"
                    >
                        <Eye size={14} />
                        Ver Prévia
                    </a>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Botões e Cores */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <MousePointer2 size={14} className="text-blue-500" />
                            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Cores de Ação</h4>
                        </div>

                        <div className="bg-black/20 p-6 rounded-3xl border border-white/5 space-y-6">
                            <ColorPickerButton
                                label="Cor Principal"
                                value={showcase?.buttonColor || '#3b82f6'}
                                onChange={(hex) => handleSaveGlobalSettings({ buttonColor: hex })}
                            />

                            <div className="space-y-4 pt-2 border-t border-white/5">
                                <button
                                    onClick={() => handleSaveGlobalSettings({ buttonGradientEnabled: !showcase?.buttonGradientEnabled })}
                                    className={clsx(
                                        "w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] transition-all border",
                                        showcase?.buttonGradientEnabled
                                            ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20"
                                            : "bg-white/5 border-white/10 text-zinc-500 hover:text-zinc-300"
                                    )}
                                >
                                    <Sparkles size={14} />
                                    {showcase?.buttonGradientEnabled ? 'Gradiente Ativado' : 'Ativar Gradiente'}
                                </button>

                                {showcase?.buttonGradientEnabled && (
                                    <div className="animate-in slide-in-from-top-2 duration-300">
                                        <ColorPickerButton
                                            label="Cor Secundária"
                                            value={showcase?.buttonSecondaryColor || '#1d4ed8'}
                                            onChange={(hex) => handleSaveGlobalSettings({ buttonSecondaryColor: hex })}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Seção de Atalhos de Botões */}
                <div className="pt-8 border-t border-white/5 space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Square size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-black uppercase tracking-widest">Botões de Atalho</h3>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Selecione até 5 botões do seu perfil para exibir no cabeçalho da vitrine.</p>
                        </div>
                    </div>

                    {/* Quick Social Grid */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Adicionar via Ícone</h4>
                        <div className="flex flex-wrap gap-3">
                            {[
                                { type: 'whatsapp', label: 'WhatsApp' },
                                { type: 'instagram', label: 'Instagram' },
                                { type: 'facebook', label: 'Facebook' },
                                { type: 'tiktok', label: 'TikTok' },
                                { type: 'youtube', label: 'YouTube' },
                                { type: 'linkedin', label: 'LinkedIn' },
                                { type: 'website', label: 'Site' }
                            ].map((social) => {
                                const btnExists = profile.buttons?.find(b => b.type === social.type);
                                const isSelected = btnExists && showcase?.headerButtonIds?.includes(btnExists.id);
                                const Icon = iconMap[social.type] || Globe;

                                return (
                                    <button
                                        key={social.type}
                                        onClick={() => {
                                            if (btnExists && btnExists.value) {
                                                // Toggle selection only if it already has a value
                                                let nextIds = [...(showcase?.headerButtonIds || [])];
                                                if (isSelected) {
                                                    nextIds = nextIds.filter(id => id !== btnExists.id);
                                                } else if (nextIds.length < 5) {
                                                    nextIds.push(btnExists.id);
                                                } else {
                                                    alert('Limite de 5 botões atingido.');
                                                    return;
                                                }
                                                handleSaveGlobalSettings({ headerButtonIds: nextIds });
                                            } else {
                                                // Ask for link if it doesn't exist OR has no value
                                                setAddingShortcutType(social.type);
                                                setShortcutInputValue(btnExists?.value || '');
                                            }
                                        }}
                                        className={clsx(
                                            "w-12 h-12 rounded-xl border flex items-center justify-center transition-all group relative",
                                            isSelected
                                                ? "bg-emerald-600/20 border-emerald-500 text-emerald-400"
                                                : "bg-black/20 border-white/5 text-zinc-600 hover:border-white/10 hover:text-white"
                                        )}
                                        title={social.label}
                                    >
                                        <Icon size={20} />
                                        {!btnExists && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center border-2 border-[#0D0D0D]">
                                                <Plus size={10} className="text-white" strokeWidth={4} />
                                            </div>
                                        )}
                                        {isSelected && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-[#0D0D0D]">
                                                <Check size={10} className="text-white" strokeWidth={4} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Inline Link Input for new shortcut */}
                    {addingShortcutType && (
                        <div className="bg-blue-600/5 border border-blue-500/20 rounded-3xl p-6 animate-in zoom-in-95 duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                                    Configurar {addingShortcutType.toUpperCase()}
                                </h4>
                                <button onClick={() => setAddingShortcutType(null)} className="text-zinc-500 hover:text-white">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                                        {React.createElement(iconMap[addingShortcutType] || Globe, { size: 16 })}
                                    </div>
                                    <input
                                        type="text"
                                        autoFocus
                                        value={shortcutInputValue}
                                        onChange={(e) => {
                                            setShortcutInputValue(e.target.value);
                                            // Se for tipo genérico (website), podemos tentar detectar o tipo
                                            if (addingShortcutType === 'website') {
                                                const detected = detectLinkType(e.target.value);
                                                if (detected !== 'website') {
                                                    setAddingShortcutType(detected);
                                                }
                                            }
                                        }}
                                        placeholder={
                                            addingShortcutType === 'whatsapp' ? 'DDD + Número' :
                                                addingShortcutType === 'instagram' ? '@seu_usuario' :
                                                    addingShortcutType === 'facebook' ? 'facebook.com/seu_perfil' :
                                                        addingShortcutType === 'website' ? 'https://seu-site.com' :
                                                            'Seu link ou usuário'
                                        }
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <button
                                    onClick={handleAddShortcut}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* All Selection Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {(!profile.buttons || profile.buttons.length === 0) && !addingShortcutType && (
                            <div className="col-span-full py-8 text-center bg-black/20 rounded-3xl border border-dashed border-white/5">
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Nenhum botão encontrado. Adicione links no grid acima.</p>
                            </div>
                        )}
                        {profile.buttons?.filter(b => b.enabled).map((btn) => {
                            const isSelected = showcase?.headerButtonIds?.includes(btn.id);
                            const Icon = iconMap[btn.type] || Globe;
                            return (
                                <button
                                    key={btn.id}
                                    onClick={() => {
                                        let nextIds = [...(showcase?.headerButtonIds || [])];
                                        if (isSelected) {
                                            nextIds = nextIds.filter(id => id !== btn.id);
                                        } else if (nextIds.length < 5) {
                                            nextIds.push(btn.id);
                                        } else {
                                            alert('Limite de 5 botões atingido.');
                                            return;
                                        }
                                        handleSaveGlobalSettings({ headerButtonIds: nextIds });
                                    }}
                                    className={clsx(
                                        "p-4 rounded-2xl border transition-all text-left group relative overflow-hidden",
                                        isSelected
                                            ? "bg-emerald-600/10 border-emerald-500 shadow-lg shadow-emerald-500/5"
                                            : "bg-black/20 border-white/5 hover:border-white/10 hover:bg-black/40"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={clsx(
                                            "w-8 h-8 rounded-lg flex items-center justify-center border transition-colors",
                                            isSelected ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-400" : "bg-black/40 border-white/5 text-zinc-600"
                                        )}>
                                            <Icon size={14} />
                                        </div>
                                        {isSelected && <Check size={12} className="text-emerald-400" />}
                                    </div>
                                    <span className={clsx(
                                        "text-[10px] font-black uppercase tracking-widest block truncate",
                                        isSelected ? "text-white" : "text-zinc-500"
                                    )}>
                                        {btn.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                    <Zap size={14} className="text-blue-500 animate-pulse" />
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
                        Dica: O template <span className="text-white">Premium</span> utiliza efeitos de transparência que brilham mais com cores vibrantes.
                    </p>
                </div>

                {globalIsSaving && (
                    <div className="flex justify-end pt-2">
                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] animate-pulse">Salvando Estilo...</span>
                    </div>
                )}
            </section>

            {/* Sharing Section */}
            <section className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Share2 size={20} />
                    </div>
                    <div>
                        <h3 className="text-base font-black uppercase tracking-widest">Compartilhar Vitrine</h3>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Link direto e QR Code para seus clientes.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                        <div className="bg-black/20 p-6 rounded-3xl border border-white/5 space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Link da Vitrine</label>
                            <div className="flex gap-2">
                                <input
                                    readOnly
                                    value={showcaseUrl}
                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-zinc-400 outline-none"
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(showcaseUrl);
                                        alert('Link copiado!');
                                    }}
                                    className="p-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all active:scale-95"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                            <Sparkles size={14} className="text-emerald-500" />
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
                                Dica: Adicione este link na sua bio do Instagram para converter mais vendas.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-4 bg-white/5 p-8 rounded-[2rem] border border-white/10">
                        <div className="p-4 bg-white rounded-3xl shadow-2xl">
                            <QRCodeSVG
                                value={showcaseUrl}
                                size={140}
                                level="H"
                                includeMargin={false}
                            />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">QR Code Oficial da Vitrine</p>
                    </div>
                </div>
            </section>

            <div className="space-y-4">
                {showcase?.items?.length === 0 ? (
                    <div className="bg-zinc-900/20 border border-white/5 border-dashed rounded-[2.5rem] p-12 text-center">
                        <ShoppingBag size={40} className="mx-auto text-zinc-800 mb-4" />
                        <p className="text-zinc-600 text-sm font-medium">Sua vitrine está vazia.</p>
                        <p className="text-zinc-700 text-[10px] mt-1">Comece adicionando seu primeiro produto ou serviço premium.</p>
                    </div>
                ) : (
                    showcase?.items
                        .slice()
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((item, idx) => (
                            <div
                                key={item.id}
                                className={clsx(
                                    "group relative bg-zinc-900/40 border transition-all duration-300 rounded-[2.5rem] overflow-hidden",
                                    editingItem === item.id ? "border-blue-500/30 scale-[1.01]" : "border-white/5 hover:border-white/10"
                                )}
                            >
                                <div className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                                    {/* Item Image Preview */}
                                    <div className="w-24 h-24 rounded-3xl bg-black/40 border border-white/10 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                        {item.images?.[0] ? (
                                            <img src={item.images[0].storagePath} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon size={24} className="text-zinc-700" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {item.tag && (
                                                <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase tracking-wider border border-blue-500/20">
                                                    {item.tag}
                                                </span>
                                            )}
                                            {item.basePrice > 0 && (
                                                <span className="text-emerald-400 font-mono text-[10px] font-black">
                                                    R$ {item.basePrice.toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-black tracking-tight text-white truncate">{item.title}</h3>
                                        <p className="text-zinc-500 text-xs truncate max-w-sm">{item.description || 'Sem descrição'}</p>
                                    </div>

                                    <div className="flex items-center gap-2 self-end md:self-center">
                                        <button
                                            onClick={() => setEditingItem(editingItem === item.id ? null : item.id)}
                                            className={clsx(
                                                "p-3 rounded-2xl transition-all active:scale-95",
                                                editingItem === item.id ? "bg-blue-600 text-white" : "bg-white/5 text-zinc-400 hover:text-white"
                                            )}
                                        >
                                            <Settings2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(item.id)}
                                            className="p-3 bg-red-500/10 text-red-500/40 hover:text-red-500 rounded-2xl transition-all active:scale-95 border border-red-500/20"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Edit Section */}
                                {editingItem === item.id && (
                                    <div className="border-t border-white/5 p-8 space-y-10 animate-in slide-in-from-top-4 duration-500">

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            {/* Foto Principal */}
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">Foto Principal do Produto</label>
                                                <div className="relative aspect-square w-full rounded-[2.5rem] bg-black/40 border border-white/10 overflow-hidden group/main-img flex items-center justify-center">
                                                    {localDraft?.mainImageUrl ? (
                                                        <>
                                                            <img src={localDraft.mainImageUrl} alt="" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/main-img:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                                <button
                                                                    onClick={() => {
                                                                        const input = document.createElement('input');
                                                                        input.type = 'file';
                                                                        input.accept = 'image/*';
                                                                        input.onchange = (e) => handleMainImageUpload(e as any);
                                                                        input.click();
                                                                    }}
                                                                    className="p-3 bg-white text-black rounded-2xl hover:bg-zinc-200 transition-all active:scale-90"
                                                                >
                                                                    <Upload size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => setLocalDraft({ ...localDraft, mainImageUrl: '' })}
                                                                    className="p-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all active:scale-90"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                const input = document.createElement('input');
                                                                input.type = 'file';
                                                                input.accept = 'image/*';
                                                                input.onchange = (e) => handleMainImageUpload(e as any);
                                                                input.click();
                                                            }}
                                                            className="flex flex-col items-center gap-3 text-zinc-600 hover:text-blue-400 transition-colors"
                                                        >
                                                            <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                                                                <Upload size={24} />
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Upload Foto Principal</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Galeria de Fotos */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">Galeria de Fotos (Detalhes)</label>
                                                    <button
                                                        onClick={() => {
                                                            const input = document.createElement('input');
                                                            input.type = 'file';
                                                            input.accept = 'image/*';
                                                            input.multiple = true;
                                                            input.onchange = (e) => handleGalleryUpload(e as any);
                                                            input.click();
                                                        }}
                                                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all"
                                                    >
                                                        <Plus size={14} /> Adicionar
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-3 gap-3">
                                                    {localDraft?.images?.map((img) => (
                                                        <div key={img.id} className="group/img relative aspect-square rounded-2xl overflow-hidden bg-black/40 border border-white/10">
                                                            <img src={img.storagePath} alt="" className="w-full h-full object-cover" />
                                                            <button
                                                                onClick={() => removeImage(img.id)}
                                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {Array.from({ length: Math.max(0, 6 - (localDraft?.images?.length || 0)) }).map((_, i) => (
                                                        <div key={i} className="aspect-square rounded-2xl border border-white/5 border-dashed flex items-center justify-center text-zinc-800">
                                                            <ImageIcon size={20} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Lado Esquerdo: Info Básica */}
                                            <div className="space-y-6">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">Título do Produto</label>
                                                    <input
                                                        value={localDraft?.title || ''}
                                                        onChange={(e) => setLocalDraft({ ...localDraft!, title: e.target.value })}
                                                        className="w-full rounded-2xl bg-black/40 border border-white/10 px-5 py-4 text-sm font-bold outline-none focus:border-blue-500/50 transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">Descrição</label>
                                                    <textarea
                                                        value={localDraft?.description || ''}
                                                        onChange={(e) => setLocalDraft({ ...localDraft!, description: e.target.value })}
                                                        rows={4}
                                                        className="w-full rounded-2xl bg-black/40 border border-white/10 px-5 py-4 text-sm outline-none focus:border-blue-500/50 transition-all resize-none"
                                                        placeholder="Detalhes sobre o produto ou serviço..."
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">Tipo de Produto</label>
                                                        <div className="flex bg-black/40 rounded-2xl p-1 border border-white/10">
                                                            <button
                                                                onClick={() => setLocalDraft({ ...localDraft!, kind: 'physical' })}
                                                                className={clsx(
                                                                    "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                                    localDraft?.kind === 'physical' ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
                                                                )}
                                                            >
                                                                Físico
                                                            </button>
                                                            <button
                                                                onClick={() => setLocalDraft({ ...localDraft!, kind: 'digital' })}
                                                                className={clsx(
                                                                    "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                                    localDraft?.kind === 'digital' ? "bg-blue-600 text-white shadow-lg" : "text-zinc-500 hover:text-white"
                                                                )}
                                                            >
                                                                Digital
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">Status do Item</label>
                                                        <button
                                                            onClick={() => setLocalDraft({ ...localDraft!, isActive: !localDraft?.isActive })}
                                                            className={clsx(
                                                                "w-full py-3.5 rounded-2xl border flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                                                                localDraft?.isActive
                                                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                                                    : "bg-red-500/10 border-red-500/30 text-red-400"
                                                            )}
                                                        >
                                                            {localDraft?.isActive ? (
                                                                <><Check size={14} /> Ativo</>
                                                            ) : (
                                                                <><X size={14} /> Inativo</>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">URL do Vídeo (YouTube/Vimeo)</label>
                                                    <input
                                                        value={localDraft?.videoUrl || ''}
                                                        onChange={(e) => setLocalDraft({ ...localDraft!, videoUrl: e.target.value })}
                                                        className="w-full rounded-2xl bg-black/40 border border-white/10 px-5 py-4 text-sm font-medium outline-none focus:border-blue-500/50 transition-all"
                                                        placeholder="https://youtube.com/watch?v=..."
                                                    />
                                                </div>
                                            </div>

                                            {/* Lado Direito: Preço & CTA */}
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">Preço Base (R$)</label>
                                                        <input
                                                            type="text"
                                                            value={formatCurrency(localDraft?.basePrice || 0)}
                                                            onChange={(e) => setLocalDraft({ ...localDraft!, basePrice: parseCurrency(e.target.value) })}
                                                            className="w-full rounded-2xl bg-black/40 border border-white/10 px-5 py-4 text-sm font-bold text-emerald-400 outline-none focus:border-blue-500/50 transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">Tag</label>
                                                        <input
                                                            value={localDraft?.tag || ''}
                                                            onChange={(e) => setLocalDraft({ ...localDraft!, tag: e.target.value })}
                                                            className="w-full rounded-2xl bg-black/40 border border-white/10 px-5 py-4 text-sm font-bold outline-none focus:border-blue-500/50 transition-all"
                                                            placeholder="Ex: Novo"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">Ação (CTA)</label>
                                                        <select
                                                            value={localDraft?.ctaType}
                                                            onChange={(e) => setLocalDraft({ ...localDraft!, ctaType: e.target.value as any })}
                                                            className="w-full rounded-2xl bg-black border border-white/10 px-5 py-4 text-sm font-bold text-white outline-none appearance-none cursor-pointer"
                                                        >
                                                            <option value="whatsapp">Botão WhatsApp</option>
                                                            <option value="link">Link de Checkout</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">Valor do CTA</label>
                                                        <input
                                                            value={localDraft?.ctaValue || ''}
                                                            onChange={(e) => setLocalDraft({ ...localDraft!, ctaValue: e.target.value })}
                                                            placeholder={localDraft?.ctaType === 'whatsapp' ? 'Diga olá...' : 'https://...'}
                                                            className="w-full rounded-2xl bg-black/40 border border-white/10 px-5 py-4 text-sm font-medium outline-none focus:border-blue-500/50 transition-all"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Variações */}
                                                <div className="bg-black/20 rounded-[2rem] p-6 border border-white/5 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Sparkles size={14} className="text-blue-400" />
                                                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Variações</h4>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                if (!localDraft) return;
                                                                const newOption: ShowcaseOption = {
                                                                    id: crypto.randomUUID(),
                                                                    itemId: localDraft.id,
                                                                    label: 'Nova Opção',
                                                                    price: 0,
                                                                    sortOrder: localDraft.options?.length || 0
                                                                };
                                                                setLocalDraft({ ...localDraft, options: [...(localDraft.options || []), newOption] });
                                                            }}
                                                            className="text-blue-400 text-[9px] font-black uppercase tracking-widest"
                                                        >
                                                            + Adicionar
                                                        </button>
                                                    </div>

                                                    <div className="space-y-2">
                                                        {localDraft?.options?.map((opt) => (
                                                            <div key={opt.id} className="flex items-center gap-3 bg-zinc-900 border border-white/10 p-3 rounded-xl">
                                                                <input
                                                                    value={opt.label}
                                                                    onChange={(e) => {
                                                                        const next = localDraft.options?.map(o => o.id === opt.id ? { ...o, label: e.target.value } : o) || [];
                                                                        setLocalDraft({ ...localDraft, options: next });
                                                                    }}
                                                                    className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-white px-0"
                                                                />
                                                                <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 min-w-[100px]">
                                                                    <span className="text-[10px] font-black text-zinc-600">R$</span>
                                                                    <input
                                                                        type="text"
                                                                        value={formatCurrency(opt.price || 0)}
                                                                        onChange={(e) => {
                                                                            const next = localDraft.options?.map(o => o.id === opt.id ? { ...o, price: parseCurrency(e.target.value) } : o) || [];
                                                                            setLocalDraft({ ...localDraft, options: next });
                                                                        }}
                                                                        className="w-full bg-transparent border-none outline-none font-bold text-emerald-400 text-xs px-0"
                                                                    />
                                                                </div>
                                                                <button onClick={() => {
                                                                    const next = localDraft.options?.filter(o => o.id !== opt.id) || [];
                                                                    setLocalDraft({ ...localDraft, options: next });
                                                                }} className="text-zinc-600 hover:text-red-500">
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Prova Social (Depoimentos) */}
                                        <div className="bg-black/20 rounded-[2rem] p-8 border border-white/5 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                                        <Sparkles size={16} className="text-emerald-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Prova Social</h4>
                                                        <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">Depoimentos de clientes satisfeitos</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={addTestimonial}
                                                    className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all"
                                                >
                                                    + Novo Depoimento
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {localDraft?.testimonials?.map((t) => (
                                                    <div key={t.id} className="bg-zinc-900/60 border border-white/5 p-6 rounded-[2rem] relative group/t">
                                                        <button
                                                            onClick={() => removeTestimonial(t.id)}
                                                            className="absolute top-4 right-4 text-zinc-700 hover:text-red-500 opacity-0 group-hover/t:opacity-100 transition-opacity"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden group/tavatar relative">
                                                                    {t.avatarUrl ? (
                                                                        <img src={t.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <Upload size={14} className="text-zinc-700" />
                                                                    )}
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (!file) return;
                                                                            const reader = new FileReader();
                                                                            reader.onloadend = () => {
                                                                                updateTestimonial(t.id, { avatarUrl: reader.result as string });
                                                                            };
                                                                            reader.readAsDataURL(file);
                                                                        }}
                                                                    />
                                                                </div>
                                                                <input
                                                                    value={t.name}
                                                                    onChange={(e) => updateTestimonial(t.id, { name: e.target.value })}
                                                                    placeholder="Nome do Cliente"
                                                                    className="flex-1 bg-transparent border-none outline-none text-xs font-black text-white px-0"
                                                                />
                                                            </div>

                                                            <textarea
                                                                value={t.text}
                                                                onChange={(e) => updateTestimonial(t.id, { text: e.target.value })}
                                                                rows={3}
                                                                className="w-full bg-transparent border-none outline-none text-[11px] font-medium text-zinc-400 px-0 resize-none leading-relaxed italic"
                                                                placeholder="O que o cliente disse..."
                                                            />

                                                            {/* Mídia da Prova Social */}
                                                            <div className="flex gap-2 pt-2 border-t border-white/5">
                                                                <div className="flex-1 space-y-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <ImageIcon size={10} className="text-zinc-600" />
                                                                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Foto da Prova</span>
                                                                    </div>
                                                                    <div className="relative h-16 rounded-xl bg-black/40 border border-white/10 overflow-hidden group/timg border-dashed flex items-center justify-center">
                                                                        {t.imageUrl ? (
                                                                            <>
                                                                                <img src={t.imageUrl} alt="" className="w-full h-full object-cover" />
                                                                                <button onClick={() => updateTestimonial(t.id, { imageUrl: '' })} className="absolute inset-0 bg-red-600/60 opacity-0 group-hover/timg:opacity-100 flex items-center justify-center transition-opacity">
                                                                                    <Trash2 size={12} className="text-white" />
                                                                                </button>
                                                                            </>
                                                                        ) : (
                                                                            <label className="cursor-pointer text-zinc-700 hover:text-white transition-colors">
                                                                                <Plus size={14} />
                                                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                                                                    const file = e.target.files?.[0];
                                                                                    if (!file) return;
                                                                                    const reader = new FileReader();
                                                                                    reader.onloadend = () => updateTestimonial(t.id, { imageUrl: reader.result as string });
                                                                                    reader.readAsDataURL(file);
                                                                                }} />
                                                                            </label>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex-[2] space-y-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <Sparkles size={10} className="text-zinc-600" />
                                                                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Link de Vídeo</span>
                                                                    </div>
                                                                    <input
                                                                        value={t.videoUrl || ''}
                                                                        onChange={(e) => updateTestimonial(t.id, { videoUrl: e.target.value })}
                                                                        placeholder="YouTube/Vimeo..."
                                                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-[10px] outline-none focus:border-emerald-500/30"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Botão de Salvar Global do Item */}
                                        <div className="pt-6 border-t border-white/5 flex gap-3">
                                            <button
                                                onClick={handleSaveCurrentItem}
                                                disabled={isSaving}
                                                className="flex-1 bg-white text-black py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3"
                                            >
                                                {isSaving ? (
                                                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Save size={18} />
                                                )}
                                                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                            </button>
                                            <button
                                                onClick={() => setEditingItem(null)}
                                                className="px-8 bg-zinc-900 text-zinc-500 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-[0.98]"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                )}
            </div>
        </div >
    );
};

export default ShowcaseTab;