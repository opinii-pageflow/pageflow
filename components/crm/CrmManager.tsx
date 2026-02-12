"use client";

import React from 'react';
import { LeadCapture } from '../../types';
import { Mail, Phone, MessageSquare, Calendar, Trash2, CheckCircle2, User } from 'lucide-react';

interface Props {
  leads: LeadCapture[];
}

const CrmManager: React.FC<Props> = ({ leads }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h2 className="text-3xl font-black tracking-tighter">Gestão de Leads</h2>
        <p className="text-zinc-500">Acompanhe as pessoas que entraram em contato através dos seus perfis.</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {leads.length === 0 ? (
          <div className="py-20 text-center bg-zinc-900/40 rounded-[2.5rem] border border-white/5">
            <MessageSquare className="mx-auto text-zinc-800 mb-4" size={48} />
            <div className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Nenhum lead encontrado</div>
          </div>
        ) : (
          leads.map((lead) => (
            <div key={lead.id} className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-zinc-800/40 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-500 border border-white/10 group-hover:scale-110 transition-transform">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 className="font-black text-lg">{lead.name}</h4>
                  <div className="flex flex-wrap items-center gap-4 mt-1">
                    {/* Exibe o novo campo 'contact' ou fallback para phone/email antigos */}
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium">
                      <User size={12} /> 
                      {lead.contact || lead.email || lead.phone || 'Sem contato'}
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium">
                      <Calendar size={12} /> {new Date(lead.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {lead.message && (
                <div className="flex-1 md:px-10">
                  <p className="text-xs text-zinc-400 italic line-clamp-2">"{lead.message}"</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <a 
                  href={
                    lead.contact?.includes('@') || lead.email 
                      ? `mailto:${lead.contact || lead.email}` 
                      : `https://wa.me/${(lead.contact || lead.phone || '').replace(/\D/g, '')}`
                  }
                  target="_blank"
                  className="bg-white text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95"
                >
                  Responder
                </a>
                <button className="p-3 text-zinc-600 hover:text-red-500 transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CrmManager;