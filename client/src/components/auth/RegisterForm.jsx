import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, User } from 'lucide-react';
import FormContainer from './LoginFormComponents/FormContainer';
import InputField from './LoginFormComponents/InputField';
import PasswordField from './LoginFormComponents/PasswordField';
import PasswordCriteria from './LoginFormComponents/PasswordCriteria';
import { registrarUsuario } from '../../services/auth/authService';

export default function RegisterForm({ onToggle }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });

  const [erroSenha, setErroSenha] = useState('');
  const [erroGeral, setErroGeral] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const passwordCriteria = {
    comprimento: {
      label: 'Mínimo de 8 caracteres',
      test: (s) => s.length >= 8,
    },
    maiuscula: {
      label: 'Letra maiúscula (A-Z)',
      test: (s) => /[A-Z]/.test(s),
    },
    minuscula: {
      label: 'Letra minúscula (a-z)',
      test: (s) => /[a-z]/.test(s),
    },
    numero: {
      label: 'Número (0-9)',
      test: (s) => /[0-9]/.test(s),
    },
    especial: {
      label: 'Caractere especial (!@#$...)',
      test: (s) => /[!@#$%^&*(),.?":{}|<>]/.test(s),
    },
  };

  const isSenhaValida = () =>
    Object.values(passwordCriteria).every((crit) => crit.test(formData.senha));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErroSenha('');
    setErroGeral('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome || !formData.email || !formData.senha || !formData.confirmarSenha) {
      setErroGeral('Preencha todos os campos obrigatórios.');
      return;
    }

    if (!isSenhaValida()) {
      setErroSenha('A senha não atende aos critérios obrigatórios.');
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setErroSenha('As senhas não coincidem.');
      return;
    }

    setErroSenha('');
    setErroGeral('');
    setIsLoading(true);

    try {
      await registrarUsuario({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
      });

      setFormData({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: '',
      });

      onToggle();
    } catch (error) {
      setErroGeral(error.message || 'Erro ao registrar usuário.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormContainer
      onSubmit={handleSubmit}
      title="Crie sua conta"
      icon={<UserPlus className="text-amber-600" />}
    >
      <InputField
        label="Nome completo"
        name="nome"
        value={formData.nome}
        onChange={handleChange}
        icon={User}
      />

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

      <PasswordField
        label="Confirmar senha"
        name="confirmarSenha"
        value={formData.confirmarSenha}
        onChange={handleChange}
      />

      <PasswordCriteria senha={formData.senha} criteria={passwordCriteria} />

      {(erroSenha || erroGeral) && (
        <motion.p
          className="text-red-600 text-sm font-medium mt-2"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {erroSenha || erroGeral}
        </motion.p>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        type="submit"
        disabled={isLoading}
        className={`w-full mt-4 bg-gradient-to-r from-amber-600 to-orange-700 text-white py-2 px-4 rounded-2xl shadow-lg font-semibold transition-all ${
          isLoading ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Cadastrando...' : 'Cadastrar'}
      </motion.button>

      <p className="text-sm mt-4 text-center text-gray-600 dark:text-gray-400">
        Já tem uma conta?{' '}
        <button
          type="button"
          onClick={onToggle}
          className="text-orange-700 hover:underline font-medium"
        >
          Fazer login
        </button>
      </p>
    </FormContainer>
  );
}