import { AnalyticsEvent, AnalyticsSummary, EventType, AnalyticsSource, UtmParams } from '../types';
import { updateStorage, getStorage } from './storage';

const SESSION_KEY = 'pageflow_session_origin';
const SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 dias

interface SessionOrigin {
  source: AnalyticsSource;
  utm: UtmParams;
  referrer: string;
  landingPath: string;
  ts: number;
}

export const getSessionOrigin = (): SessionOrigin | null => {
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  try {
    const session = JSON.parse(stored) as SessionOrigin;
    if (Date.now() - session.ts > SESSION_EXPIRY) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

export const captureSessionOrigin = (urlParams: URLSearchParams, referrer: string, path: string) => {
  const utm: UtmParams = {
    source: urlParams.get('utm_source') || undefined,
    medium: urlParams.get('utm_medium') || undefined,
    campaign: urlParams.get('utm_campaign') || undefined,
    content: urlParams.get('utm_content') || undefined,
    term: urlParams.get('utm_term') || undefined,
  };

  const directSource = urlParams.get('src') as AnalyticsSource;
  
  // Prioridade: UTM Source > Direct Source (src=qr/nfc) > Referrer > Direct
  let source: AnalyticsSource = 'direct';
  if (utm.source) source = utm.source;
  else if (directSource) source = directSource;
  else if (referrer && !referrer.includes(window.location.hostname)) {
    try {
      source = new URL(referrer).hostname;
    } catch {
      source = 'referrer';
    }
  }

  const session: SessionOrigin = {
    source,
    utm,
    referrer,
    landingPath: path,
    ts: Date.now()
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
};

export const trackEvent = (params: { 
  profileId: string; 
  clientId: string; 
  type: EventType; 
  linkId?: string; 
  source?: AnalyticsSource;
  utm?: UtmParams;
}) => {
  const session = getSessionOrigin();
  
  const event: AnalyticsEvent = {
    id: Math.random().toString(36).substring(7),
    clientId: params.clientId,
    profileId: params.profileId,
    type: params.type,
    linkId: params.linkId,
    source: params.source || session?.source || 'direct',
    utm: params.utm || session?.utm,
    referrer: session?.referrer,
    landingPath: session?.landingPath,
    ts: Date.now()
  };

  updateStorage(prev => ({
    ...prev,
    events: [...prev.events, event]
  }));
};

export const getProfileSummary = (profileId: string | 'all', days: number = 7): AnalyticsSummary => {
  const data = getStorage();
  const now = Date.now();
  const ms = days * 24 * 60 * 60 * 1000;
  
  const filteredEvents = data.events.filter(e => {
    const isProfile = profileId === 'all' || e.profileId === profileId;
    const isRecent = now - e.ts <= ms;
    return isProfile && isRecent;
  });

  const views = filteredEvents.filter(e => e.type === 'view');
  const clicks = filteredEvents.filter(e => e.type === 'click');

  // Chart data
  const dateMap: Record<string, { views: number; clicks: number }> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    dateMap[d] = { views: 0, clicks: 0 };
  }

  filteredEvents.forEach(e => {
    const d = new Date(e.ts).toISOString().split('T')[0];
    if (dateMap[d]) {
      if (e.type === 'view') dateMap[d].views++;
      else dateMap[d].clicks++;
    }
  });

  // Top Links & Distribution
  const linkMap: Record<string, number> = {};
  clicks.forEach(c => {
    if (c.linkId) {
      const profile = data.profiles.find(p => p.id === c.profileId);
      const btn = profile?.buttons.find(b => b.id === c.linkId);
      const label = btn?.label || 'Link Removido';
      linkMap[label] = (linkMap[label] || 0) + 1;
    }
  });

  const topLinks = Object.entries(linkMap)
    .map(([label, count]) => ({ 
      label, 
      clicks: count, 
      percentage: clicks.length > 0 ? (count / clicks.length) * 100 : 0 
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);

  // Peak Hours
  const hourMap: Record<number, number> = {};
  for (let i = 0; i < 24; i++) hourMap[i] = 0;
  
  filteredEvents.forEach(e => {
    const hour = new Date(e.ts).getHours();
    hourMap[hour]++;
  });

  // Sources & UTMs
  const sourceMap: Record<string, number> = {};
  const utmSourceMap: Record<string, number> = {};
  const utmMediumMap: Record<string, number> = {};
  const utmCampaignMap: Record<string, number> = {};

  filteredEvents.forEach(e => {
    const s = e.source || 'direct';
    sourceMap[s] = (sourceMap[s] || 0) + 1;

    if (e.utm?.source) utmSourceMap[e.utm.source] = (utmSourceMap[e.utm.source] || 0) + 1;
    if (e.utm?.medium) utmMediumMap[e.utm.medium] = (utmMediumMap[e.utm.medium] || 0) + 1;
    if (e.utm?.campaign) utmCampaignMap[e.utm.campaign] = (utmCampaignMap[e.utm.campaign] || 0) + 1;
  });

  const sortMap = (map: Record<string, number>) => 
    Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

  return {
    totalViews: views.length,
    totalClicks: clicks.length,
    ctr: views.length > 0 ? (clicks.length / views.length) * 100 : 0,
    viewsByDate: Object.entries(dateMap).map(([date, val]) => ({ date, value: val.views })),
    clicksByDate: Object.entries(dateMap).map(([date, val]) => ({ date, value: val.clicks })),
    sources: sortMap(sourceMap),
    topLinks,
    peakHours: Object.entries(hourMap).map(([hour, value]) => ({ hour: parseInt(hour), value })),
    utmSummary: {
      sources: sortMap(utmSourceMap).slice(0, 5),
      mediums: sortMap(utmMediumMap).slice(0, 5),
      campaigns: sortMap(utmCampaignMap).slice(0, 5),
    }
  };
};