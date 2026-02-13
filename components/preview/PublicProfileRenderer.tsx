"use client";

import React, { useMemo, useState } from 'react';
import { Profile, AnalyticsSource, PlanType } from '../../types';
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

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const layout = (profile.layoutTemplate || 'Minimal Card').trim();

  const isGrid = ['Button Grid', 'Icon Grid', 'Two Columns', 'Creator', 'Magazine'].includes(layout);
  const isLeft = ['Avatar Left', 'Corporate', 'Split Header', 'Magazine'].includes(layout);
  const isBigAvatar = ['Big Avatar'].includes(layout);

  const headingFont = normalizeFontStack(fonts?.headingFont || 'Poppins');
  const bodyFont = normalizeFontStack(fonts?.bodyFont || 'Inter');
  const buttonFont = normalizeFontStack(fonts?.buttonFont || fonts?.bodyFont || 'Inter');

  const primaryTextOnPrimary = pickReadableOn(theme.primary);

  // ✅ Capa por template: altura e overlay (SEM apagar com opacity)
  const coverConfig = useMemo(() => {
    // valores padrão
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

    // layouts não focados: capa menor, overlay um pouco mais forte (mas imagem continua viva)
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
`;
    if (headline) vCard += `TITLE:${headline}\n`;
    if (phone) vCard += `TEL;TYPE=CELL:${phone}\n`;
    if (email) vCard += `EMAIL:${email}\n`;
    vCard += `URL:${url}\nEND:VCARD`;

    const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${name}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const showCover = !!(profile.coverImageUrl || (profile as any)?.coverUrl);
  const coverUrl = (profile.coverImageUrl || (profile as any)?.coverUrl || '').trim();
  const avatarUrl = (profile.avatarUrl || '').trim();

  const displayName = safeString(profile.displayName, 'Seu Nome');
  const headline = safeString(profile.headline, 'Sua headline / profissão');
  const bio = safeString((profile as any)?.bio, '');

  const buttonStyle = safeString(theme.buttonStyle, 'glass');

  const buttonBase = useMemo(() => {
    const base = 'w-full flex items-center gap-3 px-4 py-3 font-black text-[11px] uppercase tracking-[0.18em] transition-all active:scale-[0.99]';

    if (buttonStyle === 'solid') {
      return clsx(base, 'rounded-2xl');
    }

    if (buttonStyle === 'outline') {
      return clsx(base, 'rounded-2xl bg-transparent');
    }

    // glass default
    return clsx(base, 'rounded-2xl');
  }, [buttonStyle]);

  const buttonInlineStyle = useMemo(() => {
    if (buttonStyle === 'solid') {
      return {
        background: theme.primary,
        color: primaryTextOnPrimary,
        border: `1px solid ${theme.primary}`,
        boxShadow: '0 14px 30px rgba(0,0,0,0.25)',
        fontFamily: buttonFont,
      } as React.CSSProperties;
    }

    if (buttonStyle === 'outline') {
      return {
        background: 'transparent',
        color: theme.text,
        border: `1px solid ${theme.border}`,
        fontFamily: buttonFont,
      } as React.CSSProperties;
    }

    // glass
    return {
      background: 'rgba(255,255,255,0.06)',
      color: theme.text,
      border: `1px solid ${theme.border}`,
      backdropFilter: 'blur(20px)',
      fontFamily: buttonFont,
    } as React.CSSProperties;
  }, [buttonStyle, theme.primary, theme.text, theme.border, primaryTextOnPrimary, buttonFont]);

  const containerClass = useMemo(() => {
    if (isPreview) return 'w-full h-full';
    return 'min-h-screen w-full';
  }, [isPreview]);

  const innerClass = useMemo(() => {
    if (isPreview) return 'w-full h-full';
    return 'w-full max-w-lg mx-auto px-5 py-10';
  }, [isPreview]);

  const headerClass = useMemo(() => {
    if (layout === 'Split Header') return 'flex items-start gap-4';
    if (isLeft) return 'flex items-start gap-4';
    if (isBigAvatar) return 'flex flex-col items-center text-center';
    return 'flex flex-col items-center text-center';
  }, [layout, isLeft, isBigAvatar]);

  const avatarClass = useMemo(() => {
    if (isBigAvatar) return 'w-24 h-24 rounded-[2rem] border border-white/15 bg-white/5 overflow-hidden';
    if (layout === 'Split Header') return 'w-16 h-16 rounded-2xl border border-white/15 bg-white/5 overflow-hidden';
    if (isLeft) return 'w-16 h-16 rounded-2xl border border-white/15 bg-white/5 overflow-hidden';
    return 'w-20 h-20 rounded-[2.2rem] border border-white/15 bg-white/5 overflow-hidden';
  }, [layout, isLeft, isBigAvatar]);

  const titleWrapClass = useMemo(() => {
    if (layout === 'Split Header') return 'flex-1 pt-1';
    if (isLeft) return 'flex-1 pt-1';
    return 'w-full mt-4';
  }, [layout, isLeft]);

  const titleClass = useMemo(() => {
    return 'text-2xl font-black tracking-tight';
  }, []);

  const headlineClass = useMemo(() => {
    return 'text-sm font-bold text-white/70';
  }, []);

  const coverNode = showCover ? (
    <div className={clsx('w-full rounded-[2rem] overflow-hidden relative border border-white/10', coverConfig.heightClass)}>
      <img
        src={coverUrl}
        alt="Cover"
        className="w-full h-full object-cover"
        loading="lazy"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
      <div className={clsx('absolute inset-0 bg-gradient-to-b', coverConfig.overlay)} />
    </div>
  ) : null;

  const avatarNode = (
    <div className={avatarClass}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white/40">
          <LucideIcons.User size={28} />
        </div>
      )}
    </div>
  );

  const headerNode = (
    <div className={clsx(headerClass)}>
      {isLeft || layout === 'Split Header' ? avatarNode : null}

      <div className={clsx(titleWrapClass)}>
        <h1 className={titleClass} style={{ fontFamily: headingFont }}>
          {displayName}
        </h1>
        <div className={headlineClass} style={{ fontFamily: bodyFont }}>
          {headline}
        </div>

        {bio ? (
          <div className="mt-3 text-[13px] leading-relaxed text-white/70 font-semibold" style={{ fontFamily: bodyFont }}>
            {bio}
          </div>
        ) : null}

        {!isLeft && layout !== 'Split Header' ? (
          <div className="mt-5 flex justify-center">{avatarNode}</div>
        ) : null}
      </div>
    </div>
  );

  const enabledButtons = buttons.filter((b: any) => b?.enabled);

  const scheduling = (profile as any)?.scheduling || {};
  const pix = (profile as any)?.pix || {};

  const scheduleSlots = Array.isArray(scheduling?.slots) ? scheduling.slots : [];

  const openPixModal = () => {
    if (!hasPixAccess) return;
    setShowWalletModal(true);
  };

  const closePixModal = () => setShowWalletModal(false);

  const handleOpenLink = (url: string, btnId: string) => {
    handleLinkClick(btnId);
    if (isPreview) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderButtons = () => {
    if (!enabledButtons.length) {
      return (
        <div className="text-center text-white/45 text-xs font-black uppercase tracking-[0.18em]">
          Adicione botões no editor
        </div>
      );
    }

    const ButtonWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      if (layout === 'Two Columns') return <div className="grid grid-cols-2 gap-3">{children}</div>;
      if (layout === 'Icon Grid') return <div className="grid grid-cols-3 gap-3">{children}</div>;
      if (layout === 'Button Grid') return <div className="grid grid-cols-2 gap-3">{children}</div>;
      return <div className="space-y-3">{children}</div>;
    };

    return (
      <ButtonWrap>
        {enabledButtons.map((b: any) => {
          const Icon = getIcon(String(b.type || 'link'));
          const label = safeString(b.label, 'Link');
          const value = safeString(b.value, '');
          const href = formatLink(String(b.type || 'link'), value);

          const isIconOnly = layout === 'Icon Grid';
          const isGridLike = layout === 'Two Columns' || layout === 'Button Grid' || layout === 'Icon Grid';

          const shared = (
            <>
              <span
                className={clsx(
                  'w-8 h-8 rounded-xl flex items-center justify-center',
                  buttonStyle === 'solid' ? 'bg-black/10' : 'bg-white/10'
                )}
              >
                <Icon size={18} />
              </span>

              {!isIconOnly ? (
                <span className="flex-1 text-left leading-tight">
                  <span className="block">{label}</span>
                  {isGridLike ? null : (
                    <span className="block text-[10px] font-bold tracking-normal uppercase text-white/55 mt-1">
                      {value}
                    </span>
                  )}
                </span>
              ) : null}

              {!isIconOnly ? (
                <span className="text-white/40">
                  <LucideIcons.ChevronRight size={18} />
                </span>
              ) : null}
            </>
          );

          return (
            <button
              key={String(b.id)}
              type="button"
              className={buttonBase}
              style={buttonInlineStyle}
              onClick={() => {
                if (!href) return;
                handleOpenLink(href, String(b.id));
              }}
              title={label}
            >
              {shared}
            </button>
          );
        })}
      </ButtonWrap>
    );
  };

  const renderScheduling = () => {
    if (!hasSchedulingAccess) return null;
    if (!scheduleSlots.length) return null;

    const selected = scheduleSlots.find((s: any) => String(s.id) === String(selectedSlotId));

    return (
      <div className="mt-6">
        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55 mb-3">
          Agendamento
        </div>

        <div className="grid grid-cols-1 gap-2">
          {scheduleSlots.map((s: any) => {
            const id = String(s.id);
            const day = DAYS_OF_WEEK[Number(s.day) || 0] || 'Dia';
            const start = safeString(s.start, '00:00');
            const end = safeString(s.end, '00:00');
            const selected = selectedSlotId === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedSlotId(id)}
                className={clsx(
                  'w-full text-left rounded-2xl px-4 py-3 border transition-all',
                  selected ? 'border-blue-500/40 bg-blue-500/10' : 'border-white/10 bg-white/5 hover:bg-white/7'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="font-black text-[11px] uppercase tracking-[0.18em]">{day}</div>
                  <div className="text-[10px] font-black text-white/60">{start} — {end}</div>
                </div>
              </button>
            );
          })}
        </div>

        {selected ? (
          <button
            type="button"
            className="mt-3 w-full rounded-2xl px-4 py-4 font-black text-[11px] uppercase tracking-[0.2em] bg-white text-black hover:bg-zinc-200 transition-all active:scale-[0.99]"
            onClick={() => {
              if (isPreview) return;
              trackEvent({ profileId: profile.id, clientId: profile.clientId, type: 'click', linkId: 'scheduling', source });
              alert('Agendamento: integrar provider depois (placeholder).');
            }}
          >
            Confirmar horário
          </button>
        ) : null}
      </div>
    );
  };

  const renderPix = () => {
    if (!hasPixAccess) return null;
    const key = safeString(pix?.key, '');
    if (!key) return null;

    return (
      <div className="mt-6">
        <button
          type="button"
          onClick={openPixModal}
          className="w-full rounded-2xl px-4 py-4 font-black text-[11px] uppercase tracking-[0.2em] bg-white/10 border border-white/15 hover:bg-white/15 transition-all active:scale-[0.99]"
          style={{ fontFamily: buttonFont }}
        >
          Pagar via Pix
        </button>
      </div>
    );
  };

  const pixModal = showWalletModal ? (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-zinc-950 border border-white/10 rounded-[2.5rem] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="font-black uppercase tracking-[0.22em] text-[10px] text-white/60">Pix</div>
          <button
            type="button"
            onClick={closePixModal}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center"
          >
            <LucideIcons.X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="text-white font-black text-xl">{displayName}</div>
          <div className="text-white/60 text-sm font-semibold">Chave Pix:</div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 font-mono text-sm text-white break-all">
            {safeString((pix as any)?.key, '')}
          </div>

          <button
            type="button"
            className="w-full rounded-2xl px-4 py-4 font-black text-[11px] uppercase tracking-[0.2em] bg-white text-black hover:bg-zinc-200 transition-all active:scale-[0.99]"
            onClick={() => {
              const k = safeString((pix as any)?.key, '');
              if (!k) return;
              navigator.clipboard?.writeText(k);
            }}
          >
            Copiar chave
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className={containerClass} style={bgStyle}>
        <div className={innerClass}>
          <div className="w-full" style={shellCardStyle}>
            <div className="p-6">
              {coverNode ? <div className="mb-5">{coverNode}</div> : null}

              {headerNode}

              <div className="mt-6" style={proCardStyle}>
                <div className="p-5">
                  {renderButtons()}
                  {renderScheduling()}
                  {renderPix()}

                  <div className="mt-6 pt-5 border-t border-white/10 flex items-center gap-3">
                    <button
                      type="button"
                      className="flex-1 rounded-2xl px-4 py-3 font-black text-[10px] uppercase tracking-[0.22em] bg-white/10 border border-white/15 hover:bg-white/15 transition-all active:scale-[0.99]"
                      onClick={handleSaveContact}
                      style={{ fontFamily: buttonFont }}
                    >
                      Salvar contato
                    </button>

                    <button
                      type="button"
                      className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition-all flex items-center justify-center active:scale-[0.99]"
                      onClick={() => {
                        if (isPreview) return;
                        trackEvent({ profileId: profile.id, clientId: profile.clientId, type: 'click', linkId: 'share', source });
                        navigator.clipboard?.writeText(window.location.href);
                      }}
                      title="Copiar link"
                    >
                      <LucideIcons.Share2 size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 text-center text-white/35 text-[10px] font-black uppercase tracking-[0.22em]">
                Powered by LinkFlow
              </div>
            </div>
          </div>
        </div>
      </div>

      {pixModal}
    </>
  );
};

export default PublicProfileRenderer;
