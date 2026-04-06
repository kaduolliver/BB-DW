import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import SplashScreen from '../EffectsComponents/SplashScreen';

export default function ProtectedRoute({ children, rolesPermitidas = [] }) {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return <SplashScreen />;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (
    rolesPermitidas.length > 0 &&
    !rolesPermitidas.includes(usuario.role)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Rota livre para qualquer autenticado

// <ProtectedRoute>
//   <Dashboard />
// </ProtectedRoute>

// Só admin

// <ProtectedRoute rolesPermitidas={['admin']}>
//   <GestaoUsuarios />
// </ProtectedRoute>

// Admin e curator

// <ProtectedRoute rolesPermitidas={['admin', 'curator']}>
//   <PropostasPage />
// </ProtectedRoute>

// Só speaker

// <ProtectedRoute rolesPermitidas={['speaker']}>
//   <MinhaAreaSpeaker />
// </ProtectedRoute>