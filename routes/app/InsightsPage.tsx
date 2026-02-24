import React, { useState, useMemo, useId } from 'react';
import { useClientData } from '@/hooks/useClientData';
import { getProfileSummary, getFilteredEvents } from '@/lib/analytics';
import { canAccessFeature } from '@/lib/permissions';
import { normalizeEvent } from '@/lib/eventNormalizer';
import { leadsApi } from '@/lib/api/leads';
import { npsApi } from '@/lib/api/nps';
import TopBar from '@/components/common/TopBar';
import {
  MousePointer2, Users, BarChart, TrendingUp, Layout, Zap, Clock, MessageSquare,
  ChevronDown, PieChart as PieChartIcon, AlertCircle, Camera, Package, Video,
  Info, Activity, Target, AlertTriangle, RotateCcw, Radio, ArrowDownCircle
} from 'lucide-react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

// --- SIGNAL RADAR WAVEFORM COMPONENT (PREMIUM & COMPACT) ---
const SignalRadarWave: React.FC<{ data: number[] }> = ({ data }) => {
  const max = Math.max(...data, 1);
  const [hoveredIdx, setHoverIdx] = useState<number | null>(null);

  // Create smooth SVG path points
  const points = useMemo(() => {
    const width = 800;
    const height = 120;
    const step = width / (data.length - 1);

    return data.map((v, i) => ({
      x: i * step,
      y: height - (v / max) * height * 0.8 - 10
    }));
  }, [data, max]);

  const linePath = useMemo(() => {
    if (points.length < 2) return '';
    let d = `M ${points[0].x},${points[0].y} `;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      d += `C ${cp1x},${p0.y} ${cp1x},${p1.y} ${p1.x},${p1.y} `;
    }
    return d;
  }, [points]);

  const areaPath = `${linePath} L 800,120 L 0,120 Z`;

  return (
    <div className="w-full group">
      <div className="relative h-32 w-full overflow-hidden bg-white/[0.02] rounded-2xl border border-white/5 p-4">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        <svg viewBox="0 0 800 120" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00f2ff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#00f2ff" stopOpacity="0" />
            </linearGradient>
            <filter id="waveGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Area under wave */}
          <path d={areaPath} fill="url(#waveGradient)" className="transition-all duration-1000 ease-in-out" />

          {/* Main Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#00f2ff"
            strokeWidth="2.5"
            filter="url(#waveGlow)"
            className="transition-all duration-1000 ease-in-out"
            strokeLinecap="round"
          />

          {/* Scanning Line Animation */}
          <rect x="0" y="0" width="2" height="120" fill="#00f2ff" className="animate-scanning-line opacity-50 shadow-[0_0_15px_#00f2ff]" />

          {/* Data Points on Hover */}
          {points.map((p, i) => (
            <g key={i} className="cursor-pointer" onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}>
              <circle cx={p.x} cy={p.y} r="6" fill="transparent" />
              {(hoveredIdx === i || (data[i] === max && hoveredIdx === null && data[i] > 0)) && (
                <>
                  <circle cx={p.x} cy={p.y} r="3" fill="#fff" className="animate-ping" />
                  <circle cx={p.x} cy={p.y} r="2" fill="#00f2ff" stroke="#fff" strokeWidth="0.5" />
                </>
              )}
            </g>
          ))}
        </svg>

        {/* Dynamic Tooltip */}
        {hoveredIdx !== null && data[hoveredIdx] > 0 && (
          <div
            className="absolute top-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded border border-white/10 text-[10px] font-black italic z-50 pointer-events-none shadow-2xl transition-all duration-200"
            style={{ left: `${(hoveredIdx / (data.length - 1)) * 95}%` }}
          >
            <span className="text-white">{data[hoveredIdx]}</span> <span className="text-zinc-500 not-italic uppercase text-[8px]">Sinais</span>
            <div className="text-neon-blue uppercase text-[7px] tracking-widest leading-none mt-0.5">{hoveredIdx}:00h</div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-3 px-1 text-[9px] font-black text-zinc-700 uppercase tracking-tighter">
        {['00h', '06h', '12h', '18h', '23h'].map(t => <span key={t}>{t}</span>)}
      </div>

      <style>{`
        @keyframes scanning {
          0% { transform: translateX(0); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateX(800px); opacity: 0; }
        }
        .animate-scanning-line {
          animation: scanning 4s linear infinite;
        }
      `}</style>
    </div>
  );
};

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
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs><linearGradient id={`g-${gid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
          {!isEmpty && (
            <g className="animate-in fade-in duration-700">
              {hoverIdx !== null && points[hoverIdx] && (
                <line x1={points[hoverIdx].x} y1={0} x2={points[hoverIdx].x} y2={height - bottomPadding} stroke={color} strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
              )}
              <path d={areaData} fill={`url(#g-${gid})`} />
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
              left: `${(points[hoverIdx].x / width) * 100}%`,
              top: `${(points[hoverIdx].y / height) * 100}%`,
              transform: `translate(-50%, -125%)`
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

  // Filter out zero counts and ensure valid percentages
  const validData = data.filter(d => d.count > 0).map(d => ({
    ...d,
    percentage: typeof d.percentage === 'number' && !isNaN(d.percentage) ? d.percentage : 0
  }));

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="w-52 h-52 relative shrink-0">
        <svg viewBox="0 0 100 100" className="transform -rotate-90 overflow-visible">
          {validData.map((d, i) => {
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
                fill={colors[d.category] || `hsl(${(i * 137) % 360}, 70%, 50%)`}
                opacity={hoveredCategory && !isHovered ? 0.3 : 0.8}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredCategory(d.category)}
                onMouseLeave={() => setHoveredCategory(null)}
                style={{
                  filter: isHovered ? `drop-shadow(0 0 12px ${colors[d.category] || '#fff'})` : 'none',
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
          <div className="text-3xl font-black text-white italic drop-shadow-lg">{data.reduce((a, b) => a + (b.count || 0), 0)}</div>
        </div>
      </div>

      <div className="w-full space-y-2.5">
        {validData.map((d, i) => {
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
                    backgroundColor: colors[d.category] || `hsl(${(i * 137) % 360}, 70%, 50%)`,
                    boxShadow: isHovered ? `0 0 12px ${colors[d.category] || '#fff'}` : 'none'
                  }}
                />
                <span className={clsx(
                  "uppercase tracking-[0.1em] transition-colors duration-300 truncate max-w-[120px]",
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
                  {Math.round(d.percentage)}%
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

  const [days, setDays] = useState(7);
  const [selectedProfileId, setSelectedProfileId] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [npsFilter, setNpsFilter] = useState<'all' | 'promoter' | 'passive' | 'detractor'>('all');

  const startTs = useMemo(() => startDate ? new Date(startDate).getTime() : undefined, [startDate]);
  const endTs = useMemo(() => endDate ? new Date(endDate + 'T23:59:59').getTime() : undefined, [endDate]);

  const [rawEvents, setRawEvents] = useState<any[]>([]);
  const [rawLeads, setRawLeads] = useState<any[]>([]);
  const [rawNps, setRawNps] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      if (selectedProfileId === 'all' && !userClientId) return;
      setLoading(true);
      try {
        const summary = await getProfileSummary(selectedProfileId, days, userClientId, startTs, endTs);
        const events = await getFilteredEvents(selectedProfileId, days, userClientId, startTs, endTs);
        const [officialLeads, officialNps] = await Promise.all([
          leadsApi.listByClient(userClientId),
          npsApi.listByClient(userClientId)
        ]);
        if (mounted) {
          setSummaryData(summary);
          setRawEvents(Array.isArray(events) ? events : []);
          setRawLeads(Array.isArray(officialLeads) ? officialLeads : []);
          setRawNps(Array.isArray(officialNps) ? officialNps : []);
        }
      } catch (err) {
        console.error("[InsightsPage] Error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, [selectedProfileId, days, userClientId, startTs, endTs]);

  const normalizedEvents = useMemo(() => rawEvents.map(e => normalizeEvent(e, clientProfiles)), [rawEvents, clientProfiles]);

  const heatmapData = useMemo(() => {
    const hourly = Array(24).fill(0);
    normalizedEvents.forEach(e => {
      try {
        const h = new Date(e.ts).getHours();
        hourly[h]++;
      } catch (err) { }
    });
    return hourly;
  }, [normalizedEvents]);

  const summary = useMemo(() => {
    const data = summaryData;
    return {
      totalViews: data?.totalViews || 0,
      totalClicks: data?.totalClicks || 0,
      ctr: data?.ctr || 0,
      clicksByDate: data?.clicksByDate || [],
      contentPerformance: {
        byCategory: data?.contentPerformance?.byCategory || [],
        pixCopies: data?.contentPerformance?.pixCopies || 0
      },
      hourlyTraffic: data?.hourlyTraffic || Array(24).fill(0),
      sources: data?.sources || []
    };
  }, [summaryData]);

  const hits = useMemo(() =>
    normalizedEvents.filter(e => e.type !== 'view' && e.type !== 'nps_response' && e.assetId),
    [normalizedEvents]);

  const stats = useMemo(() => {
    const findCatCount = (cat: string) => {
      // Prioritize explicit KPI count from RPC if available, fallback to category list
      const fromSummary = (summaryData as any)?.[`${cat}_count`];
      if (typeof fromSummary === 'number') return fromSummary;
      return summary.contentPerformance?.byCategory?.find((c: any) => c.category === cat)?.count || 0;
    };

    // Total actions normalization
    const totalActions = summary.totalClicks || hits.length;

    return {
      views: summary.totalViews,
      actions: totalActions,
      ctr: summary.ctr,
      pix: (summaryData as any)?.pix_count || summary.contentPerformance?.pixCopies || hits.filter(h => h.assetType === 'pix').length,
      vid: (summaryData as any)?.video_count || summary.contentPerformance?.byCategory?.find((c: any) => c.category === 'video')?.count || hits.filter(h => h.assetType === 'video' || h.type === 'video_view').length,
      cat: findCatCount('catalog'),
      port: findCatCount('portfolio'),
      leads: summaryData?.leadsCount || 0
    };
  }, [summary, hits, summaryData]);

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
        const p = clientProfiles.find(x => x.id === e.profileId);
        map[key] = { label: e.assetLabel, count: 0, type: e.moduleOrigin || e.assetType, profileName: p?.displayName || 'Node' };
      }
      map[key].count++;
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 10).map(x => ({ ...x, percentage: hits.length > 0 ? (x.count / hits.length * 100) : 0 }));
  }, [hits, clientProfiles]);

  const invisibleItems = useMemo(() => {
    const scans = selectedProfileId === 'all' ? clientProfiles : clientProfiles.filter(p => p.id === selectedProfileId);
    const items: { label: string; type: string; id: string; profileName: string }[] = [];
    scans.forEach(p => {
      (p.buttons ?? []).filter(b => b.enabled).forEach(b => items.push({ label: b.label, type: 'button', id: b.id, profileName: p.displayName }));
      (p.portfolioItems ?? []).filter(i => i.isActive).forEach(i => items.push({ label: i.title || 'Foto', type: 'portfolio', id: i.id, profileName: p.displayName }));
      (p.catalogItems ?? []).filter(i => i.isActive).forEach(i => items.push({ label: i.title || 'Produto', type: 'catalog', id: i.id, profileName: p.displayName }));
      (p.youtubeVideos ?? []).filter(i => i.isActive).forEach(i => items.push({ label: i.title || 'Vídeo', type: 'video', id: i.id, profileName: p.displayName }));
    });
    const clickedIds = new Set(hits.map(e => e.assetId));
    return items.filter(x => !clickedIds.has(x.id)).slice(0, 20);
  }, [clientProfiles, hits, selectedProfileId]);

  const profilePerformance = useMemo(() => {
    const map: Record<string, { count: number; name: string }> = {};
    hits.forEach(e => {
      if (!map[e.profileId]) {
        const p = clientProfiles.find(x => x.id === e.profileId);
        map[e.profileId] = { count: 0, name: p?.displayName || 'Node' };
      }
      map[e.profileId].count++;
    });
    return Object.entries(map).map(([id, d]) => ({ id, name: d.name, count: d.count, percentage: hits.length > 0 ? (d.count / hits.length * 100) : 0 })).sort((a, b) => b.count - a.count);
  }, [hits, clientProfiles]);

  const insights = useMemo(() => {
    const list: string[] = [];
    const best = topInteractions[0];
    if (best) list.push(`O ativo "${best.label}" é o principal gerador de sinais.`);
    if (stats.cat > stats.port) list.push("Seu Catálogo está superando o Portfólio.");
    if (invisibleItems.length > 0) list.push("Alguns ativos nunca foram clicados. Considere revisar o copy.");
    return list;
  }, [topInteractions, stats, invisibleItems]);

  if (!canAccessFeature(client?.plan, 'analytics')) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
        <TopBar title="Insights" />
        <div className="w-24 h-24 bg-blue-600/10 text-neon-blue rounded-[3rem] flex items-center justify-center mb-8 border border-white/5 animate-pulse"><BarChart size={48} /></div>
        <h1 className="text-5xl font-black mb-6 italic tracking-tight">Upgrade to Intelligence</h1>
        <p className="text-zinc-500 max-w-md mb-12">Métricas em tempo real são exclusivas Pro.</p>
        <Link to="/app/upgrade" className="bg-white text-black px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all"><Zap size={16} className="inline mr-3" /> Get Advanced Access</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32">
      <TopBar title="Insights Intelligence" showBack />
      <main className="max-w-[1600px] mx-auto p-6 lg:p-12 pt-32">
        <header className="flex flex-col lg:flex-row justify-between lg:items-end gap-12 mb-20">
          <div>
            <div className="flex items-center gap-4 mb-6"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse" /><span className="text-[10px] font-black text-neon-blue uppercase px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full tracking-widest">Live Network Stream</span></div>
            <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter leading-none">Insights <span className="text-neon-blue">Engine</span></h1>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <div className="group relative">
              <select value={selectedProfileId} onChange={e => setSelectedProfileId(e.target.value)} className="bg-black border border-white/5 rounded-2xl pl-12 pr-12 py-4 text-[10px] font-black uppercase cursor-pointer hover:bg-white/5 transition-all appearance-none outline-none">
                <option value="all">Sincronizar Hub</option>
                {clientProfiles.map(p => <option key={p.id} value={p.id}>{p.displayName}</option>)}
              </select>
              <Layout size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-hover:text-neon-blue transition-colors" />
              <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-700" />
            </div>
            <div className="flex bg-black/40 border border-white/5 p-1.5 rounded-2xl items-center shadow-2xl">
              {[7, 30, 90].map(d => <button key={d} onClick={() => setDays(d)} className={clsx("px-6 py-2.5 rounded-xl text-[9px] font-black transition-all", days === d ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-white")}>{d}D</button>)}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-6 mb-16">
          <KpiCard label="Visitas Hub" value={stats.views} icon={Users} color="text-blue-500" />
          <KpiCard label="Signals Total" value={stats.actions} icon={MousePointer2} color="text-purple-500" />
          <KpiCard label="Conversão" value={`${stats.ctr.toFixed(1)}%`} icon={Target} color="text-emerald-500" />
          <KpiCard label="Leads Sync" value={stats.leads} icon={MessageSquare} color="text-amber-500" />
          <KpiCard label="Pix Sync" value={stats.pix} icon={Zap} color="text-yellow-500" />
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
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-neon-blue rounded-full shadow-[0_0_8px_#00f2ff]" style={{ width: `${x.percentage}%` }} /></div>
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* VIDEO PERFORMANCE DASHBOARD */}
          <div className="glass-neon-blue p-8 lg:p-10 rounded-[3.5rem] border border-white/5 bg-black/40 overflow-hidden flex flex-col h-[520px]">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-600/10 text-red-500 rounded-2xl border border-red-500/20"><Video size={20} /></div>
                <div>
                  <h4 className="text-xl font-black italic tracking-tighter">Video <span className="text-red-500">Performance</span></h4>
                  <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Ranking por visualizações únicas</p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
              {(() => {
                const videoData = normalizedEvents
                  .filter(e => (e.assetType === 'video' || e.type === 'video_view'))
                  .reduce((acc: any, e) => {
                    const label = e.assetLabel || `Vídeo #${(e.assetId || '0').slice(-4)}`;
                    const key = `${e.profileId}-${e.assetId || 'unknown'}-${label}`;
                    if (!acc[key]) acc[key] = { label, count: 0, profileName: clientProfiles.find(p => p.id === e.profileId)?.displayName || 'Node' };
                    acc[key].count++;
                    return acc;
                  }, {});

                const sortedVideos = Object.values(videoData).sort((a: any, b: any) => b.count - a.count);
                if (sortedVideos.length === 0) return <div className="h-full flex flex-col items-center justify-center opacity-10 py-20"><Video size={48} className="mb-4" /><div>Nenhum vídeo assistido ainda</div></div>;

                const maxVideo = (sortedVideos[0] as any).count || 1;

                return sortedVideos.map((v: any, i) => (
                  <div key={i} className="p-5 bg-white/5 rounded-3xl border border-white/5 hover:border-red-500/10 transition-all group/vid">
                    <div className="flex justify-between items-center mb-3">
                      <div className="truncate pr-4">
                        <span className="text-xs font-black text-white uppercase italic group-hover/vid:text-red-500 transition-colors">{v.label}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{v.profileName}</span>
                          <span className="w-1 h-1 rounded-full bg-zinc-800" />
                          <span className="text-[8px] font-black text-red-500/60 uppercase">Engagement High</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-white italic tabular-nums">{v.count}</div>
                        <div className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Views</div>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.4)]" style={{ width: `${(v.count / maxVideo) * 100}%` }} />
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* CATALOG INTELLIGENCE DASHBOARD */}
          <div className="glass-neon-blue p-8 lg:p-10 rounded-[3.5rem] border border-white/5 bg-black/40 overflow-hidden flex flex-col h-[520px]">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-600/10 text-amber-500 rounded-2xl border border-amber-500/20"><Package size={20} /></div>
                <div>
                  <h4 className="text-xl font-black italic tracking-tighter">Catalog <span className="text-amber-500">Intelligence</span></h4>
                  <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Interesse vs Intenção de Compra</p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
              {(() => {
                const catalogData = normalizedEvents
                  .filter(e => e.assetType === 'catalog' || (e.type === 'click' && e.assetLabel?.toLowerCase().includes('chamar')))
                  .reduce((acc: any, e) => {
                    // Normalize key: if it's a generic click with "chamar", we try to find the last item viewed or categorize it
                    const isGenericCTA = e.type === 'click' && e.assetLabel?.toLowerCase().includes('chamar');
                    const key = isGenericCTA ? 'generic-cta' : `${e.profileId}-${e.assetId}`;

                    if (!acc[key]) acc[key] = {
                      label: isGenericCTA ? 'Chamada Direta WhatsApp' : e.assetLabel,
                      views: 0,
                      cta: 0,
                      profileName: clientProfiles.find(p => p.id === e.profileId)?.displayName || 'Node'
                    };

                    if (e.type === 'catalog_zoom') acc[key].views++;
                    if (e.type === 'catalog_cta_click' || isGenericCTA) acc[key].cta++;
                    return acc;
                  }, {});

                const sortedItems = Object.values(catalogData).sort((a: any, b: any) => (b.views + b.cta) - (a.views + a.cta));

                if (sortedItems.length === 0) return <div className="h-full flex flex-col items-center justify-center opacity-10 py-20"><Package size={48} className="mb-4" /><div>Nenhuma interação no catálogo</div></div>;

                return sortedItems.map((item: any, i) => (
                  <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-amber-500/10 transition-all group/cat">
                    <div className="flex justify-between items-start mb-4">
                      <div className="truncate pr-4">
                        <span className="text-xs font-black text-white uppercase italic group-hover/cat:text-amber-500 transition-colors block mb-1">{item.label}</span>
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{item.profileName}</span>
                      </div>
                      <div className="flex shrink-0 gap-3">
                        <div className="text-center px-3 py-1 bg-black/20 rounded-lg border border-white/5">
                          <div className="text-xs font-black text-white italic">{item.views}</div>
                          <div className="text-[6px] font-black text-zinc-600 uppercase">Views</div>
                        </div>
                        <div className="text-center px-3 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20">
                          <div className="text-xs font-black text-amber-500 italic">{item.cta}</div>
                          <div className="text-[6px] font-black text-amber-600 uppercase">CTAs</div>
                        </div>
                      </div>
                    </div>
                    {/* Tiny bar chart comparing View vs CTA for this item */}
                    <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden flex">
                      <div className="h-full bg-zinc-500" style={{ width: `${(item.views / (item.views + item.cta || 1)) * 100}%` }} />
                      <div className="h-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" style={{ width: `${(item.cta / (item.views + item.cta || 1)) * 100}%` }} />
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
          <div className="lg:col-span-2 glass-neon-blue rounded-[3.5rem] p-8 lg:p-10 border border-white/5 bg-black/40 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-blue/5 blur-[120px] rounded-full -mr-20 -mt-20" />
            <div className="flex flex-col md:flex-row gap-16 items-center relative z-10">
              <div className="flex-1 space-y-8 text-center md:text-left">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-[9px] font-black text-neon-blue uppercase tracking-[0.3em] mb-4"><Radio size={10} className="animate-pulse" /> Live Activity Radar</div>
                  <h3 className="text-4xl font-black italic tracking-tighter leading-none mb-4">Signal <span className="text-neon-blue">Radar</span></h3>
                  <p className="text-[11px] text-zinc-500 font-bold leading-relaxed max-w-sm italic">Monitoramento cíclico 24h.</p>
                </div>
                <div className="grid grid-cols-2 gap-6 pt-2">
                  <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                    <div className="text-[8px] font-black text-zinc-600 uppercase mb-1 tracking-widest">Pico</div>
                    <div className="text-2xl font-black text-white italic">{heatmapData.indexOf(Math.max(...heatmapData))}h:00</div>
                  </div>
                  <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                    <div className="text-[8px] font-black text-zinc-600 uppercase mb-1 tracking-widest">Ativos</div>
                    <div className="text-2xl font-black text-neon-blue italic">{heatmapData.reduce((a, b) => a + b, 0)}</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 py-4 relative w-full">
                <SignalRadarWave data={heatmapData} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-10">
            {/* NOVO GRÁFICO DE PORTFÓLIO */}
            {(() => {
              const portfolioClicks = normalizedEvents
                .filter(e => e.type === 'portfolio_click')
                .reduce((acc: Record<string, number>, e) => {
                  const label = e.assetLabel || 'Sem Título';
                  acc[label] = (acc[label] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);

              const totalValue: number = (Object.values(portfolioClicks) as number[]).reduce((a, b) => a + b, 0);
              const pieData = Object.entries(portfolioClicks).map(([name, value]) => {
                const count = Number(value) || 0;
                return {
                  category: name,
                  count,
                  percentage: totalValue > 0 ? (count / totalValue) * 100 : 0
                };
              });

              return (
                <div className="glass-neon-blue p-8 lg:p-10 rounded-[3.5rem] border border-white/5 bg-black/40 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-xl font-black italic tracking-tighter uppercase">Portfólio <span className="text-neon-blue">Engagement</span></h4>
                    <div className="p-2.5 bg-neon-blue/10 rounded-xl border border-neon-blue/20 text-neon-blue"><Camera size={18} /></div>
                  </div>

                  {pieData.length > 0 ? (
                    <div className="flex flex-col md:flex-row items-center gap-10 flex-1">
                      <div className="w-48 h-48 shrink-0">
                        <SimplePieChart data={pieData} />
                      </div>
                      <div className="flex-1 space-y-3 w-full">
                        <div className="text-[9px] font-black text-zinc-600 uppercase mb-4 tracking-widest">Top Engajamento</div>
                        {pieData.sort((a, b) => b.count - a.count).slice(0, 4).map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-[10px] font-black text-white italic truncate max-w-[120px]">{item.category}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-neon-blue italic">{Math.round(item.percentage)}%</span>
                              <span className="text-[9px] font-bold text-zinc-700">{item.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-20 py-10">
                      <Camera size={32} className="mb-4" />
                      <div className="text-[10px] font-black uppercase tracking-widest text-center">Nenhum clique<br />no portfólio ainda</div>
                    </div>
                  )}
                </div>
              );
            })()}

            {rawNps.length > 0 && (() => {
              const segments = { promoter: rawNps.filter(n => n.score >= 9), passive: rawNps.filter(n => n.score >= 7 && n.score <= 8), detractor: rawNps.filter(n => n.score <= 6) };
              const total = rawNps.length || 1;
              return (
                <div className="glass-neon-blue p-8 lg:p-10 rounded-[3.5rem] border border-white/5 bg-black/40 flex-1 flex flex-col">
                  <h4 className="text-xl font-black mb-10 italic tracking-tighter uppercase">Net <span className="text-emerald-500">Promoter</span> Analysis</h4>
                  <div className="grid grid-cols-3 gap-6 mb-10">
                    {Object.entries(segments).map(([k, v]) => (
                      <div key={k} className="text-center">
                        <div className="text-[8px] font-black text-zinc-600 uppercase mb-2">{k}</div>
                        <div className={clsx("text-xl font-black", k === 'promoter' ? 'text-emerald-500' : k === 'passive' ? 'text-zinc-500' : 'text-rose-500')}>{Math.round(v.length / total * 100)}%</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 mt-6 overflow-hidden flex flex-col">
                    <div className="text-[9px] font-black text-zinc-600 uppercase mb-4 tracking-widest">Feedback Recente</div>
                    <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[160px]">
                      {rawNps.filter(n => n.comment).length > 0 ? (
                        rawNps.filter(n => n.comment).slice(0, 10).map((n, i) => (
                          <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/10 transition-all">
                            <div className="flex justify-between items-center mb-2">
                              <span className={clsx(
                                "text-[8px] font-black px-2 py-0.5 rounded-full uppercase",
                                n.score >= 9 ? "bg-emerald-500/10 text-emerald-500" : n.score >= 7 ? "bg-zinc-500/10 text-zinc-400" : "bg-rose-500/10 text-rose-500"
                              )}>
                                {n.score >= 9 ? 'Promotor' : n.score >= 7 ? 'Neutro' : 'Detrator'}
                              </span>
                              <span className="text-[8px] font-black text-zinc-600 italic">Score {n.score}</span>
                            </div>
                            <p className="text-[10px] text-zinc-300 italic leading-relaxed line-clamp-2">"{n.comment}"</p>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 opacity-20">
                          <MessageSquare size={24} className="mb-2" />
                          <div className="text-[8px] font-black uppercase tracking-widest">Sem feedbacks textuais</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {(summary as any).utmSummary?.sources?.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
            <div className="lg:col-span-2 glass-neon-blue p-8 lg:p-10 rounded-[3.5rem] border border-white/5 bg-black/40">
              <h3 className="text-2xl font-black italic tracking-tighter mb-10">Marketing <span className="text-amber-500">Intelligence</span></h3>
              <div className="grid grid-cols-2 gap-10">
                <div>
                  <div className="text-[10px] font-black text-zinc-600 uppercase mb-4 tracking-widest">Top Campaigns</div>
                  {(summary as any).utmSummary.campaigns.slice(0, 5).map((c: any, i: number) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-white/5">
                      <span className="text-xs font-black text-white italic truncate pr-4">{c.name}</span>
                      <span className="text-sm font-black text-amber-500">{c.value}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-[10px] font-black text-zinc-600 uppercase mb-4 tracking-widest">Top Sources</div>
                  {(summary as any).utmSummary.sources.slice(0, 5).map((c: any, i: number) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-white/5">
                      <span className="text-xs font-black text-white italic truncate pr-4">{c.name}</span>
                      <span className="text-sm font-black text-amber-500">{c.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="glass-neon-blue p-8 lg:p-10 rounded-[3.5rem] border border-white/5 bg-black/40 flex flex-col justify-center text-center gap-6">
              <div className="flex justify-center"><div className="p-5 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-500"><Zap size={32} /></div></div>
              <h4 className="text-xl font-black italic tracking-tighter uppercase">Marketing Cycle</h4>
              <p className="text-[10px] font-bold text-zinc-500 italic leading-relaxed">Automatização de atribuição.</p>
            </div>
          </div>
        )}

        <div className="glass-neon-blue p-8 lg:p-10 rounded-[4rem] border border-white/5 bg-black/40">
          <div className="flex items-center gap-6 mb-12"><div className="p-3.5 bg-indigo-600/10 text-indigo-400 rounded-2xl border border-indigo-500/20"><PieChartIcon size={22} /></div><div><h3 className="text-2xl font-black italic tracking-tighter">Hub <span className="text-indigo-400">Analysis</span></h3><p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mt-1">Sinais distribuídos por Nodes</p></div><div className="h-px flex-1 bg-white/5" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {profilePerformance.map((x, i) => (
              <div key={i} className="p-8 bg-black border border-white/5 rounded-[2.5rem] group hover:border-indigo-500/20 transition-all">
                <div className="flex justify-between items-end mb-6"><div><div className="text-[9px] font-black text-zinc-700 uppercase mb-2">NODE_{(i + 1).toString().padStart(3, '0')}</div><div className="text-xl font-black truncate text-white uppercase italic tracking-tighter group-hover:text-indigo-400 transition-colors">{x.name}</div></div><div className="text-right"><div className="text-3xl font-black tabular-nums">{x.count}</div><div className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-1">{x.percentage.toFixed(1)}%</div></div></div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative z-10"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${x.percentage}%` }} /></div>
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