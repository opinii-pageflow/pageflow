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
  Eye,
  Mail,
  MessageCircle,
  Trash2,
  Gift,
  Plus,
  ArrowRight,
  CheckCircle2
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
import { upgradeRequestsApi, UpgradeRequest } from '../../lib/api/upgradeRequests';
import CompanyModal from '../../components/admin/CompanyModal';

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
  const [savedToast, setSavedToast] = useState('');

  // ===== Curadoria de Perfis =====
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // ===== Upgrade Requests =====
  const [upgradeRequests, setUpgradeRequests] = useState<UpgradeRequest[]>([]);
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadAdminData(retryCount = 0) {
      if (!mounted) return;

      try {
        if (retryCount === 0) setLoading(true);

        // Fetchs em paralelo com tratamento individual
        const [allClients, allProfiles, allRequests] = await Promise.all([
          clientsApi.listAll().catch(err => {
            console.warn("Clients fetch warning:", err);
            return [];
          }),
          profilesApi.listAll().catch(err => {
            console.warn("Profiles fetch warning:", err);
            return [];
          }),
          upgradeRequestsApi.listAll().catch(err => {
            console.warn("Upgrade requests fetch warning:", err);
            return [];
          })
        ]);

        if (!mounted) return;

        setClients(allClients || []);
        setUpgradeRequests((allRequests || []) as UpgradeRequest[]);

        if (mounted) setAllProfiles((allProfiles || []).map((p: Profile) => ({
          ...p,
          featured: p.featured || false,
          showOnLanding: p.showOnLanding || false,
          displayName: p.displayName || '',
          avatarUrl: p.avatarUrl || '',
          slug: p.slug || ''
        })));

        // Analytics com tratamento de erro
        try {
          const { count: eCount } = await supabase.from('analytics_events')
            .select('*', { count: 'exact', head: true });
          if (mounted) setTotalEvents(eCount || 0);
        } catch (e) {
          console.warn("Analytics events error", e);
        }

        try {
          const { count: lCount } = await supabase.from('leads')
            .select('*', { count: 'exact', head: true });
          if (mounted) setTotalLeads(lCount || 0);
        } catch (e) {
          console.warn("Leads fetch error", e);
        }

      } catch (err: unknown) {
        const error = err as Error & { name?: string; message?: string };
        console.error("Failed to load admin data", err);
        // Se for erro de rede/abort e tivermos poucas tentativas, tenta de novo
        if (mounted && retryCount < 2 && (error.name === 'AbortError' || error.message?.includes('fetch'))) {
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
    { icon: Layout, label: 'Perfis', value: totalProfiles, subValue: `em ${clients.length} contas`, accent: 'sky' },
    { icon: Activity, label: 'Eventos', value: totalEvents, subValue: 'analytics total', accent: 'emerald' },
    { icon: ShieldCheck, label: 'Sistema', value: '99.9%', subValue: 'uptime', accent: 'emerald' },
  ];

  const recentClients = clients.slice(0, 5);
  const topProfiles = useMemo(() => {
    // Agrupar perfis por volume de eventos (placeholder para lógica real se necessário)
    // Por enquanto, mostraremos os perfis com featured: true primeiro
    return [...allProfiles].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    }).slice(0, 10);
  }, [allProfiles]);

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

  const handleUpdateStatus = async (id: string, status: UpgradeRequest['status']) => {
    setUpdatingRequestId(id);
    try {
      await upgradeRequestsApi.updateStatus(id, status);
      setUpgradeRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      setSavedToast(`Status atualizado para ${status}`);
      setTimeout(() => setSavedToast(''), 2000);
    } catch (err) {
      console.error('Error updating request status:', err);
      alert('Erro ao atualizar status.');
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const handleApplyUpgrade = async (request: UpgradeRequest) => {
    if (request.requestSource === 'new_client' || request.clientId === 'landing_page_lead') {
      alert('Este é um novo lead. Por favor, crie a Company primeiro.');
      return;
    }

    if (!window.confirm(`Deseja ativar o plano ${PLANS[request.requestedPlan as keyof typeof PLANS]?.name || request.requestedPlan} para ${request.name}?`)) {
      return;
    }

    setUpdatingRequestId(request.id);
    try {
      const planInfo = PLANS[request.requestedPlan as keyof typeof PLANS];
      if (!planInfo) throw new Error("Configuração de plano não encontrada.");

      // 1. Atualizar o cliente
      await clientsApi.update(request.clientId, {
        plan: request.requestedPlan as PlanType,
        maxProfiles: planInfo.maxProfiles
      });

      // 2. Fechar a solicitação
      await upgradeRequestsApi.updateStatus(request.id, 'closed');

      // 3. Atualizar estados locais
      setUpgradeRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'closed' } : r));
      setClients(prev => prev.map(c => c.id === request.clientId ? { ...c, plan: request.requestedPlan as PlanType, maxProfiles: planInfo.maxProfiles } : c));

      setSavedToast(`Upgrade aplicado com sucesso!`);
      setTimeout(() => setSavedToast(''), 3000);
    } catch (err: any) {
      console.error('Error applying upgrade:', err);
      alert('Erro ao aplicar upgrade: ' + err.message);
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const handleCreateCompany = async (formData: any) => {
    try {
      const finalSlug = formData.slug || formData.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-');

      await clientsApi.create({
        ...formData,
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
radial - gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(14, 165, 233, 0.06), transparent 40 %),
  radial - gradient(circle at 20 % 80 %, rgba(16, 185, 129, 0.03), transparent 50 %),
  radial - gradient(circle at 80 % 20 %, rgba(56, 189, 248, 0.04), transparent 50 %)
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
              onClick={() => setIsCreateCompanyOpen(true)}
              className="flex-1 sm:flex-none px-5 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:shadow-lg hover:shadow-blue-600/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2.5 group active:scale-95"
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
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-emerald-600/20 border border-blue-500/20 flex items-center justify-center font-black text-sm text-blue-400 flex-shrink-0">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <Link
                          to="/admin/clients"
                          className="font-bold text-white text-sm truncate hover:text-blue-400 transition-colors"
                        >
                          {client.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={clsx(
                            "text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border",
                            client.plan === 'enterprise' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                            client.plan === 'business' && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                            client.plan === 'pro' && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                            client.plan === 'starter' && "bg-zinc-800/50 text-zinc-500 border-zinc-700/50",
                          )}>
                            {PLANS[client.plan]?.name || client.plan}
                          </span>
                          <span className="text-[10px] text-zinc-700">•</span>
                          <span className="text-[10px] text-zinc-600 tabular-nums">
                            {allProfiles.filter(p => p.clientId === client.id).length} perfis ativos
                          </span>
                        </div>
                        {/* Perfis Rápidos */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {allProfiles
                            .filter(p => p.clientId === client.id)
                            .slice(0, 3)
                            .map(p => (
                              <a
                                key={p.id}
                                href={`#/u/${p.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[9px] px-1.5 py-0.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-zinc-500 hover:text-white transition-all underline decoration-white/0 hover:decoration-white/20"
                              >
                                /{p.slug}
                              </a>
                            ))}
                          {allProfiles.filter(p => p.clientId === client.id).length > 3 && (
                            <span className="text-[9px] text-zinc-700 italic flex items-center">
                              + {allProfiles.filter(p => p.clientId === client.id).length - 3} mais
                            </span>
                          )}
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
                  <div className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">+2.1%</div>
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
                {topProfiles.map((profile: Profile) => (
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
                        <a
                          href={`#/u/${profile.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-zinc-600 truncate hover:text-white transition-colors"
                        >
                          /{profile.slug}
                        </a>
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

            {/* Solicitações de Upgrade */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-blue-500/5">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Upgrade Center</span>
                  <h3 className="text-lg font-black tracking-tight mt-0.5">Interesses de Upgrade</h3>
                </div>
                <div className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-3 py-1 rounded-full border border-blue-500/20">
                  {upgradeRequests.filter(r => r.status === 'pending').length} Pendentes
                </div>
              </div>

              <div className="divide-y divide-white/[0.03]">
                {upgradeRequests.length === 0 && (
                  <div className="px-6 py-12 text-center text-zinc-600 text-xs italic">
                    Nenhuma solicitação de upgrade registrada.
                  </div>
                )}
                {upgradeRequests.map((request) => (
                  <div key={request.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={clsx(
                        "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs flex-shrink-0 border",
                        request.status === 'pending' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      )}>
                        {PLANS[request.requestedPlan as keyof typeof PLANS]?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          {request.name}
                          <span className={clsx(
                            "text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-widest border",
                            request.requestSource === 'new_client'
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          )}>
                            {request.requestSource === 'new_client' ? 'Novo Lead' : 'Cliente Atual'}
                          </span>
                          <span className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded uppercase font-black tracking-widest text-zinc-500">
                            → {PLANS[request.requestedPlan as keyof typeof PLANS]?.name || request.requestedPlan}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                          <span className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                            <Mail size={10} /> {request.email}
                          </span>
                          <span className="text-[11px] text-emerald-500 flex items-center gap-1.5 font-bold">
                            <MessageCircle size={10} /> {request.whatsapp}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-zinc-700 tabular-nums">
                        {new Date(request.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>

                      {request.status !== 'closed' && request.requestSource === 'existing_client' && (
                        <button
                          onClick={() => handleApplyUpgrade(request)}
                          disabled={updatingRequestId === request.id}
                          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                          title="Ativar Upgrade Imediatamente"
                        >
                          <Zap size={10} />
                          Ativar
                        </button>
                      )}

                      <select
                        value={request.status}
                        disabled={updatingRequestId === request.id}
                        onChange={(e) => handleUpdateStatus(request.id, e.target.value as any)}
                        className={clsx(
                          "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border outline-none cursor-pointer transition-all",
                          request.status === 'pending' && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                          request.status === 'contacted' && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                          request.status === 'closed' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                        )}
                      >
                        <option value="pending">Pendente</option>
                        <option value="contacted">Contatado</option>
                        <option value="closed">Finalizado</option>
                      </select>

                      <a
                        href={`https://wa.me/${request.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 rounded-lg transition-all"
                        title="Chamar no WhatsApp"
                      >
                        <MessageCircle size={14} />
                      </a>
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
                      <div className="h-full w-[65%] bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" />
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
            </div >

            {/* Health System */}
            <div className="bg-gradient-to-br from-blue-600 to-emerald-700 rounded-2xl p-6 shadow-lg shadow-blue-600/10 relative overflow-hidden group">
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
            </div >

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
            </div >
          </div >
        </div >


      </main >

      <CompanyModal
        isOpen={isCreateCompanyOpen}
        onClose={() => setIsCreateCompanyOpen(false)}
        onSubmit={handleCreateCompany}
      />
    </div >
  );
};

export default AdminDashboard;