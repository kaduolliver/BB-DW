import { createContext, useContext, useEffect, useState } from 'react';
import { verificarSessao, logoutUsuario } from '../services/auth/loginService';
import { getMeuPerfil } from '../services/auth/profileService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const carregarSessao = async () => {
    setCarregando(true);
    try {
      const sessao = await verificarSessao();
      if (sessao.autenticado) {
        setUsuario(sessao.usuario);
      } else {
        setUsuario(null);
      }
    } catch {
      setUsuario(null);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarSessao();
  }, []);

  const logout = async () => {
    try {
      await logoutUsuario();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
    // Alterado de 'tipo' para 'role', caso você armazene a role no front-end
    localStorage.removeItem('role'); 
    setUsuario(null);
  };

  const atualizarUsuario = async (novosDados) => {
    // Se receber dados diretamente, apenas faz o merge (sem a lógica de contas bancárias)
    if (novosDados) {
      return setUsuario(prev => ({
        ...prev,
        ...novosDados
      }));
    }

    // Se não receber dados, busca o perfil atualizado na API
    try {
      const perfil = await getMeuPerfil();      
      setUsuario(perfil);                       
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, setUsuario, atualizarUsuario, carregando, logout, carregarSessao }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);