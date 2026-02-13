import React, { useState, useMemo } from 'react';
import { LeadCapture, LeadStatus } from '../../types';
import { updateStorage } from '../../lib/storage';
import { 
  Search, Filter, ChevronDown, X, Calendar, User, MessageSquare, 
  CheckCircle2, AlertCircle, DollarSign, Send, Save, Trash2, 
  Download, Activity, MoreHorizontal, UserCheck
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

  const stats = useMemo(() => {
    const total = leads.length;
    const novos = leads.filter(l => l.status === 'novo').length;
    const fechados = leads.filter(l => l.status === 'fechado').length;
    return { total, novos, fechados, conversion: total > 0 ? (fechados / total) * 100 : 0 };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const contactStr = lead.contact || '';
      const nameStr = lead.name || '';
      const matchesSearch = nameStr.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          contactStr.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, statusFilter]);

  const exportToCsv = () => {
    const headers = ['Nome', 'Contato', 'Status', 'Data', 'Mensagem'];
    const rows = leads.map(l => [l.name, l.contact || '', l.status, new Date(l.createdAt).toLocaleString(), l.message || '']);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "linkflow_leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateLeadStatus = (leadId: string, newStatus: LeadStatus) => {
    updateStorage(prev => ({
      ...prev,
      leads: prev.leads.map(l => l.id === leadId ? { 
        ...l, status: newStatus, 
        history: [...(l.history || []), { status: newStatus, date: new Date().toISOString() }] 
      } : l)
    }));
    if (selectedLead?.id === leadId) setSelectedLead(prev => prev ? ({...prev, status: newStatus}) : null);
  };

  const saveNote = () => {
    if (!selectedLead || !noteInput.trim()) return;
    const updatedNotes = `${selectedLead.notes || ''}\n[${new Date().toLocaleDateString()}]: ${noteInput}`;
    updateStorage(prev => ({ ...prev, leads: prev.leads.map(l => l.id === selectedLead.id ? { ...l, notes: updatedNotes } : l) }));
    setSelectedLead({ ...selectedLead, notes: updatedNotes });
    setNoteInput('');
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
        <div className="flex items-center gap-3">
          <button onClick={exportToCsv} className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-white/5">
            <Download size={16} /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="bg-zinc-900/40 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">Nome</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">Contato</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">Pipeline</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLeads.map(lead => {
                const contactStr = lead.contact || '';
                return (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-8">
                      <div className="font-black text-lg text-white">{lead.name}</div>
                      <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-mono">{new Date(lead.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-8">
                      <div className="flex items-center gap-3 text-sm font-bold text-zinc-400">
                        {contactStr.includes('@') ? <MessageSquare size={14} className="text-blue-500" /> : <UserCheck size={14} className="text-emerald-500" />}
                        {contactStr || 'Sem contato'}
                      </div>
                    </td>
                    <td className="p-8">
                      <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${statusConfig[lead.status]?.bg || 'bg-zinc-800'} ${statusConfig[lead.status]?.color || 'text-zinc-400'} border-current/20`}>
                        {statusConfig[lead.status]?.label || 'Desconhecido'}
                      </span>
                    </td>
                    <td className="p-8 text-right">
                      <button onClick={() => setSelectedLead(lead)} className="bg-white text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-white/5">
                        Ficha do Lead
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLead && (
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
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a href={(selectedLead.contact || '').includes('@') ? `mailto:${selectedLead.contact}` : `https://wa.me/${(selectedLead.contact || '').replace(/\D/g, '')}`} target="_blank" className="bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5">
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
                    <div className="text-xs font-black">Lead Capturado</div>
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