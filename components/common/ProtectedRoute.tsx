
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { UserRole } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, loading: authLoading } = useAuth();
  const [clientActive, setClientActive] = React.useState<boolean | null>(null);
  const [checkingClient, setCheckingClient] = React.useState(false);

  React.useEffect(() => {
    async function checkClientStatus() {
      if (user?.role === 'client' && user.clientId) {
        setCheckingClient(true);
        try {
          const { data } = await supabase
            .from('clients')
            .select('is_active')
            .eq('id', user.clientId)
            .maybeSingle();

          setClientActive(data ? (data as any).is_active !== false : true);
        } catch (err) {
          setClientActive(true);
        } finally {
          setCheckingClient(false);
        }
      } else {
        setClientActive(true);
        setCheckingClient(false);
      }
    }

    // Timeout de segurança: nunca ficar mais de 5s checando status de cliente
    const safetyTimer = setTimeout(() => {
      setCheckingClient(false);
      if (clientActive === null) setClientActive(true);
    }, 5000);

    if (user && !authLoading) checkClientStatus();

    return () => clearTimeout(safetyTimer);
  }, [user, authLoading]);

  if (authLoading || (user === undefined && checkingClient)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/20 border-t-neon-blue rounded-full animate-spin"></div>
      </div>
    );
  }

  // Se user for null após loading, verifica se há token no storage antes de chutar
  if (!user && !authLoading) {
    const hasSession = localStorage.getItem('sb-fdihrngybdmppuomjgcn-auth-token'); // Project Ref from logs
    if (hasSession) {
      // Ainda pode estar recuperando sessão ou falhou silenciosamente
      // Vamos dar uma chance ou mostrar loading
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-white/20 border-t-neon-blue rounded-full animate-spin"></div>
        </div>
      );
    }

    console.log(`[ProtectedRoute] Redirecionando para /login - user:`, user, "loading:", authLoading);
    return <Navigate to="/login" replace />;
  }

  // Admin tem passe livre para todas as rotas protegidas
  const hasAccess = allowedRoles.includes(user.role) || user.role === 'admin';

  if (!hasAccess) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/app'} replace />;
  }

  if (user.role === 'client' && clientActive === false) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Conta Bloqueada</h1>
        <p className="text-gray-400 mb-8">Sua conta foi desativada pelo administrador. Entre em contato com o suporte.</p>
        <button onClick={() => window.location.href = '/#/login'} className="text-blue-500 hover:underline">Sair e Logar</button>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
