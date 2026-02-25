import React, { useEffect } from 'react';
import {
    Plus,
    Trash2,
    Image as ImageIcon,
    Save,
    X,
    Sparkles,
    Upload,
    Check,
    Link,
} from 'lucide-react';
import clsx from 'clsx';
import { ShowcaseItem, ShowcaseOption, ShowcaseTestimonial } from '../../types';

type Props = {
    localDraft: ShowcaseItem | null;
    setLocalDraft: React.Dispatch<React.SetStateAction<ShowcaseItem | null>>;
    onSave: () => void;
    onCancel: () => void;
    isSaving: boolean;
    handleMainImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleGalleryUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeImage: (imageId: string) => void;
    addTestimonial: () => void;
    updateTestimonial: (testimonialId: string, updates: Partial<ShowcaseTestimonial>) => void;
    removeTestimonial: (testimonialId: string) => void;
    formatCurrency: (val: number) => string;
    parseCurrency: (val: string) => number;
};

const ShowcaseItemModal: React.FC<Props> = ({
    localDraft,
    setLocalDraft,
    onSave,
    onCancel,
    isSaving,
    handleMainImageUpload,
    handleGalleryUpload,
    removeImage,
    addTestimonial,
    updateTestimonial,
    removeTestimonial,
    formatCurrency,
    parseCurrency,
}) => {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    if (!localDraft) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative w-full max-w-4xl max-h-[92vh] bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-2xl shadow-black/60 flex flex-col animate-in zoom-in-95 fade-in duration-300">

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                            <Sparkles size={18} className="text-blue-400" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm font-black tracking-tight text-white truncate">
                                {localDraft.title || 'Novo Item'}
                            </h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                                Editar Produto / Serviço
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2.5 rounded-xl bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 custom-scrollbar">

                    {/* ===== SEÇÃO 1: IMAGENS ===== */}
                    <section className="space-y-3">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
                            <ImageIcon size={14} /> Imagens
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Foto Principal */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-1">Foto Principal</label>
                                <div className="relative aspect-square w-full rounded-[2rem] bg-black/40 border border-white/10 overflow-hidden group/main-img flex items-center justify-center">
                                    {localDraft.mainImageUrl ? (
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
                                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                                <Upload size={22} />
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-widest">Upload</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Galeria */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-1">Galeria (Detalhes)</label>
                                    <button
                                        onClick={() => {
                                            const input = document.createElement('input');
                                            input.type = 'file';
                                            input.accept = 'image/*';
                                            input.multiple = true;
                                            input.onchange = (e) => handleGalleryUpload(e as any);
                                            input.click();
                                        }}
                                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-all"
                                    >
                                        <Plus size={12} /> Adicionar
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {localDraft.images?.map((img) => (
                                        <div key={img.id} className="group/img relative aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/10">
                                            <img src={img.storagePath} alt="" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => removeImage(img.id)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity"
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                    {Array.from({ length: Math.max(0, 6 - (localDraft.images?.length || 0)) }).map((_, i) => (
                                        <div key={i} className="aspect-square rounded-xl border border-white/5 border-dashed flex items-center justify-center text-zinc-800">
                                            <ImageIcon size={16} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="border-t border-white/5" />

                    {/* ===== SEÇÃO 2: INFORMAÇÕES ===== */}
                    <section className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Informações</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-1">Título do Produto</label>
                                <input
                                    value={localDraft.title || ''}
                                    onChange={(e) => setLocalDraft({ ...localDraft, title: e.target.value })}
                                    className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500/50 transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-1">URL do Vídeo</label>
                                <input
                                    value={localDraft.videoUrl || ''}
                                    onChange={(e) => setLocalDraft({ ...localDraft, videoUrl: e.target.value })}
                                    className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm font-medium outline-none focus:border-blue-500/50 transition-all"
                                    placeholder="https://youtube.com/watch?v=..."
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-1">Descrição</label>
                            <textarea
                                value={localDraft.description || ''}
                                onChange={(e) => setLocalDraft({ ...localDraft, description: e.target.value })}
                                rows={3}
                                className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm outline-none focus:border-blue-500/50 transition-all resize-none"
                                placeholder="Detalhes sobre o produto ou serviço..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-1">Tipo de Produto</label>
                                <div className="flex bg-black/40 rounded-xl p-1 border border-white/10">
                                    <button
                                        onClick={() => setLocalDraft({ ...localDraft, kind: 'physical' })}
                                        className={clsx(
                                            "flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                            localDraft.kind === 'physical' ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
                                        )}
                                    >
                                        Físico
                                    </button>
                                    <button
                                        onClick={() => setLocalDraft({ ...localDraft, kind: 'digital' })}
                                        className={clsx(
                                            "flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                            localDraft.kind === 'digital' ? "bg-blue-600 text-white shadow-lg" : "text-zinc-500 hover:text-white"
                                        )}
                                    >
                                        Digital
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-1">Status</label>
                                <button
                                    onClick={() => setLocalDraft({ ...localDraft, isActive: !localDraft.isActive })}
                                    className={clsx(
                                        "w-full py-3 rounded-xl border flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all",
                                        localDraft.isActive
                                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                            : "bg-red-500/10 border-red-500/30 text-red-400"
                                    )}
                                >
                                    {localDraft.isActive ? (
                                        <><Check size={12} /> Ativo</>
                                    ) : (
                                        <><X size={12} /> Inativo</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </section>

                    <div className="border-t border-white/5" />

                    {/* ===== SEÇÃO 3: PREÇO & CTA ===== */}
                    <section className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Preço & CTA</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-1">Preço De</label>
                                <input
                                    type="text"
                                    value={formatCurrency(localDraft.originalPrice || 0)}
                                    onChange={(e) => setLocalDraft({ ...localDraft, originalPrice: parseCurrency(e.target.value) })}
                                    className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-3 text-xs font-bold text-zinc-500 outline-none focus:border-blue-500/50 transition-all text-right"
                                    placeholder="Opcional"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-1">Preço Por</label>
                                <input
                                    type="text"
                                    value={formatCurrency(localDraft.basePrice || 0)}
                                    onChange={(e) => setLocalDraft({ ...localDraft, basePrice: parseCurrency(e.target.value) })}
                                    className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-3 text-xs font-bold text-emerald-400 outline-none focus:border-blue-500/50 transition-all text-right"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-1">Tag</label>
                                <input
                                    value={localDraft.tag || ''}
                                    onChange={(e) => setLocalDraft({ ...localDraft, tag: e.target.value })}
                                    className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-3 text-xs font-bold outline-none focus:border-blue-500/50 transition-all"
                                    placeholder="Ex: Novo"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-1">Ação (CTA)</label>
                                <select
                                    value={localDraft.ctaType}
                                    onChange={(e) => setLocalDraft({ ...localDraft, ctaType: e.target.value as any })}
                                    className="w-full rounded-xl bg-black border border-white/10 px-3 py-3 text-xs font-bold text-white outline-none appearance-none cursor-pointer"
                                >
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="link">Link</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-1">Valor do CTA</label>
                            <input
                                value={localDraft.ctaValue || ''}
                                onChange={(e) => setLocalDraft({ ...localDraft, ctaValue: e.target.value })}
                                placeholder={localDraft.ctaType === 'whatsapp' ? 'Diga olá...' : 'https://...'}
                                className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm font-medium outline-none focus:border-blue-500/50 transition-all"
                            />
                        </div>
                    </section>

                    <div className="border-t border-white/5" />

                    {/* ===== SEÇÃO 4: VARIAÇÕES ===== */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
                                <Sparkles size={14} className="text-blue-400" /> Variações
                            </h3>
                            <button
                                onClick={() => {
                                    const newOption: ShowcaseOption = {
                                        id: crypto.randomUUID(),
                                        itemId: localDraft.id,
                                        label: 'Nova Opção',
                                        price: 0,
                                        sortOrder: localDraft.options?.length || 0
                                    };
                                    setLocalDraft({ ...localDraft, options: [...(localDraft.options || []), newOption] });
                                }}
                                className="text-blue-400 text-[9px] font-black uppercase tracking-widest hover:text-blue-300 transition-colors"
                            >
                                + Adicionar
                            </button>
                        </div>
                        <div className="space-y-2">
                            {localDraft.options?.map((opt) => (
                                <div key={opt.id} className="bg-zinc-900/60 border border-white/10 p-4 rounded-2xl space-y-3">
                                    <div className="flex items-center gap-3">
                                        <input
                                            value={opt.label}
                                            placeholder="Nome da variação (ex: P, M, G)"
                                            onChange={(e) => {
                                                const next = localDraft.options?.map(o => o.id === opt.id ? { ...o, label: e.target.value } : o) || [];
                                                setLocalDraft({ ...localDraft, options: next });
                                            }}
                                            className="flex-1 bg-zinc-800/50 border border-white/5 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-blue-500/50"
                                        />
                                        <button onClick={() => {
                                            const next = localDraft.options?.filter(o => o.id !== opt.id) || [];
                                            setLocalDraft({ ...localDraft, options: next });
                                        }} className="text-zinc-600 hover:text-red-500 transition-colors p-2 bg-black/20 rounded-xl border border-white/5">
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 bg-black/20 border border-white/5 rounded-xl px-3 py-2">
                                        <Link size={12} className="text-zinc-600 shrink-0" />
                                        <input
                                            value={opt.link || ''}
                                            placeholder="URL específica (checkout, etc)"
                                            onChange={(e) => {
                                                const next = localDraft.options?.map(o => o.id === opt.id ? { ...o, link: e.target.value } : o) || [];
                                                setLocalDraft({ ...localDraft, options: next });
                                            }}
                                            className="w-full bg-transparent border-none outline-none text-[10px] text-zinc-500 font-medium px-0"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col gap-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2">
                                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none">Preço De</span>
                                            <div className="flex items-center gap-1">
                                                <span className="text-[9px] font-black text-zinc-600">R$</span>
                                                <input
                                                    type="text"
                                                    value={formatCurrency(opt.originalPrice || 0)}
                                                    onChange={(e) => {
                                                        const next = localDraft.options?.map(o => o.id === opt.id ? { ...o, originalPrice: parseCurrency(e.target.value) } : o) || [];
                                                        setLocalDraft({ ...localDraft, options: next });
                                                    }}
                                                    className="w-full bg-transparent border-none outline-none font-bold text-zinc-500 text-xs px-0 text-right"
                                                    placeholder="0,00"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2">
                                            <span className="text-[8px] font-black text-emerald-500/50 uppercase tracking-widest leading-none">Adicional</span>
                                            <div className="flex items-center gap-1">
                                                <span className="text-[9px] font-black text-emerald-500/50">R$</span>
                                                <input
                                                    type="text"
                                                    value={formatCurrency(opt.price || 0)}
                                                    onChange={(e) => {
                                                        const next = localDraft.options?.map(o => o.id === opt.id ? { ...o, price: parseCurrency(e.target.value) } : o) || [];
                                                        setLocalDraft({ ...localDraft, options: next });
                                                    }}
                                                    className="w-full bg-transparent border-none outline-none font-bold text-emerald-400 text-xs px-0 text-right"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="border-t border-white/5" />

                    {/* ===== SEÇÃO 5: PROVA SOCIAL ===== */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                    <Sparkles size={14} className="text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Prova Social</h3>
                                    <p className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">Depoimentos</p>
                                </div>
                            </div>
                            <button
                                onClick={addTestimonial}
                                className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all"
                            >
                                + Novo
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {localDraft.testimonials?.map((t) => (
                                <div key={t.id} className="bg-zinc-900/60 border border-white/5 p-4 rounded-2xl relative group/t">
                                    <button
                                        onClick={() => removeTestimonial(t.id)}
                                        className="absolute top-3 right-3 text-zinc-700 hover:text-red-500 opacity-0 group-hover/t:opacity-100 transition-opacity"
                                    >
                                        <X size={14} />
                                    </button>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden relative shrink-0">
                                                {t.avatarUrl ? (
                                                    <img src={t.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Upload size={12} className="text-zinc-700" />
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
                                            rows={2}
                                            className="w-full bg-transparent border-none outline-none text-[11px] font-medium text-zinc-400 px-0 resize-none leading-relaxed italic"
                                            placeholder="O que o cliente disse..."
                                        />
                                        <div className="flex gap-2 pt-2 border-t border-white/5">
                                            <div className="flex-1 space-y-1.5">
                                                <div className="flex items-center gap-1.5">
                                                    <ImageIcon size={9} className="text-zinc-600" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Foto</span>
                                                </div>
                                                <div className="relative h-14 rounded-xl bg-black/40 border border-white/10 overflow-hidden group/timg border-dashed flex items-center justify-center">
                                                    {t.imageUrl ? (
                                                        <>
                                                            <img src={t.imageUrl} alt="" className="w-full h-full object-cover" />
                                                            <button onClick={() => updateTestimonial(t.id, { imageUrl: '' })} className="absolute inset-0 bg-red-600/60 opacity-0 group-hover/timg:opacity-100 flex items-center justify-center transition-opacity">
                                                                <Trash2 size={10} className="text-white" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <label className="cursor-pointer text-zinc-700 hover:text-white transition-colors">
                                                            <Plus size={12} />
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
                                            <div className="flex-[2] space-y-1.5">
                                                <div className="flex items-center gap-1.5">
                                                    <Sparkles size={9} className="text-zinc-600" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Vídeo</span>
                                                </div>
                                                <input
                                                    value={t.videoUrl || ''}
                                                    onChange={(e) => updateTestimonial(t.id, { videoUrl: e.target.value })}
                                                    placeholder="YouTube/Vimeo..."
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[10px] outline-none focus:border-emerald-500/30"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-white/5 flex gap-3 shrink-0">
                    <button
                        onClick={onSave}
                        disabled={isSaving}
                        className="flex-1 bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Save size={16} />
                        )}
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                    <button
                        onClick={onCancel}
                        className="px-6 bg-zinc-900 text-zinc-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-[0.98]"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShowcaseItemModal;
