import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Public
import LandingPage from './routes/public/LandingPage';
import PublicProfile from './routes/public/PublicProfile';
import CommunityPage from './routes/public/CommunityPage';
import LoginPage from './routes/auth/LoginPage';
import RegisterPage from './routes/auth/RegisterPage';

// Admin
import AdminDashboard from './routes/admin/AdminDashboard';
import ClientsListPage from './routes/admin/ClientsListPage';
import ClientDetailPage from './routes/admin/ClientDetailPage';

// App (Client)
import ClientDashboard from './routes/app/ClientDashboard';
import ProfilesListPage from './routes/app/ProfilesListPage';
import ProfileEditorPage from './routes/app/ProfileEditorPage';
import InsightsPage from './routes/app/InsightsPage';
import CrmPage from './routes/app/CrmPage';
import SettingsPage from './routes/app/SettingsPage';
import UpgradePage from './routes/app/UpgradePage';

import ProtectedRoute from './components/common/ProtectedRoute';

const App: React.FC = () => {
  // Limpeza de dados legados do localStorage (Somente Banco de Dados)
  React.useEffect(() => {
    const legacyKeys = [
      'pageflow:v1:data',
      'pageflow:v1:events',
      'pageflow:v1:profiles',
      'pageflow:v1:style_clipboard'
    ];
    legacyKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        console.log(`Limpando dados legados: ${key}`);
        localStorage.removeItem(key);
      }
    });
  }, []);

  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/u/:slug" element={<PublicProfile />} />
          <Route path="/c" element={<CommunityPage />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/clients" element={<ClientsListPage />} />
            <Route path="/admin/clients/:clientId" element={<ClientDetailPage />} />
          </Route>

          {/* Client Routes */}
          <Route element={<ProtectedRoute allowedRoles={['client']} />}>
            <Route path="/app" element={<ClientDashboard />} />
            <Route path="/app/insights" element={<InsightsPage />} />
            <Route path="/app/crm" element={<CrmPage />} />
            <Route path="/app/profiles" element={<ProfilesListPage />} />
            <Route path="/app/profiles/:profileId/editor" element={<ProfileEditorPage />} />
            <Route path="/app/settings" element={<SettingsPage />} />
            <Route path="/app/upgrade" element={<UpgradePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;