"use client";

import React from 'react';
import { LeadCapture } from '../../types';
import { Users, Mail, Calendar, MessageSquare, ArrowUpRight } from 'lucide-react';

interface LeadsDashboardProps {
  leads: LeadCapture[];
}

const LeadsDashboard: React.FC<LeadsDashboardProps> = ({ leads }) => {
  if (leads.length === 0) {
    return (
      <div className="bg-zinc-900/40 border border-white/5 rounded-[3rem] p-10 text-center animate-in fade-in duration-700">
        <Users size={32} className="mx-auto text-zinc-700 mb-4" />
        <h3 className="text-xl font-black tracking-tight mb-2">Base de Leads Vazia</h3>
        <p className="text-zinc-500 text-sm">Os contatos capturados através da seção "Fale comigo" aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-black tracking-tighter">Últimos Leads Capturados</h2>
        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
          Total: {leads.length}
        </div>
      </div>

      <div className="bg-zinc-900/40 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Nome</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Contato</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Data</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Origem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leads.map((lead) => (
                <tr key={lead.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                        {lead.name[0].toUpperCase()}
                      </div>
                      <span className="font-bold text-sm text-white">{lead.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-zinc-400 group-hover:text-white transition-colors">
                      <Mail size={14} className="opacity-40" />
                      <span className="text-xs font-medium">{lead.contact}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Calendar size={14} className="opacity-40" />
                      <span className="text-xs font-mono">{new Date(lead.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-zinc-800 text-zinc-400 px-3 py-1 rounded-lg border border-white/5">
                      {lead.source}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {leads.some(l => l.message) && (
        <div className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-2xl flex items-center gap-4">
          <MessageSquare size={18} className="text-blue-500" />
          <p className="text-xs text-zinc-500 font-medium">
            Dica: Alguns leads incluíram mensagens personalizadas. Clique em cada linha para ver detalhes (em breve).
          </p>
        </div>
      )}
    </section>
  );
};

export default LeadsDashboard;