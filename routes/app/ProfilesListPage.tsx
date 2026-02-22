import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClientData } from '@/hooks/useClientData';
import { profilesApi } from '@/lib/api/profiles';
import { clientsApi } from '@/lib/api/clients';
import { supabase } from '@/lib/supabase';
import { copyStyleToClipboard, getStyleFromClipboard, StyleConfig } from '@/lib/storage';
import { PLANS_CONFIG } from '@/lib/plansConfig';
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
  ChevronRight,
  Globe,
  Loader2,
  Rocket
} from 'lucide-react';
import TopBar from '@/components/common/TopBar';
import { Profile, Client } from '@/types';
import { themePresets } from '@/lib/themePresets';
import { canAccessFeature, getPlanLimits } from '@/lib/permissions';

const ProfilesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { profiles, client, loading: clientLoading, error, refresh } = useClientData();
  const [localLoading, setLocalLoading] = useState(false);

  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [clipboard, setClipboard] = useState<StyleConfig | null>(getStyleFromClipboard());
  const [justCopiedId, setJustCopiedId] = useState<string | null>(null);

  // Duplicação
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [profileToDuplicate, setProfileToDuplicate] = useState<Profile | null>(null);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileSlug, setNewProfileSlug] = useState('');

  const loading = clientLoading || localLoading;

  useEffect(() => {
    let mounted = true;
    const checkClipboard = () => {
      if (mounted) setClipboard(getStyleFromClipboard());
    };
    window.addEventListener('focus', checkClipboard);

    return () => {
      mounted = false;
      window.removeEventListener('focus', checkClipboard);
    };
  }, []);

  const createNewProfile = async () => {
    if (!client) return;
    const { maxProfiles } = getPlanLimits(client.plan);
    if (profiles.length >= maxProfiles) {
      setIsBuyModalOpen(true);
      return;
    }

    setLocalLoading(true);
    try {
      const tempId = Math.random().toString(36).substring(7);
      const newProfile: Partial<Profile> & { clientId: string } = {
        clientId: client.id,
        slug: `perfil-${tempId}`,
        profileType: 'personal',
        displayName: 'Novo Perfil',
        layoutTemplate: 'Minimal Card',
        visibilityMode: 'public',
        theme: themePresets['Minimal Dark'],
        fonts: { headingFont: 'Poppins', bodyFont: 'Inter', buttonFont: 'Inter' },
        buttons: []
      };

      const created = await profilesApi.create(newProfile);
      if (created) {
        await refresh();
        navigate(`/app/profiles/${created.id}/editor`);
      }
    } catch (err) {
      console.error("Failed to create profile:", err);
      alert("Erro ao criar perfil. Tente novamente.");
    } finally {
      setLocalLoading(false);
    }
  };

  const deleteProfile = async (id: string) => {
    if (window.confirm('Excluir este perfil permanentemente?')) {
      try {
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) throw error;
        await refresh();
      } catch (err) {
        console.error("Failed to delete profile:", err);
        alert("Erro ao excluir perfil.");
      }
    }
  };

  const handleCopyStyle = (profile: Profile) => {
    copyStyleToClipboard(profile);
    setClipboard(getStyleFromClipboard());
    setJustCopiedId(profile.id);
    setTimeout(() => setJustCopiedId(null), 2000);
  };

  const handlePasteStyle = async (targetProfileId: string) => {
    const config = getStyleFromClipboard();
    if (!config) return;

    try {
      await profilesApi.update(targetProfileId, {
        theme: config.theme,
        fonts: config.fonts,
        layoutTemplate: config.layoutTemplate
      });
      await refresh();
    } catch (err) {
      console.error("Failed to paste style:", err);
      alert("Erro ao colar estilo.");
    }
  };

  const handleOpenDuplicateModal = (profile: Profile) => {
    if (!client) return;
    const planConfig = PLANS_CONFIG[client.plan || 'starter'];
    if (profiles.length >= planConfig.maxProfiles) {
      setIsBuyModalOpen(true);
      return;
    }

    setProfileToDuplicate(profile);
    setNewProfileName(`${profile.displayName} (Cópia)`);
    // Usamos um slug sugerido, o usuário pode editar no modal
    setNewProfileSlug(`${profile.slug}-copy-${Math.random().toString(36).substring(7)}`);
    setIsDuplicateModalOpen(true);
  };

  const handleConfirmDuplicate = async () => {
    if (!profileToDuplicate || !newProfileSlug || !client?.id) return;

    setLocalLoading(true);
    try {
      // Verificar se o slug está disponível de verdade no Supabase
      const isAvailable = await profilesApi.checkSlugAvailability(newProfileSlug);
      if (!isAvailable) {
        alert("Este link (slug) já está sendo usado por outro perfil. Escolha outro.");
        setLocalLoading(false);
        return;
      }

      const newProfile: Partial<Profile> & { clientId: string } = {
        ...profileToDuplicate,
        clientId: client.id,
        displayName: newProfileName,
        slug: newProfileSlug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        buttons: profileToDuplicate.buttons?.map(b => ({ ...b })) || []
      };

      // Remover ID e metadados de sistema para o banco gerar novos
      delete (newProfile as any).id;
      delete (newProfile as any).created_at;
      delete (newProfile as any).updated_at;

      const created = await profilesApi.create(newProfile);
      if (created) {
        await refresh();
        navigate(`/app/profiles/${created.id}/editor`);
      }
    } catch (err) {
      console.error("Error duplicating profile:", err);
      alert("Erro ao duplicar perfil. Tente novamente.");
    } finally {
      setLocalLoading(false);
    }
  };

  const toggleScheduling = async () => {
    if (!client || !canAccessFeature(client.plan, 'scheduling')) {
      setIsBuyModalOpen(true);
      return;
    }

    const newState = !client.enableScheduling;
    try {
      await clientsApi.update(client.id, { enableScheduling: newState });
      await refresh();
    } catch (err) {
      console.error("Failed to toggle scheduling:", err);
      alert("Erro ao alterar configuração de agenda.");
    }
  };

  if (loading && profiles.length === 0) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-neon-blue animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center p-6 text-center">
        <Rocket className="w-10 h-10 text-rose-500 mb-6 animate-pulse" />
        <h2 className="text-2xl font-black text-white uppercase italic mb-2 tracking-tighter">Upgrade Protocolo Offline</h2>
        <p className="text-zinc-500 mb-8 max-w-sm">{error}</p>
        <button onClick={() => refresh()} className="bg-white text-black px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all">Restaurar Conexão</button>
      </div>
    );
  }

  const planConfig = PLANS_CONFIG[client?.plan || 'starter'];
  const capacityPercent = Math.min((profiles.length / (planConfig.maxProfiles || 1)) * 100, 100);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-neon-blue/30 pb-32">
      <TopBar title="Network Intelligence" showBack />

      <main className="max-w-[1400px] mx-auto p-6 lg:p-10 pt-40">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse" />
              <span className="px-3 py-1 rounded-full glass-neon-blue text-[9px] font-black text-neon-blue uppercase tracking-[0.25em] leading-none">Status: Ready</span>
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none text-white italic">
                Meus <span className="text-neon-blue filter drop-shadow-[0_0_12px_rgba(0,242,255,0.4)]">Perfis</span>
              </h1>
              <p className="text-zinc-500 font-medium max-w-lg">Gerencie sua presença digital e suas agendas em um único lugar.</p>
            </div>

            <div className="space-y-3 max-w-md">
              <div className="flex justify-between items-end px-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Slots de Transmissão</p>
                <div className="flex items-baseline gap-1.5 font-black italic">
                  <span className="text-lg text-white">{profiles.length}</span>
                  <span className="text-zinc-600 text-[10px] uppercase tracking-widest">/ {planConfig.maxProfiles}</span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px] relative">
                <div
                  className={clsx(
                    "h-full rounded-full transition-all duration-[2s] ease-out relative group",
                    capacityPercent > 85 ? "bg-rose-500" : "bg-neon-blue"
                  )}
                  style={{ width: `${capacityPercent}%` }}
                >
                  <div className={clsx(
                    "absolute inset-0 blur-[4px] opacity-60",
                    capacityPercent > 85 ? "bg-rose-500" : "bg-neon-blue"
                  )} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={toggleScheduling}
              className={clsx(
                "px-6 py-4 rounded-xl border transition-all text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 active:scale-95 group",
                client?.enableScheduling
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                  : "bg-white/5 border-white/5 text-zinc-500 hover:text-white"
              )}
            >
              {client?.enableScheduling ? (
                <div className="w-4 h-4 rounded bg-emerald-500 flex items-center justify-center">
                  <Check size={12} className="text-black" strokeWidth={3} />
                </div>
              ) : (
                <div className="w-4 h-4 rounded border border-zinc-600 group-hover:border-white"></div>
              )}
              Agenda Ativa
            </button>

            <button
              onClick={() => navigate('/app/upgrade')}
              className="px-8 py-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-all text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 flex items-center gap-3 active:scale-95 group"
            >
              <Zap size={16} className="group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_#f59e0b] transition-all" />
              Upgrade
            </button>
            <button
              onClick={createNewProfile}
              className="bg-white text-black px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-95 shadow-xl"
            >
              <Plus size={18} strokeWidth={3} />
              Novo Perfil
            </button>
          </div>
        </div>

        {profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 glass-neon-blue border-2 border-dashed border-white/5 rounded-[3rem] text-center px-10 relative overflow-hidden group animate-in zoom-in-95 duration-1000">
            <div className="absolute inset-0 bg-blue-600/[0.02] animate-pulse" />
            <div className="relative w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 text-zinc-700 border border-white/5 group-hover:scale-110 group-hover:border-neon-blue/30 transition-all duration-500 shadow-2xl">
              <Plus size={32} className="text-zinc-800" />
            </div>
            <h2 className="text-3xl font-black mb-4 tracking-tighter italic text-white/80 uppercase">Inicie sua Presença</h2>
            <p className="text-zinc-500 text-lg max-w-md mb-10 leading-relaxed font-medium">Crie seu primeiro terminal de links ultra moderno.</p>
            <button
              onClick={createNewProfile}
              className="relative bg-neon-blue text-black px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white transition-all active:scale-95 shadow-lg shadow-neon-blue/20"
            >
              Iniciar Protocolo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {profiles.map(profile => (
              <div key={profile.id} className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-6 group hover:border-neon-blue/30 transition-all relative overflow-hidden flex flex-col min-h-[440px] animate-in slide-in-from-bottom-8 duration-700">
                <div className="absolute top-0 right-0 w-48 h-48 bg-neon-blue/5 blur-[80px] pointer-events-none group-hover:bg-neon-blue/10 transition-colors" />

                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="relative group/avatar">
                    <img src={profile.avatarUrl} className="relative w-18 h-18 rounded-[1.6rem] object-cover ring-1 ring-white/10 shadow-xl transition-all duration-500 group-hover/avatar:scale-105" alt="" />
                    <div className="absolute -bottom-1.5 -right-1.5 bg-neon-blue p-2 rounded-lg border-4 border-[#050505] shadow-[0_0_10px_rgba(0,242,255,0.3)]">
                      <Zap size={8} className="text-black fill-black" />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <a
                      href={`#/u/${profile.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1.5 hover:bg-emerald-500/20 transition-all cursor-pointer group/live"
                      title="Visualizar Perfil Público"
                    >
                      <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[7.5px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
                      <ExternalLink size={8} className="text-emerald-500/50 group-hover/live:text-emerald-500 transition-colors" />
                    </a>
                  </div>
                </div>

                <div className="mb-6 relative z-10">
                  <h3 className="font-black text-2xl tracking-tighter truncate text-white uppercase italic group-hover:text-neon-blue transition-colors leading-tight mb-1">{profile.displayName}</h3>
                  <a
                    href={`#/u/${profile.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 group/link cursor-pointer w-fit"
                  >
                    <Globe size={10} className="text-zinc-700 group-hover/link:text-neon-blue transition-colors" />
                    <p className="text-[8.5px] font-black uppercase text-zinc-500 tracking-[0.15em] truncate group-hover/link:text-zinc-300 transition-colors italic">pageflow.me/{profile.slug}</p>
                    <ExternalLink size={8} className="opacity-0 group-hover/link:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-neon-blue" />
                  </a>
                </div>

                <div className="flex-1 space-y-4 relative z-10">
                  <div className="p-1 bg-black/40 rounded-xl border border-white/5 flex items-center gap-1">
                    <button onClick={() => handleCopyStyle(profile)} className={clsx("flex-1 py-3 rounded-lg flex items-center justify-center gap-2 text-[8.5px] font-black uppercase tracking-[0.15em] transition-all", justCopiedId === profile.id ? "bg-emerald-500/20 text-emerald-500" : "text-zinc-500 hover:text-white hover:bg-white/5")}>
                      {justCopiedId === profile.id ? <Check size={12} strokeWidth={3} /> : <Copy size={12} />}
                      {justCopiedId === profile.id ? "Sync" : "Copy Style"}
                    </button>
                    {clipboard && clipboard.sourceProfileId !== profile.id && (
                      <button onClick={() => handlePasteStyle(profile.id)} className="flex-1 py-3 rounded-lg bg-neon-blue/10 text-neon-blue hover:bg-neon-blue hover:text-black flex items-center justify-center gap-2 text-[8.5px] font-black uppercase tracking-[0.15em] transition-all animate-pulse">
                        <ClipboardPaste size={12} /> Apply
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.01] border border-white/[0.03] p-3 rounded-xl">
                      <p className="text-[6.5px] font-black text-zinc-700 uppercase tracking-widest mb-0.5">Updated</p>
                      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">{new Date(profile.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-white/[0.01] border border-white/[0.03] p-3 rounded-xl">
                      <p className="text-[6.5px] font-black text-zinc-700 uppercase tracking-widest mb-0.5">Template</p>
                      <p className="text-[9px] font-black text-neon-blue/80 uppercase tracking-tighter">{profile.layoutTemplate}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 relative z-10 mt-8">
                  <Link to={`/app/profiles/${profile.id}/editor`} className="flex-1 bg-white text-black py-4 rounded-xl flex items-center justify-center gap-2.5 text-[9px] font-black uppercase tracking-[0.15em] hover:bg-neon-blue hover:text-black transition-all active:scale-95 shadow-lg">
                    <Edit3 size={14} /> Configurar
                  </Link>
                  <button onClick={() => deleteProfile(profile.id)} className="w-11 h-11 bg-white/5 text-zinc-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl flex items-center justify-center transition-all border border-white/5" title="Excluir Perfil">
                    <Trash2 size={14} />
                  </button>
                  <button onClick={() => handleOpenDuplicateModal(profile)} className="w-11 h-11 bg-white/5 text-zinc-700 hover:text-neon-blue hover:bg-neon-blue/10 rounded-xl flex items-center justify-center transition-all border border-white/5" title="Duplicar Perfil">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isBuyModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/98 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="bg-[#0A0A0A] border border-white/5 w-full max-w-lg rounded-[3.5rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500 p-12">
            <button onClick={() => setIsBuyModalOpen(false)} className="absolute top-10 right-10 text-zinc-500 hover:text-white bg-white/5 p-3.5 rounded-full transition-all border border-white/10 hover:border-white/20"><X size={20} /></button>
            <div className="text-center space-y-10">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-neon-blue/20 blur-2xl rounded-full" />
                <div className="relative w-24 h-24 bg-white/5 text-neon-blue rounded-[2.5rem] flex items-center justify-center mx-auto border border-neon-blue/20 shadow-2xl">
                  <Zap size={40} className="filter drop-shadow-[0_0_10px_#00f2ff]" />
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">Limite / Recurso</h2>
                <p className="text-zinc-500 text-base font-medium max-w-xs mx-auto leading-relaxed">Você atingiu um limite ou este recurso (Agendamento) requer um plano Business.</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <button onClick={() => navigate('/app/upgrade')} className="w-full bg-white text-black py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-neon-blue transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3">UPGRADE PROTOCOL <ChevronRight size={18} /></button>
                <button onClick={() => setIsBuyModalOpen(false)} className="w-full bg-transparent text-zinc-600 py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:text-white transition-all">Talvez mais tarde</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDuplicateModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/98 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="bg-[#0A0A0A] border border-white/5 w-full max-w-lg rounded-[3.5rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500 p-12">
            <button onClick={() => setIsDuplicateModalOpen(false)} className="absolute top-10 right-10 text-zinc-500 hover:text-white bg-white/5 p-3.5 rounded-full transition-all border border-white/10 hover:border-white/20"><X size={20} /></button>
            <div className="space-y-10">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-white/5 text-neon-blue rounded-[2.5rem] flex items-center justify-center mx-auto border border-neon-blue/20 mb-6 shadow-2xl">
                  <Copy size={32} />
                </div>
                <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">Duplicar Perfil</h2>
                <p className="text-zinc-500 text-sm font-medium">Crie uma cópia idêntica deste protocolo.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2">Nome da Cópia</label>
                  <input
                    value={newProfileName}
                    onChange={e => setNewProfileName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:border-neon-blue outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2">Link da Cópia (Slug)</label>
                  <div className="relative">
                    <input
                      value={newProfileSlug}
                      onChange={e => setNewProfileSlug(e.target.value.toLowerCase().replace(/[^a-z0-0-]/g, ''))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:border-neon-blue outline-none transition-all pl-28"
                    />
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 text-[10px] font-black uppercase">pageflow.me/</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button onClick={() => setIsDuplicateModalOpen(false)} className="px-6 py-5 rounded-2xl bg-white/5 text-zinc-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all">Cancelar</button>
                <button
                  onClick={handleConfirmDuplicate}
                  disabled={!newProfileName || !newProfileSlug}
                  className="bg-white text-black px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-neon-blue transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check size={16} strokeWidth={3} /> CONFIRMAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
          .glass-neon-blue {
            background: rgba(0, 242, 255, 0.03);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
          }
        `}</style>
    </div>
  );
};

export default ProfilesListPage;