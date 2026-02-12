import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, getStorage } from '../../lib/storage';
import { 
  Layout, 
  BarChart3, 
  Settings, 
  Plus, 
  Users, 
  MousePointer2, 
  TrendingUp, 
  ChevronRight, 
  Zap, 
  Clock,
  ExternalLink,
  ArrowUpRight,
  Shield,
  Activity,
  Lock
} from 'lucide-react';
import { getProfileSummary } from '../../lib/analytics';
import TopBar from '../../components/common/TopBar';
import NpsDashboard from '../../components/analytics/NpsDashboard';
import clsx from 'clsx';

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const data = getStorage();
  const [days, setDays] = useState(7);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const clientProfiles = data.profiles.filter(p => p.clientId === user?.clientId);
  const client = data.clients.find(c => c.id === user?.clientId);
  const summary = useMemo(() => getProfileSummary('all', days), [days]);

  const isPro = client?.plan !== 'free';
  const now = Date.now();
  const ms = days * 24 * 60 * 60 * 1000;

  const leadsRecent = useMemo(() =>
    data.leads
      .filter(l => l.clientId === user?.clientId)
      .filter(l => now - new Date(l.createdAt).getTime() <= ms)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  , [data.leads, user?.clientId, days]);

  const npsRecent = useMemo(() =>
    data.nps
      .filter(n => n.clientId === user?.clientId)
      .filter(n => now - new Date(n.createdAt).getTime() <= ms)
  , [data.nps, user?.clientId, days]);

  const npsAvg = npsRecent.length ? (npsRecent.reduce((acc, n) => acc + n.score, 0) / npsRecent.length) : 0;
  const npsPromoters = npsRecent.filter(n => n.score >= 9).length;
  const npsDetractors = npsRecent.filter(n => n.score <= 6).length;
  const npsScore = npsRecent.length ? ((npsPromoters / npsRecent.length) * 100) - ((npsDetractors / npsRecent.length) * 100) : 0;

  // Cálculo de uso de slots
  const usagePercentage = Math.min((clientProfiles.length / (client?.maxProfiles || 1)) * 100, 100);

  // Manipulador para efeito parallax sutil
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20; // max 10px offset
    const y = (clientY / innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  };

  return (
    <div 
      className="min-h-screen bg-[#020202] text-white overflow-x-hidden"
      onMouseMove={handleMouseMove}
    >
      <TopBar title="Centro de Comando" />
      
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <main className="max-w-7xl mx-auto p-6 lg:p-10 pt-32 relative z-10">
        
        {/* Hero Welcome Section - Enhanced with Parallax & Glow */}
        <header className="mb-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div 
            className="space-y-4 animate-in fade-in slide-in-from-left duration-1000"
            style={{ 
              transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
              transition: 'transform 0.2s cubic-bezier(0.23, 1, 0.32, 1)'
            }}
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-white/[0.03] border border-white/10 rounded-full backdrop-blur-md shadow-2xl">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]"></span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">Sistema Online</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] select-none">
              <span className="block opacity-90">Bem-vindo,</span>
              <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                {user?.name.split(' ')[0]}
              </span>
            </h1>
            
            <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
              Sua central de conexões digitais está performando <span className="text-white bg-white/10 px-2 py-0.5 rounded-md">{(summary.ctr).toFixed(1)}% melhor</span> esta semana.
            </p>
          </div>

          <div className="flex bg-zinc-900/50 backdrop-blur-2xl p-1.5 rounded-2xl border border-white/5 shadow-2xl animate-in fade-in slide-in-from-right duration-700">
            {[7, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={clsx(
                  "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                  days === d ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-white"
                )}
              >
                {d}D
              </button>
            ))}
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 mb-12">
          
          {/* Main Quick Action Card (Double Height) */}
          <div className="md:col-span-6 lg:col-span-8 bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-[3rem] p-10 flex flex-col justify-between group overflow-hidden relative shadow-2xl animate-in fade-in zoom-in-95 duration-500">
             <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-20 transition-all duration-700 pointer-events-none">
                <Plus size={300} />
             </div>
             
             <div className="space-y-6 relative z-10">
                <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-blue-600/40">
                   <Layout size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tighter mb-2">Expanda sua Presença</h3>
                  <p className="text-zinc-500 max-w-sm">Crie novos cartões digitais ultra modernos para diferentes nichos ou marcas.</p>
                </div>
             </div>

             <div className="mt-12 flex flex-col sm:flex-row gap-4 relative z-10">
                <button 
                  onClick={() => navigate('/app/profiles')}
                  className="bg-white text-black px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5"
                >
                  <Plus size={18} />
                  Novo Perfil Digital
                </button>
              <Link 
                  to="/app/insights"
                  className="bg-zinc-800/80 hover:bg-zinc-700 backdrop-blur-xl text-white px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 border border-white/5"
                >
                  <Activity size={18} />
                  Ver Métricas Reais
                </Link>
             </div>
          </div>

          {/* Usage Circular Widget */}
          <div className="md:col-span-3 lg:col-span-4 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center shadow-2xl animate-in fade-in zoom-in-95 duration-700">
             <div className="relative w-40 h-40 mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" 
                    className="text-blue-500 transition-all duration-1000"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * usagePercentage) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-4xl font-black leading-none">{clientProfiles.length}</span>
                   <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Ativos</span>
                </div>
             </div>
             <div className="space-y-1">
                <h4 className="font-black text-lg">Capacidade</h4>
                <p className="text-zinc-500 text-xs font-medium">Você está usando {usagePercentage.toFixed(0)}% dos seus {client?.maxProfiles} slots disponíveis.</p>
             </div>
             <Link to="/app/settings" className="mt-6 text-blue-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
                Expandir Plano <ArrowUpRight size={14} />
             </Link>
          </div>

          {/* Mini Stats Bento Row */}
          <div className="md:col-span-3 lg:col-span-4 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[3rem] p-10 flex flex-col justify-between shadow-2xl group animate-in fade-in zoom-in-95 duration-500 delay-100">
             <div className="flex items-center justify-between mb-8">
                <div className="text-purple-500 bg-purple-500/10 p-4 rounded-2xl group-hover:scale-110 transition-transform"><Users size={24} /></div>
                <div className="text-right">
                   <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Alcance Total</div>
                   <div className="text-3xl font-black tracking-tighter">{summary.totalViews}</div>
                </div>
             </div>
             <div className="h-12 flex items-end gap-1 px-1">
                {summary.viewsByDate.slice(-10).map((d, i) => (
                  <div key={i} className="flex-1 bg-purple-500/20 rounded-t-sm hover:bg-purple-500 transition-all" style={{ height: `${Math.max((d.value / (summary.totalViews || 1)) * 100, 10)}%` }}></div>
                ))}
             </div>
          </div>

          <div className="md:col-span-3 lg:col-span-4 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[3rem] p-10 flex flex-col justify-between shadow-2xl group animate-in fade-in zoom-in-95 duration-500 delay-200">
             <div className="flex items-center justify-between mb-8">
                <div className="text-emerald-500 bg-emerald-500/10 p-4 rounded-2xl group-hover:scale-110 transition-transform"><MousePointer2 size={24} /></div>
                <div className="text-right">
                   <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Engajamento</div>
                   <div className="text-3xl font-black tracking-tighter">{summary.totalClicks}</div>
                </div>
             </div>
             <div className="h-12 flex items-end gap-1 px-1">
                {summary.clicksByDate.slice(-10).map((d, i) => (
                  <div key={i} className="flex-1 bg-emerald-500/20 rounded-t-sm hover:bg-emerald-500 transition-all" style={{ height: `${Math.max((d.value / (summary.totalClicks || 1)) * 100, 10)}%` }}></div>
                ))}
             </div>
          </div>

          <div className="md:col-span-3 lg:col-span-4 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[3rem] p-10 flex flex-col justify-between shadow-2xl group animate-in fade-in zoom-in-95 duration-500 delay-300">
             <div className="flex items-center justify-between mb-8">
                <div className="text-amber-500 bg-amber-500/10 p-4 rounded-2xl group-hover:scale-110 transition-transform"><BarChart3 size={24} /></div>
                <div className="text-right">
                   <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Taxa CTR</div>
                   <div className="text-3xl font-black tracking-tighter">{summary.ctr.toFixed(1)}%</div>
                </div>
             </div>
             <div className="space-y-2">
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                   <div className="h-full bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: `${summary.ctr}%` }}></div>
                </div>
                <p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest text-center">Performance média global</p>
             </div>
          </div>

          {/* Leads (Pro) */}
          <div className="md:col-span-3 lg:col-span-6 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[3rem] p-10 flex flex-col justify-between shadow-2xl group animate-in fade-in zoom-in-95 duration-500 delay-200">
            <div className="flex items-center justify-between mb-8">
              <div className={clsx(
                "p-4 rounded-2xl group-hover:scale-110 transition-transform",
                isPro ? "text-blue-400 bg-blue-500/10" : "text-zinc-500 bg-white/5"
              )}><ExternalLink size={24} /></div>
              <div className="text-right">
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Leads</div>
                <div className="text-3xl font-black tracking-tighter">{isPro ? leadsRecent.length : '—'}</div>
              </div>
            </div>
            {isPro ? (
              <div className="space-y-2">
                {leadsRecent.length === 0 ? (
                  <div className="text-xs text-zinc-500">Nenhum lead neste período.</div>
                ) : (
                  leadsRecent.map((l) => (
                    <div key={l.id} className="flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <div className="font-bold truncate">{l.name}</div>
                        <div className="text-[10px] text-zinc-500 truncate">{l.contact}</div>
                      </div>
                      <div className="text-[10px] text-zinc-600 whitespace-nowrap">{new Date(l.createdAt).toLocaleDateString('pt-BR')}</div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="text-xs text-zinc-500 flex items-center gap-2"><Lock size={14} /> Disponível no Pro</div>
            )}
          </div>

          {/* NPS (Pro Quick Stats) */}
          <div className="md:col-span-3 lg:col-span-6 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[3rem] p-10 flex flex-col justify-between shadow-2xl group animate-in fade-in zoom-in-95 duration-500 delay-300">
            <div className="flex items-center justify-between mb-8">
              <div className={clsx(
                "p-4 rounded-2xl group-hover:scale-110 transition-transform",
                isPro ? "text-emerald-400 bg-emerald-500/10" : "text-zinc-500 bg-white/5"
              )}><TrendingUp size={24} /></div>
              <div className="text-right">
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">NPS</div>
                <div className="text-3xl font-black tracking-tighter">{isPro ? Math.round(npsScore) : '—'}</div>
              </div>
            </div>
            {isPro ? (
              <div className="space-y-2">
                <div className="text-xs text-zinc-500">Média: <span className="text-white font-bold">{npsAvg.toFixed(1)}</span> · Respostas: <span className="text-white font-bold">{npsRecent.length}</span></div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(Math.max((npsScore + 100) / 200 * 100, 0), 100)}%` }}></div>
                </div>
                <div className="text-[10px] text-zinc-600">Promotores: {npsPromoters} · Detratores: {npsDetractors}</div>
              </div>
            ) : (
              <div className="text-xs text-zinc-500 flex items-center gap-2"><Lock size={14} /> Disponível no Pro</div>
            )}
          </div>
        </div>

        {/* Detailed NPS Dashboard (Pro Only) */}
        {isPro && (
          <div className="mb-20">
            <NpsDashboard npsEntries={npsRecent} />
          </div>
        )}

        {/* Profiles Preview List Section */}
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black tracking-tighter">Perfis Mais Ativos</h2>
            <Link to="/app/profiles" className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white flex items-center gap-2 group transition-all">
              Ver Todos os Perfis
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clientProfiles.slice(0, 3).map(profile => (
              <div key={profile.id} className="bg-zinc-900/40 border border-white/5 p-8 rounded-[3rem] flex flex-col gap-8 group hover:border-blue-500/20 hover:bg-zinc-800/20 transition-all duration-500 shadow-xl">
                <div className="flex items-center gap-5">
                   <div className="relative">
                      <img src={profile.avatarUrl} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/5 group-hover:scale-105 transition-transform duration-500" alt="" />
                      <div className="absolute -top-2 -right-2 bg-blue-600 p-1.5 rounded-lg border-2 border-[#020202]">
                         <Zap size={10} className="text-white" />
                      </div>
                   </div>
                   <div className="min-w-0">
                      <h4 className="font-bold text-lg truncate text-white">{profile.displayName}</h4>
                      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 font-mono">linkflow.me/u/{profile.slug}</div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <button 
                    onClick={() => navigate(`/app/profiles/${profile.id}/editor`)}
                    className="flex-1 bg-white text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all active:scale-95 shadow-lg"
                   >
                      <Settings size={14} />
                      Editar
                   </button>
                   <a 
                    href={`#/u/${profile.slug}`}
                    target="_blank"
                    className="flex-1 bg-zinc-800/80 hover:bg-zinc-700 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 border border-white/5 shadow-lg"
                   >
                      <ExternalLink size={14} />
                      Link
                   </a>
                </div>
              </div>
            ))}

            {clientProfiles.length < (client?.maxProfiles || 0) && (
              <button 
                onClick={() => navigate('/app/profiles')}
                className="group border-2 border-dashed border-zinc-800 p-8 rounded-[3rem] flex flex-col items-center justify-center gap-4 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400 hover:bg-white/[0.02] transition-all duration-500"
              >
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Plus size={32} />
                </div>
                <div className="text-center">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em]">Liberar Novo Slot</span>
                   <p className="text-[10px] mt-1 opacity-50">Você ainda possui { (client?.maxProfiles || 0) - clientProfiles.length } vagas.</p>
                </div>
              </button>
            )}
          </div>
        </section>

        {/* Pro Teaser Footer */}
        <footer className="mt-20">
           <div className="bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 border border-white/10 rounded-[3.5rem] p-12 relative overflow-hidden group shadow-[0_0_80px_rgba(37,99,235,0.1)]">
              <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none group-hover:rotate-12 group-hover:scale-110 transition-transform duration-1000">
                 <Shield size={200} />
              </div>
              <div className="max-w-xl space-y-6 relative z-10">
                 <div className="inline-flex items-center gap-2 bg-white text-black text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    Vantagem Premium
                 </div>
                 <h3 className="text-4xl font-black tracking-tighter leading-none">
                    Desbloqueie o <span className="text-blue-500">Poder Total</span> do seu Legado.
                 </h3>
                 <p className="text-zinc-400 text-lg font-medium leading-relaxed">
                    Obtenha insights demográficos, pixels de rastreamento, links ilimitados e remova completamente a marca LinkFlow dos seus perfis.
                 </p>
                 <Link to="/app/settings" className="inline-flex bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-2xl shadow-blue-600/30">
                    Fazer Upgrade Agora
                 </Link>
              </div>
           </div>
        </footer>

      </main>
    </div>
  );
};

export default ClientDashboard;