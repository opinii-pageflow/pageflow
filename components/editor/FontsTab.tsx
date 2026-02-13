import React from 'react';
import { Profile } from '../../types';
import { canUseFont } from '../../lib/permissions';
import { getStorage, getCurrentUser } from '../../lib/storage';
import { Lock } from 'lucide-react';

interface Props {
  profile: Profile;
  onUpdate: (updates: Partial<Profile>) => void;
}

const FontsTab: React.FC<Props> = ({ profile, onUpdate }) => {
  const user = getCurrentUser();
  const data = getStorage();
  const client = data.clients.find(c => c.id === user?.clientId);

  const fonts = [
    'Inter', 'Poppins', 'Montserrat', 'Roboto', 'Nunito', 
    'Raleway', 'Oswald', 'Playfair Display', 'Lato', 
    'Merriweather', 'DM Sans', 'Bebas Neue'
  ];

  const updateFonts = (updates: Partial<typeof profile.fonts>) => {
    onUpdate({ fonts: { ...profile.fonts, ...updates } });
  };

  const renderFontOption = (font: string, field: 'headingFont' | 'bodyFont' | 'buttonFont') => {
    const isLocked = !canUseFont(client?.plan, font);
    const isActive = (profile.fonts as any)[field] === font;

    return (
      <button
        key={font}
        disabled={isLocked}
        onClick={() => !isLocked && updateFonts({ [field]: font })}
        className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${
          isActive ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 bg-zinc-900 hover:border-white/10'
        } ${isLocked ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
        style={{ fontFamily: font }}
      >
        {isLocked && (
          <div className="absolute top-2 right-2 bg-black/40 p-1 rounded-md border border-white/10">
            <Lock size={10} className="text-zinc-500" />
          </div>
        )}
        <div className="text-lg font-bold">{font}</div>
        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-sans">Visualização rápida</div>
      </button>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Fonte dos Títulos</h3>
        <div className="grid grid-cols-1 gap-2">
          {fonts.map(font => renderFontOption(font, 'headingFont'))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Fonte do Corpo</h3>
        <div className="grid grid-cols-1 gap-2">
          {fonts.map(font => renderFontOption(font, 'bodyFont'))}
        </div>
      </section>
    </div>
  );
};

export default FontsTab;