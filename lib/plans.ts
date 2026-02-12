import { PlanType } from '../types';

export interface Plan {
  id: PlanType;
  name: string;
  maxProfiles: number;
  price: string;
  features: string[];
}

export const PLANS: Record<PlanType, Plan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    maxProfiles: 1,
    price: 'Grátis',
    features: ['1 Perfil Ativo', 'QR Code Básico', 'Templates Essenciais'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    maxProfiles: 3,
    price: 'R$ 29',
    features: ['3 Perfis Ativos', 'Analytics Avançado', 'Recursos Pro'],
  },
  business: {
    id: 'business',
    name: 'Business',
    maxProfiles: 10,
    price: 'R$ 89',
    features: ['10 Perfis Ativos', 'Gestão de Leads (CRM)', 'Múltiplos Usuários'],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    maxProfiles: 25,
    price: 'Contato',
    features: ['Perfis Ilimitados', 'Suporte Dedicado', 'Domínio Próprio'],
  },
};

export const PLAN_TYPES = Object.keys(PLANS) as PlanType[];