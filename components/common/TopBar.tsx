import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, ChevronLeft, Layout, BarChart3, Settings, Shield, Target, Users } from 'lucide-react';
import { logout, getCurrentUser, getStorage } from '../../lib/storage';
import { PLANS } from '../../lib/plans';
import clsx from 'clsx';

interface TopBarProps {
  title: string;
  showBack?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ title, showBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const data = getStorage();
  const client = data.clients.find(c => c.id === user?.clientId);
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = isAdmin 
    ? [
        { label: 'Admin', path: '/admin', icon: Shield },
        { label: 'Clientes', path: '/admin/clients', icon: Layout },
      ]
    : [
        { label: 'Visão Geral', path: '/app', icon: Target },
        ...(client?.plan !== 'starter' ? [{ label: 'Insights', path: '/app/insights', icon: BarChart3 }] : []),
        { label: 'CRM', path: '/app/crm', icon: Users },
        { label: 'Meus Perfis', path: '/app/profiles', icon: Layout },
        { label: 'Configurações', path: '/app/settings', icon: Settings },
      ];

  return (
    <nav className="sticky top-0 w-full z-[200] bg-black/90 backdrop-blur-2xl border-b border-white/5 h-20 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-[140px] md:min-w-[200px]">
          {showBack ? (
            <button 
              onClick={() => navigate(-1)}
              className="p-2.5 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-95"
            >
              <ChevronLeft size={24} />
            </button>
          ) : (
            <Link to={isAdmin ? "/admin" : "/app"} className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-600/20">L</div>
            </Link>
          )}
          
          <h1 className="text-sm md:text-base font-black tracking-tighter truncate hidden sm:block max-w-[120px] md:max-w-none">
            {title}
          </h1>
        </div>

        <div className="hidden lg:flex items-center gap-1 p-1.5 bg-zinc-900/50 rounded-2xl border border-white/5 mx-auto">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  isActive 
                    ? "bg-white text-black shadow-xl" 
                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={12} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3 md:gap-4 flex-shrink-0 min-w-[140px] md:min-w-[200px] justify-end">
          <div className="text-right hidden md:block">
            <div className="text-[10px] font-black uppercase tracking-widest truncate max-w-[120px]">{user?.name}</div>
            <div className="text-[9px] text-zinc-500 uppercase font-black tracking-widest opacity-60 leading-none mt-0.5">
              {PLANS[client?.plan || 'starter']?.name || user?.role}
            </div>
          </div>
          
          <div className="h-8 w-px bg-white/10 mx-1 hidden md:block"></div>
          
          <button 
            onClick={handleLogout}
            className="p-3 bg-zinc-900/80 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 rounded-xl transition-all active:scale-95 border border-white/5"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TopBar;