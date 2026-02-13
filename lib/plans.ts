import { PlanType } from '../types';

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
    maxProfiles: 1,
    monthlyPrice: 0,
    features: ['1 Perfil Ativo', 'QR Code Básico', 'Templates Essenciais'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    maxProfiles: 3,
    monthlyPrice: 19,
    features: ['Até 3 Perfis Ativos', 'Analytics Avançado', 'Catálogo & Portfólio', 'Chave Pix', 'Templates Novos', 'Tudo do plano Starter'],
  },
  business: {
    id: 'business',
    name: 'Business',
    maxProfiles: 10,
    monthlyPrice: 49,
    features: ['Até 10 Perfis Ativos', 'Gestão de Leads (CRM)', 'Dashboard de NPS', 'Tudo do plano Pro'],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    maxProfiles: 25,
    monthlyPrice: 99,
    features: ['Até 25 Perfis Ativos', 'Remoção Total da Marca', 'Tudo do plano Business'],
  },
};

export const PLAN_TYPES = Object.keys(PLANS) as PlanType[];