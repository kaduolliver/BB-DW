import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

export default function PublicRoute({ children }) {
  const { usuario } = useAuth();
  const splashAtivo = localStorage.getItem('mostrandoSplash') === 'true';

  if (usuario && !splashAtivo) {
    if (usuario.tipo_usuario === 'cliente') {
      return <Navigate to="/user/client" replace />;
    } else if (usuario.tipo_usuario === 'funcionario') {
      return <Navigate to="/user/employee" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
