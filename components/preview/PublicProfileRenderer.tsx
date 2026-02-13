"use client";

import React, { useMemo, useState } from 'react';
import { Profile, AnalyticsSource, PlanType } from '../../types';
import { formatLink } from '../../lib/linkHelpers';
import { trackEvent } from '../../lib/analytics';
import { canAccessFeature } from '../../lib/permissions';
import { extractYouTubeId } from '../../lib/youtube';
import { updateStorage } from '../../lib/storage';
import * as LucideIcons from 'lucide-react';
import clsx from 'clsx';

interface Props {
  profile: Profile;
  isPreview?: boolean;
  clientPlan?: PlanType;
  source?: AnalyticsSource;
}

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const safeString = (v: any, fallback: string) =>
  typeof v === 'string' && v.trim() ? v : fallback;

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

const getIcon = (type: string) => {
  switch (type) {
    case 'whatsapp': return LucideIcons.MessageCircle;
    case 'instagram': return LucideIcons.Instagram;
    case 'linkedin': return LucideIcons.Linkedin;
    case 'website': return LucideIcons.Globe;
    case 'phone':
    case 'mobile': return LucideIcons.Phone;
    case 'email': return LucideIcons.Mail;
    case 'maps': return LucideIcons.MapPin;
    case 'youtube': return LucideIcons.Youtube;
    case 'github': return LucideIcons.Github;
    case 'facebook': return LucideIcons.Facebook;
    case 'twitter':
    case 'x': return LucideIcons.Twitter;
    case 'tiktok': return LucideIcons.Music2;
    case 'telegram': return LucideIcons.Send;
    case 'threads': return LucideIcons.AtSign;
    case 'twitch': return LucideIcons.Tv;
    case 'discord': return LucideIcons.MessageSquare;
    default: return LucideIcons.Link;
  }
};

// Cores oficiais aproximadas para ícones "brand" (sem dependências extras).
// Mantém retrocompatibilidade: se o tema não tiver iconStyle, permanece monocromático.
const getBrandColor = (type: string): string | null => {
  switch (type) {
    case 'whatsapp': return '#25D366';
    case 'instagram': return '#E1306C';
    case 'youtube': return '#FF0000';
    case 'linkedin': return '#0A66C2';
    case 'facebook': return '#1877F2';
    case 'tiktok': return '#00F2EA';
    case 'telegram': return '#229ED9';
    case 'twitter':
    case 'x': return '#1D9BF0';
    case 'github': return '#FFFFFF';
    default: return null;
  }
};

