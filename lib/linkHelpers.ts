// ─── Helpers de Link ───

/**
 * Retorna a origem pública do site, priorizando VITE_PUBLIC_SITE_URL.
 */
export const getPublicOrigin = () => {
  const origin = import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin;
  return origin.replace(/\/$/, ""); // Remove trailing slash if exists
};

/**
 * Formata a URL pública de um perfil (compatível com HashRouter)
 */
export const formatPublicProfileUrl = (slug: string) => {
  return `${getPublicOrigin()}/#/u/${slug}`;
};

/**
 * Formata a URL pública de uma vitrine (compatível com HashRouter)
 */
export const formatPublicShowcaseUrl = (slug: string) => {
  return `${getPublicOrigin()}/#/u/${slug}/vitrine`;
};

export const formatLink = (type: string, value: string): string => {
  const v = value.trim();
  if (!v) return '#';

  switch (type) {
    case 'whatsapp':
      // Remove caracteres não numéricos
      const phone = v.replace(/\D/g, '');
      return `https://wa.me/${phone}`;

    case 'instagram':
      const insta = v.startsWith('@') ? v.slice(1) : v;
      return `https://instagram.com/${insta}`;

    case 'tiktok':
      const tk = v.startsWith('@') ? v.slice(1) : v;
      return `https://tiktok.com/@${tk}`;

    case 'youtube':
      if (v.startsWith('http') || v.includes('youtube.com/') || v.includes('youtu.be/')) return v;
      return `https://youtube.com/@${v}`;

    case 'linkedin':
      if (v.startsWith('http')) return v;
      return `https://linkedin.com/in/${v}`;

    case 'twitter':
    case 'x':
      const tw = v.startsWith('@') ? v.slice(1) : v;
      return `https://x.com/${tw}`;

    case 'facebook':
      if (v.startsWith('http')) return v;
      return `https://facebook.com/${v}`;

    case 'email':
      return `mailto:${v}`;

    case 'phone':
    case 'telephone':
      const tel = v.replace(/\D/g, '');
      return `tel:${tel}`;

    case 'github':
      return `https://github.com/${v}`;
    case 'discord':
      return v.startsWith('http') ? v : `https://discord.gg/${v}`;
    case 'telegram':
      return `https://t.me/${v.replace('@', '')}`;
    case 'twitch':
      return `https://twitch.tv/${v}`;
    case 'threads':
      return `https://threads.net/@${v.replace('@', '')}`;
    case 'email':
      return `mailto:${v}`;
    case 'phone':
    case 'telephone':
      return `tel:${v.replace(/\D/g, '')}`;
    case 'maps':
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v)}`;
    default:
      return v.startsWith('http') ? v : `https://${v}`;
  }
};

export const getIconColor = (type: string): string => {
  switch (type) {
    case 'whatsapp': return '#25D366';
    case 'instagram': return '#E1306C';
    case 'linkedin': return '#0077B5';
    case 'twitter':
    case 'x': return '#ffffff';
    case 'youtube': return '#FF0000';
    case 'facebook': return '#1877F2';
    case 'github': return '#ffffff';
    case 'tiktok': return '#00f2ea';
    case 'discord': return '#5865F2';
    case 'telegram': return '#0088cc';
    case 'twitch': return '#9146FF';
    case 'threads': return '#ffffff';
    default: return '#6b7280';
  }
};

export const detectLinkType = (value: string): string => {
  const v = value.toLowerCase().trim();
  if (!v) return 'website';

  if (v.includes('wa.me') || v.includes('whatsapp.com') || /^\+?\d+$/.test(v.replace(/[\s-()]/g, ''))) return 'whatsapp';
  if (v.includes('instagram.com') || v.startsWith('@')) return 'instagram';
  if (v.includes('linkedin.com')) return 'linkedin';
  if (v.includes('youtube.com') || v.includes('youtu.be')) return 'youtube';
  if (v.includes('facebook.com') || v.includes('fb.com')) return 'facebook';
  if (v.includes('twitter.com') || v.includes('x.com')) return 'twitter';
  if (v.includes('github.com')) return 'github';
  if (v.includes('tiktok.com')) return 'tiktok';
  if (v.includes('t.me') || v.includes('telegram.org')) return 'telegram';
  if (v.includes('discord.gg') || v.includes('discord.com')) return 'discord';
  if (v.includes('twitch.tv')) return 'twitch';
  if (v.includes('threads.net')) return 'threads';
  if (v.includes('mailto:') || v.includes('@') && v.includes('.')) return 'email';
  if (v.includes('google.com/maps') || v.includes('goo.gl/maps')) return 'maps';

  return 'website';
};
