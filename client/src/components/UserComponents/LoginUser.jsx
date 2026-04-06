import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RegisterUser from './RegisterUser';
import FormContainer from './LoginFormComponents/FormContainer';
import InputField from './LoginFormComponents/InputField';
import PasswordField from './LoginFormComponents/PasswordField';
import { Mail } from 'lucide-react';
import { LoginUsuario } from '../../services/auth/loginService';
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import SplashScreen from '../EffectsComponents/SplashScreen';

export default function LoginAndRegister() {
  const [modo, setModo] = useState('login');
  const [formData, setFormData] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [redirectPath, setRedirectPath] = useState('');

  const { setUsuario } = useAuth();
  const navigate = useNavigate();

  const handleSplashComplete = () => {
    localStorage.removeItem('mostrandoSplash');
    if (redirectPath) {
      navigate(redirectPath);
    }
  };

  const exibirSplashERedirecionar = (resposta) => {
    // Pegamos os dados que agora vêm dentro de resposta.usuario (conforme definimos no backend)
    const dadosUsuario = resposta.usuario;

    setUsuario({
      id_usuario: dadosUsuario.id_usuario,
      nome: dadosUsuario.nome,
      email: dadosUsuario.email,
      role: dadosUsuario.role,
      id_speaker: dadosUsuario.id_speaker || null,
    });

    localStorage.setItem('usuarioId', dadosUsuario.id_usuario);
    localStorage.setItem('role', dadosUsuario.role);
    localStorage.setItem('mostrandoSplash', 'true');
    
    // Define as novas rotas do seu sistema de eventos (você pode ajustar os caminhos depois)
    let path = '';
    switch (dadosUsuario.role) {
      case 'admin':
        path = '/dashboard/admin';
        break;
      case 'curator':
        path = '/dashboard/curator';
        break;
      case 'speaker':
        path = '/dashboard/speaker';
        break;
      default:
        path = '/';
    }

    setRedirectPath(path);
    setShowSplash(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErro('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.senha) {
      setErro('Preencha E-mail e senha.');
      return;
    }

    setIsLoading(true);
    try {
      const resposta = await LoginUsuario({ email: formData.email, senha: formData.senha });
      exibirSplashERedirecionar(resposta);
      
    } catch (err) {
      setErro(err.message || 'Erro no login.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className={`relative w-full ${modo === 'registro' ? 'max-w-2xl' : 'max-w-md'}`}>
        <AnimatePresence mode="wait">
          {modo === 'login' ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
              <FormContainer
                title="Acesse sua conta"
                onSubmit={handleLoginSubmit}
                icon={<Mail className="text-amber-600" />}
              >
                <InputField
                  label="E-mail"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  icon={Mail}
                />
                
                <PasswordField
                  label="Senha"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                />
                
                <AnimatePresence>
                  {erro && (
                    <motion.p
                      className="text-red-600 text-sm font-medium mt-2"
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                    >
                      {erro}
                    </motion.p>
                  )}
                </AnimatePresence>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-600 text-white py-2 px-4 rounded-2xl shadow-lg transition-all duration-300 font-semibold"
                >
                  Entrar
                </motion.button>
                
                <p className="text-sm mt-4 text-center text-gray-600 dark:text-gray-400">
                  Não tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setModo('registro');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-orange-700 hover:underline font-medium"
                  >
                    Cadastre-se
                  </button>
                </p>
              </FormContainer>
            </motion.div>
          ) : (
            <motion.div
              key="registro"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.4 }}
            >
              <RegisterUser onToggle={() => setModo('login')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}