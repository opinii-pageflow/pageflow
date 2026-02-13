import React, { useState, useMemo, useEffect } from 'react';
import { LeadCapture, LeadStatus, PlanType } from '../../types';
import { updateStorage } from '../../lib/storage';
import { canAccessFeature } from '../../lib/permissions';
import { 
  Search, ChevronDown, X, User, MessageSquare, 
  AlertCircle, DollarSign, Send, Save, Trash2, 
  Download, Activity, UserCheck, Lock, Zap, Filter,
  Star,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

interface Props {
  leads: LeadCapture[];
  clientPlan?: PlanType;
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

const AdvancedCrm: React.FC<Props> = ({ leads: initialLeads, clientPlan }) => {
  const navigate = useNavigate();
  const [localLeads, setLocalLeads] = useState<LeadCapture[]>(initialLeads);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [originFilter, setOriginFilter] = useState<'all' | 'form' | 'nps'>('all');
  const [selectedLead, setSelectedLead] = useState<LeadCapture | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const hasExportAccess = canAccessFeature(clientPlan, 'leads_export');
  const hasFullAccess = canAccessFeature(clientPlan, 'leads_full_details');

  useEffect(() => {
    setLocalLeads(initialLeads);
  }, [initialLeads]);

  const stats = useMemo(() => {
    const total = localLeads.length;
    const novos = localLeads.filter(l => l.status === 'novo').length;
    const fechados = localLeads.filter(l => l.status === 'fechado').length;
    return { total, novos, fechados, conversion: total > 0 ? (fechados / total) * 100 : 0 };
  }, [localLeads]);

  const filteredLeads = useMemo(() => {
    return localLeads.filter(lead => {
      const contactStr = lead.contact || '';
      const nameStr = lead.name || '';
      const matchesSearch = nameStr.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          contactStr.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      
      const matchesOrigin = originFilter === 'all' 
        ? true 
        : originFilter === 'nps' 
          ? lead.captureType === 'nps' 
          : lead.captureType !== 'nps'; // Default é form

      return matchesSearch && matchesStatus && matchesOrigin;
    });
  }, [localLeads, searchTerm, statusFilter, originFilter]);

  const exportToCsv = () => {
    if (!hasExportAccess) return;
    const headers = ['Nome', 'Contato', 'Status', 'Origem', 'Data', 'Mensagem'];
    const rows = localLeads.map(l => [
      l.name, 
      l.contact || '', 
      l.status, 
      l.captureType === 'nps' ? 'NPS' : 'Formulário',
      new Date(l.createdAt).toLocaleString(), 
      l.message || ''
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "linkflow_leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateLeadStatus = (leadId: string, newStatus: LeadStatus) => {
    if (!hasFullAccess) return;
    const ts = new Date().toISOString();
    updateStorage(prev => ({
      ...prev,
      leads: prev.leads.map(l => l.id === leadId ? { ...l, status: newStatus, history: [...(l.history || []), { status: newStatus, date: ts }] } : l)
    }));
    setLocalLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus, history: [...(l.history || []), { status: newStatus, date: ts }] } : l));
    if (selectedLead?.id === leadId) setSelectedLead(prev => prev ? ({...prev, status: newStatus, history: [...(prev.history || []), { status: newStatus, date: ts }]}) : null);
  };

  const saveNote = () => {
    if (!selectedLead || !noteInput.trim() || !hasFullAccess) return;
    const ts = new Date().toLocaleDateString();
    const updatedNotes = selectedLead.notes ? `${selectedLead.notes}\n[${ts}]: ${noteInput}` : `[${ts}]: ${noteInput}`;
    updateStorage(prev => ({ ...prev, leads: prev.leads.map(l => l.id === selectedLead.id ? { ...l, notes: updatedNotes } : l) }));
    setLocalLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, notes: updatedNotes } : l));
    setSelectedLead({ ...selectedLead, notes: updatedNotes });
    setNoteInput('');
  };

  const deleteLead = (leadId: string) => {
    if (!window.confirm("Excluir lead permanentemente?")) return;
    updateStorage(prev => ({ ...prev, leads: prev.leads.filter(l => l.id !== leadId) }));
    setLocalLeads(prev => prev.filter(l => l.id !== leadId));
    if (selectedLead?.id === leadId) setSelectedLead(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Leads', val: stats.total, icon: User, color: 'text-white', bg: 'bg-zinc-900/40' },
          { label: 'Novos', val: stats.novos, icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Fechados', val: stats.fechados, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Conversão', val: `${stats.conversion.toFixed(1)}%`, icon: Activity, color: 'text-white', bg: 'bg-zinc-900/40' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} border border-white/5 p-8 rounded-[2.5rem] shadow-2xl`}>
            <div className={`flex items-center gap-3 ${s.color} opacity-60 mb-3`}>
              <s.icon size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
            </div>
            <div className={`text-4xl font-black ${s.color}`}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-900/40 p-4 rounded-[2rem] border border-white/5">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input 
            type="text" placeholder="Pesquisar leads..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold focus:border-white/20 outline-none transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Filtro de Origem */}
          <div className="relative">
            <select 
              value={originFilter} 
              onChange={(e) => setOriginFilter(e.target.value as any)}
              className="appearance-none bg-zinc-900 text-white pl-10 pr-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 outline-none cursor-pointer hover:bg-zinc-800 transition-all"
            >
              <option value="all">Todas Origens</option>
              <option value="form">Formulário</option>
              <option value="nps">Avaliação NPS</option>
            </select>
            <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>

          <button 
            onClick={exportToCsv} 
            disabled={!hasExportAccess}
            className={clsx(
              "p-4 rounded-2xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border",
              hasExportAccess ? "bg-white/5 hover:bg-white/10 text-white border-white/5" : "bg-zinc-900 text-zinc-600 border-white/5 opacity-50 cursor-not-allowed"
            )}
          >
            {hasExportAccess ? <Download size={16} /> : <Lock size={16} />} 
            CSV
          </button>
        </div>
      </div>

      <div className="bg-zinc-900/40 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">Nome / Origem</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">Contato</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">Pipeline</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLeads.map(lead => {
                const contactStr = lead.contact || '';
                const isNps = lead.captureType === 'nps';
                return (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-8">
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          "w-8 h-8 rounded-lg flex items-center justify-center border",
                          isNps ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-blue-500/10 border-blue-500/20 text-blue-500"
                        )}>
                          {isNps ? <Star size={14} /> : <FileText size={14} />}
                        </div>
                        <div>
                          <div className="font-black text-lg text-white">{lead.name}</div>
                          <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-mono flex items-center gap-2">
                            {new Date(lead.createdAt).toLocaleDateString()} • {isNps ? 'Via NPS' : 'Via Formulário'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex items-center gap-3 text-sm font-bold text-zinc-400">
                        {contactStr.includes('@') ? <MessageSquare size={14} className="text-blue-500" /> : <UserCheck size={14} className="text-emerald-500" />}
                        {contactStr || 'Sem contato'}
                      </div>
                    </td>
                    <td className="p-8">
                      {hasFullAccess ? (
                        <span className={clsx(
                          "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-current/20",
                          statusConfig[lead.status]?.bg || 'bg-zinc-800',
                          statusConfig[lead.status]?.color || 'text-zinc-400'
                        )}>
                          {statusConfig[lead.status]?.label || 'Desconhecido'}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2 text-[9px] font-black text-zinc-700 uppercase tracking-widest">
                          <Lock size={12} /> Bloqueado
                        </div>
                      )}
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {hasFullAccess ? (
                          <button 
                            onClick={() => setSelectedLead(lead)} 
                            className="bg-white text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95 shadow-lg"
                          >
                            Ficha
                          </button>
                        ) : (
                          <button 
                            onClick={() => navigate('/app/upgrade')} 
                            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all active:scale-95 shadow-lg flex items-center gap-2"
                          >
                            <Zap size={14} /> Upgrade
                          </button>
                        )}
                        <button onClick={() => deleteLead(lead.id)} className="p-3 text-zinc-600 hover:text-red-500 transition-all hover:bg-red-500/10 rounded-xl">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredLeads.length === 0 && (
            <div className="p-20 text-center">
              <User size={48} className="mx-auto text-zinc-800 mb-4" />
              <div className="text-zinc-600 font-black uppercase tracking-widest text-xs">Nenhum lead encontrado</div>
            </div>
          )}
        </div>
      </div>

      {selectedLead && hasFullAccess && (
        <div className="fixed inset-0 z-[500] flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedLead(null)}></div>
          <div className="relative w-full max-w-xl bg-[#050505] border-l border-white/10 h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-500 p-10 space-y-12">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black tracking-tighter">Perfil do Lead</h2>
              <button onClick={() => setSelectedLead(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all"><X size={24} /></button>
            </div>
            
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2rem] flex items-center justify-center text-4xl font-black shadow-2xl">
                  {(selectedLead.name || 'L')[0]}
                </div>
                <div>
                  <h3 className="text-2xl font-black">{selectedLead.name}</h3>
                  <p className="text-zinc-500 font-medium">{selectedLead.contact || 'Sem contato'}</p>
                  {selectedLead.captureType === 'nps' && (
                    <span className="inline-flex mt-2 items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black uppercase tracking-widest text-amber-500">
                      <Star size={10} /> Origem: NPS
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a href={(selectedLead.contact || '').includes('@') ? `mailto:${selectedLead.contact}` : `https://wa.me/${(selectedLead.contact || '').replace(/\D/g, '')}`} target="_blank" className="bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-95 shadow-xl">
                  <Send size={18} /> Iniciar Contato
                </a>
                <div className="relative">
                  <select 
                    value={selectedLead.status} onChange={(e) => updateLeadStatus(selectedLead.id, e.target.value as LeadStatus)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-6 py-5 text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer"
                  >
                    {Object.entries(statusConfig).map(([key, config]) => <option key={key} value={key}>{config.label}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500" />
                </div>
              </div>

              {/* Mensagem original do lead (se houver, e.g. comentário NPS) */}
              {selectedLead.message && (
                <div className="bg-zinc-900/40 p-6 rounded-[2rem] border border-white/5 space-y-2">
                   <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Mensagem Inicial</div>
                   <p className="text-sm text-zinc-300 italic">"{selectedLead.message}"</p>
                </div>
              )}

              <div className="bg-zinc-900/40 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Notas de Negociação</div>
                {selectedLead.notes && <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl text-xs text-amber-200/80 whitespace-pre-wrap font-mono leading-relaxed">{selectedLead.notes}</div>}
                <div className="flex gap-3">
                  <input type="text" value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder="Adicionar anotação..." className="flex-1 bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm outline-none" onKeyDown={(e) => e.key === 'Enter' && saveNote()} />
                  <button onClick={saveNote} className="p-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all"><Save size={20} /></button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Atividade</div>
                <div className="space-y-6 pl-2 border-l border-white/10">
                  <div className="relative pl-8">
                    <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    <div className="text-xs font-black">Lead Capturado ({selectedLead.captureType === 'nps' ? 'NPS' : 'Form'})</div>
                    <div className="text-[10px] text-zinc-600">{new Date(selectedLead.createdAt).toLocaleString()}</div>
                  </div>
                  {selectedLead.history?.map((h, i) => (
                    <div key={i} className="relative pl-8">
                      <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
                      <div className="text-xs font-black text-zinc-400">Status alterado para <span className={statusConfig[h.status]?.color || 'text-zinc-400'}>{statusConfig[h.status]?.label || 'Desconhecido'}</span></div>
                      <div className="text-[10px] text-zinc-600">{new Date(h.date).toLocaleString()}</div>
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