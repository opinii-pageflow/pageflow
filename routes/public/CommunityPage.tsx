import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { profilesApi } from '@/lib/api/profiles';
import { clientsApi } from '@/lib/api/clients';
import { trackEvent } from '@/lib/analytics';
import { Profile, Client } from '@/types';
import CommunityCard from '@/components/preview/CommunityCard';
import PromotionModal from '@/components/preview/PromotionModal';
import {
    Search,
    Filter,
    MapPin,
    Briefcase,
    Globe,
    ChevronDown,
    Zap,
    Users,
    Tag,
    Percent,
    Map
} from 'lucide-react';
import { BRAZILIAN_STATES, CITIES_BY_STATE, COMMUNITY_SEGMENTS } from '@/lib/locationData';
import clsx from 'clsx';

const CommunityPage: React.FC = () => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPromoProfile, setSelectedPromoProfile] = useState<Profile | null>(null);

    const publicProfiles = useMemo(() =>
        profiles.filter(p => p.showInCommunity && p.visibilityMode === 'public'),
        [profiles]
    );

    React.useEffect(() => {
        const loadCommunityData = async () => {
            try {
                setLoading(true);
                const [communityProfiles, allClients] = await Promise.all([
                    profilesApi.listCommunity(),
                    clientsApi.listAll()
                ]);
                setProfiles(communityProfiles);
                setClients(allClients);
            } catch (error) {
                console.error('Error loading community data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadCommunityData();
    }, []);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSegment, setSelectedSegment] = useState('all');
    const [selectedState, setSelectedState] = useState('all');
    const [selectedCity, setSelectedCity] = useState('all');
    const [selectedService, setSelectedService] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [onlyPromotions, setOnlyPromotions] = useState(false);

    const segments = ['all', ...COMMUNITY_SEGMENTS];

    const cities = useMemo(() => {
        if (selectedState === 'all') return ['all'];
        return ['all', ...(CITIES_BY_STATE[selectedState] || [])];
    }, [selectedState]);

    // Métricas de popularidade (mocked por enquanto para evitar queries pesadas no front)
    const profileViews = useMemo(() => {
        const counts: Record<string, number> = {};
        // TODO: Buscar contagem real de visualizações do banco se necessário
        return counts;
    }, []);

    const isSponsored = (p: Profile) => {
        if (!p.sponsored_enabled) return false;
        if (!p.sponsored_until) return false;
        return new Date(p.sponsored_until) > new Date();
    };

    const filteredProfiles = useMemo(() => {
        return publicProfiles.filter(p => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm ||
                p.displayName?.toLowerCase().includes(searchLower) ||
                p.communityPunchline?.toLowerCase().includes(searchLower) ||
                p.communitySegment?.toLowerCase().includes(searchLower) ||
                p.bioShort?.toLowerCase().includes(searchLower) ||
                p.slug?.toLowerCase().includes(searchLower);

            const matchesSegment = selectedSegment === 'all' || p.communitySegment === selectedSegment;
            const matchesState = selectedState === 'all' || p.communityState === selectedState;
            const matchesCity = selectedCity === 'all' || p.communityCity === selectedCity;
            const matchesPromo = !onlyPromotions || p.promotionEnabled;

            return matchesSearch && matchesSegment && matchesState && matchesCity && matchesPromo;
        }).sort((a, b) => {
            // Primeiro Patrocinados
            const aSpon = isSponsored(a);
            const bSpon = isSponsored(b);
            if (aSpon && !bSpon) return -1;
            if (!aSpon && bSpon) return 1;

            // Depois por visita (Popularidade)
            const aViews = profileViews[a.id] || 0;
            const bViews = profileViews[b.id] || 0;
            return bViews - aViews;
        });
    }, [publicProfiles, searchTerm, selectedSegment, selectedState, selectedCity, selectedService, selectedType, onlyPromotions, profileViews]);

    // Perfis em Destaque (Topo)
    const featuredProfiles = useMemo(() => {
        return publicProfiles.filter(p => isSponsored(p) || p.featured)
            .sort((a, b) => {
                // Prioridade 1: Patrocinados (Sponsorship pago)
                const aSpon = isSponsored(a);
                const bSpon = isSponsored(b);
                if (aSpon && !bSpon) return -1;
                if (!aSpon && bSpon) return 1;

                // Prioridade 2: Featured (Curadoria Admin)
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;

                // Resto da lógica (visualizações)
                const aV = profileViews[a.id] || 0;
                const bV = profileViews[b.id] || 0;
                return bV - aV;
            })
            .slice(0, 6);
    }, [publicProfiles, selectedSegment, profileViews]);

    // Perfis Orgânicos (Sem duplicatas)
    const organicProfiles = useMemo(() => {
        const featuredIds = new Set(featuredProfiles.map(p => p.id));
        return filteredProfiles.filter(p => !featuredIds.has(p.id));
    }, [filteredProfiles, featuredProfiles]);

    const getClientPlan = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        return client?.plan;
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-neon-blue/30 selection:text-white">
            {/* HEADER COMPACTO */}
            <header className="pt-12 pb-8 px-6 border-b border-white/5 relative overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-blue/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-blue/5 blur-[120px] rounded-full" />

                <div className="max-w-7xl mx-auto text-center space-y-4 relative z-10">
                    {/* Logo */}
                    <Link to="/" className="flex justify-center mb-4 hover:opacity-80 transition-opacity">
                        <img
                            src="/logo.png"
                            alt="PageFlow Logo"
                            className="h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                        />
                    </Link>

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl px-5 py-1.5 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-[0.25em] text-neon-blue shadow-lg">
                        <Globe size={12} className="animate-pulse" />
                        Nexus / Global Directory
                    </div>

                    {/* Título */}
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter italic leading-none">
                        COMUNIDADE <span className="text-neon-blue filter drop-shadow-[0_0_15px_rgba(0,242,255,0.4)]">PAGEFLOW</span>
                    </h1>

                    {/* Subtítulo */}
                    <p className="text-zinc-500 max-w-lg mx-auto text-sm font-medium leading-relaxed italic opacity-70">
                        Explore o ecossistema de alta performance. Conecte-se com os perfis mais influentes da rede.
                    </p>
                </div>
            </header>

            {/* ÁREA DE FILTROS - BARRA ULTRA-COMPACTA */}
            <div className="sticky top-0 z-[100] bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 px-4 py-2.5 font-sans">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-3">
                    {/* Busca - Flex Grow */}
                    <div className="relative group flex-1 w-full md:w-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-neon-blue transition-colors z-10" size={14} />
                        <input
                            type="text"
                            placeholder="Buscar na rede..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs font-medium outline-none focus:border-neon-blue/30 focus:bg-white/[0.08] transition-all placeholder:text-zinc-700 relative z-10"
                        />
                    </div>

                    {/* Filtros em Linha */}
                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
                        {/* Segmento */}
                        <div className="relative group shrink-0">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-hover:text-neon-blue transition-colors z-10" size={12} />
                            <select
                                value={selectedSegment}
                                onChange={e => setSelectedSegment(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-[10px] font-black uppercase tracking-wider appearance-none outline-none focus:border-neon-blue/30 cursor-pointer hover:bg-white/[0.08] transition-all text-zinc-400 min-w-[140px]"
                            >
                                <option value="all">RAMO: TODOS</option>
                                {segments.filter(s => s !== 'all').map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-700 pointer-events-none" size={10} />
                        </div>

                        {/* UF */}
                        <div className="relative group shrink-0">
                            <Map className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-hover:text-neon-blue transition-colors z-10" size={12} />
                            <select
                                value={selectedState}
                                onChange={e => {
                                    setSelectedState(e.target.value);
                                    setSelectedCity('all');
                                }}
                                className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-[10px] font-black uppercase tracking-wider appearance-none outline-none focus:border-neon-blue/30 cursor-pointer hover:bg-white/[0.08] transition-all text-zinc-400 min-w-[80px]"
                            >
                                <option value="all">UF: TODAS</option>
                                {BRAZILIAN_STATES.map(s => (
                                    <option key={s.uf} value={s.uf}>{s.uf}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-700 pointer-events-none" size={10} />
                        </div>

                        {/* Ofertas */}
                        <button
                            onClick={() => setOnlyPromotions(!onlyPromotions)}
                            className={clsx(
                                "shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 border",
                                onlyPromotions
                                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                                    : "bg-white/5 border-white/10 text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            <Tag size={12} className={onlyPromotions ? "text-emerald-400" : ""} />
                            Ofertas
                        </button>

                        {/* Reset */}
                        {(searchTerm || selectedSegment !== 'all' || selectedState !== 'all' || onlyPromotions) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedSegment('all');
                                    setSelectedState('all');
                                    setSelectedCity('all');
                                    setOnlyPromotions(false);
                                }}
                                className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors shrink-0"
                                title="Limpar Filtros"
                            >
                                <Filter size={12} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* DIVISOR VISUAL */}
            <div className="h-px bg-gradient-to-r from-transparent via-neon-blue/20 to-transparent max-w-7xl mx-auto" />

            {/* GRID DE PERFIS - FRAME SUTIL */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 space-y-4">
                        <div className="w-12 h-12 border-4 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin" />
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Mapeando Rede...</p>
                    </div>
                ) : (
                    /* Container com borda sutil */
                    <div className="border border-white/5 rounded-3xl p-8 bg-white/[0.01] shadow-[0_0_40px_rgba(0,0,0,0.3)]">

                        {/* Featured Section */}
                        {featuredProfiles.length > 0 && (
                            <div className="mb-12">
                                <div className="flex items-center gap-3 mb-8">
                                    <Zap className="text-yellow-400 fill-yellow-400" size={20} />
                                    <h2 className="text-2xl font-black tracking-tighter uppercase italic">
                                        Perfis em Destaque <span className="text-zinc-600 text-sm font-bold not-italic tracking-normal ml-2 hidden sm:inline-block">Selecionados para você</span>
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 xl:gap-8">
                                    {featuredProfiles.map(profile => (
                                        <div
                                            key={`feat-${profile.id}`}
                                            className="flex justify-center"
                                        >
                                            <Link
                                                to={profile.hasShowcase
                                                    ? `/u/${profile.slug}/vitrine?utm_source=community`
                                                    : `/u/${profile.slug}?utm_source=community`
                                                }
                                                onClick={() => trackEvent({
                                                    clientId: profile.clientId,
                                                    profileId: profile.id,
                                                    type: 'click',
                                                    source: 'community_featured'
                                                })}
                                                className="w-full"
                                            >
                                                <CommunityCard
                                                    profile={profile}
                                                    featured={true}
                                                    className="h-[440px] aspect-[9/19] w-full max-w-[240px] mx-auto transition-transform duration-500 hover:-translate-y-2 hover:scale-[1.02]"
                                                    clientPlan={getClientPlan(profile.clientId)}
                                                    onPromotionClick={(p) => setSelectedPromoProfile(p)}
                                                />
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Divisor se houver Featured */}
                        {featuredProfiles.length > 0 && <div className="border-t border-white/5 my-12" />}

                        {/* Grid Orgânico */}
                        {organicProfiles.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 xl:gap-8">
                                {organicProfiles.map(profile => (
                                    <div
                                        key={profile.id}
                                        className="flex justify-center"
                                    >
                                        <Link
                                            to={profile.hasShowcase
                                                ? `/u/${profile.slug}/vitrine?utm_source=community`
                                                : `/u/${profile.slug}?utm_source=community`
                                            }
                                            onClick={() => trackEvent({
                                                clientId: profile.clientId,
                                                profileId: profile.id,
                                                type: 'click',
                                                source: 'community_organic'
                                            })}
                                            className="w-full"
                                        >
                                            <CommunityCard
                                                profile={profile}
                                                featured={false}
                                                className="h-[440px] aspect-[9/19] w-full max-w-[240px] mx-auto transition-transform duration-500 hover:-translate-y-2 hover:scale-[1.02]"
                                                clientPlan={getClientPlan(profile.clientId)}
                                                onPromotionClick={(p) => setSelectedPromoProfile(p)}
                                            />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-40">
                                <div className="w-20 h-20 bg-zinc-900 border border-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-700">
                                    <Search size={32} />
                                </div>
                                <h3 className="text-xl font-black italic uppercase tracking-widest text-zinc-400 mb-2">Nenhum perfil encontrado</h3>
                                <p className="text-zinc-600 text-sm">Tente ajustar seus filtros ou termos de busca.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Promotion Popup */}
            {selectedPromoProfile && (
                <PromotionModal
                    profile={selectedPromoProfile}
                    onClose={() => setSelectedPromoProfile(null)}
                />
            )}
        </div>
    );
};

export default CommunityPage;
