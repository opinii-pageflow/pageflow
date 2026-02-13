import { PlanType } from '../types';

export type FeatureKey = 
  | 'catalog' 
  | 'portfolio' 
  | 'videos' 
  | 'pix' 
  | 'nps' 
  | 'leads_capture'
  | 'crm' 
  | 'leads_export'
  | 'leads_full_details'
  | 'analytics' 
  | 'white_label'
  | 'premium_templates'
  | 'premium_fonts'
  | 'premium_themes'
  | 'background_image';

const PLAN_RANK: Record<PlanType, number> = {
  starter: 0,
  pro: 1,
  business: 2,
  enterprise: 3
};

const FEATURE_REQUIREMENTS: Record<FeatureKey, PlanType> = {
  catalog: 'pro',
  portfolio: 'pro',
  videos: 'pro',
  pix: 'pro',
  analytics: 'pro',
  nps: 'pro',
  leads_capture: 'pro',
  premium_templates: 'pro',
  premium_fonts: 'pro',
  premium_themes: 'pro',
  background_image: 'pro',
  leads_export: 'enterprise',
  leads_full_details: 'enterprise', 
  crm: 'enterprise', 
  white_label: 'enterprise'
};

export const ESSENTIAL_TEMPLATES = ['Minimal Card', 'Button List Bold', 'Avatar Left', 'Corporate'];
export const ESSENTIAL_FONTS = ['Inter', 'Roboto', 'Lato'];
export const ESSENTIAL_THEMES = ['Minimal Dark'];

export const canAccessFeature = (clientPlan: PlanType | undefined, feature: FeatureKey): boolean => {
  if (!clientPlan) return false;
  const currentRank = PLAN_RANK[clientPlan];
  const requiredPlan = FEATURE_REQUIREMENTS[feature];
  const requiredRank = PLAN_RANK[requiredPlan];
  return currentRank >= requiredRank;
};

export const canUseTemplate = (clientPlan: PlanType | undefined, templateId: string): boolean => {
  if (!clientPlan) return false;
  if (ESSENTIAL_TEMPLATES.includes(templateId)) return true;
  return canAccessFeature(clientPlan, 'premium_templates');
};

export const canUseFont = (clientPlan: PlanType | undefined, fontName: string): boolean => {
  if (!clientPlan) return false;
  if (ESSENTIAL_FONTS.includes(fontName)) return true;
  return canAccessFeature(clientPlan, 'premium_fonts');
};

export const canUseTheme = (clientPlan: PlanType | undefined, themeName: string): boolean => {
  if (!clientPlan) return false;
  if (ESSENTIAL_THEMES.includes(themeName)) return true;
  return canAccessFeature(clientPlan, 'premium_themes');
};