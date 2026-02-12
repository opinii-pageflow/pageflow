"use client";

import React from 'react';
import { LeadCapture, LeadStatus } from '../../types';
import { X, Calendar, User, Mail, MessageSquare, StickyNote, Activity } from 'lucide-react';
import LeadStatusBadge from './LeadStatusBadge';
import clsx from 'clsx';

interface Props {
  lead: LeadCapture | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<LeadCapture>) => void;
}

const LeadDetailsDrawer: React.FC<Props> = ({ lead, onClose, onUpdate }) => {
  if (!lead) return null;

  const statuses: LeadStatus[] = ['novo', 'contatado', 'negociando', 'fechado', 'perdido'];

  return (
    <div className="fixed inset-0 z-[600] flex justify-end animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-zinc-950 border-l border-white/10 h-full shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto">
        <header className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-zinc-950 z-10">
          <div className="space-y-1">
             <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Gestão de Lead</div>
             <h2 className="text-2xl font-black tracking-tight">{lead.name}</h2>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-all">
            <X size={24} />
          </button>
        </header>

        <div className="p-8 space-y-10">
          {/* Informações de Contato */}
          <section className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-zinc-500 mb-2">
                  <Mail size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Contato</span>
                </div>
                <div className="text-sm font-bold text-white break-all">{lead.contact}</div>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-zinc-500 mb-2">
                  <Calendar size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Recebido</span>
                </div>
                <div className="text-sm font-bold text-white">{new Date(lead.createdAt).toLocaleDateString('pt-BR')}</div>
              </div>
            </div>

            {lead.message && (
              <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5">
                <div className="flex items-center gap-2 text-zinc-500 mb-3">
                  <MessageSquare size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Mensagem Original</span>
                </div>
                <p className="text-sm text-zinc-400 italic leading-relaxed">"{lead.message}"</p>
              </div>
            )}
          </section>

          {/* Controle de Status */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Activity size={14} className="text-blue-500" />
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Estágio do Funil</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {statuses.map(s => (
                <button
                  key={s}
                  onClick={() => onUpdate(lead.id, { status: s })}
                  className={clsx(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                    lead.status === s 
                      ? "bg-white text-black border-white shadow-xl shadow-white/5 scale-105" 
                      : "bg-white/5 text-zinc-500 border-white/5 hover:text-white"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          {/* Notas Internas */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <StickyNote size={14} className="text-amber-500" />
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Notas e Observações</h3>
            </div>
            <textarea
              value={lead.notes || ''}
              onChange={(e) => onUpdate(lead.id, { notes: e.target.value })}
              placeholder="Adicione observações internas sobre este contato..."
              className="w-full h-48 bg-white/5 border border-white/10 rounded-[2rem] p-6 text-sm text-white focus:border-blue-500 outline-none transition-all resize-none leading-relaxed"
            />
          </section>

          <footer className="pt-10 border-t border-white/5">
            <div className="flex items-center gap-3 text-zinc-600 text-[10px] font-black uppercase tracking-widest">
              <User size={12} />
              Capturado via {lead.source}
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsDrawer;