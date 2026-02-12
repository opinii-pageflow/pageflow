import { PlanType } from '../types';

export interface Plan {
  id: PlanType;
  name: string;
  maxProfiles: number;
  priceValue: number;
  features: string[];
}

export const PLANS: Record<PlanType, Plan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    maxProfiles: 1,
    priceValue: 0,
    features: ['1 Perfil Ativo', 'QR Code Básico', 'Templates Essenciais'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    maxProfiles: 3,
    priceValue: 19,
    features: ['3 Perfis Ativos', 'Analytics Avançado', 'Catálogo & Portfólio', 'Chave Pix', 'Sem Anúncios'],
  },
  business: {
    id: 'business',
    name: 'Business',
    maxProfiles: 10,
    priceValue: 49,
    features: ['10 Perfis Ativos', 'Gestão de Leads (CRM)', 'Dashboard de NPS', 'Múltiplos Usuários'],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    maxProfiles: 25,
    priceValue: 99,
    features: ['25 Perfis Ativos', 'Suporte Prioritário', 'Domínio Próprio', 'Remoção Total da Marca'],
  },
};

export const PLAN_TYPES = Object.keys(PLANS) as PlanType[];