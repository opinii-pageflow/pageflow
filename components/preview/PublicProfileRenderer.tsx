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
    case 'facebook': return LucideIcons.Facebook;
    case 'tiktok': return LucideIcons.Music2;
    case 'youtube': return LucideIcons.Youtube;
    case 'linkedin': return LucideIcons.Linkedin;
    case 'email': return LucideIcons.Mail;
    case 'phone': return LucideIcons.Phone;
    case 'website': return LucideIcons.Globe;
    case 'pix': return LucideIcons.QrCode;
    case 'maps': return LucideIcons.MapPin;
    case 'catalog': return LucideIcons.ShoppingBag;
    case 'portfolio': return LucideIcons.Image;
    case 'lead': return LucideIcons.Send;
    case 'nps': return LucideIcons.Star;
    case 'schedule': return LucideIcons.Calendar;
    default: return LucideIcons.Link;
  }
};

const PublicProfileRenderer: React.FC<Props> = ({
  profile,
  isPreview = false,
  clientPlan = 'starter',
  source = 'direct'
}) => {
  const theme = profile.theme;
  const fonts = profile.fonts;
  const buttons = profile.buttons || [];

  const hasCatalogAccess = canAccessFeature(clientPlan, 'catalog');
  const hasPortfolioAccess = canAccessFeature(clientPlan, 'portfolio');
  const hasYoutubeAccess = canAccessFeature(clientPlan, 'youtube');
  const hasLeadCaptureAccess = canAccessFeature(clientPlan, 'leadCapture');
  const hasNpsAccess = canAccessFeature(clientPlan, 'nps');
  const hasSchedulingAccess = canAccessFeature(clientPlan, 'scheduling');

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

  type ButtonLayout =
    | 'list'
    | 'listBold'
    | 'grid'
    | 'iconGrid'
    | 'twoColumns'
    | 'chips'
    | 'stacked'
    | 'pills';

  type HeaderLayout = 'center' | 'left' | 'split' | 'sidebar';

  type CoverMode = 'none' | 'top' | 'full';

  const templateConfig = useMemo(() => {
    const base = {
      headerLayout: 'center' as HeaderLayout,
      buttonLayout: 'list' as ButtonLayout,
      avatarSize: 'md' as 'md' | 'lg',
      avatarShape: 'round' as 'round' | 'squircle',
      coverMode: 'top' as CoverMode,
      headerPaddingClass: 'px-6 pb-6 relative' as string,
      contentPaddingClass: 'px-6 pb-6 space-y-6' as string,
      buttonRadiusClass: '' as string,
      buttonExtraClass: '' as string,
      showVerifiedBadge: false,
      enableNeonGlow: false,
    };

    switch (layout) {
      case 'Button Grid':
        return { ...base, buttonLayout: 'grid' as ButtonLayout };
      case 'Icon Grid':
        return { ...base, buttonLayout: 'iconGrid' as ButtonLayout };
      case 'Two Columns':
        return { ...base, buttonLayout: 'twoColumns' as ButtonLayout };
      case 'Creator':
        return { ...base, buttonLayout: 'iconGrid' as ButtonLayout, buttonExtraClass: 'tracking-wide' };
      case 'Chips':
        return { ...base, buttonLayout: 'chips' as ButtonLayout, buttonRadiusClass: 'rounded-full' };
      case 'Rounded Pills':
        return { ...base, buttonLayout: 'pills' as ButtonLayout, buttonRadiusClass: 'rounded-full' };
      case 'Stacked Cards':
        return { ...base, buttonLayout: 'stacked' as ButtonLayout };
      case 'Button List Bold':
        return { ...base, buttonLayout: 'listBold' as ButtonLayout };
      case 'Neon':
        return { ...base, enableNeonGlow: true, buttonExtraClass: 'shadow-[0_0_0_1px_rgba(255,255,255,0.06)]' };
      case 'Glassmorphism':
        return { ...base, buttonExtraClass: 'backdrop-blur-xl' };
      case 'Verified Pro':
        return { ...base, showVerifiedBadge: true };
      case 'Corporate':
        return { ...base, headerLayout: 'left' as HeaderLayout, avatarShape: 'squircle' as const, buttonExtraClass: 'uppercase tracking-wider text-[11px]' };
      case 'Avatar Left':
        return { ...base, headerLayout: 'left' as HeaderLayout };
      case 'Split Header':
        return { ...base, headerLayout: 'split' as HeaderLayout };
      case 'Sidebar':
        return { ...base, headerLayout: 'sidebar' as HeaderLayout, buttonLayout: 'list' as ButtonLayout };
      case 'Big Avatar':
        return { ...base, avatarSize: 'lg' as const };
      case 'Magazine':
        return { ...base, headerLayout: 'left' as HeaderLayout, buttonLayout: 'twoColumns' as ButtonLayout };
      case 'Hero Banner':
        return { ...base, coverMode: 'full' as CoverMode, buttonLayout: 'listBold' as ButtonLayout };
      case 'Cover Clean':
        return { ...base, coverMode: 'top' as CoverMode, buttonLayout: 'list' as ButtonLayout };
      case 'Full Cover':
        return { ...base, coverMode: 'full' as CoverMode, buttonLayout: 'grid' as ButtonLayout, avatarSize: 'lg' as const };
      case 'Full Cover Overlay':
        return { ...base, coverMode: 'full' as CoverMode, buttonLayout: 'list' as ButtonLayout, enableNeonGlow: true };
      default:
        return base;
    }
  }, [layout]);

  const isGrid = ['grid', 'iconGrid', 'twoColumns'].includes(templateConfig.buttonLayout);
  const isLeft = ['left', 'split', 'sidebar'].includes(templateConfig.headerLayout);
  const isBigAvatar = templateConfig.avatarSize === 'lg';

  const headingFont = normalizeFontStack(fonts?.headingFont || 'Poppins');
  const bodyFont = normalizeFontStack(fonts?.bodyFont || 'Inter');
  const buttonFont = normalizeFontStack(fonts?.buttonFont || fonts?.bodyFont || 'Inter');

  const primaryTextOnPrimary = pickReadableOn(theme.primary);

  const VerifiedBadgeIcon = (LucideIcons as any).BadgeCheck || (LucideIcons as any).Badge || (LucideIcons as any).CheckCircle;

  const coverConfig = useMemo(() => {
    let heightClass = 'h-36';
    let overlay = 'from-black/10 via-black/25 to-black/70';

    // Templates com capa mais presente
    if (['Hero Banner', 'Cover Clean'].includes(layout)) {
      heightClass = 'h-52';
      overlay = 'from-black/5 via-black/20 to-black/75';
    }

    if (layout === 'Magazine') {
      heightClass = 'h-48';
      overlay = 'from-black/10 via-black/30 to-black/80';
    }

    // Full-bleed: ocupa todo o topo do card (mais alto e com overlay mais suave)
    if (['Full Cover', 'Full Cover Overlay'].includes(layout)) {
      heightClass = 'h-72';
      overlay = 'from-black/0 via-black/15 to-black/75';
    }

    // Padrão (demais templates)
    if (!['Hero Banner', 'Cover Clean', 'Magazine', 'Full Cover', 'Full Cover Overlay'].includes(layout)) {
      heightClass = 'h-32';
      overlay = 'from-black/15 via-black/30 to-black/75';
    }

    return { heightClass, overlay };
  }, [layout]);

  const bgComputed = useMemo(() => {
    const bgValue = safeString(theme.backgroundValue, '#0A0A0A');

    if (theme.backgroundType === 'gradient') {
      const dir = safeString(theme.backgroundDirection, 'to bottom');
      const b = safeString(theme.backgroundValueSecondary, bgValue);
      return {
        backgroundImage: `linear-gradient(${dir}, ${bgValue}, ${b})`,
        backgroundColor: 'transparent',
        backgroundAttachment: 'scroll',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      } as React.CSSProperties;
    }

    if (theme.backgroundType === 'image') {
      const attachment = isPreview ? 'scroll' : 'fixed';
      return {
        backgroundImage: `url(${bgValue})`,
        backgroundColor: '#0A0A0A',
        backgroundAttachment: attachment,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      } as React.CSSProperties;
    }

    return { backgroundColor: bgValue } as React.CSSProperties;
  }, [theme.backgroundType, theme.backgroundValue, theme.backgroundDirection, theme.backgroundValueSecondary, isPreview]);

  const bgStyle: React.CSSProperties = {
    ...bgComputed,
    minHeight: isPreview ? '100%' : '100vh',
    height: isPreview ? '100%' : 'auto',
    color: theme.text,
    fontFamily: bodyFont,
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const proCardStyle: React.CSSProperties = {
    borderRadius: `calc(${theme.radius} + 6px)`,
    border: `1px solid ${theme.border}`,
    background: theme.cardBg,
    boxShadow: theme.shadow,
    backdropFilter: 'blur(24px)',
  };

  const shellCardStyle: React.CSSProperties = {
    borderRadius: `calc(${theme.radius} + 14px)`,
    border: `1px solid ${theme.border}`,
    background: theme.cardBg,
    boxShadow: theme.shadow,
    backdropFilter: 'blur(26px)',
    position: 'relative',
    overflow: 'hidden',
  };

  const handleLinkClick = (btnId: string) => {
    if (isPreview) return;
    trackEvent({ profileId: profile.id, clientId: profile.clientId, type: 'click', linkId: btnId, source });
  };

  const handleSaveContact = () => {
    if (isPreview) return;

    try {
      const vcard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${profile.displayName}`,
        profile.headline ? `TITLE:${profile.headline}` : '',
        profile.bioShort ? `NOTE:${profile.bioShort}` : '',
        'END:VCARD',
      ].filter(Boolean).join('\n');

      const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(profile.displayName || 'contato').replace(/\s+/g, '_')}.vcf`;
      a.click();
      URL.revokeObjectURL(url);

      trackEvent({ profileId: profile.id, clientId: profile.clientId, type: 'click', linkId: 'save_contact', source });
    } catch (e) {
      alert('Não foi possível salvar o contato. Tente novamente.');
    }
  };

  const handleLeadSubmit = () => {
    if (!hasLeadCaptureAccess) return;

    if (!leadName.trim() || !leadContact.trim()) {
      alert('Preencha nome e contato.');
      return;
    }

    setLeadSent(true);

    if (!isPreview) {
      trackEvent({ profileId: profile.id, clientId: profile.clientId, type: 'click', linkId: 'lead_submit', source });
    }
  };

  const handleNpsSubmit = () => {
    if (!hasNpsAccess) return;

    if (npsScore === null) {
      alert('Selecione uma nota.');
      return;
    }

    setNpsSent(true);

    if (!isPreview) {
      trackEvent({ profileId: profile.id, clientId: profile.clientId, type: 'click', linkId: `nps_${npsScore}`, source });
    }
  };

  const getButtonStyle = (): React.CSSProperties => {
    let backgroundColor: string;
    let color: string;
    let border: string;

    switch (theme.buttonStyle) {
      case 'solid':
        backgroundColor = theme.primary;
        color = primaryTextOnPrimary;
        border = `1px solid ${theme.primary}`;
        break;
      case 'outline':
        backgroundColor = 'transparent';
        color = theme.text;
        border = `1.5px solid ${theme.primary}`;
        break;
      case 'glass':
      default:
        backgroundColor = theme.cardBg;
        color = theme.text;
        border = `1px solid ${theme.border}`;
        break;
    }

    const variant = templateConfig.buttonLayout;

    const radius =
      variant === 'chips' || variant === 'pills' ? '999px' : theme.radius;

    const padding =
      variant === 'chips'
        ? '0.6rem 0.95rem'
        : variant === 'grid'
        ? '1.05rem 1rem'
        : variant === 'iconGrid'
        ? '1.2rem 1rem'
        : variant === 'listBold'
        ? '1.05rem 1.2rem'
        : '0.95rem 1.15rem';

    const fontSize =
      variant === 'chips' ? '0.82rem' : variant === 'listBold' ? '0.98rem' : '0.92rem';

    const flexDirection =
      variant === 'iconGrid' ? 'column' : 'row';

    const justifyContent =
      variant === 'grid'
        ? 'flex-start'
        : variant === 'chips'
        ? 'center'
        : variant === 'iconGrid'
        ? 'center'
        : 'space-between';

    const textAlign =
      variant === 'iconGrid' ? 'center' : 'left';

    return {
      borderRadius: radius,
      fontFamily: buttonFont,
      transition: 'all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      border,
      padding,
      width: variant === 'chips' ? 'auto' : '100%',
      backgroundColor,
      color,
      fontSize,
      fontWeight: 900,
      display: 'flex',
      flexDirection,
      alignItems: 'center',
      justifyContent,
      gap: variant === 'iconGrid' ? '0.65rem' : '0.5rem',
      textAlign,
      boxShadow:
        templateConfig.enableNeonGlow
          ? `0 0 18px rgba(0,0,0,0.20), 0 0 28px ${theme.primary}26`
          : undefined,
    };
  };

  const renderLinks = () => {
    const activeButtons = buttons.filter((b: any) => b?.enabled);

    const variant = templateConfig.buttonLayout;

    const containerClass = clsx(
      'w-full',
      variant === 'chips'
        ? 'flex flex-wrap gap-2 justify-center'
        : variant === 'grid'
        ? 'grid grid-cols-2 gap-3'
        : variant === 'iconGrid'
        ? 'grid grid-cols-2 gap-3'
        : variant === 'twoColumns'
        ? 'grid grid-cols-2 gap-3'
        : 'flex flex-col gap-3'
    );

    return (
      <div className={containerClass}>
        {activeButtons.map((btn: any, idx: number) => {
          const Icon = getIcon(btn.type);

          const stackedStyle: React.CSSProperties | undefined =
            variant === 'stacked'
              ? {
                  transform: `translateY(${Math.min(idx, 4) * 2}px)`,
                  boxShadow:
                    idx === 0
                      ? theme.shadow
                      : `0 ${8 + Math.min(idx, 4) * 3}px ${18 + Math.min(idx, 4) * 6}px rgba(0,0,0,0.22)`,
                }
              : undefined;

          const className = clsx(
            'group active:scale-[0.99] hover:translate-y-[-2px] transition-all',
            variant === 'chips'
              ? 'border hover:bg-white/5'
              : 'border',
            templateConfig.buttonExtraClass
          );

          const style: React.CSSProperties = {
            ...getButtonStyle(),
            ...(stackedStyle || {}),
            borderColor: theme.border,
          };

          return (
            <a
              key={btn.id || `${btn.type}-${idx}`}
              href={isPreview ? '#' : formatLink(btn.type, btn.value)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleLinkClick(btn.id)}
              style={style}
              className={className}
            >
              {variant === 'chips' ? (
                <>
                  <Icon size={18} />
                  <span className="font-black whitespace-nowrap">{btn.label}</span>
                </>
              ) : variant === 'iconGrid' ? (
                <>
                  <Icon size={26} />
                  <div className="font-black truncate w-full text-center">{btn.label}</div>
                </>
              ) : variant === 'grid' ? (
                <>
                  <div className="flex items-center gap-3 min-w-0 w-full">
                    <Icon size={20} />
                    <span className="font-black truncate">{btn.label}</span>
                  </div>
                </>
              ) : variant === 'twoColumns' ? (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon size={20} />
                    <span className="font-black truncate">{btn.label}</span>
                  </div>
                  <LucideIcons.ChevronRight size={16} className="opacity-40" />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon size={20} />
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
  const activeCatalog = (profile.catalogItems || []).filter(i => i.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  const activePortfolio = (profile.portfolioItems || []).filter(i => i.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  const activeVideos = (profile.youtubeVideos || []).filter(i => i.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div style={bgStyle} className="w-full flex flex-col items-center overflow-x-hidden no-scrollbar">
      <div className="relative z-10 w-full px-4 flex flex-col items-center pt-8 pb-20">
        <main className="w-full max-w-[520px] p-0 space-y-6" style={shellCardStyle}>
          <div className="relative">
            {/* ===== Cover ===== */}
            {profile.coverUrl && templateConfig.coverMode === 'top' && (
              <div className={clsx("w-full overflow-hidden relative", coverConfig.heightClass)}>
                <img src={profile.coverUrl} className="w-full h-full object-cover" alt="Cover" />
                <div className={clsx("absolute inset-0 bg-gradient-to-b", coverConfig.overlay)} />
              </div>
            )}

            {profile.coverUrl && templateConfig.coverMode === 'full' && (
              <div className={clsx("w-full overflow-hidden relative", coverConfig.heightClass)}>
                <img
                  src={profile.coverUrl}
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="Cover"
                />
                <div className={clsx("absolute inset-0 bg-gradient-to-b", coverConfig.overlay)} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.10),transparent_55%),radial-gradient(circle_at_80%_60%,rgba(255,255,255,0.08),transparent_55%)]" />
                <div className="relative h-full flex flex-col justify-end px-6 pb-6 pt-10">
                  <div
                    className={clsx(
                      "flex gap-4",
                      templateConfig.headerLayout === 'center'
                        ? "flex-col items-center text-center"
                        : templateConfig.headerLayout === 'split'
                        ? "flex-row items-end justify-between text-left"
                        : "flex-row items-end text-left"
                    )}
                  >
                    <img
                      src={avatarSrc}
                      className={clsx(
                        "border-4 object-cover shadow-2xl bg-zinc-900",
                        templateConfig.avatarShape === 'squircle' ? "rounded-2xl" : "rounded-full",
                        isBigAvatar ? "w-40 h-40" : "w-24 h-24"
                      )}
                      style={{ borderColor: theme.cardBg }}
                      alt={profile.displayName || 'Perfil'}
                    />

                    <div className="flex-1 min-w-0 pb-1">
                      <div className={clsx("flex items-center gap-2", templateConfig.headerLayout === 'center' ? "justify-center" : "justify-start")}>
                        <h1 className="text-2xl font-black tracking-tight leading-tight" style={{ fontFamily: headingFont }}>
                          {profile.displayName}
                        </h1>
                        {templateConfig.showVerifiedBadge && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black tracking-wider border"
                            style={{ borderColor: theme.border, background: theme.cardBg, color: theme.text }}
                            title="Perfil verificado"
                          >
                            <VerifiedBadgeIcon size={14} />
                            PRO
                          </span>
                        )}
                      </div>
                      <p className="text-sm opacity-85 mt-1 font-medium">{profile.headline}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== Header (sem full cover) ===== */}
            {templateConfig.coverMode !== 'full' && (
              <div className={clsx("px-6 pb-6 relative", profile.coverUrl ? "-mt-12" : "pt-8")}>
                <div
                  className={clsx(
                    "flex gap-4",
                    templateConfig.headerLayout === 'center'
                      ? "flex-col items-center text-center"
                      : templateConfig.headerLayout === 'split'
                      ? "flex-row items-end justify-between text-left"
                      : templateConfig.headerLayout === 'sidebar'
                      ? "flex-row items-start text-left"
                      : "flex-row items-end text-left"
                  )}
                >
                  <img
                    src={avatarSrc}
                    className={clsx(
                      "border-4 object-cover shadow-2xl bg-zinc-900",
                      templateConfig.avatarShape === 'squircle' ? "rounded-2xl" : "rounded-full",
                      isBigAvatar ? "w-40 h-40" : "w-24 h-24"
                    )}
                    style={{ borderColor: theme.cardBg }}
                    alt={profile.displayName || 'Perfil'}
                  />

                  <div className="flex-1 min-w-0 pb-1">
                    <div className={clsx("flex items-center gap-2", templateConfig.headerLayout === 'center' ? "justify-center" : "justify-start")}>
                      <h1 className="text-2xl font-black tracking-tight leading-tight" style={{ fontFamily: headingFont }}>
                        {profile.displayName}
                      </h1>

                      {templateConfig.showVerifiedBadge && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black tracking-wider border"
                          style={{ borderColor: theme.border, background: theme.cardBg, color: theme.text }}
                          title="Perfil verificado"
                        >
                          <VerifiedBadgeIcon size={14} />
                          PRO
                        </span>
                      )}
                    </div>
                    <p className="text-sm opacity-80 mt-1 font-medium">{profile.headline}</p>
                  </div>

                  {templateConfig.headerLayout === 'split' && (
                    <div className="flex items-center gap-2 pb-2">
                      <span
                        className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border"
                        style={{ borderColor: theme.border, background: theme.cardBg, color: theme.text }}
                      >
                        {profile.profileType === 'business' ? 'Business' : 'Personal'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={templateConfig.contentPaddingClass}>
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={handleSaveContact}
                className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 border hover:bg-white/5"
                style={{ borderColor: theme.border, color: theme.text }}
              >
                <LucideIcons.UserPlus size={14} />
                Salvar
              </button>

              <button
                onClick={() => setShowWalletModal(true)}
                className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 border hover:bg-white/5"
                style={{ borderColor: theme.border, color: theme.text }}
              >
                <LucideIcons.WalletCards size={14} />
                Wallet
              </button>
            </div>

            {profile.bioShort && (
              <p className={clsx("text-sm leading-relaxed opacity-70", isLeft ? "text-left" : "text-center")}>
                {profile.bioShort}
              </p>
            )}

            {renderLinks()}

            {/* Catálogo */}
            {hasCatalogAccess && activeCatalog.length > 0 && (
              <div className="w-full space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black tracking-wide">Catálogo</h2>
                  <LucideIcons.ShoppingBag size={16} className="opacity-70" />
                </div>
                <div className="space-y-3">
                  {activeCatalog.map(item => (
                    <div key={item.id} className="p-4 border rounded-2xl" style={proCardStyle}>
                      <div className="flex items-start gap-3">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} className="w-16 h-16 rounded-xl object-cover" alt={item.title} />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 grid place-items-center">
                            <LucideIcons.Package size={18} className="opacity-70" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="font-black truncate">{item.title}</div>
                              {item.description && (
                                <div className="text-xs opacity-70 mt-1 line-clamp-2">{item.description}</div>
                              )}
                            </div>
                            {item.priceText && (
                              <div className="text-xs font-black opacity-85 whitespace-nowrap">{item.priceText}</div>
                            )}
                          </div>

                          {item.ctaLink && (
                            <a
                              href={isPreview ? '#' : item.ctaLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-xs font-black mt-3 px-3 py-2 rounded-xl border hover:bg-white/5 transition-all"
                              style={{ borderColor: theme.border, color: theme.text }}
                            >
                              {item.ctaLabel || 'Ver'}
                              <LucideIcons.ExternalLink size={14} className="opacity-75" />
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
            {hasPortfolioAccess && activePortfolio.length > 0 && (
              <div className="w-full space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black tracking-wide">Portfólio</h2>
                  <LucideIcons.Image size={16} className="opacity-70" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {activePortfolio.map(item => (
                    <div key={item.id} className="relative overflow-hidden rounded-2xl border" style={{ borderColor: theme.border }}>
                      <img src={item.imageUrl} className="w-full h-36 object-cover" alt={item.title || 'Portfolio'} />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/50" />
                      {item.title && (
                        <div className="absolute bottom-2 left-2 right-2 text-xs font-black truncate">
                          {item.title}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* YouTube */}
            {hasYoutubeAccess && activeVideos.length > 0 && (
              <div className="w-full space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black tracking-wide">YouTube</h2>
                  <LucideIcons.Youtube size={16} className="opacity-70" />
                </div>

                <div className="space-y-3">
                  {activeVideos.map(v => {
                    const id = extractYouTubeId(v.url);
                    if (!id) return null;
                    const thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
                    return (
                      <a
                        key={v.id}
                        href={isPreview ? '#' : v.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-2xl overflow-hidden border hover:opacity-90 transition-all"
                        style={{ borderColor: theme.border }}
                        onClick={() => handleLinkClick(`yt_${v.id}`)}
                      >
                        <div className="relative">
                          <img src={thumb} className="w-full h-44 object-cover" alt={v.title || 'YouTube'} />
                          <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/60" />
                          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2">
                            <div className="text-xs font-black truncate">{v.title || 'Assistir'}</div>
                            <LucideIcons.Play size={16} className="opacity-90" />
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Scheduling */}
            {hasSchedulingAccess && profile.enableScheduling && (
              <div className="w-full space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black tracking-wide">Agendamento</h2>
                  <LucideIcons.Calendar size={16} className="opacity-70" />
                </div>

                {profile.schedulingMode === 'native' && activeSlots.length > 0 && (
                  <div className="space-y-2">
                    {activeSlots.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSlotId(s.id)}
                        className={clsx(
                          "w-full px-4 py-3 rounded-2xl border flex items-center justify-between gap-2 transition-all",
                          selectedSlotId === s.id ? "bg-white/5" : "hover:bg-white/5"
                        )}
                        style={{ borderColor: theme.border, color: theme.text }}
                      >
                        <span className="text-xs font-black">
                          {DAYS_OF_WEEK[s.dayOfWeek]} • {s.startTime}–{s.endTime}
                        </span>
                        {selectedSlotId === s.id ? (
                          <LucideIcons.Check size={16} className="opacity-90" />
                        ) : (
                          <LucideIcons.ChevronRight size={16} className="opacity-40" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleBooking}
                  className="w-full py-3 rounded-2xl border font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all"
                  style={{ borderColor: theme.border, color: theme.text }}
                >
                  Agendar
                </button>
              </div>
            )}

            {/* Lead Capture */}
            {hasLeadCaptureAccess && profile.enableLeadCapture && (
              <div className="w-full space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black tracking-wide">Fale comigo</h2>
                  <LucideIcons.Send size={16} className="opacity-70" />
                </div>

                {leadSent ? (
                  <div className="p-4 rounded-2xl border text-sm" style={proCardStyle}>
                    <div className="font-black">Mensagem enviada ✅</div>
                    <div className="text-xs opacity-70 mt-1">Em breve entrarei em contato.</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full px-4 py-3 rounded-2xl border bg-transparent text-sm outline-none"
                      style={{ borderColor: theme.border, color: theme.text }}
                    />
                    <input
                      value={leadContact}
                      onChange={(e) => setLeadContact(e.target.value)}
                      placeholder="Seu WhatsApp / E-mail"
                      className="w-full px-4 py-3 rounded-2xl border bg-transparent text-sm outline-none"
                      style={{ borderColor: theme.border, color: theme.text }}
                    />
                    <textarea
                      value={leadMessage}
                      onChange={(e) => setLeadMessage(e.target.value)}
                      placeholder="Mensagem (opcional)"
                      className="w-full px-4 py-3 rounded-2xl border bg-transparent text-sm outline-none min-h-[92px]"
                      style={{ borderColor: theme.border, color: theme.text }}
                    />
                    <button
                      onClick={handleLeadSubmit}
                      className="w-full py-3 rounded-2xl border font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all"
                      style={{ borderColor: theme.border, color: theme.text }}
                    >
                      Enviar
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* NPS */}
            {hasNpsAccess && profile.enableNps && (
              <div className="w-full space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black tracking-wide">Avalie</h2>
                  <LucideIcons.Star size={16} className="opacity-70" />
                </div>

                {npsSent ? (
                  <div className="p-4 rounded-2xl border text-sm" style={proCardStyle}>
                    <div className="font-black">Obrigado pela avaliação ⭐</div>
                    <div className="text-xs opacity-70 mt-1">Sua opinião ajuda muito.</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-10 gap-2">
                      {Array.from({ length: 10 }).map((_, i) => {
                        const score = i + 1;
                        const active = npsScore === score;
                        return (
                          <button
                            key={score}
                            onClick={() => setNpsScore(score)}
                            className={clsx(
                              "py-3 rounded-xl border text-[11px] font-black transition-all",
                              active ? "bg-white/10" : "hover:bg-white/5"
                            )}
                            style={{ borderColor: theme.border, color: theme.text }}
                          >
                            {score}
                          </button>
                        );
                      })}
                    </div>

                    <textarea
                      value={npsComment}
                      onChange={(e) => setNpsComment(e.target.value)}
                      placeholder="Comentário (opcional)"
                      className="w-full px-4 py-3 rounded-2xl border bg-transparent text-sm outline-none min-h-[92px]"
                      style={{ borderColor: theme.border, color: theme.text }}
                    />

                    <button
                      onClick={handleNpsSubmit}
                      className="w-full py-3 rounded-2xl border font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all"
                      style={{ borderColor: theme.border, color: theme.text }}
                    >
                      Enviar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Wallet Modal */}
        {showWalletModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
            <div
              className="w-full max-w-[520px] rounded-3xl border overflow-hidden"
              style={{ borderColor: theme.border, background: theme.cardBg, boxShadow: theme.shadow }}
            >
              <div className="p-5 flex items-center justify-between">
                <div className="font-black tracking-wide">Adicionar na Wallet</div>
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="w-10 h-10 rounded-2xl border grid place-items-center hover:bg-white/5 transition-all"
                  style={{ borderColor: theme.border, color: theme.text }}
                >
                  <LucideIcons.X size={18} />
                </button>
              </div>

              <div className="px-5 pb-5 space-y-4">
                <div className="text-sm opacity-80 leading-relaxed">
                  Em breve: integração direta com Apple Wallet / Google Wallet.
                  Por enquanto, você pode salvar o contato e fixar o link na tela inicial.
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveContact}
                    className="flex-1 py-3 rounded-2xl border font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all"
                    style={{ borderColor: theme.border, color: theme.text }}
                  >
                    Salvar Contato
                  </button>

                  <button
                    onClick={() => setShowWalletModal(false)}
                    className="flex-1 py-3 rounded-2xl border font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all"
                    style={{ borderColor: theme.border, color: theme.text }}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Branding */}
      {!profile.hideBranding && (
        <div className="pb-8 text-xs opacity-60">
          Criado com <span className="font-black">LinkFlow</span>
        </div>
      )}
    </div>
  );
};

export default PublicProfileRenderer;
