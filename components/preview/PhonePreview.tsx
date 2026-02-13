import React from 'react';
import { Profile, PlanType } from '../../types';
import PhoneFrame from '../landing/PhoneFrame';
import PublicProfileRenderer from './PublicProfileRenderer';

interface Props {
  profile: Profile | null;
  clientPlan?: PlanType;
}

const PhonePreview: React.FC<Props> = ({ profile, clientPlan }) => {
  if (!profile) return null;

  return (
    <div className="w-full max-w-[320px] mx-auto transform scale-[0.85] md:scale-100 transition-transform origin-top">
      <PhoneFrame>
        <PublicProfileRenderer 
          profile={profile} 
          isPreview={true} 
          clientPlan={clientPlan} 
          source="direct"
        />
      </PhoneFrame>
    </div>
  );
};

export default PhonePreview;