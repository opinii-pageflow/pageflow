import React, { useState } from 'react';
import { BRAZILIAN_STATES, CITIES_BY_STATE, COMMUNITY_SEGMENTS } from '../../lib/locationData';
import { Profile, PlanType } from '../../types';
import {
    Users,
    Globe,
    MapPin,
    Briefcase,
    MessageSquare,
    ExternalLink,
    ChevronRight,
    ShieldCheck,
    AlertTriangle,
    Zap,
    Check,
    Info,
    Tag,
    Percent,
    Map,
    Upload,
    Image as ImageIcon
} from 'lucide-react';
import { COMMUNITY_LIMITS } from '../../lib/permissions';
import { getStorage, getCurrentUser } from '../../lib/storage';
import clsx from 'clsx';

interface Props {
    profile: Profile;
    clientPlan: PlanType | undefined;
    onUpdate: (updates: Partial<Profile>) => void;
}

const CommunityTab: React.FC<Props> = ({ profile, clientPlan, onUpdate }) => {
    const [showModal, setShowModal] = useState(false);
    const promoImageInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdate({ promotionImageUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const user = getCurrentUser();
    const data = getStorage();
    const clientProfiles = data.profiles.filter(p => p.clientId === user?.clientId);
    const profilesInCommunity = clientProfiles.filter(p => p.showInCommunity).length;

    const limit = COMMUNITY_LIMITS[clientPlan || 'starter'];
    const hasLimitReached = profilesInCommunity >= limit && !profile.showInCommunity;

    const handleToggle = () => {
        if (profile.showInCommunity) {
            onUpdate({ showInCommunity: false });
        } else {
            if (hasLimitReached) {
                alert(`Seu plano ${clientPlan?.toUpperCase()} permite até ${limit} perfis na comunidade. Faça upgrade para adicionar mais!`);
                return;
            }
            setShowModal(true);
        }
    };

    const isFormValid = Boolean(profile.communitySegment) &&
        Boolean(profile.communityCity) &&
        Boolean(profile.communityState);

    const saveCommunityData = () => {
        if (!isFormValid) return;
        onUpdate({ showInCommunity: true });
        setShowModal(false);
    };

    const availableCities = profile.communityState ? CITIES_BY_STATE[profile.communityState] || [] : [];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20 max-w-full overflow-visible">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-600/10 text-blue-500 rounded-lg">
                        <Globe size={20} />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-white">Comunidade de Perfis</h3>
                </div>
                <p className="text-xs text-gray-500">Apareça no diretório público e seja encontrado por novos clientes.</p>
            </header>


            {/* Toggle Section */}
            <section
                className={clsx(
                    "border p-6 sm:p-8 rounded-[2rem] sm:rounded-[3.5rem] flex items-center justify-between transition-all duration-500 group cursor-pointer relative max-w-full gap-4 sm:gap-6",
                    profile.showInCommunity
                        ? "bg-emerald-500/[0.03] border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.05)]"
                        : "bg-zinc-900/40 border-white/5"
                )}
                onClick={handleToggle}
            >
                <div className="flex-1 min-w-0">
                    <h4 className="text-base sm:text-xl font-black text-white italic uppercase tracking-tight">Publicar na Comunidade</h4>
                    <p className="text-[10px] sm:text-xs text-zinc-500 font-medium leading-relaxed mt-1">
                        Ative o protocolo para listar seu perfil em <span className="text-emerald-500/80">linkflow.me/c</span>
                    </p>
                </div>

                <div className="flex items-center shrink-0">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggle();
                        }}
                        className={clsx(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                            profile.showInCommunity
                                ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                                : "bg-zinc-800 border border-zinc-600"
                        )}
                    >
                        {profile.showInCommunity && <Check className="w-4 h-4 text-white" />}
                    </button>
                </div>
            </section>

            {/* Community Data Info (If active) */}
            {profile.showInCommunity && (
                <section className="space-y-6 animate-in fade-in duration-500 max-w-full">
                    <div className="flex items-center gap-2 px-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Dados da Listagem</h3>
                        <button onClick={() => setShowModal(true)} className="ml-auto text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">Editar Dados</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 min-w-0">
                            <div className="text-[9px] font-black text-zinc-600 uppercase mb-1">Segmento</div>
                            <div className="text-xs font-bold text-white truncate">{profile.communitySegment}</div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 min-w-0">
                            <div className="text-[9px] font-black text-zinc-600 uppercase mb-1">Cidade</div>
                            <div className="text-xs font-bold text-white truncate">{profile.communityCity}</div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 min-w-0">
                            <div className="text-[9px] font-black text-zinc-600 uppercase mb-1">Estado</div>
                            <div className="text-xs font-bold text-white truncate">{profile.communityState}</div>
                        </div>
                    </div>

                    {/* Promoção Info */}
                    {profile.promotionEnabled && (
                        <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20 min-w-0 flex items-center gap-4">
                            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                                <Tag size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[9px] font-black text-emerald-600 uppercase mb-0.5">Promoção Ativa</div>
                                <div className="text-xs font-bold text-white truncate">{profile.promotionTitle} ({profile.promotionDiscountPercentage}%)</div>
                                {profile.promotionCurrentPrice && (
                                    <div className="text-[10px] text-zinc-400 font-medium">De R$ {profile.promotionCurrentPrice.toLocaleString('pt-BR')} com {profile.promotionDiscountPercentage}% OFF</div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 min-w-0">
                        <div className="text-[9px] font-black text-zinc-600 uppercase mb-1">Frase de Impacto</div>
                        <div className="text-xs font-bold text-white italic break-words line-clamp-3">"{profile.communityPunchline}"</div>
                    </div>
                </section>
            )}

            {/* Modal de Publicação */}
            {showModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
                    <div className="relative w-full max-w-md max-h-[90vh] flex flex-col bg-[#0a0a0a] border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="sticky top-0 z-10 bg-[#0a0a0a] p-6 sm:p-8 pb-4 flex items-center justify-between border-b border-white/5 rounded-t-[2rem] sm:rounded-t-[2.5rem]">
                            <h3 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-3">
                                <Globe className="text-blue-500" />
                                Configurar Listagem
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-full"><AlertTriangle size={20} className="text-zinc-600" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 sm:p-8 py-4 custom-scrollbar">
                            <div className="space-y-6">
                                {/* Segmento */}
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Segmento</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                                        <select
                                            value={profile.communitySegment || ''}
                                            onChange={e => onUpdate({ communitySegment: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-blue-500 outline-none appearance-none cursor-pointer transition-all"
                                        >
                                            <option value="">Selecione o segmento...</option>
                                            {COMMUNITY_SEGMENTS.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Localização */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Estado (UF)</label>
                                        <select
                                            value={profile.communityState || ''}
                                            onChange={e => {
                                                const state = e.target.value;
                                                onUpdate({ communityState: state, communityCity: '' });
                                            }}
                                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="">UF</option>
                                            {BRAZILIAN_STATES.map(s => (
                                                <option key={s.uf} value={s.uf}>{s.uf} - {s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Cidade</label>
                                        <select
                                            disabled={!profile.communityState}
                                            value={profile.communityCity || ''}
                                            onChange={e => onUpdate({ communityCity: e.target.value })}
                                            className={clsx(
                                                "w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none appearance-none cursor-pointer transition-all",
                                                !profile.communityState && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            <option value="">Cidade</option>
                                            {availableCities.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Promoção */}
                                <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={clsx(
                                                "p-2 rounded-lg transition-colors",
                                                profile.promotionEnabled ? "bg-emerald-500/20 text-emerald-500" : "bg-zinc-800 text-zinc-500"
                                            )}>
                                                <Tag size={16} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black uppercase tracking-widest text-white">Promoção Especial</h4>
                                                <p className="text-[9px] text-zinc-500 font-medium">Destaque-se com uma oferta</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => onUpdate({ promotionEnabled: !profile.promotionEnabled })}
                                            className={clsx(
                                                "w-10 h-5 rounded-full relative transition-all duration-300",
                                                profile.promotionEnabled ? "bg-emerald-500" : "bg-zinc-800"
                                            )}
                                        >
                                            <div className={clsx(
                                                "absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300",
                                                profile.promotionEnabled ? "left-6" : "left-1"
                                            )} />
                                        </button>
                                    </div>

                                    {profile.promotionEnabled && (
                                        <div className="space-y-3 pt-2 animate-in slide-in-from-top-2 duration-300">
                                            <div className="space-y-1.5">
                                                <label className="text-[8px] font-black uppercase text-zinc-500 ml-1">Título da Promoção</label>
                                                <input
                                                    type="text"
                                                    value={profile.promotionTitle || ''}
                                                    onChange={e => onUpdate({ promotionTitle: e.target.value })}
                                                    placeholder="Ex: Consultoria Grátis, 20% OFF em tudo..."
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-emerald-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <label className="text-[8px] font-black uppercase text-zinc-500 ml-1">Preço Atual (R$)</label>
                                                    <input
                                                        type="number"
                                                        value={profile.promotionCurrentPrice || ''}
                                                        onChange={e => onUpdate({ promotionCurrentPrice: parseFloat(e.target.value) || 0 })}
                                                        placeholder="0,00"
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-emerald-500 outline-none transition-all font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[8px] font-black uppercase text-zinc-500 ml-1">Desconto (%)</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={profile.promotionDiscountPercentage || ''}
                                                            onChange={e => onUpdate({ promotionDiscountPercentage: parseInt(e.target.value) || 0 })}
                                                            placeholder="0"
                                                            className="w-full bg-black/40 border border-white/10 rounded-lg pl-3 pr-7 py-2 text-xs focus:border-emerald-500 outline-none transition-all text-center font-bold"
                                                        />
                                                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 font-bold">%</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[8px] font-black uppercase text-zinc-500 ml-1">WhatsApp da Oferta (Opcional)</label>
                                                <div className="relative">
                                                    <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={12} />
                                                    <input
                                                        type="text"
                                                        value={profile.promotionWhatsApp || ''}
                                                        onChange={e => onUpdate({ promotionWhatsApp: e.target.value })}
                                                        placeholder="Ex: 11999999999"
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs focus:border-emerald-500 outline-none transition-all"
                                                    />
                                                </div>
                                                <p className="text-[8px] text-zinc-600 ml-1">Se vazio, usará o WhatsApp padrão do perfil.</p>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[8px] font-black uppercase text-zinc-500 ml-1">Imagem da Oferta</label>
                                                <div
                                                    onClick={() => promoImageInputRef.current?.click()}
                                                    className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/40 border border-dashed border-white/10 hover:border-emerald-500/50 transition-all cursor-pointer group"
                                                >
                                                    {profile.promotionImageUrl ? (
                                                        <>
                                                            <img src={profile.promotionImageUrl} className="w-full h-full object-cover" alt="Promo" />
                                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <Upload size={20} className="text-white" />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-600">
                                                            <ImageIcon size={24} />
                                                            <span className="text-[9px] font-bold">Upload da Imagem</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <input
                                                    type="file"
                                                    ref={promoImageInputRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                />
                                                {profile.promotionImageUrl && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onUpdate({ promotionImageUrl: '' }); }}
                                                        className="text-[8px] text-red-500 font-black uppercase tracking-widest mt-1 ml-1 hover:underline"
                                                    >
                                                        Remover Imagem
                                                    </button>
                                                )}
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[8px] font-black uppercase text-zinc-500 ml-1">Descrição Curta</label>
                                                <input
                                                    type="text"
                                                    value={profile.promotionDescription || ''}
                                                    onChange={e => onUpdate({ promotionDescription: e.target.value })}
                                                    placeholder="Breve detalhe da oferta..."
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-emerald-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Atendimento</label>
                                        <select
                                            value={profile.communityServiceMode || 'online'}
                                            onChange={e => onUpdate({ communityServiceMode: e.target.value as any })}
                                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="online">Online</option>
                                            <option value="presencial">Presencial</option>
                                            <option value="hibrido">Híbrido</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">CTA Principal</label>
                                        <select
                                            value={profile.communityPrimaryCta || 'whatsapp'}
                                            onChange={e => onUpdate({ communityPrimaryCta: e.target.value as any })}
                                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="whatsapp">WhatsApp</option>
                                            <option value="instagram">Instagram</option>
                                            <option value="site">Website</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Frase de Impacto (max 120)</label>
                                    <textarea
                                        maxLength={120}
                                        value={profile.communityPunchline || ''}
                                        onChange={e => onUpdate({ communityPunchline: e.target.value })}
                                        placeholder="Uma frase marcante sobre seu trabalho..."
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all h-20 resize-none"
                                    />
                                    <div className="text-[8px] text-right text-zinc-600 font-mono">{(profile.communityPunchline || '').length}/120</div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Link Google (Opcional)</label>
                                    <input
                                        type="url"
                                        value={profile.communityGmbLink || ''}
                                        onChange={e => onUpdate({ communityGmbLink: e.target.value })}
                                        placeholder="https://g.page/..."
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 sm:p-8 pt-4 border-t border-white/5 bg-[#0a0a0a] rounded-b-[2rem] sm:rounded-b-[2.5rem]">
                            <div className="flex gap-3">
                                <button onClick={() => setShowModal(false)} className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-white/5 hover:bg-white/10 text-zinc-400 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all">Cancelar</button>
                                <button
                                    disabled={!isFormValid}
                                    onClick={saveCommunityData}
                                    className={clsx(
                                        "flex-1 px-4 sm:px-6 py-3 sm:py-4 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl",
                                        isFormValid ? "bg-white text-black hover:bg-zinc-200" : "bg-zinc-900 text-zinc-600 cursor-not-allowed opacity-50"
                                    )}
                                >
                                    <Check size={16} /> Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Enterprise / Upgrade Card (If Limit Reached) */}
            {!profile.showInCommunity && hasLimitReached && (
                <section className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-500/10 flex flex-col items-center text-center space-y-4 max-w-full">
                    <Zap size={32} className="text-white fill-white" />
                    <h4 className="text-xl font-black text-white italic">Upgrade de Alcance</h4>
                    <p className="text-sm font-medium text-white/80 max-w-xs transition-opacity leading-relaxed">
                        Desbloqueie mais slots na comunidade e aumente sua visibilidade global.
                    </p>
                    <button onClick={() => alert('Upgrade - Em breve')} className="bg-white text-black px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-xl">Ver Planos Business</button>
                </section>
            )}
        </div>
    );
};

export default CommunityTab;
