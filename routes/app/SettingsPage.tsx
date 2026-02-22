import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser } from '@/lib/storage';
import TopBar from '@/components/common/TopBar';
import { Shield, Zap, Trash2, Mail, Copy, Check, Code, FileText, LayoutTemplate, Settings, ChevronRight, User, Upload, X as XIcon, Lock } from 'lucide-react';
import { PLANS, PLAN_TYPES } from '@/lib/plans';
import { PLANS_CONFIG } from '@/lib/plansConfig';
import { Profile } from '@/types';
import clsx from 'clsx';

type SignatureTheme = 'classic' | 'modern' | 'minimal' | 'compact';

interface SignatureConfig {
  primaryColor: string;
  avatarSize: number;
  companyLogo: string;
  fontFamily: string;
  showDivider: boolean;
  showIcons: boolean;
  enabledLinks: {
    whatsapp: boolean;
    instagram: boolean;
    tiktok: boolean;
    youtube: boolean;
    linkedin: boolean;
  };
}

const DEFAULT_CONFIG: SignatureConfig = {
  primaryColor: '#3B82F6',
  avatarSize: 80,
  companyLogo: '',
  fontFamily: 'Inter',
  showDivider: true,
  showIcons: true,
  enabledLinks: {
    whatsapp: true,
    instagram: true,
    tiktok: true,
    youtube: true,
    linkedin: true,
  }
};

