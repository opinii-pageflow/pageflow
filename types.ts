
export type UserRole = 'admin' | 'client';
export type PlanType = 'free' | 'pro' | 'business';
export type BackgroundType = 'solid' | 'gradient' | 'image';
export type ButtonStyle = 'solid' | 'outline' | 'glass';
export type VisibilityMode = 'public' | 'private' | 'password';
export type AnalyticsSource = 'direct' | 'qr' | 'nfc';
export type EventType = 'view' | 'click';

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
  password?: string; // Nova propriedade para autenticação do cliente
  email?: string;    // E-mail de login do cliente
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

// Added missing AnalyticsSummary interface for profile statistics
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
  currentUser: UserAuth | null;
}
