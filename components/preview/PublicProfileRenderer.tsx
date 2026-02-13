"use client";

import React, { useState } from 'react';
import { Profile, AnalyticsSource, CatalogItem, PortfolioItem, YoutubeVideoItem, PlanType, SchedulingSlot } from '../../types';
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

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

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
  const hasSchedulingAccess = canAccessFeature(clientPlan, 'scheduling');

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

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
    trackEvent({ profileId: profile.id, clientId: profile.clientId, type: 'click', linkId: btnId });
  };

  const getButtonStyle = (_btn: any, index: number): React.CSSProperties => {
    const base: React.CSSProperties = {
      borderRadius: theme.radius,
      fontFamily: buttonFont,
      transition: 'all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      border: `1px solid ${theme.border}`,
      padding: '0.95rem 1.15rem',
      width: '100%',
      backgroundColor: theme.buttonStyle === 'solid' ? theme.primary : theme.cardBg,
      color: theme.buttonStyle === 'solid' ? primaryTextOnPrimary : theme.text,
      fontSize: '0.92rem',
      fontWeight: 800,
    };
    return base;
  };

  const renderLinks = () => {
    const activeButtons = (buttons || []).filter(b => b.enabled);
    return (
      <div className="w-full space-y-3">
        {activeButtons.map((btn, idx) => (
          <a
            key={btn.id}
            href={isPreview ? '#' : formatLink(btn.type, btn.value)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleLinkClick(btn.id)}
            style={getButtonStyle(btn, idx)}
            className="group flex items-center justify-between hover:translate-x-1"
          >
            <div className="font-black truncate">{btn.label}</div>
            <LucideIcons.ChevronRight size={12} className="opacity-40" />
          </a>
        ))}
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
        const text = encodeURIComponent(`Olá, gostaria de agendar um horário (${DAYS_OF_WEEK[slot.dayOfWeek]} das ${slot.startTime} às ${slot.endTime}) visto no seu perfil LinkFlow.`);
        window.open(`https://wa.me/${profile.bookingWhatsapp}?text=${text}`, '_blank');
      }
    }
  };

  const activeSlots = (profile.nativeSlots || []).filter(s => s.isActive);

  return (
    <div style={bgStyle} className="w-full flex flex-col items-center overflow-x-hidden no-scrollbar">
      <div className="relative z-10 w-full px-4 flex flex-col items-center pt-8">
        <main className="w-full max-w-[520px] p-6 space-y-6" style={shellCardStyle}>
          <header className="flex flex-col items-center text-center">
            <img src={profile.avatarUrl} className="w-24 h-24 rounded-full border-2 mb-4" style={{ borderColor: theme.border }} alt="" />
            <h1 className="text-2xl font-black" style={{ fontFamily: headingFont }}>{profile.displayName}</h1>
            <p className="text-sm opacity-70">{profile.headline}</p>
          </header>

          {renderLinks()}

          {/* AGENDAMENTO */}
          {hasSchedulingAccess && profile.enableScheduling && (
            <div className="mt-6 w-full p-6" style={proCardStyle}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Agenda e Horários</div>
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
                            selectedSlotId === slot.id ? "bg-white text-black border-white" : "bg-black/20 border-white/5 text-white/70"
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
                      Nenhum horário disponível para agendamento.
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
                  <div className="text-xs font-medium text-center opacity-60 mb-2">Selecione uma data para agendar.</div>
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

          {/* PIX */}
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
                >
                  Copiar
                </button>
              </div>
            </div>
          )}

          <footer className="mt-8 pt-4 border-t border-white/5 flex flex-col items-center">
            <img src="/logo.png" className="h-8 opacity-40" alt="PageFlow" />
          </footer>
        </main>
      </div>
    </div>
  );
};

export default PublicProfileRenderer;