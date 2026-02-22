import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
<<<<<<< HEAD
import { LogOut, ChevronLeft, Layout, BarChart3, Settings, Shield, Target, Users, Smile } from 'lucide-react';
=======
import { LogOut, ChevronLeft, Layout, BarChart3, Settings, Shield, Target, Users, Smile, Menu, X } from 'lucide-react';
>>>>>>> a4f8f01 (feat: improve mobile responsiveness and optimize data fetching)
import { logout, getCurrentUser, getStorage } from '../../lib/storage';
import { PLANS } from '../../lib/plans';
import clsx from 'clsx';
import { useAuth } from '../../hooks/useAuth';

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
<<<<<<< HEAD
=======
  const [isMenuOpen, setIsMenuOpen] = useState(false);
>>>>>>> a4f8f01 (feat: improve mobile responsiveness and optimize data fetching)
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
<<<<<<< HEAD
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
=======
    <>
      <nav className="fixed top-0 w-full z-[500] bg-black/40 backdrop-blur-xl border-b border-white/5 h-20">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-full flex items-center justify-between gap-4 md:gap-8">

          {/* Left Side: Logo & Context */}
          <div className="flex items-center gap-3 sm:gap-6 min-w-0 sm:min-w-[200px]">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-90 border border-white/5"
            >
              <Menu size={20} />
            </button>

            {showBack ? (
              <button
                onClick={() => navigate(-1)}
                className="p-2.5 sm:p-3 bg-white/5 hover:bg-white/10 rounded-xl sm:rounded-2xl text-zinc-400 hover:text-white transition-all active:scale-90 border border-white/5"
              >
                <ChevronLeft size={22} />
              </button>
            ) : (
              <Link to={isAdmin ? "/admin" : "/app"} className="group relative flex-shrink-0">
                <div className="absolute inset-0 bg-neon-blue/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-10 h-10 sm:w-11 sm:h-11 bg-black border border-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl text-white shadow-2xl transition-all group-hover:border-neon-blue/50 group-hover:scale-105">
                  <span className="text-neon-blue filter drop-shadow-[0_0_8px_#00f2ff]">P</span>
                  <span className="text-[8px] sm:text-[10px] absolute -bottom-1 -right-1 bg-neon-blue text-black px-1 rounded-sm">F</span>
                </div>
>>>>>>> a4f8f01 (feat: improve mobile responsiveness and optimize data fetching)
              </Link>
            )}

<<<<<<< HEAD
        {/* Right Side: Identity & Control */}
        <div className="flex items-center gap-5 min-w-[200px] justify-end">
          <div className="text-right hidden md:block">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white truncate max-w-[150px]">{user?.name}</div>
            <div className="flex items-center justify-end gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
              <div className="text-[9px] text-zinc-600 uppercase font-black tracking-[0.1em] opacity-80 leading-none">
                Uplink Active
=======
            <div className="hidden sm:block truncate">
              <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 leading-none mb-1">
                Terminal / {isAdmin ? 'System Admin' : 'Standard'}
              </h1>
              <div className="text-sm font-black tracking-tight text-white whitespace-nowrap truncate">
                {title}
              </div>
            </div>
            {/* Mobile Title */}
            <div className="sm:hidden min-w-0">
              <div className="text-xs font-black tracking-tight text-white truncate max-w-[120px]">
                {title}
>>>>>>> a4f8f01 (feat: improve mobile responsiveness and optimize data fetching)
              </div>
            </div>
          </div>

<<<<<<< HEAD
          <div className="h-10 w-px bg-white/5 mx-1 hidden md:block"></div>

          <button
            onClick={handleLogout}
            className="w-12 h-12 flex items-center justify-center bg-black/40 hover:bg-rose-500/10 text-zinc-600 hover:text-rose-500 rounded-2xl transition-all active:scale-95 border border-white/5 group relative overflow-hidden"
            title="Disconnect Session"
          >
            <div className="absolute inset-0 bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <LogOut size={20} className="relative z-10" />
          </button>
=======
          {/* Center: Logic Navigation (Desktop) */}
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
          <div className="flex items-center gap-3 md:gap-5 min-w-0 sm:min-w-[200px] justify-end">
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
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-black/40 hover:bg-rose-500/10 text-zinc-600 hover:text-rose-500 rounded-xl sm:rounded-2xl transition-all active:scale-95 border border-white/5 group relative overflow-hidden"
              title="Disconnect Session"
            >
              <div className="absolute inset-0 bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <LogOut size={20} className="relative z-10" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={clsx(
        "fixed inset-0 z-[600] lg:hidden transition-all duration-500",
        isMenuOpen ? "visible" : "invisible"
      )}>
        {/* Backdrop */}
        <div
          className={clsx(
            "absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-500",
            isMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Content */}
        <div className={clsx(
          "absolute top-0 left-0 w-[280px] h-full bg-[#050505] border-r border-white/10 flex flex-col transition-transform duration-500 ease-out shadow-2xl",
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Drawer Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-black border border-white/10 rounded-xl flex items-center justify-center font-black text-xl text-white">
                <span className="text-neon-blue">P</span>
              </div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-white">Menu</div>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all",
                    isActive
                      ? "bg-neon-blue/10 text-white border border-neon-blue/20"
                      : "text-zinc-500 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon size={16} className={isActive ? "text-neon-blue" : ""} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Drawer Footer */}
          <div className="p-6 border-t border-white/5 bg-black/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-black text-zinc-400">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-widest text-white truncate">{user?.name}</div>
                <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">Administrador</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95"
            >
              <LogOut size={14} />
              Desconectar
            </button>
          </div>
>>>>>>> a4f8f01 (feat: improve mobile responsiveness and optimize data fetching)
        </div>
      </div>
    </>
  );
};

export default TopBar;