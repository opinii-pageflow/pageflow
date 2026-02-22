import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { trackEvent, captureSessionOrigin } from '@/lib/analytics';
import { Profile, PlanType, UtmParams, AnalyticsSource } from '../../types';
import PublicProfileRenderer from '@/components/preview/PublicProfileRenderer';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { profilesApi } from '@/lib/api/profiles';
import { clientsApi } from '@/lib/api/clients';

const PublicProfile: React.FC = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [client, setClient] = useState<any>(null);
  const [clientPlan, setClientPlan] = useState<PlanType | undefined>();
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<AnalyticsSource>('direct');
  const [utm, setUtm] = useState<UtmParams | undefined>();

  useEffect(() => {
    // Adiciona classe para isolar o tema global (grid)
    document.body.classList.add('is-public-profile');

    async function loadData() {
      if (!slug) return;
      try {
        setLoading(true);
        const found = await profilesApi.getBySlug(slug);

        if (found) {
          setProfile(found);
          const clientData = await clientsApi.getById(found.clientId);
          setClient(clientData);
          setClientPlan(clientData?.plan);

          try {
            // Captura UTMs e origem da sessão
            const session = captureSessionOrigin(
              searchParams,
              document.referrer,
              window.location.pathname
            );
            setSource(session.source);
            setUtm(session.utm);

            // Registra o VIEW
            trackEvent({
              profileId: found.id,
              clientId: found.clientId,
              type: 'view',
              source: session.source,
              utm: session.utm,
              referrer: document.referrer,
              landingPath: window.location.pathname
            });
          } catch (analyticsError) {
            console.warn("Analytics failed, but profile will continue to load:", analyticsError);
          }
        }
      } catch (err) {
        console.error("Critical error loading profile data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    return () => {
      document.body.classList.remove('is-public-profile');
    };
  }, [slug, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-zinc-900/50 p-6 rounded-full mb-6 border border-white/5">
          <Globe className="w-12 h-12 text-zinc-500" />
        </div>
        <h1 className="text-2xl font-black italic uppercase tracking-tighter mb-2">404 - Perfil não encontrado</h1>
        <p className="text-zinc-500 mb-8 max-w-xs mx-auto text-sm font-medium">O link que você acessou pode estar expirado ou o perfil foi desativado pelo proprietário.</p>
        <Link to="/" className="bg-white text-black px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl">Voltar ao Início</Link>
      </div>
    );
  }

  return (
    <div className="relative isolate">
      <Link
        to="/c"
        target="_blank"
        className="fixed top-4 right-4 z-[9999] bg-white/10 backdrop-blur-md p-3 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-all border border-white/5 shadow-2xl"
        title="Explorar Comunidade"
      >
        <Globe size={20} />
      </Link>
      <ErrorBoundary>
        <PublicProfileRenderer
          profile={profile}
          isPreview={false}
          clientPlan={clientPlan}
          client={client}
          source={source}
          utm={utm}
        />
      </ErrorBoundary>
    </div>
  );
};

export default PublicProfile;