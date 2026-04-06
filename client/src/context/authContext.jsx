import { createContext, useContext, useEffect, useState } from 'react';
import { verificarSessao, logoutUsuario } from '../services/auth/authService';
import { getMeuPerfil } from '../services/user/userService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const carregarSessao = async () => {
    setCarregando(true);

    try {
      const sessao = await verificarSessao();

      if (sessao?.autenticado) {
        setUsuario(sessao.usuario);
      } else {
        setUsuario(null);
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      setUsuario(null);
    } finally {
      setCarregando(false);
    }
  };

  const recarregarUsuario = async () => {
    try {
      const perfil = await getMeuPerfil();
      setUsuario(perfil);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    }
  };

  const atualizarUsuarioLocal = (novosDados) => {
    setUsuario((prevUsuario) => ({
      ...prevUsuario,
      ...novosDados,
    }));
  };

  const logout = async () => {
    try {
      await logoutUsuario();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setUsuario(null);
    }
  };

  useEffect(() => {
    carregarSessao();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        carregando,
        setUsuario,
        carregarSessao,
        recarregarUsuario,
        atualizarUsuarioLocal,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}