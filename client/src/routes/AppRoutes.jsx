import { Routes, Route, Navigate } from 'react-router-dom';
import PublicRoute from '../components/GlobalComponents/PublicRoute';
import ProtectedRoute from '../components/GlobalComponents/ProtectedRoute';
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthPage from '../pages/auth/AuthPage';
import Dashboard from '../pages/dashboard/Dashboard';
import TracksPage from '../pages/tracks/TracksPage';
import StagesPage from '../pages/stages/StagesPage';
import SpeakersPage from '../pages/speakers/SpeakersPage';
import ProposalsPage from '../pages/proposals/ProposalsPage';
import SessionsPage from '../pages/sessions/SessionsPage';
import SchedulePage from '../pages/schedule/SchedulePage';
import ConflictsPage from '../pages/conflicts/ConflictsPage';
import ProfilePage from '../pages/profile/ProfilePage';
import AccessDenied from '../pages/errors/AccessDenied';
import NotFound from '../pages/errors/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route element={<PublicLayout />}>
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />

        {/* Compatibilidade com rota antiga */}
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/register" element={<Navigate to="/auth" replace />} />
      </Route>

      {/* Rotas privadas */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/perfil" element={<ProfilePage />} />

        <Route
          path="/trilhas"
          element={
            <ProtectedRoute rolesPermitidas={['admin', 'curator']}>
              <TracksPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/palcos"
          element={
            <ProtectedRoute rolesPermitidas={['admin']}>
              <StagesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/speakers"
          element={
            <ProtectedRoute rolesPermitidas={['admin', 'curator']}>
              <SpeakersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/propostas"
          element={
            <ProtectedRoute rolesPermitidas={['admin', 'curator', 'speaker']}>
              <ProposalsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sessoes"
          element={
            <ProtectedRoute rolesPermitidas={['admin', 'curator']}>
              <SessionsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/grade"
          element={
            <ProtectedRoute rolesPermitidas={['admin', 'curator', 'speaker']}>
              <SchedulePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/conflitos"
          element={
            <ProtectedRoute rolesPermitidas={['admin', 'curator']}>
              <ConflictsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/acesso-negado" element={<AccessDenied />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}