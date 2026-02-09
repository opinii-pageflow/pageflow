
import React, { useMemo, useState } from 'react';
import { getStorage } from '../../lib/storage';
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
  // Fix: Added missing icon import
  Settings
} from 'lucide-react';
import TopBar from '../../components/common/TopBar';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const data = getStorage();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const activeClients = data.clients.filter(c => c.isActive).length;
  const totalProfiles = data.profiles.length;
  const totalEvents = data.events.length;

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 15;
    const y = (clientY / innerHeight - 0.5) * 15;
    setMousePos({ x, y });
  };

  const stats = [
    { label: 'Market Share Clientes', value: data.clients.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: '+12%' },
    { label: 'Nós Ativos (Clients)', value: activeClients, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: 'Estável' },
    { label: 'Objetos Criados (Profiles)', value: totalProfiles, icon: Layout, color: 'text-purple-500', bg: 'bg-purple-500/10', trend: '+45% moM' },
    { label: 'Telemetria Global', value: totalEvents, icon: Activity, color: 'text-orange-500', bg: 'bg-orange-500/10', trend: 'High Traffic' },
  ];

  return (
    <div 
      className="min-h-screen bg-[#020202] text-white overflow-x-hidden"
      onMouseMove={handleMouseMove}
    >
      <TopBar title="Painel de Controle Master" />
      
      {/* Background Grid & Glows */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="max-w-7xl mx-auto p-6 lg:p-10 pt-48 pb-32 relative z-10">
        
        {/* Admin Hero */}
        <header 
          className="mb-16 space-y-4 animate-in fade-in slide-in-from-left duration-1000"
          style={{ transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`, transition: 'transform 0.2s ease-out' }}
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full backdrop-blur-md">
            <ShieldCheck size={14} className="text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Ambiente Master Root</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
            Operações <span className="text-zinc-600">Globais</span>
          </h1>
          <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-2xl">
            Monitoramento de infraestrutura SaaS, gestão de inquilinos e telemetria de performance em tempo real.
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl hover:border-white/10 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-10 transition-opacity">
                <stat.icon size={120} />
              </div>
              <div className="flex items-center justify-between mb-8">
                <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
                  <stat.icon size={22} />
                </div>
                <div className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                  {stat.trend}
                </div>
              </div>
              <div className="text-5xl font-black tracking-tighter mb-2">{stat.value}</div>
              <div className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Bento Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Recent Clients Management Card */}
          <div className="lg:col-span-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[3.5rem] p-10 shadow-2xl">
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-3xl font-black tracking-tighter">Últimos Inquilinos</h3>
              <Link to="/admin/clients" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white flex items-center gap-2 group transition-all">
                Gerenciar Todos <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {data.clients.slice(-4).reverse().map(client => (
                <div key={client.id} className="flex flex-col sm:flex-row items-center justify-between p-6 bg-black/40 rounded-[2rem] border border-white/5 hover:bg-zinc-800/20 transition-all group gap-6">
                  <div className="flex items-center gap-6 w-full sm:w-auto">
                    <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center font-black text-2xl text-zinc-400 border border-white/10 group-hover:scale-105 transition-transform">{client.name[0]}</div>
                    <div className="min-w-0">
                      <div className="font-bold text-lg text-white truncate">{client.name}</div>
                      <div className="flex items-center gap-2">
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
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
                  <Server size={140} />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-md">
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
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-orange-500">
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
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
