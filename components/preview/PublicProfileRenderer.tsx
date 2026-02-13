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

// ===== helpers =====
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

  // Permissões por feature
  const hasCatalogAccess = canAccessFeature(clientPlan, 'catalog');
  const hasPortfolioAccess = canAccessFeature(clientPlan, 'portfolio');
  const hasVideosAccess = canAccessFeature(clientPlan, 'videos');
  const hasPixAccess = canAccessFeature(clientPlan, 'pix');
  const hasLeadAccess = canAccessFeature(clientPlan, 'leads_capture');
  const hasNpsAccess = canAccessFeature(clientPlan, 'nps');

  // Templates existentes
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

  // Templates novos
  const isHeroBanner = layoutTemplate === 'Hero Banner';
  const isAvatarLeft = layoutTemplate === 'Avatar Left';
  const isRoundedPills = layoutTemplate === 'Rounded Pills';
  const isButtonGrid = layoutTemplate === 'Button Grid';
  const isStackedCards = layoutTemplate === 'Stacked Cards';
  const isCoverClean = layoutTemplate === 'Cover Clean';

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
    borderRadius: isCoverClean ? `calc(${theme.radius} + 18px)` : isLightClean ? `calc(${theme.radius} + 6px)` : `calc(${theme.radius} + 14px)`,
    border: `1px solid ${theme.border}`,
    background: theme.cardBg,
    boxShadow: isMinimal ? 'none' : theme.shadow,
    backdropFilter: (isGlass || theme.buttonStyle === 'glass' || isNeon || isCreator) ? 'blur(26px)' : undefined,
    position: 'relative',
    overflow: 'hidden',
  };

  const shellDecor = (
    <>
      {isNeon && (
        <>
          <div className="absolute -top-24 -left-24 w-56 h-56 rounded-full blur-3xl opacity-30" style={{ background: theme.primary }} />
          <div className="absolute -bottom-24 -right-24 w-56 h-56 rounded-full blur-3xl opacity-25" style={{ background: theme.primary }} />
          <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: `0 0 0 1px ${theme.border}, 0 0 45px rgba(0,0,0,0.25)` }} />
        </>
      )}

      {isCreator && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[240px] rounded-full blur-3xl opacity-25"
            style={{ background: theme.primary }}
          />
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/25 to-transparent" />
        </div>
      )}
    </>
  );

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
    const wantsGlass = isGlass || theme.buttonStyle === 'glass' || isCreator;
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
      base.backgroundColor = isStackedCards ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.08)';
      base.color = theme.text;
    } else {
      base.backgroundColor = isStackedCards ? 'rgba(255,255,255,0.04)' : 'transparent';
      base.color = theme.text;
    }

    if (isBoldList) {
      base.transform = `rotate(${index % 2 === 0 ? '0.5deg' : '-0.5deg'})`;
    }

    if (isNeon) {
      base.boxShadow = `0 0 0 1px ${theme.border}, 0 0 18px rgba(0,0,0,0.15)`;
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
      x: LucideIcons.Twitter,
      tiktok: LucideIcons.Music2,
      telegram: LucideIcons.Send,
      threads: LucideIcons.AtSign,
      twitch: LucideIcons.Tv,
      discord: LucideIcons.MessageSquare,
    };

    const wrapperClass = clsx(
      'w-full transition-all duration-700',
      isIconGrid && 'grid grid-cols-2 gap-2',
      isButtonGrid && 'grid grid-cols-2 gap-2',
      !isIconGrid && (isSplit || isAvatarLeft) && 'space-y-1.5',
      !isIconGrid && !(isSplit || isAvatarLeft) && isMagazine && 'grid grid-cols-2 gap-2',
      isStackedCards && 'space-y-2',
      !isIconGrid && !isButtonGrid && !(isSplit || isAvatarLeft) && !isMagazine && !isStackedCards && 'space-y-3',
    );

    return (
      <div className={wrapperClass}>
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
                'group relative overflow-hidden',
                !isIconGrid && !isButtonGrid && !isStackedCards && 'hover:translate-x-1',
                (isIconGrid || isButtonGrid) && 'flex-col text-center hover:scale-[1.03]',
                isIconGrid && 'aspect-square',
              )}
            >
              <div
                className={clsx(
                  'rounded-lg flex items-center justify-center transition-transform duration-500 group-hover:scale-110',
                  isIconGrid ? 'w-7 h-7 mb-1' : (isSplit || isAvatarLeft) ? 'w-6 h-6 bg-black/5' : 'w-8 h-8 bg-black/10',
                )}
              >
                <Icon size={isIconGrid ? 20 : (isSplit || isAvatarLeft) ? 14 : 16} color={getIconColor(btn.type)} />
              </div>

              {!isIconGrid && (
                <div className="flex-1 truncate">
                  <div className="font-black leading-tight">{btn.label}</div>
                </div>
              )}

              {isIconGrid && <div className="text-[7px] font-black uppercase tracking-widest opacity-70">{btn.label}</div>}

              {!isIconGrid && !isBoldList && !(isSplit || isAvatarLeft) && (
                <LucideIcons.ChevronRight size={12} className="opacity-10 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
              )}
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
      isLeftHeader && 'w-20 h-20 rounded-2xl',
      !isLeftHeader && isCorporate && 'w-16 h-16 rounded-2xl',
      !isLeftHeader && isBigAvatar && 'w-36 h-36 rounded-full',
      !isLeftHeader && !isCorporate && !isBigAvatar && 'w-28 h-28 rounded-full',
    );

    const headerClass = clsx(
      'w-full flex transition-all duration-700',
      isLeftHeader ? 'flex-row items-center text-left gap-4 mb-4' : 'flex-col items-center text-center',
      (isCorporate || isMagazine) && !isLeftHeader ? 'items-start text-left' : '',
    );

    const headlineClass = clsx('font-medium truncate', isLeftHeader ? 'text-xs' : 'text-sm');

    const nameClass = clsx(
      'font-black tracking-tighter leading-tight truncate',
      isLeftHeader ? 'text-lg' : isBigAvatar ? 'text-3xl' : isMagazine ? 'text-2xl' : 'text-2xl',
    );

    // Cover Clean: avatar “limpo” por cima do cover
    const coverCleanWrapClass = clsx(isCoverClean ? '-mt-14 mb-2' : (isCorporate || isMagazine) && !isLeftHeader ? 'mb-3' : 'mb-4');

    return (
      <header className={headerClass}>
        <div className={clsx('relative', isLeftHeader ? 'flex-shrink-0' : coverCleanWrapClass)}>
          <img
            src={profile.avatarUrl}
            className={avatarClass}
            style={{
              borderColor: theme.border,
              boxShadow: isNeon ? `0 0 0 1px ${theme.border}, 0 0 25px rgba(0,0,0,0.25)` : undefined,
            }}
            alt={profile.displayName}
          />

          {isCoverClean && (
            <div
              className={clsx(
                'absolute inset-0 rounded-full pointer-events-none',
                // halo suave no modo clean
              )}
              style={{ boxShadow: `0 0 0 6px rgba(0,0,0,0.22), 0 0 0 1px ${theme.border}` }}
            />
          )}

          {isCreator && !isLeftHeader && !isCoverClean && (
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ boxShadow: `0 0 0 2px ${theme.primary}55, 0 0 28px ${theme.primary}33` }}
            />
          )}
        </div>

        <div className={clsx('flex-1 min-w-0', (isCorporate || isMagazine) && !isLeftHeader ? 'w-full' : '')}>
          <h1 className={nameClass} style={{ fontFamily: headingFont }}>
            {profile.displayName}
          </h1>
          <p className={headlineClass} style={{ color: theme.muted }}>
            {profile.headline}
          </p>
        </div>
      </header>
    );
  };

  // Cover:
  // - Minimal Card: não mostra cover
  // - Cover Clean: sempre tenta mostrar cover quando existir
  // - Hero Banner: mostra banner mesmo sem coverUrl (usa gradiente)
  const shouldShowCover =
    !isMinimal && (isCoverClean ? true : (Boolean(profile.coverUrl) || isHeroBanner));

  const coverHeightClass = isPreview
    ? (isMagazine || isHeroBanner || isCoverClean ? 'h-44' : 'h-28')
    : (isMagazine || isHeroBanner || isCoverClean ? 'h-64' : 'h-44');

  const shellWrapClass = clsx(
    'relative z-10 w-full px-4 flex flex-col items-center',
    shouldShowCover ? (isMagazine ? '-mt-16' : isCoverClean ? '-mt-10' : '-mt-12') : 'pt-8',
  );

  const isLeftHeader = isSplit || isAvatarLeft;
  const shellMaxWidth = isLeftHeader ? 'max-w-[94%]' : isMagazine ? 'max-w-[560px]' : 'max-w-[520px]';

  const shellPaddingClass = isLeftHeader
    ? 'p-4'
    : isLightClean
      ? 'p-7'
      : isMagazine
        ? 'p-6'
        : isCorporate
          ? 'p-6'
          : isCreator
            ? 'p-7'
            : isCoverClean
              ? 'p-6 pt-8'
              : 'p-6';

  return (
    <div style={bgStyle} className="w-full flex flex-col items-center overflow-x-hidden no-scrollbar">
      {shouldShowCover && (
        <div className={clsx('w-full overflow-hidden sticky top-0 z-0 relative', coverHeightClass)}>
          {profile.coverUrl ? (
            <img src={profile.coverUrl} className="w-full h-full object-cover" alt="Cover" />
          ) : (
            <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${theme.primary}55, rgba(0,0,0,0.75))` }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
        </div>
      )}

      <div className={shellWrapClass}>
        <main className={clsx('w-full transition-all duration-700 mb-12', shellMaxWidth, shellPaddingClass)} style={shellCardStyle}>
          {shellDecor}

          {isMagazine && profile.coverUrl && (
            <div className="-mx-6 -mt-6 mb-5 overflow-hidden rounded-[1.6rem] border" style={{ borderColor: theme.border }}>
              <div className="relative">
                <img src={profile.coverUrl} className="w-full h-44 object-cover" alt="Cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              </div>
              <div className="px-5 py-4">
                <div className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: theme.muted }}>
                  Destaque
                </div>
                <div className="mt-1 text-lg font-black" style={{ fontFamily: headingFont }}>
                  {profile.bioShort || 'Seu perfil em formato editorial.'}
                </div>
              </div>
            </div>
          )}

          {renderHeader()}

          {profile.bioShort && !isMagazine && (
            <div
              className={clsx(
                'mb-5 leading-relaxed',
                (isSplit || isAvatarLeft) ? 'text-[10px] text-left line-clamp-3' : isCorporate ? 'text-xs text-left' : 'text-xs text-center',
              )}
              style={{ color: theme.muted }}
            >
              {profile.bioShort}
            </div>
          )}

          {renderLinks()}

          {/* PIX */}
          {hasPixAccess && profile.pixKey && (
            <div className="mt-6 w-full p-6" style={proCardStyle}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: theme.muted }}>
                    Pix
                  </div>
                  <div className="font-bold text-sm truncate" style={{ fontFamily: headingFont }}>
                    {profile.pixKey}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(profile.pixKey || '');
                    } catch {}
                  }}
                  className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95"
                  style={{ background: theme.primary, color: primaryTextOnPrimary }}
                >
                  Copiar
                </button>
              </div>
            </div>
          )}

          {/* Catálogo */}
          {hasCatalogAccess && (profile.catalogItems || []).filter(i => i.isActive).length > 0 && (
            <div className="mt-6 w-full p-6" style={proCardStyle}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: theme.muted }}>
                  Catálogo
                </div>
                <LucideIcons.ShoppingBag size={16} className="opacity-50" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(profile.catalogItems as CatalogItem[])
                  .filter(i => i.isActive)
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 rounded-[1.8rem] border p-4 transition-all group"
                      style={{ borderColor: theme.border, background: 'rgba(0,0,0,0.18)' }}
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full aspect-square rounded-2xl object-cover border group-hover:scale-[1.02] transition-transform duration-500"
                          style={{ borderColor: theme.border }}
                        />
                      ) : (
                        <div className="w-full aspect-square rounded-2xl border flex items-center justify-center" style={{ borderColor: theme.border, background: 'rgba(255,255,255,0.05)' }}>
                          <LucideIcons.Package size={24} className="opacity-30" />
                        </div>
                      )}
                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="font-black text-sm truncate" style={{ fontFamily: headingFont }}>
                          {item.title}
                        </div>
                        {item.description && (
                          <div className="text-[10px] line-clamp-2 mt-1 mb-2 leading-relaxed" style={{ color: theme.muted }}>
                            {item.description}
                          </div>
                        )}
                        <div className="mt-auto pt-3 border-t flex items-center justify-between gap-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                          <div className="text-[11px] font-black whitespace-nowrap" style={{ color: theme.primary }}>
                            {item.priceText || 'Consultar'}
                          </div>
                          {item.ctaLink && (
                            <a
                              href={item.ctaLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors"
                              style={{ background: theme.primary, color: primaryTextOnPrimary }}
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
            <div className="mt-6 w-full p-6" style={proCardStyle}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: theme.muted }}>
                  Portfólio
                </div>
                <LucideIcons.Image size={16} className="opacity-50" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(profile.portfolioItems as PortfolioItem[])
                  .filter(i => i.isActive)
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .slice(0, 9)
                  .map((item) => (
                    <a key={item.id} href={item.imageUrl} target="_blank" rel="noopener noreferrer" className="block">
                      <img
                        src={item.imageUrl}
                        alt={item.title || 'Portfolio'}
                        className="w-full aspect-square object-cover rounded-xl border hover:opacity-90 transition-opacity"
                        style={{ borderColor: theme.border }}
                      />
                    </a>
                  ))}
              </div>
            </div>
          )}

          {/* Vídeos */}
          {hasVideosAccess && (profile.youtubeVideos || []).filter(i => i.isActive).length > 0 && (
            <div className="mt-6 w-full p-6" style={proCardStyle}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: theme.muted }}>
                  Vídeos
                </div>
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
                      <div key={vid.id} className="rounded-2xl border overflow-hidden" style={{ borderColor: theme.border, background: 'rgba(0,0,0,0.18)' }}>
                        <div className="aspect-video w-full">
                          <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${id}`}
                            title={vid.title || 'YouTube video'}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        {vid.title && <div className="p-3 text-[10px] font-bold" style={{ color: theme.muted }}>{vid.title}</div>}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* NPS */}
          {hasNpsAccess && profile.enableNps && (
            <NpsBlock onSubmit={pushNps} styleObj={proCardStyle} theme={theme} primaryTextOnPrimary={primaryTextOnPrimary} headingFont={headingFont} />
          )}

          {/* Leads */}
          {hasLeadAccess && profile.enableLeadCapture && (
            <LeadBlock onSubmit={pushLead} styleObj={proCardStyle} theme={theme} primaryTextOnPrimary={primaryTextOnPrimary} />
          )}

          <footer className="mt-7 flex flex-col items-center gap-1 opacity-30">
            <div className="w-3 h-3 bg-current rounded-sm flex items-center justify-center font-black text-[5px]">LF</div>
            <span className="text-[5px] font-black uppercase tracking-[0.3em]">LinkFlow</span>
          </footer>
        </main>
      </div>
    </div>
  );
};

