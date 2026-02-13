import React from 'react';
import { Profile, PlanType } from '../../types';
import PublicProfileRenderer from './PublicProfileRenderer';

interface Props {
  profile: Profile;
  clientPlan?: PlanType;
}

const PhonePreview: React.FC<Props> = ({ profile, clientPlan }) => {
  return (
    <div className="relative group perspective-1000 w-full flex items-center justify-center">
      {/* Chassis Externo Sombreado */}
      <div
        className="relative mx-auto bg-[#050505] rounded-[3rem] border-[1px] border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] ring-1 ring-white/5 flex items-center justify-center p-[6px] transition-transform duration-1000 group-hover:scale-[1.01]"
        style={{
          // Mantém proporção de celular mesmo se classes de aspect falharem
          aspectRatio: '9 / 18.5',
          height: 'clamp(520px, 70vh, 680px)',
          maxHeight: '680px',
        }}
      >
        {/* Tela Bezel-less */}
        <div className="relative w-full h-full bg-black rounded-[2.6rem] overflow-hidden border-[1px] border-[#080808]">
          {/* Dynamic Island */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-full z-[100] border border-white/5 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-zinc-900" />
          </div>

          {/* Conteúdo do App */}
          <div className="w-full h-full overflow-y-auto no-scrollbar bg-black">
            <div className="min-h-full flex flex-col">
              <PublicProfileRenderer profile={profile} isPreview={true} clientPlan={clientPlan} />
            </div>
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/10 rounded-full z-50 pointer-events-none" />

          {/* Subtle Glass Reflex */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/[0.01] via-transparent to-transparent opacity-30 z-40" />
        </div>
      </div>

      {/* Dynamic Floor Shadow */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/5 h-8 bg-blue-600/10 blur-[40px] -z-10 rounded-full" />
    </div>
  );
};

export default PhonePreview;
