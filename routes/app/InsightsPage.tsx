import React, { useState, useMemo, useId } from 'react';
import { useClientData } from '@/hooks/useClientData';
import { getProfileSummary, getFilteredEvents } from '@/lib/analytics';
import { canAccessFeature } from '@/lib/permissions';
import { normalizeEvent } from '@/lib/eventNormalizer';
import TopBar from '@/components/common/TopBar';
import {
  MousePointer2, Users, BarChart, TrendingUp, Layout, Zap, Clock, MessageSquare,
  ChevronDown, PieChart as PieChartIcon, AlertCircle, Camera, Package, Video,
  Info, Activity, Target, AlertTriangle, RotateCcw
} from 'lucide-react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

// ─── Componentes de Interface Premium ───

const AreaChart: React.FC<{ data: { value: number; date: string }[]; color: string; height?: number }> = ({ data, color, height = 320 }) => {
  const gid = useId().replace(/:/g, '');
  const width = 1000;
  const paddingX = 60;
  const topPadding = 80;
  const bottomPadding = 60;
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const safeData = Array.isArray(data) ? data : [];
  const isEmpty = safeData.length === 0 || safeData.every(d => d.value === 0);
  const values = safeData.map(d => typeof d.value === 'number' ? d.value : 0);

  const total = values.reduce((a, b) => a + b, 0);
  const avg = safeData.length > 0 ? (total / safeData.length).toFixed(1) : 0;
  const peak = safeData.length > 0 ? safeData.reduce((p, c) => c.value > p.value ? c : p, safeData[0]) : { value: 0, date: '--' };

  const max = Math.max(...values, 1);

  const points = safeData.map((d, i) => {
    const n = Math.max(safeData.length - 1, 1);
    const x = (i / n) * (width - paddingX * 2) + paddingX;
    const availableHeight = height - topPadding - bottomPadding;
    const y = height - (Math.max(d.value, 0) / max) * availableHeight - bottomPadding;
    return { x, y };
  });

  const getPath = () => {
    if (points.length < 2) return '';
    let d = `M ${points[0].x},${points[0].y} `;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i]; const p1 = points[i + 1]; const cp1x = p0.x + (p1.x - p0.x) / 2;
      d += ` C ${cp1x},${p0.y} ${cp1x},${p1.y} ${p1.x},${p1.y} `;
    }
    return d;
  };

  const pathData = getPath();
  const areaData = pathData ? `${pathData} L ${width - paddingX},${height - bottomPadding} L ${paddingX},${height - bottomPadding} Z` : '';

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="grid grid-cols-3 gap-4 mb-8 shrink-0">
        {[
          { l: 'Interações Totais', v: total },
          { l: 'Média / Ciclo', v: avg },
          { l: 'Ponto Ápice', v: peak.value === 0 ? '--' : `${peak.value} (${peak.date.split('-').reverse().slice(0, 2).join('/')})` }
        ].map((k, i) => (
          <div key={i} className="bg-black/40 border border-white/5 rounded-2xl p-5 group hover:border-neon-blue/20 transition-all">
            <div className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1 group-hover:text-neon-blue transition-colors">{k.l}</div>
            <div className="text-2xl font-black text-white italic">{k.v}</div>
          </div>
        ))}
      </div>
      <div className="relative bg-black/20 rounded-[2.5rem] p-4 border border-white/5 flex-1 min-h-0 overflow-hidden group/chart">
        <svg viewBox={`0 0 ${width} ${height} `} className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs><linearGradient id={`g - ${gid} `} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
          {!isEmpty && (
            <g className="animate-in fade-in duration-700">
              {hoverIdx !== null && points[hoverIdx] && (
                <line x1={points[hoverIdx].x} y1={0} x2={points[hoverIdx].x} y2={height - bottomPadding} stroke={color} strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
              )}
              <path d={areaData} fill={`url(#g - ${gid})`} />
              <path d={pathData} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />

              {/* X-Axis Labels (Permanent) */}
              {safeData.map((d, i) => {
                const interval = safeData.length > 10 ? Math.ceil(safeData.length / 7) : 1;
                if (i % interval !== 0 && i !== safeData.length - 1) return null;
                return (
                  <text
                    key={i}
                    x={points[i].x}
                    y={height - 15}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.3)"
                    className="text-[10px] font-black tracking-widest uppercase italic"
                  >
                    {d.date.split('-').reverse().slice(0, 2).join('/')}
                  </text>
                );
              })}

              {points.map((p, i) => (
                <g key={i} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}>
                  <circle cx={p.x} cy={p.y} r={hoverIdx === i ? 7 : (i === 0 || i === safeData.length - 1) ? 3 : 0} fill={color} className="transition-all duration-200" />
                  <rect x={p.x - 20} y={0} width={40} height={height} fill="transparent" className="cursor-pointer" />
                </g>
              ))}
            </g>
          )}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoverIdx !== null && safeData[hoverIdx] && points[hoverIdx] && (
          <div
            className="absolute z-10 pointer-events-none bg-black/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            style={{
              left: `${(points[hoverIdx].x / width) * 100}% `,
              top: `${(points[hoverIdx].y / height) * 100}% `,
              transform: `translate(-50 %, -125 %)`
            }}
          >
            <div className="text-[8px] font-black text-neon-blue uppercase tracking-widest mb-1">
              {safeData[hoverIdx].date.split('-').reverse().slice(0, 2).join('/')}
            </div>
            <div className="text-sm font-black text-white italic">
              {safeData[hoverIdx].value} <span className="text-[10px] text-zinc-500 not-italic">SINAIS</span>
            </div>
          </div>
        )}

        {isEmpty && <div className="absolute inset-0 flex flex-col items-center justify-center text-[10px] font-black text-white/10 uppercase tracking-[0.5em]"><Activity size={40} className="mb-4 opacity-10" /> Waiting for Stream...</div>}
      </div>
    </div>
  );
};

