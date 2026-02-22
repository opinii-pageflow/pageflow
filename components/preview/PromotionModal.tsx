import React from 'react';
import { Profile } from '@/types';
import { X, Tag, ShoppingBag, MessageSquare, ExternalLink, Instagram, Sparkles } from 'lucide-react';
import clsx from 'clsx';

interface PromotionModalProps {
    profile: Profile;
    onClose: () => void;
}

const PromotionModal: React.FC<PromotionModalProps> = ({ profile, onClose }) => {
    const discountedPrice = profile.promotionCurrentPrice
        ? profile.promotionCurrentPrice * (1 - (profile.promotionDiscountPercentage || 0) / 100)
        : null;

    const handleAction = () => {
        const cta = profile.communityPrimaryCta || 'whatsapp';
        // Simular comportamento de clique de CTA
        if (cta === 'whatsapp') {
            const waNumber = profile.promotionWhatsApp || profile.bookingWhatsapp;
            if (waNumber) {
                const message = encodeURIComponent(`Olá! Tenho interesse na oferta: ${profile.promotionTitle}`);
                window.open(`https://wa.me/${waNumber.replace(/\D/g, '')}?text=${message}`, '_blank');
                return;
            }
        }

        // Fallback para o link do perfil
        window.open(`/u/${profile.slug}`, '_blank');
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 z-20 p-2 bg-black/40 hover:bg-white/10 border border-white/5 rounded-full text-zinc-500 hover:text-white transition-all"
                    >
                        <X size={20} />
                    </button>

                    {/* Banner/Image Section */}
                    <div className="relative h-56 sm:h-64 bg-zinc-900 overflow-hidden">
                        {profile.promotionImageUrl ? (
                            <img
                                src={profile.promotionImageUrl}
                                className="w-full h-full object-cover"
                                alt={profile.promotionTitle}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-blue-500/20">
                                <Tag size={64} className="text-emerald-500/20" />
                            </div>
                        )}

                        {/* Badge Overlay */}
                        <div className="absolute bottom-6 left-6 flex items-center gap-2">
                            <div className="bg-emerald-500 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2">
                                <Sparkles size={12} className="fill-white" /> Oferta Sugerida
                            </div>
                            {profile.promotionDiscountPercentage && (
                                <div className="bg-white text-emerald-600 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-2xl">
                                    {profile.promotionDiscountPercentage}% OFF
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info Content */}
                    <div className="p-8 sm:p-10 space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter text-white leading-tight">
                                {profile.promotionTitle || 'Oferta Especial'}
                            </h2>
                            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                                {profile.promotionDescription || 'Sem detalhes adicionais fornecidos.'}
                            </p>
                        </div>

                        {/* Pricing */}
                        {profile.promotionCurrentPrice && (
                            <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Preço Normal</div>
                                    <div className="text-lg font-bold text-zinc-500 line-through">
                                        R$ {profile.promotionCurrentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                                <div className="w-px h-10 bg-white/5" />
                                <div className="space-y-0.5">
                                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Com Desconto</div>
                                    <div className="text-3xl font-black text-white italic tracking-tighter">
                                        R$ {discountedPrice?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Profile Link Preview */}
                        <div className="flex items-center gap-4 py-4 border-y border-white/5">
                            <img
                                src={profile.avatarUrl || ''}
                                className="w-10 h-10 rounded-full border border-white/10"
                                alt={profile.displayName}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-black text-white uppercase tracking-wider truncate">{profile.displayName}</div>
                                <div className="text-[10px] text-zinc-500 font-medium truncate">{profile.communitySegment} • {profile.communityCity}/{profile.communityState}</div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <button
                                onClick={handleAction}
                                className="flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.15em] transition-all shadow-xl shadow-emerald-500/20 active:scale-95 group"
                            >
                                {profile.communityPrimaryCta === 'whatsapp' ? <MessageSquare size={16} /> : <ShoppingBag size={16} />}
                                Aproveitar agora
                            </button>
                            <a
                                href={`/u/${profile.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white px-8 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.15em] transition-all border border-white/5"
                            >
                                Ver Perfil Completo
                                <ExternalLink size={14} className="text-zinc-500" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromotionModal;

