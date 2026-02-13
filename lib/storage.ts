import { AppData, Profile, UserAuth, Theme, Fonts } from '../types';
import { themePresets } from './themePresets';

const STORAGE_KEY = 'linkflow_v1_data';
const CLIPBOARD_KEY = 'linkflow_style_clipboard';
const CURRENT_VERSION = 1;

// Credenciais do Admin Master
export const ADMIN_MASTER = {
  email: 'israel.souza@ent.app.br',
  password: '602387',
  name: 'Israel Souza',
  id: 'admin-master'
};

export const INITIAL_DATA: AppData = {
  version: CURRENT_VERSION,
  landing: {
    showcaseProfileIds: ['profile-1', ''],
  },
  clients: [
    {
      id: 'client-1',
      name: 'Israel Demo',
      slug: 'israel',
      email: 'israel.cruzeiro@gmail.com',
      password: '602387',
      plan: 'pro',
      maxProfiles: 3,
      createdAt: new Date().toISOString(),
      isActive: true,
    }
  ],
  profiles: [
    {
      id: 'profile-1',
      clientId: 'client-1',
      slug: 'israel',
      profileType: 'personal', // Default type
      displayName: 'Israel Tech',
      headline: 'Fullstack Engineer & Designer',
      bioShort: 'Criando o futuro da web com React e IA.',
      bioLong: 'Especialista em interfaces modernas e SaaS escaláveis.',
      avatarUrl: 'https://picsum.photos/seed/israel/200/200',
      coverUrl: 'https://picsum.photos/seed/cover/800/400',
      layoutTemplate: 'Minimal Card',
      visibilityMode: 'public',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      theme: themePresets['Azul Premium'],
      fonts: {
        headingFont: 'Poppins',
        bodyFont: 'Inter',
        buttonFont: 'Inter'
      },
      buttons: [
        { id: 'b1', profileId: 'profile-1', type: 'whatsapp', label: 'WhatsApp', value: '5511999999999', enabled: true, visibility: 'public', pinned: true, sortOrder: 0 },
        { id: 'b2', profileId: 'profile-1', type: 'instagram', label: 'Instagram', value: 'israel.tech', enabled: true, visibility: 'public', pinned: false, sortOrder: 1 },
        { id: 'b3', profileId: 'profile-1', type: 'linkedin', label: 'LinkedIn', value: 'israel-tech', enabled: true, visibility: 'public', pinned: false, sortOrder: 4 },
      ],
      pixKey: 'israel@email.com',
      catalogItems: [
        {
          id: 'cat-1',
          profileId: 'profile-1',
          kind: 'service',
          title: 'Consultoria SaaS',
          description: 'Desenvolvimento e estratégia para seu produto digital.',
          priceText: 'R$ 499,00',
          imageUrl: 'https://picsum.photos/seed/service/400/400',
          ctaLabel: 'Contratar',
          ctaLink: 'https://wa.me/5511999999999',
          sortOrder: 0,
          isActive: true
        }
      ],
      portfolioItems: [
        { id: 'p1', profileId: 'profile-1', imageUrl: 'https://picsum.photos/seed/p1/400/400', sortOrder: 0, isActive: true },
        { id: 'p2', profileId: 'profile-1', imageUrl: 'https://picsum.photos/seed/p2/400/400', sortOrder: 1, isActive: true },
        { id: 'p3', profileId: 'profile-1', imageUrl: 'https://picsum.photos/seed/p3/400/400', sortOrder: 2, isActive: true },
      ],
      youtubeVideos: [
        { id: 'v1', profileId: 'profile-1', title: 'Como criar seu SaaS', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', sortOrder: 0, isActive: true }
      ],
      enableLeadCapture: true,
      enableNps: true,
      hideBranding: false
    }
  ],
  events: [],
  leads: [],
  nps: [],
  currentUser: null
};

export const getStorage = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    saveStorage(INITIAL_DATA);
    return INITIAL_DATA;
  }
  try {
    const data = JSON.parse(stored) as AppData;
    
    if (!Array.isArray((data as any).leads)) (data as any).leads = [];
    if (!Array.isArray((data as any).nps)) (data as any).nps = [];

    if (!(data as any).landing) {
      (data as any).landing = { showcaseProfileIds: [] };
    }
    if (!Array.isArray((data as any).landing.showcaseProfileIds)) {
      (data as any).landing.showcaseProfileIds = [];
    }
    const ids = (data as any).landing.showcaseProfileIds as string[];
    if (ids.length < 2) {
      const filled = [...ids];
      while (filled.length < 2) filled.push('');
      (data as any).landing.showcaseProfileIds = filled;
    }
    const finalIds = ((data as any).landing.showcaseProfileIds as string[]).slice(0, 2);
    if (finalIds.every(v => !v)) {
      const top2 = (data.profiles || []).slice(0, 2).map(p => p.id);
      (data as any).landing.showcaseProfileIds = [top2[0] || '', top2[1] || ''];
    }

    (data.profiles || []).forEach((p: any) => {
      // Migration for profileType
      if (!p.profileType) p.profileType = 'personal';
      
      if (p.pixKey === undefined) p.pixKey = '';
      if (!Array.isArray(p.catalogItems)) p.catalogItems = [];
      if (!Array.isArray(p.portfolioItems)) p.portfolioItems = [];
      if (!Array.isArray(p.youtubeVideos)) p.youtubeVideos = [];
      if (p.enableLeadCapture === undefined) p.enableLeadCapture = true;
      if (p.enableNps === undefined) p.enableNps = true;
      if (p.hideBranding === undefined) p.hideBranding = false;
    });

    return data;
  } catch {
    return INITIAL_DATA;
  }
};

export const saveStorage = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const updateStorage = (updater: (prev: AppData) => AppData) => {
  const current = getStorage();
  const next = updater(current);
  saveStorage(next);
  return next;
};

export const getCurrentUser = (): UserAuth | null => getStorage().currentUser;

export const logout = () => {
  updateStorage(prev => ({ ...prev, currentUser: null }));
};

export const loginAs = (user: UserAuth) => {
  updateStorage(prev => ({ ...prev, currentUser: user }));
};

export interface StyleConfig {
  theme: Theme;
  fonts: Fonts;
  layoutTemplate: string;
  sourceProfileId: string;
}

export const copyStyleToClipboard = (profile: Profile) => {
  const config: StyleConfig = {
    theme: profile.theme,
    fonts: profile.fonts,
    layoutTemplate: profile.layoutTemplate,
    sourceProfileId: profile.id
  };
  localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(config));
};

export const getStyleFromClipboard = (): StyleConfig | null => {
  const stored = localStorage.getItem(CLIPBOARD_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as StyleConfig;
  } catch {
    return null;
  }
};

export const clearStyleClipboard = () => {
  localStorage.removeItem(CLIPBOARD_KEY);
};