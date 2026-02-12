"use client";

import React, { useMemo } from 'react';
import { NpsEntry } from '../../types';
import { TrendingUp, Smile, Meh, Frown, MessageSquare, Award } from 'lucide-react';
import clsx from 'clsx';

interface NpsDashboardProps {
  npsEntries: NpsEntry[];
}

const NpsDashboard: React.FC<NpsDashboardProps> = ({ npsEntries }) => {
  const stats = useMemo(() => {
    const total = npsEntries.length;
    if (total === 0) return null;

    const promoters = npsEntries.filter(n => n.score >= 9).length;
    const neutrals = npsEntries.filter(n => n.score >= 7 && n.score <= 8).length;
    const detractors = npsEntries.filter(n => n.score <= 6).length;

    const npsScore = ((promoters - detractors) / total) * 100;
    const avgScore = npsEntries.reduce((acc, n) => acc + n.score, 0) / total;

    return {
      total,
      promoters,
      neutrals,
      detractors,
      npsScore: Math.round(npsScore),
      avgScore: avgScore.toFixed(1),
      promoterPerc: Math.round((promoters / total) * 100),
      neutralPerc: Math.round((neutrals / total) * 100),
      detractorPerc: Math.round((detractors / total) * 100),
    };
  }, [npsEntries]);

  if (!stats) {
    return (
      <div className="bg-zinc-900/40 border border-white/5 rounded-[3rem] p-10 text-center animate-in fade-in duration-700">
        <MessageSquare size={32} className="mx-auto text-zinc-700 mb-4" />
        <h3 className="text-xl font-black tracking-tight mb-2">Aguardando Avaliações</h3>
        <p className="text-zinc-500 text-sm">As avaliações de NPS dos seus clientes aparecerão aqui assim que forem enviadas.</p>
      </div>
    );
  }

  return (
    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-black tracking-tighter">Experiência do Cliente (NPS)</h2>
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20">
          <Award size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Plano Pro Ativo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card Principal: NPS Score */}
        <div className="lg:col-span-8 bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp size={200} />
           </div>
           
           <div className="flex flex-col items-center text-center space-y-2 relative z-10">
              <div className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Índice NPS</div>
              <div className={clsx(
                "text-8xl font-black tracking-tighter",
                stats.npsScore > 70 ? "text-emerald-500" : stats.npsScore > 30 ? "text-amber-500" : "text-red-500"
              )}>
                {stats.npsScore}
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                Score Global
              </div>
           </div>

           <div className="flex-1 w-full space-y-6 relative z-10">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-emerald-500">
                  <span>Promotores (9-10)</span>
                  <span>{stats.promoterPerc}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${stats.promoterPerc}%` }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-amber-500">
                  <span>Neutros (7-8)</span>
                  <span>{stats.neutralPerc}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${stats.neutralPerc}%` }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-red-500">
                  <span>Detratores (0-6)</span>
                  <span>{stats.detractorPerc}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${stats.detractorPerc}%` }}></div>
                </div>
              </div>
           </div>
        </div>

        {/* Card Lateral: Média e Volume */}
        <div className="lg:col-span-4 grid grid-cols-1 gap-6">
           <div className="bg-zinc-900/40 border border-white/5 rounded-[3rem] p-8 flex flex-col justify-between shadow-xl">
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Nota Média (0-10)</div>
              <div className="flex items-end gap-3">
                 <div className="text-6xl font-black tracking-tighter text-white">{stats.avgScore}</div>
                 <div className="mb-2 text-zinc-700 font-black">/ 10</div>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-zinc-400">
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                 Cálculo em tempo real
              </div>
           </div>

           <div className="bg-zinc-900/40 border border-white/5 rounded-[3rem] p-8 flex flex-col justify-between shadow-xl">
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Total de Respostas</div>
              <div className="text-6xl font-black tracking-tighter text-white">{stats.total}</div>
              <div className="mt-6 flex items-center gap-2">
                 <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-zinc-900"><Smile size={10} className="text-white" /></div>
                    <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center border-2 border-zinc-900"><Meh size={10} className="text-white" /></div>
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center border-2 border-zinc-900"><Frown size={10} className="text-white" /></div>
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Feedback Qualitativo</span>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
};

export default NpsDashboard;