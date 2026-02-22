import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Layout,
  Activity,
  ShieldCheck,
  TrendingUp,
  Server,
  Globe,
  Zap,
  ArrowUpRight,
  ChevronRight,
  Database,
  Cpu,
  Settings,
  UserPlus,
  X,
  ChevronDown,
  Star,
  Eye
} from 'lucide-react';
import TopBar from '../../components/common/TopBar';
import { PLANS, PLAN_TYPES } from '../../lib/plans';
import { PLANS_CONFIG } from '../../lib/plansConfig';
import { Profile, Client, PlanType } from '../../types';
import { themePresets } from '../../lib/themePresets';
import clsx from 'clsx';
import { Link, useNavigate } from 'react-router-dom';

import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { clientsApi } from '../../lib/api/clients';
import { profilesApi } from '../../lib/api/profiles';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);

  // Estados para dados reais do banco
  const [clients, setClients] = useState<Client[]>([]);
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);

  // ===== Criar Company (modal) =====
  const [isCreateCompanyOpen, setIsCreateCompanyOpen] = useState(false);
  const [companyFormData, setCompanyFormData] = useState({
    name: '', slug: '', email: '', password: '', plan: 'pro' as PlanType, maxProfiles: PLANS_CONFIG.pro.maxProfiles, isActive: true
  });

  const [savedToast, setSavedToast] = useState('');

  // ===== Curadoria de Perfis =====
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadAdminData(retryCount = 0) {
      if (!mounted) return;

      try {
        if (retryCount === 0) setLoading(true);

        // Fetchs em paralelo com tratamento individual
        const [allClients, allProfiles] = await Promise.all([
          clientsApi.listAll().catch(err => {
            console.warn("Clients fetch warning:", err);
            return [];
          }),
          profilesApi.listAll().catch(err => {
            console.warn("Profiles fetch warning:", err);
            return [];
          })
        ]);

        if (!mounted) return;

        setClients(allClients || []);
        setTotalProfiles(allProfiles?.length || 0);
        if (mounted) setAllProfiles((allProfiles || []).map((p: any) => ({
          ...p,
          featured: p.featured || false,
          showOnLanding: p.show_on_landing || false,
          displayName: p.display_name || p.displayName || '',
          avatarUrl: p.avatar_url || p.avatarUrl || '',
          slug: p.slug || ''
        })));

        // Analytics com tratamento de erro
        try {
          const { count: eCount } = await (supabase.from('analytics_events') as any)
            .select('*', { count: 'exact', head: true });
          if (mounted) setTotalEvents(eCount || 0);
        } catch (e) {
          console.warn("Analytics events error", e);
        }

        try {
          const { count: lCount } = await (supabase.from('leads') as any)
            .select('*', { count: 'exact', head: true });
          if (mounted) setTotalLeads(lCount || 0);
        } catch (e) {
          console.warn("Leads fetch error", e);
        }

      } catch (err: any) {
        console.error("Failed to load admin data", err);
        // Se for erro de rede/abort e tivermos poucas tentativas, tenta de novo
        if (mounted && retryCount < 2 && (err.name === 'AbortError' || err.message?.includes('fetch'))) {
          console.log("Retrying admin load...");
          setTimeout(() => loadAdminData(retryCount + 1), 1000);
          return;
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    // Timeout de segurança para evitar spinner infinito
    const timeout = setTimeout(() => {
      if (mounted && loading) setLoading(false);
    }, 8000);

    loadAdminData();

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, []);

  const activeClients = clients.filter(c => c.isActive).length;
  const blockedClients = clients.filter(c => !c.isActive).length;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const stats = [
    { icon: Users, label: 'Companies', value: clients.length, subValue: `${activeClients} ativos`, accent: 'blue' },
    { icon: Layout, label: 'Perfis', value: totalProfiles, subValue: `em ${clients.length} contas`, accent: 'indigo' },
    { icon: Activity, label: 'Eventos', value: totalEvents, subValue: 'analytics total', accent: 'emerald' },
    { icon: ShieldCheck, label: 'Sistema', value: '99.9%', subValue: 'uptime', accent: 'purple' },
  ];

  const recentClients = clients.slice(0, 5);
  const profileCounts: Record<string, number> = {}; // Placeholder por enquanto

  const handleToggleProfile = async (profileId: string, field: 'featured' | 'showOnLanding', value: boolean) => {
    setTogglingId(profileId);
    try {
      await profilesApi.update(profileId, { [field]: value });
      setAllProfiles(prev => prev.map(p => p.id === profileId ? { ...p, [field]: value } : p));
      setSavedToast(`${field === 'featured' ? 'Destaque' : 'Landing'} ${value ? 'ativado' : 'desativado'}`);
      setTimeout(() => setSavedToast(''), 2000);
    } catch (err) {
      console.error('Error toggling profile:', err);
      alert('Erro ao atualizar perfil.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalSlug = companyFormData.slug || companyFormData.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-');

      await clientsApi.create({
        ...companyFormData,
        slug: finalSlug,
        userType: 'client'
      });

      setIsCreateCompanyOpen(false);
      window.location.reload();
    } catch (err: any) {
      alert("Erro ao criar company: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(37, 99, 235, 0.06), transparent 40%),
              radial-gradient(circle at 20% 80%, rgba(168, 85, 247, 0.03), transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.04), transparent 50%)
            `
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <TopBar title="Admin Dashboard" subtitle="Supervise o ecossistema PageFlow" />

      <main className="relative z-10 px-4 sm:px-6 lg:px-8 pb-16 max-w-[1400px] mx-auto">
        {/* ─── Header ─── */}
        <div className="pt-8 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
          <div>
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 backdrop-blur-xl mb-3">
              <Zap size={12} className="text-blue-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-blue-400">Master Control Panel</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Visão Geral</h1>
            <p className="text-zinc-500 mt-1.5 text-sm font-medium">Controle total com analytics em tempo real.</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              to="/admin/clients"
              className="flex-1 sm:flex-none px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2.5 group"
            >
              <Users size={14} className="text-zinc-500 group-hover:text-white transition-colors" />
              Companies
              <ArrowUpRight size={12} className="text-zinc-600 group-hover:text-white transition-all" />
            </Link>
            <button
              onClick={() => {
                setCompanyFormData({ name: '', slug: '', email: '', password: '', plan: 'pro', maxProfiles: 3, isActive: true });
                setIsCreateCompanyOpen(true);
              }}
              className="flex-1 sm:flex-none px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-600/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2.5 group active:scale-95"
            >
              <UserPlus size={14} />
              Criar nova Company
              <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* ─── Stats Row ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-5 group hover:bg-zinc-900/70 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/5 p-2.5 rounded-xl group-hover:bg-white/10 transition-all">
                  <stat.icon size={18} className="text-blue-400" />
                </div>
                <TrendingUp size={12} className="text-zinc-800 group-hover:text-blue-400 transition-all" />
              </div>
              <div className="text-2xl md:text-3xl font-black tracking-tight leading-none mb-1">{stat.value}</div>
              <div className="text-zinc-500 text-[11px] font-medium">{stat.subValue}</div>
              <div className="mt-3 pt-3 border-t border-white/5">
                <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Layout principal: 2 colunas ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* ─── Coluna esquerda ─── */}
          <div className="lg:col-span-8 space-y-4">

            {/* Clientes Recentes */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Companies</span>
                  <h3 className="text-lg font-black tracking-tight mt-0.5">Companies Recentes</h3>
                </div>
                <Link to="/admin/clients" className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white flex items-center gap-1.5 transition-all">
                  Ver todos <ChevronRight size={12} />
                </Link>
              </div>

              <div className="divide-y divide-white/[0.03]">
                {recentClients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between gap-3 px-6 py-3.5 hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 flex items-center justify-center font-black text-sm text-blue-400 flex-shrink-0">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-white text-sm truncate">{client.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={clsx(
                            "text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border",
                            client.plan === 'enterprise' && "bg-purple-500/10 text-purple-400 border-purple-500/20",
                            client.plan === 'business' && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                            client.plan === 'pro' && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                            client.plan === 'starter' && "bg-zinc-800/50 text-zinc-500 border-zinc-700/50",
                          )}>
                            {PLANS[client.plan]?.name || client.plan}
                          </span>
                          <span className="text-[10px] text-zinc-700">•</span>
                          <span className="text-[10px] text-zinc-600 tabular-nums">perfis ativos</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="hidden sm:block text-[10px] text-zinc-700 tabular-nums">
                        {new Date(client.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                      <span className={clsx(
                        "inline-flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider border",
                        client.isActive
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                      )}>
                        <span className={clsx("w-1.5 h-1.5 rounded-full", client.isActive ? "bg-emerald-500" : "bg-red-500")} />
                        {client.isActive ? 'Ativo' : 'Off'}
                      </span>
                      <Link to="/admin/clients" className="p-2 bg-white/5 hover:bg-white text-zinc-500 hover:text-black rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <Settings size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumo Mensal */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Performance</span>
                  <h3 className="text-lg font-black tracking-tight mt-0.5">Resumo Mensal</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Crescendo</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
                <div className="p-6">
                  <div className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-2">Total Revenue</div>
                  <div className="text-2xl font-black tracking-tight mb-1">R$ 48.2k</div>
                  <div className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">+18.2%</div>
                </div>
                <div className="p-6">
                  <div className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-2">Active Users</div>
                  <div className="text-2xl font-black tracking-tight mb-1">1,284</div>
                  <div className="text-[10px] text-blue-500 font-black uppercase tracking-widest">+5.8%</div>
                </div>
                <div className="p-6">
                  <div className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-2">Conversion Rate</div>
                  <div className="text-2xl font-black tracking-tight mb-1">24.8%</div>
                  <div className="text-[10px] text-purple-500 font-black uppercase tracking-widest">+2.1%</div>
                </div>
              </div>
            </div>

            {/* Curadoria de Perfis */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Curadoria</span>
                  <h3 className="text-lg font-black tracking-tight mt-0.5">Perfis em Destaque</h3>
                </div>
                <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-zinc-600">
                  <span className="flex items-center gap-1.5"><Star size={12} className="text-amber-400" /> Destaque</span>
                  <span className="flex items-center gap-1.5"><Eye size={12} className="text-blue-400" /> Landing</span>
                </div>
              </div>

              <div className="divide-y divide-white/[0.03]">
                {allProfiles.length === 0 && (
                  <div className="px-6 py-8 text-center text-zinc-600 text-xs">Nenhum perfil encontrado.</div>
                )}
                {allProfiles.map((profile: any) => (
                  <div key={profile.id} className="flex items-center justify-between gap-3 px-6 py-3.5 hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center font-black text-sm text-zinc-400 flex-shrink-0 overflow-hidden">
                        {profile.avatarUrl ? (
                          <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          profile.displayName?.charAt(0)?.toUpperCase() || '?'
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-white text-sm truncate">{profile.displayName || 'Sem nome'}</div>
                        <div className="text-[10px] text-zinc-600 truncate">/{profile.slug}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      {/* Featured Toggle */}
                      <button
                        onClick={() => handleToggleProfile(profile.id, 'featured', !profile.featured)}
                        disabled={togglingId === profile.id}
                        className={clsx(
                          "w-10 h-5 rounded-full relative p-0.5 transition-all duration-300 border",
                          profile.featured
                            ? "bg-amber-500/20 border-amber-500/30"
                            : "bg-zinc-800 border-white/5 hover:border-white/10"
                        )}
                      >
                        <div className={clsx(
                          "w-4 h-4 rounded-full transition-all duration-300 shadow-sm",
                          profile.featured
                            ? "translate-x-5 bg-amber-400 shadow-amber-400/30"
                            : "translate-x-0 bg-zinc-600"
                        )} />
                      </button>

                      {/* Landing Toggle */}
                      <button
                        onClick={() => handleToggleProfile(profile.id, 'showOnLanding', !profile.showOnLanding)}
                        disabled={togglingId === profile.id}
                        className={clsx(
                          "w-10 h-5 rounded-full relative p-0.5 transition-all duration-300 border",
                          profile.showOnLanding
                            ? "bg-blue-500/20 border-blue-500/30"
                            : "bg-zinc-800 border-white/5 hover:border-white/10"
                        )}
                      >
                        <div className={clsx(
                          "w-4 h-4 rounded-full transition-all duration-300 shadow-sm",
                          profile.showOnLanding
                            ? "translate-x-5 bg-blue-400 shadow-blue-400/30"
                            : "translate-x-0 bg-zinc-600"
                        )} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Coluna direita (sidebar) ─── */}
          <div className="lg:col-span-4 space-y-4">

            {/* Atividade Global */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <Globe size={200} />
              </div>
              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black tracking-tight">Atividade Global</h3>
                  <div className="text-[9px] font-black px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full uppercase tracking-widest">
                    LIVE
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                      <span className="font-medium">Taxa de Conversão</span>
                      <span className="font-black text-white">24.8%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full w-[65%] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                      <span className="font-medium">Engajamento</span>
                      <span className="font-black text-white">82.3%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full w-[82%] bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-600 font-medium">Última sync: agora mesmo</span>
                  <button className="text-[9px] font-black uppercase tracking-widest text-blue-400 hover:text-white transition-all flex items-center gap-1">
                    Detalhes <ChevronRight size={10} />
                  </button>
                </div>
              </div>
            </div>

            {/* Health System */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-lg shadow-blue-600/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-1000 pointer-events-none">
                <Server size={100} />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md pointer-events-none">
                    <Database size={20} />
                  </div>
                  <div>
                    <h4 className="text-base font-black tracking-tight text-white leading-none">Health System</h4>
                    <p className="text-blue-100/50 text-[11px] font-medium mt-0.5">Serviços operando nominalmente.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase text-blue-200">
                    <span>Database Load</span>
                    <span>4.2%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full w-[4%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recursos do Host */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center text-orange-500 pointer-events-none">
                  <Cpu size={18} />
                </div>
                <h4 className="text-base font-black tracking-tight">Recursos do Host</h4>
              </div>

              <div className="space-y-0 divide-y divide-white/5">
                <div className="flex items-center justify-between py-3">
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Master Version</span>
                  <span className="text-xs font-mono text-zinc-300">v1.1.0-stable</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Environment</span>
                  <span className="text-xs font-black text-blue-500">PRODUCTION</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Companies</span>
                  <span className="text-xs font-black text-white">{activeClients} <span className="text-zinc-600">ativos</span> / {blockedClients} <span className="text-zinc-600">bloqueados</span></span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Leads</span>
                  <span className="text-xs font-black text-white">{totalLeads}</span>
                </div>
              </div>

              <button
                onClick={() => { if (window.confirm('Resetar sistema para estado inicial?')) { localStorage.clear(); window.location.reload(); } }}
                className="mt-5 w-full py-3.5 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all text-[10px] font-black uppercase tracking-widest active:scale-95"
              >
                Master Reset
              </button>
            </div>
          </div>
        </div>


      </main>

      {/* ─── Modal: Criar Nova Company ─── */}
      {isCreateCompanyOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setIsCreateCompanyOpen(false)}
              className="absolute top-8 right-8 p-2 text-zinc-500 hover:text-white transition-all bg-white/5 rounded-full"
            >
              <X size={20} />
            </button>

            <form onSubmit={handleCreateCompany} className="p-12 space-y-8">
              <div className="space-y-3">
                <div className="inline-flex bg-blue-500/10 text-blue-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-500/20">
                  Client Provisioning
                </div>
                <h2 className="text-3xl font-black tracking-tighter">Nova Company</h2>
                <p className="text-zinc-500 text-sm">Defina credenciais de rede e limites operacionais.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Nome da Organização</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Agência Premium"
                    value={companyFormData.name}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, name: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">E-mail de Login</label>
                    <input
                      type="email"
                      required
                      placeholder="email@empresa.com"
                      value={companyFormData.email}
                      onChange={(e) => setCompanyFormData({ ...companyFormData, email: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Senha (Access Token)</label>
                    <input
                      type="text"
                      required
                      placeholder="Crie uma senha forte"
                      value={companyFormData.password}
                      onChange={(e) => setCompanyFormData({ ...companyFormData, password: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm font-mono focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Nível de Serviço</label>
                    <div className="relative">
                      <select
                        value={companyFormData.plan}
                        onChange={(e) => {
                          const newPlanId = e.target.value as PlanType;
                          const newPlan = PLANS[newPlanId];
                          setCompanyFormData({ ...companyFormData, plan: newPlanId, maxProfiles: newPlan.maxProfiles });
                        }}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold outline-none appearance-none cursor-pointer"
                      >
                        {PLAN_TYPES.map(planId => (
                          <option key={planId} value={planId}>{PLANS[planId].name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500" size={16} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Limite de Perfis (Slots)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={companyFormData.maxProfiles}
                      onChange={(e) => setCompanyFormData({ ...companyFormData, maxProfiles: parseInt(e.target.value) })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-white text-black py-5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95 shadow-xl"
              >
                Finalizar Provisionamento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;