const NpsBlock: React.FC<{
  styleObj: React.CSSProperties;
  theme: Profile['theme'];
  headingFont: string;
  primaryTextOnPrimary: string;
  onSubmit: (score: number, comment?: string) => void;
}> = ({ styleObj, theme, primaryTextOnPrimary, onSubmit }) => {
  const [score, setScore] = React.useState<number | null>(null);
  const [comment, setComment] = React.useState('');
  const [sent, setSent] = React.useState(false);

  if (sent) {
    return (
      <div className="mt-6 w-full p-6" style={styleObj}>
        <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: theme.muted }}>
          Avaliação
        </div>
        <div className="text-sm font-black mt-2">Obrigado pela sua nota! ✅</div>
      </div>
    );
  }

  return (
    <div className="mt-6 w-full p-6" style={styleObj}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: theme.muted }}>
          Avalie este perfil (NPS)
        </div>
        <LucideIcons.Star size={16} className="opacity-50" />
      </div>
      <div className="grid grid-cols-11 gap-1">
        {Array.from({ length: 11 }).map((_, i) => (
          <button
            key={i}
            onClick={() => setScore(i)}
            className={clsx('aspect-square rounded-lg text-[10px] font-black transition-all active:scale-95', score === i ? 'text-black' : 'border opacity-80 hover:opacity-100')}
            style={
              score === i
                ? { background: theme.primary, color: primaryTextOnPrimary }
                : { background: 'rgba(255,255,255,0.06)', borderColor: theme.border, color: theme.text }
            }
          >
            {i}
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Se quiser, deixe um comentário (opcional)"
        className="mt-3 w-full rounded-xl px-3 py-2 text-xs outline-none"
        style={{ background: 'rgba(0,0,0,0.18)', border: `1px solid ${theme.border}`, color: theme.text }}
        rows={2}
      />
      <button
        disabled={score === null}
        onClick={() => {
          if (score === null) return;
          onSubmit(score, comment.trim() || undefined);
          setSent(true);
        }}
        className="mt-3 w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 active:scale-95"
        style={{ background: theme.primary, color: primaryTextOnPrimary }}
      >
        Enviar
      </button>
    </div>
  );
};

const LeadBlock: React.FC<{
  styleObj: React.CSSProperties;
  theme: Profile['theme'];
  primaryTextOnPrimary: string;
  onSubmit: (data: { name: string; contact: string; message?: string }) => void;
}> = ({ styleObj, theme, primaryTextOnPrimary, onSubmit }) => {
  const [sent, setSent] = React.useState(false);
  const [name, setName] = React.useState('');
  const [contact, setContact] = React.useState('');
  const [message, setMessage] = React.useState('');

  if (sent) {
    return (
      <div className="mt-6 w-full p-6" style={styleObj}>
        <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: theme.muted }}>
          Contato
        </div>
        <div className="text-sm font-black mt-2">Recebido! Vou te chamar em breve. ✅</div>
      </div>
    );
  }

  return (
    <div className="mt-6 w-full p-6" style={styleObj}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: theme.muted }}>
          Fale comigo
        </div>
        <LucideIcons.MessageCircle size={16} className="opacity-50" />
      </div>

      <div className="space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome*"
          className="w-full rounded-xl px-3 py-2 text-xs outline-none"
          style={{ background: 'rgba(0,0,0,0.18)', border: `1px solid ${theme.border}`, color: theme.text }}
        />
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Seu contato (WhatsApp ou E-mail)*"
          className="w-full rounded-xl px-3 py-2 text-xs outline-none"
          style={{ background: 'rgba(0,0,0,0.18)', border: `1px solid ${theme.border}`, color: theme.text }}
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mensagem (opcional)"
          className="w-full rounded-xl px-3 py-2 text-xs outline-none"
          style={{ background: 'rgba(0,0,0,0.18)', border: `1px solid ${theme.border}`, color: theme.text }}
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
        className="mt-3 w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 active:scale-95"
        style={{ background: theme.primary, color: primaryTextOnPrimary }}
      >
        Enviar
      </button>
    </div>
  );
};

export default PublicProfileRenderer;
