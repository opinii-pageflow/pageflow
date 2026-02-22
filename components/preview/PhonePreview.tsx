import React from 'react';
import { Profile, PlanType } from '../../types';
import PhoneFrame from '../landing/PhoneFrame';
import PublicProfileRenderer from './PublicProfileRenderer';

interface Props {
  profile: Profile | null;
  clientPlan?: PlanType;
  client?: any;
}

const PhonePreview: React.FC<Props> = ({ profile, clientPlan, client }) => {
  if (!profile) return null;

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="relative w-[320px] h-[720px] max-h-[95vh] transition-transform origin-top duration-300 scale-[0.85] md:scale-95 xl:scale-100">
        <PhoneFrame>
          <div className="w-full min-h-full pb-40">
            <PublicProfileRenderer
              profile={profile}
              isPreview={true}
              clientPlan={clientPlan}
              client={client}
              source="direct"
            />
          </div>
        </PhoneFrame>
      </div>
    </div>
  );
};

export default PhonePreview;