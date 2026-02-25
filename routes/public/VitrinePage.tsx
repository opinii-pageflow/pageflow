import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Profile, Showcase, ShowcaseItem, ShowcaseImage, ShowcaseOption, ShowcaseTestimonial } from '../../types';
import { profilesApi } from '@/lib/api/profiles';
import { showcaseApi } from '@/lib/api/showcase';
import { trackEvent } from '@/lib/analytics';
import VitrineRenderer from '../../components/preview/VitrineRenderer';

const VitrinePage: React.FC = () => {
    const { slug } = useParams();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [showcase, setShowcase] = useState<(Showcase & { items: (ShowcaseItem & { images: ShowcaseImage[], options: ShowcaseOption[], testimonials: ShowcaseTestimonial[] })[] }) | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            if (!slug) return;
            try {
                setLoading(true);
                const p = await profilesApi.getBySlug(slug);
                if (p) {
                    setProfile(p);
                    const s = await showcaseApi.getByProfileId(p.id);
                    setShowcase(s);

                    if (s) {
                        trackEvent({
                            type: 'showcase_view',
                            profileId: p.id,
                            clientId: p.clientId,
                            source: 'direct'
                        });
                    }
                }
            } catch (err) {
                console.error("Error loading showcase data:", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6">
                <div className="w-12 h-12 border-4 border-white/5 border-t-blue-500 rounded-full animate-spin mb-4" />
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Carregando Seu Catálogo...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-2xl font-black text-white mb-2">Perfil não encontrado</h1>
                <Link to="/" className="text-blue-400 font-bold hover:underline">Voltar ao Início</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505]">
            {/* Header / Nav */}
            <nav className="fixed top-0 left-0 right-0 h-20 bg-black/60 backdrop-blur-3xl border-b border-white/5 z-[100] px-4">
                <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
                    <Link to={`/u/${profile.slug}`} className="flex items-center gap-2 group">
                        <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 group-hover:bg-white/10 transition-all text-zinc-400 group-hover:text-white">
                            <ArrowLeft size={18} />
                        </div>
                        <span className="text-zinc-400 text-xs font-black uppercase tracking-widest hidden sm:inline">Voltar ao Perfil</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <div className="text-white font-black text-xs uppercase tracking-tight">{profile.displayName}</div>
                            <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Catálogo Premium</div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[1px]">
                            <div className="w-full h-full rounded-xl overflow-hidden bg-black">
                                <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="pt-20">
                <VitrineRenderer profile={profile} showcase={showcase} isPreview={false} />
            </div>
        </div>
    );
};

export default VitrinePage;
