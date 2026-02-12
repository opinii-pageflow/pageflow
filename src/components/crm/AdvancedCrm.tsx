"use client";

import React, { useState, useMemo } from 'react';
import { LeadCapture, LeadStatus } from '../../types';
import { updateStorage } from '../../lib/storage';
import { 
  Search, 
  X, 
  User, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  DollarSign,
  Send,
  Save,
  Trash2,
  TrendingUp,
  ChevronDown
} from 'lucide-react';
import clsx from 'clsx';

interface Props {
  leads: LeadCapture[];
}

const statusConfig: Record<LeadStatus, { label: string; color: string; bg: string }> = {
  'novo': { label: 'Novo Lead', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  'contatado': { label: 'Contatado', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  'negociando': { label: 'Negociando', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  'fechado': { label: 'Fechado', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  'perdido': { label: 'Perdido', color: 'text-red-400', bg: 'bg-red-400/10' },
};

const AdvancedCrm: React.FC<Props> = ({ leads }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [selectedLead, setSelectedLead] = useState<LeadCapture | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const stats = useMemo(() => {
    const total = leads.length;
    const novos = leads.filter(l => l.status === 'novo').length;
    const fechados = leads.filter(l => l.status === 'fechado').length;
    const conversion = total > 0 ? (fechados / total) * 100 : 0;
    return { total, novos, fechados, conversion };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lead.contact.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, statusFilter]);

  const updateLeadStatus = (leadId: string, newStatus: LeadStatus) => {
    updateStorage(prev => ({
      ...prev,
      leads: prev.leads.map(l => {
        if (l.id === leadId) {
          const historyItem = { status: newStatus, date: new Date().toISOString() };
          return { ...l, status: newStatus, history: [...(l.history || []), historyItem] };
        }
        return l;
      })
    }));
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead(prev => prev ? ({ ...prev, status: newStatus, history: [...(prev.history || []), { status: newStatus, date: new Date().toISOString() }] }) : null);
    }
  };

  const saveNote = () => {
    if (!selectedLead || !noteInput.trim()) return;
    const updatedNotes = selectedLead.notes 
      ? `${selectedLead.notes}\n\n[${new Date().toLocaleDateString()}]: ${noteInput}` 
      : `[${new Date().toLocaleDateString()}]: ${noteInput}`;

    updateStorage(prev => ({
      ...prev,
      leads: prev.leads.map(l => l.id === selectedLead.id ? { ...l, notes: updatedNotes } : l)
    }));
    
    setSelectedLead({ ...selectedLead, notes: updatedNotes });
    setNoteInput('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem]">
          <div className="flex items-center gap-3 text-zinc-500 mb-2">
             <User size={16} />
             <span className="text-[10px] font-black uppercase tracking-widest">Total de Leads</span>
          </div>
          <div className="text-3xl font-black text-white">{stats.total}</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-[2rem]">
          <div className="flex items-center gap-3 text-blue-400 mb-2">
             <AlertCircle size={16} />
             <span className="text-[10px] font-black uppercase tracking-widest">Leads Novos</span>
          </div>
          <div className="text-3xl font-black text-blue-400">{stats.novos}</div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[2rem]">
          <div className="flex items-center gap-3 text-emerald-400 mb-2">
             <CheckCircle2 size={16} />
             <span className="text-[10px] font-black uppercase tracking-widest">Fechados</span>
          </div>
          <div className="text-3xl font-black text-emerald-400">{stats.fechados}</div>
        </div>
        <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem]">
          <div className="flex items-center gap-3 text-zinc-500 mb-2">
             <TrendingUp size={16} />
             <span className="text-[10px] font-black uppercase tracking-widest">Conversão</span>
          </div>
          <div className="text-3xl font-black text-white">{stats.conversion.toFixed(1)}%</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input 
            type="text" 
            placeholder="Buscar leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900/60 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm focus:border-white/20 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          {(['all', 'novo', 'negociando', 'fechado'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={clsx(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border",
                statusFilter === status 
                  ? "bg-white text-black border-white" 
                  : "bg-transparent text-zinc-500 border-white/5 hover:border-white/20"
              )}
            >
              {status === 'all' ? 'Todos' : statusConfig[status].label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Nome</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Contato</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Data</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLeads.map(lead => (
                <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-6 font-bold text-white">{lead.name}</td>
                  <td className="p-6 text-sm text-zinc-400">{lead.contact}</td>
                  <td className="p-6">
                    <select 
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                      className={clsx(
                        "appearance-none px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border outline-none",
                        statusConfig[lead.status].bg,
                        statusConfig[lead.status].color,
                        "border-transparent hover:border-white/10"
                      )}
                    >
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <option key={key} value={key} className="bg-zinc-900">{config.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-6 text-xs text-zinc-500 font-mono">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => setSelectedLead(lead)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all"
                    >
                      Ver Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLead && (
        <div className="fixed inset-0 z-[500] flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedLead(null)}></div>
          <div className="relative w-full max-w-md bg-zinc-900 border-l border-white/10 h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
             <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-black">Detalhes do Lead</h3>
                <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-white/5 rounded-full transition-all">
                  <X size={20} />
                </button>
             </div>

             <div className="p-8 space-y-8">
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Nome</div>
                    <div className="text-lg font-bold">{selectedLead.name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Contato</div>
                    <div className="text-sm text-blue-400 font-mono">{selectedLead.contact}</div>
                  </div>
                  {selectedLead.message && (
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Mensagem</div>
                      <div className="text-sm text-zinc-300 italic">"{selectedLead.message}"</div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                   <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Alterar Status</div>
                   <div className="grid grid-cols-2 gap-2">
                      {(['novo', 'contatado', 'negociando', 'fechado', 'perdido'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => updateLeadStatus(selectedLead.id, s)}
                          className={clsx(
                             "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                             selectedLead.status === s 
                               ? `${statusConfig[s].bg} ${statusConfig[s].color} border-current` 
                               : "bg-zinc-800 border-transparent text-zinc-500 hover:border-white/10"
                          )}
                        >
                           {statusConfig[s].label}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-3">
                   <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Notas Internas</div>
                   {selectedLead.notes && (
                      <div className="bg-black/40 border border-white/5 p-4 rounded-2xl text-xs text-zinc-400 whitespace-pre-wrap font-mono mb-4">
                        {selectedLead.notes}
                      </div>
                   )}
                   <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        placeholder="Adicionar nota..."
                        className="flex-1 bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none"
                      />
                      <button onClick={saveNote} className="p-3 bg-white text-black rounded-xl transition-all">
                         <Save size={18} />
                      </button>
                   </div>
                </div>

                <div className="space-y-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Histórico</div>
                    <div className="space-y-4 pl-4 border-l border-white/10">
                       <div className="relative">
                          <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                          <div className="text-xs font-bold">Capturado</div>
                          <div className="text-[10px] text-zinc-500">{new Date(selectedLead.createdAt).toLocaleString()}</div>
                       </div>
                       {selectedLead.history?.map((h, i) => (
                          <div key={i} className="relative">
                             <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                             <div className="text-xs font-bold">Status: <span className={statusConfig[h.status]?.color}>{statusConfig[h.status]?.label}</span></div>
                             <div className="text-[10px] text-zinc-500">{new Date(h.date).toLocaleString()}</div>
                          </div>
                       ))}
                    </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedCrm;