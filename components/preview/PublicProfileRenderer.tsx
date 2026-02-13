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
    const name = profile.displayName || 'Contato LinkFlow';
    const headline = profile.headline || '';
    const url = window.location.origin + '/#/u/' + profile.slug;

    const phoneBtn = buttons.find((b: any) => b?.enabled && (b.type === 'whatsapp' || b.type === 'phone' || b.type === 'mobile'));
    const emailBtn = buttons.find((b: any) => b?.enabled && b.type === 'email');

    const phone = phoneBtn ? String(phoneBtn.value || '').replace(/\D/g, '') : '';
    const email = emailBtn ? String(emailBtn.value || '') : '';

    let vCard = `BEGIN:VCARD
VERSION:3.0
FN:${name}
N:${name};;;;
TITLE:${headline}
URL:${url}
NOTE:Perfil digital criado com LinkFlow.
`;

    if (phone) vCard += `TEL;TYPE=CELL:${phone}\n`;
    if (email) vCard += `EMAIL:${email}\n`;
    if (profile.avatarUrl && profile.avatarUrl.startsWith('http')) {
      vCard += `PHOTO;VALUE=URI:${profile.avatarUrl}\n`;
    }

    vCard += `END:VCARD`;

    const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8' });
    const downloadUrl = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.setAttribute('download', `${profile.slug || 'contato'}.vcf`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 1000);
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) {
      alert("Modo Preview: Lead seria enviado.");
      setLeadSent(true);
      return;
    }
    updateStorage(prev => ({
      ...prev,
      leads: [...prev.leads, {
        id: Math.random().toString(36).substring(7),
        clientId: profile.clientId,
        profileId: profile.id,
        name: leadName,
        contact: leadContact,
        message: leadMessage,
        status: 'novo',
        createdAt: new Date().toISOString(),
        source: source
      }]
    }));
    setLeadSent(true);
  };

  const handleNpsSubmit = () => {
    if (npsScore === null) return;
    if (isPreview) {
      alert("Modo Preview: NPS enviado.");
      setNpsSent(true);
      return;
    }
    updateStorage(prev => ({
      ...prev,
      nps: [...prev.nps, {
        id: Math.random().toString(36).substring(7),
        clientId: profile.clientId,
        profileId: profile.id,
        score: npsScore,
        comment: npsComment,
        createdAt: new Date().toISOString(),
        source: source
      }]
    }));
    setNpsSent(true);
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
    return (
      <div className={clsx(isGrid ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3", "w-full")}>
        {activeButtons.map((btn: any, idx: number) => {
          const Icon = getIcon(btn.type);
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
                  <Icon size={24} />
                  <div className="font-black truncate w-full">{btn.label}</div>
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
                  className={clsx(
                    "rounded-full border-4 object-cover shadow-2xl bg-zinc-900",
                    isBigAvatar ? "w-40 h-40" : "w-24 h-24"
                  )}
                  style={{ borderColor: theme.cardBg }}
                  alt={profile.displayName || 'Perfil'}
                />
                <div className="flex-1 min-w-0 pb-1">
                  <h1 className="text-2xl font-black tracking-tight leading-tight" style={{ fontFamily: headingFont }}>
                    {profile.displayName}
                  </h1>
                  <p className="text-sm opacity-80 mt-1 font-medium">{profile.headline}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 space-y-6">
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
                <h3 className="text-center text-[10px] font-black uppercase tracking-widest opacity-60">Produtos & Serviços</h3>
                <div className="grid gap-3">
                  {activeCatalog.map(item => (
                    <div key={item.id} className="p-4 rounded-2xl flex gap-4 items-start" style={proCardStyle}>
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.title} className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-black/20" />
                      )}
                      <div className="flex-1 min-w-0 text-left">
                        <h4 className="font-bold text-sm truncate">{item.title}</h4>
                        {item.description && <p className="text-xs opacity-70 line-clamp-2 mt-1">{item.description}</p>}
                        {item.priceText && <p className="text-sm font-black mt-2" style={{ color: theme.primary }}>{item.priceText}</p>}
                        {item.ctaLink && (
                          <a 
                            href={item.ctaLink} 
                            target="_blank" 
                            rel="noreferrer"
                            className="mt-3 inline-block px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-opacity hover:opacity-80"
                            style={{ background: theme.primary, color: primaryTextOnPrimary }}
                          >
                            {item.ctaLabel || 'Ver mais'}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfólio */}
            {hasPortfolioAccess && activePortfolio.length > 0 && (
              <div className="w-full space-y-4 pt-4">
                <h3 className="text-center text-[10px] font-black uppercase tracking-widest opacity-60">Portfólio</h3>
                <div className="grid grid-cols-2 gap-3">
                  {activePortfolio.map(item => (
                    <div key={item.id} className="relative aspect-square rounded-2xl overflow-hidden group bg-black/20" style={{ border: `1px solid ${theme.border}` }}>
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      {item.title && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                          <span className="text-xs font-bold text-white truncate w-full">{item.title}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vídeos */}
            {hasVideosAccess && activeVideos.length > 0 && (
              <div className="w-full space-y-4 pt-4">
                <h3 className="text-center text-[10px] font-black uppercase tracking-widest opacity-60">Vídeos</h3>
                <div className="space-y-4">
                  {activeVideos.map(video => {
                    const videoId = extractYouTubeId(video.url);
                    if (!videoId) return null;
                    return (
                      <div key={video.id} className="rounded-2xl overflow-hidden aspect-video bg-black shadow-lg" style={{ border: `1px solid ${theme.border}` }}>
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={video.title || 'YouTube video'}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Agendamento */}
            {hasSchedulingAccess && profile.enableScheduling && (
              <div className="w-full p-6" style={proCardStyle}>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Agenda</div>
                  <LucideIcons.Calendar size={16} className="opacity-40" />
                </div>

                {profile.schedulingMode === 'native' ? (
                  <div className="space-y-4">
                    {activeSlots.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {activeSlots.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedSlotId(slot.id)}
                            className={clsx(
                              "flex items-center justify-between p-3 rounded-xl border text-[11px] font-bold transition-all",
                              selectedSlotId === slot.id
                                ? "bg-white text-black border-white"
                                : "bg-black/20 border-white/5 text-white/70"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <LucideIcons.Clock size={12} />
                              {DAYS_OF_WEEK[slot.dayOfWeek]}
                            </div>
                            <div>{slot.startTime} - {slot.endTime}</div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-white/5 border border-dashed border-white/10 rounded-xl text-center text-[10px] opacity-40">
                        Nenhum horário disponível.
                      </div>
                    )}

                    <button
                      onClick={handleBooking}
                      disabled={!selectedSlotId}
                      className="w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30"
                      style={{ background: theme.primary, color: primaryTextOnPrimary }}
                    >
                      Confirmar no WhatsApp
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-xs font-medium text-center opacity-60 mb-2">
                      Agende um horário exclusivo comigo.
                    </div>
                    <button
                      onClick={handleBooking}
                      className="w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                      style={{ background: theme.primary, color: primaryTextOnPrimary }}
                    >
                      Abrir Agenda Externa
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Captura de Leads */}
            {hasLeadCaptureAccess && profile.enableLeadCapture && (
              <div className="w-full p-6" style={proCardStyle}>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-4 text-center">Entre em Contato</div>
                
                {leadSent ? (
                  <div className="text-center py-6 animate-in fade-in zoom-in">
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                       <LucideIcons.Check size={24} />
                    </div>
                    <h4 className="font-bold text-sm">Mensagem Enviada!</h4>
                    <p className="text-xs opacity-60 mt-1">Entraremos em contato em breve.</p>
                  </div>
                ) : (
                  <form onSubmit={handleLeadSubmit} className="space-y-3">
                    <input 
                      type="text" required placeholder="Seu Nome" 
                      value={leadName} onChange={e => setLeadName(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 placeholder:text-white/30"
                      style={{ color: theme.text }}
                    />
                    <input 
                      type="text" required placeholder="Seu Contato (Email ou WhatsApp)" 
                      value={leadContact} onChange={e => setLeadContact(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 placeholder:text-white/30"
                      style={{ color: theme.text }}
                    />
                    <textarea 
                      placeholder="Como podemos ajudar?" 
                      value={leadMessage} onChange={e => setLeadMessage(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 placeholder:text-white/30 h-24 resize-none"
                      style={{ color: theme.text }}
                    />
                    <button 
                      type="submit"
                      className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                      style={{ background: theme.primary, color: primaryTextOnPrimary }}
                    >
                      Enviar Mensagem
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* NPS */}
            {hasNpsAccess && profile.enableNps && !npsSent && (
               <div className="w-full p-6" style={proCardStyle}>
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-4 text-center">Avalie nossa página</div>
                  <div className="flex justify-between gap-1 mb-4">
                     {[0,1,2,3,4,5,6,7,8,9,10].map(score => (
                        <button 
                           key={score}
                           onClick={() => setNpsScore(score)}
                           className={clsx(
                             "w-7 h-9 rounded-md text-[10px] font-bold transition-all flex items-center justify-center",
                             npsScore === score ? "bg-white text-black scale-110" : "bg-black/20 hover:bg-white/10"
                           )}
                           style={{ color: npsScore === score ? '#000' : theme.text }}
                        >
                           {score}
                        </button>
                     ))}
                  </div>
                  {npsScore !== null && (
                     <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                        <textarea 
                           placeholder="Deixe um comentário opcional..." 
                           value={npsComment} onChange={e => setNpsComment(e.target.value)}
                           className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-white/30 placeholder:text-white/30 h-16 resize-none"
                           style={{ color: theme.text }}
                        />
                        <button 
                           onClick={handleNpsSubmit}
                           className="w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                           style={{ background: theme.primary, color: primaryTextOnPrimary }}
                        >
                           Enviar Avaliação
                        </button>
                     </div>
                  )}
               </div>
            )}
            
            {hasNpsAccess && profile.enableNps && npsSent && (
               <div className="w-full p-4 text-center opacity-60 text-xs font-bold uppercase tracking-widest border border-dashed border-white/10 rounded-xl">
                  Obrigado pela avaliação!
               </div>
            )}

            {hasPixAccess && profile.pixKey && (
              <div className="w-full p-6" style={proCardStyle}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 text-left">
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Pix</div>
                    <div className="font-bold text-sm truncate">{profile.pixKey}</div>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(profile.pixKey || '')}
                    className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                    style={{ background: theme.primary, color: primaryTextOnPrimary }}
                  >
                    Copiar
                  </button>
                </div>
              </div>
            )}
          </div>

          {!profile.hideBranding && (
            <footer className="py-6 border-t border-white/5 flex flex-col items-center gap-2">
              <a href="/" target="_blank" className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                <img src="/logo.png" className="h-5" alt="LinkFlow" />
                <span className="text-[10px] font-black uppercase tracking-widest">LinkFlow</span>
              </a>
            </footer>
          )}
        </main>
      </div>

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-sm rounded-[2rem] p-8 relative animate-in slide-in-from-bottom-10 duration-300">
            <button
              onClick={() => setShowWalletModal(false)}
              className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white"
              type="button"
              aria-label="Fechar"
            >
              <LucideIcons.X size={16} />
            </button>

            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 bg-blue-600/10 rounded-[1.5rem] flex items-center justify-center text-blue-500 mb-2">
                <LucideIcons.WalletCards size={32} />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">Cartão Digital</h3>
                <p className="text-zinc-400 text-xs leading-relaxed px-2">
                  Salve este perfil para acesso rápido.
                </p>
              </div>

              <div className="w-full space-y-3">
                <button
                  onClick={() => { handleSaveContact(); setShowWalletModal(false); }}
                  className="w-full py-4 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                  type="button"
                >
                  <LucideIcons.Download size={16} />
                  Baixar Arquivo vCard
                </button>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Dica Pro</p>
                  <p className="text-xs text-zinc-300">
                    Use "Adicionar à Tela de Início" no navegador do seu celular para instalar como App.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfileRenderer;