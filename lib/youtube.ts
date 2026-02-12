export const extractYouTubeId = (url: string): string | null => {
  try {
    const u = new URL(url);

    // youtu.be/<id>
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace('/', '').trim();
      return id || null;
    }

    // youtube.com/watch?v=<id>
    const v = u.searchParams.get('v');
    if (v) return v;

    // youtube.com/embed/<id> or /shorts/<id>
    const parts = u.pathname.split('/').filter(Boolean);
    const embedIdx = parts.findIndex(p => p === 'embed' || p === 'shorts');
    if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];

    return null;
  } catch {
    return null;
  }
};
