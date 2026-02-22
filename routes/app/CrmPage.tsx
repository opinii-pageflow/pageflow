"use client";

import React from 'react';
import TopBar from '../../components/common/TopBar';
import AdvancedCrm from '../../components/crm/AdvancedCrm';
import { getCurrentUser } from '../../lib/storage';
import { leadsApi } from '@/lib/api/leads';
import { canAccessFeature } from '../../lib/permissions';
import { Shield, Zap, Lock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useClientData } from '@/hooks/useClientData';

const CrmPage: React.FC = () => {
  const { client, loading: clientLoading } = useClientData();
  const [leads, setLeads] = React.useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = React.useState(true);

  const fetchLeads = React.useCallback(async () => {
    if (!client?.id) return;
    try {
      setLoadingLeads(true);
      const data = await leadsApi.listByClient(client.id);
      setLeads(data);
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setLoadingLeads(false);
    }
  }, [client?.id]);

  React.useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const hasCrmAccess = canAccessFeature(client?.plan, 'crm');

  if (clientLoading || (hasCrmAccess && loadingLeads)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Sincronizando...</span>
        </div>
      </div>
    );
  }

  if (!hasCrmAccess) {
    return (
      <div className="min-h-screen bg-[#050505] text-white selection:bg-neon-blue/30">
        <TopBar title="Gestão de Leads" />
        <main className="max-w-7xl mx-auto p-12 pt-44 flex flex-col items-center text-center">
          <div className="w-24 h-24 glass-neon-blue rounded-[2.5rem] flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(0,242,255,0.2)]">
            <Shield size={48} className="text-neon-blue filter drop-shadow-[0_0_8px_#00f2ff]" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic">CRM <span className="text-neon-blue drop-shadow-[0_0_15px_rgba(0,242,255,0.3)]">Intelligence</span></h1>
          <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed font-medium">
            A gestão profissional de clientes e o funil de vendas avançado estão restritos ao <span className="text-white">Protocolo Business</span>.
            Organize intel, anote interações e converta com precisão cirúrgica.
          </p>
          <Link to="/app/upgrade" className="bg-white text-black px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center gap-4 hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl">
            <Zap size={20} strokeWidth={3} />
            Upgrade para Business
            <ChevronRight size={20} strokeWidth={3} />
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 selection:bg-neon-blue/30">
      <TopBar title="Gestão de Relacionamento (CRM)" showBack />

      <main className="max-w-[1600px] mx-auto p-8 lg:p-14 pt-32 relative z-10">
        <header className="mb-16 space-y-6 animate-in fade-in slide-in-from-left duration-1000">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full glass-neon-blue text-[10px] font-black uppercase tracking-[0.2em] text-neon-blue">
              Pipeline Status: Active
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none italic">
            Centro de <span className="text-neon-blue drop-shadow-[0_0_20px_rgba(0,242,255,0.4)]">Conversão</span>
          </h1>
          <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-3xl leading-relaxed">
            Gestão estratégica de leads e automação de funil. Rastreie interações, mova negociações e maximize o retorno da sua rede.
          </p>
        </header>

        <AdvancedCrm leads={leads} clientPlan={client?.plan} onRefresh={fetchLeads} />
      </main>
    </div>
  );
};

export default CrmPage;