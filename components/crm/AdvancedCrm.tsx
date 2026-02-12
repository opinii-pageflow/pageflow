import React, { useState, useMemo } from 'react';
import { LeadCapture, LeadStatus } from '../../types';
import { updateStorage } from '../../lib/storage';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  MoreHorizontal, 
  X, 
  Calendar, 
  User, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  DollarSign,
  Archive,
  Send,
  Save,
  Trash2
} from 'lucide-react';
import clsx from 'clsx';

interface Props {
  leads: LeadCapture[];
}

const statusConfig: Record<LeadStatus, { label: string; color: string; bg: string }> = {
  'novo': { label: 'Novo Lead', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  'contatado': { label: 'Contatado', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  'negociando': { label: 'Em Negociação', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  'fechado': { label: 'Venda Fechada', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  'perdido': { label: 'Perdido', color: 'text-red-400', bg: 'bg-red-400/10' },
  'respondido': { label: 'Respondido', color: 'text-zinc-400', bg: 'bg-zinc-400/10' },
  'arquivado': { label: 'Arquivado', color: 'text-zinc-600', bg: 'bg-zinc-800' },
};

const AdvancedCrm: React.FC<Props> = ({ leads }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [selectedLead, setSelectedLead] = useState<LeadCapture | null>(null);
  const [noteInput, setNoteInput] = useState('');

  // Stats Calculation
  const stats = useMemo(() => {
    const total = leads.length;
    const novos = leads.filter(l => l.status === 'novo').length;
    const fechados = leads.filter(l => l.status === 'fechado').length;
    const conversion = total > 0 ? (fechados / total) * 100 : 0;
    return { total, novos, fechados, conversion };
  }, [leads]);

  // Filtering
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lead.contact.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, statusFilter]);

  // Actions
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
       setSelectedLead(prev => prev ? ({...prev, status: newStatus}) : null);
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

  const deleteLead = (id: string) => {
     if(window.confirm("Tem certeza? Esta ação não pode ser desfeita.")) {
        updateStorage(prev => ({
           ...prev,
           leads: prev.leads.filter(l => l.id !== id)
        }));
        setSelectedLead(null);
     }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem]">
          <div className="flex items-center gap-3 text-zinc-500 mb-2">
             <User size={16} />
             <span className="text-xs font-black uppercase tracking-widest">Total de Leads</span>
          </div>
          <div className="text-3xl font-black text-white">{stats.total}</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-[2rem]">
          <div className="flex items-center gap-3 text-blue-400 mb-2">
             <AlertCircle size={16} />
             <span className="text-xs font-black uppercase tracking-widest">Novos (Ação)</span>
          </div>
          <div className="text-3xl font-black text-blue-400">{stats.novos}</div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[2rem]">
          <div className="flex items-center gap-3 text-emerald-400 mb-2">
             <DollarSign size={16} />
             <span className="text-xs font-black uppercase tracking-widest">Negócios Fechados</span>
          </div>
          <div className="text-3xl font-black text-emerald-400">{stats.fechados}</div>
        </div>
        <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem]">
          <div className="flex items-center gap-3 text-zinc-500 mb-2">
             <Activity size={16} />
             <span className="text-xs font-black uppercase tracking-widest">Conversão</span>
          </div>
          <div className="text-3xl font-black text-white">{stats.conversion.toFixed(1)}%</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou contato..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900/60 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm font-medium focus:border-white/20 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
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

      {/* Table */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Lead</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Contato</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Data</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLeads.map(lead => (
                <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-6">
                    <div className="font-bold text-white">{lead.name}</div>
                    {lead.message && <div className="text-xs text-zinc-500 truncate max-w-[200px] mt-1">"{lead.message}"</div>}
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                      {lead.contact.includes('@') ? <Calendar size={14} /> : <MessageSquare size={14} />}
                      {lead.contact}
                    </div>
                  </td>
                  <td className="p-6">
                    <select 
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                      className={clsx(
                        "appearance-none px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border outline-none cursor-pointer",
                        statusConfig[lead.status].bg,
                        statusConfig[lead.status].color,
                        "border-transparent hover:border-white/10"
                      )}
                    >
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <option key={key} value={key} className="bg-zinc-900 text-zinc-300">
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-6 text-xs text-zinc-500 font-mono">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => setSelectedLead(lead)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-all"
                    >
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-zinc-500 text-sm">
                    Nenhum lead encontrado com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedLead(null)}></div>
          <div className="relative w-full max-w-md bg-zinc-900 border-l border-white/10 h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
             
             {/* Header */}
             <div className="sticky top-0 bg-zinc-900/90 backdrop-blur-xl border-b border-white/5 p-6 flex items-center justify-between z-10">
                <h3 className="text-xl font-black tracking-tight">Detalhes do Lead</h3>
                <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                  <X size={20} />
                </button>
             </div>

             <div className="p-8 space-y-8">
                {/* Info Card */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-2xl font-black">
                        {selectedLead.name[0]}
                     </div>
                     <div>
                        <h2 className="text-2xl font-bold">{selectedLead.name}</h2>
                        <div className="text-sm text-zinc-400">{selectedLead.contact}</div>
                     </div>
                  </div>

                  {selectedLead.message && (
                    <div className="bg-zinc-800/40 p-4 rounded-2xl border border-white/5">
                       <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Mensagem Inicial</div>
                       <p className="text-sm text-zinc-300 italic">"{selectedLead.message}"</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                     <a 
                       href={selectedLead.contact.includes('@') ? `mailto:${selectedLead.contact}` : `https://wa.me/${selectedLead.contact.replace(/\D/g, '')}`}
                       target="_blank"
                       className="flex-1 bg-white text-black py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all"
                     >
                        <Send size={14} /> Contatar
                     </a>
                     <button 
                       onClick={() => deleteLead(selectedLead.id)}
                       className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all"
                     >
                        <Trash2 size={18} />
                     </button>
                  </div>
                </div>

                <div className="h-px bg-white/5"></div>

                {/* Status Changer */}
                <div className="space-y-3">
                   <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Pipeline Stage</div>
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

                <div className="h-px bg-white/5"></div>

                {/* Notes */}
                <div className="space-y-3">
                   <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Notas Internas</div>
                   {selectedLead.notes && (
                      <div className="bg-yellow-500/5 border border-yellow-500/10 p-4 rounded-2xl text-xs text-yellow-200/80 whitespace-pre-wrap font-mono mb-4">
                        {selectedLead.notes}
                      </div>
                   )}
                   <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        placeholder="Adicionar observação..."
                        className="flex-1 bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/20"
                        onKeyDown={(e) => e.key === 'Enter' && saveNote()}
                      />
                      <button 
                        onClick={saveNote}
                        className="p-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-white transition-all"
                      >
                         <Save size={18} />
                      </button>
                   </div>
                </div>

                {/* Simple History */}
                <div className="space-y-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Histórico de Atividade</div>
                    <div className="space-y-4 pl-2 border-l border-white/10">
                       <div className="relative pl-6">
                          <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                          <div className="text-xs font-bold text-white">Lead Capturado</div>
                          <div className="text-[10px] text-zinc-500">{new Date(selectedLead.createdAt).toLocaleString()}</div>
                       </div>
                       {selectedLead.history?.map((h, i) => (
                          <div key={i} className="relative pl-6">
                             <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-zinc-600"></div>
                             <div className="text-xs font-bold text-zinc-300">
                                Mudou para <span className={statusConfig[h.status]?.color}>{statusConfig[h.status]?.label}</span>
                             </div>
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