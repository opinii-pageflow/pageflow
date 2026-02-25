import React, { useState, useEffect, useMemo } from 'react';
import { clientsApi } from '../../lib/api/clients';
import { profilesApi } from '../../lib/api/profiles';
import CompanyModal from '../../components/admin/CompanyModal';
import {
  UserPlus,
  CheckCircle2,
  XCircle,
  X,
  Zap,
  Edit3,
  Trash2,
  Gift,
  Settings,
  ShieldCheck,
  Mail,
  Lock,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Award,
  Search,
  UserCheck,
  Filter,
  ArrowUpDown,
  Users,
  AlertCircle
} from 'lucide-react';
import TopBar from '../../components/common/TopBar';
import { Client, PlanType, Profile } from '../../types';
import { PLANS, PLAN_TYPES } from '../../lib/plans';
import { PLANS_CONFIG } from '../../lib/plansConfig';
import { formatPublicProfileUrl } from '../../lib/linkHelpers';
import clsx from 'clsx';

type SortKey = 'name' | 'plan' | 'status' | 'date';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

const ClientsListPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<'all' | PlanType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');

  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);

  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [bonusAmount, setBonusAmount] = useState(1);

  useEffect(() => {
    const handleClick = () => setActiveMenu(null);
    window.addEventListener('click', handleClick);
    fetchData();
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [allClients, allProfiles] = await Promise.all([
        clientsApi.listAll(),
        profilesApi.listAll()
      ]);
      setClients(allClients);
      setProfiles(allProfiles);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchesSearch = !searchTerm ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlan = planFilter === 'all' || c.plan === planFilter;
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && c.isActive) ||
        (statusFilter === 'blocked' && !c.isActive);
      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [clients, searchTerm, planFilter, statusFilter]);

  const sortedClients = useMemo(() => {
    const PLAN_ORDER: Record<string, number> = { starter: 0, pro: 1, business: 2, enterprise: 3 };
    const sorted = [...filteredClients].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name':
          cmp = a.name.localeCompare(b.name, 'pt-BR');
          break;
        case 'plan':
          cmp = (PLAN_ORDER[a.plan] || 0) - (PLAN_ORDER[b.plan] || 0);
          break;
        case 'status':
          cmp = (a.isActive === b.isActive) ? 0 : a.isActive ? -1 : 1;
          break;
        case 'date':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [filteredClients, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedClients.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedClients = sortedClients.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, planFilter, statusFilter, sortKey, sortDir, pageSize]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown size={12} className="text-zinc-700 ml-1.5 flex-shrink-0" />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-blue-400 ml-1.5 flex-shrink-0" />
      : <ChevronDown size={12} className="text-blue-400 ml-1.5 flex-shrink-0" />;
  };

  const handleToggleStatus = async (client: Client) => {
    try {
      await clientsApi.update(client.id, { isActive: !client.isActive });
      fetchData();
    } catch (error) {
      alert('Erro ao alterar status');
    }
  };

  const handleDeleteClient = async (client: Client) => {
    if (window.confirm(`Deseja realmente apagar a company ${client.name}? Todos os perfis serão perdidos.`)) {
      try {
        await clientsApi.delete(client.id);
        fetchData();
      } catch (error) {
        alert('Erro ao excluir cliente');
      }
    }
  };

  const openEditModal = (client: Client) => {
    setSelectedClient(client);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (formData: any) => {
    if (!selectedClient) return;
    const finalSlug = formData.slug || formData.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-');
    try {
      await clientsApi.update(selectedClient.id, { ...formData, slug: finalSlug });
      setIsEditModalOpen(false);
      fetchData();
    } catch (error) {
      alert('Erro ao atualizar cliente');
    }
  };

  const handleAddBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    try {
      await clientsApi.update(selectedClient.id, { maxProfiles: selectedClient.maxProfiles + bonusAmount });
      setIsBonusModalOpen(false);
      setBonusAmount(1);
      fetchData();
    } catch (error) {
      alert('Erro ao aplicar bônus');
    }
  };

  const handleCreateSubmit = async (formData: any) => {
    const finalSlug = formData.slug || formData.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-');
    try {
      await clientsApi.create({
        ...formData,
        slug: finalSlug,
        userType: 'client'
      });
      setIsCreateModalOpen(false);
      fetchData();
    } catch (error) {
      alert('Erro ao criar cliente');
    }
  };

  const hasActiveFilters = searchTerm || planFilter !== 'all' || statusFilter !== 'all';

  const profileCounts = useMemo(() => {
    const map: Record<string, number> = {};
    profiles.forEach(p => {
      map[p.clientId] = (map[p.clientId] || 0) + 1;
    });
    return map;
  }, [profiles]);

  return (
    <div className="min-h-screen bg-[#020202] text-white overflow-x-hidden">
      <TopBar title="Diretório de Companies" />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-10 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white">Companies</h1>
            <p className="text-zinc-500 text-sm font-medium mt-1">
              {clients.length} {clients.length === 1 ? 'conta registrada' : 'contas registradas'}
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedClient(null);
              setIsCreateModalOpen(true);
            }}
            className="w-full sm:w-auto bg-white text-black px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-white/5"
          >
            <UserPlus size={18} />
            Nova Company
          </button>
        </div>

        <div className="sticky top-20 z-30 bg-[#020202]/95 backdrop-blur-xl pb-4 pt-2 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 border-b border-white/5">
          <div className="flex flex-col md:flex-row gap-3 items-stretch">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail ou slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900/60 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:border-blue-500/50 outline-none transition-all placeholder:text-zinc-700"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" size={14} />
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value as 'all' | PlanType)}
                className="h-full bg-zinc-900/60 border border-white/5 rounded-xl pl-10 pr-8 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400 outline-none appearance-none cursor-pointer hover:border-white/10 transition-all"
              >
                <option value="all">Todos Planos</option>
                {PLAN_TYPES.map(p => (
                  <option key={p} value={p}>{PLANS[p].name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" size={12} />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'blocked')}
                className="h-full bg-zinc-900/60 border border-white/5 rounded-xl pl-4 pr-8 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400 outline-none appearance-none cursor-pointer hover:border-white/10 transition-all"
              >
                <option value="all">Todos Status</option>
                <option value="active">Ativos</option>
                <option value="blocked">Bloqueados</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" size={12} />
            </div>
          </div>
        </div>

        {filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 bg-zinc-900/60 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
              <Users size={36} className="text-zinc-700" />
            </div>
            <h2 className="text-xl font-black tracking-tight mb-2 text-zinc-300">Nenhum resultado encontrado</h2>
            <button
                onClick={() => { setSearchTerm(''); setPlanFilter('all'); setStatusFilter('all'); }}
                className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white transition-all mt-4"
            >
                Limpar filtros
            </button>
          </div>
        ) : (
          <>
            <div className="hidden lg:block mt-4">
              <div className="bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-[2.5fr_1.5fr_1fr_0.8fr_0.8fr_1fr_auto] gap-0 px-5 py-3 border-b border-white/5 bg-zinc-900/50">
                  {([['name', 'Nome'], ['plan', 'Plano'], ['status', 'Status']] as [SortKey, string][]).map(([key, label]) => (
                    <button key={key} onClick={() => handleSort(key)} className="flex items-center text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors">
                      {label} <SortIcon column={key} />
                    </button>
                  ))}
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Slots</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Perfis</span>
                  <button onClick={() => handleSort('date')} className="flex items-center text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors">
                    Desde <SortIcon column="date" />
                  </button>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Ações</span>
                </div>

                <div className="max-h-[calc(100vh-340px)] overflow-y-auto custom-scrollbar">
                  {paginatedClients.map((client, idx) => (
                    <div key={client.id} className="grid grid-cols-[2.5fr_1.5fr_1fr_0.8fr_0.8fr_1fr_auto] gap-0 px-5 py-3.5 items-center transition-colors hover:bg-white/[0.02] border-b border-white/[0.03] group">
                      <div className="flex items-center gap-3 min-w-0 pr-4">
                        <div className="w-9 h-9 bg-zinc-800 rounded-xl flex items-center justify-center font-black text-sm text-zinc-500 border border-white/5 flex-shrink-0">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white truncate">{client.name}</div>
                          <div className="text-[11px] text-zinc-600 truncate font-mono">{client.email || client.slug}</div>
                        </div>
                      </div>
                      <div>
                        <span className={clsx("inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border", client.plan === 'enterprise' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20")}>
                          <Zap size={10} /> {PLANS[client.plan]?.name || client.plan}
                        </span>
                      </div>
                      <div>
                        <span className={clsx("inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border", client.isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20")}>
                          <span className={clsx("w-1.5 h-1.5 rounded-full", client.isActive ? "bg-emerald-500" : "bg-red-500")} /> {client.isActive ? 'Ativo' : 'Bloqueado'}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-zinc-400 tabular-nums">{client.maxProfiles}</div>
                      <div className="min-w-0 pr-4">
                        <div className="text-sm font-bold tabular-nums">
                          <span className={(profileCounts[client.id] || 0) >= client.maxProfiles ? "text-amber-400" : "text-zinc-500"}>{profileCounts[client.id] || 0}</span>
                          <span className="text-zinc-700">/{client.maxProfiles}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {profiles.filter(p => p.clientId === client.id).slice(0, 2).map(p => (
                            <a key={p.id} href={formatPublicProfileUrl(p.slug)} target="_blank" rel="noreferrer" className="text-[8px] px-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-zinc-600 hover:text-white transition-all">/{p.slug}</a>
                          ))}
                        </div>
                      </div>
                      <div className="text-[11px] font-medium text-zinc-600 tabular-nums">
                        {new Date(client.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1.5 justify-end opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(client)} className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white"><Edit3 size={15} /></button>
                        <button onClick={() => { setSelectedClient(client); setIsBonusModalOpen(true); }} className="p-2 rounded-lg hover:bg-amber-500/10 text-zinc-400 hover:text-amber-400"><Gift size={15} /></button>
                        <button onClick={() => handleToggleStatus(client)} className="p-2 rounded-lg hover:bg-orange-500/10 text-zinc-400">{client.isActive ? <XCircle size={15} /> : <CheckCircle2 size={15} />}</button>
                        <button onClick={() => handleDeleteClient(client)} className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-500"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:hidden mt-4 space-y-2">
              {paginatedClients.map(client => {
                const isExpanded = expandedRow === client.id;
                return (
                  <div key={client.id} className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden transition-all">
                    <button onClick={() => setExpandedRow(isExpanded ? null : client.id)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
                      <div className="w-9 h-9 bg-zinc-800 rounded-xl flex items-center justify-center font-black text-sm text-zinc-500 border border-white/5 flex-shrink-0">{client.name.charAt(0).toUpperCase()}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{client.name}</div>
                        <div className="text-[11px] text-zinc-600 truncate">{client.email || client.slug}</div>
                      </div>
                      <span className={clsx("text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border", client.isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20")}>{client.isActive ? 'Ativo' : 'Off'}</span>
                      <ChevronDown size={16} className={clsx("text-zinc-600 transition-transform", isExpanded && "rotate-180")} />
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 space-y-3 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-black/30 rounded-xl p-3 text-center">
                            <div className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Plano</div>
                            <div className="text-xs font-bold text-white">{PLANS[client.plan]?.name || client.plan}</div>
                          </div>
                          <div className="bg-black/30 rounded-xl p-3 text-center">
                            <div className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Slots</div>
                            <div className="text-xs font-bold text-white">{profileCounts[client.id] || 0}/{client.maxProfiles}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditModal(client)} className="flex-1 bg-white text-black py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"><Edit3 size={13} /> Config</button>
                          <button onClick={() => handleDeleteClient(client)} className="p-2.5 bg-red-500/5 text-red-500/50 hover:text-red-500 rounded-xl border border-red-500/10"><Trash2 size={16} /></button>
                        </div>
                        <div className="pt-2 border-t border-white/[0.03]">
                          <div className="text-[9px] font-black uppercase text-zinc-700 mb-2">Perfis Associados</div>
                          <div className="flex flex-wrap gap-2">
                            {profiles.filter(p => p.clientId === client.id).map(p => (
                                <a key={p.id} href={formatPublicProfileUrl(p.slug)} target="_blank" rel="noreferrer" className="text-[10px] font-bold px-3 py-1.5 bg-zinc-800 text-zinc-500 rounded-lg border border-white/5">/{p.slug}</a>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      <CompanyModal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
        onSubmit={isEditModalOpen ? handleEditSubmit : handleCreateSubmit}
        initialData={selectedClient}
        isEditing={isEditModalOpen}
      />

      {isBonusModalOpen && selectedClient && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-2xl sm:rounded-[4rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setIsBonusModalOpen(false)} className="absolute top-6 right-6 sm:top-12 sm:right-12 text-zinc-500 hover:text-white bg-white/5 p-3 rounded-full transition-all"><X size={20} className="sm:w-6 sm:h-6" /></button>
            <div className="p-8 sm:p-16 text-center space-y-8 sm:space-y-12">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-amber-500/10 text-amber-500 rounded-2xl sm:rounded-[2.5rem] flex items-center justify-center mx-auto border border-amber-500/20 shadow-2xl shadow-amber-500/10"><Award size={48} /></div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tighter">Bônus de Capacidade</h2>
              <div className="flex items-center justify-center gap-6 sm:gap-8 bg-black/40 p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] border border-white/5 relative shadow-inner">
                <button onClick={() => setBonusAmount(Math.max(1, bonusAmount - 1))} className="w-12 h-12 rounded-xl border border-white/10 text-2xl font-bold hover:bg-white/10">-</button>
                <div className="flex flex-col items-center">
                  <span className="text-5xl font-black text-amber-500 tabular-nums leading-none mb-2">{bonusAmount}</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 font-mono">Extra Slots</span>
                </div>
                <button onClick={() => setBonusAmount(bonusAmount + 1)} className="w-12 h-12 rounded-xl border border-white/10 text-2xl font-bold hover:bg-white/10">+</button>
              </div>
              <button onClick={handleAddBonus} className="w-full bg-amber-500 text-black py-4 sm:py-6 rounded-xl sm:rounded-[2rem] font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-amber-400 transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-3">Aplicar Recursos</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsListPage;