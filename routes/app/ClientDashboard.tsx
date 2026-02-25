"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, generateId } from '@/lib/storage';
import { normalizeEvent } from '@/lib/eventNormalizer';
import { PLANS_CONFIG } from '@/lib/plansConfig';
import { useClientData } from '@/hooks/useClientData';
import { leadsApi } from '@/lib/api/leads';
import { npsApi } from '@/lib/api/nps';
import { clientsApi } from '@/lib/api/clients';
import { profilesApi } from '@/lib/api/profiles';
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Globe,
  Layout,
  Lock,
  MessageSquare,
  MousePointer2,
  Plus,
  RotateCcw,
  Shield,
  Smile,
  Target,
  Trash2,
  User,
  Users,
  Zap,
  Smartphone,
  Monitor,
  Link as LinkIcon,
  Film,
  ShoppingBag,
  Image as ImageIcon,
  X,
  ExternalLink
} from 'lucide-react';
import { getProfileSummary, getFilteredEvents } from '@/lib/analytics';
import { PLANS } from '@/lib/plans';
import { canAccessFeature } from '@/lib/permissions';
import TopBar from '@/components/common/TopBar';
import clsx from 'clsx';
import { PlanType, SchedulingSlot } from '@/types';

// --- AGENDA TAB COMPONENT ---
const AgendaTab: React.FC<{ client: any, profiles: any[], onUpdate: () => void }> = ({ client, profiles, onUpdate }) => {
  const scope = client?.schedulingScope || 'global';
  const [selectedProfileId, setSelectedProfileId] = useState<string>(profiles[0]?.id || '');
  const [slots, setSlots] = useState<SchedulingSlot[]>([]);
  const [viewSlot, setViewSlot] = useState<SchedulingSlot | null>(null);

  // Persistence Loading
  useEffect(() => {
    if (!client) return;

    if (scope === 'global') {
      setSlots(client.globalSlots || []);
    } else {
      const profile = profiles.find(p => p.id === selectedProfileId);
      setSlots(profile?.nativeSlots || []);
    }
  }, [scope, selectedProfileId, client, profiles]);

  // Handle Save (Persistence)
  const persistSlots = async (slotsToSave: SchedulingSlot[]) => {
    setSlots(slotsToSave);
    try {
      if (scope === 'global') {
        await clientsApi.syncGlobalSlots(client.id, slotsToSave);
      } else if (selectedProfileId) {
        await profilesApi.syncSchedulingSlots(selectedProfileId, slotsToSave, client.id);
      }
      onUpdate();
    } catch (err) {
      console.error('[AgendaTab] Error syncing slots:', err);
      alert('Erro ao sincronizar agenda com o servidor.');
    }
  };

  // Local State Update (Fast Typing)
  const updateLocally = (newSlots: SchedulingSlot[]) => {
    setSlots(newSlots);
  };



  const addSlot = (dayIndex: number, start = '09:00', end = '18:00') => {
    const next: SchedulingSlot = {
      id: generateId(),
      dayOfWeek: dayIndex,
      startTime: start,
      endTime: end,
      isActive: true,
      status: 'available'
    };
    persistSlots([...slots, next]);
  };

  const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const stats = useMemo(() => {
    const total = slots.length;
    const active = slots.filter(s => !s.status || s.status === 'available').length;
    const booked = slots.filter(s => s.status === 'booked').length;
    const pending = slots.filter(s => s.status === 'pending').length;
    return { total, active, booked, pending };
  }, [slots]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4 bg-black/40 border border-white/5 p-2 rounded-2xl relative max-w-md">
          <div className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-white/10 text-white">
              {scope === 'global' ? <Globe size={14} /> : <User size={14} />}
            </div>
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Modo Atual</div>
              <div className="text-xs font-bold text-white capitalize">{scope === 'global' ? 'Global Layer' : 'Per Profile'}</div>
            </div>
          </div>

          <Link
            to="/app/settings"
            className="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 border border-transparent hover:border-white/5"
          >
            <Shield size={14} />
            Configurar
          </Link>
        </div>

        {scope === 'per_profile' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar max-w-2xl">
            {profiles.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedProfileId(p.id)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all whitespace-nowrap",
                  selectedProfileId === p.id
                    ? "bg-neon-blue/10 border-neon-blue/30 text-neon-blue"
                    : "bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10"
                )}
              >
                <img src={p.avatarUrl} className="w-5 h-5 rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-wide">{p.displayName}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total slots', value: stats.total, color: 'text-white', bg: 'bg-white/5', icon: Globe },
          { label: 'Disponíveis', value: stats.active, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Check },
          { label: 'Pendentes', value: stats.pending, color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock },
          { label: 'Reservados', value: stats.booked, color: 'text-purple-400', bg: 'bg-purple-500/10', icon: Calendar }
        ].map((s, i) => (
          <div key={i} className={clsx(
            "relative p-8 rounded-[2rem] border border-white/5 overflow-hidden group transition-all hover:scale-[1.02]",
            s.bg
          )}>
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <span className="text-4xl font-black italic tracking-tighter" style={{ color: 'inherit' }}>{s.value}</span>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{s.label}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <s.icon size={20} className={s.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Grid Planner */}
      <div className="bg-black/20 border border-white/5 rounded-[3rem] p-8 lg:p-12">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
          <div>
            <h3 className="text-2xl font-black italic tracking-tight text-white uppercase">Arquitetura de <span className="text-neon-blue">Disponibilidade</span></h3>
            <p className="text-sm text-zinc-500 font-medium mt-2 italic">Defina os protocolos de tempo que a rede pode consumir.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-3">Protocolos Rápidos:</span>
            <button onClick={() => {
              if (window.confirm('Aplicar horário comercial a todos os dias úteis?')) {
                let newSlots = [...slots];
                [1, 2, 3, 4, 5].forEach(day => {
                  if (!newSlots.find(s => s.dayOfWeek === day)) {
                    newSlots.push({ id: generateId(), dayOfWeek: day, startTime: '09:00', endTime: '18:00', isActive: true, status: 'available' });
                  }
                });
                persistSlots(newSlots);
              }
            }} className="px-4 py-2 bg-zinc-800 hover:bg-white hover:text-black rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Semana Full</button>
            <button onClick={() => persistSlots([])} className="px-4 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Limpar Tudo</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
          {DAYS.map((day, idx) => {
            const daySlots = slots.filter(s => s.dayOfWeek === idx).sort((a, b) => a.startTime.localeCompare(b.startTime));
            return (
              <div key={idx} className="space-y-4 group/day w-full">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white italic tracking-widest uppercase">{day}</span>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{daySlots.length} HORÁRIOS</span>
                  </div>
                  <button
                    onClick={() => addSlot(idx)}
                    className="w-8 h-8 bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue hover:text-black rounded-xl flex items-center justify-center transition-all active:scale-90"
                  >
                    <Plus size={16} strokeWidth={3} />
                  </button>
                </div>

                <div className="space-y-2">
                  {daySlots.length === 0 && (
                    <div className="h-24 rounded-[1.5rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-1 opacity-40 group-hover/day:opacity-100 transition-opacity">
                      <Clock size={16} className="text-zinc-700" />
                      <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Vazio</span>
                    </div>
                  )}

                  {daySlots.map(slot => (
                    <div
                      key={slot.id}
                      onClick={() => (slot.status === 'booked' || slot.status === 'pending') && setViewSlot(slot)}
                      className={clsx(
                        "p-5 rounded-[1.5rem] border transition-all relative group overflow-hidden",
                        (slot.status === 'booked' || slot.status === 'pending') && "cursor-pointer",
                        slot.status === 'booked'
                          ? "bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20"
                          : slot.status === 'pending'
                            ? "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20"
                            : "bg-white/5 border-white/10 hover:border-neon-blue/40 hover:bg-white/[0.08]"
                      )}
                    >
                      <div className="flex items-center justify-between mb-3 relative z-10">
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateLocally(slots.map(s => s.id === slot.id ? { ...s, startTime: e.target.value } : s))}
                            onBlur={() => persistSlots(slots)}
                            className="bg-transparent text-xs font-black text-white w-12 outline-none p-0 focus:text-neon-blue transition-colors text-center"
                          />
                          <span className="text-[9px] font-bold text-zinc-700">➜</span>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateLocally(slots.map(s => s.id === slot.id ? { ...s, endTime: e.target.value } : s))}
                            onBlur={() => persistSlots(slots)}
                            className="bg-transparent text-xs font-black text-white w-12 outline-none p-0 focus:text-neon-blue transition-colors text-center"
                          />
                        </div>
                        <button
                          onClick={() => persistSlots(slots.filter(s => s.id !== slot.id))}
                          className="opacity-0 group-hover:opacity-100 p-1.5 bg-rose-500/10 text-rose-500 rounded-lg transition-all active:scale-90"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {slot.status === 'booked' ? (
                        <div className="mt-2 pt-2 border-t border-purple-500/20 relative z-10 flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-purple-500" />
                            <span className="text-[9px] font-black text-purple-300 truncate uppercase">{slot.bookedBy?.split(' (')[0]}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Liberar este horário? O agendamento será cancelado no sistema.')) {
                                persistSlots(slots.map(s => s.id === slot.id ? { ...s, status: 'available', bookedBy: undefined } : s));
                              }
                            }}
                            className="bg-purple-500 text-white text-[8px] font-black uppercase tracking-widest py-1.5 rounded-lg hover:bg-white hover:text-black transition-all"
                          >
                            Liberar Slot
                          </button>
                        </div>
                      ) : slot.status === 'pending' ? (
                        <div className="mt-2 pt-2 border-t border-amber-500/20 relative z-10 flex flex-col gap-2 animate-pulse">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-amber-500" />
                            <span className="text-[9px] font-black text-amber-300 truncate uppercase">{slot.bookedBy?.split(' (')[0]}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                persistSlots(slots.map(s => s.id === slot.id ? { ...s, status: 'booked' as const } : s));
                              }}
                              className="bg-amber-500 text-black text-[8px] font-black uppercase tracking-widest py-1.5 rounded-lg hover:bg-white transition-all outline-none"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Recusar este agendamento?')) {
                                  persistSlots(slots.map(s => s.id === slot.id ? { ...s, status: 'available', bookedBy: undefined } : s));
                                }
                              }}
                              className="bg-white/5 text-zinc-400 text-[8px] font-black uppercase tracking-widest py-1.5 rounded-lg hover:bg-rose-500 hover:text-white transition-all outline-none"
                            >
                              Recusar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => persistSlots(slots.map(s => s.id === slot.id ? { ...s, startTime: '09:00', endTime: '18:00' } : s))} className="text-[7px] font-black text-zinc-600 hover:text-white uppercase tracking-tighter bg-white/5 px-1.5 py-1 rounded">Full</button>
                          <button onClick={() => persistSlots(slots.map(s => s.id === slot.id ? { ...s, startTime: '08:00', endTime: '12:00' } : s))} className="text-[7px] font-black text-zinc-600 hover:text-white uppercase tracking-tighter bg-white/5 px-1.5 py-1 rounded">Manhã</button>
                          <button onClick={() => persistSlots(slots.map(s => s.id === slot.id ? { ...s, startTime: '13:00', endTime: '18:00' } : s))} className="text-[7px] font-black text-zinc-600 hover:text-white uppercase tracking-tighter bg-white/5 px-1.5 py-1 rounded">Tarde</button>
                        </div>
                      )}
                    </div>
                  ))}

                  {daySlots.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-2">
                      <button
                        onClick={() => {
                          const start = daySlots[daySlots.length - 1].endTime;
                          const [h, m] = start.split(':').map(Number);
                          const endH = (h + 1) % 24;
                          const end = `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                          addSlot(idx, start, end);
                        }}
                        className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-all transition-colors"
                      >
                        + SEQUÊNCIA
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Client Detail structural Modal */}
      <LeadDetailModal
        slot={viewSlot}
        onClose={() => setViewSlot(null)}
        onCancel={() => {
          if (window.confirm('Liberar este horário? O agendamento será cancelado no sistema.')) {
            persistSlots(slots.map(s => s.id === viewSlot?.id ? { ...s, status: 'available', bookedBy: undefined, leadId: undefined } : s));
            setViewSlot(null);
          }
        }}
      />
    </div>
  );
};

// --- NEW STRUCTURAL MODAL FOR LEADS ---
const LeadDetailModal: React.FC<{ slot: SchedulingSlot | null, onClose: () => void, onCancel: () => void }> = ({ slot, onClose, onCancel }) => {
  if (!slot) return null;

  const bookedParts = slot.bookedBy?.split(' (');
  const name = bookedParts?.[0] || 'Cliente';
  const contact = bookedParts?.[1]?.replace(')', '') || '';

  const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] max-w-sm w-full shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
              <User size={24} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Detalhes do Agendamento</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                {DAYS[slot.dayOfWeek]} • {slot.startTime} - {slot.endTime}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-5 bg-black/40 rounded-3xl border border-white/5 space-y-4">
            <div>
              <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Solicitante</div>
              <div className="text-sm font-black text-white">{name}</div>
            </div>

            {contact && (
              <div>
                <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Canal de Contato</div>
                <div className="text-sm font-bold text-zinc-300">{contact}</div>
              </div>
            )}

            {slot.bookedAt && (
              <div>
                <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Data da Solicitação</div>
                <div className="text-[11px] font-medium text-zinc-400">
                  {new Date(slot.bookedAt).toLocaleDateString('pt-BR')} às {new Date(slot.bookedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )}

            {slot.leadId && (
              <div className="pt-2">
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/20">
                  Vínculo com Lead Estruturado
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {contact && (
            <a
              href={`https://wa.me/${contact.replace(/\D/g, '')}`}
              target="_blank"
              className="w-full py-4 bg-emerald-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-[0_10px_30px_rgba(16,185,129,0.2)]"
            >
              <ExternalLink size={14} /> Chamar no WhatsApp
            </a>
          )}

          <button
            onClick={onClose}
            className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors"
          >
            Fechar
          </button>

          <button
            onClick={onCancel}
            className="w-full py-3 text-rose-500 text-[9px] font-black uppercase tracking-widest hover:underline opacity-60 hover:opacity-100"
          >
            Cancelar e Liberar Horário
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD ---
const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  // Integração com Supabase via Hook
  const { client, profiles: clientProfiles, loading, refresh } = useClientData();
  const userClientId = client?.id;
  const userPlan = client?.plan || 'starter';

  const [days, setDays] = useState(7);
  const [activeTab, setActiveTab] = useState<'overview' | 'agenda'>('overview');
  const [selectedSource, setSelectedSource] = useState('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [leads, setLeads] = useState<any[]>([]);
  const [nps, setNps] = useState<any[]>([]);

  const refreshData = (silent = false) => {
    refresh(silent); // Recarrega dados do banco
  };

  const startTs = useMemo(() => startDate ? new Date(startDate).getTime() : undefined, [startDate]);
  const endTs = useMemo(() => endDate ? new Date(endDate + 'T23:59:59').getTime() : undefined, [endDate]);

  // Estados para dados de analytics carregados de forma assíncrona
  const [summary, setSummary] = useState<any>({
    totalViews: 0,
    totalClicks: 0,
    ctr: 0,
    uniqueVisitors: 0,
    avgTimeOnPage: 0,
    bounceRate: 0,
    devices: [],
    topLocations: [],
    topLinks: [],
    contentPerformance: { byCategory: [] },
    hourlyTraffic: Array(24).fill(0),
    sources: []
  });
  const [normalizedEvents, setNormalizedEvents] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      try {
        const [summaryData, eventsData] = await Promise.all([
          getProfileSummary('all', days, userClientId, startTs, endTs, selectedSource),
          getFilteredEvents('all', days, userClientId, startTs, endTs, selectedSource)
        ]);

        if (isMounted) {
          if (summaryData) setSummary(summaryData);
          if (eventsData) {
            setNormalizedEvents(eventsData.map(e => normalizeEvent(e, clientProfiles)));
          }
        }
      } catch (err) {
        console.error('Erro ao carregar analytics no dashboard:', err);
      }
    };

    if (userClientId) {
      loadAnalytics();

      // Fetch Leads & NPS from Supabase
      leadsApi.listByClient(userClientId).then(data => isMounted && setLeads(data));
      npsApi.listByClient(userClientId).then(data => isMounted && setNps(data));
    }

    return () => { isMounted = false; };
  }, [days, userClientId, startTs, endTs, clientProfiles, selectedSource]);

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
        const rIdx = rows.findIndex(r => r.id === (e.type === 'view' ? 'view' : (e as any).assetType));
        if (rIdx !== -1) matrix[rIdx][h]++;
      } catch (err) { }
    });
    return { matrix, max: Math.max(...matrix.flatMap(h => h), 1), rows };
  }, [normalizedEvents]);

  const hasCrmAccess = canAccessFeature(userPlan, 'crm');
  const hasNpsAccess = canAccessFeature(userPlan, 'nps');
  const hasSchedulingAccess = canAccessFeature(userPlan, 'scheduling');

  // Leads & NPS Logic
  const ms = days * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const leadsRecent = useMemo(() => {
    const dbLeads = (leads || []).filter(l => now - new Date(l.createdAt).getTime() <= ms);
    const eventLeads = normalizedEvents.filter(e => e.type === 'lead_sent' || e.type === 'lead_capture');

    // Unificar por contato se possível, ou apenas somar
    return [...dbLeads, ...eventLeads].sort((a, b) => {
      const dateA = new Date((a as any).createdAt || (a as any).ts).getTime();
      const dateB = new Date((b as any).createdAt || (b as any).ts).getTime();
      return dateB - dateA;
    });
  }, [leads, normalizedEvents, ms, now]);

  const npsRecent = useMemo(() => {
    const dbNps = (nps || []).filter(n => now - new Date(n.createdAt).getTime() <= ms);
    const eventNps = normalizedEvents.filter(e => e.assetType === 'nps');

    return [...dbNps, ...eventNps].sort((a, b) => {
      const dateA = new Date((a as any).createdAt || (a as any).ts).getTime();
      const dateB = new Date((b as any).createdAt || (b as any).ts).getTime();
      return dateB - dateA;
    });
  }, [nps, normalizedEvents, ms, now]);

  const npsScore = useMemo(() => {
    if (npsRecent.length === 0) return 0;
    const promoters = npsRecent.filter(n => (n.score || 0) >= 9).length;
    const detractors = npsRecent.filter(n => (n.score || 0) <= 6).length;
    return Math.round(((promoters - detractors) / npsRecent.length) * 100);
  }, [npsRecent]);

  const planConfig = PLANS_CONFIG[client?.plan || 'starter'];
  const usagePercentage = Math.min((clientProfiles.length / (planConfig.maxProfiles || 1)) * 100, 100);

  const kpis = useMemo(() => [
    { label: 'Alcance', value: summary?.totalViews || 0, icon: Globe, color: 'blue' },
    { label: 'Engajamento', value: summary?.totalClicks || 0, icon: MousePointer2, color: 'emerald' },
    { label: 'Taxa CTR', value: `${(summary?.ctr || 0).toFixed(1)}% `, icon: BarChart3, color: 'amber' },
    { label: 'PIX Sync', value: summary?.contentPerformance?.pixCopies || 0, icon: Zap, color: 'yellow' },
    { label: 'Catálogo', value: (summary?.contentPerformance?.byCategory || []).find(c => c.category === 'catalog')?.count || 0, icon: ShoppingBag, color: 'orange' },
    { label: 'Vídeos', value: (summary?.contentPerformance?.byCategory || []).find(c => c.category === 'video')?.count || 0, icon: Film, color: 'rose' },
    { label: 'Leads (CRM)', value: hasCrmAccess ? (summary?.leadsCount || 0) : <Lock size={14} />, icon: MessageSquare, locked: !hasCrmAccess, color: 'purple' },
    { label: 'NPS Global', value: hasNpsAccess ? npsScore : <Lock size={14} />, icon: Smile, locked: !hasNpsAccess, color: 'rose' }
  ], [summary, npsScore, hasCrmAccess, hasNpsAccess]);

  // Se estiver carregando, mostrar loading state simples (MOVIDO PARA CÁ)
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Sincronizando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden pb-32">
      <TopBar title="Centro de Comando" />

      <main className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-32 relative z-10">

        {/* HEADER */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-4 py-1.5 rounded-full glass-neon-blue text-[10px] font-black uppercase tracking-[0.25em] text-neon-blue">
                {PLANS[client?.plan || 'starter'].name} Protocol
              </span>
              {usagePercentage >= 80 && (
                <span className="px-4 py-1.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-[0.25em] animate-pulse">
                  Capacidade Crítica
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none italic">
              Hello, <span className="text-neon-blue drop-shadow-[0_0_15px_rgba(0,242,255,0.4)]">{client?.email?.split('@')[0] || 'User'}</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Date Controls */}
            <div className="flex bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-1.5 shadow-2xl items-center gap-2">
              {[7, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={clsx(
                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden",
                    days === d ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                  )}
                >
                  {d}D
                </button>
              ))}
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent text-white text-[10px] outline-none w-24 px-2" />
            </div>


            <button onClick={() => navigate('/app/profiles')} className="bg-white text-black px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-zinc-200 transition-all active:scale-95">
              <Plus size={18} strokeWidth={3} />
              Deploy Novo
            </button>
          </div>
        </header>

        {/* TABS Navigation */}
        <div className="mb-12 flex gap-10 border-b border-white/5">
          {[
            { id: 'overview', label: 'Network Intelligence', icon: Activity },
            { id: 'agenda', label: 'Agenda & Slots', icon: Calendar, locked: !hasSchedulingAccess }
          ].map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => !tab.locked && setActiveTab(tab.id)}
              disabled={tab.locked}
              className={clsx(
                "pb-5 text-[10px] font-black uppercase tracking-[0.3em] border-b-2 transition-all flex items-center gap-3",
                activeTab === tab.id ? "border-neon-blue text-white" : "border-transparent text-zinc-600 hover:text-zinc-400",
                tab.locked && "opacity-50 cursor-not-allowed"
              )}
            >
              <tab.icon size={16} className={clsx(activeTab === tab.id ? "text-neon-blue" : "text-zinc-700")} />
              {tab.label}
              {tab.locked && <Lock size={12} />}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        {activeTab === 'agenda' && hasSchedulingAccess ? (
          <AgendaTab client={client} profiles={clientProfiles} onUpdate={() => refreshData(true)} />
        ) : (
          <div className="space-y-8 animate-in fade-in duration-1000">
            {/* Overview Content */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-4">
              {kpis.map((kpi, i) => (
                <div key={i} className={clsx("p-5 rounded-[1.5rem] border border-white/5 glass-neon-blue transition-all hover:scale-[1.02]", kpi.locked && "opacity-50")}>
                  <div className="flex justify-between items-center mb-4">
                    <div className="p-2.5 rounded-xl bg-white/5">
                      <kpi.icon size={18} className={clsx(
                        kpi.color === 'blue' && "text-neon-blue",
                        kpi.color === 'emerald' && "text-emerald-400",
                        kpi.color === 'amber' && "text-amber-400",
                        kpi.color === 'yellow' && "text-yellow-400",
                        kpi.color === 'orange' && "text-orange-400",
                        kpi.color === 'rose' && "text-rose-400",
                        kpi.color === 'purple' && "text-purple-400"
                      )} />
                    </div>
                  </div>
                  <div className="text-[9px] font-black uppercase text-zinc-500 mb-0.5 tracking-tight">{kpi.label}</div>
                  <div className="text-xl font-black text-white">{kpi.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-neon-blue rounded-[3rem] p-10 border border-white/5">
                <h3 className="text-xl font-black italic tracking-tight mb-8">Traffic <span className="text-neon-blue">Pulse</span></h3>

                <div className="space-y-4">
                  <div className="flex mb-4 ml-24">
                    {[0, 6, 12, 18, 23].map(h => (
                      <div key={h} className="flex-1 text-[8px] font-black text-zinc-700 uppercase italic" style={{ marginLeft: h === 0 ? 0 : 'auto' }}>
                        {h.toString().padStart(2, '0')}h
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {heatmap.rows.map((row, r) => (
                      <div key={r} className="flex items-center gap-4 group/row">
                        <div className="w-20 text-[9px] font-black text-zinc-600 uppercase italic tracking-tighter group-hover/row:text-white transition-colors">{row.label}</div>
                        <div className="flex-1 flex gap-1 h-6">
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
              </div>
              <div className="glass-neon-blue rounded-[3rem] p-10 border border-white/5">
                <header className="flex items-center justify-between mb-8">
                  <h3 className="text-sm font-black uppercase tracking-widest text-zinc-300">Module Engagement</h3>
                  <div className="p-2 bg-white/5 rounded-lg text-neon-blue"><Target size={14} /></div>
                </header>
                <div className="space-y-5">
                  {(summary?.contentPerformance?.byCategory || []).filter(c => c.count > 0).length > 0 ? (
                    (summary?.contentPerformance?.byCategory || [])
                      .filter(c => c.count > 0)
                      .sort((a, b) => b.count - a.count)
                      .map((cat, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-zinc-500">{(() => {
                              switch (cat.category) {
                                case 'button': return 'Botões';
                                case 'portfolio': return 'Portfólio';
                                case 'catalog': return 'Catálogo';
                                case 'video': return 'Vídeos';
                                case 'pix': return 'Pix Sync';
                                case 'nps': return 'Feedback';
                                default: return cat.category;
                              }
                            })()}</span>
                            <span className="text-white italic">{cat.percentage.toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-white transition-all duration-1000"
                              style={{
                                width: `${cat.percentage}%`,
                                backgroundColor: (() => {
                                  switch (cat.category) {
                                    case 'button': return '#00f2ff';
                                    case 'video': return '#ef4444';
                                    case 'catalog': return '#f59e0b';
                                    case 'nps': return '#10b981';
                                    default: return '#ffffff';
                                  }
                                })()
                              }}
                            ></div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-10 opacity-20 italic text-[10px] font-black uppercase">No Interactions</div>
                  )}
                </div>
              </div>
            </div>

            {/* RESTORED INSIGHTS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Devices */}
              <div className="glass-neon-blue rounded-[2.5rem] p-8 border border-white/5">
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-300 mb-6 flex items-center gap-2">
                  <Smartphone size={16} className="text-zinc-500" /> Dispositivos
                </h3>
                <div className="space-y-4">
                  {summary.devices.map((d, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        <span>{d.name}</span>
                        <span>{d.percentage}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-white transition-all duration-1000" style={{ width: `${d.percentage}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Links */}
              <div className="glass-neon-blue rounded-[2.5rem] p-8 border border-white/5">
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-300 mb-6 flex items-center gap-2">
                  <LinkIcon size={16} className="text-zinc-500" /> Top Content
                </h3>
                <div className="space-y-3">
                  {summary.topLinks.length > 0 ? summary.topLinks.map((l, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-[10px] font-bold truncate max-w-[150px]">{l.label || 'Link sem nome'}</span>
                      <span className="text-[10px] text-zinc-500 font-mono bg-black/40 px-2 py-1 rounded">{l.clicks} cliq</span>
                    </div>
                  )) : (
                    <div className="text-center text-zinc-600 text-[10px]">Sem dados de cliques</div>
                  )}
                </div>
              </div>

              {/* Sources */}
              <div className="glass-neon-blue rounded-[2.5rem] p-8 border border-white/5">
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-300 mb-6 flex items-center gap-2">
                  <Target size={16} className="text-zinc-500" /> Origem Tráfego
                </h3>
                <div className="flex flex-wrap gap-2">
                  {summary.sources.map((s, i) => (
                    <div key={i} className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                      <span className="text-xs font-bold capitalize">{s.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{s.percentage.toFixed(0)}%</span>
                    </div>
                  ))}
                  {summary.sources.length === 0 && <span className="text-zinc-600 text-[10px]">Sem dados de origem</span>}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;