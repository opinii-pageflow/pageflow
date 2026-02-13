"use client";

import React, { useState } from 'react';
import { Profile, AnalyticsSource, PlanType, SchedulingSlot } from '../../types';
import { formatLink } from '../../lib/linkHelpers';
import { trackEvent } from '../../lib/analytics';
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
  const hasSchedulingAccess = canAccessFeature(clientPlan, 'scheduling');
  const hasPixAccess = canAccessFeature(clientPlan, 'pix');

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);

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

  const handleSaveContact = () => {
    // 1. Extrair dados
    const name = profile.displayName || 'Contato LinkFlow';
    const headline = profile.headline || '';
    const url = window.location.origin + '/#/u/' + profile.slug;
    
    // Tentar encontrar telefone e email nos botões
    const phoneBtn = profile.buttons.find(b => b.enabled && (b.type === 'whatsapp' || b.type === 'phone' || b.type === 'mobile'));
    const emailBtn = profile.buttons.find(b => b.enabled && b.type === 'email');
    
    const phone = phoneBtn ? phoneBtn.value.replace(/\D/g, '') : '';
    const email = emailBtn ? emailBtn.value : '';

    // 2. Construir vCard content
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

    // 3. Trigger download
    const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${profile.slug}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <img src={profile.avatarUrl} className="w-24 h-24 rounded-full border-2 mb-4 object-cover" style={{ borderColor: theme.border }} alt="" />
            <h1 className="text-2xl font-black" style={{ fontFamily: headingFont }}>{profile.displayName}</h1>
            <p className="text-sm opacity-70 mt-1 max-w-[80%]">{profile.headline}</p>
          </header>

          {/* Ações de Contato / Wallet */}
          <div className="flex items-center gap-3 w-full">
            <button 
              onClick={handleSaveContact}
              className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 border hover:bg-white/5"
              style={{ borderColor: theme.border, color: theme.text }}
            >
              <LucideIcons.UserPlus size={14} />
              Salvar Contato
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

      {/* Wallet Modal (MVP) */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-sm rounded-[2rem] p-8 relative animate-in slide-in-from-bottom-10 duration-300">
            <button 
              onClick={() => setShowWalletModal(false)}
              className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white"
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
                  A integração nativa com Apple Wallet e Google Pay está em desenvolvimento. Por enquanto, utilize as opções abaixo para salvar o contato.
                </p>
              </div>

              <div className="w-full space-y-3">
                <button 
                  onClick={() => { handleSaveContact(); setShowWalletModal(false); }}
                  className="w-full py-4 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <LucideIcons.Download size={16} />
                  Baixar Arquivo vCard
                </button>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Dica Pro</p>
                  <p className="text-xs text-zinc-300">
                    No iPhone/Android, use a opção 
                    <span className="inline-flex items-center gap-1 mx-1 bg-white/10 px-1.5 py-0.5 rounded text-white">
                      <LucideIcons.Share size={10} /> Adicionar à Tela de Início
                    </span>
                    para criar um app do perfil.
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