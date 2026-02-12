import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, getStorage, updateStorage, copyStyleToClipboard, getStyleFromClipboard, StyleConfig } from '../../lib/storage';
import clsx from 'clsx';
import { 
  Plus, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Zap, 
  X,
  Copy,
  ClipboardPaste,
  Check,
  ChevronRight
} from 'lucide-react';
import TopBar from '../../components/common/TopBar';
import { Profile } from '../../types';
import { themePresets } from '../../lib/themePresets';

const ProfilesListPage: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const data = getStorage();
  
  // Local state for profiles to avoid full page reloads on paste
  const [profiles, setProfiles] = useState<Profile[]>(data.profiles.filter(p => p.clientId === user?.clientId));
  const client = data.clients.find(c => c.id === user?.clientId);

  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [clipboard, setClipboard] = useState<StyleConfig | null>(getStyleFromClipboard());
  const [justCopiedId, setJustCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const checkClipboard = () => setClipboard(getStyleFromClipboard());
    window.addEventListener('focus', checkClipboard);
    return () => window.removeEventListener('focus', checkClipboard);
  }, []);

  const createNewProfile = () => {
    if (!client || !user?.clientId) return;

    // VALIDAÇÃO DE LIMITE SOLICITADA
    if (profiles.length >= client.maxProfiles) {
      alert("Você atingiu o limite do seu plano. Faça upgrade para continuar.");
      setIsBuyModalOpen(true);
      return;
    }

    const id = Math.random().toString(36).substring(7);
    const newProfile: Profile = {
      id, clientId: user.clientId, slug: `perfil-${id}`, displayName: 'Novo Perfil', headline: 'Bio curta aqui',
      bioShort: '', bioLong: '', avatarUrl: 'https://picsum.photos/seed/' + id + '/200', coverUrl: '',
      layoutTemplate: 'Minimal Card', visibilityMode: 'public', createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(), theme: themePresets['Minimal Dark'],
      fonts: { headingFont: 'Poppins', bodyFont: 'Inter', buttonFont: 'Inter' }, buttons: []
    };

    updateStorage(prev => ({ ...prev, profiles: [newProfile, ...prev.profiles] }));
    setProfiles([newProfile, ...profiles]);
    navigate(`/app/profiles/${id}/editor`);
  };

  const deleteProfile = (id: string) => {
    if (window.confirm('Excluir este perfil permanentemente?')) {
      updateStorage(prev => ({ ...prev, profiles: prev.profiles.filter(p => p.id !== id) }));
      setProfiles(profiles.filter(p => p.id !== id));
    }
  };

  const handleCopyStyle = (profile: Profile) => {
    copyStyleToClipboard(profile);
    setClipboard(getStyleFromClipboard());
    setJustCopiedId(profile.id);
    setTimeout(() => setJustCopiedId(null), 2000);
  };

  const handlePasteStyle = (targetProfileId: string) => {
    const config = getStyleFromClipboard();
    if (!config) return;

    // Update global storage
    updateStorage(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => 
        p.id === targetProfileId 
          ? { 
              ...p, 
              theme: config.theme, 
              fonts: config.fonts, 
              layoutTemplate: config.layoutTemplate,
              updatedAt: new Date().toISOString() 
            } 
          : p
      )
    }));

    // Update local state for immediate feedback
    setProfiles(profiles.map(p => 
      p.id === targetProfileId 
        ? { 
            ...p, 
            theme: config.theme, 
            fonts: config.fonts, 
            layoutTemplate: config.layoutTemplate 
          } 
        : p
    ));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <TopBar title="Meus Perfis Digitais" />
      
      <main className="max-w-7xl mx-auto p-6 lg:p-10 pt-44 pb-32">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 mb-20 relative z-10">
          <div className="space-y-6 max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight text-white">Ecossistema de Links</h1>
            <div className="flex flex-col md:flex-row md:items-center gap-6 p-1 bg-white/5 rounded-[2rem] border border-white/5 pr-8">
               <div className="h-14 w-64 bg-zinc-900 rounded-[1.8rem] overflow-hidden border border-white/10 relative">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-1000 shadow-[0_0_20px_rgba(59,130,246,0.3)]" 
                    style={{ width: `${Math.min((profiles.length / (client?.maxProfiles || 1)) * 100, 100)}%` }}
                  ></div>
               </div>
               <div className="space-y-1">
                 <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Capacidade de Armazenamento</p>
                 <p className="text-zinc-500 text-sm font-medium">{profiles.length} de {client?.maxProfiles} slots de perfis ativos</p>
               </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => navigate('/app/upgrade')}
              className="px-10 py-5 rounded-[2rem] border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-all text-[11px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-4 active:scale-95"
            >
              <Zap size={20} />
              Ver Planos
            </button>
            <button 
              onClick={createNewProfile}
              className="bg-white text-black px-12 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl shadow-white/5"
            >
              <Plus size={22} />
              Criar Perfil
            </button>
          </div>
        </div>

        {profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 bg-zinc-900/10 border-2 border-dashed border-white/5 rounded-[4rem] text-center px-6">
            <div className="w-24 h-24 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mb-8 text-zinc-700 border border-white/5">
               <Plus size={48} />
            </div>
            <h2 className="text-3xl font-black mb-4">Inicie sua presença digital</h2>
            <p className="text-zinc-500 text-lg max-w-sm mb-10 leading-relaxed font-medium">Crie seu primeiro cartão digital ultra moderno e comece a compartilhar agora.</p>
            <button 
              onClick={createNewProfile}
              className="bg-blue-600 text-white px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-blue-500 transition-all active:scale-95 shadow-2xl shadow-blue-500/20"
            >
              Começar Agora
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {profiles.map(profile => (
              <div key={profile.id} className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-[3.5rem] p-10 group hover:border-white/20 transition-all shadow-2xl hover:shadow-white/5 relative overflow-hidden">
                <div className="flex items-center gap-6 mb-10">
                  <div className="relative">
                    <img src={profile.avatarUrl} className="w-24 h-24 rounded-[2.5rem] object-cover ring-4 ring-zinc-950 shadow-2xl transition-transform group-hover:scale-105" alt="" />
                    <div className="absolute -top-3 -right-3 bg-blue-600 p-2 rounded-xl border-2 border-zinc-950 shadow-lg">
                      <Zap size={12} className="text-white" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-2xl tracking-tight truncate text-white">{profile.displayName}</h3>
                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] truncate opacity-80 mt-1">linkflow.me/{profile.slug}</p>
                  </div>
                </div>
                
                {/* Style Cloning Toolbar */}
                <div className="flex items-center gap-3 mb-6">
                  <button 
                    onClick={() => handleCopyStyle(profile)}
                    className={clsx(
                      "flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all border",
                      justCopiedId === profile.id 
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" 
                        : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {justCopiedId === profile.id ? <Check size={14} /> : <Copy size={14} />}
                    {justCopiedId === profile.id ? "Copiado!" : "Copiar Estilo"}
                  </button>

                  {clipboard && clipboard.sourceProfileId !== profile.id && (
                    <button 
                      onClick={() => handlePasteStyle(profile.id)}
                      className="flex-1 py-3 rounded-2xl bg-blue-600/10 border border-blue-600 text-blue-500 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all animate-pulse"
                    >
                      <ClipboardPaste size={14} />
                      Colar Estilo
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <Link 
                    to={`/app/profiles/${profile.id}/editor`}
                    className="flex-1 bg-white text-black py-5 rounded-[1.8rem] flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl"
                  >
                    <Edit3 size={18} />
                    Customizar
                  </Link>
                  <a 
                    href={`#/u/${profile.slug}`}
                    target="_blank"
                    className="p-5 bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-[1.8rem] transition-all active:scale-95 border border-white/5 shadow-xl"
                  >
                    <ExternalLink size={20} />
                  </a>
                  <button 
                    onClick={() => deleteProfile(profile.id)}
                    className="p-5 bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-[1.8rem] transition-all active:scale-95 border border-red-500/10 shadow-xl"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Upgrade Redirect */}
      {isBuyModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-500">
           <div className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-[4rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500">
              <button onClick={() => setIsBuyModalOpen(false)} className="absolute top-10 right-10 text-zinc-500 hover:text-white bg-white/5 p-3 rounded-full transition-all"><X size={24} /></button>
              <div className="p-12 text-center space-y-10">
                 <div className="w-24 h-24 bg-blue-500/10 text-blue-500 rounded-[3rem] flex items-center justify-center mx-auto border border-blue-500/20 shadow-2xl shadow-blue-500/10">
                    <Zap size={48} />
                 </div>
                 <div className="space-y-3">
                   <h2 className="text-3xl font-black tracking-tighter">Limite Atingido</h2>
                   <p className="text-zinc-500 text-base font-medium px-4">Você atingiu seu limite de {client?.maxProfiles} perfis. Faça um upgrade para liberar mais slots e recursos premium.</p>
                 </div>
                 
                 <button 
                   onClick={() => navigate('/app/upgrade')}
                   className="w-full bg-white text-black py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl shadow-white/5 flex items-center justify-center gap-3"
                 >
                    Ver Planos de Upgrade
                    <ChevronRight size={18} />
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProfilesListPage;