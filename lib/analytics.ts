
import { AnalyticsEvent, AnalyticsSummary, AppData, EventType, AnalyticsSource } from '../types';
import { updateStorage, getStorage } from './storage';

export const trackEvent = (params: { profileId: string; clientId: string; type: EventType; linkId?: string; source?: AnalyticsSource }) => {
  const event: AnalyticsEvent = {
    id: Math.random().toString(36).substring(7),
    clientId: params.clientId,
    profileId: params.profileId,
    type: params.type,
    linkId: params.linkId,
    source: params.source || 'direct',
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

  // Sources
  const sourceMap: Record<string, number> = { direct: 0, qr: 0, nfc: 0 };
  filteredEvents.forEach(e => {
    sourceMap[e.source] = (sourceMap[e.source] || 0) + 1;
  });

  return {
    totalViews: views.length,
    totalClicks: clicks.length,
    ctr: views.length > 0 ? (clicks.length / views.length) * 100 : 0,
    viewsByDate: Object.entries(dateMap).map(([date, val]) => ({ date, value: val.views })),
    clicksByDate: Object.entries(dateMap).map(([date, val]) => ({ date, value: val.clicks })),
    sources: Object.entries(sourceMap).map(([name, value]) => ({ name, value })),
    topLinks,
    peakHours: Object.entries(hourMap).map(([hour, value]) => ({ hour: parseInt(hour), value })),
  };
};
