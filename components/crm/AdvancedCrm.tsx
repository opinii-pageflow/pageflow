import React, { useState, useMemo, useEffect } from 'react';
import { LeadCapture, LeadStatus, PlanType } from '../../types';
import { leadsApi } from '../../lib/api/leads';
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
  onRefresh?: () => void;
}

const statusConfig: Record<LeadStatus, { label: string; color: string; bg: string; shadow: string }> = {
  'novo': { label: 'Novo Lead', color: 'text-neon-blue', bg: 'bg-neon-blue/10', shadow: 'shadow-[0_0_15px_rgba(0,242,255,0.2)]' },
  'contatado': { label: 'Contatado', color: 'text-amber-400', bg: 'bg-amber-400/10', shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.1)]' },
  'negociando': { label: 'Em Negociação', color: 'text-purple-400', bg: 'bg-purple-400/10', shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.1)]' },
  'fechado': { label: 'Venda Fechada', color: 'text-neon-green', bg: 'bg-neon-green/10', shadow: 'shadow-[0_0_15px_rgba(57,255,20,0.2)]' },
  'perdido': { label: 'Perdido', color: 'text-rose-500', bg: 'bg-rose-500/10', shadow: 'shadow-[0_0_15px_rgba(244,63,94,0.1)]' },
  'respondido': { label: 'Respondido', color: 'text-zinc-400', bg: 'bg-white/5', shadow: '' },
  'arquivado': { label: 'Arquivado', color: 'text-zinc-600', bg: 'bg-zinc-800', shadow: '' },
};

