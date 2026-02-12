import React, { useState, useEffect } from 'react';
import { getStorage, updateStorage } from '../../lib/storage';
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
  Award,
  Search,
  UserCheck
} from 'lucide-react';
import TopBar from '../../components/common/TopBar';
import { Client, PlanType } from '../../types';
import { PLANS, PLAN_TYPES } from '../../lib/plans';
import clsx from 'clsx';

const ClientsListPage: React.FC = () => {
  const data = getStorage();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '', slug: '', email: '', password: '', plan: 'pro' as PlanType, maxProfiles: 3, isActive: true
  });
  const [bonusAmount, setBonusAmount] = useState(1);

  useEffect(() => {
    const handleClick = () => setActiveMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleToggleStatus = (client: Client) => {
    updateStorage(prev => ({
      ...prev,
      clients: prev.clients.map(c => c.id === client.id ? { ...c, isActive: !c.isActive } : c)
    }));
    window.location.reload();
  };

  const handleDeleteClient = (client: Client) => {
    if (window.confirm(`Deseja realmente apagar o inquilino ${client.name}? Todos os perfis serão perdidos.`)) {
      updateStorage(prev => ({
        ...prev,
        clients: prev.clients.filter(c => c.id !== client.id),
        profiles: prev.profiles.filter(p => p.clientId !== client.id)
      }));
      window.location.reload();
    }
  };

  const openEditModal = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name, 
      slug: client.slug, 
      email: client.email || '', 
      password: client.password || '',
      plan: client.plan, 
      maxProfiles: client.maxProfiles, 
      isActive: client.isActive
    });
    setIsEditModalOpen(true);
  };

  const filteredClients = data.clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    
    const finalSlug = formData.slug || formData.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-');

    updateStorage(prev => ({
      ...prev,
      clients: prev.clients.map(c => c.id === selectedClient.id ? { ...c, ...formData, slug: finalSlug } : c)
    }));
    setIsEditModalOpen(false);
    window.location.reload();
  };

  const handleAddBonus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    updateStorage(prev => ({
      ...prev,
      clients: prev.clients.map(c => c.id === selectedClient.id ? { ...c, maxProfiles: c.maxProfiles + bonusAmount } : c)
    }));
    setIsBonusModalOpen(false);
    setBonusAmount(1);
    window.location.reload();
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalSlug = formData.slug || formData.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-');
    
    const newClient: Client = {
      id: 'client-' + Math.random().toString(36).substring(7),
      ...formData,
      slug: finalSlug,
      createdAt: new Date().toISOString()
    };

    updateStorage(prev => ({ 
      ...prev, 
      clients: [...prev.clients, newClient] 
    }));
    
    setIsCreateModalOpen(false);
    setTimeout(() => window.location.reload(), 100);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white overflow-x-hidden">
      <TopBar title="Diretório de Inquilinos" />
      
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="max-w-7xl mx-auto p-6 lg:p-10 pt-48 pb-32 relative z-10">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 mb-20 animate-in fade-in slide-in-from-left duration-1000">
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-white">Inquilinos</h1>
            <p className="text-zinc-500 text-lg md:text-xl font-medium leading-relaxed">Gestão de acessos, faturamento e limites operacionais.</p>
          </div>
          <button 
            onClick={() => {
              setFormData({ name: '', slug: '', email: '', password: '', plan: 'pro', maxProfiles: 3, isActive: true });
              setIsCreateModalOpen(true);
            }}
            className="w-full xl:w-auto bg-white text-black px-12 py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl shadow-white/5"
          >
            <UserPlus size={24} />
            Provisionar Novo Master
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-10 items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="relative flex-1 w-full group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Filtrar por nome ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900/40 border border-white/5 rounded-[2rem] pl-16 pr-6 py-6 text-sm font-bold focus:border-blue-500/50 outline-none transition-all placeholder:text-zinc-700"
              />
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
           {filteredClients.map(client => (
             <div key={client.id} className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[3.5rem] p-10 flex flex-col justify-between group hover:border-blue-500/20 transition-all duration-500 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                   <UserCheck size={160} />
                </div>
                
                <div className="flex items-start justify-between mb-12 relative z-10">
                   <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-zinc-800 rounded-[2rem] flex items-center justify-center font-black text-3xl text-zinc-400 border border-white/10 group-hover:scale-105 transition-transform shadow-inner">
                        {client.name[0]}
                      </div>
                      <div className="min-w-0">
                         <h3 className="text-3xl font-black tracking-tighter text-white truncate max-w-[200px] md:max-w-none">{client.name}</h3>
                         <div className="text-sm font-mono text-zinc-500 truncate">{client.email}</div>
                      </div>
                   </div>
                   <div className={clsx(
                     "text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border transition-all",
                     client.isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                   )}>
                     {client.isActive ? 'Active Node' : 'Suspended'}
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-10 relative z-10">
                   <div className="bg-black/40 p-5 rounded-3xl border border-white/5 flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Plano</span>
                      <span className="text-sm font-black text-white flex items-center gap-2">
                        <Zap size={14} className="text-blue-500" />
                        {PLANS[client.plan]?.name || client.plan}
                      </span>
                   </div>
                   <div className="bg-black/40 p-5 rounded-3xl border border-white/5 flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Slots</span>
                      <span className="text-sm font-black text-white">{client.maxProfiles} <span className="text-[10px] opacity-30">Ativos</span></span>
                   </div>
                   <div className="bg-black/40 p-5 rounded-3xl border border-white/5 flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Since</span>
                      <span className="text-sm font-black text-white">{new Date(client.createdAt).getFullYear()}</span>
                   </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                   <button 
                    onClick={() => openEditModal(client)}
                    className="flex-1 bg-white text-black py-5 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all active:scale-95 shadow-xl"
                   >
                     <Edit3 size={16} /> Config Master
                   </button>
                   <button 
                    onClick={() => { setSelectedClient(client); setIsBonusModalOpen(true); }}
                    className="p-5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-[1.8rem] transition-all active:scale-95 border border-white/5 shadow-xl"
                   >
                     <Gift size={20} />
                   </button>
                   <button 
                    onClick={() => handleToggleStatus(client)}
                    className={clsx(
                      "p-5 rounded-[1.8rem] transition-all active:scale-95 border shadow-xl",
                      client.isActive ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    )}
                   >
                     {client.isActive ? <XCircle size={20} /> : <CheckCircle2 size={20} />}
                   </button>
                   <button 
                    onClick={() => handleDeleteClient(client)}
                    className="p-5 bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-[1.8rem] transition-all active:scale-95 border border-red-500/10 shadow-xl"
                   >
                     <Trash2 size={20} />
                   </button>
                </div>
             </div>
           ))}
        </div>
      </main>

      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-xl rounded-[4rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] relative animate-in zoom-in-95 duration-500">
            <button onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} className="absolute top-12 right-12 p-3 text-zinc-500 hover:text-white transition-all bg-white/5 rounded-full"><X size={24} /></button>
            <form onSubmit={isEditModalOpen ? handleEditSubmit : handleCreateSubmit} className="p-16 space-y-10">
              <header className="space-y-4">
                <div className="inline-flex bg-blue-500/10 text-blue-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-500/20">Client Provisioning</div>
                <h2 className="text-5xl font-black tracking-tighter">{isEditModalOpen ? 'Master Edit' : 'Novo Inquilino Master'}</h2>
                <p className="text-zinc-500 text-lg">Defina credenciais de rede e limites operacionais.</p>
              </header>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Nome da Organização</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ex: Agência Premium"
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] px-6 py-5 text-sm font-bold focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">E-mail de Login</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="email@empresa.com"
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})} 
                      className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] px-6 py-5 text-sm font-bold focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Senha (Access Token)</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Crie uma senha forte"
                      value={formData.password} 
                      onChange={(e) => setFormData({...formData, password: e.target.value})} 
                      className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] px-6 py-5 text-sm font-mono focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Nível de Serviço</label>
                    <div className="relative">
                      <select 
                        value={formData.plan} 
                        onChange={(e) => {
                          const newPlanId = e.target.value as PlanType;
                          const newPlan = PLANS[newPlanId];
                          setFormData({...formData, plan: newPlanId, maxProfiles: newPlan.maxProfiles });
                        }} 
                        className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] px-6 py-5 text-sm font-bold outline-none appearance-none cursor-pointer"
                      >
                        {PLAN_TYPES.map(planId => (
                          <option key={planId} value={planId}>{PLANS[planId].name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500" size={16} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Limite de Perfis (Slots)</label>
                    <input type="number" required min="1" value={formData.maxProfiles} onChange={(e) => setFormData({...formData, maxProfiles: parseInt(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] px-6 py-5 text-sm font-bold outline-none transition-all"/>
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-white text-black py-6 rounded-[1.8rem] font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl">
                {isEditModalOpen ? 'Atualizar Infraestrutura' : 'Finalizar Provisionamento'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isBonusModalOpen && selectedClient && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500">
           <div className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-[4rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500">
              <button onClick={() => setIsBonusModalOpen(false)} className="absolute top-12 right-12 text-zinc-500 hover:text-white bg-white/5 p-3 rounded-full transition-all"><X size={24} /></button>
              <div className="p-16 text-center space-y-12">
                 <div className="w-24 h-24 bg-amber-500/10 text-amber-500 rounded-[2.5rem] flex items-center justify-center mx-auto border border-amber-500/20 shadow-2xl shadow-amber-500/10">
                    <Award size={48} />
                 </div>
                 <div className="space-y-3">
                   <h2 className="text-4xl font-black tracking-tighter">Bônus de Capacidade</h2>
                   <p className="text-zinc-500 text-sm font-medium">Adicionando slots extras para <span className="text-white">{selectedClient.name}</span>.</p>
                 </div>

                 <div className="flex items-center justify-center gap-8 bg-black/40 p-10 rounded-[2.5rem] border border-white/5 relative shadow-inner">
                    <button onClick={() => setBonusAmount(Math.max(1, bonusAmount - 1))} className="w-16 h-16 rounded-2xl border border-white/10 text-3xl font-bold hover:bg-white/10 transition-all active:scale-90">-</button>
                    <div className="flex flex-col items-center">
                        <span className="text-7xl font-black text-amber-500 tabular-nums leading-none mb-2">{bonusAmount}</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Extra Slots</span>
                    </div>
                    <button onClick={() => setBonusAmount(bonusAmount + 1)} className="w-16 h-16 rounded-2xl border border-white/10 text-3xl font-bold hover:bg-white/10 transition-all active:scale-90">+</button>
                 </div>

                 <button 
                  onClick={handleAddBonus}
                  className="w-full bg-amber-500 text-black py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all active:scale-95 shadow-2xl shadow-amber-500/20 flex items-center justify-center gap-3"
                 >
                    Aplicar Recursos
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ClientsListPage;