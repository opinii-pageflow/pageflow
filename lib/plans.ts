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
    price: 'R$ 19',
    features: ['3 Perfis Ativos', 'Analytics Avançado', 'Catálogo & Portfólio', 'Chave Pix', 'Sem Anúncios'],
  },
  business: {
    id: 'business',
    name: 'Business',
    maxProfiles: 10,
    price: 'R$ 49',
    features: ['10 Perfis Ativos', 'Gestão de Leads (CRM)', 'Dashboard de NPS', 'Múltiplos Usuários'],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    maxProfiles: 25,
    price: 'R$ 99',
    features: ['25 Perfis Ativos', 'Suporte Prioritário', 'Domínio Próprio', 'Remoção Total da Marca'],
  },
};

export const PLAN_TYPES = Object.keys(PLANS) as PlanType[];