import React, { useState, useMemo } from 'react';
import { getProfileSummary } from '../../lib/analytics';
import { getCurrentUser, getStorage } from '../../lib/storage';
import { canAccessFeature } from '../../lib/permissions';
import TopBar from '../../components/common/TopBar';
import { 
  MousePointer2, 
  Users, 
  BarChart, 
  TrendingUp,
  Filter,
  Layout,
  Zap,
  ChevronRight,
  Clock,
  Globe,
  Tag,
  Layers,
  Megaphone
} from 'lucide-react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

// Gráficos Simplificados
const AreaChart: React.FC<{ data: { value: number }[], color: string }> = ({ data, color }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  const width = 1000;
  const height = 200;
  const padding = 20;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - (d.value / max) * (height - padding * 2) - padding;
    return `${x},${y}`;
  });
  const pathData = points.length > 0 ? `M ${points[0]} ${points.slice(1).map(p => `L ${p}`).join(' ')}` : '';
  const areaData = pathData ? `${pathData} L ${width - padding},${height - padding} L ${padding},${height - padding} Z` : '';

  return (
    <div className="relative w-full h-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs><linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
        {areaData && <path d={areaData} fill="url(#areaGradient)" className="animate-in fade-in duration-1000" />}
        {pathData && <path d={pathData} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="animate-in slide-in-from-left duration-1000" />}
      </svg>
    </div>
  );
};

