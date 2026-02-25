"use client";

import React, { useMemo, useState, useRef } from 'react';
import { Profile, AnalyticsSource, PlanType, CatalogItem, SchedulingSlot, ModuleType, UtmParams, Showcase } from '../../types';
import { formatLink } from '@/lib/linkHelpers';
import { trackEvent } from '@/lib/analytics';
import { backgroundPresets } from '@/lib/backgroundPresets';
import { canAccessFeature } from '@/lib/permissions';
import { extractYouTubeId } from '@/lib/youtube';
import { leadsApi } from '@/lib/api/leads';
import { npsApi } from '@/lib/api/nps';
import { schedulingApi } from '@/lib/api/scheduling';
import * as LucideIcons from 'lucide-react';
import clsx from 'clsx';

interface Props {
  profile: Profile;
  isPreview?: boolean;
  clientPlan?: PlanType;
  client?: any;
  showcase?: (Showcase & { items: any[] }) | null;
  source?: AnalyticsSource;
  utm?: UtmParams;
}

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const safeString = (v: any, fallback: string) =>
  typeof v === 'string' && v.trim() ? v : fallback;

const normalizeFontStack = (font: string) => {
  const name = safeString(font, 'Inter');
  const needsQuotes = /\s/.test(name) || /["']/.test(name);
  const quoted = needsQuotes ? `"${name.replace(/"/g, '')}"` : name;
  return `${quoted}, Inter, system-ui, -apple-system, sans-serif`;
};

const hexToRgb = (hex: string) => {
  if (!hex || typeof hex !== 'string') return null;
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
  if (!hexBg || typeof hexBg !== 'string') return light;
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
    case 'github': return '#333333';
    case 'email': return '#EA4335';
    case 'maps': return '#34A853';
    case 'twitch': return '#9146FF';
    case 'discord': return '#5865F2';
    case 'threads': return '#000000';
    default: return null;
  }
};

