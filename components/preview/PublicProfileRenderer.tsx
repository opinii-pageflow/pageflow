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

const safeString = (v: any, fallback: string) => (typeof v === 'string' && v.trim() ? v : fallback);

const normalizeFontStack = (font: string) => {
  const name = safeString(font, 'Inter');
  const needsQuotes = /\s/.test(name) || /["']/.test(name);
  const quoted = needsQuotes ? `"${name.replace(/"/g, '')}"` : name;
  return `${quoted}, Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`;
};

const hexToRgb = (hex: string) => {
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
  const lum = relativeLuminance(hexBg);
  if (lum === null) return light;
  return lum > 0.62 ? dark : light;
};

const PublicProfileRenderer: React.FC<Props> = ({ profile, isPreview, clientPlan, source = 'direct' }) => {
  const { theme, fonts, buttons } = profile;
  const layoutTemplate = safeString(profile.layoutTemplate, 'Minimal Card');

  const hasCatalogAccess = canAccessFeature(clientPlan, 'catalog');
  const hasPortfolioAccess = canAccessFeature(clientPlan, 'portfolio');
  const hasVideosAccess = canAccessFeature(clientPlan, 'videos');
  const hasPixAccess = canAccessFeature(clientPlan, 'pix');
  const hasLeadAccess = canAccessFeature(clientPlan, 'leads_capture');
  const hasNpsAccess = canAccessFeature(clientPlan, 'nps');

  const isSplit = layoutTemplate === 'Split Header';
  const isIconGrid = layoutTemplate === 'Icon Grid';
  const isBoldList = layoutTemplate === 'Button List Bold';
  const isGlass = layoutTemplate === 'Glassmorphism';
  const isNeon = layoutTemplate === 'Neon';
  const isCorporate = layoutTemplate === 'Corporate';
  const isCreator = layoutTemplate === 'Creator';
  const isDarkElegant = layoutTemplate === 'Dark Elegant';
  const isLightClean = layoutTemplate === 'Light Clean';
  const isBigAvatar = layoutTemplate === 'Big Avatar';
  const isMagazine = layoutTemplate === 'Magazine';
  const isMinimal = layoutTemplate === 'Minimal Card';

  const isHeroBanner = layoutTemplate === 'Hero Banner';
  const isAvatarLeft = layoutTemplate === 'Avatar Left';
  const isRoundedPills = layoutTemplate === 'Rounded Pills';
  const isButtonGrid = layoutTemplate === 'Button Grid';
  const isStackedCards = layoutTemplate === 'Stacked Cards';
  const isCoverClean = layoutTemplate === 'Cover Clean';
  
  // Novos templates
  const isFullCover = layoutTemplate === 'Full Cover Hero';
  const isDynamicOverlap = layoutTemplate === 'Dynamic Overlap';
  const isCoverCentered = layoutTemplate === 'Cover Centered';

  const headingFont = normalizeFontStack(fonts?.headingFont || 'Poppins');
  const bodyFont = normalizeFontStack(fonts?.bodyFont || 'Inter');
  const buttonFont = normalizeFontStack(fonts?.buttonFont || fonts?.bodyFont || 'Inter');

  const primaryTextOnPrimary = pickReadableOn(theme.primary);

  const bgCss = (() => {
    const bgValue = safeString(theme.backgroundValue, '#0A0A0A');
    if (theme.backgroundType === 'gradient') {
      const dir = safeString(theme.backgroundDirection, 'to bottom');
      const b = safeString(theme.backgroundValueSecondary, bgValue);
      return `linear-gradient(${dir}, ${bgValue}, ${b})`;
    }
    if (theme.backgroundType === 'image') {
      const attachment = isPreview ? 'scroll' : 'fixed';
      return `url(${bgValue}) center/cover no-repeat ${attachment}`;
    }
    return bgValue;
  })();

  const bgStyle: React.CSSProperties = {
    background: bgCss,
    minHeight: isPreview ? '100%' : '100vh',
    height: isPreview ? '100%' : 'auto',
    color: theme.text,
    fontFamily: bodyFont,
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const proCardStyle: React.CSSProperties = {
    borderRadius: `calc(${theme.radius} + 18px)`,
    border: `1px solid ${theme.border}`,
    background: theme.cardBg,
    boxShadow: theme.shadow,
    backdropFilter: (isGlass || theme.buttonStyle === 'glass' || isNeon) ? 'blur(24px)' : undefined,
  };

  const shellCardStyle: React.CSSProperties = {
    borderRadius: isFullCover ? '0px' : isCoverClean ? `calc(${theme.radius} + 18px)` : isLightClean ? `calc(${theme.radius} + 6px)` : `calc(${theme.radius} + 14px)`,
    border: isFullCover ? 'none' : `1px solid ${theme.border}`,
    background: isFullCover ? 'transparent' : theme.cardBg,
    boxShadow: (isMinimal || isFullCover) ? 'none' : theme.shadow,
    backdropFilter: (isGlass || theme.buttonStyle === 'glass' || isNeon || isCreator || isFullCover) ? 'blur(26px)' : undefined,
    position: 'relative',
    overflow: 'hidden',
  };

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
      linkId: btnId,
    });
  };

  const getButtonStyle = (_btn: any, index: number): React.CSSProperties => {
    const wantsGlass = isGlass || theme.buttonStyle === 'glass' || isCreator || isFullCover;
    const wantsOutline = theme.buttonStyle === 'outline' || isLightClean || isDarkElegant;
    const wantsSolid = theme.buttonStyle === 'solid' || isBoldList;

    const base: React.CSSProperties = {
      borderRadius: isRoundedPills ? '999px' : isStackedCards ? `calc(${theme.radius} + 14px)` : isBoldList ? `calc(${theme.radius} + 10px)` : theme.radius,
      fontFamily: buttonFont,
      transition: 'all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      borderWidth: wantsOutline ? '2px' : '1px',
      borderColor: wantsOutline ? theme.primary : theme.border,
      display: 'flex',
      alignItems: 'center',
      justifyContent: (isIconGrid || isButtonGrid) ? 'center' : 'flex-start',
      gap: (isIconGrid || isButtonGrid) ? '0.45rem' : (isSplit || isAvatarLeft) ? '0.55rem' : '0.85rem',
      padding: isIconGrid ? '0.85rem' : isButtonGrid ? '0.95rem' : isBoldList ? '1.15rem 1.4rem' : (isSplit || isAvatarLeft) ? '0.55rem 0.75rem' : isStackedCards ? '1.05rem 1.15rem' : '0.95rem 1.15rem',
      width: '100%',
      boxShadow: (isBoldList || isStackedCards) ? theme.shadow : 'none',
      backdropFilter: wantsGlass ? 'blur(20px)' : undefined,
      fontSize: (isSplit || isAvatarLeft) ? '0.78rem' : '0.92rem',
      fontWeight: isBoldList ? 900 : 800,
    };

    if (wantsSolid) {
      base.backgroundColor = theme.primary;
      base.color = primaryTextOnPrimary;
    } else if (wantsGlass) {
      base.backgroundColor = isFullCover ? 'rgba(0,0,0,0.4)' : isStackedCards ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.08)';
      base.color = theme.text;
    } else {
      base.backgroundColor = isStackedCards ? 'rgba(255,255,255,0.04)' : 'transparent';
      base.color = theme.text;
    }

    if (isBoldList) {
      base.transform = `rotate(${index % 2 === 0 ? '0.5deg' : '-0.5deg'})`;
    }

    return base;
  };

  const renderLinks = () => {
    const activeButtons = (buttons || []).filter(b => b.enabled);
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
      tiktok: LucideIcons.Music2,
      telegram: LucideIcons.Send,
      threads: LucideIcons.AtSign,
      twitch: LucideIcons.Tv,
      discord: LucideIcons.MessageSquare,
    };

    return (
      <div className={clsx(
        'w-full transition-all duration-700',
        (isIconGrid || isButtonGrid) ? 'grid grid-cols-2 gap-2' : isMagazine ? 'grid grid-cols-2 gap-2' : 'space-y-3'
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
              className="group relative overflow-hidden"
            >
              <div className={clsx(
                'rounded-lg flex items-center justify-center transition-transform duration-500 group-hover:scale-110',
                isIconGrid ? 'w-7 h-7 mb-1' : 'w-8 h-8 bg-black/10'
              )}>
                <Icon size={isIconGrid ? 20 : 16} color={getIconColor(btn.type)} />
              </div>
              <div className="flex-1 truncate">
                <div className="font-black leading-tight">{btn.label}</div>
              </div>
              {!isIconGrid && <LucideIcons.ChevronRight size={12} className="opacity-10 group-hover:translate-x-1" />}
            </a>
          );
        })}
      </div>
    );
  };

  const renderHeader = () => {
    const isLeftHeader = isSplit || isAvatarLeft;
    const avatarClass = clsx(
      'object-cover border-2 transition-all duration-700',
      isLeftHeader ? 'w-20 h-20 rounded-2xl' : isFullCover ? 'w-32 h-32 rounded-full border-4 shadow-2xl' : 'w-28 h-28 rounded-full'
    );

    return (
      <header className={clsx('w-full flex', isLeftHeader ? 'flex-row items-center text-left gap-4 mb-4' : 'flex-col items-center text-center')}>
        <div className={clsx('relative', isFullCover ? 'mb-6' : isCoverClean ? '-mt-14 mb-2' : 'mb-4')}>
          <img src={profile.avatarUrl} className={avatarClass} style={{ borderColor: theme.border }} alt={profile.displayName} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-black text-2xl tracking-tighter leading-tight truncate" style={{ fontFamily: headingFont }}>{profile.displayName}</h1>
          <p className="text-sm truncate" style={{ color: theme.muted }}>{profile.headline}</p>
        </div>
      </header>
    );
  };

  const shouldShowCover = !isMinimal && (isCoverClean || Boolean(profile.coverUrl) || isHeroBanner || isFullCover || isDynamicOverlap || isCoverCentered);
  
  const coverHeightClass = isFullCover 
    ? (isPreview ? 'h-full' : 'h-[85vh]') 
    : isDynamicOverlap || isCoverCentered 
      ? (isPreview ? 'h-56' : 'h-80') 
      : isMagazine || isHeroBanner || isCoverClean 
        ? (isPreview ? 'h-44' : 'h-64') 
        : (isPreview ? 'h-28' : 'h-44');

  return (
    <div style={bgStyle} className="w-full flex flex-col items-center overflow-x-hidden no-scrollbar">
      {shouldShowCover && (
        <div className={clsx('w-full overflow-hidden relative', isFullCover ? 'fixed inset-0 z-0' : 'sticky top-0 z-0', coverHeightClass)}>
          {profile.coverUrl ? (
            <img src={profile.coverUrl} className="w-full h-full object-cover" alt="Cover" />
          ) : (
            <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${theme.primary}55, rgba(0,0,0,0.75))` }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80" />
        </div>
      )}

      <div className={clsx(
        'relative z-10 w-full px-4 flex flex-col items-center',
        isFullCover ? 'min-h-screen pt-[40vh] pb-20' : isDynamicOverlap ? '-mt-24' : isCoverCentered ? '-mt-16' : shouldShowCover ? '-mt-12' : 'pt-8'
      )}>
        <main 
          className={clsx('w-full transition-all duration-700 mb-12 max-w-[520px]', isFullCover ? 'bg-black/30 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10' : 'p-6')} 
          style={shellCardStyle}
        >
          {isFullCover && (
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/5 to-transparent opacity-50" />
          )}
          
          {renderHeader()}
          {profile.bioShort && <div className="mb-5 text-xs text-center leading-relaxed" style={{ color: theme.muted }}>{profile.bioShort}</div>}
          {renderLinks()}

          {/* Pro Modules (PIX, Catálogo, etc) */}
          {hasPixAccess && profile.pixKey && (
            <div className="mt-6 w-full p-6" style={proCardStyle}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Pix</div>
                  <div className="font-bold text-sm truncate">{profile.pixKey}</div>
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(profile.pixKey || '')}
                  className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  style={{ background: theme.primary, color: primaryTextOnPrimary }}
                >Copiar</button>
              </div>
            </div>
          )}

          {/* Catálogo */}
          {hasCatalogAccess && (profile.catalogItems || []).filter(i => i.isActive).length > 0 && (
            <div className="mt-6 w-full p-6" style={proCardStyle}>
               <div className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-60">Catálogo</div>
               <div className="grid grid-cols-2 gap-3">
                 {(profile.catalogItems as CatalogItem[]).filter(i => i.isActive).map(item => (
                   <div key={item.id} className="rounded-2xl border p-3 bg-black/20" style={{ borderColor: theme.border }}>
                     {item.imageUrl && <img src={item.imageUrl} className="w-full aspect-square rounded-xl object-cover mb-2" />}
                     <div className="font-bold text-xs truncate">{item.title}</div>
                     <div className="text-[10px] text-blue-400 font-black mt-1">{item.priceText}</div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {/* Portfólio */}
          {hasPortfolioAccess && (profile.portfolioItems || []).filter(i => i.isActive).length > 0 && (
            <div className="mt-6 w-full p-6" style={proCardStyle}>
              <div className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-60">Portfólio</div>
              <div className="grid grid-cols-3 gap-2">
                {(profile.portfolioItems as PortfolioItem[]).filter(i => i.isActive).map(item => (
                  <img key={item.id} src={item.imageUrl} className="w-full aspect-square object-cover rounded-xl border" style={{ borderColor: theme.border }} />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PublicProfileRenderer;