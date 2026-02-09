
import React from 'react';
import { Profile, ProfileButton } from '../../types';
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  Eye, 
  EyeOff, 
  MessageCircle, 
  Instagram, 
  Linkedin, 
  Globe, 
  Phone, 
  Mail, 
  MapPin,
  ChevronDown,
  LayoutGrid,
  Youtube,
  Github,
  Facebook,
  Twitter,
  Music2,
  Send,
  AtSign,
  Tv,
  MessageSquare
} from 'lucide-react';
import { getIconColor } from '../../lib/linkHelpers';

interface Props {
  profile: Profile;
  onUpdate: (updates: Partial<Profile>) => void;
}

const LinksTab: React.FC<Props> = ({ profile, onUpdate }) => {
  const addLink = () => {
    const newLink: ProfileButton = {
      id: Math.random().toString(36).substring(7),
      profileId: profile.id,
      type: 'website',
      label: 'Novo Link',
      value: '',
      enabled: true,
      visibility: 'public',
      pinned: false,
      sortOrder: profile.buttons.length
    };
    onUpdate({ buttons: [...profile.buttons, newLink] });
  };

  const updateLink = (id: string, updates: Partial<ProfileButton>) => {
    onUpdate({
      buttons: profile.buttons.map(b => b.id === id ? { ...b, ...updates } : b)
    });
  };

  const removeLink = (id: string) => {
    onUpdate({
      buttons: profile.buttons.filter(b => b.id !== id)
    });
  };

  const iconMap: Record<string, any> = {
    whatsapp: MessageCircle,
    instagram: Instagram,
    linkedin: Linkedin,
    website: Globe,
    phone: Phone,
    email: Mail,
    maps: MapPin,
    youtube: Youtube,
    github: Github,
    facebook: Facebook,
    twitter: Twitter,
    x: Twitter,
    tiktok: Music2,
    telegram: Send,
    threads: AtSign,
    twitch: Tv,
    discord: MessageSquare
  };

  const linkOptions = [
    { value: 'website', label: 'Website' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'twitter', label: 'Twitter / X' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'github', label: 'GitHub' },
    { value: 'threads', label: 'Threads' },
    { value: 'telegram', label: 'Telegram' },
    { value: 'discord', label: 'Discord' },
    { value: 'twitch', label: 'Twitch' },
    { value: 'email', label: 'E-mail' },
    { value: 'phone', label: 'Telefone' },
    { value: 'maps', label: 'Google Maps' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Meus Links</h3>
          <p className="text-xs text-gray-500">Adicione, edite e organize seus botões.</p>
        </div>
        <button 
          onClick={addLink}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95"
        >
          <Plus size={16} />
          Adicionar
        </button>
      </header>

      <div className="space-y-4">
        {profile.buttons.map((btn, index) => {
          const Icon = iconMap[btn.type] || Globe;
          return (
            <div 
              key={btn.id} 
              className={`
                bg-zinc-900/40 border rounded-[1.5rem] p-4 flex flex-col gap-4 group transition-all duration-300
                ${btn.enabled ? 'border-white/5' : 'opacity-60 border-dashed border-white/10'}
              `}
            >
              <div className="flex items-start gap-3">
                <div className="mt-2 cursor-grab text-zinc-700 hover:text-white transition-colors">
                  <GripVertical size={20} />
                </div>
                
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-black/40 border border-white/5">
                  <Icon size={20} color={getIconColor(btn.type)} />
                </div>

                <div className="flex-1 min-w-0">
                  <input 
                    type="text" 
                    value={btn.label}
                    onChange={(e) => updateLink(btn.id, { label: e.target.value })}
                    className="bg-transparent border-none p-0 font-bold text-sm w-full focus:ring-0 outline-none placeholder:text-zinc-700"
                    placeholder="Rótulo do Link"
                  />
                  <div className="relative inline-block mt-1">
                    <select 
                      value={btn.type}
                      onChange={(e) => updateLink(btn.id, { type: e.target.value })}
                      className="appearance-none bg-white/5 border border-white/5 rounded-lg pl-2 pr-6 py-0.5 text-[9px] font-black uppercase tracking-widest text-zinc-500 outline-none cursor-pointer hover:bg-white/10 transition-all"
                    >
                      {linkOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => updateLink(btn.id, { enabled: !btn.enabled })}
                    className={`p-2 rounded-lg transition-all ${btn.enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-600'}`}
                  >
                    {btn.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button 
                    onClick={() => removeLink(btn.id)}
                    className="p-2 text-zinc-600 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <input 
                type="text" 
                value={btn.value}
                onChange={(e) => updateLink(btn.id, { value: e.target.value })}
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs font-medium focus:border-blue-500/50 outline-none transition-all placeholder:text-zinc-800"
                placeholder={
                  btn.type === 'whatsapp' ? 'Ex: 5511999999999' : 
                  btn.type === 'email' ? 'Ex: seu@email.com' :
                  btn.type === 'instagram' ? 'Ex: @usuario' :
                  'Insira o link ou usuário'
                }
              />
            </div>
          );
        })}
      </div>

      {profile.buttons.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.01]">
          <LayoutGrid size={32} className="text-zinc-800 mb-3" />
          <h4 className="font-bold text-zinc-500 text-sm">Nenhum link adicionado</h4>
          <p className="text-[10px] text-zinc-700 mb-5 uppercase tracking-widest">Comece a construir seu perfil</p>
          <button 
            onClick={addLink}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all"
          >
            Adicionar Primeiro Link
          </button>
        </div>
      )}
    </div>
  );
};

export default LinksTab;
