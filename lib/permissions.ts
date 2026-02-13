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
  | 'premium_templates';

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
  leads_export: 'enterprise',
  leads_full_details: 'enterprise', 
  crm: 'enterprise',
  white_label: 'enterprise'
};

/**
 * Lista de templates considerados "Essenciais" (disponíveis no Starter)
 */
export const ESSENTIAL_TEMPLATES = [
  'Minimal Card',
  'Button List Bold',
  'Avatar Left',
  'Corporate',
  'Button Grid',
  'Light Clean'
];

/**
 * Verifica se um plano tem acesso a um determinado recurso.
 */
export const canAccessFeature = (clientPlan: PlanType | undefined, feature: FeatureKey): boolean => {
  if (!clientPlan) return false;
  
  const currentRank = PLAN_RANK[clientPlan];
  const requiredPlan = FEATURE_REQUIREMENTS[feature];
  const requiredRank = PLAN_RANK[requiredPlan];

  return currentRank >= requiredRank;
};

/**
 * Verifica se o usuário pode usar um template específico
 */
export const canUseTemplate = (clientPlan: PlanType | undefined, templateId: string): boolean => {
  if (!clientPlan) return false;
  if (ESSENTIAL_TEMPLATES.includes(templateId)) return true;
  return canAccessFeature(clientPlan, 'premium_templates');
};