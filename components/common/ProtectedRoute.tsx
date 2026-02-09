
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { UserRole } from '../../types';
import { getCurrentUser, getStorage } from '../../lib/storage';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/app'} replace />;
  }

  // If client, check if active
  if (user.role === 'client' && user.clientId) {
    const data = getStorage();
    const client = data.clients.find(c => c.id === user.clientId);
    if (!client?.isActive) {
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Conta Bloqueada</h1>
          <p className="text-gray-400 mb-8">Sua conta foi desativada pelo administrador. Entre em contato com o suporte.</p>
          <button onClick={() => window.location.href = '/#/login'} className="text-blue-500 hover:underline">Sair e Logar</button>
        </div>
      );
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
