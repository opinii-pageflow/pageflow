"use client";

import React, { useMemo, useState } from 'react';
import { Profile, AnalyticsSource, PlanType, CatalogItem, SchedulingSlot, ModuleType, UtmParams } from '../../types';
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

const PublicProfileRenderer: React.FC<Props> = ({ profile, isPreview, clientPlan, client, source = 'direct', utm }) => {
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

    let textColor = theme.text || '#ffffff';
    let titleColor = theme.text || '#ffffff';
    let mutedColor = theme.muted || 'rgba(255,255,255,0.6)';
    let inputBg = 'rgba(0,0,0,0.2)';
    let inputBorder = `${borderWidth} solid ${theme.border}`;
    let inputFocusBorder = `${borderWidth} solid ${primary}`;

    switch (effectiveStyle) {
      case 'minimal':
        containerStyle.background = 'transparent';
        containerStyle.border = 'none';
        containerStyle.boxShadow = 'none';
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
        transition: 'border-color 0.2s',
        outline: 'none'
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
    const vCardData = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${profile.displayName}`,
      `TITLE:${profile.headline}`,
      `NOTE:${profile.bioShort}`,
      `URL:${window.location.href}`,
      'END:VCARD'
    ].join('\n');

    const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${profile.slug}.vcf`);
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
                          linkId: 'pix_key',
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
                  "space-y-3 w-full p-6",
                  isStack ? "rounded-[2rem] shadow-xl backdrop-blur-md" : "rounded-2xl"
                )} style={{ ...catalogStyle.container, overflow: 'visible' }}>
                  <div className="flex items-center min-h-[40px] py-3 mb-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-70 heading-font whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: catalogStyle.titleColor, lineHeight: '1.4', minHeight: '1.4em' }}>
                      Catálogo
                    </h3>
                  </div>
                  <div className={clsx(
                    "grid gap-3",
                    isCardGrid ? "grid-cols-2" : "grid-cols-1"
                  )}>
                    {activeCatalog.map((item) => {
                      const profileLink = window.location.href;
                      const whatsBtn = buttons.find((b: any) => b.type === 'whatsapp' && b.enabled);
                      const whatsNumber = (whatsBtn as any)?.value || '';
                      let ctaHref = item.ctaLink || '#';
                      if (!ctaHref.includes('wa.me') && !ctaHref.includes('whatsapp.com') && whatsNumber) {
                        const text = encodeURIComponent(`Olá! Tenho interesse em "${item.title}" que vi no seu perfil PageFlow.`);
                        ctaHref = `https://wa.me/${whatsNumber.replace(/\D/g, '')}?text=${text}`;
                      }
                      return (
                        <div key={item.id} className={clsx(
                          "rounded-2xl p-4 transition-all hover:scale-[1.02]",
                          isCardGrid ? "flex flex-col gap-3" : "p-5"
                        )} style={catalogStyle.itemCardStyle}>
                          <div className={clsx(
                            "flex items-center text-left",
                            isCardGrid ? "flex-col text-center" : "gap-5"
                          )}>
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
                              className={clsx(
                                "rounded-xl overflow-hidden flex-shrink-0 border transition-transform",
                                isCardGrid ? "w-full aspect-square" : "w-24 h-24"
                              )}
                              style={{ borderColor: catalogStyle.primary }}
                            >
                              <img src={item.imageUrl || ''} alt={item.title} className="w-full h-full object-cover" />
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="font-black text-md truncate heading-font" style={{ color: catalogStyle.textColor }}>{item.title}</div>
                              <div className="text-sm font-black body-font" style={{ color: catalogStyle.primary }}>{item.priceText}</div>
                              {item.description && (
                                <p className="text-[10px] mt-1 line-clamp-2 opacity-70 body-font" style={{ color: catalogStyle.textColor }}>
                                  {item.description}
                                </p>
                              )}
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
                                className="text-[10px] font-black uppercase tracking-widest mt-2 inline-block px-3 py-1.5 button-font transition-all hover:scale-105 active:scale-95"
                                style={catalogStyle.buttonStyle}
                              >
                                {item.ctaLabel || 'Contatar'}
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
                  <div className="flex items-center min-h-[40px] py-3 mb-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-70 heading-font whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: portfolioStyle.titleColor, lineHeight: '1.4', minHeight: '1.4em' }}>Portfólio</h3>
                  </div>
                  <div className={clsx(
                    "grid gap-3",
                    isCardGrid ? "grid-cols-2" : "grid-cols-2"
                  )}>
                    {activePortfolio.map((item) => (
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
                              assetLabel: item.title,
                              source,
                              utm
                            });
                          }
                        }}
                        className="rounded-2xl overflow-hidden border group relative aspect-square transition-all hover:scale-105"
                        style={{
                          ...portfolioStyle.itemCardStyle,
                          borderColor: portfolioStyle.primary
                        }}
                      >
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        {item.title && (
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 backdrop-blur-sm z-10">
                            <div className="text-[9px] font-black text-white truncate uppercase tracking-widest">{item.title}</div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-20">
                          <LucideIcons.Search size={24} className="text-white" />
                        </div>
                      </button>
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
                  <div className="flex items-center min-h-[40px] py-3 mb-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-70 heading-font whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: videosStyle.titleColor, lineHeight: '1.4', minHeight: '1.4em' }}>Vídeos</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {activeVideos.map((v) => {
                      const id = extractYouTubeId(v.url);
                      return (
                        <div key={v.id} className="space-y-3">
                          <div className="rounded-2xl overflow-hidden bg-black aspect-video relative group border shadow-lg transition-all" style={{ borderColor: videosStyle.primary, boxShadow: videosStyle.shadowStyle }}>
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
                                    assetLabel: v.title,
                                    source,
                                    utm
                                  });
                                }
                              }}
                              className="w-full h-full"
                            >
                              <img src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt={v.title} />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                                  <LucideIcons.Play size={32} className="text-white fill-white ml-1" />
                                </div>
                              </div>
                            </button>
                          </div>
                          {v.title && (
                            <div className="px-1 text-center sm:text-left">
                              <h4 className="font-black text-sm tracking-tight heading-font" style={{ color: videosStyle.textColor }}>{v.title}</h4>
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
                  {leadSent ? <div className="text-sm font-bold body-font" style={{ color: leadCaptureStyle.textColor }}>✅ Mensagem registrada!</div> : (
                    <div className="space-y-2">
                      <input value={leadName} onChange={e => setLeadName(e.target.value)} placeholder="Seu nome" className="w-full rounded-xl p-3 outline-none text-sm font-semibold body-font focus:border-opacity-100" style={leadCaptureStyle.inputStyle} />
                      <input value={leadContact} onChange={e => setLeadContact(e.target.value)} placeholder="WhatsApp ou E-mail" className="w-full rounded-xl p-3 outline-none text-sm font-semibold body-font focus:border-opacity-100" style={leadCaptureStyle.inputStyle} />
                      <textarea value={leadMessage} onChange={e => setLeadMessage(e.target.value)} placeholder="Sua mensagem" className="w-full rounded-xl p-3 outline-none text-sm font-semibold body-font min-h-[80px] focus:border-opacity-100" style={leadCaptureStyle.inputStyle} />
                      <button onClick={submitLead} className="w-full rounded-xl p-3 font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 button-font shadow-lg" style={leadCaptureStyle.buttonStyle}>Enviar</button>
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
                  {npsSent ? <div className="text-sm font-bold body-font" style={{ color: npsStyle.textColor }}>⭐ Agradecemos seu feedback!</div> : (
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase text-center opacity-60" style={{ color: npsStyle.textColor }}>O quanto você nos recomendaria?</p>
                      <div className="grid grid-cols-11 gap-1">
                        {Array.from({ length: 11 }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setNpsScore(i)}
                            className={clsx(
                              "rounded-lg py-2 text-[10px] font-black border transition-all button-font",
                              npsScore === i ? "scale-110 shadow-lg" : "opacity-50 hover:opacity-100"
                            )}
                            style={{
                              borderColor: npsScore === i ? npsStyle.primary : theme.border,
                              background: npsScore === i ? npsStyle.primary : 'transparent',
                              color: npsScore === i ? npsStyle.buttonTextColor : npsStyle.textColor
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
                  <img src="/logo.png" alt="PageFlow" className="h-12 opacity-40" />
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

      {
        selectedCatalogItem && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 p-4" onClick={() => setSelectedCatalogItem(null)}>
            <img src={selectedCatalogItem.imageUrl || ''} className="max-w-full max-h-[80vh] rounded-2xl object-contain" />
          </div>
        )
      }

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
            <img src={selectedImage} className="max-w-full max-h-[90vh] rounded-2xl object-contain" />
          </div>
        )
      }
    </div >
  );
};

export default PublicProfileRenderer;