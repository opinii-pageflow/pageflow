import { AppData, Client, Profile, AnalyticsEvent, UserAuth, Theme, Fonts } from '@/types';
import { themePresets } from '@/lib/themePresets';
import { normalizeEvent } from './eventNormalizer';

const STORAGE_KEY = 'pageflow:v1:data';
const EVENTS_KEY = 'pageflow:v1:events';
const PROFILES_KEY = 'pageflow:v1:profiles';
const CLIPBOARD_KEY = 'pageflow:v1:style_clipboard';

const CURRENT_VERSION = 104;

// Credenciais do Admin Master
export const ADMIN_MASTER = {
    email: 'israel.souza@ent.app.br',
    password: '602387',
    name: 'Israel Souza',
    id: 'admin-master'
};

export const INITIAL_DATA: AppData = {
    version: CURRENT_VERSION,
    clients: [],
    profiles: [],
    events: [],
    leads: [],
    nps: [],
    currentUser: null
};



// MODO SOMENTE BANCO: ignorar localStorage legado
// MODO HÍBRIDO: currentUser no localStorage para persistência de sessão, resto no Supabase
export const getStorage = (): AppData => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...INITIAL_DATA };

    try {
        const parsed = JSON.parse(stored);
        return {
            ...INITIAL_DATA,
            currentUser: parsed.currentUser || null
        };
    } catch {
        return { ...INITIAL_DATA };
    }
};

export const saveStorage = (data: AppData) => {
    // Salvamos apenas o currentUser para manter a sessão ativa entre reloads
    const persistData = {
        currentUser: data.currentUser
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistData));
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

// Helpers para IDs (Ainda útil para novos itens locais antes do save)
export const generateId = () => {
    try {
        return crypto.randomUUID();
    } catch {
        // Fallback para ambientes sem crypto.randomUUID
        return 'id-' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    }
};
