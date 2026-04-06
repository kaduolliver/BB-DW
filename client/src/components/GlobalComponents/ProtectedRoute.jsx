import { useAuth } from '../../context/authContext';
import { Navigate } from 'react-router-dom';
import SplashScreen from '../EffectsComponents/SplashScreen';

export default function ProtectedRoute({ children, tipoPermitido = null }) {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return <SplashScreen />;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (tipoPermitido && (!usuario || usuario.tipo_usuario !== tipoPermitido)) {
    return <Navigate to="/login" replace />;
  }


  return children;
}
