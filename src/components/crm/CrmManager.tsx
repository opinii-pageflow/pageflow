"use client";

import React, { useState, useMemo } from 'react';
import { LeadCapture, AppData } from '../../types';
import { updateStorage } from '../../lib/storage';
import { Users, Filter, CheckCircle, TrendingUp, Search, ExternalLink, Calendar, MessageSquare } from 'lucide-react';
import LeadStatusBadge from './LeadStatusBadge';
import LeadDetailsDrawer from './LeadDetailsDrawer';
import clsx from 'clsx';

interface Props {
  leads: LeadCapture[];
}

const CrmManager: React.FC<Props> = ({ leads }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<LeadCapture | null>(null);

  const stats = useMemo(() => {
    const total = leads.length;
    const novos = leads.filter(l => l.status === 'novo' || !l.status).length;
    const fechados = leads.filter(l => l.status === 'fechado').length;
    const conversao = total > 0 ? (fechados / total) * 100 : 0;

    return { total, novos, fechados, conversao };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => 
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.contact.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [leads, searchTerm]);

  const handleUpdateLead = (id: string, updates: Partial<LeadCapture>) => {
    updateStorage(prev => ({
      ...prev,
      leads: prev.leads.map(l => l.id === id ? { ...l, ...updates, status: updates.status || l.status || 'novo' } : l)
    }));
    // Se o lead selecionado for o que foi atualizado, atualizamos o estado local também
    if (selectedLead?.id === id) {
      setSelectedLead({ ...selectedLead, ...updates, status: updates.status || selectedLead.status || 'novo' });
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Dashboard de CRM */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total de Leads', value: stats.total, icon: Users, color: 'text-blue-500' },
          { label: 'Novos Contatos', value: stats.novos, icon: Filter, color: 'text-amber-500' },
          { label: 'Fechados', value: stats.fechados, icon: CheckCircle, color: 'text-emerald-500' },
          { label: 'Conversão', value: `${stats.conversao.toFixed(1)}%`, icon: TrendingUp, color: 'text-purple-500' },
        ].map((s, i) => (
          <div key={i} className="bg-zinc-900/40 border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
             <div className="flex items-center gap-4 mb-6">
                <div className={clsx(s.color, "p-4 bg-white/5 rounded-2xl")}>
                   <s.icon size={22} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{s.label}</span>
             </div>
             <div className="text-5xl font-black tracking-tighter">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabela de Gestão */}
      <div className="space-y-6">
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 px-2">
          <h2 className="text-3xl font-black tracking-tighter">Fluxo de Gestão</h2>
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou contato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/60 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-sm outline-none focus:border-blue-500/50 transition-all placeholder:text-zinc-700 font-bold"
            />
          </div>
        </header>

        <div className="bg-zinc-900/40 border border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Nome do Lead</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Contato</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Data</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                          {lead.name[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                           <div className="font-bold text-sm text-white truncate">{lead.name}</div>
                           {lead.notes && <div className="text-[9px] text-amber-500/60 uppercase font-black truncate max-w-[120px]">Possui Notas</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs text-zinc-400 font-medium">{lead.contact}</td>
                    <td className="px-8 py-6">
                      <LeadStatusBadge status={lead.status || 'novo'} />
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                          <Calendar size={12} className="opacity-40" />
                          {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button 
                        onClick={() => setSelectedLead(lead)}
                        className="p-3 bg-white/5 hover:bg-white text-zinc-500 hover:text-black rounded-xl transition-all active:scale-95 border border-white/5"
                       >
                         <ExternalLink size={18} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredLeads.length === 0 && (
            <div className="py-20 text-center space-y-4">
               <Search size={40} className="mx-auto text-zinc-800" />
               <p className="text-zinc-600 font-black uppercase tracking-widest text-xs">Nenhum resultado encontrado</p>
            </div>
          )}
        </div>
      </div>

      <LeadDetailsDrawer 
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdate={handleUpdateLead}
      />
    </div>
  );
};

export default CrmManager;