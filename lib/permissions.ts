import { PlanType } from '../types';

export type FeatureKey = 
  | 'catalog' 
  | 'portfolio' 
  | 'videos' 
  | 'pix' 
  | 'nps' 
  | 'leads_capture'
  | 'crm' 
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
  nps: 'pro',           // Movido de Business para Pro
  leads_capture: 'pro', // Movido de Business para Pro
  crm: 'business',      // Gestão avançada (CRM) requer Business+
  white_label: 'enterprise'
};

/**
 * Verifica se um plano tem acesso a um determinado recurso.
 * O sistema de ranking garante que planos superiores herdem permissões dos inferiores.
 */
export const canAccessFeature = (clientPlan: PlanType | undefined, feature: FeatureKey): boolean => {
  if (!clientPlan) return false;
  
  const currentRank = PLAN_RANK[clientPlan];
  const requiredPlan = FEATURE_REQUIREMENTS[feature];
  const requiredRank = PLAN_RANK[requiredPlan];

  return currentRank >= requiredRank;
};