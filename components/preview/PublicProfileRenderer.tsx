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
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const luminance = (hex: string) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  // sRGB luminance approximation
  const toLin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const r = toLin(rgb.r);
  const g = toLin(rgb.g);
  const b = toLin(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const pickReadableOn = (hex: string) => (luminance(hex) > 0.55 ? '#0b0b0b' : '#ffffff');

const getIcon = (type: string) => {
  const key = (type || '').trim();
  // tenta ícone pelo nome de tipo (ex: instagram -> Instagram)
  const pascal = key
    .split(/[_-\s]+/)
    .filter(Boolean)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');

  // tenta: <Type> (ex: Instagram)
  const direct = (LucideIcons as any)[pascal];
  if (direct) return direct;

  // tenta: <Type>Icon
  const alt = (LucideIcons as any)[`${pascal}Icon`];
  if (alt) return alt;

  // fallback
  return (LucideIcons as any).Link2;
};

const PublicProfileRenderer: React.FC<Props> = ({ profile, isPreview = false, clientPlan = 'starter', source = 'direct' }) => {
  const theme = profile.theme || { primary: '#2563eb', background: '#0b0b0b' };
  const fonts = profile.fonts || { headingFont: 'Poppins', bodyFont: 'Inter', buttonFont: 'Inter' };
  const background = profile.background || { type: 'solid', value: '#000000' };
  const cover = profile.cover || { enabled: false, imageUrl: '' };
  const buttons = Array.isArray(profile.buttons) ? profile.buttons : [];
  const contact = profile.contact || {};
  const pix = (profile as any).pix || {};

  const hasPix = canAccessFeature(clientPlan, 'pix');

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [previewToast, setPreviewToast] = useState<string | null>(null);

  const showPreviewToast = (message: string) => {
    if (!isPreview) return;
    setPreviewToast(message);
  };

  React.useEffect(() => {
    if (!previewToast) return;
    const t = window.setTimeout(() => setPreviewToast(null), 1600);
    return () => window.clearTimeout(t);
  }, [previewToast]);

  const layout = (profile.layoutTemplate || 'Minimal Card').trim();

  const isGrid = ['Button Grid', 'Icon Grid', 'Two Columns', 'Creator', 'Magazine'].includes(layout);
  const isLeft = ['Avatar Left', 'Corporate', 'Split Header', 'Magazine'].includes(layout);
  const isBigAvatar = ['Big Avatar'].includes(layout);

  const headingFont = normalizeFontStack(fonts?.headingFont || 'Poppins');
  const bodyFont = normalizeFontStack(fonts?.bodyFont || 'Inter');
  const buttonFont = normalizeFontStack(fonts?.buttonFont || fonts?.bodyFont || 'Inter');

  const primaryTextOnPrimary = pickReadableOn(theme.primary);

  // ✅ Capa
  const coverEnabled = !!cover?.enabled && !!cover?.imageUrl;

  const bgStyle = useMemo(() => {
    const base: React.CSSProperties = {
      backgroundColor: theme.background || '#0b0b0b',
      fontFamily: bodyFont,
    };

    if (background?.type === 'image' && background?.value) {
      return {
        ...base,
        backgroundImage: `url(${background.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }

    if (background?.type === 'gradient' && background?.value) {
      // background.value já vem como css gradient (ex: linear-gradient(...))
      return {
        ...base,
        backgroundImage: background.value,
      };
    }

    if (background?.type === 'solid' && background?.value) {
      return {
        ...base,
        backgroundColor: background.value,
      };
    }

    return base;
  }, [background?.type, background?.value, theme.background, bodyFont]);

  const activeButtons = useMemo(
    () => buttons.filter((b: any) => b?.enabled && (b?.label || b?.text || b?.title)),
    [buttons]
  );

  const handleLinkClick = (btnId: string) => {
    if (isPreview) return;
    trackEvent({ profileId: profile.id, clientId: profile.clientId, type: 'click', linkId: btnId, source });
  };

  const handlePreviewAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    label?: string
  ) => {
    if (!isPreview) return;
    e.preventDefault();
    e.stopPropagation();

    const msg = label ? `Preview: ${label}` : `Preview: ${href}`;
    showPreviewToast(msg);
  };

  const handleSaveContact = () => {
    const name = profile.displayName || 'Contato LinkFlow';
    const headline = profile.headline || '';
    const url = window.location.origin + '/#/u/' + profile.slug;

    const phoneBtn = buttons.find((b: any) => b?.enabled && (b.type === 'whatsapp' || b.type === 'phone' || b.type === 'call'));
    const phoneValue = phoneBtn?.value || '';

    const emailBtn = buttons.find((b: any) => b?.enabled && b.type === 'email');
    const emailValue = emailBtn?.value || '';

    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${name}`,
      headline ? `TITLE:${headline}` : '',
      phoneValue ? `TEL;TYPE=CELL:${phoneValue}` : '',
      emailValue ? `EMAIL:${emailValue}` : '',
      `URL:${url}`,
      'END:VCARD',
    ].filter(Boolean);

    const blob = new Blob([lines.join('\n')], { type: 'text/vcard;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${name}.vcf`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const walletSlots = useMemo(() => {
    const slots = (profile as any)?.walletSlots || [];
    return Array.isArray(slots) ? slots : [];
  }, [profile]);

  const enabledDays = useMemo(() => {
    const days = (profile as any)?.activeDays;
    if (!Array.isArray(days)) return null;
    return days.filter((d: any) => typeof d === 'number' && d >= 0 && d <= 6);
  }, [profile]);

  const getButtonStyle = () => {
    const radius = clamp(profile?.buttonRadius ?? 16, 10, 28);
    const opacity = clamp(profile?.buttonOpacity ?? 0.15, 0.05, 0.35);

    const border = `1px solid rgba(255,255,255,${Math.max(0.06, opacity - 0.05)})`;
    const bg = `rgba(255,255,255,${opacity})`;

    return {
      borderRadius: radius,
      border,
      background: bg,
      fontFamily: buttonFont,
      color: '#ffffff',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
    } as React.CSSProperties;
  };

  const Header = () => {
    if (!coverEnabled) return null;

    return (
      <div className="w-full max-w-[440px] mx-auto">
        <div className="w-full rounded-3xl overflow-hidden border border-white/10 bg-white/5">
          <div className="h-40 w-full relative">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <img src={(cover as any).imageUrl} alt="cover" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/65" />
          </div>
        </div>
      </div>
    );
  };

  const Identity = () => {
    const avatar = (profile as any)?.avatarUrl || (profile as any)?.photoUrl || '';

    return (
      <div
        className={clsx(
          'w-full max-w-[440px] mx-auto',
          isLeft ? 'flex items-start gap-3' : 'flex flex-col items-center'
        )}
      >
        <div
          className={clsx(
            'border border-white/12 bg-white/8 overflow-hidden',
            isBigAvatar ? 'w-24 h-24 rounded-full' : isLeft ? 'w-16 h-16 rounded-3xl' : 'w-20 h-20 rounded-full'
          )}
        >
          {avatar ? (
            <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center text-white/20">
              <LucideIcons.User2 size={28} />
            </div>
          )}
        </div>

        <div className={clsx(isLeft ? 'flex-1 pt-1' : 'mt-3 text-center')}>
          <div
            className="text-white font-black tracking-tight"
            style={{ fontFamily: headingFont, fontSize: isBigAvatar ? 24 : 22, lineHeight: 1.1 }}
          >
            {profile.displayName || 'Seu Nome'}
          </div>
          {profile.headline ? (
            <div className="text-white/65 font-semibold text-sm mt-1">{profile.headline}</div>
          ) : null}
          {profile.bio ? (
            <div className="text-white/55 text-sm font-medium mt-2 leading-relaxed">{profile.bio}</div>
          ) : null}

          {/* tags / chips */}
          {(profile as any)?.tags?.length ? (
            <div className={clsx('mt-3 flex flex-wrap gap-2', isLeft ? '' : 'justify-center')}>
              {(profile as any).tags.slice(0, 6).map((tag: string) => (
                <div
                  key={tag}
                  className="px-3 py-1 rounded-full bg-white/8 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/70"
                >
                  {tag}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  const ActionsRow = () => {
    const showContact = (profile as any)?.showContactButton !== false;

    return (
      <div className="w-full max-w-[440px] mx-auto mt-5">
        <div className="flex gap-2">
          {showContact ? (
            <button
              type="button"
              onClick={handleSaveContact}
              className="flex-1 h-12 rounded-2xl bg-white/10 border border-white/12 hover:bg-white/14 transition-all active:scale-95 font-black text-[10px] uppercase tracking-[0.22em] text-white/80"
              style={{ fontFamily: buttonFont }}
            >
              Salvar contato
            </button>
          ) : null}

          {hasPix && pix?.enabled ? (
            <button
              type="button"
              onClick={() => setShowWalletModal(true)}
              className="w-14 h-12 rounded-2xl bg-white/10 border border-white/12 hover:bg-white/14 transition-all active:scale-95 grid place-items-center"
              title="Carteira / Pix"
            >
              <LucideIcons.Wallet size={18} className="text-white/80" />
            </button>
          ) : null}
        </div>
      </div>
    );
  };

  const Schedule = () => {
    if (!enabledDays || enabledDays.length === 0) return null;

    return (
      <div className="w-full max-w-[440px] mx-auto mt-6">
        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40 mb-2">
          Disponível
        </div>
        <div className="flex flex-wrap gap-2">
          {DAYS_OF_WEEK.map((d, idx) => {
            const on = enabledDays.includes(idx);
            return (
              <div
                key={d}
                className={clsx(
                  'px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest',
                  on ? 'bg-white/10 border-white/14 text-white/70' : 'bg-white/5 border-white/8 text-white/25'
                )}
              >
                {d}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const Buttons = () => {
    if (!activeButtons.length) return null;

    return (
      <div className={clsx(isGrid ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3", "w-full")}>
        {activeButtons.map((btn: any, idx: number) => {
          const Icon = getIcon(btn.type);
          return (
            <a
              key={btn.id || `${btn.type}-${idx}`}
              href={formatLink(btn.type, btn.value)}
              target={isPreview ? undefined : "_blank"}
              rel={isPreview ? undefined : "noopener noreferrer"}
              onClick={(e) => {
                if (isPreview) {
                  handlePreviewAnchorClick(e, formatLink(btn.type, btn.value), btn.label || btn.title || btn.text);
                  return;
                }
                handleLinkClick(btn.id);
              }}
              style={getButtonStyle()}
              className="group hover:translate-y-[-2px] transition-transform active:scale-[0.99] w-full"
            >
              <div className="w-full h-14 px-4 flex items-center gap-3">
                <span className="w-9 h-9 rounded-2xl bg-black/25 border border-white/10 grid place-items-center text-white/75">
                  <Icon size={18} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-black text-sm truncate">
                    {btn.label || btn.title || btn.text}
                  </div>
                  {btn.subtitle ? (
                    <div className="text-white/55 text-xs font-semibold truncate">{btn.subtitle}</div>
                  ) : null}
                </div>
                <LucideIcons.ChevronRight size={18} className="text-white/35 group-hover:text-white/60 transition-colors" />
              </div>
            </a>
          );
        })}
      </div>
    );
  };

  const WalletModal = () => {
    if (!showWalletModal) return null;

    return (
      <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-2xl grid place-items-center p-5">
        <div className="w-full max-w-md rounded-3xl bg-zinc-950 border border-white/10 shadow-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-white font-black">Carteira</div>
            <button
              type="button"
              onClick={() => setShowWalletModal(false)}
              className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all grid place-items-center"
            >
              <LucideIcons.X size={18} className="text-white/70" />
            </button>
          </div>

          <div className="space-y-3">
            {walletSlots.map((s: any) => (
              <button
                key={s?.id || s?.label}
                type="button"
                onClick={() => setSelectedSlotId(s?.id || null)}
                className={clsx(
                  'w-full p-4 rounded-2xl border transition-all text-left',
                  selectedSlotId === s?.id
                    ? 'bg-white/10 border-white/14'
                    : 'bg-white/5 border-white/8 hover:bg-white/8 hover:border-white/12'
                )}
              >
                <div className="text-white font-black">{s?.label || 'Slot'}</div>
                {s?.value ? (
                  <div className="text-white/55 text-sm font-semibold mt-1">{s.value}</div>
                ) : null}
              </button>
            ))}
          </div>

          {selectedSlotId ? (
            <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">
                Selecionado
              </div>
              <div className="text-white font-black mt-1">{selectedSlotId}</div>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div style={bgStyle} className="w-full flex flex-col items-center overflow-x-hidden no-scrollbar">
      <div className="relative z-10 w-full px-4 flex flex-col items-center pt-8 pb-20">
        {isPreview && previewToast ? (
          <div className="sticky bottom-3 z-50 w-full flex justify-center pointer-events-none">
            <div className="px-3 py-2 rounded-full bg-black/70 border border-white/10 text-[10px] font-extrabold tracking-wide text-white/80 backdrop-blur">
              {previewToast}
            </div>
          </div>
        ) : null}

        <Header />
        <Identity />
        <ActionsRow />
        <Schedule />

        <div className="w-full max-w-[440px] mx-auto mt-6">
          <Buttons />
        </div>

        <WalletModal />

        <div className="mt-10 w-full max-w-[440px] mx-auto">
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25 text-center">
            {profile.slug ? `/${profile.slug}` : '/seu-perfil'}
          </div>
        </div>

        <div className="mt-10 w-full max-w-[440px] mx-auto border-t border-white/5 pt-6">
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25 text-center">
            Powered by
          </div>
          <div className="mt-2 w-full flex justify-center">
            <a
              href="/"
              target={isPreview ? undefined : "_blank"}
              rel={isPreview ? undefined : "noopener noreferrer"}
              onClick={(e) => handlePreviewAnchorClick(e, "/", "LinkFlow")}
              className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity"
            >
              <img src="/logo.png" className="h-5" alt="LinkFlow" />
              <span className="text-white/70 font-black text-sm">LinkFlow</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfileRenderer;