const PublicProfileRenderer = React.memo<Props>(({ profile, isPreview, clientPlan, client, showcase, source = 'direct', utm }) => {
  const DEFAULT_THEME = {
    primary: '#3b82f6',
    text: '#ffffff',
    muted: 'rgba(255,255,255,0.7)',
    border: 'rgba(255,255,255,0.10)',
    cardBg: 'rgba(0,0,0,0.30)',
    shadow: '0 12px 40px rgba(0,0,0,0.35)',
    radius: '18px',
    buttonStyle: 'glass',
    backgroundType: 'solid',
    backgroundValue: '#0A0A0A',
    backgroundDirection: 'to bottom',
    backgroundValueSecondary: '#0A0A0A',
    backgroundValueTertiary: '',
    backgroundMode: 'fill',
    borderWidth: '1px',
    overlayIntensity: 0
  };

  // Merge defensivo extra-seguro
  const theme = useMemo(() => {
    const rawTheme = (profile as any)?.theme || {};
    return {
      ...DEFAULT_THEME,
      ...rawTheme,
      primary: rawTheme.primary || DEFAULT_THEME.primary,
      text: rawTheme.text || DEFAULT_THEME.text,
      backgroundValue: rawTheme.backgroundValue || DEFAULT_THEME.backgroundValue,
      cardBg: rawTheme.cardBg || DEFAULT_THEME.cardBg,
      border: rawTheme.border || DEFAULT_THEME.border,
      radius: rawTheme.radius || DEFAULT_THEME.radius,
      muted: rawTheme.muted || DEFAULT_THEME.muted,
    };
  }, [profile]);

  const borderWidth = theme.borderWidth || '1px';

  // Tipografia Dinâmica
  const currentFonts = useMemo(() => {
    return (profile as any)?.fonts || {
      headingFont: 'Poppins',
      bodyFont: 'Inter',
      buttonFont: 'Inter',
    };
  }, [profile]);

  const headingFont = normalizeFontStack(currentFonts.headingFont);
  const bodyFont = normalizeFontStack(currentFonts.bodyFont);
  const buttonFont = normalizeFontStack(currentFonts.buttonFont || currentFonts.bodyFont);

  // Carregamento de Fontes (Google Fonts)
  React.useEffect(() => {
    const getBaseName = (f: string) => (f || '').split(',')[0].replace(/['"]/g, '').trim();
    const hBase = getBaseName(currentFonts.headingFont || 'Poppins');
    const bBase = getBaseName(currentFonts.bodyFont || 'Inter');
    const btnBase = getBaseName(currentFonts.buttonFont || currentFonts.bodyFont || 'Inter');

    const uniqueFamilies = Array.from(new Set([hBase, bBase, btnBase].filter(Boolean)));
    if (uniqueFamilies.length === 0) return;

    const query = uniqueFamilies.map(name => `family=${name.replace(/ /g, '+')}:wght@400;500;600;700;800;900`).join('&');
    const url = `https://fonts.googleapis.com/css2?${query}&display=swap`;

    const linkId = `fonts-${profile.id}`;
    let link = document.getElementById(linkId) as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = url;

    return () => {
      // Removemos apenas se não for preview para evitar flickering no editor
      if (!isPreview) {
        const toRemove = document.getElementById(linkId);
        if (toRemove) toRemove.remove();
      }
    };
  }, [currentFonts, profile.id, isPreview]);

  const buttons = Array.isArray((profile as any)?.buttons) ? (profile as any).buttons : [];

  // Global Scheduling Logic (Passed via props to avoid getStorage dependency)
  const isGlobalSchedule = client?.schedulingScope === 'global';

  const rawSlots = isGlobalSchedule
    ? (client?.globalSlots || [])
    : (profile.nativeSlots || []);

  const activeSlots = rawSlots.filter((s: any) => s.isActive);

  const hasSchedulingAccess = canAccessFeature(clientPlan, 'scheduling');
  const hasPixAccess = canAccessFeature(clientPlan, 'pix');
  const hasCatalogAccess = canAccessFeature(clientPlan, 'catalog');
  const hasPortfolioAccess = canAccessFeature(clientPlan, 'portfolio');
  const hasVideosAccess = canAccessFeature(clientPlan, 'videos');
  const hasLeadCaptureAccess = canAccessFeature(clientPlan, 'leads_capture');
  const hasNpsAccess = canAccessFeature(clientPlan, 'nps');

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<CatalogItem | null>(null);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  const [leadName, setLeadName] = useState('');
  const [leadContact, setLeadContact] = useState('');
  const [leadMessage, setLeadMessage] = useState('');
  const [leadSent, setLeadSent] = useState(false);

  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [npsComment, setNpsComment] = useState('');
  const [npsRequestContact, setNpsRequestContact] = useState(false);
  const [npsName, setNpsName] = useState('');
  const [npsContact, setNpsContact] = useState('');
  const [npsSent, setNpsSent] = useState(false);

  // Booking Stats
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingName, setBookingName] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [bookingContact, setBookingContact] = useState('');
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  const catalogScrollRef = useRef<HTMLDivElement>(null);
  const portfolioScrollRef = useRef<HTMLDivElement>(null);
  const videosScrollRef = useRef<HTMLDivElement>(null);

  const scrollModule = (ref: React.RefObject<HTMLDivElement>, direction: 'prev' | 'next') => {
    if (!ref.current) return;
    const container = ref.current;
    const scrollAmount = container.clientWidth;
    container.scrollBy({
      left: direction === 'next' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });
  };

  // Scheduling: 7 Days Logic (Top Level Hooks)
  const getNext7Days = () => {
    const dates = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const next7Days = useMemo(() => getNext7Days(), []);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  const selectedDate = next7Days[selectedDateIndex];
  const selectedDayOfWeek = selectedDate.getDay();

  // Helper para formatar data: "SEG 20/02"
  const formatDateTab = (date: Date) => {
    const w = DAYS_OF_WEEK[date.getDay()].toUpperCase();
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    return { w, d: `${d}/${m}` };
  };

  // Filtrar slots para o dia selecionado
  const mapDaySlots = useMemo(() => (activeSlots || [])
    .filter((s: any) => s.dayOfWeek === selectedDayOfWeek)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || '')), [activeSlots, selectedDayOfWeek]);

  // ... (rest of states and logic)

  // Booking Modal
  const renderBookingModal = () => {
    if (!showBookingModal || !selectedSlotId) return null;

    const slot = activeSlots.find(s => s.id === selectedSlotId);
    const dayName = slot ? DAYS_OF_WEEK[slot.dayOfWeek] : '';
    const time = slot ? slot.startTime : '';
    const dateFormatted = selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    return (
      <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
        <div className="w-full max-w-sm bg-[#09090b] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-500" onClick={e => e.stopPropagation()}>

          {bookingSuccess ? (
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/5">
                <LucideIcons.Check size={40} strokeWidth={3} />
              </div>
              <div>
                <h4 className="text-xl font-black text-white italic">Solicitação Enviada!</h4>
                <p className="text-sm text-zinc-500 mt-2 font-medium">Marcamos seu interesse para:</p>
                <div className="mt-3 py-2 px-4 bg-white/5 rounded-xl border border-white/5 inline-block">
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">{dayName} {dateFormatted} às {time}</span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">O proprietário foi notificado e entrará em contato em breve para confirmar.</p>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setBookingSuccess(false);
                  setSelectedSlotId(null);
                }}
                className="w-full py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95"
              >
                Fechar
              </button>
            </div>
          ) : (
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-black text-white italic tracking-tight">Reservar <span className="text-neon-blue">Slot</span></h4>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Confirme seu interesse</p>
                </div>
                <button onClick={() => setShowBookingModal(false)} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 transition-colors"><LucideIcons.X size={20} /></button>
              </div>

              <div className="p-5 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                  <LucideIcons.CalendarClock size={24} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">{dayName} {dateFormatted}</div>
                  <div className="text-lg font-black text-white">{time} - {slot?.endTime}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Para quem é a agenda?</label>
                  <input
                    value={bookingName}
                    onChange={e => setBookingName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-neon-blue outline-none transition-all placeholder:text-zinc-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">WhatsApp de Contato</label>
                  <input
                    value={bookingContact}
                    onChange={e => setBookingContact(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-neon-blue outline-none transition-all placeholder:text-zinc-700"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={async () => {
                    if (isPreview) {
                      setBookingSuccess(true);
                      return;
                    }

                    // Persistence logic via Supabase API
                    const ts = new Date().toISOString();
                    const bookingDetails = `${bookingName} (${bookingContact})`;

                    try {
                      // 1. Create Lead for CRM tracking
                      await leadsApi.create({
                        clientId: profile.clientId,
                        profileId: profile.id,
                        name: bookingName,
                        contact: bookingContact,
                        message: `Agendamento pendente para ${dayName} ${dateFormatted} às ${time}`,
                        status: 'novo',
                        source: source || 'agendamento_perfil',
                        captureType: 'form'
                      });

                      // 2. Update Slot Status in DB
                      await schedulingApi.updateSlotStatus(selectedSlotId, 'pending', {
                        bookedBy: bookingDetails,
                        bookedAt: ts
                      });

                      setBookingSuccess(true);

                      // Track Analytics Event for Conversion
                      trackEvent({
                        clientId: profile.clientId,
                        profileId: profile.id,
                        type: 'appointment_requested' as any,
                        assetType: 'scheduling' as any,
                        assetId: 'booking_modal',
                        source,
                        utm
                      });

                      // Optional: Open WhatsApp after a short delay
                      if (profile.bookingWhatsapp) {
                        const text = encodeURIComponent(`Olá! Acabei de solicitar um agendamento para ${dayName} às ${time} pelo seu perfil PageFlow. Nome: ${bookingName}.`);
                        setTimeout(() => window.open(`https://wa.me/${profile.bookingWhatsapp}?text=${text}`, '_blank'), 2000);
                      }
                    } catch (err) {
                      console.error("Booking submission error:", err);
                      alert("Erro ao processar reserva. Tente novamente.");
                    }
                  }}
                  className="w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] bg-neon-blue text-black shadow-lg shadow-neon-blue/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  Confirmar Reserva <LucideIcons.ArrowRight size={16} strokeWidth={3} />
                </button>
                <div className="flex items-center justify-center gap-2 opacity-30">
                  <LucideIcons.ShieldCheck size={12} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Protocolo Seguro PageFlow</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const layout = (profile.layoutTemplate || 'Minimal Pro').trim();

  const isGrid = ['Neon Modern Dark', 'Split Modern', 'Card Grid Profile'].includes(layout);
  const isLeft = ['Split Modern'].includes(layout);
  const isBigAvatar = ['Big Avatar Story', 'Centered Hero'].includes(layout);
  const isFullCover = layout === 'Full Cover Hero';
  const isNeon = layout === 'Neon Modern Dark';
  const isStack = layout === 'Stack Sections';
  const isCenteredHero = layout === 'Centered Hero';
  const isCardGrid = layout === 'Card Grid Profile';

  const headingFontStack = headingFont;
  const bodyFontStack = bodyFont;
  const buttonFontStack = buttonFont;

  const primaryTextOnPrimary = pickReadableOn(theme.primary);

  const typeLabel = {
    personal: 'Profissional',
    business: 'Empresa',
    creator: 'Criador'
  }[profile.profileType || 'personal'] || 'Profissional';

  const primaryRgb = hexToRgb(theme.primary);
  const badgeBg = primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)` : theme.primary;

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

  const activePreset = useMemo(() => {
    if (theme.backgroundType !== 'preset') return null;
    return backgroundPresets.find(p => p.gradient === theme.backgroundValue);
  }, [theme.backgroundType, theme.backgroundValue]);

  const bgComputed = useMemo(() => {
    if (theme.backgroundType === 'preset') {
      // Presets já são strings completas de gradiente/imagem
      return theme.backgroundValue;
    }
    if (theme.backgroundType === 'gradient') {
      const colors = [theme.backgroundValue];
      if (theme.backgroundValueSecondary) colors.push(theme.backgroundValueSecondary);
      if (theme.backgroundValueTertiary) colors.push(theme.backgroundValueTertiary);
      return `linear-gradient(${theme.backgroundDirection || 'to bottom'}, ${colors.join(', ')})`;
    }
    if (theme.backgroundType === 'image') {
      return theme.backgroundValue.startsWith('url') ? theme.backgroundValue : `url(${theme.backgroundValue})`;
    }
    return theme.backgroundValue || '#0A0A0A';
  }, [theme.backgroundType, theme.backgroundDirection, theme.backgroundValue, theme.backgroundValueSecondary, theme.backgroundValueTertiary]);

  const bgStyle: React.CSSProperties = useMemo(() => {
    const mode = theme.backgroundMode || 'fill';
    const type = theme.backgroundType;

    if (type === 'image') {
      const modeStyles: Record<string, React.CSSProperties> = {
        fill: { backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' },
        center: { backgroundSize: 'contain', backgroundPosition: 'center', backgroundAttachment: 'fixed', backgroundRepeat: 'no-repeat' },
        top: { backgroundSize: '100% auto', backgroundPosition: 'top center', backgroundAttachment: 'scroll', backgroundRepeat: 'no-repeat' },
        parallax: { backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' },
        repeat: { backgroundSize: 'auto', backgroundPosition: 'top left', backgroundRepeat: 'repeat', backgroundAttachment: 'scroll' }
      };

      return {
        backgroundImage: bgComputed,
        minHeight: '100vh',
        backgroundColor: '#000',
        ...modeStyles[mode]
      };
    }

    if (type === 'gradient' || type === 'preset') {
      return {
        background: bgComputed,
        minHeight: '100vh',
        backgroundAttachment: mode === 'parallax' ? 'fixed' : 'scroll'
      };
    }

    return {
      background: bgComputed,
      minHeight: '100vh'
    };
  }, [theme.backgroundType, theme.backgroundMode, bgComputed]);

  const shellCardStyle: React.CSSProperties = useMemo(() => {
    let borderRadius = theme.radius;
    let cardBg = theme.cardBg;
    let shadow = theme.shadow;
    let border = `${borderWidth} solid ${theme.border}`;

    if (isNeon) {
      cardBg = 'rgba(0, 0, 0, 0.4)';
      shadow = `0 0 40px ${theme.primary}15, ${theme.shadow}`;
    }

    if (isStack) {
      cardBg = 'transparent';
      border = 'none';
      shadow = 'none';
    }

    return {
      background: cardBg,
      border,
      borderRadius,
      boxShadow: shadow,
      overflow: 'hidden',
    };
  }, [theme.cardBg, theme.border, theme.radius, theme.shadow, borderWidth, isNeon, isStack, theme.primary]);

  const resolveModuleStyle = (moduleType: ModuleType) => {
    // 1. Alias mapping for backward compatibility and PT-BR keys
    const themes = (profile as any).moduleThemes || {};
    const specific = themes[moduleType] ||
      (moduleType === 'scheduling' ? themes['agendamento'] : undefined) ||
      (moduleType === 'catalog' ? themes['catalogo'] : undefined);

    const general = profile.generalModuleTheme;

    // Cascade Robust: Específico > Geral > Default
    const effectiveStyle = specific?.style || general?.style ||
      (['scheduling', 'leadCapture', 'nps'].includes(moduleType) ? 'glass' : (isStack ? 'glass' : 'minimal'));

    const primary = specific?.primaryColor || general?.primaryColor || theme?.primary || '#3b82f6';
    const buttonColor = specific?.buttonColor || general?.buttonColor || theme?.primary || '#3b82f6';
    const radius = specific?.radius || general?.radius || theme?.radius || '18px';
    const shadow = specific?.shadow || general?.shadow || theme?.shadow || 'none';
    const glow = specific?.glowIntensity ?? general?.glowIntensity ?? 50;

    const buttonTextColor = pickReadableOn(buttonColor);
    const textColorOverride = specific?.textColor || general?.textColor;
    const titleColorOverride = specific?.titleColor || general?.titleColor;

    const primaryTextColor = pickReadableOn(primary);

    let containerStyle: React.CSSProperties = {
      transition: 'all 0.3s ease',
      borderRadius: radius,
      border: `${borderWidth} solid ${theme.border}`,
      background: theme.cardBg,
      boxShadow: shadow,
      overflow: 'visible', // CRITICAL: Prevent title clipping
      position: 'relative',
    };

    let textColor = textColorOverride || theme.text || '#ffffff';
    let titleColor = titleColorOverride || theme.text || '#ffffff';
    let mutedColor = theme.muted || 'rgba(255,255,255,0.6)';
    let inputBg = 'rgba(255,255,255,0.05)';
    let inputBorder = `${borderWidth} solid ${theme.border}`;
    let inputFocusBorder = `${borderWidth} solid ${primary}`;
    let placeholderColor = theme.muted || 'rgba(255,255,255,0.5)';

    switch (effectiveStyle) {
      case 'minimal':
        containerStyle.background = 'transparent';
        containerStyle.border = 'none';
        containerStyle.boxShadow = 'none';
        break;
      case 'soft':
        containerStyle.background = 'rgba(255, 255, 255, 0.05)';
        containerStyle.border = `1px solid ${primary}15`;
        containerStyle.boxShadow = `0 10px 30px -10px rgba(0,0,0,0.3)`;
        containerStyle.borderRadius = '32px';
        break;
      case 'brutalist':
        containerStyle.background = primary;
        containerStyle.border = `4px solid #000000`;
        containerStyle.boxShadow = `8px 8px 0px 0px #000000`;
        containerStyle.borderRadius = '0px';
        textColor = '#000000';
        titleColor = '#000000';
        mutedColor = 'rgba(0,0,0,0.6)';
        inputBg = 'rgba(0,0,0,0.08)';
        inputBorder = '2px solid #000000';
        placeholderColor = 'rgba(0,0,0,0.4)';
        break;
      case '3d':
        containerStyle.background = `linear-gradient(145deg, ${primary}15, ${primary}05)`;
        containerStyle.border = `1px solid ${primary}30`;
        containerStyle.boxShadow = `0 10px 20px -5px rgba(0,0,0,0.5), inset 0 1px 1px ${primary}40, inset 0 -1px 1px rgba(0,0,0,0.2)`;
        break;
      case 'solid':
        containerStyle.background = primary;
        containerStyle.border = 'none';
        textColor = primaryTextColor;
        titleColor = primaryTextColor;
        mutedColor = `${primaryTextColor}80`;
        inputBg = 'rgba(255,255,255,0.1)';
        inputBorder = 'rgba(255,255,255,0.2)';
        break;
      case 'outline':
        containerStyle.background = 'transparent';
        containerStyle.border = `1.5px solid ${primary}`;
        containerStyle.boxShadow = 'none';
        titleColor = primary;
        break;
      case 'neon':
        containerStyle.background = 'rgba(0, 0, 0, 0.8)';
        containerStyle.border = `1px solid ${primary}`;
        containerStyle.boxShadow = `0 0 ${glow}px ${primary}40, inset 0 0 20px ${primary}10`;
        textColor = '#ffffff';
        titleColor = primary;
        mutedColor = 'rgba(255,255,255,0.6)';
        inputBg = 'rgba(0,0,0,0.5)';
        inputBorder = `1px solid ${primary}40`;
        inputFocusBorder = `1px solid ${primary}`;
        break;
      case 'glass':
      default:
        containerStyle.background = isStack ? 'rgba(255,255,255,0.03)' : theme.cardBg;
        containerStyle.border = `${borderWidth} solid ${primary}20`;
        containerStyle.backdropFilter = 'blur(10px)';
        break;
    }

    if (shadow === 'none' || (specific?.shadow === 'none' || (!specific && general?.shadow === 'none'))) {
      containerStyle.boxShadow = 'none';
    }

    // Return complete style configuration object
    return {
      // Container styles
      container: containerStyle,

      // Colors
      primary,
      buttonColor,
      buttonTextColor,
      primaryTextColor,
      textColor,
      titleColor,
      mutedColor,

      // Input styles
      inputStyle: {
        background: inputBg,
        border: inputBorder,
        color: textColor,
        transition: 'all 0.2s',
        outline: 'none',
        fontWeight: '500'
      },
      inputFocusStyle: {
        borderColor: primary
      },

      // Button styles
      buttonStyle: {
        background: buttonColor,
        color: buttonTextColor,
        border: effectiveStyle === 'outline' ? `1px solid ${buttonColor}` : 'none',
        borderRadius: radius,
        transition: 'all 0.2s ease',
        cursor: 'pointer'
      },
      buttonHoverStyle: {
        transform: 'scale(1.02)',
        opacity: 0.9
      },
      buttonActiveStyle: {
        transform: 'scale(0.98)'
      },
      buttonDisabledStyle: {
        opacity: 0.3,
        cursor: 'not-allowed'
      },

      // Icon container styles (for module headers)
      iconContainerStyle: {
        backgroundColor: `${primary}20`,
        color: primary,
        borderRadius: '0.5rem',
        padding: '0.5rem'
      },

      // Item/Card styles (for catalog, portfolio items)
      itemCardStyle: {
        background: effectiveStyle === 'solid' ? 'rgba(255,255,255,0.1)' : (effectiveStyle === 'neon' ? `${primary}10` : 'rgba(255,255,255,0.04)'),
        border: `1px solid ${effectiveStyle === 'outline' ? primary : (effectiveStyle === 'neon' ? `${primary}40` : `${primary}15`)}`,
        borderRadius: radius,
        transition: 'all 0.2s ease',
        color: effectiveStyle === 'solid' ? primaryTextColor : textColor
      },
      itemCardHoverStyle: {
        transform: 'scale(1.02)',
        borderColor: primary,
        background: effectiveStyle === 'solid' ? 'rgba(255,255,255,0.15)' : (effectiveStyle === 'neon' ? `${primary}20` : 'rgba(255,255,255,0.08)')
      },

      // Active/Selected state styles
      activeStateStyle: {
        background: primary,
        color: primaryTextColor,
        borderColor: primary
      },

      // Shadow utilities
      shadowStyle: shadow,
      glowStyle: effectiveStyle === 'neon' ? `0 0 ${glow}px ${primary}40` : 'none',

      // Metadata
      isNeon: effectiveStyle === 'neon',
      effectiveStyle,
      radius,
      glow
    };
  };

  const handleLinkClick = (linkId?: string, category: 'button' | 'portfolio' | 'catalog' | 'video' = 'button') => {
    if (isPreview) return;

    // Resolve label for robust tracking
    let label = 'Desconhecido';
    if (category === 'button') {
      const btn = buttons.find((b: any) => b.id === linkId);
      label = btn?.label || 'Botão';
    } else if (category === 'portfolio') {
      const item = (profile.portfolioItems || []).find(i => i.id === linkId);
      label = item?.title || 'Portfolio Item';
    } else if (category === 'catalog') {
      const item = (profile.catalogItems || []).find(i => i.id === linkId);
      label = item?.title || 'Produto';
    } else if (category === 'video') {
      const v = (profile.youtubeVideos || []).find(i => i.id === linkId);
      label = v?.title || 'Vídeo';
    }

    trackEvent({
      clientId: profile.clientId,
      profileId: profile.id,
      type: 'click',
      linkId,
      assetId: linkId,
      assetType: category,
      assetLabel: label,
      source,
      utm
    });
  };

  const getButtonStyle = () => {
    const baseBorder = `${borderWidth} solid ${theme.border}`;
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
        border = `${borderWidth} solid rgba(255,255,255,0.12)`;
        break;
      case 'glass':
        border = `${borderWidth} solid ${theme.border}`;
        break;
      case 'outline':
        border = `${borderWidth} solid ${theme.primary}`;
        break;
    }

    return {
      borderRadius: theme.radius,
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
      fontFamily: buttonFontStack
    };
  };

  const renderLinks = () => {
    const activeButtons = buttons.filter((b: any) => b?.enabled);
    const iconStyle = theme.iconStyle || 'mono';

    return (
      <div className={clsx(isGrid ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3", "w-full")}>
        {activeButtons.map((btn: any, idx: number) => {
          const Icon = getIcon(btn.type);
          const brandColor = getBrandColor(btn.type);
          const buttonStyle = getButtonStyle();

          // Lógica para estilo 'Real' (Fundo colorido da marca)
          if (iconStyle === 'real' && brandColor) {
            buttonStyle.backgroundColor = brandColor;
            buttonStyle.color = '#ffffff';
            buttonStyle.border = 'none'; // Remove borda para ficar "clean" como app
          }

          // Lógica para estilo 'Brand' (Apenas ícone colorido)
          const iconColor = iconStyle === 'brand' ? brandColor || undefined : iconStyle === 'real' && brandColor ? '#ffffff' : undefined;

          return (
            <a
              key={btn.id || `${btn.type}-${idx}`}
              href={isPreview ? '#' : formatLink(btn.type, btn.value)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleLinkClick(btn.id, 'button')}
              style={buttonStyle}
              className="group hover:translate-y-[-2px] button-font"
            >
              {isGrid ? (
                <>
                  <Icon size={24} color={iconColor} />
                  <div className="font-black truncate w-full">{btn.label}</div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon size={20} color={iconColor} />
                    <span className="font-black truncate">{btn.label}</span>
                  </div>
                  <LucideIcons.ChevronRight size={16} className={clsx("opacity-40", iconStyle === 'real' ? "text-white" : "")} />
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
      const slot = activeSlots.find((s: any) => s.id === selectedSlotId);
      if (slot && profile.bookingWhatsapp) {
        const text = encodeURIComponent(
          `Olá, gostaria de agendar um horário (${DAYS_OF_WEEK[slot.dayOfWeek]} das ${slot.startTime} às ${slot.endTime}) visto no seu perfil PageFlow.`
        );
        window.open(`https://wa.me/${profile.bookingWhatsapp}?text=${text}`, '_blank');
      }
    }
  };

  const downloadVCard = () => {
    const activeButtons = (profile as any)?.buttons?.filter((b: any) => b.enabled) || [];

    // Extração de dados específicos
    const phone = activeButtons.find((b: any) => ['phone', 'mobile'].includes(b.type))?.value || '';
    const whatsapp = activeButtons.find((b: any) => b.type === 'whatsapp')?.value || '';
    const email = activeButtons.find((b: any) => b.type === 'email')?.value || '';

    // Redes Sociais
    const instagram = activeButtons.find((b: any) => b.type === 'instagram')?.value || '';
    const linkedin = activeButtons.find((b: any) => b.type === 'linkedin')?.value || '';

    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${profile.displayName}`,
      `N:${profile.displayName};;;;`,
      `TITLE:${profile.headline}`,
    ];

    if (profile.profileType === 'business') {
      lines.push(`ORG:${profile.displayName}`);
    }

    if (profile.bioShort) {
      lines.push(`NOTE:${profile.bioShort.replace(/\n/g, '\\n')}`);
    }

    if (profile.avatarUrl) {
      lines.push(`PHOTO;VALUE=URI:${profile.avatarUrl}`);
    }

    // Telefones
    if (whatsapp) {
      const waNum = whatsapp.replace(/\D/g, '');
      lines.push(`TEL;TYPE=CELL,VOICE;VALUE=uri:tel:${waNum}`);
    }
    if (phone) {
      const phoneNum = phone.replace(/\D/g, '');
      lines.push(`TEL;TYPE=WORK,VOICE;VALUE=uri:tel:${phoneNum}`);
    }

    // Email
    if (email) {
      lines.push(`EMAIL;TYPE=INTERNET:${email}`);
    }

    // Sociais / URL
    lines.push(`URL:${window.location.href}`);
    if (instagram) lines.push(`X-SOCIALPROFILE;TYPE=instagram:https://instagram.com/${instagram.replace('@', '')}`);
    if (linkedin) lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${linkedin}`);

    lines.push('END:VCARD');

    const vCardData = lines.join('\n');
    const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${profile.slug || 'contato'}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const avatarSrc = safeString(profile.avatarUrl, 'https://picsum.photos/seed/avatar/200/200');

  const activeCatalog = (profile.catalogItems || [])
    .filter(i => i.isActive)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const activePortfolio = (profile.portfolioItems || [])
    .filter(i => i.isActive)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const activeVideos = (profile.youtubeVideos || [])
    .filter(i => i.isActive)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  // NPS redirect logic relocated inside submitNps
  const canRedirectNps = npsScore !== null && npsScore >= 9 && profile.npsRedirectUrl;

  const submitLead = async () => {
    if (!leadName.trim() || !leadContact.trim()) {
      alert('Por favor, preencha nome e contato.');
      return;
    }

    if (isPreview) {
      setLeadSent(true);
      return;
    }

    try {
      await leadsApi.create({
        clientId: profile.clientId,
        profileId: profile.id,
        name: leadName,
        contact: leadContact,
        message: leadMessage,
        status: 'novo',
        source: source,
        utm: utm,
        captureType: 'form'
      });
      setLeadSent(true);

      // Track Analytics Event
      trackEvent({
        clientId: profile.clientId,
        profileId: profile.id,
        type: 'lead_sent' as any,
        assetType: 'lead' as any,
        assetId: 'lead_form',
        source,
        utm
      });
    } catch (err) {
      console.error("Lead submission error:", err);
      alert("Erro ao enviar. Tente novamente.");
    }
  };

  const submitNps = async () => {
    if (npsScore === null) {
      alert('Por favor, selecione uma nota.');
      return;
    }

    if (isPreview) {
      setNpsSent(true);
      return;
    }

    const ts = new Date().toISOString();

    try {
      // 1. Create NPS entry
      await npsApi.create({
        clientId: profile.clientId,
        profileId: profile.id,
        score: npsScore,
        comment: npsComment,
        source: source,
        utm: utm
      });

      // 2. If contact requested, create a lead
      if (npsRequestContact && npsContact.trim()) {
        await leadsApi.create({
          clientId: profile.clientId,
          profileId: profile.id,
          name: npsName || 'Cliente NPS',
          contact: npsContact,
          message: `NPS Rating: ${npsScore}. Comentário: ${npsComment}`,
          status: 'novo',
          source: source,
          utm: utm,
          captureType: 'nps'
        });
      }

      // Track NPS response as an analytics event for the Insights Engine
      trackEvent({
        clientId: profile.clientId,
        profileId: profile.id,
        type: 'nps_response',
        assetType: 'nps',
        score: npsScore,
        comment: npsComment,
        source: source,
        utm
      });

      setNpsSent(true);
      if (npsScore >= 9 && profile.npsRedirectUrl) {
        setTimeout(() => window.open(profile.npsRedirectUrl, '_blank'), 1500);
      }
    } catch (err) {
      console.error("NPS submission error:", err);
      alert("Erro ao enviar avaliação.");
    }
  };

  const schedulingStyle = resolveModuleStyle('scheduling');
  const catalogStyle = resolveModuleStyle('catalog');
  const portfolioStyle = resolveModuleStyle('portfolio');
  const videosStyle = resolveModuleStyle('videos');
  const leadCaptureStyle = resolveModuleStyle('leadCapture');
  const npsStyle = resolveModuleStyle('nps');
  const pixStyle = resolveModuleStyle('pix');


  return (
    <div
      className="w-full flex flex-col items-center overflow-x-hidden no-scrollbar profile-root relative"
      style={{
        ...bgStyle,
        color: theme.text,
        fontFamily: bodyFontStack,
        '--font-heading': headingFontStack,
        '--font-body': bodyFontStack,
        '--font-button': buttonFontStack,
      } as React.CSSProperties}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        .profile-root .heading-font { font-family: ${headingFontStack} !important; }
        .profile-root .body-font { font-family: ${bodyFontStack} !important; }
        .profile-root .button-font,
        .profile-root button,
        .profile-root .button-font * { font-family: ${buttonFontStack} !important; }
        
        /* Garantia para títulos em módulos */
        .profile-root h1, .profile-root h2, .profile-root h3, .profile-root h4 {
           font-family: ${headingFontStack} !important;
        }

        .profile-root input::placeholder, 
        .profile-root textarea::placeholder {
           color: inherit;
           opacity: 0.5;
        }

        .profile-root input, 
        .profile-root textarea {
           color: inherit;
        }
      `}} />
      {/* Efeitos de Preset */}
      {activePreset?.config?.noise && <div className="bg-effect-noise" />}
      {activePreset?.config?.grain && <div className="bg-effect-grain" />}
      {activePreset?.config?.stars && <div className="bg-effect-stars" />}
      {activePreset?.config?.glow && <div className="bg-effect-glow" />}
      {activePreset?.config?.waves && <div className="bg-effect-waves" />}

      {/* Overlay Inteligente */}
      {theme.overlayIntensity !== undefined && theme.overlayIntensity > 0 && (
        <div
          className="fixed inset-0 pointer-events-none z-0 transition-opacity"
          style={{
            backgroundColor: 'black',
            opacity: theme.overlayIntensity / 100
          }}
        />
      )}

      <div className={clsx(
        "relative z-10 w-full px-4 flex flex-col items-center pt-8 pb-10 max-w-[1200px]"
      )}>

        {/* Profile Section */}
        <div className={clsx(
          "w-full transition-all duration-500 max-w-[520px]"
        )} style={isStack ? {} : shellCardStyle}>

          <div className="relative">

            {profile.coverUrl && (
              <div className={clsx(
                "w-full overflow-hidden relative transition-all duration-700",
                isFullCover ? "h-52" : isCenteredHero ? "h-64" : isStack ? "h-24" : coverConfig.heightClass
              )}>
                <img src={profile.coverUrl} className="w-full h-full object-cover" alt="Cover" />
                <div className={clsx("absolute inset-0 bg-gradient-to-b", coverConfig.overlay)} />
              </div>
            )}

            <div className={clsx(
              "px-6 pb-6 relative transition-all duration-500",
              profile.coverUrl ? (isCenteredHero ? "-mt-20" : "-mt-12") : "pt-8"
            )}>
              <div className={clsx(
                "flex gap-4",
                isLeft ? "flex-col md:flex-row items-center md:items-end text-center md:text-left" : "flex-col items-center text-center"
              )}>
                <div className="relative">
                  <img
                    src={avatarSrc}
                    alt="Avatar"
                    className={clsx(
                      "object-cover border-4 border-black/50 shadow-xl transition-all duration-500",
                      isBigAvatar ? "w-32 h-32 rounded-[2rem]" : "w-20 h-20 rounded-full",
                      isNeon ? "ring-4 ring-blue-500/20" : ""
                    )}
                  />
                  {isBigAvatar && (
                    <div className="absolute -inset-2 border-2 border-blue-500 rounded-[2.5rem] animate-pulse opacity-20" />
                  )}
                </div>

                <div className={clsx(isLeft ? "md:pb-2" : "")}>
                  <h1 className="text-2xl font-black leading-tight heading-font" style={{ color: theme.text }}>
                    {safeString(profile.displayName, 'Seu Nome')}
                  </h1>
                  <p className="text-sm font-semibold opacity-80 mt-1 body-font" style={{ color: theme.text }}>
                    {safeString(profile.headline, 'Sua headline aqui')}
                  </p>

                  <div
                    className="mt-2 inline-flex items-center px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest button-font"
                    style={{
                      borderColor: theme.primary,
                      backgroundColor: badgeBg,
                      color: theme.primary,
                    }}
                  >
                    {typeLabel}
                  </div>
                </div>
              </div>

              {profile.bioShort && (
                <p className={clsx(
                  "mt-4 text-sm leading-relaxed body-font",
                  isLeft ? "text-center md:text-left" : "text-center"
                )} style={{ color: theme.text, opacity: 0.8 }}>
                  {profile.bioShort}
                </p>
              )}

              {/* Profile Action */}
              <div className={clsx("mt-6 py-4 flex gap-4 w-full justify-center", isLeft ? "md:justify-start" : "")}>
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="rounded-xl px-6 py-3 font-black text-[11px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl button-font"
                  style={{
                    border: `1px solid ${theme.border}`,
                    background: theme.buttonStyle === 'glass' ? 'rgba(255,255,255,0.08)' : theme.primary,
                    color: theme.buttonStyle === 'glass' ? theme.text : primaryTextOnPrimary,
                  }}
                >
                  Salvar Contato
                </button>

                {(clientPlan === 'business' || clientPlan === 'enterprise') && showcase?.isActive && (
                  <button
                    onClick={() => {
                      if (isPreview) return;
                      handleLinkClick(undefined, 'button');
                      window.location.hash = `/u/${profile.slug}/vitrine`;
                    }}
                    className="rounded-xl px-6 py-3 font-black text-[11px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl button-font flex items-center gap-2"
                    style={{
                      borderRadius: theme.radius,
                      background: theme.buttonStyle === 'solid' ? theme.primary : (theme.buttonStyle === 'outline' ? 'transparent' : 'rgba(255,255,255,0.08)'),
                      color: theme.buttonStyle === 'solid' ? pickReadableOn(theme.primary) : theme.text,
                      border: theme.buttonStyle === 'outline' ? `1.5px solid ${theme.primary}` : (theme.buttonStyle === 'glass' ? `1px solid ${theme.border}` : `1px solid rgba(255,255,255,0.1)`),
                      boxShadow: theme.buttonStyle === 'solid' ? `0 0 20px ${theme.primary}30` : 'none'
                    }}
                  >
                    <LucideIcons.Store size={14} />
                    Ver Vitrine
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section (Links, Pix, Catalog, etc.) */}
        <div className={clsx(
          "w-full transition-all duration-500 space-y-6",
          isStack ? "mt-4" : "max-w-[520px] mt-6"
        )}>
          <div className={clsx("w-full transition-all duration-500", !isStack && "space-y-6")}>
            <div className={clsx("space-y-6")}>

              {isStack ? (
                <div className="p-6 rounded-[2rem] shadow-xl backdrop-blur-md" style={{ background: theme.cardBg, border: `${borderWidth} solid ${theme.border}` }}>
                  {renderLinks()}
                </div>
              ) : renderLinks()}

              {/* Agendamento - Só renderiza se tiver permissão E estiver habilitado (Global Master Switch) */}
              {hasSchedulingAccess && profile.enableScheduling && (
                <section className={clsx(
                  "p-6 space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-700",
                  isStack ? "rounded-[2rem] shadow-xl backdrop-blur-md" : "rounded-2xl"
                )} style={{ ...schedulingStyle.container, overflow: 'visible' }}>
                  <div className="flex items-center justify-between min-h-[40px] py-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-70 heading-font whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: schedulingStyle.titleColor, lineHeight: '1.4', minHeight: '1.4em' }}>Agendamento</h3>
                    <div className="flex items-center gap-3">
                      {profile.schedulingMode === 'native' && (
                        <button
                          onClick={() => setShowFullSchedule(true)}
                          className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md transition-all hover:bg-white/10 opacity-60 hover:opacity-100 flex items-center gap-1.5"
                          style={{ color: schedulingStyle.primary }}
                        >
                          <LucideIcons.LayoutGrid size={12} />
                          <span className="hidden sm:inline">Ver Agenda</span>
                          <span className="sm:hidden">Ver</span>
                        </button>
                      )}
                      <LucideIcons.Calendar size={18} style={{ color: schedulingStyle.primary }} />
                    </div>
                  </div>

                  {profile.schedulingMode === 'external' ? (
                    <button
                      onClick={handleBooking}
                      className="w-full rounded-xl p-4 font-black text-xs uppercase tracking-widest transition-transform hover:scale-[1.01] button-font flex items-center justify-center gap-2 shadow-lg"
                      style={schedulingStyle.buttonStyle}
                    >
                      <LucideIcons.ExternalLink size={16} /> Agendar Agora
                    </button>
                  ) : (
                    <div className="space-y-5 animate-in fade-in duration-500">

                      {/* Abas de Dias (Próximos 7 dias) */}
                      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
                        {next7Days.map((date, idx) => {
                          const { w, d } = formatDateTab(date);
                          const isSelected = idx === selectedDateIndex;
                          const isToday = idx === 0;

                          // Opcional: mostrar bolinha se tiver slot livre nesse dia
                          const hasFreeSlots = activeSlots.some(s => s.dayOfWeek === date.getDay() && (!s.status || s.status === 'available'));

                          return (
                            <button
                              key={idx}
                              onClick={() => { setSelectedDateIndex(idx); setSelectedSlotId(null); }}
                              className={clsx(
                                "flex flex-col items-center justify-center min-w-[70px] py-3 rounded-2xl border transition-all relative overflow-hidden",
                                isSelected ? "shadow-lg scale-105 z-10" : ""
                              )}
                              style={{
                                background: isSelected ? schedulingStyle.primary : (schedulingStyle.itemCardStyle.background as string),
                                borderColor: isSelected ? schedulingStyle.primary : (schedulingStyle.itemCardStyle.border?.split(' ').pop() || theme.border),
                                color: isSelected ? pickReadableOn(schedulingStyle.primary) : schedulingStyle.textColor
                              }}
                            >
                              <span className="text-[9px] font-black uppercase tracking-widest opacity-60 text-inherit">{isToday ? 'HOJE' : w}</span>
                              <span className="text-sm font-bold mt-0.5 text-inherit">{d}</span>

                              {/* Indicador de slots livres */}
                              {hasFreeSlots && !isSelected && (
                                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Lista de Slots do Dia */}
                      <div className="space-y-3 min-h-[200px]">
                        <div className="flex items-center justify-between px-1">
                          <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center gap-2" style={{ color: theme.text }}>
                            Horários para {DAYS_OF_WEEK[selectedDayOfWeek]} {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                          </h4>
                          <div className="text-[9px] font-bold opacity-40" style={{ color: theme.text }}>
                            {mapDaySlots.length} Horários
                          </div>
                        </div>

                        {mapDaySlots.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {mapDaySlots.map(slot => {
                              const isBooked = slot.status === 'booked';
                              const isPending = slot.status === 'pending';
                              const isAvailable = !slot.status || slot.status === 'available';

                              return (
                                <button
                                  key={slot.id}
                                  disabled={!isAvailable}
                                  onClick={() => isAvailable && setSelectedSlotId(slot.id)}
                                  className={clsx(
                                    "p-3 rounded-xl border transition-all text-left group relative overflow-hidden",
                                    isAvailable
                                      ? (selectedSlotId === slot.id
                                        ? "scale-[1.02] shadow-xl"
                                        : "opacity-80 hover:opacity-100"
                                      )
                                      : "opacity-40 cursor-not-allowed grayscale bg-black/20"
                                  )}
                                  style={isAvailable ? {
                                    borderColor: selectedSlotId === slot.id ? schedulingStyle.primary : (schedulingStyle.itemCardStyle.border?.split(' ').pop() || theme.border),
                                    background: selectedSlotId === slot.id ? schedulingStyle.primary : (schedulingStyle.itemCardStyle.background as string),
                                    color: selectedSlotId === slot.id ? pickReadableOn(schedulingStyle.primary) : schedulingStyle.textColor
                                  } : { borderColor: 'transparent' }}
                                >
                                  <div className={clsx("text-[9px] font-black uppercase", selectedSlotId === slot.id ? "opacity-90" : "opacity-50")}>
                                    {DAYS_OF_WEEK[slot.dayOfWeek]}
                                  </div>
                                  <div className="text-sm font-bold mt-0.5">{slot.startTime} - {slot.endTime}</div>

                                  {/* Status Text & Overlays */}
                                  {selectedSlotId === slot.id && (
                                    <LucideIcons.CheckCircle2 className="absolute top-2 right-2 opacity-50" size={14} />
                                  )}

                                  {isPending && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-amber-500 space-y-1">
                                      <LucideIcons.Clock size={16} className="animate-pulse" />
                                      <span className="text-[8px] font-black uppercase tracking-widest text-center px-2">Aguardando<br />Confirmação</span>
                                    </div>
                                  )}

                                  {isBooked && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-zinc-500 space-y-1">
                                      <LucideIcons.Lock size={16} />
                                      <span className="text-[8px] font-black uppercase tracking-widest">Reservado</span>
                                      {slot.bookedBy && (
                                        <span className="text-[8px] font-bold text-zinc-400 truncate w-[90%] text-center px-1">
                                          {slot.bookedBy.split('(')[0].trim()}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-10 opacity-40 space-y-3" style={{ color: theme.text }}>
                            <LucideIcons.CalendarX size={32} />
                            <p className="text-xs italic text-center max-w-[200px]">
                              Nenhum horário disponível para esta data.
                            </p>
                          </div>
                        )}
                      </div>

                      <button
                        disabled={!selectedSlotId}
                        onClick={() => setShowBookingModal(true)}
                        className={clsx(
                          "w-full rounded-xl p-4 font-black text-xs uppercase tracking-widest transition-all button-font shadow-lg mt-2",
                          !selectedSlotId ? "opacity-30 cursor-not-allowed bg-zinc-800 text-zinc-500" : "hover:scale-[1.01] active:scale-95"
                        )}
                        style={selectedSlotId ? schedulingStyle.buttonStyle : {}}
                      >
                        {selectedSlotId ? 'Continuar para Confirmação' : 'Selecione um horário acima'}
                      </button>
                    </div>
                  )}
                </section>
              )}

              {/* Booking Modal */}
              {showBookingModal && selectedSlotId && (
                <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                  <div className="w-full max-w-sm border rounded-3xl p-6 space-y-5 shadow-2xl animate-in slide-in-from-bottom-5 duration-300"
                    style={{ background: theme.cardBg, borderColor: theme.border }}
                    onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-black" style={{ color: theme.text }}>Finalizar Agendamento</h4>
                        <p className="text-xs" style={{ color: theme.muted }}>Informe seus dados para confirmar a reserva.</p>
                      </div>
                      <button onClick={() => setShowBookingModal(false)} className="p-2 hover:bg-white/5 rounded-full text-zinc-400"><LucideIcons.X size={20} /></button>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl border flex items-center gap-3" style={schedulingStyle.itemCardStyle}>
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${schedulingStyle.primary}20`, color: schedulingStyle.primary }}>
                          <LucideIcons.CalendarClock size={20} />
                        </div>
                        <div>
                          {(() => {
                            const slot = activeSlots.find(s => s.id === selectedSlotId);
                            return slot ? (
                              <>
                                <div className="text-xs font-black uppercase opacity-60" style={{ color: schedulingStyle.textColor }}>{DAYS_OF_WEEK[slot.dayOfWeek]}</div>
                                <div className="text-sm font-bold" style={{ color: schedulingStyle.textColor }}>{slot.startTime} - {slot.endTime}</div>
                              </>
                            ) : null;
                          })()}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Seu Nome <span className="text-zinc-700 font-normal normal-case">(Opcional)</span></label>
                        <input
                          value={bookingName}
                          onChange={e => setBookingName(e.target.value)}
                          placeholder="Como você se chama?"
                          style={schedulingStyle.inputStyle}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">WhatsApp <span className="text-zinc-700 font-normal normal-case">(Opcional para confirmação)</span></label>
                        <input
                          value={bookingContact}
                          onChange={e => setBookingContact(e.target.value)}
                          placeholder="(00) 00000-0000"
                          style={schedulingStyle.inputStyle}
                        />
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        if (isPreview) {
                          alert('Modo Preview: Agendamento simulado!');
                          setShowBookingModal(false);
                          return;
                        }

                        const slot = activeSlots.find(s => s.id === selectedSlotId);
                        const dayName = slot ? DAYS_OF_WEEK[slot.dayOfWeek] : '';
                        const time = slot ? slot.startTime : '';
                        const dateFormatted = selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

                        // WhatsApp Direct Flow if empty fields
                        if ((!bookingName.trim() || !bookingContact.trim()) && profile.bookingWhatsapp) {
                          const text = encodeURIComponent(`Olá! Quero agendar para ${dayName} ${dateFormatted} às ${time} pelo PageFlow.`);
                          window.open(`https://wa.me/${profile.bookingWhatsapp}?text=${text}`, '_blank');
                        }

                        // Submit logic via API
                        const ts = new Date().toISOString();
                        const bookingDetails = `${bookingName} (${bookingContact})`;

                        try {
                          // 1. Create Lead
                          await leadsApi.create({
                            clientId: profile.clientId,
                            profileId: profile.id,
                            name: bookingName || 'Cliente Via WhatsApp',
                            contact: bookingContact || 'Direto no Zap',
                            message: `Agendamento solicitado para slot ID: ${selectedSlotId}`,
                            status: 'novo',
                            source: source || 'agendamento',
                            captureType: 'form'
                          });

                          // 2. Update Slot
                          await schedulingApi.updateSlotStatus(selectedSlotId, 'pending', {
                            bookedBy: bookingDetails,
                            bookedAt: ts
                          });

                          setBookingSuccess(true);
                          setShowBookingModal(false);
                          alert("Solicitação de agendamento enviada com sucesso!");
                        } catch (err) {
                          console.error("Booking error:", err);
                          alert("Erro ao processar agendamento.");
                        }
                      }}
                      className="w-full py-5 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                      style={schedulingStyle.buttonStyle}
                    >
                      Solicitar Agendamento <LucideIcons.ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Full Schedule Modal */}
              {showFullSchedule && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
                  <div className="border rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300"
                    style={{ background: theme.cardBg, borderColor: theme.border }}
                    onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-900/50">
                      <div className="flex items-center gap-3">
                        <LucideIcons.LayoutGrid size={24} style={{ color: schedulingStyle.primary }} />
                        <div>
                          <h3 className="text-xl font-black" style={{ color: theme.text }}>Agenda Completa</h3>
                          <p className="text-xs font-medium" style={{ color: theme.muted }}>Próximos 7 dias</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowFullSchedule(false)}
                        className="p-2 hover:bg-white/10 rounded-full text-zinc-400 transition-colors"
                      >
                        <LucideIcons.X size={24} />
                      </button>
                    </div>

                    <div className="overflow-y-auto p-4 sm:p-6 flex-1" style={{ background: theme.cardBg }}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                        {next7Days.map((date, dayIdx) => {
                          const { w, d } = formatDateTab(date);
                          const daySlots = activeSlots
                            .filter(s => s.dayOfWeek === date.getDay())
                            .sort((a, b) => a.startTime.localeCompare(b.startTime));

                          return (
                            <div key={dayIdx} className="rounded-2xl border overflow-hidden flex flex-col h-full min-h-[150px]" style={schedulingStyle.itemCardStyle}>
                              <div
                                className={clsx(
                                  "p-3 text-center border-b font-black uppercase tracking-widest text-xs",
                                  dayIdx !== 0 && "opacity-60"
                                )}
                                style={{
                                  backgroundColor: dayIdx === 0 ? `${schedulingStyle.primary}20` : 'transparent',
                                  color: dayIdx === 0 ? schedulingStyle.primary : schedulingStyle.textColor,
                                  borderColor: `${schedulingStyle.primary}10`
                                }}
                              >
                                {dayIdx === 0 ? 'Hoje' : w} <span className="ml-1" style={{ color: schedulingStyle.textColor }}>{d}</span>
                              </div>
                              <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[300px] sm:max-h-none no-scrollbar">
                                {daySlots.length > 0 ? (
                                  daySlots.map(slot => {
                                    const isBooked = slot.status === 'booked';
                                    const isPending = slot.status === 'pending';
                                    const isAvailable = !slot.status || slot.status === 'available';

                                    return (
                                      <button
                                        key={slot.id}
                                        disabled={!isAvailable}
                                        onClick={() => {
                                          if (isAvailable) {
                                            setSelectedDateIndex(dayIdx);
                                            setSelectedSlotId(slot.id);
                                            setShowFullSchedule(false);
                                          }
                                        }}
                                        className={clsx(
                                          "w-full p-2 rounded-lg text-xs font-bold border transition-all relative overflow-hidden text-center",
                                          isAvailable
                                            ? "hover:opacity-80"
                                            : "opacity-40 cursor-not-allowed grayscale bg-black/40 text-zinc-600 border-transparent"
                                        )}
                                        style={isAvailable ? {
                                          background: (schedulingStyle.itemCardStyle.background as string),
                                          borderColor: (schedulingStyle.itemCardStyle.border?.split(' ').pop() || theme.border),
                                          color: schedulingStyle.textColor
                                        } : {}}
                                      >
                                        {slot.startTime}
                                        {isBooked && <LucideIcons.Lock size={10} className="absolute top-1 right-1 opacity-50" />}
                                        {isPending && <LucideIcons.Clock size={10} className="absolute top-1 right-1 opacity-50 text-amber-500" />}
                                      </button>
                                    )
                                  })
                                ) : (
                                  <div className="h-full flex items-center justify-center text-[10px] text-zinc-600 font-bold uppercase tracking-widest opacity-50 py-4">
                                    - Sem Vagas -
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="p-4 border-t border-white/5 bg-zinc-900/50 text-center text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                      Selecione um horário para agendar
                    </div>
                  </div>
                </div>
              )}

              {/* PIX */}
              {hasPixAccess && profile.pixKey && (
                <section className={clsx(
                  "p-6 space-y-4",
                  isStack ? "rounded-[2rem] shadow-xl backdrop-blur-md" : "rounded-2xl"
                )} style={pixStyle.container}>
                  <div className="flex items-center justify-between min-h-[40px] py-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-70 heading-font whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: pixStyle.titleColor, lineHeight: '1.3' }}>
                        PIX
                      </div>
                      <div className="text-sm font-black mt-1 body-font" style={{ color: pixStyle.textColor }}>
                        {profile.pixKey}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (isPreview) return;
                        navigator.clipboard?.writeText(profile.pixKey || '');
                        trackEvent({
                          clientId: profile.clientId,
                          profileId: profile.id,
                          type: 'pix_copied',
                          assetId: 'pix',
                          assetType: 'pix',
                          assetLabel: 'Chave Pix',
                          source,
                          utm
                        });

                        alert('Chave Pix copiada!');
                      }}
                      className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest button-font shadow-lg transition-all hover:scale-[1.02] active:scale-95"
                      style={pixStyle.buttonStyle}
                    >
                      Copiar
                    </button>
                  </div>
                </section>
              )}

              {/* Catalog */}
              {hasCatalogAccess && activeCatalog.length > 0 && (
                <section className={clsx(
                  "space-y-6 w-full p-6 sm:p-8 animate-in fade-in duration-1000",
                  isStack ? "rounded-[2rem] shadow-xl backdrop-blur-md" : (catalogStyle.effectiveStyle === 'minimal' ? "" : "rounded-2xl")
                )} style={catalogStyle.container}>
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-2">
                    <h3 className="text-[12px] font-black uppercase tracking-[0.3em] heading-font" style={{ color: catalogStyle.titleColor }}>
                      Selection / <span className="opacity-40 font-medium">Catalog</span>
                    </h3>
                    <div className="flex items-center gap-3">
                      {activeCatalog.length > 1 && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => scrollModule(catalogScrollRef, 'prev')}
                            className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                          >
                            <LucideIcons.ChevronLeft size={16} />
                          </button>
                          <button
                            onClick={() => scrollModule(catalogScrollRef, 'next')}
                            className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                          >
                            <LucideIcons.ChevronRight size={16} />
                          </button>
                        </div>
                      )}
                      <div className="flex gap-1 ml-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                      </div>
                    </div>
                  </div>

                  <div
                    ref={catalogScrollRef}
                    className="flex gap-0 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-6 -mx-6 px-6 sm:mx-0 sm:px-0"
                  >
                    {activeCatalog.map((item, idx) => {
                      const ctaBtn = buttons.find((b: any) => b.type === 'whatsapp' && b.enabled);
                      const whatsNumber = (ctaBtn as any)?.value || '';
                      let ctaHref = item.ctaLink || '#';
                      if (!ctaHref.includes('wa.me') && !ctaHref.includes('whatsapp.com') && whatsNumber) {
                        const text = encodeURIComponent(`Olá! Tenho interesse em "${item.title}" que vi no seu perfil PageFlow.`);
                        ctaHref = `https://wa.me/${whatsNumber.replace(/\D/g, '')}?text=${text}`;
                      }

                      return (
                        <div
                          key={item.id}
                          className={clsx(
                            "group relative flex-none w-full snap-start flex flex-col hover-kinetic animate-kinetic pr-5 px-4",
                            `delay-${(idx % 8) + 1}`
                          )}
                        >
                          {/* Image Container with Floating Price */}
                          <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900 border border-white/5 transition-all group-hover:border-white/20 rounded-2xl">
                            <img
                              src={item.imageUrl || ''}
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Price Tag Overlay - Kinetic Style */}
                            {item.priceText && (
                              <div className="absolute top-0 right-0 p-3 z-10">
                                <div className="bg-black/90 backdrop-blur-md px-3 py-1.5 border border-white/10 text-[10px] font-black tracking-widest text-white shadow-2xl skew-x-[-12deg]">
                                  <div className="skew-x-[12deg]">{item.priceText}</div>
                                </div>
                              </div>
                            )}

                            {/* View Action Overlay */}
                            <button
                              onClick={() => {
                                if (item.imageUrl) setSelectedCatalogItem(item);
                                if (!isPreview) {
                                  trackEvent({
                                    clientId: profile.clientId,
                                    profileId: profile.id,
                                    type: 'catalog_zoom',
                                    assetId: item.id,
                                    assetType: 'catalog',
                                    assetLabel: item.title,
                                    source,
                                    utm
                                  });
                                }
                              }}
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 z-20 cursor-zoom-in"
                            >
                              <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white scale-50 group-hover:scale-100 transition-transform rounded-full">
                                <LucideIcons.Maximize2 size={20} />
                              </div>
                            </button>
                          </div>

                          {/* Content Details */}
                          <div className="mt-4 space-y-2">
                            <div className="flex items-start justify-between gap-4">
                              <h4
                                className="font-black text-sm sm:text-lg tracking-tight leading-tight heading-font uppercase"
                                style={{ color: catalogStyle.textColor }}
                              >
                                {item.title}
                              </h4>
                              <div className="h-px bg-white/10 flex-1 mt-3" />
                            </div>

                            {item.description && (
                              <p className="text-[10px] sm:text-xs opacity-60 leading-relaxed body-font line-clamp-2" style={{ color: catalogStyle.textColor }}>
                                {item.description}
                              </p>
                            )}

                            <div className="pt-2">
                              <a
                                href={isPreview ? '#' : ctaHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => {
                                  if (!isPreview) {
                                    trackEvent({
                                      clientId: profile.clientId,
                                      profileId: profile.id,
                                      type: 'catalog_cta_click',
                                      assetId: item.id,
                                      assetType: 'catalog',
                                      assetLabel: item.title,
                                      source,
                                      utm
                                    });
                                  }
                                }}
                                className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] border-b-2 transition-all hover:gap-4 button-font"
                                style={{
                                  borderColor: catalogStyle.primary,
                                  color: catalogStyle.textColor
                                }}
                              >
                                {item.ctaLabel || 'Discover'}
                                <LucideIcons.ArrowRight size={14} style={{ color: catalogStyle.primary }} />
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Portfolio */}
              {hasPortfolioAccess && activePortfolio.length > 0 && (
                <section className={clsx(
                  "space-y-3 w-full p-6",
                  isStack ? "rounded-[2rem] shadow-xl backdrop-blur-md" : "rounded-2xl"
                )} style={{ ...portfolioStyle.container, overflow: 'visible' }}>
                  <div className="flex items-center justify-between min-h-[40px] py-3 mb-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-70 heading-font whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: portfolioStyle.titleColor, lineHeight: '1.4', minHeight: '1.4em' }}>Portfólio</h3>
                    {activePortfolio.length > 1 && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => scrollModule(portfolioScrollRef, 'prev')}
                          className="p-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                        >
                          <LucideIcons.ChevronLeft size={14} />
                        </button>
                        <button
                          onClick={() => scrollModule(portfolioScrollRef, 'next')}
                          className="p-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                        >
                          <LucideIcons.ChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div
                    ref={portfolioScrollRef}
                    className="flex gap-0 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-6 px-6 sm:mx-0 sm:px-0"
                  >
                    {activePortfolio.map((item, idx) => (
                      <div key={item.id} className="flex-none w-full snap-start pr-5 px-2">
                        <button
                          key={item.id}
                          onClick={() => {
                            setSelectedImage(item.imageUrl);
                            if (!isPreview) {
                              trackEvent({
                                clientId: profile.clientId,
                                profileId: profile.id,
                                type: 'portfolio_click',
                                assetId: item.id,
                                assetType: 'portfolio',
                                assetLabel: item.title && item.title.trim() ? item.title : `Foto #${idx + 1}`,
                                source,
                                utm
                              });
                            }
                          }}
                          className={clsx(
                            "w-full rounded-[2rem] overflow-hidden border group relative aspect-[4/5] transition-all hover:scale-[1.02] duration-500",
                            `animate-in fade-in slide-in-from-bottom-5 delay-${(idx % 8) + 1}`
                          )}
                          style={{
                            ...portfolioStyle.itemCardStyle,
                            borderColor: portfolioStyle.primary,
                            boxShadow: '0 20px 40px -20px rgba(0,0,0,0.5)'
                          }}
                        >
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />

                          {/* Title Overlay - Minimal Glass */}
                          {item.title && (
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 translate-y-2 group-hover:translate-y-0 transition-transform">
                              <div className="text-[10px] font-black text-white uppercase tracking-[0.2em] leading-tight">{item.title}</div>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-20">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform">
                              <LucideIcons.Maximize2 size={20} />
                            </div>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Videos */}
              {hasVideosAccess && activeVideos.length > 0 && (
                <section className={clsx(
                  "space-y-3 w-full p-6",
                  isStack ? "rounded-[2rem] shadow-xl backdrop-blur-md" : "rounded-2xl"
                )} style={{ ...videosStyle.container, overflow: 'visible' }}>
                  <div className="flex items-center justify-between min-h-[40px] py-3 mb-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-70 heading-font whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: videosStyle.titleColor, lineHeight: '1.4', minHeight: '1.4em' }}>Vídeos</h3>
                    {activeVideos.length > 1 && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => scrollModule(videosScrollRef, 'prev')}
                          className="p-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                        >
                          <LucideIcons.ChevronLeft size={14} />
                        </button>
                        <button
                          onClick={() => scrollModule(videosScrollRef, 'next')}
                          className="p-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                        >
                          <LucideIcons.ChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div
                    ref={videosScrollRef}
                    className="flex gap-0 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-6 -mx-6 px-6 sm:mx-0 sm:px-0"
                  >
                    {activeVideos.map((v, idx) => {
                      const id = extractYouTubeId(v.url);
                      return (
                        <div key={v.id} className={clsx(
                          "flex-none w-full snap-start space-y-4 group animate-in fade-in slide-in-from-right-10 pr-5 px-2",
                          `delay-${(idx % 8) + 1}`
                        )}>
                          <div className="rounded-3xl overflow-hidden bg-black aspect-video relative group border shadow-2xl transition-all duration-500 hover:scale-[1.01]"
                            style={{ borderColor: videosStyle.primary, boxShadow: `0 20px 50px -20px ${videosStyle.primary}40` }}>
                            <button
                              onClick={() => {
                                if (id) setSelectedVideoUrl(`https://www.youtube.com/embed/${id}?autoplay=1`);
                                if (!isPreview) {
                                  trackEvent({
                                    clientId: profile.clientId,
                                    profileId: profile.id,
                                    type: 'video_view',
                                    assetId: v.id,
                                    assetType: 'video',
                                    assetLabel: v.title && v.title.trim() ? v.title : `Vídeo ${idx + 1}`,
                                    source,
                                    utm
                                  });

                                }
                              }}
                              className="w-full h-full"
                            >
                              <img src={`https://img.youtube.com/vi/${id}/maxresdefault.jpg`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700" alt={v.title} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/30 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-500 shadow-2xl">
                                  <LucideIcons.Play size={32} className="text-white fill-white ml-1" />
                                </div>
                              </div>
                            </button>
                          </div>
                          {v.title && (
                            <div className="px-2 text-center">
                              <h4 className="font-black text-sm sm:text-lg tracking-tighter heading-font uppercase italic leading-none" style={{ color: videosStyle.textColor }}>
                                {v.title}
                              </h4>
                              <div className="w-8 h-1 bg-current mt-2 opacity-20 mx-auto" style={{ color: videosStyle.primary }} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Lead Capture */}
              {hasLeadCaptureAccess && profile.enableLeadCapture && (
                <section className={clsx(
                  "p-6 space-y-4",
                  isStack ? "rounded-[2rem] shadow-xl backdrop-blur-md" : "rounded-2xl"
                )} style={leadCaptureStyle.container}>
                  <div className="flex items-center justify-between min-h-[40px] py-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-70 heading-font whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: leadCaptureStyle.titleColor, lineHeight: '1.3' }}>Fale Comigo</h3>
                    <LucideIcons.MessageSquareText size={18} style={{ color: leadCaptureStyle.primary }} />
                  </div>
                  {leadSent ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-in zoom-in-95 duration-500">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                        <LucideIcons.Check size={32} />
                      </div>
                      <div className="text-sm font-black uppercase tracking-widest body-font text-center" style={{ color: leadCaptureStyle.textColor }}>
                        Mensagem Recebida!<br />
                        <span className="opacity-50 text-[10px] font-medium lowecase">Entrarei em contato em breve.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <input
                          value={leadName}
                          onChange={e => setLeadName(e.target.value)}
                          placeholder="Seu nome"
                          className="w-full rounded-2xl p-4 outline-none text-sm font-bold body-font border-b-2 transition-all"
                          style={{
                            ...leadCaptureStyle.inputStyle,
                            borderBottomColor: `${leadCaptureStyle.primary}20`
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <input
                          value={leadContact}
                          onChange={e => setLeadContact(e.target.value)}
                          placeholder="WhatsApp ou E-mail"
                          className="w-full rounded-2xl p-4 outline-none text-sm font-bold body-font border-b-2 transition-all"
                          style={{
                            ...leadCaptureStyle.inputStyle,
                            borderBottomColor: `${leadCaptureStyle.primary}20`
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <textarea
                          value={leadMessage}
                          onChange={e => setLeadMessage(e.target.value)}
                          placeholder="Sua mensagem..."
                          className="w-full rounded-2xl p-4 outline-none text-sm font-bold body-font min-h-[100px] border-b-2 transition-all resize-none"
                          style={{
                            ...leadCaptureStyle.inputStyle,
                            borderBottomColor: `${leadCaptureStyle.primary}20`
                          }}
                        />
                      </div>
                      <button
                        onClick={submitLead}
                        className="w-full rounded-2xl p-5 font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 button-font shadow-2xl flex items-center justify-center gap-2 group"
                        style={leadCaptureStyle.buttonStyle}
                      >
                        Enviar Mensagem
                        <LucideIcons.Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </button>
                    </div>
                  )}
                </section>
              )}

              {/* NPS */}
              {hasNpsAccess && profile.enableNps && (
                <section className={clsx(
                  "p-6 space-y-4",
                  isStack ? "rounded-[2rem] shadow-xl backdrop-blur-md" : "rounded-2xl"
                )} style={npsStyle.container}>
                  <div className="flex items-center justify-between min-h-[40px] py-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-70 heading-font whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: npsStyle.titleColor, lineHeight: '1.3' }}>Avaliação</h3>
                    <LucideIcons.Star size={18} style={{ color: npsStyle.primary }} />
                  </div>
                  {npsSent ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-in zoom-in-95 duration-500">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                        <LucideIcons.Check size={32} />
                      </div>
                      <div className="text-sm font-black uppercase tracking-widest body-font text-center" style={{ color: npsStyle.textColor }}>
                        Agradecemos seu feedback!<br />
                        <span className="opacity-50 text-[10px] font-medium lowecase">Sua opinião é vital para nós.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <p className="text-[10px] font-black uppercase text-center tracking-[0.3em] opacity-40 italic" style={{ color: npsStyle.textColor }}>O quanto você nos recomendaria?</p>

                      <div className="flex flex-wrap justify-center gap-2">
                        {Array.from({ length: 11 }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setNpsScore(i)}
                            className={clsx(
                              "w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xs sm:text-sm font-black border transition-all duration-300 button-font",
                              npsScore === i ? "scale-110 shadow-2xl z-10" : "opacity-60 hover:opacity-100 hover:scale-[1.05]"
                            )}
                            style={{
                              borderColor: npsScore === i ? npsStyle.primary : theme.border,
                              background: npsScore === i ? npsStyle.primary : 'rgba(255,255,255,0.03)',
                              color: npsScore === i ? npsStyle.buttonTextColor : npsStyle.textColor,
                              boxShadow: npsScore === i ? `0 10px 30px -5px ${npsStyle.primary}60` : 'none'
                            }}
                          >
                            {i}
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={npsComment}
                        onChange={e => setNpsComment(e.target.value)}
                        placeholder="Opcional: Deixe um comentário..."
                        className="w-full rounded-xl p-3 outline-none text-sm font-semibold body-font min-h-[60px]"
                        style={npsStyle.inputStyle}
                      />

                      <div className="flex items-center gap-3 py-1 cursor-pointer group" onClick={() => setNpsRequestContact(!npsRequestContact)}>
                        <div
                          className={clsx(
                            "w-5 h-5 rounded-lg border flex items-center justify-center transition-all",
                            npsRequestContact ? "shadow-[0_0_10px_rgba(0,242,255,0.3)]" : ""
                          )}
                          style={{
                            borderColor: npsRequestContact ? npsStyle.primary : theme.border,
                            backgroundColor: npsRequestContact ? npsStyle.primary : 'transparent'
                          }}
                        >
                          {npsRequestContact && <LucideIcons.Check size={12} style={{ color: npsStyle.buttonTextColor }} strokeWidth={4} />}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity" style={{ color: npsStyle.textColor }}>Quero receber retorno</span>
                      </div>

                      {npsRequestContact && (
                        <div className="space-y-2 pt-1 animate-in slide-in-from-top-2 duration-300">
                          <input
                            value={npsName}
                            onChange={e => setNpsName(e.target.value)}
                            placeholder="Seu nome"
                            className="w-full rounded-xl p-3 outline-none text-sm font-semibold body-font"
                            style={npsStyle.inputStyle}
                          />
                          <input
                            value={npsContact}
                            onChange={e => setNpsContact(e.target.value)}
                            placeholder="WhatsApp ou E-mail"
                            className="w-full rounded-xl p-3 outline-none text-sm font-semibold body-font"
                            style={npsStyle.inputStyle}
                          />
                        </div>
                      )}

                      <button
                        onClick={() => submitNps()}
                        className="w-full rounded-xl p-4 font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 button-font shadow-xl mt-2"
                        style={{
                          ...npsStyle.buttonStyle,
                          opacity: npsScore === null ? 0.5 : 1
                        }}
                      >
                        Avaliar
                      </button>
                    </div>
                  )}
                </section>
              )}

              {/* Footer Logo */}
              {!profile.hideBranding && (
                <div className={clsx(
                  "w-full flex justify-center pb-8 pt-4",
                  isStack ? "p-6 rounded-[2rem] shadow-xl backdrop-blur-md" : ""
                )} style={isStack ? { background: theme.cardBg, border: `${borderWidth} solid ${theme.border}` } : {}}>
                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-transform hover:scale-105 active:scale-95 opacity-100"
                  >
                    <img src="/logo.png" alt="PageFlow" className="h-10 opacity-100" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {
        showWalletModal && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowWalletModal(false)}>
            <div className="w-full max-w-[500px] rounded-3xl bg-zinc-950 p-6 space-y-4 border border-white/10" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center text-white font-black">
                <span>Salvar Contato</span>
                <button onClick={() => setShowWalletModal(false)}><LucideIcons.X size={20} /></button>
              </div>
              <button onClick={downloadVCard} className="w-full py-4 rounded-2xl font-black uppercase text-xs" style={{ background: theme.primary, color: primaryTextOnPrimary }}>Baixar vCard</button>
            </div>
          </div>
        )
      }

      {/* Catalog Item Modal: Kinetic Zoom */}
      {selectedCatalogItem && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300" onClick={() => setSelectedCatalogItem(null)}>
          <div className="absolute inset-0 bg-black/98 backdrop-blur-xl" />

          <div
            className="relative w-full max-w-5xl bg-[#050505] border border-white/10 rounded-sm overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-500"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedCatalogItem(null)}
              className="absolute top-4 right-4 z-40 p-3 bg-black/50 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all border border-white/5 backdrop-blur-md"
            >
              <LucideIcons.X size={20} />
            </button>

            {/* Image Side */}
            <div className="w-full md:w-3/5 aspect-square md:aspect-auto bg-zinc-900 flex items-center justify-center relative group">
              <img
                src={selectedCatalogItem.imageUrl || ''}
                className="w-full h-full object-contain"
                alt={selectedCatalogItem.title}
              />
              <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-white/40">
                Visual Inspection / HQ Mode
              </div>
            </div>

            {/* Info Side */}
            <div className="w-full md:w-2/5 p-8 sm:p-12 flex flex-col justify-center space-y-8 bg-zinc-950/50">
              <div className="space-y-4">
                <div
                  className="inline-flex px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[9px] font-black uppercase tracking-[0.2em]"
                >
                  {selectedCatalogItem.kind === 'service' ? 'Service / Provision' : 'Product / Asset'}
                </div>
                <h2 className="text-3xl sm:text-5xl font-black heading-font uppercase tracking-tighter italic">
                  {selectedCatalogItem.title}
                </h2>
                <div className="h-0.5 w-12 bg-blue-500" />
              </div>

              {selectedCatalogItem.priceText && (
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Market Value</div>
                  <div className="text-3xl font-black text-white tabular-nums">
                    {selectedCatalogItem.priceText}
                  </div>
                </div>
              )}

              {selectedCatalogItem.description && (
                <div className="space-y-2">
                  <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Description</div>
                  <p className="text-sm text-zinc-400 leading-relaxed body-font">
                    {selectedCatalogItem.description}
                  </p>
                </div>
              )}

              <div className="pt-4">
                {(() => {
                  const ctaBtn = buttons.find((b: any) => b.type === 'whatsapp' && b.enabled);
                  const whatsNumber = (ctaBtn as any)?.value || '';
                  let ctaHref = selectedCatalogItem.ctaLink || '#';
                  if (!ctaHref.includes('wa.me') && !ctaHref.includes('whatsapp.com') && whatsNumber) {
                    const text = encodeURIComponent(`Olá! Tenho interesse em "${selectedCatalogItem.title}" que vi no seu perfil PageFlow.`);
                    ctaHref = `https://wa.me/${whatsNumber.replace(/\D/g, '')}?text=${text}`;
                  }
                  return (
                    <a
                      href={isPreview ? '#' : ctaHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        if (isPreview) return;
                        trackEvent({
                          clientId: profile.clientId,
                          profileId: profile.id,
                          type: 'catalog_cta_click',
                          assetId: selectedCatalogItem.id,
                          assetType: 'catalog',
                          assetLabel: `CTA: ${selectedCatalogItem.title}`,
                          source,
                          utm
                        });
                      }}
                      className="group w-full py-5 px-8 bg-white text-black text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-between hover:bg-zinc-200 transition-all active:scale-95"
                    >
                      {selectedCatalogItem.ctaLabel || 'Acquire Now'}
                      <LucideIcons.ArrowRight size={18} className="translate-x-0 group-hover:translate-x-2 transition-transform" />
                    </a>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {
        selectedVideoUrl && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/95 p-4" onClick={() => setSelectedVideoUrl(null)}>
            <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden">
              <iframe src={selectedVideoUrl} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
            </div>
          </div>
        )
      }

      {
        selectedImage && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 p-4" onClick={() => setSelectedImage(null)}>
            <img src={selectedImage || ''} className="max-w-full max-h-[90vh] rounded-2xl object-contain" />
          </div>
        )
      }
    </div >
  );
});

export default PublicProfileRenderer;