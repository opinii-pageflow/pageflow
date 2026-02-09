
export const formatLink = (type: string, value: string): string => {
  const v = value.trim();
  if (!v) return '#';
  
  switch (type) {
    case 'whatsapp':
      return `https://wa.me/${v.replace(/\D/g, '')}`;
    case 'instagram':
      return `https://instagram.com/${v.replace('@', '')}`;
    case 'linkedin':
      return v.startsWith('http') ? v : `https://linkedin.com/in/${v}`;
    case 'twitter':
    case 'x':
      return `https://x.com/${v.replace('@', '')}`;
    case 'tiktok':
      return `https://tiktok.com/@${v.replace('@', '')}`;
    case 'facebook':
      return v.startsWith('http') ? v : `https://facebook.com/${v}`;
    case 'youtube':
      return v.startsWith('http') ? v : `https://youtube.com/@${v.replace('@', '')}`;
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