const SimplePieChart: React.FC<{ data: { category: string; count: number; percentage: number }[] }> = ({ data }) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const colors: Record<string, string> = { button: '#00f2ff', portfolio: '#39ff14', catalog: '#f59e0b', video: '#ef4444', pix: '#eab308' };
  const radius = 42;
  const activeRadius = 46;
  const center = 50;
  let cumulative = 0;

  return (
    <div className="flex flex-col items-center gap-10">
      {/* Gráfico Centralizado */}
      <div className="w-52 h-52 relative shrink-0">
        <svg viewBox="0 0 100 100" className="transform -rotate-90 overflow-visible">
          {data.filter(d => d.count > 0).map((d, i) => {
            const isHovered = hoveredCategory === d.category;
            const r = isHovered ? activeRadius : radius;
            const start = (cumulative / 100) * 2 * Math.PI;
            cumulative += d.percentage;
            const end = (cumulative / 100) * 2 * Math.PI;
            const x1 = center + r * Math.cos(start);
            const y1 = center + r * Math.sin(start);
            const x2 = center + r * Math.cos(end);
            const y2 = center + r * Math.sin(end);

            return (
              <path
                key={i}
                d={`M ${center} ${center} L ${x1} ${y1} A ${r} ${r} 0 ${d.percentage > 50 ? 1 : 0} 1 ${x2} ${y2} Z`}
                fill={colors[d.category] || '#333'}
                opacity={hoveredCategory && !isHovered ? 0.3 : 0.8}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredCategory(d.category)}
                onMouseLeave={() => setHoveredCategory(null)}
                style={{
                  filter: isHovered ? `drop-shadow(0 0 12px ${colors[d.category]})` : 'none',
                  transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                  transformOrigin: 'center'
                }}
              />
            );
          })}
          <circle cx="50" cy="50" r="32" fill="#0A0A0A" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-[9px] text-zinc-700 font-bold uppercase tracking-[0.2em]">Sinais</div>
          <div className="text-3xl font-black text-white italic drop-shadow-lg">{data.reduce((a, b) => a + b.count, 0)}</div>
        </div>
      </div>

      {/* Legenda Empilhada (Vertical) - Ocupa a largura total para evitar overflow */}
      <div className="w-full space-y-2.5">
        {data.map((d, i) => {
          const isHovered = hoveredCategory === d.category;
          return (
            <div
              key={i}
              className={clsx(
                "flex items-center justify-between text-[11px] font-bold py-2.5 px-4 rounded-2xl transition-all duration-300 cursor-default border",
                isHovered
                  ? "bg-white/5 border-white/10 scale-[1.02] shadow-lg"
                  : "hover:bg-white/[0.02] border-transparent"
              )}
              onMouseEnter={() => setHoveredCategory(d.category)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: colors[d.category] || '#333',
                    boxShadow: isHovered ? `0 0 12px ${colors[d.category]}` : 'none'
                  }}
                />
                <span className={clsx(
                  "uppercase tracking-[0.1em] transition-colors duration-300",
                  isHovered ? "text-white" : "text-zinc-500"
                )}>
                  {d.category}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className={clsx(
                  "tabular-nums transition-colors duration-300 font-black",
                  isHovered ? "text-white" : "text-zinc-600"
                )}>
                  {d.count} <span className="text-[8px] opacity-40 ml-0.5">SIG</span>
                </span>
                <span className={clsx(
                  "px-3 py-1 rounded-lg border transition-all duration-300 min-w-[45px] text-center font-black",
                  isHovered
                    ? "text-white bg-white/10 border-white/20"
                    : "text-zinc-500 bg-white/5 border-white/5"
                )}>
                  {d.percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const KpiCard: React.FC<{ label: string; value: any; icon: any; color: string }> = ({ label, value, icon: Icon, color }) => (
  <div className="p-6 rounded-[2.5rem] border border-white/5 glass-neon-blue group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className={clsx("p-3.5 rounded-2xl bg-black/40 mb-6 w-fit border border-white/5 group-hover:scale-110 transition-transform", color)}><Icon size={22} /></div>
    <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1.5 italic">{label}</div>
    <div className="text-4xl font-black text-white tracking-tighter truncate translate-x-1">{value}</div>
  </div>
);

// ─── Insights Intelligence Page ───

const InsightsPage: React.FC = () => {
  const { profiles: clientProfiles, client, loading: clientLoading } = useClientData();
  const userClientId = client?.id;

  // MOCK DE DADOS PARA ANALYTICS (Até migração completa da API de eventos)
  // Como estamos lendo eventos via getFilteredEvents (que lê do localStorage legado), 
  // precisamos manter compatibilidade. 
  const data = useMemo(() => ({
    profiles: clientProfiles,
    leads: [], // TODO: Migrar para API
    events: [] // Usado apenas para invalidar memo
  }), [clientProfiles]);


  const [days, setDays] = useState(7);
  const [selectedProfileId, setSelectedProfileId] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [npsFilter, setNpsFilter] = useState<'all' | 'promoter' | 'passive' | 'detractor'>('all');

  const startTs = useMemo(() => startDate ? new Date(startDate).getTime() : undefined, [startDate]);
  const endTs = useMemo(() => endDate ? new Date(endDate + 'T23:59:59').getTime() : undefined, [endDate]);

  // Estados de dados locais
  const [rawEvents, setRawEvents] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Carregar dados ASSINCRONAMENTE
  React.useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (selectedProfileId === 'all' && !userClientId) {
        return;
      }

      setLoading(true);
      try {
        console.log(`[InsightsPage] Otimizando busca para: profile=${selectedProfileId}`);

        // 1. Buscar Summary consolidado (Usa RPC se disponível -> Baixíssimo Egress)
        const summary = await getProfileSummary(selectedProfileId, days, userClientId, startTs, endTs, selectedSource);

        // 2. Buscar Eventos Brutos APENAS para a lista de interações detalhadas (Protocolo)
        // Otimização: No futuro, adicionar paginação aqui.
        const events = await getFilteredEvents(selectedProfileId, days, userClientId, startTs, endTs, selectedSource);

        if (mounted) {
          setSummaryData(summary);
          setRawEvents(Array.isArray(events) ? events : []);
        }
      } catch (err) {
        console.error("[InsightsPage] Erro ao carregar analytics:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, [selectedProfileId, days, userClientId, startTs, endTs, selectedSource]);

  // Normalização Universal
  const normalizedEvents = useMemo(() => rawEvents.map(e => normalizeEvent(e, clientProfiles)), [rawEvents, clientProfiles]);

  // Fallback seguro para summary
  const summary = useMemo(() => {
    const data = summaryData;
    return {
      totalViews: data?.totalViews || 0,
      totalClicks: data?.totalClicks || 0,
      ctr: data?.ctr || 0,
      clicksByDate: data?.clicksByDate || [],
      // ... outros campos se necessário ...
      contentPerformance: {
        byCategory: data?.contentPerformance?.byCategory || []
      },
      hourlyTraffic: data?.hourlyTraffic || Array(24).fill(0),
      sources: data?.sources || []
    };
  }, [summaryData]);

  // Filtro de Interações Válidas (Exclui views e nps_response)
  const hits = useMemo(() =>
    normalizedEvents.filter(e => e.type !== 'view' && e.type !== 'nps_response' && e.assetId),
    [normalizedEvents]);

  const stats = useMemo(() => {
    const views = normalizedEvents.filter(e => e.type === 'view').length;
    const actions = hits.length;
    return {
      views, actions, ctr: views > 0 ? (actions / views * 100) : 0,
      pix: hits.filter(e => e.assetType === 'pix').length,
      vid: hits.filter(e => e.assetType === 'video').length,
      cat: hits.filter(e => e.assetType === 'catalog').length,
      port: hits.filter(e => e.assetType === 'portfolio').length
    };
  }, [normalizedEvents, hits]);

  const interactionMix = useMemo(() => {
    const map: Record<string, number> = { button: 0, portfolio: 0, catalog: 0, video: 0, pix: 0 };
    hits.forEach(e => { if (e.assetType && map.hasOwnProperty(e.assetType)) map[e.assetType]++; });
    const total = hits.length || 1;
    return Object.entries(map).map(([category, count]) => ({ category, count, percentage: (count / total * 100) })).sort((a, b) => b.count - a.count);
  }, [hits]);

  const topInteractions = useMemo(() => {
    const map: Record<string, { label: string; count: number; type: string; profileName: string }> = {};
    hits.forEach(e => {
      const key = `${e.profileId}-${e.assetId}`;
      if (!map[key]) {
        const p = data.profiles.find(x => x.id === e.profileId);
        map[key] = {
          label: e.assetLabel,
          count: 0,
          type: e.moduleOrigin || e.assetType,
          profileName: p?.displayName || p?.slug || 'P'
        };
      }
      map[key].count++;
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 10).map(x => ({ ...x, percentage: hits.length > 0 ? (x.count / hits.length * 100) : 0 }));
  }, [hits, data.profiles]);

  const invisibleItems = useMemo(() => {
    const scans = selectedProfileId === 'all' ? clientProfiles : clientProfiles.filter(p => p.id === selectedProfileId);
    const items: { label: string; type: string; id: string; profileName: string }[] = [];
    scans.forEach(p => {
      (p.buttons ?? []).filter(b => b.enabled).forEach(b => items.push({ label: b.label, type: 'button', id: b.id, profileName: p.displayName }));
      (p.portfolioItems ?? []).filter(i => i.isActive).forEach(i => items.push({ label: i.title || 'Foto sem título', type: 'portfolio', id: i.id, profileName: p.displayName }));
      (p.catalogItems ?? []).filter(i => i.isActive).forEach(i => items.push({ label: i.title || 'Produto sem título', type: 'catalog', id: i.id, profileName: p.displayName }));
      (p.youtubeVideos ?? []).filter(i => i.isActive).forEach(i => items.push({ label: i.title || 'Vídeo sem título', type: 'video', id: i.id, profileName: p.displayName }));
    });
    const clickedIds = new Set(hits.map(e => e.assetId));
    return items.filter(x => !clickedIds.has(x.id)).slice(0, 20);
  }, [clientProfiles, hits, selectedProfileId]);

  const heatmap = useMemo(() => {
    const rows = [
      { id: 'view', label: 'Hub Visita', color: '59, 130, 246' },
      { id: 'button', label: 'Botão', color: '0, 242, 255' },
      { id: 'portfolio', label: 'Portfólio', color: '57, 255, 20' },
      { id: 'catalog', label: 'Catálogo', color: '245, 158, 11' },
      { id: 'video', label: 'Vídeo', color: '239, 68, 68' },
      { id: 'pix', label: 'Pix Sync', color: '234, 179, 8' },
      { id: 'nps', label: 'Feedback', color: '16, 185, 129' }
    ];
    const matrix: number[][] = Array.from({ length: rows.length }, () => Array(24).fill(0));
    normalizedEvents.forEach(e => {
      try {
        const h = new Date(e.ts).getHours();
        const rIdx = rows.findIndex(r => r.id === (e.type === 'view' ? 'view' : e.assetType));
        if (rIdx !== -1) matrix[rIdx][h]++;
      } catch (err) { }
    });
    return { matrix, max: Math.max(...matrix.flatMap(h => h), 1), rows };
  }, [normalizedEvents]);

  const profilePerformance = useMemo(() => {
    const map: Record<string, { count: number; name: string }> = {};
    hits.forEach(e => {
      if (!map[e.profileId]) {
        const p = data.profiles.find(x => x.id === e.profileId);
        map[e.profileId] = { count: 0, name: p?.displayName || p?.slug || 'Node' };
      }
      map[e.profileId].count++;
    });
    return Object.entries(map).map(([id, d]) => ({ id, name: d.name, count: d.count, percentage: hits.length > 0 ? (d.count / hits.length * 100) : 0 })).sort((a, b) => b.count - a.count);
  }, [hits, data.profiles]);

  const insights = useMemo(() => {
    const list: string[] = [];
    const best = topInteractions[0];
    if (best) list.push(`O ativo "${best.label}"(${best.type}) é o principal gerador de sinais no hub.`);
    if (stats.cat > stats.port) list.push("Seu Catálogo está superando o Portfólio em cliques diretos.");
    else if (stats.port > stats.cat) list.push("O Portfólio é sua vitrine mais forte. Considere expandir as fotos.");
    if (invisibleItems.some(i => i.type === 'catalog')) list.push("Alguns produtos do Catálogo nunca foram visualizados. Revise o copy da oferta.");
    return list;
  }, [topInteractions, stats, invisibleItems]);



  if (!canAccessFeature(client?.plan, 'analytics')) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
        <TopBar title="Insights" />
        <div className="w-24 h-24 bg-blue-600/10 text-neon-blue rounded-[3rem] flex items-center justify-center mb-8 border border-white/5 animate-pulse"><BarChart size={48} /></div>
        <h1 className="text-5xl font-black mb-6 italic tracking-tight">Upgrade to Intelligence</h1>
        <p className="text-zinc-500 max-w-md mb-12">Métricas em tempo real e análise de rede são exclusivas do Plano Pro ou superior.</p>
        <Link to="/app/upgrade" className="bg-white text-black px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all"><Zap size={16} className="inline mr-3" /> Get Advanced Access</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32">
      <TopBar title="Insights Intelligence" showBack />
      <main className="max-w-[1600px] mx-auto p-6 lg:p-12 pt-32">
        <header className="flex flex-col lg:flex-row justify-between lg:items-end gap-12 mb-20 animate-in fade-in duration-1000">
          <div>
            <div className="flex items-center gap-4 mb-6"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse" /><span className="text-[10px] font-black text-neon-blue uppercase px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full tracking-widest">Live Network Stream</span></div>
            <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter leading-none">Insights <span className="text-neon-blue drop-shadow-[0_0_15px_rgba(0,242,255,0.3)]">Engine</span></h1>
            <p className="text-zinc-500 mt-6 text-xl max-w-2xl leading-relaxed italic">Análise preditiva e comportamental de ativos digitais em tempo real.</p>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <div className="group relative">
              <select value={selectedProfileId} onChange={e => setSelectedProfileId(e.target.value)} className="bg-black border border-white/5 rounded-2xl pl-12 pr-12 py-4 text-[10px] font-black uppercase cursor-pointer hover:bg-white/5 transition-all appearance-none outline-none focus:border-neon-blue/40"><option value="all">Sincronizar Hub</option>{clientProfiles.map(p => <option key={p.id} value={p.id}>{p.displayName}</option>)}</select>
              <Layout size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-hover:text-neon-blue transition-colors" />
              <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-700" />
            </div>

            <div className="group relative">
              <select value={selectedSource} onChange={e => setSelectedSource(e.target.value)} className="bg-black border border-white/5 rounded-2xl pl-12 pr-12 py-4 text-[10px] font-black uppercase cursor-pointer hover:bg-white/5 transition-all appearance-none outline-none focus:border-neon-blue/40">
                <option value="all">Todas Origens</option>
                <option value="instagram">Instagram</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="facebook">Facebook</option>
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">Twitter / X</option>
                <option value="direct">Tráfego Direto</option>
                <option value="community">Comunidade</option>
                <option value="qr">QR Code</option>
                <option value="nfc">NFC Link</option>
              </select>
              <Target size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-hover:text-neon-blue transition-colors" />
              <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-700" />
            </div>

            <div className="flex bg-black/40 border border-white/5 p-1.5 rounded-2xl items-center shadow-2xl">{[7, 30, 90].map(d => <button key={d} onClick={() => setDays(d)} className={clsx("px-6 py-2.5 rounded-xl text-[9px] font-black transition-all", days === d ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-white")}>{d}D</button>)}</div>
            <div className="flex bg-black/40 border border-white/5 p-1.5 rounded-2xl gap-3 font-black text-[10px] px-4 shadow-2xl items-center"><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent text-white outline-none" /><span className="text-zinc-800">|</span><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent text-white outline-none" />{(startDate || endDate || selectedSource !== 'all') && <button onClick={() => { setStartDate(''); setEndDate(''); setSelectedSource('all'); }} className="p-1 text-zinc-600 hover:text-white"><RotateCcw size={14} /></button>}</div>

          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
          <KpiCard label="Visitas Hub" value={stats.views} icon={Users} color="text-blue-500" />
          <KpiCard label="Signals Total" value={stats.actions} icon={MousePointer2} color="text-purple-500" />
          <KpiCard label="Conversão" value={`${stats.ctr.toFixed(1)}% `} icon={Target} color="text-emerald-500" />
          <KpiCard label="Leads Sync" value={(data.leads ?? []).filter(l => (l as any).clientId === userClientId).length} icon={MessageSquare} color="text-amber-500" />
          <KpiCard label="Catálogo" value={stats.cat} icon={Package} color="text-orange-500" />
          <KpiCard label="Portfólio" value={stats.port} icon={Camera} color="text-emerald-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16 lg:h-[620px]">
          <div className="lg:col-span-2 glass-neon-blue p-8 lg:p-10 rounded-[3.5rem] border border-white/5 relative bg-black/40 flex flex-col h-full">
            <h3 className="text-2xl font-black mb-12 italic tracking-tighter">Evolução <span className="text-neon-blue">Temporal</span></h3>
            <div className="flex-1 min-h-0">
              <AreaChart data={summary.clicksByDate.slice(-Math.min(days, 30))} color="#00f2ff" />
            </div>
          </div>
          <div className="glass-neon-blue p-8 lg:p-10 rounded-[3.5rem] border border-white/5 flex flex-col h-full bg-black/40 overflow-hidden">
            <h3 className="text-xl font-black mb-10 italic tracking-tighter">Top <span className="text-neon-blue">Assets</span></h3>
            <div className="flex-1 space-y-5 overflow-y-auto custom-scrollbar pr-2 min-h-0">
              {topInteractions.length === 0 ? <div className="h-full flex flex-col items-center justify-center opacity-10 py-20"><Activity size={48} /></div> : topInteractions.map((x, i) => (
                <div key={i} className="p-5 bg-white/5 rounded-3xl border border-white/5 hover:border-white/10 transition-all group/item">
                  <div className="flex justify-between items-center mb-3">
                    <div className="truncate pr-4">
                      <span className="text-[11px] font-black block text-white uppercase tracking-tight group-hover/item:text-neon-blue transition-colors italic">{x.label}</span>
                      <span className="text-[8px] font-black text-zinc-600 block uppercase tracking-widest mt-1">{x.profileName} • {x.type}</span>
                    </div>
                    <span className="text-xs font-black text-neon-blue tabular-nums">{x.count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-neon-blue rounded-full shadow-[0_0_8px_#00f2ff]" style={{ width: `${x.percentage}% ` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
          <div className="glass-neon-blue p-8 lg:p-10 rounded-[3.5rem] border border-white/5 bg-black/40">
            <h4 className="text-xl font-black mb-8 italic tracking-tighter uppercase underline decoration-neon-blue decoration-4 underline-offset-8 transition-all hover:decoration-white">Module Engagement</h4>
            <SimplePieChart data={interactionMix} />
          </div>
          <div className="glass-neon-blue p-8 lg:p-10 rounded-[3.5rem] border border-white/5 flex flex-col justify-between bg-black/40 relative">
            <h4 className="text-xl font-black mb-12 italic tracking-tighter">Main <span className="text-neon-blue">Signal</span></h4>
            {topInteractions[0] ? <div className="p-8 bg-neon-blue/5 border border-neon-blue/20 rounded-[2.5rem] relative group"><div className="absolute top-4 right-6 text-neon-blue/10"><TrendingUp size={32} /></div><div className="text-[10px] font-black text-neon-blue mb-3 uppercase tracking-widest">MVP Candidate</div><div className="text-3xl font-black italic text-white tracking-tighter leading-tight">{topInteractions[0].label}</div></div> : <div className="italic opacity-20 text-[10px] text-center py-10">Capturing signals...</div>}
            <div className="mt-10 space-y-5">{insights.map((msg, i) => <div key={i} className="flex gap-4 group/msg"><div className="w-1.5 h-1.5 rounded-full bg-neon-blue mt-1.5 shrink-0 shadow-[0_0_5px_#00f2ff]" /><p className="text-[12px] font-bold text-zinc-500 leading-relaxed group-hover/msg:text-zinc-300 transition-colors">"{msg}"</p></div>)}</div>
          </div>
          <div className="glass-neon-blue p-8 lg:p-10 rounded-[3.5rem] border border-white/5 flex flex-col h-[520px] bg-black/40">
            <h4 className="text-xl font-black mb-12 italic tracking-tighter">Invisible <span className="text-rose-500">Protocol</span></h4>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3.5 pr-2">
              {invisibleItems.length === 0 ? <div className="h-full flex flex-col items-center justify-center opacity-10 italic text-[10px] font-black uppercase tracking-[0.4em]">Full Network Sync</div> : invisibleItems.map((x, i) => <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-3xl flex justify-between items-center pr-8 hover:bg-white/[0.08] transition-all group/inv"><div className="truncate"><div className="text-xs font-black text-zinc-500 uppercase tracking-tight group-hover/inv:text-white transition-colors">{x.label}</div><div className="text-[9px] text-zinc-700 font-black mt-2 uppercase tracking-widest flex items-center gap-2">{x.type === 'catalog' ? <Package size={10} /> : x.type === 'portfolio' ? <Camera size={10} /> : <Zap size={10} />} {x.type} <span className="w-1 h-1 rounded-full bg-zinc-800" /> {x.profileName}</div></div><AlertTriangle size={14} className="text-zinc-800 opacity-20 group-hover:opacity-100 group-hover:text-rose-500 transition-all" /></div>)}
            </div>
            <div className="mt-8 pt-6 border-t border-white/5"><p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] italic">Optimization: Atualize ativos sem sinais.</p></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
          <div className="lg:col-span-2 glass-neon-blue p-8 lg:p-10 rounded-[3.5rem] border border-white/5 bg-black/40 relative overflow-hidden group/pulse">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-12">
              <div>
                <h3 className="text-xl font-black italic tracking-tighter mb-2">Traffic <span className="text-neon-blue">Pulse</span></h3>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Activity Density / 24h</span>
                  <div className="h-px w-8 bg-white/5" />
                  <span className="text-[10px] font-black text-neon-blue uppercase">Live Radar</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="flex gap-4 text-[9px] font-black text-zinc-700 items-center uppercase tracking-widest">
                  Quiet <div className="w-24 h-2.5 flex gap-1.5"><div className="flex-1 bg-white/5 rounded-sm" /><div className="flex-1 bg-blue-600/30 rounded-sm" /><div className="flex-1 bg-blue-600/70 rounded-sm" /><div className="flex-1 bg-blue-600 rounded-sm shadow-[0_0_8px_#2563eb]" /></div> Peak
                </div>
                {heatmap.max > 1 && (
                  <div className="text-[9px] font-black text-neon-blue/40 uppercase tracking-widest">
                    Pico: {heatmap.max} sinais/hora
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              {/* Hour Labels */}
              <div className="flex mb-4 ml-12">
                {[0, 6, 12, 18, 23].map(h => (
                  <div key={h} className="flex-1 text-[8px] font-black text-zinc-700 uppercase italic" style={{ marginLeft: h === 0 ? 0 : 'auto' }}>
                    {h.toString().padStart(2, '0')}h
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                {heatmap.rows.map((row, r) => (
                  <div key={r} className="flex items-center gap-5 group/row">
                    <div className="w-20 text-[9px] font-black text-zinc-600 uppercase italic tracking-tighter group-hover/row:text-white transition-colors">{row.label}</div>
                    <div className="flex-1 flex gap-1.5 h-7">
                      {heatmap.matrix[r].map((v, h) => (
                        <div
                          key={h}
                          className="flex-1 rounded-sm transition-all hover:scale-125 hover:z-10 cursor-help relative group/cell"
                          style={{
                            backgroundColor: v > 0
                              ? `rgba(${row.color}, ${0.1 + (v / heatmap.max) * 0.9})`
                              : 'rgba(255,255,255,0.02)',
                            boxShadow: v === heatmap.max && v > 0 ? `0 0 10px rgba(${row.color}, 0.5)` : 'none'
                          }}
                        >
                          {/* Cell Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover/cell:block z-50">
                            <div className="bg-black border border-white/10 p-2.5 rounded-xl shadow-2xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
                              <div className="text-[8px] font-black uppercase mb-1" style={{ color: `rgb(${row.color})` }}>{row.label} às {h}h</div>
                              <div className="text-xs font-black text-white italic">{v} <span className="text-[9px] text-zinc-600 not-italic uppercase">Signals</span></div>
                            </div>
                            <div className="w-2 h-2 bg-black border-r border-b border-white/10 rotate-45 transform translate-x-3 -translate-y-1 mx-auto" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap gap-10">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-blue-500/10 rounded-xl"><Clock size={16} className="text-neon-blue" /></div>
                <div>
                  <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Hot Zone</div>
                  <div className="text-sm font-black text-white italic">
                    {(() => {
                      let maxH = 0; let peakVal = 0;
                      const hourly = Array(24).fill(0);
                      heatmap.matrix.forEach(row => row.forEach((v, h) => hourly[h] += v));
                      hourly.forEach((v, h) => { if (v > peakVal) { peakVal = v; maxH = h; } });
                      return `${maxH} h - ${(maxH + 1) % 24} h`;
                    })()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl"><Zap size={16} className="text-emerald-500" /></div>
                <div>
                  <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Total Energy</div>
                  <div className="text-sm font-black text-white italic">
                    {heatmap.matrix.flat().reduce((a, b) => a + b, 0)} <span className="text-[10px] text-zinc-500 not-italic uppercase ml-1">Signals</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16 h-[600px]">
          <div className="glass-neon-blue p-8 lg:p-10 rounded-[3.5rem] border border-white/5 bg-black/40 flex flex-col min-h-0">
            <h3 className="text-xl font-black mb-12 italic tracking-tighter shrink-0">Video <span className="text-rose-500">Intelligence</span></h3>
            <div className="space-y-8 flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
              <div className="p-8 bg-black border border-white/5 rounded-[2.5rem] relative group overflow-hidden shrink-0"><div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl" /><div className="text-[10px] font-black text-zinc-600 uppercase mb-3 tracking-widest">Retention Index</div><div className="text-5xl font-black italic text-white tracking-tighter">{stats.vid}</div></div>
              <div className="space-y-5">
                <div className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">TOP CONTENT <div className="h-px flex-1 bg-white/5" /></div>
                {topInteractions.filter(x => x.type === 'video').length === 0 ? <div className="text-center py-10 opacity-10 italic text-[10px] font-black uppercase">Offline</div> : topInteractions.filter(x => x.type === 'video').slice(0, 5).map((x, i) => <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-rose-500/20 transition-all group/v"><div><div className="text-xs font-black text-white truncate max-w-[180px] uppercase group-hover/v:text-rose-500 transition-colors italic">{x.label}</div><div className="text-[8px] font-black text-zinc-700 mt-1 uppercase tracking-widest">{x.profileName}</div></div><span className="text-xs font-black text-rose-500 tabular-nums bg-rose-500/10 px-3 py-1 rounded-xl">{x.count}</span></div>)}
              </div>
            </div>
          </div>

          <div className="glass-neon-blue p-8 lg:p-10 rounded-[3.5rem] border border-white/5 bg-black/40 flex flex-col overflow-hidden min-h-0">
            <h3 className="text-xl font-black mb-10 italic tracking-tighter shrink-0">NPS <span className="text-emerald-500">Feedback</span></h3>
            {(() => {
              const npsEvents = normalizedEvents.filter(e => e.type === 'nps_response' && typeof (e as any).score === 'number');
              const totalNps = npsEvents.length;

              const segments = {
                promoter: npsEvents.filter(e => (e as any).score >= 9),
                passive: npsEvents.filter(e => (e as any).score >= 7 && (e as any).score <= 8),
                detractor: npsEvents.filter(e => (e as any).score <= 6)
              };

              // Global NPS Formula: % Promoters - % Detractors (ranges from -100 to 100)
              const npsScore = totalNps > 0
                ? Math.round(((segments.promoter.length / totalNps) - (segments.detractor.length / totalNps)) * 100)
                : 0;

              const filteredComments = npsFilter === 'all'
                ? npsEvents.filter(e => (e as any).comment)
                : segments[npsFilter].filter(e => (e as any).comment);

              return (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 shrink-0">
                    <div className="p-6 bg-black border border-white/5 rounded-[2.5rem] relative group overflow-hidden">
                      <div className={clsx(
                        "absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20",
                        npsScore > 50 ? "bg-emerald-500" : npsScore > 0 ? "bg-amber-500" : "bg-rose-500"
                      )} />
                      <div className="text-[9px] font-black text-zinc-600 uppercase mb-2 tracking-widest">Global Score</div>
                      <div className="flex items-end gap-2">
                        <div className={clsx(
                          "text-5xl font-black italic tracking-tighter",
                          npsScore > 50 ? "text-emerald-500" : npsScore > 0 ? "text-amber-500" : "text-rose-500"
                        )}>{npsScore}</div>
                        <div className="text-[8px] font-black text-zinc-700 mb-1.5 uppercase">NPS Index</div>
                      </div>
                    </div>

                    <div className="bg-black/40 border border-white/5 rounded-[2.5rem] p-5 flex flex-col justify-center gap-2">
                      {[
                        { key: 'promoter', l: 'Promotores', v: segments.promoter.length, c: 'text-emerald-500' },
                        { key: 'passive', l: 'Neutros', v: segments.passive.length, c: 'text-zinc-400' },
                        { key: 'detractor', l: 'Detratores', v: segments.detractor.length, c: 'text-rose-500' }
                      ].map(s => (
                        <button key={s.key} onClick={() => setNpsFilter(npsFilter === s.key ? 'all' : s.key as any)} className={clsx("flex items-center justify-between group/seg transition-all", npsFilter !== 'all' && npsFilter !== s.key && "opacity-30 grayscale")}>
                          <div className="flex items-center gap-2"><div className={clsx("w-1.5 h-1.5 rounded-full", s.c.replace('text-', 'bg-'))} /><span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest group-hover/seg:text-white transition-colors">{s.l}</span></div>
                          <div className="flex items-center gap-2"><span className={clsx("text-xs font-black tabular-nums", s.c)}>{s.v}</span><span className="text-[8px] font-bold text-zinc-700 w-6">{totalNps > 0 ? Math.round(s.v / totalNps * 100) : 0}%</span></div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 mb-6 shrink-0 overflow-x-auto no-scrollbar">
                    {['all', 'promoter', 'passive', 'detractor'].map(f => (
                      <button key={f} onClick={() => setNpsFilter(f as any)} className={clsx("px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border", npsFilter === f ? "bg-white text-black border-white" : "text-zinc-600 border-white/5 hover:bg-white/5")}>
                        {f === 'all' ? 'Todos' : f === 'promoter' ? 'Promotores' : f === 'passive' ? 'Neutros' : 'Detratores'}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 min-h-0">
                    {filteredComments.length === 0 ? (
                      <div className="text-center py-10 opacity-10 italic text-[10px] font-black uppercase flex flex-col items-center gap-3"><Activity size={24} /> Sem feedbacks</div>
                    ) : filteredComments.map((c, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group/nps">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <div className={clsx("w-1 h-1 rounded-full", (c as any).score >= 9 ? "bg-emerald-500" : (c as any).score >= 7 ? "bg-zinc-500" : "bg-rose-500")} />
                            <span className="text-[9px] font-black text-zinc-500 uppercase">{new Date(c.ts).toLocaleDateString()}</span>
                          </div>
                          <span className={clsx("text-[10px] font-black px-1.5 py-0.5 rounded-md", (c as any).score >= 9 ? "text-emerald-500 bg-emerald-500/10" : (c as any).score >= 7 ? "text-zinc-400 bg-white/5" : "text-rose-500 bg-rose-500/10")}>{(c as any).score}/10</span>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-400 italic line-clamp-3 group-hover/nps:text-zinc-200 transition-colors leading-snug">"{(c as any).comment}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Marketing Intelligence - UTM Insights */}
        {(summary as any).utmSummary?.sources?.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16 animate-in slide-in-from-bottom-10 duration-1000">
            <div className="lg:col-span-2 glass-neon-blue p-8 lg:p-10 rounded-[3.5rem] border border-white/5 bg-black/40">
              <div className="flex items-center gap-6 mb-12">
                <div className="p-3.5 bg-amber-600/10 text-amber-500 rounded-2xl border border-amber-500/20">
                  <Target size={22} />
                </div>
                <div>
                  <h3 className="text-2xl font-black italic tracking-tighter">Marketing <span className="text-amber-500">Intelligence</span></h3>
                  <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mt-1">Atribuição de Performance por Campanha</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="text-[11px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-4">TOP CAMPAIGNS <div className="h-px flex-1 bg-white/5" /></div>
                  <div className="space-y-4">
                    {(summary as any).utmSummary.campaigns.length === 0 ? (
                      <div className="text-[10px] font-black text-zinc-800 uppercase italic">Nenhuma campanha detectada</div>
                    ) : (summary as any).utmSummary.campaigns.map((c: any, i: number) => (
                      <div key={i} className="flex justify-between items-end pb-2 border-b border-white/5 group hover:border-amber-500/30 transition-all">
                        <div>
                          <span className="text-[10px] font-black text-zinc-500 uppercase block mb-1">Rank_{String(i + 1).padStart(2, '0')}</span>
                          <span className="text-sm font-black text-white italic group-hover:text-amber-500 transition-colors uppercase">{c.name}</span>
                        </div>
                        <span className="text-lg font-black text-white tabular-nums">{c.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="text-[11px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-4">TRAFFIC SOURCES <div className="h-px flex-1 bg-white/5" /></div>
                  <div className="space-y-4">
                    {(summary as any).utmSummary.sources.length === 0 ? (
                      <div className="text-[10px] font-black text-zinc-800 uppercase italic">Nenhuma source detectada</div>
                    ) : (summary as any).utmSummary.sources.map((c: any, i: number) => (
                      <div key={i} className="flex justify-between items-end pb-2 border-b border-white/5 group hover:border-amber-500/30 transition-all">
                        <div>
                          <span className="text-[10px] font-black text-zinc-500 uppercase block mb-1">Source</span>
                          <span className="text-sm font-black text-white italic group-hover:text-amber-500 transition-colors uppercase">{c.name}</span>
                        </div>
                        <span className="text-lg font-black text-white tabular-nums">{c.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-neon-blue p-8 lg:p-10 rounded-[3.5rem] border border-white/5 bg-black/40 flex flex-col justify-center gap-8">
              <div className="text-center space-y-4">
                <div className="flex justify-center"><div className="p-5 bg-amber-500/10 rounded-[2.5rem] border border-amber-500/20 text-amber-500 animate-pulse"><Zap size={32} /></div></div>
                <h4 className="text-2xl font-black italic tracking-tighter uppercase">Viral Loop <span className="text-amber-500">Detect</span></h4>
                <p className="text-[11px] font-bold text-zinc-500 leading-relaxed italic">Atribuição automática de conversão baseada em metadados de marketing (UTM).</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                <span className="text-[9px] font-black text-zinc-600 uppercase block mb-2">Dominant Medium</span>
                <span className="text-xl font-black text-amber-500 uppercase italic">{(summary as any).utmSummary?.mediums?.[0]?.name || '--'}</span>
              </div>
            </div>
          </div>
        )}

        <div className="glass-neon-blue p-8 lg:p-10 rounded-[4rem] border border-white/5 bg-black/40">
          <div className="flex items-center gap-6 mb-12"><div className="p-3.5 bg-indigo-600/10 text-indigo-400 rounded-2xl border border-indigo-500/20"><PieChartIcon size={22} /></div><div><h3 className="text-2xl font-black italic tracking-tighter">Hub <span className="text-indigo-400">Analysis</span></h3><p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mt-1">Sinais distribuídos por Nodes da rede</p></div><div className="h-px flex-1 bg-white/5" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {profilePerformance.map((x, i) => (
              <div key={i} className="p-8 bg-black border border-white/5 rounded-[2.5rem] group hover:border-indigo-500/20 transition-all relative overflow-hidden">
                <div className="flex justify-between items-end mb-6 relative z-10"><div><div className="text-[9px] font-black text-zinc-700 uppercase mb-2">NODE_{(i + 1).toString().padStart(3, '0')}</div><div className="text-xl font-black truncate text-white uppercase italic tracking-tighter group-hover:text-indigo-400 transition-colors">{x.name}</div></div><div className="text-right"><div className="text-3xl font-black tabular-nums">{x.count}</div><div className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-1">{x.percentage.toFixed(1)}%</div></div></div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative z-10"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${x.percentage}% ` }} /></div>
              </div>
            ))}
          </div>
        </div>

      </main>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.08); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.15); }
      `}</style>
    </div>
  );
};

export default InsightsPage;