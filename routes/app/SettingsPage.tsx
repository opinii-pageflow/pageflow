import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getStorage } from '../../lib/storage';
import TopBar from '../../components/common/TopBar';
import { Shield, Zap, Trash2, Mail, Copy, Check, Code, FileText } from 'lucide-react';
import { PLANS } from '../../lib/plans';
import { Profile } from '../../types';
import clsx from 'clsx';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const data = getStorage();
  const client = data.clients.find(c => c.id === user?.clientId);
  
  // Filtrar perfis do cliente atual
  const myProfiles = data.profiles.filter(p => p.clientId === user?.clientId);
  
  const [selectedProfileId, setSelectedProfileId] = useState<string>(myProfiles[0]?.id || '');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const signatureRef = useRef<HTMLDivElement>(null);

  const selectedProfile = myProfiles.find(p => p.id === selectedProfileId);

  // Helper para gerar o HTML da assinatura (inline styles para email)
  const getSignatureHtml = (profile: Profile) => {
    if (!profile) return '';
    
    const themeColor = profile.theme.primary || '#3B82F6';
    const avatar = profile.avatarUrl || 'https://via.placeholder.com/100';
    const profileUrl = `${window.location.origin}/#/u/${profile.slug}`;
    
    // Pegar até 3 links principais ativos para a assinatura
    const topLinks = (profile.buttons || [])
      .filter(b => b.enabled)
      .slice(0, 3);

    return `
      <table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.4; color: #333333; max-width: 500px;">
        <tr>
          <td valign="top" style="padding-right: 20px;">
            <img src="${avatar}" alt="${profile.displayName}" width="70" height="70" style="border-radius: 50%; display: block; object-fit: cover;" />
          </td>
          <td valign="top" style="border-left: 2px solid ${themeColor}; padding-left: 20px;">
            <strong style="font-size: 18px; color: #000000; display: block; margin-bottom: 4px;">${profile.displayName}</strong>
            <span style="font-size: 14px; color: #666666; display: block; margin-bottom: 8px;">${profile.headline || 'Profissional Digital'}</span>
            
            <table cellpadding="0" cellspacing="0" border="0" style="margin-top: 8px; margin-bottom: 8px;">
              <tr>
                ${topLinks.map(link => `
                  <td style="padding-right: 10px;">
                    <a href="${profileUrl}" style="text-decoration: none; color: ${themeColor}; font-size: 12px; font-weight: bold;">${link.label}</a>
                  </td>
                `).join('')}
              </tr>
            </table>

            <div style="margin-top: 8px;">
              <a href="${profileUrl}" style="background-color: ${themeColor}; color: #ffffff; text-decoration: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; display: inline-block;">Ver meu Perfil Completo</a>
            </div>
          </td>
        </tr>
      </table>
    `.trim();
  };

  const handleCopyHtml = async () => {
    if (!selectedProfile) return;
    const html = getSignatureHtml(selectedProfile);
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

  // Cópia visual para colar no Gmail/Outlook (Rich Text)
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
      // Fallback moderno
      if (selectedProfile) {
        const html = getSignatureHtml(selectedProfile);
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
    <div className="min-h-screen bg-black">
      <TopBar title="Configurações" />
      <main className="max-w-4xl mx-auto p-6 lg:p-10 pt-28 pb-40">
        <h1 className="text-3xl font-bold mb-10 text-white">Sua Conta</h1>

        <div className="space-y-8">
          
          {/* Seção de Perfil */}
          <section className="bg-zinc-900 border border-white/5 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-500/10 text-blue-500 p-3 rounded-2xl"><Shield size={24} /></div>
              <h3 className="text-xl font-bold text-white">Perfil da Empresa</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nome</label>
                <div className="bg-black/50 border border-white/10 p-4 rounded-xl text-gray-300">{client?.name}</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">E-mail</label>
                <div className="bg-black/50 border border-white/10 p-4 rounded-xl text-gray-300">{user?.email}</div>
              </div>
            </div>
          </section>

          {/* Gerador de Assinatura */}
          <section className="bg-zinc-900 border border-white/5 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-2xl"><Mail size={24} /></div>
              <div>
                <h3 className="text-xl font-bold text-white">Assinatura de E-mail</h3>
                <p className="text-zinc-500 text-xs mt-1">Gere uma assinatura profissional automática baseada no seu perfil.</p>
              </div>
            </div>

            {myProfiles.length > 0 ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Selecionar Perfil Fonte</label>
                  <select 
                    value={selectedProfileId}
                    onChange={(e) => setSelectedProfileId(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 transition-all appearance-none"
                  >
                    {myProfiles.map(p => (
                      <option key={p.id} value={p.id}>{p.displayName} ({p.slug})</option>
                    ))}
                  </select>
                </div>

                {selectedProfile && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-white rounded-xl p-6 overflow-x-auto border border-white/10 shadow-inner">
                      <div 
                        ref={signatureRef}
                        dangerouslySetInnerHTML={{ __html: getSignatureHtml(selectedProfile) }} 
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={handleCopyVisual}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
                      >
                        {copyFeedback === 'visual' ? <Check size={16} /> : <Copy size={16} />}
                        {copyFeedback === 'visual' ? 'Copiado!' : 'Copiar para Gmail/Outlook'}
                      </button>
                      
                      <button 
                        onClick={handleCopyHtml}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 border border-white/5"
                      >
                        {copyFeedback === 'html' ? <Check size={16} /> : <Code size={16} />}
                        {copyFeedback === 'html' ? 'HTML Copiado' : 'Copiar HTML'}
                      </button>

                      <button 
                        onClick={handleCopyText}
                        className="flex-none bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white py-3 px-4 rounded-xl transition-all active:scale-95 border border-white/5"
                        title="Copiar apenas texto"
                      >
                        {copyFeedback === 'text' ? <Check size={16} /> : <FileText size={16} />}
                      </button>
                    </div>
                    <p className="text-[10px] text-zinc-500 text-center">
                      Dica: Para usar no Gmail, clique em "Copiar para Gmail", vá nas configurações do e-mail e cole (Ctrl+V) na caixa de assinatura.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-white/5 rounded-xl text-center text-zinc-500 text-sm">
                Crie um perfil primeiro para gerar sua assinatura.
              </div>
            )}
          </section>

          {/* Plano */}
          <section className="bg-zinc-900 border border-white/5 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-purple-500/10 text-purple-500 p-3 rounded-2xl"><Zap size={24} /></div>
              <h3 className="text-xl font-bold text-white">Plano e Assinatura</h3>
            </div>
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-2xl border border-purple-500/20">
              <div>
                <div className="text-lg font-bold text-white">Plano {PLANS[client?.plan || 'starter'].name}</div>
                <div className="text-sm text-gray-400">Ativo até {new Date(new Date().getTime() + 30*24*60*60*1000).toLocaleDateString()}</div>
              </div>
              <button 
                onClick={() => navigate('/app/upgrade')}
                className="bg-white text-black px-6 py-2 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all active:scale-95"
              >
                Alterar Plano
              </button>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-red-500/5 border border-red-500/10 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-red-500/10 text-red-500 p-3 rounded-2xl"><Trash2 size={24} /></div>
              <h3 className="text-xl font-bold text-red-500">Zona de Perigo</h3>
            </div>
            <p className="text-gray-500 text-sm mb-6">Uma vez que você deletar sua conta, não há volta. Todos os seus perfis e analytics serão perdidos.</p>
            <button className="bg-red-600/10 text-red-500 border border-red-500/20 px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white transition-all">
              Deletar Minha Conta Permanentemente
            </button>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;