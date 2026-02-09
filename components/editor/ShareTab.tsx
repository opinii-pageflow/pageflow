
import React, { useRef, useState } from 'react';
import { Profile } from '../../types';
import { 
  Share2, 
  Copy, 
  Download, 
  ExternalLink, 
  MessageCircle, 
  Twitter, 
  Linkedin, 
  Send, 
  Check,
  ChevronRight,
  QrCode,
  Smartphone,
  X,
  Mail,
  Zap,
  RefreshCw
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

interface Props {
  profile: Profile;
}

const ShareTab: React.FC<Props> = ({ profile }) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const highResQrRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // URL pública formatada para o HashRouter
  const shareUrl = `${window.location.origin}/#/u/${profile.slug}`;
  const shareText = `Confira meu perfil profissional no LinkFlow: ${profile.displayName} 🚀`;

  const copyToClipboard = () => {
    try {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const downloadQRCode = async () => {
    setIsDownloading(true);
    // Give time for the high-res canvas to be ready if it was just rendered
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
      const canvas = highResQrRef.current?.querySelector('canvas');
      if (!canvas) {
        // Fallback to the visible one if high-res fails
        const visibleCanvas = qrRef.current?.querySelector('canvas');
        if (!visibleCanvas) throw new Error("Canvas not found");
        triggerDownload(visibleCanvas);
      } else {
        triggerDownload(canvas);
      }
    } catch (err) {
      console.error("Error downloading QR Code", err);
      alert("Houve um erro ao gerar o arquivo de alta resolução. Tente novamente.");
    } finally {
      setIsDownloading(false);
    }
  };

  const triggerDownload = (canvas: HTMLCanvasElement) => {
    try {
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `linkflow-qr-${profile.slug}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (e) {
      console.error("Canvas export failed (likely CORS)", e);
      alert("Não foi possível exportar a imagem devido a restrições de segurança na foto de perfil. Tente remover o logo central e baixar novamente.");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `LinkFlow - ${profile.displayName}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Erro ao compartilhar:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  const socialSharing = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={20} />,
      color: 'bg-[#25D366] hover:bg-[#20ba5a]',
      url: `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`
    },
    {
      name: 'Twitter',
      icon: <Twitter size={20} />,
      color: 'bg-[#000000] hover:bg-[#111111]',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin size={20} />,
      color: 'bg-[#0077B5] hover:bg-[#006396]',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Telegram',
      icon: <Send size={20} />,
      color: 'bg-[#0088cc] hover:bg-[#0077b5]',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <header>
        <h3 className="text-xl font-bold tracking-tight">Compartilhar</h3>
        <p className="text-xs text-gray-500">Expanda seu alcance compartilhando seu perfil digital.</p>
      </header>

      {/* Seção Principal de Link e Cópia */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <QrCode size={14} className="text-blue-500" />
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Seu Link Pessoal</h3>
        </div>
        
        <div className="bg-zinc-900/60 border border-white/5 p-2 rounded-[1.8rem] flex items-center gap-3 group transition-all hover:border-blue-500/30">
          <div className="flex-1 min-w-0 pl-4 py-2 text-xs font-mono font-bold text-blue-400 truncate select-all">
            {shareUrl}
          </div>
          <button 
            onClick={copyToClipboard}
            className={`p-4 rounded-2xl transition-all flex items-center gap-2 shadow-lg ${
              copied 
                ? 'bg-emerald-500 text-white' 
                : 'bg-zinc-800 text-white hover:bg-white hover:text-black'
            }`}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            <span className="text-[10px] font-black uppercase tracking-widest">{copied ? 'Copiado' : 'Copiar'}</span>
          </button>
        </div>
      </section>

      {/* Botões de Redes Sociais em Grid */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Compartilhar em</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {socialSharing.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${social.color} py-4 px-6 rounded-2xl flex items-center justify-between text-white font-bold transition-all hover:-translate-y-1 active:scale-[0.98] shadow-xl group`}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-lg group-hover:scale-110 transition-transform">
                  {social.icon}
                </div>
                <span className="text-sm tracking-tight">{social.name}</span>
              </div>
              <ChevronRight size={16} className="opacity-40 group-hover:translate-x-1 transition-transform" />
            </a>
          ))}
        </div>
        <button 
          onClick={handleNativeShare}
          className="w-full bg-white/5 hover:bg-white/10 text-zinc-300 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all border border-white/5 active:scale-[0.98]"
        >
          <Share2 size={16} />
          Outras Opções de Envio
        </button>
      </section>

      {/* QR Code Section Premium */}
      <section className="bg-zinc-900/40 p-10 rounded-[2.5rem] border border-white/5 text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        
        {/* Hidden High-Res Canvas for Downloads - Rendered at 1024px */}
        <div ref={highResQrRef} className="hidden" aria-hidden="true">
          <QRCodeCanvas
            value={shareUrl}
            size={1024}
            level={"H"}
            includeMargin={true}
            imageSettings={profile.avatarUrl ? {
              src: profile.avatarUrl,
              x: undefined,
              y: undefined,
              height: 200,
              width: 200,
              excavate: true,
            } : undefined}
          />
        </div>

        <div 
          ref={qrRef} 
          className="relative z-10 w-56 h-56 bg-white p-5 rounded-[2.5rem] mx-auto mb-8 shadow-2xl shadow-black flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:scale-[1.02] group-hover:rotate-1"
        >
          <QRCodeCanvas
            value={shareUrl}
            size={180}
            level={"H"}
            includeMargin={false}
            imageSettings={profile.avatarUrl ? {
              src: profile.avatarUrl,
              x: undefined,
              y: undefined,
              height: 42,
              width: 42,
              excavate: true,
            } : undefined}
          />
        </div>

        <div className="relative z-10 space-y-2 mb-8 px-4">
           <h3 className="text-lg font-bold">QR Code de Perfil</h3>
           <p className="text-xs text-zinc-500 leading-relaxed">
             Ideal para cartões de visita físicos ou assinaturas de e-mail. 
           </p>
        </div>
        
        <button 
          onClick={downloadQRCode}
          disabled={isDownloading}
          className="relative z-10 w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:bg-gray-200 active:scale-95 shadow-xl shadow-white/5 disabled:opacity-50"
        >
          {isDownloading ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : (
            <Download size={18} />
          )}
          {isDownloading ? 'Gerando PNG...' : 'Baixar PNG de Alta Resolução'}
        </button>
      </section>

      {/* NFC Teaser Card */}
      <section className="relative p-8 rounded-[2.5rem] bg-gradient-to-br from-zinc-900 to-black border border-white/5 overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] group-hover:bg-purple-600/20 transition-all duration-1000"></div>
        
        <div className="relative z-10 flex items-start justify-between mb-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-purple-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest shadow-lg shadow-purple-500/20">
              Tech Premium
            </div>
            <h4 className="text-2xl font-black tracking-tighter">Conexão <span className="text-purple-500">NFC</span></h4>
          </div>
          <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-purple-400">
            <Smartphone size={28} className="animate-pulse" />
          </div>
        </div>

        <p className="relative z-10 text-xs text-zinc-500 leading-relaxed mb-8 pr-8">
          Adquira um cartão LinkFlow NFC e compartilhe seu perfil apenas aproximando do celular do cliente. Sem leitura de câmera necessária.
        </p>

        <button className="relative z-10 w-full py-4 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-purple-600/10 flex items-center justify-center gap-2 active:scale-95">
          Ver Modelos de Cartão 
          <ChevronRight size={14} />
        </button>
      </section>
    </div>
  );
};

export default ShareTab;