const PublicProfileRenderer: React.FC<Props> = ({ profile, isPreview, clientPlan, source = 'direct' }) => {
  const theme = (profile as any)?.theme || {
    primary: '#3b82f6',
    text: '#ffffff',
    border: 'rgba(255,255,255,0.10)',
    cardBg: 'rgba(0,0,0,0.30)',
    shadow: '0 12px 40px rgba(0,0,0,0.35)',
    radius: '18px',
    buttonStyle: 'glass',
    backgroundType: 'color',
    backgroundValue: '#0A0A0A',
    backgroundDirection: 'to bottom',
    backgroundValueSecondary: '#0A0A0A',
  };

  const fonts = (profile as any)?.fonts || {
    headingFont: 'Poppins',
    bodyFont: 'Inter',
    buttonFont: 'Inter',
  };

  const buttons = Array.isArray((profile as any)?.buttons) ? (profile as any).buttons : [];

  const hasSchedulingAccess = canAccessFeature(clientPlan, 'scheduling');
  const hasPixAccess = canAccessFeature(clientPlan, 'pix');
  const hasCatalogAccess = canAccessFeature(clientPlan, 'catalog');
  const hasPortfolioAccess = canAccessFeature(clientPlan, 'portfolio');
  const hasVideosAccess = canAccessFeature(clientPlan, 'videos');
  const hasLeadCaptureAccess = canAccessFeature(clientPlan, 'leads_capture');
  const hasNpsAccess = canAccessFeature(clientPlan, 'nps');

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  
  // Lead Capture State
  const [leadName, setLeadName] = useState('');
  const [leadContact, setLeadContact] = useState('');
  const [leadMessage, setLeadMessage] = useState('');
  const [leadSent, setLeadSent] = useState(false);

  // NPS State
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [npsComment, setNpsComment] = useState('');
  const [npsSent, setNpsSent] = useState(false);

  const layout = (profile.layoutTemplate || 'Minimal Card').trim();

  const isGrid = ['Button Grid', 'Icon Grid', 'Two Columns', 'Creator', 'Magazine'].includes(layout);
  const isLeft = ['Avatar Left', 'Corporate', 'Split Header', 'Magazine'].includes(layout);
  const isBigAvatar = ['Big Avatar'].includes(layout);

  const headingFont = normalizeFontStack(fonts?.headingFont || 'Poppins');
  const bodyFont = normalizeFontStack(fonts?.bodyFont || 'Inter');
  const buttonFont = normalizeFontStack(fonts?.buttonFont || fonts?.bodyFont || 'Inter');

  const primaryTextOnPrimary = pickReadableOn(theme.primary);

  const coverConfig = useMemo(() => {
    let heightClass = 'h-36';
    let overlay = 'from-black/10 via-black/25 to-black/70';

    if (['Hero Banner', 'Cover Clean'].includes(layout)) {
      heightClass = 'h-52';
      overlay = 'from-black/5 via-black/20 to-black/75';
    }

    if (layout === 'Magazine') {
      heightClass = 'h-48';
      overlay = 'from-black/10 via-black/30 to-black/80';
    }

    if (!['Hero Banner', 'Cover Clean', 'Magazine'].includes(layout)) {
      heightClass = 'h-32';
      overlay = 'from-black/15 via-black/30 to-black/75';
    }

    return { heightClass, overlay };
  }, [layout]);

  const bgComputed = useMemo(() => {
    if (theme.backgroundType === 'gradient') {
      const dir = theme.backgroundDirection || 'to bottom';
      return `linear-gradient(${dir}, ${theme.backgroundValue}, ${theme.backgroundValueSecondary || theme.backgroundValue})`;
    }
    if (theme.backgroundType === 'image') {
      return `url(${theme.backgroundValue})`;
    }
    return theme.backgroundValue || '#0A0A0A';
  }, [theme.backgroundType, theme.backgroundDirection, theme.backgroundValue, theme.backgroundValueSecondary]);

  const bgStyle: React.CSSProperties = useMemo(() => {
    if (theme.backgroundType === 'image') {
      return {
        backgroundImage: bgComputed,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh'
      };
    }
    return {
      background: bgComputed,
      minHeight: '100vh'
    };
  }, [theme.backgroundType, bgComputed]);

  const shellCardStyle: React.CSSProperties = useMemo(() => {
    return {
      background: theme.cardBg,
      border: `1px solid ${theme.border}`,
      borderRadius: theme.radius,
      boxShadow: theme.shadow,
      overflow: 'hidden',
    };
  }, [theme.cardBg, theme.border, theme.radius, theme.shadow]);

  const handleLinkClick = (linkId?: string) => {
    if (isPreview) return;
    trackEvent(profile.clientId, profile.id, 'click', linkId, source);
  };

  const getButtonStyle = () => {
    const baseBorder = `1px solid ${theme.border}`;
    const backgroundColor =
      theme.buttonStyle === 'solid'
        ? theme.primary
        : theme.buttonStyle === 'outline'
          ? 'transparent'
          : 'rgba(255,255,255,0.08)';

    const color =
      theme.buttonStyle === 'solid'
        ? primaryTextOnPrimary
        : theme.text;

    let border = baseBorder;
    switch (theme.buttonStyle) {
      case 'solid':
        border = '1px solid rgba(255,255,255,0.12)';
        break;
      case 'glass':
        border = `1px solid ${theme.border}`;
        break;
      case 'outline':
        border = `1px solid ${theme.border}`;
        break;
    }

    return {
      borderRadius: theme.radius,
      fontFamily: buttonFont,
      transition: 'all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      border,
      padding: isGrid ? '1.5rem 1rem' : '0.95rem 1.15rem',
      width: '100%',
      backgroundColor,
      color,
      fontSize: '0.92rem',
      fontWeight: 800,
      display: 'flex',
      flexDirection: isGrid ? 'column' : 'row',
      alignItems: 'center',
      justifyContent: isGrid ? 'center' : 'space-between',
      gap: isGrid ? '0.75rem' : '0.5rem',
      textAlign: 'center',
    };
  };

  const renderLinks = () => {
    const activeButtons = buttons.filter((b: any) => b?.enabled);
    const iconStyle = (theme as any)?.iconStyle === 'brand' ? 'brand' : 'mono';
    return (
      <div className={clsx(isGrid ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3", "w-full")}>
        {activeButtons.map((btn: any, idx: number) => {
          const Icon = getIcon(btn.type);
          const brandColor = iconStyle === 'brand' ? getBrandColor(btn.type) : null;
          return (
            <a
              key={btn.id || `${btn.type}-${idx}`}
              href={isPreview ? '#' : formatLink(btn.type, btn.value)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleLinkClick(btn.id)}
              style={getButtonStyle()}
              className="group hover:translate-y-[-2px]"
            >
              {isGrid ? (
                <>
                  <Icon size={24} color={brandColor || undefined} />
                  <div className="font-black truncate w-full">{btn.label}</div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon size={20} color={brandColor || undefined} />
                    <span className="font-black truncate">{btn.label}</span>
                  </div>
                  <LucideIcons.ChevronRight size={16} className="opacity-40" />
                </>
              )}
            </a>
          );
        })}
      </div>
    );
  };

  const handleBooking = () => {
    if (profile.schedulingMode === 'external') {
      if (profile.externalBookingUrl) window.open(profile.externalBookingUrl, '_blank');
      return;
    }

    if (profile.schedulingMode === 'native' && selectedSlotId) {
      const slot = profile.nativeSlots?.find(s => s.id === selectedSlotId);
      if (slot && profile.bookingWhatsapp) {
        const text = encodeURIComponent(
          `Olá, gostaria de agendar um horário (${DAYS_OF_WEEK[slot.dayOfWeek]} das ${slot.startTime} às ${slot.endTime}) visto no seu perfil LinkFlow.`
        );
        window.open(`https://wa.me/${profile.bookingWhatsapp}?text=${text}`, '_blank');
      }
    }
  };

  const activeSlots = (profile.nativeSlots || []).filter(s => s.isActive);
  const avatarSrc = safeString(profile.avatarUrl, 'https://picsum.photos/seed/avatar/200/200');

  // Filtros de itens ativos
  const activeCatalog = (profile.catalogItems || []).filter(i => i.isActive).sort((a,b) => a.sortOrder - b.sortOrder);
  const activePortfolio = (profile.portfolioItems || []).filter(i => i.isActive).sort((a,b) => a.sortOrder - b.sortOrder);
  const activeVideos = (profile.youtubeVideos || []).filter(i => i.isActive).sort((a,b) => a.sortOrder - b.sortOrder);

  return (
    <div style={bgStyle} className="w-full flex flex-col items-center overflow-x-hidden no-scrollbar">
      <div className="relative z-10 w-full px-4 flex flex-col items-center pt-8 pb-20">
        <main className="w-full max-w-[520px] p-0 space-y-6" style={shellCardStyle}>
          <div className="relative">
            {profile.coverUrl && (
              <div className={clsx("w-full overflow-hidden relative", coverConfig.heightClass)}>
                <img src={profile.coverUrl} className="w-full h-full object-cover" alt="Cover" />
                <div className={clsx("absolute inset-0 bg-gradient-to-b", coverConfig.overlay)} />
              </div>
            )}

            <div className={clsx("px-6 pb-6 relative", profile.coverUrl ? "-mt-12" : "pt-8")}>
              <div className={clsx("flex gap-4", isLeft ? "flex-row items-end text-left" : "flex-col items-center text-center")}>
                <img
                  src={avatarSrc}
                  alt="Avatar"
                  className={clsx(
                    "object-cover border-4 border-black/50 shadow-xl",
                    isBigAvatar ? "w-28 h-28 rounded-full" : "w-20 h-20 rounded-full"
                  )}
                />

                <div className={clsx(isLeft ? "pb-2" : "")}>
                  <h1 className="text-2xl font-black leading-tight" style={{ fontFamily: headingFont, color: theme.text }}>
                    {safeString(profile.displayName, 'Seu Nome')}
                  </h1>
                  <p className="text-sm font-semibold opacity-80 mt-1" style={{ fontFamily: bodyFont, color: theme.text }}>
                    {safeString(profile.headline, 'Sua headline aqui')}
                  </p>
                </div>
              </div>

              {profile.bioShort && (
                <p className={clsx("mt-4 text-sm leading-relaxed", isLeft ? "text-left" : "text-center")} style={{ fontFamily: bodyFont, color: theme.muted }}>
                  {profile.bioShort}
                </p>
              )}
            </div>
          </div>

          <div className="px-6 pb-8 space-y-6">
            {/* Top Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowWalletModal(true)}
                className="rounded-xl px-4 py-3 font-black text-[11px] uppercase tracking-widest border transition-all hover:translate-y-[-1px]"
                style={{
                  border: `1px solid ${theme.border}`,
                  background: theme.buttonStyle === 'glass' ? 'rgba(255,255,255,0.06)' : 'transparent',
                  color: theme.text,
                  fontFamily: buttonFont,
                }}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <LucideIcons.Bookmark size={16} />
                  Salvar
                </span>
              </button>

              <button
                onClick={() => setShowWalletModal(true)}
                className="rounded-xl px-4 py-3 font-black text-[11px] uppercase tracking-widest border transition-all hover:translate-y-[-1px]"
                style={{
                  border: `1px solid ${theme.border}`,
                  background: theme.buttonStyle === 'glass' ? 'rgba(255,255,255,0.06)' : 'transparent',
                  color: theme.text,
                  fontFamily: buttonFont,
                }}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <LucideIcons.Wallet size={16} />
                  Wallet
                </span>
              </button>
            </div>

            {renderLinks()}

            {/* PIX */}
            {hasPixAccess && profile.pixKey && (
              <div className="rounded-2xl border p-5" style={{ borderColor: theme.border, background: 'rgba(0,0,0,0.25)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-70" style={{ color: theme.muted }}>
                      PIX
                    </div>
                    <div className="text-sm font-black mt-1" style={{ color: theme.text }}>
                      {profile.pixKey}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (isPreview) return;
                      navigator.clipboard?.writeText(profile.pixKey || '');
                    }}
                    className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border"
                    style={{ borderColor: theme.border, color: theme.text }}
                  >
                    Copiar
                  </button>
                </div>
              </div>
            )}

            {/* Catalog */}
            {hasCatalogAccess && activeCatalog.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-widest opacity-70" style={{ color: theme.muted }}>
                    Catálogo
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {activeCatalog.map((item) => (
                    <a
                      key={item.id}
                      href={isPreview ? '#' : item.ctaLink || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-2xl border p-4 transition-all hover:translate-y-[-1px]"
                      style={{ borderColor: theme.border, background: 'rgba(255,255,255,0.04)' }}
                    >
                      <div className="flex gap-3">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="w-14 h-14 rounded-xl object-cover border" style={{ borderColor: theme.border }} />
                        ) : (
                          <div className="w-14 h-14 rounded-xl border flex items-center justify-center" style={{ borderColor: theme.border, color: theme.muted }}>
                            <LucideIcons.Package size={18} />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-black truncate" style={{ color: theme.text }}>
                              {item.title}
                            </div>
                            {item.priceText && (
                              <div className="text-[11px] font-black whitespace-nowrap" style={{ color: theme.text }}>
                                {item.priceText}
                              </div>
                            )}
                          </div>
                          {item.description && (
                            <div className="text-xs mt-1 line-clamp-2" style={{ color: theme.muted }}>
                              {item.description}
                            </div>
                          )}
                          {item.ctaLabel && (
                            <div className="text-[10px] font-black uppercase tracking-widest mt-2 inline-flex items-center gap-2" style={{ color: theme.primary }}>
                              {item.ctaLabel}
                              <LucideIcons.ArrowUpRight size={14} />
                            </div>
                          )}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Portfolio */}
            {hasPortfolioAccess && activePortfolio.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-widest opacity-70" style={{ color: theme.muted }}>
                  Portfólio
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {activePortfolio.map((item) => (
                    <a
                      key={item.id}
                      href={isPreview ? '#' : item.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-2xl border overflow-hidden transition-all hover:translate-y-[-1px]"
                      style={{ borderColor: theme.border, background: 'rgba(255,255,255,0.04)' }}
                    >
                      <img src={item.imageUrl} alt={item.title || 'Portfolio'} className="w-full h-28 object-cover" />
                      {item.title && (
                        <div className="p-3 text-xs font-black truncate" style={{ color: theme.text }}>
                          {item.title}
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Videos */}
            {hasVideosAccess && activeVideos.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-widest opacity-70" style={{ color: theme.muted }}>
                  Vídeos
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {activeVideos.map((v) => {
                    const id = extractYouTubeId(v.url);
                    if (id) {
                      return (
                        <div key={v.id} className="rounded-2xl overflow-hidden shadow-lg border bg-black" style={{ borderColor: theme.border }}>
                           <iframe 
                             width="100%" 
                             height="200" 
                             src={`https://www.youtube.com/embed/${id}`} 
                             title={v.title || "Video"}
                             frameBorder="0"
                             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                             allowFullScreen
                             className="w-full"
                           />
                           {v.title && (
                             <div className="p-3 text-xs font-bold truncate" style={{ color: theme.text, background: theme.cardBg }}>
                               {v.title}
                             </div>
                           )}
                        </div>
                      );
                    }
                    
                    // Fallback se não for YouTube reconhecido
                    return (
                      <a
                        key={v.id}
                        href={isPreview ? '#' : v.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-2xl border overflow-hidden transition-all hover:translate-y-[-1px]"
                        style={{ borderColor: theme.border, background: 'rgba(255,255,255,0.04)' }}
                      >
                        <div className="w-full h-36 flex items-center justify-center" style={{ color: theme.muted }}>
                          <LucideIcons.Video size={22} />
                        </div>
                        <div className="p-4 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-black truncate" style={{ color: theme.text }}>
                              {v.title || 'Vídeo'}
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-widest mt-1" style={{ color: theme.muted }}>
                              Link Externo
                            </div>
                          </div>
                          <LucideIcons.ExternalLink size={16} style={{ color: theme.primary }} />
                        </div>
                      </a>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Scheduling */}
            {hasSchedulingAccess && profile.enableScheduling && (
              <section className="rounded-2xl border p-5 space-y-4" style={{ borderColor: theme.border, background: 'rgba(255,255,255,0.03)' }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-widest opacity-70" style={{ color: theme.muted }}>
                    Agendamento
                  </h3>
                  <LucideIcons.CalendarClock size={18} style={{ color: theme.primary }} />
                </div>

                {profile.schedulingMode === 'external' ? (
                  <button
                    onClick={handleBooking}
                    className="w-full rounded-xl px-4 py-3 font-black text-[11px] uppercase tracking-widest border transition-all hover:translate-y-[-1px]"
                    style={{
                      borderColor: theme.border,
                      background: theme.primary,
                      color: primaryTextOnPrimary,
                      fontFamily: buttonFont,
                    }}
                  >
                    Abrir Agenda
                  </button>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      {activeSlots.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedSlotId(s.id)}
                          className="rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest border transition-all"
                          style={{
                            borderColor: theme.border,
                            background: selectedSlotId === s.id ? theme.primary : 'transparent',
                            color: selectedSlotId === s.id ? primaryTextOnPrimary : theme.text,
                            fontFamily: buttonFont,
                          }}
                        >
                          {DAYS_OF_WEEK[s.dayOfWeek]} • {s.startTime}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleBooking}
                      disabled={!selectedSlotId}
                      className="w-full rounded-xl px-4 py-3 font-black text-[11px] uppercase tracking-widest border transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:translate-y-[-1px]"
                      style={{
                        borderColor: theme.border,
                        background: theme.primary,
                        color: primaryTextOnPrimary,
                        fontFamily: buttonFont,
                      }}
                    >
                      Confirmar no WhatsApp
                    </button>
                  </>
                )}
              </section>
            )}

            {/* Lead Capture */}
            {hasLeadCaptureAccess && profile.enableLeadCapture && (
              <section className="rounded-2xl border p-5 space-y-4" style={{ borderColor: theme.border, background: 'rgba(255,255,255,0.03)' }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-widest opacity-70" style={{ color: theme.muted }}>
                    Fale comigo
                  </h3>
                  <LucideIcons.MessageSquareText size={18} style={{ color: theme.primary }} />
                </div>

                {leadSent ? (
                  <div className="rounded-xl border p-4 text-sm font-bold" style={{ borderColor: theme.border, color: theme.text }}>
                    ✅ Mensagem enviada!
                  </div>
                ) : (
                  <>
                    <input
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full rounded-xl px-4 py-3 bg-black/30 border outline-none text-sm font-semibold"
                      style={{ borderColor: theme.border, color: theme.text, fontFamily: bodyFont }}
                    />
                    <input
                      value={leadContact}
                      onChange={(e) => setLeadContact(e.target.value)}
                      placeholder="WhatsApp ou e-mail"
                      className="w-full rounded-xl px-4 py-3 bg-black/30 border outline-none text-sm font-semibold"
                      style={{ borderColor: theme.border, color: theme.text, fontFamily: bodyFont }}
                    />
                    <textarea
                      value={leadMessage}
                      onChange={(e) => setLeadMessage(e.target.value)}
                      placeholder="Mensagem (opcional)"
                      className="w-full rounded-xl px-4 py-3 bg-black/30 border outline-none text-sm font-semibold min-h-[96px]"
                      style={{ borderColor: theme.border, color: theme.text, fontFamily: bodyFont }}
                    />
                    <button
                      onClick={() => {
                        if (isPreview) return;
                        const lead = {
                          id: `lead_${Date.now()}`,
                          clientId: profile.clientId,
                          profileId: profile.id,
                          name: leadName.trim() || 'Sem nome',
                          contact: leadContact.trim() || 'Sem contato',
                          message: leadMessage.trim() || '',
                          status: 'novo',
                          createdAt: new Date().toISOString(),
                          source,
                        };
                        updateStorage((data) => {
                          data.leads = Array.isArray(data.leads) ? data.leads : [];
                          data.leads.unshift(lead as any);
                          return data;
                        });
                        setLeadSent(true);
                      }}
                      className="w-full rounded-xl px-4 py-3 font-black text-[11px] uppercase tracking-widest border transition-all hover:translate-y-[-1px]"
                      style={{
                        borderColor: theme.border,
                        background: theme.primary,
                        color: primaryTextOnPrimary,
                        fontFamily: buttonFont,
                      }}
                    >
                      Enviar
                    </button>
                  </>
                )}
              </section>
            )}

            {/* NPS */}
            {hasNpsAccess && profile.enableNps && (
              <section className="rounded-2xl border p-5 space-y-4" style={{ borderColor: theme.border, background: 'rgba(255,255,255,0.03)' }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-widest opacity-70" style={{ color: theme.muted }}>
                    Avaliação
                  </h3>
                  <LucideIcons.Star size={18} style={{ color: theme.primary }} />
                </div>

                {npsSent ? (
                  <div className="rounded-xl border p-4 text-sm font-bold" style={{ borderColor: theme.border, color: theme.text }}>
                    ⭐ Obrigado pela sua avaliação!
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-11 gap-1">
                      {Array.from({ length: 11 }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setNpsScore(i)}
                          className="rounded-lg py-2 text-[10px] font-black border transition-all"
                          style={{
                            borderColor: theme.border,
                            background: npsScore === i ? theme.primary : 'transparent',
                            color: npsScore === i ? primaryTextOnPrimary : theme.text,
                            fontFamily: buttonFont,
                          }}
                        >
                          {i}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={npsComment}
                      onChange={(e) => setNpsComment(e.target.value)}
                      placeholder="Comentário (opcional)"
                      className="w-full rounded-xl px-4 py-3 bg-black/30 border outline-none text-sm font-semibold min-h-[96px]"
                      style={{ borderColor: theme.border, color: theme.text, fontFamily: bodyFont }}
                    />
                    <button
                      onClick={() => {
                        if (isPreview) return;
                        if (npsScore === null) return;
                        const entry = {
                          id: `nps_${Date.now()}`,
                          clientId: profile.clientId,
                          profileId: profile.id,
                          score: npsScore,
                          comment: npsComment.trim() || '',
                          createdAt: new Date().toISOString(),
                          source,
                        };
                        updateStorage((data) => {
                          data.events = Array.isArray(data.events) ? data.events : [];
                          (data as any).nps = Array.isArray((data as any).nps) ? (data as any).nps : [];
                          (data as any).nps.unshift(entry);
                          return data;
                        });
                        setNpsSent(true);
                      }}
                      className="w-full rounded-xl px-4 py-3 font-black text-[11px] uppercase tracking-widest border transition-all hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={npsScore === null}
                      style={{
                        borderColor: theme.border,
                        background: theme.primary,
                        color: primaryTextOnPrimary,
                        fontFamily: buttonFont,
                      }}
                    >
                      Enviar Avaliação
                    </button>
                  </>
                )}
              </section>
            )}
          </div>
        </main>

        {/* Wallet Modal (placeholder visual) */}
        {showWalletModal && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-[520px] rounded-[2.2rem] border bg-zinc-950/90 p-6 space-y-4"
              style={{ borderColor: theme.border }}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-black" style={{ color: theme.text }}>Wallet / Salvar</div>
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="w-10 h-10 rounded-2xl border flex items-center justify-center"
                  style={{ borderColor: theme.border, color: theme.text }}
                >
                  <LucideIcons.X size={18} />
                </button>
              </div>
              <div className="text-xs font-semibold opacity-80" style={{ color: theme.muted }}>
                Aqui você pode evoluir depois com: QR Code, Apple Wallet, Google Wallet e vCard.
              </div>
              <button
                onClick={() => setShowWalletModal(false)}
                className="w-full rounded-xl px-4 py-3 font-black text-[11px] uppercase tracking-widest border transition-all hover:translate-y-[-1px]"
                style={{
                  borderColor: theme.border,
                  background: theme.primary,
                  color: primaryTextOnPrimary,
                  fontFamily: buttonFont,
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfileRenderer;