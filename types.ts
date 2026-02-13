export type UserRole = 'admin' | 'client';
export type PlanType = 'starter' | 'pro' | 'business' | 'enterprise';
export type BackgroundType = 'solid' | 'gradient' | 'image';
export type ButtonStyle = 'solid' | 'outline' | 'glass';
export type IconStyle = 'mono' | 'brand' | 'real'; // Adicionado 'real'
export type VisibilityMode = 'public' | 'private' | 'password';
export type AnalyticsSource = 'direct' | 'qr' | 'nfc' | string; // Permitir strings customizadas (UTMs)
export type EventType = 'view' | 'click';
export type ProfileType = 'personal' | 'business'; // Novo tipo adicionado

// ===== Pro Modules =====
export type CatalogItemKind = 'product' | 'service';

export interface CatalogItem {
  id: string;
  profileId: string;
  kind: CatalogItemKind;
  title: string;
  description?: string;
  priceText?: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaLink?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface PortfolioItem {
  id: string;
  profileId: string;
  title?: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export interface YoutubeVideoItem {
  id: string;
  profileId: string;
  title?: string;
  url: string;
  sortOrder: number;
  isActive: boolean;
}

// ===== Scheduling =====
export interface SchedulingSlot {
  id: string;
  dayOfWeek: number; // 0 (Dom) a 6 (Sab)
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  isActive: boolean;
}

export type LeadStatus = 'novo' | 'contatado' | 'negociando' | 'fechado' | 'perdido' | 'respondido' | 'arquivado';

export interface LeadHistoryItem {
  status: LeadStatus;
  date: string;
  note?: string;
}

export interface LeadCapture {
  id: string;
  clientId: string;
  profileId: string;
  name: string;
  contact: string;
  phone?: string; 
  email?: string; 
  message?: string;
  status: LeadStatus;
  notes?: string; // Notas internas
  history?: LeadHistoryItem[]; // Histórico de mudanças
  createdAt: string;
  source: AnalyticsSource;
  captureType?: 'form' | 'nps'; // Adicionado para distinguir origem
}

export interface NpsEntry {
  id: string;
  clientId: string;
  profileId: string;
  score: number;
  comment?: string;
  createdAt: string;
  source: AnalyticsSource;
}

export interface UserAuth {
  id: string;
  role: UserRole;
  clientId?: string;
  name: string;
  email: string;
}

export interface Client {
  id: string;
  name: string;
  slug: string;
  plan: PlanType;
  maxProfiles: number;
  maxTemplates?: number;
  createdAt: string;
  isActive: boolean;
  password?: string;
  email?: string;
}

export interface ProfileButton {
  id: string;
  profileId: string;
  type: string;
  label: string;
  value: string;
  enabled: boolean;
  visibility: 'public' | 'private';
  pinned: boolean;
  sortOrder: number;
}

export interface Theme {
  primary: string;
  backgroundType: BackgroundType;
  backgroundValue: string;
  backgroundValueSecondary?: string;
  backgroundDirection?: string;
  cardBg: string;
  text: string;
  muted: string;
  border: string;
  borderWidth?: string; // Adicionado
  radius: string;
  shadow: string;
  buttonStyle: ButtonStyle;
  iconStyle?: IconStyle; // Adicionado
}

export interface Fonts {
  headingFont: string;
  bodyFont: string;
  buttonFont: string;
}

export interface Profile {
  id: string;
  clientId: string;
  slug: string;
  profileType: ProfileType; // Campo adicionado
  displayName: string;
  headline: string;
  bioShort: string;
  bioLong: string;
  avatarUrl: string;
  coverUrl: string;
  buttons: ProfileButton[];
  theme: Theme;
  layoutTemplate: string;
  fonts: Fonts;
  visibilityMode: VisibilityMode;
  password?: string;
  createdAt: string;
  updatedAt: string;

  pixKey?: string;
  catalogItems?: CatalogItem[];
  portfolioItems?: PortfolioItem[];
  youtubeVideos?: YoutubeVideoItem[];
  enableLeadCapture?: boolean;
  enableNps?: boolean;
  npsRedirectUrl?: string; // Adicionado
  hideBranding?: boolean;

  // Scheduling
  enableScheduling?: boolean;
  schedulingMode?: 'external' | 'native';
  externalBookingUrl?: string;
  nativeSlots?: SchedulingSlot[];
  bookingWhatsapp?: string;
}

export interface UtmParams {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
}

export interface AnalyticsEvent {
  id: string;
  clientId: string;
  profileId: string;
  type: EventType;
  linkId?: string;
  source: AnalyticsSource;
  utm?: UtmParams;
  referrer?: string;
  landingPath?: string;
  ts: number;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalClicks: number;
  ctr: number;
  viewsByDate: { date: string; value: number }[];
  clicksByDate: { date: string; value: number }[];
  sources: { name: string; value: number }[];
  topLinks: { label: string; clicks: number; percentage: number }[];
  peakHours: { hour: number; value: number }[];
  utmSummary: {
    sources: { name: string; value: number }[];
    mediums: { name: string; value: number }[];
    campaigns: { name: string; value: number }[];
  };
}

export interface AppData {
  version: number;
  clients: Client[];
  profiles: Profile[];
  events: AnalyticsEvent[];
  leads: LeadCapture[];
  nps: NpsEntry[];
  landing?: {
    showcaseProfileIds: string[];
  };
  currentUser: UserAuth | null;
}