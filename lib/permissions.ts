import { PlanType } from '../types';
import { PLANS_CONFIG } from './plansConfig';

export const PLAN_RANK: Record<PlanType, number> = {
  starter: 0,
  pro: 1,
  business: 2,
  enterprise: 3
};

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
  | 'scheduling'
  | 'white_label';

/**
 * Verifica se um plano tem acesso a um determinado recurso.
 */
export const canAccessFeature = (clientPlan: PlanType | undefined, feature: FeatureKey): boolean => {
  if (!clientPlan) return false;

  const config = PLANS_CONFIG[clientPlan];
  if (!config) return false;

  // Mapeamento direto de FeatureKey para as propriedades booleanas do config
  switch (feature) {
    case 'catalog': return config.features.catalog;
    case 'portfolio': return config.features.portfolio;
    case 'videos': return config.features.videos;
    case 'pix': return config.features.pix;
    case 'nps': return config.features.nps;
    case 'leads_capture': return config.features.leads_capture;
    case 'crm': return config.features.crm;
    case 'leads_export': return config.features.leads_export;
    case 'leads_full_details': return config.features.leads_full_details;
    case 'analytics': return config.features.analytics;
    case 'scheduling': return config.features.scheduling;
    case 'white_label': return config.features.white_label;
    default: return false;
  }
};

/**
 * Retorna os limites numéricos de um plano.
 */
export const getPlanLimits = (clientPlan: PlanType | undefined) => {
  const config = PLANS_CONFIG[clientPlan || 'starter'];
  return {
    maxProfiles: config.maxProfiles,
    communityHighlights: COMMUNITY_LIMITS[clientPlan || 'starter'],
    hasWhiteLabel: config.features.white_label
  };
};

export const COMMUNITY_LIMITS: Record<PlanType, number> = {
  starter: 0,
  pro: 1,
  business: 3,
  enterprise: 10
};