import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  Palette, 
  Link as LinkIcon, 
  Layout, 
  Type, 
  Share2, 
  Save, 
  ChevronLeft, 
  CheckCircle2, 
  ExternalLink,
  Smartphone,
  PanelLeft,
  Eye,
  Copy,
  ClipboardPaste,
  Zap
} from 'lucide-react';
import { getStorage, updateStorage, copyStyleToClipboard, getStyleFromClipboard, StyleConfig } from '../../lib/storage';
import { Profile } from '../../types';
import PhonePreview from '../../components/preview/PhonePreview';

// Tabs Components
import ProfileTab from '../../components/editor/ProfileTab';
import DesignTab from '../../components/editor/DesignTab';
import LinksTab from '../../components/editor/LinksTab';
import TemplatesTab from '../../components/editor/TemplatesTab';
import FontsTab from '../../components/editor/FontsTab';
import ShareTab from '../../components/editor/ShareTab';
import ProTab from '../../components/editor/ProTab';
import clsx from 'clsx';

const ProfileEditorPage: React.FC = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [clipboard, setClipboard] = useState<StyleConfig | null>(getStyleFromClipboard());
  const [justCopied, setJustCopied] = useState(false);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const data = getStorage();
    const found = data.profiles.find(p => p.id === profileId);
    if (found) {
      setProfile({ ...found });
      const client = data.clients.find(c => c.id === found.clientId);
      setIsPro(client?.plan !== 'free');
    } else {
      navigate('/app/profiles');
    }
    setLoading(false);
  }, [profileId, navigate]);

  const handleUpdateProfile = (updates: Partial<Profile>) => {
    if (!profile) return;
    setProfile({ ...profile, ...updates });
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    if (!profile) return;
    setIsSaving(true);
    updateStorage(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => p.id === profile.id ? { ...profile, updatedAt: new Date().toISOString() } : p)
    }));
    setTimeout(() => {
      setIsSaving(false);
      setHasUnsavedChanges(false);
    }, 800);
  };

  const handleCopyStyle = () => {
    if (!profile) return;
    copyStyleToClipboard(profile);
    setClipboard(getStyleFromClipboard());
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 2000);
  };

  const handlePasteStyle = () => {
    const config = getStyleFromClipboard();
    if (!config || !profile) return;
    setProfile({
      ...profile,
      theme: config.theme,
      fonts: config.fonts,
      layoutTemplate: config.layoutTemplate
    });
    setHasUnsavedChanges(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-black mb-2">Perfil não encontrado</h1>
        <p className="text-zinc-500 mb-8">Esse perfil pode ter sido removido ou você não tem acesso.</p>
        <button
          onClick={() => navigate('/app/profiles')}
          className="bg-white text-black px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest"
        >
          Voltar para Perfis
        </button>
      </div>
    );
  }

  const editorTabs = [
    { id: 'profile', label: 'Perfil', icon: <User size={16} /> },
    { id: 'links', label: 'Links', icon: <LinkIcon size={16} /> },
    { id: 'design', label: 'Design', icon: <Palette size={16} /> },
    { id: 'templates', label: 'Layout', icon: <Layout size={16} /> },
    { id: 'fonts', label: 'Fontes', icon: <Type size={16} /> },
    { id: 'share', label: 'Share', icon: <Share2 size={16} /> },
    { id: 'pro', label: 'Pro', icon: <Zap size={16} /> },
  ];

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Editor Header */}
      <header className="h-20 bg-black/90 backdrop-blur-2xl border-b border-white/10 px-4 md:px-8 flex items-center justify-between flex-shrink-0 z-[110] shadow-2xl">
        <div className="flex items-center gap-4 min-w-0">
          <button 
            onClick={() => navigate('/app/profiles')} 
            className="p-2.5 hover:bg-white/10 rounded-xl text-gray-400 transition-all hover:text-white active:scale-90"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
          
          <div className="min-w-0">
            <h1 className="font-black text-sm md:text-base tracking-tight truncate">{profile.displayName}</h1>
            <a href={`#/u/${profile.slug}`} target="_blank" className="text-[10px] text-zinc-500 hover:text-blue-400 flex items-center gap-1 transition-colors font-mono">
              linkflow.me/u/{profile.slug}
              <ExternalLink size={10} />
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          {/* Style Replicator Tools */}
          <div className="hidden md:flex items-center gap-2 border-r border-white/10 pr-4 mr-2">
            <button 
              onClick={handleCopyStyle}
              className={clsx(
                "p-3 rounded-xl transition-all flex items-center gap-2 text-[9px] font-black uppercase tracking-widest",
                justCopied ? "bg-emerald-500/10 text-emerald-500" : "bg-white/5 text-zinc-400 hover:text-white"
              )}
              title="Copiar configurações de estilo deste perfil"
            >
              {justCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              <span className="hidden xl:inline">{justCopied ? "Copiado" : "Copiar Estilo"}</span>
            </button>

            {clipboard && clipboard.sourceProfileId !== profile.id && (
              <button 
                onClick={handlePasteStyle}
                className="p-3 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white rounded-xl transition-all flex items-center gap-2 text-[9px] font-black uppercase tracking-widest border border-blue-600/30"
                title="Colar configurações de estilo vindas de outro perfil"
              >
                <ClipboardPaste size={16} />
                <span className="hidden xl:inline">Colar Estilo</span>
              </button>
            )}
          </div>

          <div className="hidden xl:flex items-center">
            {hasUnsavedChanges ? (
              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full border border-amber-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                Pendente
              </span>
            ) : (
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <CheckCircle2 size={14} />
                Salvo
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowMobilePreview(!showMobilePreview)}
              className={clsx(
                "lg:hidden p-3 rounded-2xl transition-all active:scale-90 shadow-xl",
                showMobilePreview ? "bg-blue-600 text-white" : "bg-white/10 text-zinc-400"
              )}
            >
              <Smartphone size={22} />
            </button>

            <a 
              href={`#/u/${profile.slug}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-5 py-3 rounded-2xl bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all active:scale-95 shadow-xl font-black text-[10px] uppercase tracking-widest"
            >
              <Eye size={16} />
              <span>Ver Link</span>
            </a>

            <button 
              onClick={handleSave}
              disabled={!hasUnsavedChanges || isSaving}
              className="bg-white text-black px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 disabled:opacity-10 transition-all hover:bg-zinc-200 active:scale-95 shadow-xl shadow-white/5"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save size={16} />
              )}
              <span className="hidden sm:inline">{isSaving ? 'Salvando' : 'Salvar'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className={clsx(
          "flex-1 lg:flex-none lg:w-[42%] flex flex-col bg-[#050505] border-r border-white/5 transition-all duration-500 z-10",
          showMobilePreview ? "-translate-x-full lg:translate-x-0 opacity-0 lg:opacity-100" : "translate-x-0 opacity-100"
        )}>
          <div className="bg-black/40 backdrop-blur-xl sticky top-0 z-20 border-b border-white/5 p-3 overflow-hidden">
            <div className="flex overflow-x-auto no-scrollbar gap-2">
              {editorTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95",
                    activeTab === tab.id 
                      ? "bg-white text-black shadow-lg" 
                      : "text-zinc-500 hover:text-white hover:bg-white/5"
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-black">
            <div className="p-6 lg:p-10 max-w-2xl mx-auto pb-40">
              {activeTab === 'profile' && <ProfileTab profile={profile} onUpdate={handleUpdateProfile} />}
              {activeTab === 'design' && <DesignTab profile={profile} onUpdate={handleUpdateProfile} />}
              {activeTab === 'links' && <LinksTab profile={profile} onUpdate={handleUpdateProfile} />}
              {activeTab === 'templates' && <TemplatesTab profile={profile} onUpdate={handleUpdateProfile} />}
              {activeTab === 'fonts' && <FontsTab profile={profile} onUpdate={handleUpdateProfile} />}
              {activeTab === 'share' && <ShareTab profile={profile} />}
              {activeTab === 'pro' && <ProTab profile={profile} isPro={isPro} onUpdate={handleUpdateProfile} />}
            </div>
          </div>
        </div>

        <div className={clsx(
          "absolute inset-0 lg:relative lg:flex-none lg:w-[58%] bg-[#020202] flex items-center justify-center p-6 lg:p-12 transition-all duration-500",
          showMobilePreview ? "translate-x-0 z-50" : "translate-x-full lg:translate-x-0 opacity-0 lg:opacity-100"
        )}>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[180px] pointer-events-none opacity-40"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[180px] pointer-events-none opacity-40"></div>
          
          <button 
            onClick={() => setShowMobilePreview(false)}
            className="lg:hidden absolute top-8 left-8 z-[120] bg-white text-black p-4 rounded-2xl shadow-2xl border border-white/20 active:scale-90"
          >
            <PanelLeft size={24} />
          </button>

          <div className="relative z-10 w-full h-full flex flex-col justify-center items-center">
            <div className="mb-8 hidden lg:block">
              <div className="inline-flex items-center gap-2 bg-zinc-900/80 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/10 shadow-2xl">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Preview em Tempo Real</span>
              </div>
            </div>

            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              <PhonePreview profile={profile} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditorPage;