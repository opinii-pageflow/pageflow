import React from 'react';
import { Profile, PlanType } from '../../types';
import PhoneFrame from '../landing/PhoneFrame';
import PublicProfileRenderer from './PublicProfileRenderer';
import VitrineRenderer from './VitrineRenderer';
import { Showcase, ShowcaseItem, ShowcaseImage, ShowcaseOption, ShowcaseTestimonial } from '../../types';

interface Props {
  profile: Profile | null;
  showcase?: (Showcase & { items: (ShowcaseItem & { images: ShowcaseImage[], options: ShowcaseOption[], testimonials: ShowcaseTestimonial[] })[] }) | null;
  clientPlan?: PlanType;
  client?: any;
  viewMode?: 'profile' | 'vitrine';
}

const PhonePreview = React.memo<Props>(({ profile, showcase, clientPlan, client, viewMode = 'profile' }) => {
  if (!profile) return null;

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="relative w-[320px] h-[720px] max-h-[95vh] transition-transform origin-top duration-300 scale-[0.85] md:scale-95 xl:scale-100">
        <PhoneFrame>
          <div className="w-full min-h-full pb-40">
            {viewMode === 'vitrine' ? (
              <VitrineRenderer
                profile={profile}
                showcase={showcase || null}
                isPreview={true}
              />
            ) : (
              <PublicProfileRenderer
                profile={profile}
                isPreview={true}
                clientPlan={clientPlan}
                client={client}
                showcase={showcase || null}
                source="direct"
              />
            )}
          </div>
        </PhoneFrame>
      </div>
    </div>
  );
});

export default PhonePreview;