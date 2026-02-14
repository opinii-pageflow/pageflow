import React, { useState, useMemo, useId } from 'react';
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
  Clock
} from 'lucide-react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

// Gráficos (SVG) — robusto (sem dependências)
const AreaChart: React.FC<{ data: { value: number }[]; color: string; label?: string }> = ({ data, color, label }) => {
  const gid = useId().replace(/:/g, '');
  const width = 1000;
  const height = 220;
  const paddingX = 26;
  const paddingY = 24;

  const safeData = Array.isArray(data) ? data : [];
  const max = Math.max(...safeData.map(d => (typeof d.value === 'number' ? d.value : 0)), 1);

  const toPoint = (value: number, i: number) => {
    const n = Math.max(safeData.length - 1, 1);
    const x = (i / n) * (width - paddingX * 2) + paddingX;
    const y = height - (value / max) * (height - paddingY * 2) - paddingY;
    return { x, y };
  };

  const points = safeData.map((d, i) => toPoint(typeof d.value === 'number' ? d.value : 0, i));
  const hasLine = points.length >= 2;

  const pathData = hasLine
    ? `M ${points[0].x},${points[0].y} ${points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ')}`
    : points.length === 1
      ? `M ${points[0].x},${points[0].y} L ${points[0].x + 0.01},${points[0].y}`
      : '';

  const areaData = pathData
    ? `${pathData} L ${width - paddingX},${height - paddingY} L ${paddingX},${height - paddingY} Z`
    : '';

  const last = points.length ? points[points.length - 1] : null;

  return (
    <div className="relative w-full h-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id={`areaGradient-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`lineGlow-${gid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="50%" stopColor={color} stopOpacity="0.55" />
            <stop offset="100%" stopColor={color} stopOpacity="0.2" />
          </linearGradient>
          <filter id={`softGlow-${gid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid */}
        {Array.from({ length: 4 }).map((_, i) => {
          const y = paddingY + ((height - paddingY * 2) / 4) * (i + 1);
          return (
            <line
              key={i}
              x1={paddingX}
              x2={width - paddingX}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          );
        })}

        {/* Area */}
        {areaData && <path d={areaData} fill={`url(#areaGradient-${gid})`} className="animate-in fade-in duration-700" />}

        {/* Linha + brilho */}
        {pathData && (
          <>
            <path
              d={pathData}
              fill="none"
              stroke={`url(#lineGlow-${gid})`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.35"
              filter={`url(#softGlow-${gid})`}
            />
            <path
              d={pathData}
              fill="none"
              stroke={color}
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-in slide-in-from-left duration-700"
            />
          </>
        )}

        {/* Ponto final */}
        {last && (
          <g>
            <circle cx={last.x} cy={last.y} r={10} fill={color} opacity="0.12" />
            <circle cx={last.x} cy={last.y} r={5} fill={color} />
          </g>
        )}
      </svg>

      {/* Estado vazio */}
      {safeData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">Sem dados</div>
        </div>
      )}

      {/* Label opcional */}
      {label && safeData.length > 0 && (
        <div className="absolute top-3 left-4 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600">{label}</div>
      )}
    </div>
  );
};

const InsightsPage: React.FC = () => {
  const user = getCurrentUser();
  const data = getStorage();
  const client = data.clients.find(c => c.id === user?.clientId);
  const [days, setDays] = useState(7);
  
  const clientProfiles = useMemo(() => data.profiles.filter(p => p.clientId === user?.clientId), [data.profiles, user?.clientId]);
  
  // Inclui data.events.length para forçar refresh quando houver novos eventos
  const summary = useMemo(() => getProfileSummary('all', days, user?.clientId), [days, user?.clientId, data.events.length]);

  const peakHour = useMemo(() => {
    const list = Array.isArray(summary.peakHours) ? summary.peakHours : [];
    if (!list.length) return null;
    const top = [...list].sort((a, b) => (b.value ?? 0) - (a.value ?? 0))[0];
    return typeof top?.hour === 'number' ? top.hour : null;
  }, [summary.peakHours]);

  const hasAnalyticsAccess = canAccessFeature(client?.plan, 'analytics');

  if (!hasAnalyticsAccess) {
    return (
      <div className="min-h-screen bg-[#020202] text-white">
        <TopBar title="Análise de Performance" />
        <main className="max-w-7xl mx-auto p-6 lg:p-10 pt-10 md:pt-14 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-blue-600/10 text-blue-500 rounded-[2.5rem] flex items-center justify-center mb-10 border border-blue-500/20 shadow-2xl animate-pulse">
             <BarChart size={48} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">Acesso Restrito</h1>
          <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
            As métricas de engajamento em tempo real são exclusivas do <b>Plano Pro</b>. 
            Saiba quem visitou seu perfil e quais links estão convertendo mais agora mesmo.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-16">
            <div className="bg-zinc-900/40 p-10 rounded-[3rem] border border-white/5 flex flex-col items-center text-center group">
               <Users className="text-zinc-700 group-hover:text-blue-500 transition-colors mb-4" size={32} />
               <h3 className="font-bold text-lg mb-2">Visitas Únicas</h3>
               <p className="text-zinc-600 text-sm">Controle exato de quanto tráfego você está gerando.</p>
            </div>
            <div className="bg-zinc-900/40 p-10 rounded-[3rem] border border-white/5 flex flex-col items-center text-center group">
               <TrendingUp className="text-zinc-700 group-hover:text-emerald-500 transition-colors mb-4" size={32} />
               <h3 className="font-bold text-lg mb-2">Taxa de Conversão</h3>
               <p className="text-zinc-600 text-sm">Descubra a eficácia do seu cartão digital.</p>
            </div>
          </div>

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
    <div className="min-h-screen bg-[#020202] text-white pb-20">
      <TopBar title="Análise de Performance" />
      
      <main className="max-w-7xl mx-auto p-6 lg:p-10 pt-10 md:pt-14">
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 mb-20 relative z-10">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">Olá, {user?.name.split(' ')[0]} 👋</h1>
            <p className="text-zinc-500 text-lg md:text-xl font-medium">Relatórios avançados de engajamento e alcance.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-zinc-900/60 p-3 rounded-[2.5rem] border border-white/5 backdrop-blur-2xl shadow-2xl">
            <div className="p-3 text-zinc-500 border-r border-white/5 pr-6 flex items-center gap-3">
               <Filter size={18} className="opacity-40" />
               <span className="text-[11px] font-black uppercase tracking-[0.3em]">Timeline</span>
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
            { label: 'Visitas Totais', value: summary.totalViews, icon: Users, color: 'text-blue-500' },
            { label: 'Interações', value: summary.totalClicks, icon: MousePointer2, color: 'text-purple-500' },
            { label: 'Conversão', value: `${summary.ctr.toFixed(1)}%`, icon: BarChart, color: 'text-emerald-500' },
            { label: 'Ativos', value: clientProfiles.length, icon: Layout, color: 'text-orange-500' },
          ].map((card, i) => (
            <div key={i} className="bg-zinc-900/40 backdrop-blur-md border border-white/5 p-10 rounded-[3rem] hover:bg-zinc-800/40 transition-all group shadow-xl">
              <div className="flex items-center gap-5 mb-8">
                <div className={`${card.color} bg-white/5 p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                  <card.icon size={24} />
                </div>
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">{card.label}</div>
              </div>
              <div className="text-5xl font-black tracking-tighter text-white">{card.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-zinc-900/40 border border-white/5 p-12 rounded-[4rem] shadow-2xl">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-2xl font-black tracking-tight text-white">Evolução de Cliques</h3>
                <div className="flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]"></div>
                   <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-600">Cliques Reais</span>
                </div>
              </div>
              <div className="h-72">
                <AreaChart data={summary.clicksByDate} color="#3b82f6" label="Últimos dias" />
              </div>
            </div>

            <div className="bg-zinc-900/40 border border-white/5 p-12 rounded-[4rem] flex items-center gap-10 relative overflow-hidden group shadow-2xl">
               <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Clock size={160} />
               </div>
               <div className="w-24 h-24 bg-blue-500/10 text-blue-500 rounded-[2.5rem] flex items-center justify-center border border-blue-500/20 shadow-inner">
                  <TrendingUp size={48} />
               </div>
               <div className="relative z-10">
                  <div className="text-[11px] font-black uppercase text-gray-500 mb-2 tracking-[0.3em]">Horário Nobre</div>
                  <div className="text-5xl font-black tracking-tighter text-white">{peakHour !== null ? `${peakHour}:00h` : '—'}</div>
                  <p className="text-sm text-zinc-600 mt-4 font-medium leading-relaxed">Momento de maior engajamento identificado nos últimos {days} dias.</p>
               </div>
            </div>
          </div>

          <div className="space-y-10">
            <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 p-12 rounded-[4rem] shadow-2xl">
              <h3 className="text-2xl font-black mb-10 tracking-tight text-white">Top 5 Links</h3>
              <div className="space-y-8">
                {summary.topLinks.map((link, i) => (
                  <div key={i} className="space-y-4">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest text-zinc-400">
                      <span className="truncate max-w-[160px]">{link.label}</span>
                      <span className="text-blue-500">{link.clicks}</span>
                    </div>
                    <div className="h-2 bg-black/60 rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${link.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
                {summary.topLinks.length === 0 && <p className="text-[11px] font-black uppercase text-zinc-700 tracking-[0.3em] text-center py-10">Sem interações registradas</p>}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InsightsPage;