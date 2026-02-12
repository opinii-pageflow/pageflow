import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getStorage } from '../../lib/storage';
import { 
  Layout, 
  BarChart3, 
  Plus, 
  Users, 
  MousePointer2, 
  Activity,
  Target,
  Smile,
  Meh,
  Frown,
  MessageSquare,
  Zap,
  ChevronRight,
  TrendingUp,
  Lock
} from 'lucide-react';
import { getProfileSummary } from '../../lib/analytics';
import TopBar from '../../components/common/TopBar';
import AdvancedCrm from '../../components/crm/AdvancedCrm';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const data = getStorage();
  const [days, setDays] = useState(7);
  const [activeTab, setActiveTab] = useState<'overview' | 'crm'>('overview');
  
  const clientProfiles = data.profiles.filter(p => p.clientId === user?.clientId);
  const client = data.clients.find(c => c.id === user?.clientId);
  const summary = useMemo(() => getProfileSummary('all', days), [days]);

  // Permissões de plano
  const isPro = client?.plan !== 'starter';
  const isBusiness = client?.plan === 'business' || client?.plan === 'enterprise';
  
  const allLeads = useMemo(() => 
    data.leads
      .filter(l => l.clientId === user?.clientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  , [data.leads, user?.clientId]);

  const npsRecent = useMemo(() =>
    data.nps.filter(n => n.clientId === user?.clientId)
  , [data.nps, user?.clientId]);

  const npsAvg = npsRecent.length ? (npsRecent.reduce((acc, n) => acc + n.score, 0) / npsRecent.length) : 0;
  const npsPromoters = npsRecent.filter(n => n.score >= 9).length;
  const npsNeutrals = npsRecent.filter(n => n.score >= 7 && n.score <= 8).length;
  const npsDetractors = npsRecent.filter(n => n.score <= 6).length;
  const npsScore = npsRecent.length ? ((npsPromoters / npsRecent.length) * 100) - ((npsDetractors / npsRecent.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#020202] text-white">
      <TopBar title="Painel de Controle" />
      
      <main className="max-w-7xl mx-auto p-6 lg:p-10 pt-32 relative z-10 pb-40">
        
        {/* Navegação entre Overview e CRM (Somente para Business) */}
        {isBusiness && (
          <div className="mb-12 flex bg-zinc-900/40 p-1.5 rounded-[2rem] border border-white/5 w-fit">
             <button 
              onClick={() => setActiveTab('overview')}
              className={clsx(
                "px-8 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3",
                activeTab === 'overview' ? "bg-white text-black shadow-2xl" : "text-zinc-500 hover:text-white"
              )}
             >
                <Activity size={16} /> Visão Geral
             </button>
             <button 
              onClick={() => setActiveTab('crm')}
              className={clsx(
                "px-8 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3",
                activeTab === 'crm' ? "bg-white text-black shadow-2xl" : "text-zinc-500 hover:text-white"
              )}
             >
                <Target size={16} /> Gestão de Leads
             </button>
          </div>
        )}

        {activeTab === 'crm' && isBusiness ? (
          <AdvancedCrm leads={allLeads} />
        ) : (
          <div className="animate-in fade-in duration-700">
            <header className="mb-12">
               <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight text-white">
                  Olá, <span className="text-blue-500">{user?.name.split(' ')[0]}</span>
               </h1>
               <p className="text-zinc-500 text-lg md:text-xl font-medium mt-4">Acompanhe a performance do seu legado digital.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 mb-12">
              <div className="md:col-span-6 lg:col-span-8 bg-zinc-900/40 border border-white/5 rounded-[3rem] p-10 flex flex-col justify-between group overflow-hidden relative shadow-2xl">
                <div className="space-y-6 relative z-10">
                    <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center">
                      <Layout size={32} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black tracking-tighter mb-2">Meus Perfis Digitais</h3>
                      <p className="text-zinc-500 max-w-sm">Gerencie seus links e identidades visuais em um só lugar.</p>
                    </div>
                </div>
                <div className="mt-12 flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => navigate('/app/profiles')}
                      className="bg-white text-black px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5"
                    >
                      <Plus size={18} />
                      Novo Perfil
                    </button>
                    <Link 
                      to="/app/insights"
                      className="bg-zinc-800/80 hover:bg-zinc-700 backdrop-blur-xl text-white px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 border border-white/5"
                    >
                      <Activity size={18} />
                      Insights Detalhados
                    </Link>
                </div>
              </div>

              <div className="md:col-span-3 lg:col-span-4 bg-zinc-900/40 border border-white/5 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center shadow-2xl">
                <div className="text-5xl font-black text-white mb-2">{clientProfiles.length}</div>
                <div className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-6">Perfis Ativos</div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(clientProfiles.length / (client?.maxProfiles || 1)) * 100}%` }}></div>
                </div>
                <p className="text-[10px] text-zinc-600 mt-3">Você possui {client?.maxProfiles} slots totais.</p>
              </div>

              {/* Métricas de Alcance */}
              <div className="md:col-span-3 lg:col-span-4 bg-zinc-900/40 border border-white/5 rounded-[3rem] p-10 flex flex-col justify-between shadow-2xl group">
                <div className="flex items-center justify-between mb-8">
                    <div className="text-purple-500 bg-purple-500/10 p-4 rounded-2xl group-hover:scale-110 transition-transform"><Users size={24} /></div>
                    <div className="text-right">
                      <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Alcance Global</div>
                      <div className="text-3xl font-black tracking-tighter">{summary.totalViews}</div>
                    </div>
                </div>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Total de visualizações brutas.</p>
              </div>

              {/* Métricas de Engajamento */}
              <div className="md:col-span-3 lg:col-span-4 bg-zinc-900/40 border border-white/5 rounded-[3rem] p-10 flex flex-col justify-between shadow-2xl group">
                <div className="flex items-center justify-between mb-8">
                    <div className="text-emerald-500 bg-emerald-500/10 p-4 rounded-2xl group-hover:scale-110 transition-transform"><MousePointer2 size={24} /></div>
                    <div className="text-right">
                      <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Cliques nos Links</div>
                      <div className="text-3xl font-black tracking-tighter">{summary.totalClicks}</div>
                    </div>
                </div>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Interações totais nos perfis.</p>
              </div>

              {/* Métricas de Conversão */}
              <div className="md:col-span-3 lg:col-span-4 bg-zinc-900/40 border border-white/5 rounded-[3rem] p-10 flex flex-col justify-between shadow-2xl group">
                <div className="flex items-center justify-between mb-8">
                    <div className="text-amber-500 bg-amber-500/10 p-4 rounded-2xl group-hover:scale-110 transition-transform"><TrendingUp size={24} /></div>
                    <div className="text-right">
                      <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Taxa CTR</div>
                      <div className="text-3xl font-black tracking-tighter">{summary.ctr.toFixed(1)}%</div>
                    </div>
                </div>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Engajamento / Alcance total.</p>
              </div>

              {/* Resumo de NPS (Pro) */}
              <div className="md:col-span-6 lg:col-span-12 bg-zinc-900/40 border border-white/5 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between shadow-2xl gap-10">
                <div className="flex items-center gap-6">
                   <div className={clsx(
                     "p-6 rounded-[1.8rem] transition-all",
                     isPro ? "text-emerald-400 bg-emerald-500/10" : "text-zinc-500 bg-white/5"
                   )}><Smile size={32} /></div>
                   <div>
                      <h4 className="text-2xl font-black">NPS: {isPro ? Math.round(npsScore) : 'Bloqueado'}</h4>
                      <p className="text-zinc-500 text-sm">{isPro ? `${npsRecent.length} avaliações coletadas.` : 'Módulo disponível apenas no plano Pro ou superior.'}</p>
                   </div>
                </div>
                {!isPro ? (
                  <Link to="/app/settings" className="bg-zinc-800 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-700 transition-all">
                    <Lock size={14} /> Fazer Upgrade
                  </Link>
                ) : (
                  <div className="flex gap-4">
                    <div className="text-center">
                       <div className="text-emerald-500 font-black text-xl">{npsPromoters}</div>
                       <div className="text-[8px] font-black uppercase text-zinc-600">Promotores</div>
                    </div>
                    <div className="text-center">
                       <div className="text-zinc-400 font-black text-xl">{npsNeutrals}</div>
                       <div className="text-[8px] font-black uppercase text-zinc-600">Neutros</div>
                    </div>
                    <div className="text-center">
                       <div className="text-red-500 font-black text-xl">{npsDetractors}</div>
                       <div className="text-[8px] font-black uppercase text-zinc-600">Detratores</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;