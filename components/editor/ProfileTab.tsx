import React, { useRef } from 'react';
import { Profile } from '../../types';
import { Camera, Image as ImageIcon, Sparkles, Upload, Link as LinkIcon, X, User, Building2 } from 'lucide-react';

interface Props {
  profile: Profile;
  onUpdate: (updates: Partial<Profile>) => void;
}

const ProfileTab: React.FC<Props> = ({ profile, onUpdate }) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatarUrl' | 'coverUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header>
        <h3 className="text-xl font-bold tracking-tight">Identidade Visual</h3>
        <p className="text-xs text-gray-500">Como você aparece para o mundo.</p>
      </header>

      {/* Seletor de Tipo de Perfil */}
      <section className="space-y-3">
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Tipo de Perfil</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onUpdate({ profileType: 'personal' })}
            className={`
              p-4 rounded-2xl border flex items-center gap-3 transition-all
              ${profile.profileType === 'personal' 
                ? 'bg-white text-black border-white shadow-lg' 
                : 'bg-zinc-900 border-white/10 text-zinc-500 hover:text-white hover:bg-zinc-800'}
            `}
          >
            <User size={20} />
            <div className="text-left">
              <div className="text-xs font-black uppercase tracking-wider">Profissional</div>
              <div className="text-[10px] opacity-60">Para pessoas</div>
            </div>
          </button>
          
          <button
            onClick={() => onUpdate({ profileType: 'business' })}
            className={`
              p-4 rounded-2xl border flex items-center gap-3 transition-all
              ${profile.profileType === 'business' 
                ? 'bg-white text-black border-white shadow-lg' 
                : 'bg-zinc-900 border-white/10 text-zinc-500 hover:text-white hover:bg-zinc-800'}
            `}
          >
            <Building2 size={20} />
            <div className="text-left">
              <div className="text-xs font-black uppercase tracking-wider">Empresa</div>
              <div className="text-[10px] opacity-60">Para negócios</div>
            </div>
          </button>
        </div>
      </section>

      {/* Seção de Fotos (Avatar e Capa) */}
      <section className="space-y-6">
        {/* Capa do Perfil */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Imagem de Capa</label>
          <div className="relative group h-40 w-full rounded-[2rem] overflow-hidden bg-zinc-900 border border-white/5 shadow-inner">
            {profile.coverUrl ? (
              <>
                <img src={profile.coverUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" alt="Capa" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 backdrop-blur-sm">
                  <button 
                    onClick={() => coverInputRef.current?.click()}
                    className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform"
                  >
                    <Upload size={20} />
                  </button>
                  <button 
                    onClick={() => onUpdate({ coverUrl: '' })}
                    className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"
                  >
                    <X size={20} />
                  </button>
                </div>
              </>
            ) : (
              <button 
                onClick={() => coverInputRef.current?.click()}
                className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-600 hover:text-zinc-400 hover:bg-white/5 transition-all"
              >
                <div className="p-4 bg-white/5 rounded-2xl">
                  <ImageIcon size={32} />
                </div>
                <span className="text-xs font-bold">Adicionar Foto de Capa</span>
              </button>
            )}
            <input 
              type="file" 
              ref={coverInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => handleFileChange(e, 'coverUrl')} 
            />
          </div>
          <div className="relative flex items-center">
            <div className="absolute left-4 text-zinc-600"><LinkIcon size={14} /></div>
            <input 
              type="text" 
              value={profile.coverUrl}
              onChange={(e) => onUpdate({ coverUrl: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-5 py-3 text-[11px] font-medium focus:border-blue-500/50 transition-all outline-none placeholder:text-zinc-800"
              placeholder="Ou cole a URL da imagem de capa..."
            />
          </div>
        </div>

        {/* Avatar e Infos Principais */}
        <div className="flex flex-col sm:flex-row items-center gap-8 p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 relative">
          <div className="relative group flex-shrink-0">
            <div className="w-40 h-40 rounded-full overflow-hidden border-[6px] border-zinc-950 ring-2 ring-white/5 bg-zinc-900 flex items-center justify-center shadow-2xl relative">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" alt="Avatar" />
              ) : (
                <Camera size={32} className="text-zinc-800" />
              )}
            </div>
            <button 
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-1 right-1 p-3 bg-blue-600 text-white rounded-2xl shadow-xl hover:bg-blue-500 hover:scale-110 active:scale-95 transition-all ring-4 ring-zinc-950"
            >
              <Upload size={18} />
            </button>
            <input 
              type="file" 
              ref={avatarInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => handleFileChange(e, 'avatarUrl')} 
            />
          </div>
          
          <div className="flex-1 w-full space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <Sparkles size={10} className="text-amber-500" />
                Nome de Exibição
              </label>
              <input 
                type="text" 
                value={profile.displayName}
                onChange={(e) => onUpdate({ displayName: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-base font-bold focus:border-blue-500/50 transition-all outline-none placeholder:text-zinc-800"
                placeholder="Seu Nome ou Empresa"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">URL da Foto de Perfil</label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-zinc-600"><LinkIcon size={14} /></div>
                <input 
                  type="text" 
                  value={profile.avatarUrl}
                  onChange={(e) => onUpdate({ avatarUrl: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-5 py-3 text-[11px] font-medium focus:border-blue-500/50 transition-all outline-none placeholder:text-zinc-800"
                  placeholder="Ou cole a URL da foto de perfil..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Outras Informações */}
        <div className="grid grid-cols-1 gap-6">
          <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Headline (Profissão/Subtítulo)</label>
              <input 
                type="text" 
                value={profile.headline}
                onChange={(e) => onUpdate({ headline: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-gray-300 focus:border-blue-500/50 transition-all outline-none placeholder:text-zinc-800"
                placeholder="Ex: Designer UI/UX & Desenvolvedor"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Bio Curta</label>
              <textarea 
                value={profile.bioShort}
                onChange={(e) => onUpdate({ bioShort: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-3xl px-5 py-4 text-sm h-32 focus:border-blue-500/50 transition-all outline-none resize-none leading-relaxed text-gray-400"
                placeholder="Conte brevemente sobre você..."
              />
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Identificador de URL</label>
            <div className="flex items-center group shadow-2xl">
              <div className="bg-zinc-800 px-5 py-4 rounded-l-2xl text-zinc-500 text-xs font-bold border-r border-white/5">linkflow.me/u/</div>
              <input 
                type="text" 
                value={profile.slug}
                onChange={(e) => onUpdate({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                className="flex-1 bg-black/60 border-y border-r border-white/10 rounded-r-2xl px-5 py-4 text-sm font-bold focus:border-blue-500/50 transition-all outline-none text-blue-400"
                placeholder="usuario"
              />
            </div>
            <div className="flex items-center gap-2 px-1">
              <div className="w-1 h-1 rounded-full bg-blue-500"></div>
              <p className="text-[10px] text-zinc-600 font-medium">Este é o link público que você compartilhará com o mundo.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfileTab;