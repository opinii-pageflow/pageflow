import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

// Public
import LandingPage from './routes/public/LandingPage';
import PublicProfile from './routes/public/PublicProfile';
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
import SettingsPage from './routes/app/SettingsPage';
import UpgradePage from './routes/app/UpgradePage';

import ProtectedRoute from './components/common/ProtectedRoute';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/u/:slug" element={<PublicProfile />} />

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
          <Route path="/app/profiles" element={<ProfilesListPage />} />
          <Route path="/app/profiles/:profileId/editor" element={<ProfileEditorPage />} />
          <Route path="/app/settings" element={<SettingsPage />} />
          <Route path="/app/upgrade" element={<UpgradePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;