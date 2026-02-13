import React from 'react';
import { Profile } from '../../types';

interface Props {
  profile: Profile;
  onUpdate: (updates: Partial<Profile>) => void;
}

const FontsTab: React.FC<Props> = ({ profile, onUpdate }) => {
  const fonts = [
    'Inter', 'Poppins', 'Montserrat', 'Roboto', 'Nunito', 
    'Raleway', 'Oswald', 'Playfair Display', 'Lato', 
    'Merriweather', 'DM Sans', 'Bebas Neue'
  ];

  const updateFonts = (updates: Partial<typeof profile.fonts>) => {
    onUpdate({ fonts: { ...profile.fonts, ...updates } });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Fonte dos Títulos</h3>
        <div className="grid grid-cols-1 gap-2">
          {fonts.map(font => (
            <button
              key={font}
              onClick={() => updateFonts({ headingFont: font })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${profile.fonts.headingFont === font ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 bg-zinc-900 hover:border-white/10'}`}
              style={{ fontFamily: font }}
            >
              <div className="text-lg font-bold">{font}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest font-sans">The quick brown fox</div>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Fonte do Corpo</h3>
        <div className="grid grid-cols-1 gap-2">
          {fonts.map(font => (
            <button
              key={font}
              onClick={() => updateFonts({ bodyFont: font })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${profile.fonts.bodyFont === font ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 bg-zinc-900 hover:border-white/10'}`}
              style={{ fontFamily: font }}
            >
              <div className="text-sm">{font}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Fonte dos Botões</h3>
        <div className="grid grid-cols-1 gap-2">
          {fonts.map(font => (
            <button
              key={font}
              onClick={() => updateFonts({ buttonFont: font })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${profile.fonts.buttonFont === font ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 bg-zinc-900 hover:border-white/10'}`}
              style={{ fontFamily: font }}
            >
              <div className="text-sm font-black uppercase tracking-widest">{font}</div>
              <div className="mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border border-white/10">
                Botão exemplo
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default FontsTab;
