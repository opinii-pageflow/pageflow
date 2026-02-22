import { PlanType } from '../types';

/**
 * Interface central de configuração de planos.
 * Define preços, limites e permissões de forma estruturada.
 */
export interface PlanConfig {
    id: PlanType;
    name: string;
    price: number;
    maxProfiles: number;
    features: {
        analytics: boolean;
        crm: boolean;
        nps: boolean;
        pix: boolean;
        scheduling: boolean;
        schedulingGlobal: boolean;
        schedulingPerProfile: boolean;
        white_label: boolean;
        catalog: boolean;
        portfolio: boolean;
        videos: boolean;
        leads_capture: boolean;
        leads_export: boolean;
        leads_full_details: boolean;
    };
    displayFeatures: string[];
}

/**
 * Fonte da Verdade Única para Planos e Limites.
 * Atribuições conforme especificações:
 * - PRO: 2 perfis, R$19, Remove Marca.
 * - BUSINESS: 8 perfis, R$79, Sem CRM, Com NPS.
 * - ENTERPRISE: 15 perfis, R$150, Com CRM, Agendamento.
 */
export const PLANS_CONFIG: Record<PlanType, PlanConfig> = {
    starter: {
        id: 'starter',
        name: 'Starter',
        price: 0,
        maxProfiles: 1,
        features: {
            analytics: false,
            crm: false,
            nps: false,
            pix: false,
            scheduling: false,
            schedulingGlobal: false,
            schedulingPerProfile: false,
            white_label: false,
            catalog: false,
            portfolio: false,
            videos: false,
            leads_capture: false,
            leads_export: false,
            leads_full_details: false,
        },
        displayFeatures: ['1 Perfil Ativo', 'QR Code Básico', 'Templates Essenciais'],
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        price: 19,
        maxProfiles: 2,
        features: {
            analytics: true,
            crm: false,
            nps: true,
            pix: true,
            scheduling: false,
            schedulingGlobal: false,
            schedulingPerProfile: false,
            white_label: true,
            catalog: true,
            portfolio: true,
            videos: true,
            leads_capture: true,
            leads_export: false,
            leads_full_details: false,
        },
        displayFeatures: [
            'Até 2 Perfis Ativos',
            'Remoção da marca',
            'Analytics Avançado',
            'Catálogo & Portfólio',
            'Chave Pix',
            'NPS Feedback'
        ],
    },
    business: {
        id: 'business',
        name: 'Business',
        price: 79,
        maxProfiles: 8,
        features: {
            analytics: true,
            crm: false, // User: "Retirar Gestão de Leads (CRM)"
            nps: true,
            pix: true,
            scheduling: true,
            schedulingGlobal: true,
            schedulingPerProfile: false,
            white_label: true,
            catalog: true,
            portfolio: true,
            videos: true,
            leads_capture: true,
            leads_export: false,
            leads_full_details: false,
        },
        displayFeatures: [
            'Até 8 Perfis Ativos',
            'Dashboard NPS',
            'Analytics Avançado',
            'Agendamento Global',
            'Tudo do plano Pro'
        ],
    },
    enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        price: 150,
        maxProfiles: 15,
        features: {
            analytics: true,
            crm: true, // "Incluir Gestão de Leads (CRM)"
            nps: true,
            pix: true,
            scheduling: true,
            schedulingGlobal: true,
            schedulingPerProfile: true,
            white_label: true,
            catalog: true,
            portfolio: true,
            videos: true,
            leads_capture: true,
            leads_export: true,
            leads_full_details: true,
        },
        displayFeatures: [
            'Até 15 Perfis Ativos',
            'Gestão de Leads (CRM)',
            'Agendamento Global',
            'Agendamento por Perfil',
            'Exportação de Dados',
            'Tudo do plano Business'
        ],
    },
};