const InsightsPage: React.FC = () => {
  const user = getCurrentUser();
  const data = getStorage();
  const client = data.clients.find(c => c.id === user?.clientId);
  const [days, setDays] = useState(7);
  
  const clientProfiles = useMemo(() => data.profiles.filter(p => p.clientId === user?.clientId), [data.profiles, user?.clientId]);
  const summary = useMemo(() => getProfileSummary('all', days), [days]);

  const hasAnalyticsAccess = canAccessFeature(client?.plan, 'analytics');

  if (!hasAnalyticsAccess) {
    return (
      <div className="min-h-screen bg-[#020202] text-white">
        <TopBar title="Análise de Performance" />
        <main className="max-w-7xl mx-auto p-6 lg:p-10 pt-44 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-blue-600/10 text-blue-500 rounded-[2.5rem] flex items-center justify-center mb-10 border border-blue-500/20 shadow-2xl animate-pulse">
             <BarChart size={48} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">Acesso Restrito</h1>
          <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
            As métricas de engajamento em tempo real e rastreamento de UTMs são exclusivas do <b>Plano Pro</b>.
          </p>
          
          <Link to="/app/settings" className="bg-white text-black px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center gap-4 hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl">
            <Zap size={20} />
            Fazer Upgrade para o Pro
            <ChevronRight size={20} />
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-20 overflow-x-hidden">
      <TopBar title="Análise de Performance" />
      
      <main className="max-w-7xl mx-auto p-6 lg:p-10 pt-44">
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 mb-20 relative z-10">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">Telemetria de <span className="text-blue-500">Fluxo</span></h1>
            <p className="text-zinc-500 text-lg md:text-xl font-medium">Origens, campanhas e comportamento em tempo real.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-zinc-900/60 p-3 rounded-[2.5rem] border border-white/5 backdrop-blur-2xl shadow-2xl">
            <div className="p-3 text-zinc-500 border-r border-white/5 pr-6 flex items-center gap-3">
               <Filter size={18} className="opacity-40" />
               <span className="text-[11px] font-black uppercase tracking-[0.3em]">Período</span>
            </div>
            <div className="flex gap-2">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={clsx(
                    "px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                    days === d ? "bg-white text-black shadow-2xl shadow-white/5" : "text-zinc-500 hover:text-white hover:bg-white/5"
                  )}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            { label: 'Visitas Reais', value: summary.totalViews, icon: Users, color: 'text-blue-500' },
            { label: 'Cliques Únicos', value: summary.totalClicks, icon: MousePointer2, color: 'text-purple-500' },
            { label: 'Conversão (CTR)', value: `${summary.ctr.toFixed(1)}%`, icon: TrendingUp, color: 'text-emerald-500' },
            { label: 'Top Fonte', value: summary.sources[0]?.name || 'Direct', icon: Globe, color: 'text-orange-500' },
          ].map((card, i) => (
            <div key={i} className="bg-zinc-900/40 backdrop-blur-md border border-white/5 p-10 rounded-[3rem] hover:bg-zinc-800/40 transition-all group shadow-xl">
              <div className="flex items-center gap-5 mb-8">
                <div className={`${card.color} bg-white/5 p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                  <card.icon size={24} />
                </div>
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">{card.label}</div>
              </div>
              <div className="text-4xl font-black tracking-tighter text-white truncate">{card.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Gráfico Principal */}
          <div className="lg:col-span-8 bg-zinc-900/40 border border-white/5 p-12 rounded-[4rem] shadow-2xl overflow-hidden relative group">
             <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <ActivityIcon size={300} className="text-blue-500" />
             </div>
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-12">
                  <h3 className="text-2xl font-black tracking-tight text-white">Engajamento Temporal</h3>
                  <div className="flex items-center gap-6">
                     <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Views</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Clicks</span>
                     </div>
                  </div>
                </div>
                <div className="h-80 relative">
                  <div className="absolute inset-0 opacity-40">
                    <AreaChart data={summary.viewsByDate} color="#3b82f6" />
                  </div>
                  <div className="absolute inset-0">
                    <AreaChart data={summary.clicksByDate} color="#a855f7" />
                  </div>
                </div>
             </div>
          </div>

          {/* Distribuição de Fontes */}
          <div className="lg:col-span-4 bg-zinc-900/40 backdrop-blur-md border border-white/5 p-12 rounded-[4rem] shadow-2xl">
            <div className="flex items-center gap-3 mb-10">
               <Globe className="text-blue-500" size={20} />
               <h3 className="text-2xl font-black tracking-tight text-white">Canais de Entrada</h3>
            </div>
            <div className="space-y-6">
              {summary.sources.slice(0, 6).map((source, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
                    <span className="truncate max-w-[140px] group-hover:text-white transition-colors">{source.name}</span>
                    <span className="text-blue-500">{source.value}</span>
                  </div>
                  <div className="h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${(source.value / (summary.totalViews || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {summary.sources.length === 0 && <p className="text-[10px] font-black uppercase text-zinc-700 tracking-[0.3em] text-center py-20">Aguardando tráfego...</p>}
            </div>
          </div>

          {/* Resumo UTM */}
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
             {[
               { title: 'Top UTM Sources', data: summary.utmSummary.sources, icon: Tag, color: 'text-blue-400' },
               { title: 'Top UTM Mediums', data: summary.utmSummary.mediums, icon: Layers, color: 'text-purple-400' },
               { title: 'Campanhas Ativas', data: summary.utmSummary.campaigns, icon: Megaphone, color: 'text-emerald-400' },
             ].map((section, i) => (
               <div key={i} className="bg-zinc-900/40 border border-white/5 p-10 rounded-[3rem] shadow-xl">
                  <div className="flex items-center gap-3 mb-8">
                    <section.icon size={18} className={section.color} />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">{section.title}</h4>
                  </div>
                  <div className="space-y-4">
                    {section.data.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 group">
                         <span className="text-sm font-bold text-zinc-400 group-hover:text-white transition-colors truncate pr-4">{item.name}</span>
                         <span className="text-xs font-black text-white bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">{item.value}</span>
                      </div>
                    ))}
                    {section.data.length === 0 && <div className="py-10 text-center text-[9px] font-black uppercase text-zinc-800 tracking-widest">Sem dados de campanha</div>}
                  </div>
               </div>
             ))}
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper Icon para não precisar de import novo
const ActivityIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

export default InsightsPage;