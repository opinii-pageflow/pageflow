import React, { useEffect, useMemo, useState } from 'react';
import { getStorage, updateStorage } from '../../lib/storage';
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
  Settings
} from 'lucide-react';
import TopBar from '../../components/common/TopBar';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const data = getStorage();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // ===== Landing Showcase (2 perfis) =====
  const [showcaseIds, setShowcaseIds] = useState<string[]>(data.landing?.showcaseProfileIds?.slice(0, 2) || ['', '']);
  const [savedToast, setSavedToast] = useState('');

  useEffect(() => {
    // Mantém estado sincronizado se storage mudar (ex: Master Reset)
    setShowcaseIds((getStorage().landing?.showcaseProfileIds?.slice(0, 2) || ['', '']).concat(['', '']).slice(0, 2));
  }, []);

  const activeClients = data.clients.filter(c => c.isActive).length;
  const totalProfiles = data.profiles.length;
  const totalEvents = data.events.length;

  const profileOptions = useMemo(() => {
    return (data.profiles || []).map(p => {
      const client = data.clients.find(c => c.id === p.clientId);
      const label = `${p.displayName || p.slug} (${p.slug})`;
      const sub = client ? `${client.name} • ${client.plan}` : '—';
      return { id: p.id, label, sub };
    });
  }, [data.clients, data.profiles]);

  const saveShowcase = () => {
    const sanitized = showcaseIds.concat(['', '']).slice(0, 2);
    updateStorage(prev => ({
      ...prev,
      landing: {
        showcaseProfileIds: sanitized
      }
    }));
    setSavedToast('Vitrine atualizada!');
    window.setTimeout(() => setSavedToast(''), 1800);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const stats = [
    { icon: Users, label: 'Clients', value: data.clients.length, subValue: `${activeClients} active`, trend: '+12%', trendUp: true },
    { icon: Layout, label: 'Profiles', value: totalProfiles, subValue: 'Total profiles', trend: '+5%', trendUp: true },
    { icon: Activity, label: 'Events', value: totalEvents, subValue: 'Analytics', trend: '+18%', trendUp: true },
    { icon: ShieldCheck, label: 'System', value: '99.9%', subValue: 'Uptime', trend: 'Stable', trendUp: true },
  ];

  const recentClients = data.clients
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#020202] text-white relative overflow-hidden">
      {/* Advanced Premium Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: `
              radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(37, 99, 235, 0.08), transparent 50%),
              radial-gradient(circle at 20% 80%, rgba(168, 85, 247, 0.04), transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.06), transparent 50%)
            `
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <TopBar title="Admin Dashboard" subtitle="Supervise o ecossistema LinkFlow" />

      <main className="relative z-10 px-6 pb-20 max-w-7xl mx-auto">
        <div className="pt-10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 backdrop-blur-xl mb-4">
              <Zap size={14} className="text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400">Master Control Panel</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">Visão Geral</h1>
            <p className="text-zinc-500 mt-2 font-medium">Controle total com analytics em tempo real.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/admin/clients"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 group"
            >
              Gerenciar Clientes
              <ArrowUpRight size={14} className="text-zinc-500 group-hover:text-white transition-all" />
            </Link>
            <Link 
              to="/admin/profiles"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-600/20 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 group"
            >
              Criar Perfil
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl group hover:bg-zinc-900/60 transition-all duration-500"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="bg-white/5 p-4 rounded-2xl group-hover:bg-white/10 transition-all duration-500 pointer-events-none">
                  <stat.icon size={24} className="text-blue-400" />
                </div>
                <div className={clsx(
                  "text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest",
                  stat.trendUp ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                )}>
                  {stat.trend}
                </div>
              </div>
              <div>
                <div className="text-3xl font-black tracking-tight mb-1">{stat.value}</div>
                <div className="text-zinc-500 text-sm font-medium">{stat.subValue}</div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{stat.label}</span>
                <TrendingUp size={14} className="text-zinc-700 group-hover:text-blue-400 transition-all" />
              </div>
            </div>
          ))}
        </div>

        {/* Landing Showcase Config */}
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[3.5rem] p-10 shadow-2xl mb-12">
          <div className="flex items-start justify-between gap-6 mb-8">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Landing Page</div>
              <h3 className="text-2xl font-black tracking-tight mt-2">Vitrine: 2 perfis</h3>
              <p className="text-zinc-500 text-sm font-medium mt-2 max-w-2xl">
                Selecione dois perfis para aparecerem na landing como demonstração “ao vivo”.
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={saveShowcase}
                className="px-7 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:shadow-lg hover:shadow-blue-600/20 transition-all active:scale-95"
              >
                Salvar vitrine
              </button>
              {!!savedToast && (
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                  {savedToast}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[0, 1].map((slot) => (
              <div key={slot} className="bg-black/40 border border-white/10 rounded-[2.5rem] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Slot {slot + 1}</div>
                </div>

                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2">
                  Perfil
                </label>
                <select
                  value={showcaseIds[slot] || ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    setShowcaseIds(prev => {
                      const next = [...prev];
                      next[slot] = v;
                      return next;
                    });
                  }}
                  className="w-full bg-zinc-950/70 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-600/40"
                >
                  <option value="">(vazio)</option>
                  {profileOptions.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.label} — {o.sub}
                    </option>
                  ))}
                </select>

                <div className="mt-4 text-xs text-zinc-600">
                  Dica: crie/edite perfis em <span className="text-zinc-300 font-semibold">/admin/profiles</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Bento Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Global Map Widget */}
          <div className="lg:col-span-5 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform group-hover:scale-110 transition-transform duration-1000">
              <Globe size={280} />
            </div>
            <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black tracking-tight">Atividade Global</h3>
                <div className="text-[10px] font-black px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full uppercase tracking-widest">
                  LIVE
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm text-zinc-400 mb-2">
                    <span className="font-medium">Taxa de Conversão</span>
                    <span className="font-black text-white">24.8%</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full w-[65%] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-zinc-400 mb-2">
                    <span className="font-medium">Engajamento</span>
                    <span className="font-black text-white">82.3%</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full w-[82%] bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-zinc-500 font-medium">
                    Última sincronização: agora mesmo
                  </div>
                  <button className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white transition-all flex items-center gap-2">
                    Ver detalhes <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Clients Management Card */}
          <div className="lg:col-span-7 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[3.5rem] p-10 shadow-2xl">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Clients</div>
                <h3 className="text-2xl font-black tracking-tight">Clientes Recentes</h3>
              </div>
              <Link to="/admin/clients" className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white flex items-center gap-2 transition-all">
                Ver todos <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-4">
              {recentClients.map((client) => (
                <div key={client.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-black/30 rounded-[2rem] border border-white/5 hover:border-white/10 hover:bg-black/40 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 flex items-center justify-center font-black text-lg text-blue-400">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-black text-white text-lg">{client.name}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">{client.plan}</span>
                        <div className="w-1 h-1 rounded-full bg-zinc-800"></div>
                        <span className="text-[10px] text-zinc-600">{new Date(client.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                    <div className={clsx(
                      "text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border", 
                      client.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-red-500/10 text-red-500 border-red-500/20'
                    )}>
                      {client.isActive ? 'Online' : 'Bloqueado'}
                    </div>
                    <Link to="/admin/clients" className="p-3 bg-white/5 hover:bg-white text-zinc-500 hover:text-black rounded-xl transition-all">
                      <Settings size={18} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure Health Widget */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3.5rem] p-10 shadow-2xl shadow-blue-600/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-1000 pointer-events-none">
                  <Server size={140} />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-md pointer-events-none">
                    <Database size={28} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black tracking-tight mb-2 leading-none text-white">Health System</h4>
                    <p className="text-blue-100/60 text-xs font-medium">Todos os micro-serviços operando em latência nominal.</p>
                  </div>
                  <div className="pt-4 space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase text-blue-200">
                       <span>Database Load</span>
                       <span>4.2%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-white rounded-full w-[4%]"></div>
                    </div>
                  </div>
                </div>
             </div>

             <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[3.5rem] p-10 flex flex-col justify-between shadow-2xl h-[calc(100%-250px)]">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-orange-500 pointer-events-none">
                    <Cpu size={24} />
                  </div>
                  <h4 className="text-xl font-black tracking-tight">Recursos do Host</h4>
                </div>
                
                <div className="space-y-6 mt-10">
                   <div className="flex items-center justify-between py-3 border-b border-white/5">
                      <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Master Version</span>
                      <span className="text-xs font-mono text-zinc-300">v{data.version}.0.4-stable</span>
                   </div>
                   <div className="flex items-center justify-between py-3 border-b border-white/5">
                      <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Environment</span>
                      <span className="text-xs font-black text-blue-500">PRODUCTION</span>
                   </div>
                </div>

                <button 
                  onClick={() => { if(window.confirm('Resetar sistema para estado inicial?')) { localStorage.clear(); window.location.reload(); } }}
                  className="mt-10 w-full py-5 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-[1.8rem] border border-red-500/20 transition-all text-[10px] font-black uppercase tracking-[0.2em] active:scale-95"
                >
                  Master Reset
                </button>
             </div>
          </div>

          {/* Performance Summary */}
          <div className="lg:col-span-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[3.5rem] p-10 shadow-2xl">
             <div className="flex items-center justify-between mb-10">
               <div>
                 <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Performance</div>
                 <h3 className="text-2xl font-black tracking-tight">Resumo Mensal</h3>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Growing</span>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/30 rounded-[2rem] p-8 border border-white/5">
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Total Revenue</div>
                  <div className="text-3xl font-black tracking-tight mb-2">R$ 48.2k</div>
                  <div className="text-xs text-emerald-500 font-black uppercase tracking-widest">+18.2%</div>
                </div>

                <div className="bg-black/30 rounded-[2rem] p-8 border border-white/5">
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Active Users</div>
                  <div className="text-3xl font-black tracking-tight mb-2">1,284</div>
                  <div className="text-xs text-blue-500 font-black uppercase tracking-widest">+5.8%</div>
                </div>

                <div className="bg-black/30 rounded-[2rem] p-8 border border-white/5">
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Conversion Rate</div>
                  <div className="text-3xl font-black tracking-tight mb-2">24.8%</div>
                  <div className="text-xs text-purple-500 font-black uppercase tracking-widest">+2.1%</div>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