import { useClientData } from '@/hooks/useClientData';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { client, profiles: myProfiles, loading, error, refresh } = useClientData();

  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [signatureTheme, setSignatureTheme] = useState<SignatureTheme>('classic');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Customização extendida
  const [config, setConfig] = useState<SignatureConfig & { avatarShape: 'circle' | 'square' }>({
    ...DEFAULT_CONFIG,
    avatarShape: 'circle'
  });

  const signatureRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const selectedProfile = myProfiles.find(p => p.id === selectedProfileId);

  // Sincronizar selectedProfileId quando os perfis carregarem
  useEffect(() => {
    if (!selectedProfileId && myProfiles.length > 0) {
      setSelectedProfileId(myProfiles[0].id);
    }
  }, [myProfiles, selectedProfileId]);

  // Atualizar cor primária quando trocar perfil
  useEffect(() => {
    if (selectedProfile?.theme?.primary) {
      setConfig(prev => ({ ...prev, primaryColor: selectedProfile.theme.primary }));
    }
  }, [selectedProfileId, selectedProfile?.theme?.primary]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-neon-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        <Shield size={48} className="text-rose-500 mb-6 animate-pulse" />
        <h2 className="text-2xl font-black text-white uppercase italic mb-2 tracking-tighter">Protocolo Interrompido</h2>
        <p className="text-zinc-500 mb-8 max-w-sm">{error}</p>
        <button onClick={() => refresh()} className="bg-white text-black px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-neon-blue transition-all">Reconectar Protocolo</button>
      </div>
    );
  }

  // Plan Permissions
  const planId = client?.plan || 'starter';
  const planConfig = PLANS_CONFIG[planId];
  const isEnterprise = planId === 'enterprise';
  const isStarter = planId === 'starter';
  const globalLocked = !planConfig?.features?.schedulingGlobal;
  const perProfileLocked = !planConfig?.features?.schedulingPerProfile;
  const signatureLocked = !planConfig?.features?.white_label;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig(prev => ({ ...prev, companyLogo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getFontFamilyStyle = (font: string) => {
    const fontMap: Record<string, string> = {
      'Inter': 'Inter, Helvetica, Arial, sans-serif',
      'Poppins': 'Poppins, Helvetica, Arial, sans-serif',
      'Montserrat': 'Montserrat, Helvetica, Arial, sans-serif',
      'Arial': 'Arial, Helvetica, sans-serif',
    };
    return fontMap[font] || fontMap['Inter'];
  };

  const getSignatureHtml = (profile: Profile, theme: SignatureTheme = 'classic') => {
    if (!profile) return '';

    const themeColor = config.primaryColor || '#3B82F6';
    const avatar = profile.avatarUrl || 'https://via.placeholder.com/120';
    const profileUrl = `${window.location.origin}/#/u/${profile.slug}`;
    const displayName = profile.displayName || 'Seu Nome';
    const headline = profile.headline || 'Cargo / Título';
    const avatarSize = config.avatarSize || 80;
    const fontFamily = getFontFamilyStyle(config.fontFamily);
    const borderRadius = config.avatarShape === 'square' ? '12px' : '50%';

    // Filtrar links baseado nas seleções
    const linkTypeMap: Record<string, string> = {
      whatsapp: 'whatsapp',
      instagram: 'instagram',
      tiktok: 'tiktok',
      youtube: 'youtube',
      linkedin: 'linkedin',
    };

    const topLinks = (profile.buttons ?? [])
      .filter(b => {
        if (!b || !b.enabled) return false;
        const label = (b.label ?? '').toLowerCase();
        for (const [key, value] of Object.entries(linkTypeMap)) {
          if (label.includes(value) && config.enabledLinks?.[key as keyof typeof config.enabledLinks]) {
            return true;
          }
        }
        return false;
      })
      .slice(0, 4);

    const baseFont = `font-family: ${fontFamily};`;

    switch (theme) {
      case 'modern':
        return `
          <table cellpadding="0" cellspacing="0" border="0" style="${baseFont} font-size: 14px; line-height: 1.4; color: #333333; max-width: 480px;">
            <tr>
              ${config.companyLogo ? `<td colspan="2" style="padding-bottom: 12px;"><img src="${config.companyLogo}" alt="Logo" height="32" style="display: block;" /></td></tr><tr>` : ''}
              <td width="${avatarSize + 16}" valign="top" style="padding-right: 16px;">
                <img src="${avatar}" alt="${displayName}" width="${avatarSize}" height="${avatarSize}" style="border-radius: ${borderRadius}; display: block; object-fit: cover;" />
              </td>
              <td valign="top">
                <div style="font-size: 18px; font-weight: 800; color: #111111; letter-spacing: -0.5px; margin-bottom: 2px;">${displayName}</div>
                <div style="font-size: 12px; font-weight: 600; color: ${themeColor}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">${headline}</div>
                
                ${topLinks.length > 0 ? `<table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    ${topLinks.map(link => `
                      <td style="padding-right: 12px;">
                        <a href="${profileUrl}" style="text-decoration: none; color: #666666; font-size: 11px; font-weight: bold; border-bottom: 1px solid #eeeeee;">${link.label}</a>
                      </td>
                    `).join('')}
                  </tr>
                </table>` : ''}
              </td>
            </tr>
            ${config.showDivider ? `<tr>
              <td colspan="2" style="padding-top: 16px;">
                <div style="height: 4px; width: 40px; background-color: ${themeColor}; border-radius: 2px;"></div>
              </td>
            </tr>` : ''}
          </table>
        `.trim();

      case 'minimal':
        return `
          <table cellpadding="0" cellspacing="0" border="0" style="${baseFont} font-size: 14px; line-height: 1.5; color: #333333; max-width: 500px;">
            ${config.companyLogo ? `<tr><td colspan="2" style="padding-bottom: 10px;"><img src="${config.companyLogo}" alt="Logo" height="28" style="display: block;" /></td></tr>` : ''}
            <tr>
              <td valign="middle" width="${avatarSize / 2 + 12}" style="padding-right: 12px;">
                <img src="${avatar}" alt="${displayName}" width="${avatarSize / 2}" height="${avatarSize / 2}" style="border-radius: ${borderRadius}; display: block; object-fit: cover;" />
              </td>
              <td valign="middle" style="${config.showDivider ? 'border-left: 1px solid #e5e5e5; padding-left: 12px;' : ''}">
                <span style="font-weight: bold; color: #000;">${displayName}</span>
                <span style="color: #999; margin: 0 6px;">&bull;</span>
                <span style="color: #666;">${headline}</span>
              </td>
            </tr>
            ${topLinks.length > 0 ? `<tr>
              <td colspan="2" style="padding-top: 10px;">
                ${topLinks.map(link => `
                  <a href="${profileUrl}" style="text-decoration: none; color: ${themeColor}; font-size: 11px; font-weight: bold; margin-right: 15px; text-transform: uppercase; letter-spacing: 0.5px;">${link.label}</a>
                `).join('')}
              </td>
            </tr>` : ''}
          </table>
        `.trim();

      case 'compact':
        return `
          <table cellpadding="0" cellspacing="0" border="0" style="${baseFont} font-size: 13px; line-height: 1.4; color: #333333;">
            ${config.companyLogo ? `<tr><td colspan="2" style="padding-bottom: 8px;"><img src="${config.companyLogo}" alt="Logo" height="24" style="display: block;" /></td></tr>` : ''}
            <tr>
              <td valign="middle" style="padding-right: 12px;">
                <img src="${avatar}" alt="${displayName}" width="${avatarSize * 0.6}" height="${avatarSize * 0.6}" style="border-radius: ${borderRadius}; display: block; object-fit: cover; border: 2px solid ${themeColor};" />
              </td>
              <td valign="middle">
                <div style="font-weight: bold; color: #000;">${displayName}</div>
                <div style="font-size: 11px; color: #666; margin-bottom: 4px;">${headline}</div>
                <div>
                  <a href="${profileUrl}" style="color: ${themeColor}; text-decoration: none; font-size: 10px; font-weight: bold; border: 1px solid ${themeColor}; padding: 2px 8px; border-radius: 100px; display: inline-block;">VER PERFIL</a>
                </div>
              </td>
            </tr>
          </table>
        `.trim();

      case 'classic':
      default:
        return `
          <table cellpadding="0" cellspacing="0" border="0" style="${baseFont} font-size: 14px; line-height: 1.4; color: #444444; max-width: 500px;">
            ${config.companyLogo ? `<tr><td colspan="2" style="padding-bottom: 12px;"><img src="${config.companyLogo}" alt="Logo" height="36" style="display: block;" /></td></tr>` : ''}
            <tr>
              <td width="${avatarSize + 20}" valign="top" style="padding-right: 20px; ${config.showDivider ? `border-right: 2px solid ${themeColor};` : ''}">
                <img src="${avatar}" alt="${displayName}" width="${avatarSize}" height="${avatarSize}" style="border-radius: ${borderRadius}; display: block; object-fit: cover;" />
              </td>
              <td valign="top" style="padding-left: 20px;">
                <strong style="font-size: 20px; color: #111111; display: block; margin-bottom: 4px; letter-spacing: -0.5px;">${displayName}</strong>
                <span style="font-size: 13px; color: ${themeColor}; display: block; margin-bottom: 12px; font-weight: 600;">${headline}</span>
                
                ${topLinks.length > 0 ? `<div style="font-size: 12px; color: #666666;">
                  ${topLinks.map((link, i) => `
                    <a href="${profileUrl}" style="text-decoration: none; color: #555555; font-weight: bold;">${link.label}</a>${i < topLinks.length - 1 ? ' <span style="color:#cccccc; margin:0 4px;">|</span> ' : ''}
                  `).join('')}
                </div>` : ''}
                
                <div style="margin-top: 10px;">
                  <a href="${profileUrl}" style="display: inline-block; font-size: 11px; color: #999999; text-decoration: none;">pageflow.me/u/${profile.slug}</a>
                </div>
              </td>
            </tr>
          </table>
        `.trim();
    }
  };

  const handleCopyHtml = async () => {
    if (!selectedProfile) return;
    const html = getSignatureHtml(selectedProfile, signatureTheme);
    try {
      await navigator.clipboard.writeText(html);
      setCopyFeedback('html');
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch (err) {
      alert("Erro ao copiar. Tente selecionar e copiar manualmente.");
    }
  };

  const handleCopyText = async () => {
    if (!selectedProfile) return;
    const text = `${selectedProfile.displayName}\n${selectedProfile.headline}\n\nAcesse meu perfil: ${window.location.origin}/#/u/${selectedProfile.slug}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback('text');
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch (err) {
      alert("Erro ao copiar.");
    }
  };

  const handleCopyVisual = () => {
    if (!signatureRef.current) return;

    try {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(signatureRef.current);
      selection?.removeAllRanges();
      selection?.addRange(range);

      document.execCommand('copy');
      selection?.removeAllRanges();

      setCopyFeedback('visual');
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch (e) {
      if (selectedProfile) {
        const html = getSignatureHtml(selectedProfile, signatureTheme);
        const blobHtml = new Blob([html], { type: 'text/html' });
        const blobText = new Blob([selectedProfile.displayName], { type: 'text/plain' });
        const data = [new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })];

        navigator.clipboard.write(data).then(() => {
          setCopyFeedback('visual');
          setTimeout(() => setCopyFeedback(null), 2000);
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-neon-blue/30 pb-32">
      <TopBar title="Core Settings" showBack />
      <main className="max-w-[1400px] mx-auto p-6 lg:p-12 pt-40">

        <header className="mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-neon-blue shadow-[0_0_12px_#00f2ff] animate-pulse" />
            <span className="px-4 py-1.5 rounded-full glass-neon-blue text-[10px] font-black text-neon-blue uppercase tracking-[0.3em] leading-none">Security Clearance: Level 1</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white italic">
            Control <span className="text-neon-blue drop-shadow-[0_0_20px_rgba(0,242,255,0.4)]">Panel</span>
          </h1>
          <p className="text-zinc-500 text-lg font-medium mt-4 max-w-2xl leading-relaxed italic">
            Gerenciamento de protocolos de conta, assinaturas de rede e upgrade de sistema.
          </p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:col-span-2 space-y-10">
            {/* Seção de Perfil */}
            <section className="glass-neon-blue border border-white/5 rounded-[3rem] p-6 sm:p-10 relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/5 blur-[100px] pointer-events-none group-hover:bg-neon-blue/10 transition-all" />
              <div className="flex items-center gap-6 mb-10 relative z-10">
                <div className="p-4 bg-neon-blue/10 text-neon-blue rounded-3xl shadow-[0_0_15px_rgba(0,242,255,0.1)] group-hover:scale-110 transition-transform"><User size={28} /></div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white italic uppercase tracking-tight">Identidade Hub</h3>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mt-1">Dados de Acesso e Protocolo</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2">Proprietário</label>
                  <div className="bg-black/40 border border-white/5 p-6 rounded-2xl text-white font-black text-lg shadow-inner italic uppercase truncate">{client?.name ?? 'Identidade Desconhecida'}</div>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2">Email de Acesso</label>
                  <div className="bg-black/40 border border-white/5 p-6 rounded-2xl text-white font-black text-lg shadow-inner italic truncate">{client?.email ?? 'Endereço Indisponível'}</div>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2">Identificador de URL</label>
                  <div className="bg-black/40 border border-white/5 p-6 rounded-2xl text-neon-blue font-black text-lg shadow-inner italic truncate">
                    {selectedProfile ? `/${selectedProfile.slug}` : `/${client?.slug || ''}`}
                  </div>
                </div>
              </div>
            </section>

            {/* Protocolo de Agendamento */}
            <section className="glass-neon-blue border border-white/5 rounded-[3rem] p-6 sm:p-10 relative overflow-hidden group hover:border-amber-500/20 transition-all">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] pointer-events-none group-hover:bg-amber-500/10 transition-all" />
              <div className="flex items-center gap-6 mb-10 relative z-10">
                <div className="p-4 bg-amber-500/10 text-amber-500 rounded-3xl shadow-[0_0_15px_rgba(245,158,11,0.1)] group-hover:scale-110 transition-transform"><Settings size={28} /></div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white italic uppercase tracking-tight">Protocolo de Agenda</h3>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mt-1">Definição de Escopo de Disponibilidade</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <button
                  disabled={globalLocked}
                  onClick={() => {
                    if (globalLocked) return;
                    const confirm = window.confirm('Mudar para Agenda Global unificará disponibilidade. Deseja prosseguir?');
                    if (confirm) {
                      import('@/lib/api/clients').then(({ clientsApi }) => {
                        clientsApi.update(client!.id, { schedulingScope: 'global' }).then(() => {
                          refresh();
                        });
                      });
                    }
                  }}
                  className={clsx(
                    "p-6 rounded-3xl border text-left transition-all relative overflow-hidden group/btn",
                    globalLocked && "opacity-50 cursor-not-allowed grayscale",
                    (client?.schedulingScope || 'global') === 'global'
                      ? "bg-amber-500/10 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                      : "bg-black/40 border-white/5 hover:border-white/20"
                  )}
                >
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover/btn:text-amber-500 transition-colors">Modo Unificado</div>
                      {globalLocked && <Lock size={12} className="text-zinc-600" />}
                    </div>
                    <h4 className="text-xl font-black text-white italic uppercase tracking-tight mb-2">Agenda Global</h4>
                    <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                      Um único calendário compartilhado para todos os perfis. Ideal para profissionais individuais.
                    </p>
                  </div>
                  {(client?.schedulingScope || 'global') === 'global' && <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_#f59e0b] animate-pulse" />}
                </button>

                <button
                  disabled={perProfileLocked}
                  onClick={() => {
                    if (perProfileLocked) return;
                    import('@/lib/api/clients').then(({ clientsApi }) => {
                      clientsApi.update(client!.id, { schedulingScope: 'per_profile' }).then(() => {
                        refresh();
                      });
                    });
                  }}
                  className={clsx(
                    "p-6 rounded-3xl border text-left transition-all relative overflow-hidden group/btn",
                    perProfileLocked && "opacity-50 cursor-not-allowed grayscale",
                    client?.schedulingScope === 'per_profile'
                      ? "bg-blue-500/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                      : "bg-black/40 border-white/5 hover:border-white/20"
                  )}
                >
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover/btn:text-blue-500 transition-colors">Modo Dedicado</div>
                      {perProfileLocked && <Lock size={12} className="text-zinc-600" />}
                    </div>
                    <h4 className="text-xl font-black text-white italic uppercase tracking-tight mb-2">Por Perfil</h4>
                    <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                      Calendários independentes para cada perfil. Ideal para empresas com múltiplos serviços ou locais.
                    </p>
                  </div>
                  {client?.schedulingScope === 'per_profile' && <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6] animate-pulse" />}
                </button>
              </div>
            </section>

            {/* Gerador de Assinatura */}
            <section className={clsx(
              "glass-neon-blue border border-white/5 rounded-[3rem] p-6 sm:p-10 relative overflow-hidden group hover:border-emerald-500/20 transition-all",
              signatureLocked && "opacity-60 grayscale-[0.8]"
            )}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none group-hover:bg-emerald-500/10 transition-all" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-3xl shadow-[0_0_15px_rgba(16,185,129,0.1)] group-hover:scale-110 transition-transform"><Mail size={28} /></div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-black text-white italic uppercase tracking-tight">Sync Signature</h3>
                      {signatureLocked && <Lock size={16} className="text-zinc-500" />}
                    </div>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mt-1">
                      {signatureLocked ? "Indisponível no Plano Gratuito" : "Interface de Comunicação Profissional"}
                    </p>
                  </div>
                </div>
              </div>

              {signatureLocked ? (
                <div className="p-16 text-center bg-black/40 border border-white/5 rounded-[2.5rem] relative z-10">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-zinc-700">
                    <Lock size={32} />
                  </div>
                  <h4 className="text-xl font-black text-white italic uppercase tracking-tight mb-4">Protocolo Bloqueado</h4>
                  <p className="text-zinc-500 text-xs font-medium mb-8 max-w-xs mx-auto leading-relaxed">
                    Assinaturas de e-mail profissionais estão disponíveis apenas para usuários <span className="text-white">Pro, Business e Enterprise</span>.
                  </p>
                  <Link to="/app/upgrade" className="bg-emerald-500 text-black px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all inline-block shadow-lg shadow-emerald-500/20">Upgrade para Sync Signature</Link>
                </div>
              ) : myProfiles.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
                  {/* COLUNA ESQUERDA: CONTROLES */}
                  <div className="space-y-8">
                    <div className="bg-black/40 border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-3">
                        <Settings size={16} className="text-emerald-500" />
                        Customização
                      </h4>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Perfil Fonte</label>
                          <select
                            value={selectedProfileId}
                            onChange={(e) => setSelectedProfileId(e.target.value)}
                            className="w-full bg-black/60 border border-white/10 text-white font-bold rounded-xl px-4 py-4 outline-none focus:border-emerald-500/30 appearance-none cursor-pointer hover:bg-white/5 italic text-sm"
                          >
                            {myProfiles.map(p => (
                              <option key={p?.id} value={p?.id}>{p?.displayName} (/{p?.slug})</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Cor Primária</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={config.primaryColor}
                              onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                              className="w-12 h-12 rounded-xl border border-white/10 cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={config.primaryColor}
                              onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                              className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-4 text-xs font-mono text-white outline-none focus:border-emerald-500/30"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Tamanho Avatar</label>
                            <input
                              type="range"
                              min="48"
                              max="120"
                              value={config.avatarSize}
                              onChange={(e) => setConfig(prev => ({ ...prev, avatarSize: parseInt(e.target.value) }))}
                              className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Formato</label>
                            <div className="flex gap-2">
                              {(['circle', 'square'] as const).map(shape => (
                                <button
                                  key={shape}
                                  onClick={() => setConfig(prev => ({ ...prev, avatarShape: shape }))}
                                  className={clsx(
                                    "flex-1 py-3 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all",
                                    config.avatarShape === shape ? "bg-emerald-500 border-emerald-500 text-black" : "bg-black/60 border-white/5 text-zinc-600 hover:border-white/20"
                                  )}
                                >
                                  {shape === 'circle' ? 'Círculo' : 'Quadrado'}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Tipografia</label>
                          <select
                            value={config.fontFamily}
                            onChange={(e) => setConfig(prev => ({ ...prev, fontFamily: e.target.value }))}
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-4 text-sm text-white outline-none focus:border-emerald-500/30 cursor-pointer"
                          >
                            <option value="Inter">Inter</option>
                            <option value="Poppins">Poppins</option>
                            <option value="Montserrat">Montserrat</option>
                            <option value="Arial">Arial</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Logo Corporativa</label>
                          <div className="flex gap-2">
                            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                            <button
                              onClick={() => logoInputRef.current?.click()}
                              className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                              <Upload size={14} /> {config.companyLogo ? 'Trocar Logo' : 'Upload Logo'}
                            </button>
                            {config.companyLogo && (
                              <button onClick={() => setConfig(prev => ({ ...prev, companyLogo: '' }))} className="p-4 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500/20 transition-colors"><Trash2 size={16} /></button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/5">
                          <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Links Visíveis</label>
                          <div className="grid grid-cols-2 gap-3">
                            {Object.entries(config.enabledLinks ?? {}).map(([key, enabled]) => (
                              <label key={key} className="flex items-center gap-3 cursor-pointer group p-3 bg-black/20 rounded-xl border border-white/5 hover:border-emerald-500/20 transition-all">
                                <input
                                  type="checkbox"
                                  checked={enabled}
                                  onChange={(e) => setConfig(prev => ({
                                    ...prev,
                                    enabledLinks: { ...(prev.enabledLinks ?? {}), [key]: e.target.checked }
                                  }))}
                                  className="w-4 h-4 rounded border-2 border-white/10 bg-black/60 checked:bg-emerald-500 checked:border-emerald-500 cursor-pointer"
                                />
                                <span className="text-[10px] font-black text-zinc-500 group-hover:text-white transition-colors capitalize">{key}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* COLUNA DIREITA: PREVIEW E AÇÕES */}
                  <div className="space-y-8 lg:sticky lg:top-40">
                    <div className="space-y-6">
                      <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
                        {(['classic', 'modern', 'minimal', 'compact'] as const).map((theme) => (
                          <button
                            key={theme}
                            onClick={() => setSignatureTheme(theme)}
                            className={clsx(
                              "px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all shrink-0",
                              signatureTheme === theme ? "bg-white text-black border-white shadow-xl shadow-white/10" : "bg-black/40 text-zinc-600 border-white/5 hover:text-white"
                            )}
                          >
                            {theme}
                          </button>
                        ))}
                      </div>

                      <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl border-4 border-black relative overflow-x-auto min-h-[300px] flex items-center justify-center">
                        <div className="absolute top-4 right-8 text-[8px] font-black text-black/10 uppercase tracking-widest">REAL-TIME ENGINE PREVIEW</div>
                        <div
                          ref={signatureRef}
                          className="w-full max-w-full"
                          dangerouslySetInnerHTML={{ __html: getSignatureHtml(selectedProfile!, signatureTheme) }}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <button
                          onClick={handleCopyVisual}
                          className="w-full py-6 rounded-2xl bg-emerald-600 text-black font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-white transition-all active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.3)] shadow-emerald-500/20"
                        >
                          {copyFeedback === 'visual' ? <Check size={20} strokeWidth={3} /> : <Mail size={20} />}
                          {copyFeedback === 'visual' ? 'SYNC COMPLETE' : 'Sync para Gmail/Outlook'}
                        </button>

                        <div className="flex gap-4">
                          <button
                            onClick={handleCopyHtml}
                            className="flex-1 py-5 rounded-2xl bg-black/40 border border-white/5 text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:text-white hover:border-white/20 transition-all active:scale-95 group"
                          >
                            {copyFeedback === 'html' ? <Check size={18} /> : <Code size={18} className="group-hover:text-emerald-500" />}
                            {copyFeedback === 'html' ? 'UPLINK OK' : 'Copy HTML'}
                          </button>
                          <button
                            onClick={handleCopyText}
                            className="w-16 bg-black/40 border border-white/5 text-zinc-700 hover:text-white flex items-center justify-center rounded-2xl transition-all group"
                          >
                            {copyFeedback === 'text' ? <Check size={20} /> : <FileText size={20} className="group-hover:text-emerald-500" />}
                          </button>
                        </div>

                        <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 flex gap-4">
                          <div className="w-8 h-8 shrink-0 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]"><Check size={16} /></div>
                          <p className="text-[10px] text-zinc-500 font-medium italic leading-relaxed">
                            Sync pronto! No seu cliente de e-mail, basta usar <kbd className="bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-white not-italic">Ctrl+V</kbd> na área de assinatura.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-20 bg-black/40 border border-dashed border-white/5 rounded-[3rem] text-center max-w-lg mx-auto">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-zinc-800"><Settings size={32} /></div>
                  <h4 className="text-xl font-black text-white italic uppercase tracking-tight mb-4">No Nodes Detected</h4>
                  <p className="text-zinc-500 text-sm font-medium mb-8">É necessário pelo menos um perfil ativo para gerar protocolos de assinatura.</p>
                  <Link to="/app/profiles" className="bg-white text-black px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-neon-blue transition-all inline-block">Criar Perfil</Link>
                </div>
              )}
            </section>
          </div>

          <div className="space-y-10">
            {/* Plano */}
            <section className="glass-neon-blue border border-white/5 rounded-[3rem] p-10 relative overflow-hidden group hover:border-purple-500/20 transition-all">
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 blur-[80px] pointer-events-none group-hover:bg-purple-500/10 transition-all" />
              <div className="flex items-center gap-6 mb-10 relative z-10">
                <div className="p-4 bg-purple-500/10 text-purple-500 rounded-3xl shadow-[0_0_15px_rgba(168,85,247,0.1)] group-hover:scale-110 transition-transform"><Zap size={28} /></div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white italic uppercase tracking-tight">System Tier</h3>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mt-1">Status da Assinatura</p>
                </div>
              </div>

              <div className="bg-black/60 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 relative z-10 space-y-8 shadow-2xl">
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Nível de Acesso</div>
                  <div className="text-3xl sm:text-4xl font-black text-white translate-x-[-2px] tracking-tighter uppercase italic">{PLANS[client?.plan || 'starter']?.name ?? 'Protocolo Básico'}</div>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold text-zinc-500 italic">
                  <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
                  Acesso Sincronizado
                </div>

                <button
                  onClick={() => navigate('/app/upgrade')}
                  className="w-full bg-white text-black py-6 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-purple-600 hover:text-white transition-all active:scale-95 shadow-2xl"
                >
                  UPGRADE SYSTEM
                </button>
              </div>
            </section>

            {/* Danger Zone */}
            <section className="bg-rose-500/[0.02] border border-rose-500/10 rounded-[3rem] p-10 relative overflow-hidden group hover:border-rose-500/30 transition-all">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl shadow-[0_0_15px_rgba(244,63,94,0.1)]"><Trash2 size={20} /></div>
                <h3 className="text-xl font-black text-rose-500 uppercase italic tracking-tight">Fragile Data</h3>
              </div>
              <p className="text-zinc-600 text-xs font-medium mb-8 leading-relaxed italic">Apagar sua conta iniciará um protocolo de destruição de dados irreversível. Todos os fluxos e inteligência acumulada serão perdidos permanentemente.</p>
              <button className="w-full bg-black/40 text-rose-600 border border-rose-500/20 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all active:scale-95">
                TERMINATE ACCOUNT
              </button>
            </section>
          </div>
        </div >
      </main >
    </div >
  );
};

export default SettingsPage;