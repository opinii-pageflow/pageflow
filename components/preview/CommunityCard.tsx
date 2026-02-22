import React, { useEffect, useRef, useState } from 'react';
import { Profile, PlanType } from '@/types';
import PhoneFrame from '../landing/PhoneFrame';
import PublicProfileRenderer from './PublicProfileRenderer';
import clsx from 'clsx';
import { Zap, MapPin, Tag, Sparkles } from 'lucide-react';

interface CommunityCardProps {
    profile: Profile;
    onClick?: () => void;
    onPromotionClick?: (profile: Profile) => void;
    featured?: boolean;
    className?: string; // Para dimensões externas
    clientPlan?: PlanType;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ profile, onClick, onPromotionClick, featured = false, className, clientPlan }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Largura base de um "iPhone" para o cálculo da escala
    const BASE_WIDTH = 375;

    useEffect(() => {
        if (!containerRef.current) return;

        const measure = () => {
            const node = containerRef.current;
            if (node) {
                const { width, height } = node.getBoundingClientRect();
                setDimensions({ width, height });
            }
        };

        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, []);

    const scale = dimensions.width > 0 ? dimensions.width / BASE_WIDTH : 1;

    return (
        <div
            className={clsx(
                "group relative select-none cursor-pointer flex flex-col items-center",
                className
            )}
            onClick={onClick}
        >
            {/* Glow/Blur Effect */}
            <div className={clsx(
                "absolute -inset-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[3rem] blur-xl",
                featured ? "bg-gradient-to-b from-yellow-500/20 to-transparent" : "bg-blue-500/10"
            )} />

            {/* Badges Overlay */}
            <div className="absolute top-3 right-3 z-50 flex flex-col items-end gap-2">
                {/* Badge Patrocinado */}
                {featured && (
                    <div className="bg-yellow-400 text-black text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg transform rotate-6 group-hover:rotate-0 transition-all border border-black/10">
                        <Zap size={8} className="fill-black" /> Patro
                    </div>
                )}

                {/* Badge Promoção */}
                {profile.promotionEnabled && (
                    <div
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (onPromotionClick) onPromotionClick(profile);
                        }}
                        className="bg-emerald-500 text-white text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg transform -rotate-3 hover:scale-110 active:scale-95 transition-all animate-pulse border border-emerald-400/50 cursor-pointer"
                    >
                        <Tag size={8} className="fill-white" /> Oferta
                    </div>
                )}
            </div>

            {/* Phone Container */}
            <PhoneFrame className="w-full h-full relative z-10">
                {/* Scaler Wrapper */}
                <div
                    ref={containerRef}
                    className="w-full h-full relative overflow-hidden bg-black rounded-[2rem]"
                >
                    <div
                        className="origin-top-left absolute top-0 left-0 bg-black"
                        style={{
                            width: `${BASE_WIDTH}px`,
                            height: dimensions.height ? `${dimensions.height / (scale || 1)}px` : '100%',
                            transform: `scale(${scale})`,
                        }}
                    >
                        {/* Scroll Wrapper interno */}
                        <div className="w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar bg-black" style={{
                            overscrollBehavior: 'contain',
                            // Força aceleração de hardware
                            transform: 'translateZ(0)'
                        }}>
                            <div className="w-full min-h-screen pointer-events-none">
                                <PublicProfileRenderer
                                    profile={profile}
                                    isPreview={true}
                                    clientPlan={clientPlan}
                                    source="community"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </PhoneFrame>

            {/* Metadata Footer (Nome, Cidade, Segmento) */}
            <div className="mt-4 text-center z-10 w-full px-2">
                <h3 className={clsx(
                    "text-lg font-black tracking-tight transition-colors uppercase italic truncate w-full",
                    featured ? "text-white group-hover:text-yellow-400" : "text-white group-hover:text-blue-400"
                )}>
                    {profile.displayName}
                </h3>
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1 truncate w-full">
                    <span className="truncate max-w-[80px]">{profile.communitySegment}</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700 shrink-0" />
                    <MapPin size={10} className={featured ? "text-yellow-500 shrink-0" : "text-blue-500 shrink-0"} />
                    <span className="truncate max-w-[80px]">
                        {profile.communityCity}{profile.communityState ? `, ${profile.communityState}` : ''}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CommunityCard;
