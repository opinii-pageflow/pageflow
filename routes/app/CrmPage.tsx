"use client";

import React from 'react';
import TopBar from '../../components/common/TopBar';
import AdvancedCrm from '../../components/crm/AdvancedCrm';
import { getStorage, getCurrentUser } from '../../lib/storage';
import { canAccessFeature } from '../../lib/permissions';
import { Shield, Zap, Lock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CrmPage: React.FC = () => {
  const user = getCurrentUser();
  const data = getStorage();
  const client = data.clients.find(c => c.id === user?.clientId);
  const leads = data.leads
    .filter(l => l.clientId === user?.clientId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const hasCrmAccess = canAccessFeature(client?.plan, 'crm');

  if (!hasCrmAccess) {
    return (
      <div className="min-h-screen bg-[#020202] text-white">
        <TopBar title="Gestão de Leads" />
        <main className="max-w-7xl mx-auto p-6 lg:p-10 pt-44 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-blue-600/10 text-blue-500 rounded-[2.5rem] flex items-center justify-center mb-10 border border-blue-500/20 shadow-2xl animate-pulse">
             <Shield size={48} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">CRM Avançado</h1>
          <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
            A gestão profissional de clientes e o funil de vendas estão disponíveis apenas no <b>Plano Business</b>. 
            Organize seus contatos, anote interações e feche mais negócios.
          </p>
          <Link to="/app/upgrade" className="bg-white text-black px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center gap-4 hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl">
            <Zap size={20} />
            Liberar CRM no Plano Business
            <ChevronRight size={20} />
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-40">
      <TopBar title="Gestão de Relacionamento (CRM)" />
      <main className="max-w-7xl mx-auto p-6 lg:p-10 pt-32">
        <header className="mb-12 space-y-4 animate-in fade-in slide-in-from-left duration-1000">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">Pipeline de <span className="text-zinc-600">Vendas</span></h1>
          <p className="text-zinc-500 text-lg md:text-xl font-medium">Gerencie seus leads, acompanhe negociações e maximize sua taxa de fechamento.</p>
        </header>
        <AdvancedCrm leads={leads} />
      </main>
    </div>
  );
};

export default CrmPage;