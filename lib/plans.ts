import { PlanType } from '../types';
import { PLANS_CONFIG } from './plansConfig';

export interface Plan {
  id: PlanType;
  name: string;
  maxProfiles: number;
  monthlyPrice: number;
  features: string[];
}

export const PLANS: Record<PlanType, Plan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    maxProfiles: PLANS_CONFIG.starter.maxProfiles,
    monthlyPrice: PLANS_CONFIG.starter.price,
    features: PLANS_CONFIG.starter.displayFeatures,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    maxProfiles: PLANS_CONFIG.pro.maxProfiles,
    monthlyPrice: PLANS_CONFIG.pro.price,
    features: PLANS_CONFIG.pro.displayFeatures,
  },
  business: {
    id: 'business',
    name: 'Business',
    maxProfiles: PLANS_CONFIG.business.maxProfiles,
    monthlyPrice: PLANS_CONFIG.business.price,
    features: PLANS_CONFIG.business.displayFeatures,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    maxProfiles: PLANS_CONFIG.enterprise.maxProfiles,
    monthlyPrice: PLANS_CONFIG.enterprise.price,
    features: PLANS_CONFIG.enterprise.displayFeatures,
  },
};

export const PLAN_TYPES = Object.keys(PLANS) as PlanType[];