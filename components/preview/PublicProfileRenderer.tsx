
import React from 'react';
import { Profile } from '../../types';
import { formatLink, getIconColor } from '../../lib/linkHelpers';
import { trackEvent } from '../../lib/analytics';
import * as LucideIcons from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
  profile: Profile;
  isPreview?: boolean;
}

const PublicProfileRenderer: React.FC<Props> = ({ profile, isPreview }) => {
  const { theme, fonts, buttons, layoutTemplate } = profile;

  const handleLinkClick = (btnId: string) => {
    if (isPreview) return;
    trackEvent({
      profileId: profile.id,
      clientId: profile.clientId,
      type: 'click',
      linkId: btnId
    });
  };

  const isSplit = layoutTemplate === 'Split Header';

  const bgStyle: React.CSSProperties = {
    background: theme.backgroundType === 'gradient' 
      ? `linear-gradient(${theme.backgroundDirection || 'to bottom'}, ${theme.backgroundValue}, ${theme.backgroundValueSecondary || theme.backgroundValue})`
      : theme.backgroundType === 'image'
        ? `url(${theme.backgroundValue}) center/cover no-repeat fixed`
        : theme.backgroundValue,
    minHeight: isPreview ? '100%' : '100vh',
    height: isPreview ? '100%' : 'auto',
    color: theme.text,
    fontFamily: fonts.bodyFont,
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const getButtonStyle = (btn: any, index: number): React.CSSProperties => {
    const isIconGrid = layoutTemplate === 'Icon Grid';
    const isBoldList = layoutTemplate === 'Button List Bold';
    const isGlass = layoutTemplate === 'Glassmorphism' || theme.buttonStyle === 'glass';
    
    const base: React.CSSProperties = {
      borderRadius: theme.radius,
      fontFamily: fonts.buttonFont,
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      boxShadow: theme.shadow,
      borderWidth: theme.buttonStyle === 'outline' ? '2px' : '1px',
      borderColor: theme.buttonStyle === 'outline' ? theme.primary : 'rgba(255,255,255,0.08)',
      display: 'flex',
      alignItems: 'center',
      gap: isIconGrid ? '0.4rem' : isSplit ? '0.5rem' : '0.8rem',
      justifyContent: isIconGrid ? 'center' : 'flex-start',
      padding: isIconGrid ? '0.8rem' : isBoldList ? '1.2rem 1.5rem' : isSplit ? '0.5rem 0.7rem' : '0.9rem 1.1rem',
      width: '100%',
      backgroundColor: theme.buttonStyle === 'solid' ? theme.primary : isGlass ? 'rgba(255,255,255,0.06)' : 'transparent',
      color: theme.buttonStyle === 'solid' ? '#fff' : theme.text,
      backdropFilter: isGlass ? 'blur(20px)' : 'none',
      fontSize: isSplit ? '0.75rem' : '0.9rem',
    };

    if (isBoldList) {
      base.transform = `rotate(${index % 2 === 0 ? '0.4deg' : '-0.4deg'})`;
      base.fontWeight = '900';
    }

    return base;
  };

  const renderLinks = () => {
    const activeButtons = buttons.filter(b => b.enabled);
    const isIconGrid = layoutTemplate === 'Icon Grid';

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
      discord: LucideIcons.MessageSquare
    };

    return (
      <div className={clsx(
        "w-full transition-all duration-1000",
        isIconGrid ? "grid grid-cols-2 gap-2" : isSplit ? "space-y-1.5" : "space-y-3",
      )}>
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
                "group relative overflow-hidden",
                !isIconGrid && "hover:translate-x-1",
                isIconGrid && "aspect-square flex-col text-center hover:scale-105"
              )}
            >
              <div className={clsx(
                "rounded-lg flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
                isIconGrid ? "w-7 h-7 mb-1" : isSplit ? "w-6 h-6 bg-black/5" : "w-8 h-8 bg-black/10"
              )}>
                <Icon size={isIconGrid ? 20 : isSplit ? 14 : 16} color={getIconColor(btn.type)} />
              </div>

              {!isIconGrid && (
                <div className="flex-1 truncate">
                  <div className="font-bold leading-tight">{btn.label}</div>
                </div>
              )}
              
              {isIconGrid && (
                <div className="text-[7px] font-black uppercase tracking-widest opacity-70">
                  {btn.label}
                </div>
              )}

              {!isIconGrid && layoutTemplate !== 'Button List Bold' && !isSplit && (
                <LucideIcons.ChevronRight size={12} className="opacity-10 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
              )}
            </a>
          );
        })}
      </div>
    );
  };

  const renderHeader = () => {
    const isCorporate = layoutTemplate === 'Corporate';

    return (
      <header className={clsx(
        "w-full flex flex-col transition-all duration-700",
        isCorporate ? "items-start text-left" : "items-center text-center",
        isSplit ? "flex-row items-center text-left gap-3 mb-3" : "mb-4"
      )}>
        <div className={clsx(
          "relative",
          isSplit ? "flex-shrink-0" : "mb-3"
        )}>
          <img 
            src={profile.avatarUrl} 
            className={clsx(
              "object-cover border-2 shadow-lg transition-all duration-700",
              isSplit ? "w-12 h-12 rounded-xl" : "rounded-full w-20 h-20",
            )}
            style={{ borderColor: theme.cardBg }}
            alt={profile.displayName}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h1 
            className={clsx(
              "font-black tracking-tighter leading-tight truncate",
              isSplit ? "text-base" : "text-xl",
            )}
            style={{ fontFamily: fonts.headingFont }}
          >
            {profile.displayName}
          </h1>
          <p className={clsx(
            "font-medium opacity-50 truncate",
            isSplit ? "text-[9px]" : "text-xs",
          )}>
            {profile.headline}
          </p>
        </div>
      </header>
    );
  };

  return (
    <div style={bgStyle} className="w-full flex flex-col items-center overflow-x-hidden no-scrollbar">
      {profile.coverUrl && layoutTemplate !== 'Minimal Card' && (
        <div className={clsx(
          "w-full overflow-hidden sticky top-0 z-0",
          isPreview ? "h-24" : "h-40"
        )}>
          <img src={profile.coverUrl} className="w-full h-full object-cover" alt="Cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
        </div>
      )}

      <div className={clsx(
        "relative z-10 w-full px-4 flex flex-col items-center",
        profile.coverUrl ? "-mt-8" : "pt-6"
      )}>
        <main className={clsx(
          "w-full transition-all duration-700 mb-12",
          isSplit ? "max-w-[94%] p-3 rounded-[2rem] bg-black/30 backdrop-blur-xl border border-white/5 shadow-2xl" : "max-w-[500px]",
          layoutTemplate === 'Glassmorphism' ? "p-5 rounded-[2rem] bg-white/5 backdrop-blur-3xl border border-white/10" : ""
        )}>
          {renderHeader()}

          {profile.bioShort && (
            <div className={clsx(
              "mb-3 leading-relaxed opacity-60",
              isSplit ? "text-[9px] text-left line-clamp-2" : "text-[10px] text-center"
            )}>
              {profile.bioShort}
            </div>
          )}

          {renderLinks()}

          <footer className="mt-6 flex flex-col items-center gap-1 opacity-20">
             <div className="w-3 h-3 bg-current rounded-sm flex items-center justify-center font-black text-[5px]">LF</div>
             <span className="text-[5px] font-black uppercase tracking-[0.3em]">LinkFlow</span>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default PublicProfileRenderer;
