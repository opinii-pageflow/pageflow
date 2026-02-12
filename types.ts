export type UserRole = 'admin' | 'client';
export type PlanType = 'free' | 'pro' | 'business';
export type BackgroundType = 'solid' | 'gradient' | 'image';
export type ButtonStyle = 'solid' | 'outline' | 'glass';
export type VisibilityMode = 'public' | 'private' | 'password';
export type AnalyticsSource = 'direct' | 'qr' | 'nfc';
export type EventType = 'view' | 'click';

// ===== Pro Modules =====
export type CatalogItemKind = 'product' | 'service';

export interface CatalogItem {
  id: string;
  profileId: string;
  kind: CatalogItemKind;
  title: string;
  description: string;
  price?: string; // Alterado de priceText para price
  image?: string; // Alterado de imageUrl para image
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
  url: string; // qualquer url válida do YouTube
  sortOrder: number;
  isActive: boolean;
}

export interface LeadCapture {
  id: string;
  clientId: string;
  profileId: string;
  name: string;
  phone?: string;
  email?: string;
  message?: string;
  createdAt: string; // ISO
  source: AnalyticsSource;
}

export interface NpsEntry {
  id: string;
  clientId: string;
  profileId: string;
  score: number; // 0..10
  comment?: string;
  createdAt: string; // ISO
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
  password?: string; // autenticação do cliente
  email?: string;    // e-mail de login do cliente
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
  radius: string;
  shadow: string;
  buttonStyle: ButtonStyle;
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

  // ===== Pro Fields (opcionais) =====
  pixKey?: string;
  catalogItems?: CatalogItem[];
  portfolioItems?: PortfolioItem[];
  youtubeVideos?: YoutubeVideoItem[];
  enableLeadCapture?: boolean;
  enableNps?: boolean;
}

export interface AnalyticsEvent {
  id: string;
  clientId: string;
  profileId: string;
  type: EventType;
  linkId?: string;
  source: AnalyticsSource;
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
}

export interface AppData {
  version: number;
  clients: Client[];
  profiles: Profile[];
  events: AnalyticsEvent[];

  // ===== Pro Data (multi-tenant) =====
  leads: LeadCapture[];
  nps: NpsEntry[];

  currentUser: UserAuth | null;
}