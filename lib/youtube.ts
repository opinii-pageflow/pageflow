/**
 * Extrai o ID de um vídeo do YouTube a partir de qualquer URL comum.
 * Suporta: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID, youtube.com/embed/ID
 */
export const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  
  try {
    const u = new URL(url.trim());

    // Suporte para youtu.be/ID
    if (u.hostname === 'youtu.be') {
      return u.pathname.substring(1).split(/[?#]/)[0] || null;
    }

    // Suporte para youtube.com/watch?v=ID
    const v = u.searchParams.get('v');
    if (v) return v;

    // Suporte para youtube.com/embed/ID ou youtube.com/shorts/ID
    const parts = u.pathname.split('/').filter(Boolean);
    const idIndex = parts.findIndex(p => p === 'embed' || p === 'shorts');
    
    if (idIndex !== -1 && parts[idIndex + 1]) {
      return parts[idIndex + 1].split(/[?#]/)[0];
    }

    // Fallback para caminhos diretos caso a URL seja mal formada
    return null;
  } catch {
    // Caso não seja uma URL válida, tentamos um regex simples como fallback
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  }
};