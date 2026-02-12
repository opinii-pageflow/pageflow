"use client";

import React from 'react';
import { Profile, AnalyticsSource, CatalogItem, PortfolioItem, YoutubeVideoItem, PlanType } from '../../types';
import { formatLink, getIconColor } from '../../lib/linkHelpers';
import { trackEvent } from '../../lib/analytics';
import { updateStorage } from '../../lib/storage';
import { extractYouTubeId } from '../../lib/youtube';
import { canAccessFeature } from '../../lib/permissions';
import * as LucideIcons from 'lucide-react';
import clsx from 'clsx';

interface Props {
  profile: Profile;
  isPreview?: boolean;
  clientPlan?: PlanType;
  source?: AnalyticsSource;
}

const PublicProfileRenderer: React.FC<Props> = ({ profile, isPreview, clientPlan, source = 'direct' }) => {
  const { theme, fonts, buttons, layoutTemplate } = profile;

  // Verificações de permissão por funcionalidade
  const hasCatalogAccess = canAccessFeature(clientPlan, 'catalog');
  const hasPortfolioAccess = canAccessFeature(clientPlan, 'portfolio');
  const hasVideosAccess = canAccessFeature(clientPlan, 'videos');
  const hasPixAccess = canAccessFeature(clientPlan, 'pix');
  const hasLeadAccess = canAccessFeature(clientPlan, 'leads_capture');
  const hasNpsAccess = canAccessFeature(clientPlan, 'nps');

  const proCardClass = "mt-6 w-full rounded-[2.5rem] border border-white/5 bg-white/5 backdrop-blur-2xl p-6 shadow-2xl";

  const pushLead = (payload: { name: string; contact: string; message?: string }) => {
    if (!hasLeadAccess || isPreview) return;
    updateStorage(prev => ({
      ...prev,
      leads: [
        ...prev.leads,
        {
          id: Math.random().toString(36).slice(2),
          clientId: profile.clientId,
          profileId: profile.id,
          name: payload.name,
          contact: payload.contact,
          message: payload.message,
          status: 'novo',
          createdAt: new Date().toISOString(),
          source,
        },
      ],
    }));
  };

  const pushNps = (score: number, comment?: string) => {
    if (!hasNpsAccess || isPreview) return;
    updateStorage(prev => ({
      ...prev,
      nps: [
        ...prev.nps,
        {
          id: Math.random().toString(36).slice(2),
          clientId: profile.clientId,
          profileId: profile.id,
          score,
          comment,
          createdAt: new Date().toISOString(),
          source,
        },
      ],
    }));
  };

  const handleLinkClick = (btnId: string) => {
    if (isPreview) return;
    trackEvent({
      profileId: profile.id,
      clientId: profile.clientId,
      type: 'click',
      linkId: btnId
    });
  };

  const isSplit = layoutTemplate === 'Split Header';

  const bgStyle: React.CSSProperties = {
    background: theme.backgroundType === 'gradient' 
      ? `linear-gradient(${theme.backgroundDirection || 'to bottom'}, ${theme.backgroundValue}, ${theme.backgroundValueSecondary || theme.backgroundValue})`
      : theme.backgroundType === 'image'
        ? `url(${theme.backgroundValue}) center/cover no-repeat fixed`
        : theme.backgroundValue,
    minHeight: isPreview ? '100%' : '100vh',
    height: isPreview ? '100%' : 'auto',
    color: theme.text,
    fontFamily: fonts.bodyFont,
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const getButtonStyle = (btn: any, index: number): React.CSSProperties => {
    const isIconGrid = layoutTemplate === 'Icon Grid';
    const isBoldList = layoutTemplate === 'Button List Bold';
    const isGlass = layoutTemplate === 'Glassmorphism' || theme.buttonStyle === 'glass';
    
    const base: React.CSSProperties = {
      borderRadius: theme.radius,
      fontFamily: fonts.buttonFont,
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      boxShadow: theme.shadow,
      borderWidth: theme.buttonStyle === 'outline' ? '2px' : '1px',
      borderColor: theme.buttonStyle === 'outline' ? theme.primary : 'rgba(255,255,255,0.08)',
      display: 'flex',
      alignItems: 'center',
      gap: isIconGrid ? '0.4rem' : isSplit ? '0.5rem' : '0.8rem',
      justifyContent: isIconGrid ? 'center' : 'flex-start',
      padding: isIconGrid ? '0.8rem' : isBoldList ? '1.2rem 1.5rem' : isSplit ? '0.5rem 0.7rem' : '0.9rem 1.1rem',
      width: '100%',
      backgroundColor: theme.buttonStyle === 'solid' ? theme.primary : isGlass ? 'rgba(255,255,255,0.06)' : 'transparent',
      color: theme.buttonStyle === 'solid' ? '#fff' : theme.text,
      backdropFilter: isGlass ? 'blur(20px)' : 'none',
      fontSize: isSplit ? '0.75rem' : '0.9rem',
    };

    if (isBoldList) {
      base.transform = `rotate(${index % 2 === 0 ? '0.4deg' : '-0.4deg'})`;
      base.fontWeight = '900';
    }

    return base;
  };

  const renderLinks = () => {
    const activeButtons = buttons.filter(b => b.enabled);
    const isIconGrid = layoutTemplate === 'Icon Grid';

    const iconMap: Record<string, any> = {
      whatsapp: LucideIcons.MessageCircle,
      instagram: LucideIcons.Instagram,
      linkedin: LucideIcons.Linkedin,
      website: LucideIcons.Globe,
      phone: LucideIcons.Phone,
      email: LucideIcons.Mail,
      maps: LucideIcons.MapPin,
      youtube: LucideIcons.Youtube,
      github: LucideIcons.Github,
      facebook: LucideIcons.Facebook,
      twitter: LucideIcons.Twitter,
      x: LucideIcons.Twitter,
      tiktok: LucideIcons.Music2,
      telegram: LucideIcons.Send,
      threads: LucideIcons.AtSign,
      twitch: LucideIcons.Tv,
      discord: LucideIcons.MessageSquare
    };

    return (
      <div className={clsx(
        "w-full transition-all duration-1000",
        isIconGrid ? "grid grid-cols-2 gap-2" : isSplit ? "space-y-1.5" : "space-y-3",
      )}>
        {activeButtons.map((btn, idx) => {
          const Icon = iconMap[btn.type] || LucideIcons.ExternalLink;
          return (
            <a
              key={btn.id}
              href={isPreview ? '#' : formatLink(btn.type, btn.value)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleLinkClick(btn.id)}
              style={getButtonStyle(btn, idx)}
              className={clsx(
                "group relative overflow-hidden",
                !isIconGrid && "hover:translate-x-1",
                isIconGrid && "aspect-square flex-col text-center hover:scale-105"
              )}
            >
              <div className={clsx(
                "rounded-lg flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
                isIconGrid ? "w-7 h-7 mb-1" : isSplit ? "w-6 h-6 bg-black/5" : "w-8 h-8 bg-black/10"
              )}>
                <Icon size={isIconGrid ? 20 : isSplit ? 14 : 16} color={getIconColor(btn.type)} />
              </div>

              {!isIconGrid && (
                <div className="flex-1 truncate">
                  <div className="font-bold leading-tight">{btn.label}</div>
                </div>
              )}
              
              {isIconGrid && (
                <div className="text-[7px] font-black uppercase tracking-widest opacity-70">
                  {btn.label}
                </div>
              )}

              {!isIconGrid && layoutTemplate !== 'Button List Bold' && !isSplit && (
                <LucideIcons.ChevronRight size={12} className="opacity-10 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
              )}
            </a>
          );
        })}
      </div>
    );
  };

  const renderHeader = () => {
    const isCorporate = layoutTemplate === 'Corporate';

    return (
      <header className={clsx(
        "w-full flex flex-col transition-all duration-700",
        isCorporate ? "items-start text-left" : "items-center text-center",
        isSplit ? "flex-row items-center text-left gap-3 mb-3" : "mb-4"
      )}>
        <div className={clsx(
          "relative",
          isSplit ? "flex-shrink-0" : "mb-3"
        )}>
          <img 
            src={profile.avatarUrl} 
            className={clsx(
              "object-cover border-2 shadow-lg transition-all duration-700",
              isSplit ? "w-12 h-12 rounded-xl" : "rounded-full w-20 h-20",
            )}
            style={{ borderColor: theme.cardBg }}
            alt={profile.displayName}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h1 
            className={clsx(
              "font-black tracking-tighter leading-tight truncate",
              isSplit ? "text-base" : "text-xl",
            )}
            style={{ fontFamily: fonts.headingFont }}
          >
            {profile.displayName}
          </h1>
          <p className={clsx(
            "font-medium opacity-50 truncate",
            isSplit ? "text-[9px]" : "text-xs",
          )}>
            {profile.headline}
          </p>
        </div>
      </header>
    );
  };

  return (
    <div style={bgStyle} className="w-full flex flex-col items-center overflow-x-hidden no-scrollbar">
      {profile.coverUrl && layoutTemplate !== 'Minimal Card' && (
        <div className={clsx(
          "w-full overflow-hidden sticky top-0 z-0",
          isPreview ? "h-24" : "h-40"
        )}>
          <img src={profile.coverUrl} className="w-full h-full object-cover" alt="Cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
        </div>
      )}

      <div className={clsx(
        "relative z-10 w-full px-4 flex flex-col items-center",
        profile.coverUrl ? "-mt-8" : "pt-6"
      )}>
        <main className={clsx(
          "w-full transition-all duration-700 mb-12",
          isSplit ? "max-w-[94%] p-3 rounded-[2rem] bg-black/30 backdrop-blur-xl border border-white/5 shadow-2xl" : "max-w-[500px]",
          layoutTemplate === 'Glassmorphism' ? "p-5 rounded-[2rem] bg-white/5 backdrop-blur-3xl border border-white/10" : ""
        )}>
          {renderHeader()}

          {profile.bioShort && (
            <div className={clsx(
              "mb-3 leading-relaxed opacity-60",
              isSplit ? "text-[9px] text-left line-clamp-2" : "text-[10px] text-center"
            )}>
              {profile.bioShort}
            </div>
          )}

          {renderLinks()}

          {/* PIX */}
          {hasPixAccess && profile.pixKey && (
            <div className={proCardClass}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Pix</div>
                  <div className="font-bold text-sm truncate" style={{ fontFamily: fonts.headingFont }}>{profile.pixKey}</div>
                </div>
                <button
                  onClick={async () => {
                    try { await navigator.clipboard.writeText(profile.pixKey || ''); } catch {}
                  }}
                  className="px-3 py-2 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest active:scale-95"
                >
                  Copiar
                </button>
              </div>
            </div>
          )}

          {/* Catálogo */}
          {hasCatalogAccess && (profile.catalogItems || []).filter(i => i.isActive).length > 0 && (
            <div className={proCardClass}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Catálogo</div>
                <LucideIcons.ShoppingBag size={16} className="opacity-50" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(profile.catalogItems as CatalogItem[])
                  .filter(i => i.isActive)
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((item) => (
                    <div key={item.id} className="flex flex-col gap-3 rounded-[1.8rem] border border-white/10 bg-black/20 p-4 transition-all hover:bg-black/30 group">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full aspect-square rounded-2xl object-cover border border-white/10 group-hover:scale-[1.02] transition-transform duration-500" />
                      ) : (
                        <div className="w-full aspect-square rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                          <LucideIcons.Package size={24} className="opacity-30" />
                        </div>
                      )}
                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="font-black text-sm truncate" style={{ fontFamily: fonts.headingFont }}>{item.title}</div>
                        {item.description && <div className="text-[10px] opacity-60 line-clamp-2 mt-1 mb-2 leading-relaxed">{item.description}</div>}
                        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                          <div className="text-[11px] font-black text-emerald-400 whitespace-nowrap">{item.priceText || 'Consultar'}</div>
                          {item.ctaLink && (
                            <a
                              href={item.ctaLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-white text-black text-[9px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                            >
                              {item.ctaLabel || 'Ver'}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Portfólio */}
          {hasPortfolioAccess && (profile.portfolioItems || []).filter(i => i.isActive).length > 0 && (
            <div className={proCardClass}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Portfólio</div>
                <LucideIcons.Image size={16} className="opacity-50" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(profile.portfolioItems as PortfolioItem[])
                  .filter(i => i.isActive)
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .slice(0, 9)
                  .map((item) => (
                    <a key={item.id} href={item.imageUrl} target="_blank" rel="noopener noreferrer" className="block">
                      <img src={item.imageUrl} alt={item.title || 'Portfolio'} className="w-full aspect-square object-cover rounded-xl border border-white/10 hover:opacity-90 transition-opacity" />
                    </a>
                  ))}
              </div>
            </div>
          )}

          {/* Vídeos */}
          {hasVideosAccess && (profile.youtubeVideos || []).filter(i => i.isActive).length > 0 && (
            <div className={proCardClass}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Vídeos</div>
                <LucideIcons.Youtube size={16} className="opacity-50" />
              </div>
              <div className="space-y-3">
                {(profile.youtubeVideos as YoutubeVideoItem[])
                  .filter(i => i.isActive)
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .slice(0, 3)
                  .map((vid) => {
                    const id = extractYouTubeId(vid.url);
                    if (!id) return null;
                    return (
                      <div key={vid.id} className="rounded-2xl border border-white/10 overflow-hidden bg-black/20">
                        <div className="aspect-video w-full">
                          <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${id}`}
                            title={vid.title || 'YouTube video'}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        {vid.title && <div className="p-3 text-[10px] font-bold opacity-70">{vid.title}</div>}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* NPS */}
          {hasNpsAccess && profile.enableNps && (
            <NpsBlock onSubmit={pushNps} className={proCardClass} />
          )}

          {/* Leads */}
          {hasLeadAccess && profile.enableLeadCapture && (
            <LeadBlock onSubmit={pushLead} className={proCardClass} />
          )}

          <footer className="mt-6 flex flex-col items-center gap-1 opacity-20">
             <div className="w-3 h-3 bg-current rounded-sm flex items-center justify-center font-black text-[5px]">LF</div>
             <span className="text-[5px] font-black uppercase tracking-[0.3em]">LinkFlow</span>
          </footer>
        </main>
      </div>
    </div>
  );
};

const NpsBlock: React.FC<{ className: string; onSubmit: (score: number, comment?: string) => void }> = ({ className, onSubmit }) => {
  const [score, setScore] = React.useState<number | null>(null);
  const [comment, setComment] = React.useState('');
  const [sent, setSent] = React.useState(false);

  if (sent) {
    return (
      <div className={className}>
        <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Avaliação</div>
        <div className="text-sm font-black">Obrigado pela sua nota! ✅</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Avalie este perfil (NPS)</div>
        <LucideIcons.Star size={16} className="opacity-50" />
      </div>
      <div className="grid grid-cols-11 gap-1">
        {Array.from({ length: 11 }).map((_, i) => (
          <button
            key={i}
            onClick={() => setScore(i)}
            className={clsx(
              "aspect-square rounded-lg text-[10px] font-black transition-all active:scale-95",
              score === i ? "bg-white text-black" : "bg-white/5 border border-white/10 opacity-70 hover:opacity-100"
            )}
          >
            {i}
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Se quiser, deixe um comentário (opcional)"
        className="mt-3 w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2 text-xs outline-none focus:border-white/30"
        rows={2}
      />
      <button
        disabled={score === null}
        onClick={() => {
          if (score === null) return;
          onSubmit(score, comment.trim() || undefined);
          setSent(true);
        }}
        className="mt-3 w-full py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest disabled:opacity-30 active:scale-95"
      >
        Enviar
      </button>
    </div>
  );
};

const LeadBlock: React.FC<{ className: string; onSubmit: (data: { name: string; contact: string; message?: string }) => void }> = ({ className, onSubmit }) => {
  const [sent, setSent] = React.useState(false);
  const [name, setName] = React.useState('');
  const [contact, setContact] = React.useState('');
  const [message, setMessage] = React.useState('');

  if (sent) {
    return (
      <div className={className}>
        <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Contato</div>
        <div className="text-sm font-black">Recebido! Vou te chamar em breve. ✅</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Fale comigo</div>
        <LucideIcons.MessageCircle size={16} className="opacity-50" />
      </div>

      <div className="space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome*"
          className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2 text-xs outline-none focus:border-white/30"
        />
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Seu contato (WhatsApp ou E-mail)*"
          className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2 text-xs outline-none focus:border-white/30"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mensagem (opcional)"
          className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2 text-xs outline-none focus:border-white/30"
          rows={2}
        />
      </div>

      <button
        disabled={!name.trim() || !contact.trim()}
        onClick={() => {
          if (!name.trim() || !contact.trim()) return;
          onSubmit({
            name: name.trim(),
            contact: contact.trim(),
            message: message.trim() || undefined,
          });
          setSent(true);
        }}
        className="mt-3 w-full py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest disabled:opacity-30 active:scale-95"
      >
        Enviar
      </button>
    </div>
  );
};

export default PublicProfileRenderer;