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
  | 'white_label';

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
  leads_export: 'enterprise', // Apenas o plano mais caro
  leads_full_details: 'enterprise', // Apenas o plano mais caro
  crm: 'business',
  white_label: 'enterprise'
};

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