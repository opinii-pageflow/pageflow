import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, ChevronLeft, Layout, BarChart3, Settings, Shield, Target, Users, Smile } from 'lucide-react';
import { logout, getCurrentUser, getStorage } from '../../lib/storage';
import { PLANS } from '../../lib/plans';
import clsx from 'clsx';

interface TopBarProps {
  title: string;
  showBack?: boolean;
}

import { useAuth } from '../../hooks/useAuth';

interface TopBarProps {
  title: string;
  showBack?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ title, showBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const isAdmin = user?.role === 'admin';

  if (loading) return <nav className="fixed top-0 w-full z-[500] bg-black/40 backdrop-blur-xl border-b border-white/5 h-20" />;

  const handleLogout = async () => {
    console.log("[TopBar] Initiating logout process...");
    try {
      const { supabase } = await import('../../lib/supabase');
      await supabase.auth.signOut();
      console.log("[TopBar] Supabase signOut successful");
    } catch (error) {
      console.error("[TopBar] Logout error:", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      console.log("[TopBar] Local storage cleared, redirecting to login");
      window.location.href = '/#/login';
      setTimeout(() => window.location.reload(), 100);
    }
  };

  const navItems = isAdmin
    ? [
      { label: 'Visão Geral', path: '/admin', icon: Shield },
      { label: 'Empresas', path: '/admin/clients', icon: Users },
    ]
    : [
      { label: 'Visão Geral', path: '/app', icon: Target },
      { label: 'Insights', path: '/app/insights', icon: BarChart3 },
      { label: 'CRM Intelligence', path: '/app/crm', icon: Users },
      { label: 'Perfis', path: '/app/profiles', icon: Layout },
      { label: 'Comunidade', path: '/c', icon: Smile },
      { label: 'Core', path: '/app/settings', icon: Settings },
    ];

  return (
    <nav className="fixed top-0 w-full z-[500] bg-black/40 backdrop-blur-xl border-b border-white/5 h-20">
      <div className="max-w-[1600px] mx-auto px-8 h-full flex items-center justify-between gap-8">

        {/* Left Side: Logo & Context */}
        <div className="flex items-center gap-6 min-w-[200px]">
          {showBack ? (
            <button
              onClick={() => navigate(-1)}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-zinc-400 hover:text-white transition-all active:scale-90 border border-white/5"
            >
              <ChevronLeft size={22} />
            </button>
          ) : (
            <Link to={isAdmin ? "/admin" : "/app"} className="group relative">
              <div className="absolute inset-0 bg-neon-blue/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-11 h-11 bg-black border border-white/10 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-2xl transition-all group-hover:border-neon-blue/50 group-hover:scale-105">
                <span className="text-neon-blue filter drop-shadow-[0_0_8px_#00f2ff]">P</span>
                <span className="text-[10px] absolute -bottom-1 -right-1 bg-neon-blue text-black px-1 rounded-sm">F</span>
              </div>
            </Link>
          )}

          <div className="hidden sm:block">
            <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 leading-none mb-1">
              Terminal / {isAdmin ? 'System Admin' : 'Standard'}
            </h1>
            <div className="text-sm font-black tracking-tight text-white whitespace-nowrap">
              {title}
            </div>
          </div>
        </div>

        {/* Center: Logic Navigation */}
        <div className="hidden lg:flex items-center gap-1.5 p-1.5 glass-neon-blue rounded-[1.25rem] border border-white/5 relative">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-2 group relative overflow-hidden",
                  isActive
                    ? "bg-neon-blue/20 text-white border border-neon-blue/30 shadow-[0_0_30px_rgba(0,242,255,0.2)] scale-105 z-10"
                    : "text-zinc-200 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-neon-blue blur-xl opacity-40 animate-pulse" />
                )}
                <item.icon size={13} strokeWidth={isActive ? 3.5 : 2} className={clsx("relative z-10", isActive ? "text-neon-blue" : "group-hover:text-neon-blue transition-colors")} />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Side: Identity & Control */}
        <div className="flex items-center gap-5 min-w-[200px] justify-end">
          <div className="text-right hidden md:block">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white truncate max-w-[150px]">{user?.name}</div>
            <div className="flex items-center justify-end gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
              <div className="text-[9px] text-zinc-600 uppercase font-black tracking-[0.1em] opacity-80 leading-none">
                Uplink Active
              </div>
            </div>
          </div>

          <div className="h-10 w-px bg-white/5 mx-1 hidden md:block"></div>

          <button
            onClick={handleLogout}
            className="w-12 h-12 flex items-center justify-center bg-black/40 hover:bg-rose-500/10 text-zinc-600 hover:text-rose-500 rounded-2xl transition-all active:scale-95 border border-white/5 group relative overflow-hidden"
            title="Disconnect Session"
          >
            <div className="absolute inset-0 bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <LogOut size={20} className="relative z-10" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TopBar;