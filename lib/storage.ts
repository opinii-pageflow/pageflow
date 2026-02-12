
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
      displayName: 'Israel Tech',
      headline: 'Fullstack Engineer & Designer',
      bioShort: 'Criando o futuro da web com React e IA.',
      bioLong: 'Especialista em interfaces modernas e SaaS escaláveis.',
      avatarUrl: 'https://picsum.photos/200/200',
      coverUrl: 'https://picsum.photos/800/400',
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
        { id: 'b3', profileId: 'profile-1', type: 'tiktok', label: 'TikTok', value: 'israel.tech', enabled: true, visibility: 'public', pinned: false, sortOrder: 2 },
        { id: 'b4', profileId: 'profile-1', type: 'youtube', label: 'YouTube', value: 'israeltech', enabled: true, visibility: 'public', pinned: false, sortOrder: 3 },
        { id: 'b5', profileId: 'profile-1', type: 'linkedin', label: 'LinkedIn', value: 'israel-tech', enabled: true, visibility: 'public', pinned: false, sortOrder: 4 },
        { id: 'b6', profileId: 'profile-1', type: 'discord', label: 'Comunidade Discord', value: 'invite-link', enabled: true, visibility: 'public', pinned: false, sortOrder: 5 },
      ]
      ,
      // Pro fields (opcionais)
      pixKey: '',
      catalogItems: [],
      portfolioItems: [],
      youtubeVideos: [],
      enableLeadCapture: true,
      enableNps: true
    }
  ],
  events: [
    ...Array.from({ length: 20 }).map((_, i) => ({
      id: `ev-${i}`,
      clientId: 'client-1',
      profileId: 'profile-1',
      type: 'view' as const,
      source: 'direct' as const,
      ts: Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000)
    })),
    ...Array.from({ length: 12 }).map((_, i) => ({
      id: `ck-${i}`,
      clientId: 'client-1',
      profileId: 'profile-1',
      type: 'click' as const,
      linkId: 'b1',
      source: 'qr' as const,
      ts: Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000)
    }))
  ],
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

    // ===== Migration (campos novos) =====
    // AppData roots
    if (!Array.isArray((data as any).leads)) (data as any).leads = [];
    if (!Array.isArray((data as any).nps)) (data as any).nps = [];

    // Profiles pro fields
    (data.profiles || []).forEach((p: any) => {
      if (p.pixKey === undefined) p.pixKey = '';
      if (!Array.isArray(p.catalogItems)) p.catalogItems = [];
      if (!Array.isArray(p.portfolioItems)) p.portfolioItems = [];
      if (!Array.isArray(p.youtubeVideos)) p.youtubeVideos = [];
      if (p.enableLeadCapture === undefined) p.enableLeadCapture = true;
      if (p.enableNps === undefined) p.enableNps = true;
    });
    const demo = data.clients.find(c => c.id === 'client-1');
    if (demo && demo.email !== 'israel.cruzeiro@gmail.com') {
      demo.email = 'israel.cruzeiro@gmail.com';
      demo.password = '602387';
      saveStorage(data);
    }
    // Persist migrations (sem quebrar)
    saveStorage(data);
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

// Funções de Clipboard de Estilo
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
