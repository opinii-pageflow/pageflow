export type UserRole = 'admin' | 'client';
export type PlanType = 'starter' | 'pro' | 'business' | 'enterprise';
export type BackgroundType = 'solid' | 'gradient' | 'image' | 'preset';
export type BackgroundMode = 'fill' | 'center' | 'top' | 'parallax' | 'repeat';
export type ButtonStyle = 'solid' | 'outline' | 'glass';
export type IconStyle = 'mono' | 'brand' | 'real'; // Adicionado 'real'
export type VisibilityMode = 'public' | 'private' | 'password';
export type AnalyticsSource = 'direct' | 'qr' | 'nfc' | string; // Permitir strings customizadas (UTMs)

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
  clientId?: string;
}

export interface PortfolioItem {
  id: string;
  profileId: string;
  title?: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  clientId?: string;
}

export interface YoutubeVideoItem {
  id: string;
  profileId: string;
  title?: string;
  url: string;
  sortOrder: number;
  isActive: boolean;
  clientId?: string;
}

// ===== Vitrine (Showcase) Module - Business Plan =====
export interface Showcase {
  id: string;
  profileId: string;
  clientId: string;
  isActive: boolean;
  createdAt: string;
  buttonColor?: string;
  buttonSecondaryColor?: string;
  buttonGradientEnabled?: boolean;
  itemTemplate?: string;
  descriptionColor?: string;
  headerButtonIds?: string[];
  communityClickDestination?: 'profile' | 'showcase';
  items?: ShowcaseItem[];
}

export interface ShowcaseItem {
  id: string;
  showcaseId: string;
  kind: 'physical' | 'digital';
  title: string;
  description?: string;
  mainImageUrl?: string;
  videoUrl?: string; // Vídeo principal do produto
  basePrice: number;
  originalPrice?: number;
  tag?: string;
  ctaType: 'link' | 'whatsapp';
  ctaValue?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  images?: ShowcaseImage[];
  options?: ShowcaseOption[];
  testimonials?: ShowcaseTestimonial[];
}

export interface ShowcaseImage {
  id: string;
  itemId: string;
  storagePath: string;
  sortOrder: number;
}

export interface ShowcaseOption {
  id: string;
  itemId: string;
  label: string;
  price: number;
  originalPrice?: number;
  link?: string;
  sortOrder: number;
}

export interface ShowcaseTestimonial {
  id: string;
  itemId: string;
  name: string;
  text: string;
  avatarUrl?: string;
  imageUrl?: string; // Foto de prova social
  videoUrl?: string;  // Link de vídeo de prova social
  sortOrder: number;
}

// ===== Scheduling =====
export type SlotStatus = 'available' | 'pending' | 'booked';

export interface SchedulingSlot {
  id: string;
  dayOfWeek: number; // 0 (Dom) a 6 (Sab)
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  isActive: boolean;
  status?: SlotStatus;
  bookedBy?: string; // Informação de contato/nome
  bookedAt?: string; // ISO Date
  clientId?: string;
  profileId?: string;
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
  utm?: UtmParams;
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
  utm?: UtmParams;
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
  userType: UserRole; // Novo campo para definir se o cliente é admin ou usuário comum
  maxProfiles: number;
  maxTemplates?: number;
  createdAt: string;
  isActive: boolean;
  email?: string;
  schedulingScope?: 'global' | 'per_profile'; // Configuração de escopo
  enableScheduling?: boolean; // Master Switch
  globalSlots?: SchedulingSlot[]; // Slots globais
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
  style?: any;
  clientId?: string;
}

export interface Theme {
  primary: string;
  backgroundType: BackgroundType;
  backgroundValue: string;
  backgroundValueSecondary?: string;
  backgroundValueTertiary?: string; // Adicionado para gradientes de 3 cores
  backgroundDirection?: string;
  backgroundMode?: BackgroundMode;
  overlayIntensity?: number;
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

  // Community
  showInCommunity?: boolean;
  communitySegment?: string;
  communityCity?: string;
  communityServiceMode?: 'online' | 'presencial' | 'hibrido';
  communityPunchline?: string;
  communityPrimaryCta?: 'whatsapp' | 'instagram' | 'site';
  communityGmbLink?: string;
  communityClickDestination?: 'profile' | 'showcase';

  // Promotion
  promotionEnabled?: boolean;
  promotionTitle?: string;
  promotionDescription?: string;
  promotionDiscountPercentage?: number;
  promotionCurrentPrice?: number;
  promotionImageUrl?: string;
  promotionWhatsApp?: string;

  // Sponsorship
  sponsored_enabled?: boolean;
  sponsored_until?: string;
  sponsored_segment?: string;

  // Admin Curation
  featured?: boolean;
  showOnLanding?: boolean;
  hasShowcase?: boolean;

  // Module Styling (New)
  moduleThemes?: Partial<Record<ModuleType, ModuleTheme>>;
  generalModuleTheme?: ModuleTheme; // Estilo global para todos os módulos
}

export type ModuleType = 'scheduling' | 'catalog' | 'leadCapture' | 'nps' | 'portfolio' | 'videos' | 'pix' | 'showcase';
export type ModuleStyleType = 'minimal' | 'neon' | 'glass' | 'solid' | 'outline' | 'soft' | 'brutalist' | '3d';

export interface ModuleTheme {
  style: ModuleStyleType;
  primaryColor?: string; // If undefined, use global theme.primary
  buttonColor?: string;
  textColor?: string;
  titleColor?: string;
  glowIntensity?: number; // 0-100 (for neon)
  radius?: string; // override global radius
  shadow?: string; // override global shadow
}

export type EventType = 'view' | 'click' | 'portfolio_click' | 'pix_copied' | 'catalog_zoom' | 'catalog_cta_click' | 'video_view' | 'nps_response' | 'lead_capture' | 'lead_sent' | 'showcase_view' | 'showcase_item_click';

export interface AnalyticsEvent {
  id: string;
  clientId: string;
  profileId: string;
  type: EventType;
  linkId?: string; // Deprecated, use assetId
  category?: 'button' | 'portfolio' | 'catalog' | 'video'; // Deprecated, use assetType
  source: AnalyticsSource;
  utm?: UtmParams;
  referrer?: string;
  landingPath?: string;
  device?: 'mobile' | 'desktop' | 'tablet';
  ts: number;

  // Snapshot Fields (New Standard)
  assetType?: 'button' | 'portfolio' | 'catalog' | 'video' | 'pix' | 'nps' | 'form' | 'showcase' | 'showcase_item' | 'unknown';
  assetId?: string;
  assetLabel?: string;
  assetUrl?: string;

  // NPS Specific
  score?: number;
  comment?: string;
}

export interface UtmParams {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalClicks: number;
  ctr: number;
  viewsByDate: { date: string; value: number }[];
  clicksByDate: { date: string; value: number }[];
  sources: { name: string; value: number; percentage: number }[];
  devices: { name: string; value: number; percentage: number }[];
  topLinks: { label: string; clicks: number; percentage: number }[];
  peakHours: { hour: number; value: number }[];
  utmSummary: {
    sources: { name: string; value: number }[];
    mediums: { name: string; value: number }[];
    campaigns: { name: string; value: number }[];
  };
  contentPerformance: {
    byCategory: { category: string; count: number; percentage: number }[];
    totalActions: number;
    bestAsset: { label: string; count: number; type: string } | null;
    zeroInteractionItems: { label: string; type: string }[];
    pixCopies: number;
  };
  leadsCount: number;
  npsScore?: number;
  npsBreakdown?: {
    promoters: number;
    detractors: number;
    neutrals: number;
    total: number;
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