const AdvancedCrm: React.FC<Props> = ({ leads: initialLeads, clientPlan, onRefresh }) => {
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
          : lead.captureType !== 'nps';

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
    link.setAttribute("download", "pageflow_leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    if (!hasFullAccess) return;
    try {
      await leadsApi.update(leadId, { status: newStatus });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Erro ao atualizar status do lead.");
    }
  };

  const saveNote = async () => {
    if (!selectedLead || !noteInput.trim() || !hasFullAccess) return;
    const ts = new Date().toLocaleDateString();
    const updatedNotes = selectedLead.notes ? `${selectedLead.notes}\n[${ts}]: ${noteInput}` : `[${ts}]: ${noteInput}`;

    try {
      await leadsApi.update(selectedLead.id, { notes: updatedNotes });
      setSelectedLead({ ...selectedLead, notes: updatedNotes });
      setNoteInput('');
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Erro ao salvar nota.");
    }
  };

  const deleteLead = async (leadId: string) => {
    if (!window.confirm("Excluir lead permanentemente?")) return;
    try {
      await leadsApi.delete(leadId);
      if (onRefresh) onRefresh();
      if (selectedLead?.id === leadId) setSelectedLead(null);
    } catch (err) {
      alert("Erro ao excluir lead.");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* 1. KPIs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Leads Totais', val: stats.total, icon: User, color: 'text-white', glass: 'glass-neon-blue', glowColor: 'rgba(255,255,255,0.05)' },
          { label: 'Novos Ativos', val: stats.novos, icon: AlertCircle, color: 'text-neon-blue', glass: 'glass-neon-blue', glowColor: 'rgba(0,242,255,0.1)' },
          { label: 'Conversões', val: stats.fechados, icon: DollarSign, color: 'text-neon-green', glass: 'glass-neon-green', glowColor: 'rgba(57,255,20,0.1)' },
          { label: 'Taxa de Fechamento', val: `${stats.conversion.toFixed(1)}%`, icon: Activity, color: 'text-white', glass: 'glass-neon-blue', glowColor: 'rgba(255,255,255,0.05)' },
        ].map((s, i) => (
          <div key={i} className={clsx(
            "p-8 rounded-[2.5rem] transition-all duration-500 group relative overflow-hidden border border-white/5 hover:border-white/10",
            s.glass
          )}>
            <div
              className="absolute -top-10 -right-10 w-40 h-40 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-50"
              style={{ backgroundColor: s.glowColor }}
            />
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={clsx(
                "p-3 rounded-2xl bg-white/5 transition-all duration-500 group-hover:scale-110 shadow-2xl",
                s.color
              )}>
                <s.icon size={20} className="filter drop-shadow-[0_0_8px_currentColor]" />
              </div>
              <div className="text-[10px] font-black px-3 py-1 rounded-full bg-white/5 text-zinc-500 uppercase tracking-widest border border-white/5">
                Realtime
              </div>
            </div>
            <div className="relative z-10">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1 group-hover:text-zinc-400 transition-colors uppercase italic">{s.label}</div>
              <div className={clsx("text-4xl font-black tracking-tighter leading-none transition-all duration-500 group-hover:scale-110 origin-left", s.color)}>{s.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Search & Controls - ALINHAMENTO CRM OTIMIZADO */}
      <div className="flex flex-col lg:flex-row gap-4 items-center bg-white/[0.02] backdrop-blur-xl border border-white/5 p-4 rounded-[1.5rem] lg:rounded-full">
        {/* Campo de Busca */}
        <div className="relative w-full lg:flex-1 group">
          <div className="absolute inset-0 bg-neon-blue blur-2xl opacity-0 group-focus-within:opacity-10 transition-opacity rounded-full" />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-neon-blue transition-colors z-10" size={18} />
          <input
            type="text"
            placeholder="Rastrear leads pelo nome ou contato..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 bg-black/40 border border-white/5 rounded-full pl-14 pr-6 text-sm font-bold focus:border-neon-blue/40 outline-none transition-all placeholder:text-zinc-700 relative z-10"
          />
        </div>

        {/* Botão Exportar */}
        <button
          onClick={exportToCsv}
          disabled={!hasExportAccess}
          className={clsx(
            "w-full lg:w-auto h-12 px-8 rounded-full transition-all flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] relative overflow-hidden group/btn",
            hasExportAccess
              ? "bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/5"
              : "bg-zinc-900/50 text-zinc-600 border border-white/5 opacity-50 cursor-not-allowed"
          )}
        >
          {hasExportAccess ? <Download size={16} strokeWidth={3} className="group-hover/btn:scale-110 transition-transform" /> : <Lock size={16} />}
          <span>Exportar Protocolo</span>
        </button>
      </div>

      {/* 3. Modernized Pipeline Table */}
      <div className="glass-neon-blue rounded-[3rem] overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="p-10 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Protocolo de Origem</th>
                <th className="p-10 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Ponto de Contato</th>
                <th className="p-10 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Pipeline Status</th>
                <th className="p-10 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 text-right">Comandos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLeads.map(lead => {
                const contactStr = lead.contact || '';
                const isNps = lead.captureType === 'nps';
                const config = statusConfig[lead.status] || statusConfig['novo'];

                return (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-all duration-300 group">
                    <td className="p-10">
                      <div className="flex items-center gap-5">
                        <div className={clsx(
                          "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110",
                          isNps ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-neon-blue/10 border-neon-blue/20 text-neon-blue"
                        )}>
                          {isNps ? <Star size={18} className="filter drop-shadow-[0_0_8px_#f59e0b]" /> : <FileText size={18} className="filter drop-shadow-[0_0_8px_#00f2ff]" />}
                        </div>
                        <div>
                          <div className="font-black text-xl text-white tracking-tight group-hover:text-neon-blue transition-colors">{lead.name}</div>
                          <div className="text-[10px] text-zinc-600 mt-2 uppercase tracking-[0.2em] font-black flex items-center gap-3">
                            {new Date(lead.createdAt).toLocaleDateString()}
                            <span className="w-1 h-1 rounded-full bg-zinc-800" />
                            {isNps ? 'Intel via NPS' : 'Lead via Form'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-10">
                      <div className="flex items-center gap-4 text-xs font-black text-zinc-400 group-hover:text-zinc-200 transition-colors">
                        <div className={clsx(
                          "p-2 rounded-lg bg-white/5",
                          contactStr.includes('@') ? "text-neon-blue" : "text-neon-green"
                        )}>
                          {contactStr.includes('@') ? <MessageSquare size={14} /> : <UserCheck size={14} />}
                        </div>
                        {contactStr || 'Sem identificação'}
                      </div>
                    </td>
                    <td className="p-10">
                      {hasFullAccess ? (
                        <div className={clsx(
                          "inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-all duration-500",
                          config.bg,
                          config.color,
                          config.shadow,
                          "border-current/10"
                        )}>
                          <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                          {config.label}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-[10px] font-black text-zinc-700 uppercase tracking-widest italic">
                          <Lock size={14} /> Dados Criptografados
                        </div>
                      )}
                    </td>
                    <td className="p-10 text-right">
                      <div className="flex items-center justify-end gap-3 text-zinc-600">
                        {hasFullAccess ? (
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="bg-neon-blue/10 text-neon-blue border border-neon-blue/20 px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-neon-blue hover:text-black transition-all active:scale-95 shadow-lg group-hover:shadow-neon-blue/20"
                          >
                            Analisar Intel
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate('/app/upgrade')}
                            className="bg-white text-black px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95 shadow-xl flex items-center gap-3"
                          >
                            <Zap size={14} strokeWidth={3} /> Upgrade
                          </button>
                        )}
                        <button
                          onClick={() => deleteLead(lead.id)}
                          className="p-3.5 text-zinc-800 hover:text-rose-500 transition-all hover:bg-rose-500/10 rounded-2xl border border-transparent hover:border-rose-500/20"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredLeads.length === 0 && (
            <div className="py-32 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/5">
                <User size={32} className="text-zinc-800" />
              </div>
              <div className="text-zinc-600 font-black uppercase tracking-[0.4em] text-[10px]">Aguardando Sinais de Leads</div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Enterprise Lead Profile Drawer */}
      {selectedLead && hasFullAccess && (
        <div className="fixed inset-0 z-[500] flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setSelectedLead(null)}></div>
          <div className="relative w-full max-w-2xl bg-[#050505] border-l border-white/10 h-full shadow-[0_0_100px_rgba(0,0,0,1)] overflow-y-auto animate-in slide-in-from-right duration-700 p-12 custom-scrollbar">

            <header className="flex items-center justify-between mb-16 px-2">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-8 bg-neon-blue rounded-full shadow-[0_0_15px_rgba(0,242,255,0.5)]" />
                <h2 className="text-4xl font-black tracking-tighter italic">Relatório <span className="text-neon-blue">Intel</span></h2>
              </div>
              <button onClick={() => setSelectedLead(null)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all active:scale-90 border border-white/5"><X size={24} /></button>
            </header>

            <div className="space-y-12">
              {/* Profile Bio Section */}
              <div className="flex flex-col sm:flex-row items-center gap-10 p-10 glass-neon-blue rounded-[3rem] relative overflow-hidden group">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-neon-blue/5 rounded-full blur-[60px]" />

                <div className="w-28 h-28 bg-gradient-to-br from-neon-blue to-indigo-600 rounded-[2.5rem] flex items-center justify-center text-4xl font-black text-black shadow-[0_0_40px_rgba(0,242,255,0.3)] group-hover:scale-110 transition-transform duration-700">
                  {(selectedLead.name || 'L')[0]}
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tight mb-2 text-white">{selectedLead.name}</h3>
                  <p className="text-zinc-500 font-medium text-lg mb-4">{selectedLead.contact || 'Contato Não Identificado'}</p>
                  {selectedLead.captureType === 'nps' && (
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black uppercase tracking-[0.2em] text-amber-500">
                      <Star size={12} className="fill-current" /> Master Insight: NPS Network
                    </div>
                  )}
                </div>
              </div>

              {/* Action Hub */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href={(selectedLead.contact || '').includes('@') ? `mailto:${selectedLead.contact}` : `https://wa.me/${(selectedLead.contact || '').replace(/\D/g, '')}`}
                  target="_blank"
                  className="bg-white text-black py-6 rounded-2xl font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl relative overflow-hidden group/cta"
                >
                  <Send size={20} strokeWidth={3} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  Engajar Lead
                </a>
                <div className="relative group/sel">
                  <select
                    value={selectedLead.status}
                    onChange={(e) => updateLeadStatus(selectedLead.id, e.target.value as LeadStatus)}
                    className="w-full bg-black border border-white/5 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl px-8 py-6 outline-none appearance-none cursor-pointer hover:bg-white/10 transition-all [&>option]:bg-zinc-950 [&>option]:text-white"
                  >
                    {Object.entries(statusConfig).map(([key, config]) => <option key={key} value={key} className="bg-zinc-950 text-white">{config.label}</option>)}
                  </select>
                  <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600 group-hover/sel:text-neon-blue transition-colors" />
                </div>
              </div>

              {/* Data Blocks */}
              <div className="grid grid-cols-1 gap-8">
                {selectedLead.message && (
                  <div className="bg-white/[0.02] p-10 rounded-[3rem] border border-white/5 space-y-4 relative">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-2">Original Input Stream</div>
                    <div className="text-lg text-zinc-400 leading-relaxed font-medium italic relative z-10">
                      <span className="text-3xl text-neon-blue opacity-50 mr-2">"</span>
                      {selectedLead.message}
                      <span className="text-3xl text-neon-blue opacity-50 ml-2">"</span>
                    </div>
                  </div>
                )}

                <div className="glass-neon-blue p-10 rounded-[3rem] space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Notas de Negociação</div>
                    <Activity size={16} className="text-zinc-800" />
                  </div>

                  {selectedLead.notes && (
                    <div className="bg-black/60 p-6 rounded-2xl text-[11px] text-zinc-400 whitespace-pre-wrap font-mono leading-relaxed border border-white/5 shadow-inner">
                      {selectedLead.notes}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="Registrar nova interação..."
                      className="flex-1 bg-black/60 border border-white/5 rounded-2xl px-6 py-5 text-sm font-medium outline-none focus:border-neon-blue/40 transition-all placeholder:text-zinc-700"
                      onKeyDown={(e) => e.key === 'Enter' && saveNote()}
                    />
                    <button
                      onClick={saveNote}
                      className="p-5 bg-neon-blue text-black rounded-2xl transition-all active:scale-95 shadow-[0_0_20px_rgba(0,242,255,0.2)] hover:shadow-[0_0_30px_rgba(0,242,255,0.3)]"
                    >
                      <Save size={22} strokeWidth={3} />
                    </button>
                  </div>
                </div>

                <div className="space-y-10 px-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-3">
                    <Activity size={14} /> Histórico de Atividades
                  </div>
                  <div className="space-y-10 pl-4 border-l-2 border-white/5 relative">
                    <div className="relative pl-10 pb-4">
                      <div className="absolute -left-[11px] top-0.5 w-5 h-5 rounded-full bg-black border-2 border-neon-blue shadow-[0_0_15px_rgba(0,242,255,0.5)] z-10" />
                      <div className="text-sm font-black text-white">Protocolo Capturado via {selectedLead.captureType === 'nps' ? 'Central de NPS' : 'Formulário Direto'}</div>
                      <div className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-1">{new Date(selectedLead.createdAt).toLocaleString()}</div>
                    </div>
                    {selectedLead.history?.map((h, i) => (
                      <div key={i} className="relative pl-10 pb-4">
                        <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-zinc-900 border-2 border-white/10 z-10" />
                        <div className="text-sm font-black text-zinc-400">Transição de Pipeline: <span className={clsx("ml-2 px-3 py-0.5 rounded-full text-[9px]", statusConfig[h.status]?.color, statusConfig[h.status]?.bg)}>{statusConfig[h.status]?.label}</span></div>
                        <div className="text-[10px] text-zinc-600 font-black tracking-widest mt-1 uppercase">{new Date(h.date).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer space to avoid overlap with bottom */}
            <div className="h-20" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedCrm;