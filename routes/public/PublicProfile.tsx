import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getStorage } from '../../lib/storage';
import { trackEvent } from '../../lib/analytics';
import { Profile, AnalyticsSource } from '../../types';
import PublicProfileRenderer from '../../components/preview/PublicProfileRenderer';

const PublicProfile: React.FC = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getStorage();
    const found = data.profiles.find(p => p.slug === slug);
    
    if (found) {
      setProfile(found);
      const client = data.clients.find(c => c.id === found.clientId);
      // REGRA: Starter não tem acesso a blocos Pro (Catálogo, etc). Pro, Business e Enterprise sim.
      setIsPro(client?.plan !== 'starter');
      const source = (searchParams.get('src') as AnalyticsSource) || 'direct';
      trackEvent({
        profileId: found.id,
        clientId: found.clientId,
        type: 'view',
        source
      });
    }
    setLoading(false);
  }, [slug, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-gray-400 mb-8">O perfil que você está procurando não existe ou foi removido.</p>
        <a href="/#/" className="bg-white text-black px-8 py-3 rounded-full font-bold">Voltar ao Início</a>
      </div>
    );
  }

  return <PublicProfileRenderer profile={profile} isPreview={false} isPro={isPro} source={(searchParams.get('src') as AnalyticsSource) || 'direct'} />;
};

export default PublicProfile;