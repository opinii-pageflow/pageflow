import { PlanType } from '../types';

export interface Plan {
  id: PlanType;
  name: string;
  maxProfiles: number;
  price?: string;
  features: string[];
}

export const PLANS: Record<PlanType, Plan> = {
  starter: { 
    id: 'starter', 
    name: 'Starter', 
    maxProfiles: 1, 
    price: 'Grátis',
    features: ['1 Perfil Ativo', 'QR Code Padrão', 'Temas Básicos']
  },
  pro: { 
    id: 'pro', 
    name: 'Pro', 
    maxProfiles: 3, 
    price: 'R$ 29',
    features: ['3 Perfis Ativos', 'Analytics Avançado', 'Recursos Pro (Pix, Catálogo)']
  },
  business: { 
    id: 'business', 
    name: 'Business', 
    maxProfiles: 10, 
    price: 'R$ 89',
    features: ['10 Perfis Ativos', 'Gestão de Leads (CRM)', 'Suporte Prioritário']
  },
  enterprise: { 
    id: 'enterprise', 
    name: 'Enterprise', 
    maxProfiles: 25, 
    price: 'Contato',
    features: ['25+ Perfis Ativos', 'Domínio Personalizado', 'API de Integração']
  },
};

export const getPlanById = (id: PlanType): Plan | undefined => {
  return PLANS[id];
};