import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FormContainer from './LoginFormComponents/FormContainer';
import InputField from './LoginFormComponents/InputField';
import PasswordField from './LoginFormComponents/PasswordField';
import { loginUsuario } from '../../services/auth/authService';
import { useAuth } from '../../context/authContext';

export default function LoginForm({ onToggle }) {
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  });
  const [erro, setErro] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { setUsuario } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErro('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.senha) {
      setErro('Preencha e-mail e senha.');
      return;
    }

    setIsLoading(true);

    try {
      const resposta = await loginUsuario({
        email: formData.email,
        senha: formData.senha,
      });

      if (resposta?.usuario) {
        setUsuario(resposta.usuario);
      }

      navigate('/dashboard', { replace: true });
    } catch (error) {
      setErro(error.message || 'Erro ao realizar login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormContainer
      title="Acesse sua conta"
      onSubmit={handleSubmit}
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
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
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
        className={`w-full mt-4 bg-gradient-to-r from-amber-600 to-orange-700 text-white py-2 px-4 rounded-2xl shadow-lg font-semibold transition-all ${
          isLoading ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Entrando...' : 'Entrar'}
      </motion.button>

      <p className="text-sm mt-4 text-center text-gray-600 dark:text-gray-400">
        Não tem uma conta?{' '}
        <button
          type="button"
          onClick={onToggle}
          className="text-orange-700 hover:underline font-medium"
        >
          Cadastre-se
        </button>
      </p>
    </FormContainer>
  );
}