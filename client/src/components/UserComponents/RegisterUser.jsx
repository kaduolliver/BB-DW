import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, User } from 'lucide-react';
import FormContainer from './LoginFormComponents/FormContainer';
import InputField from './LoginFormComponents/InputField';
import PasswordField from './LoginFormComponents/PasswordField';
import PasswordCriteria from './LoginFormComponents/PasswordCriteria';
import { registerUsuario } from '../../services/auth/registerService';

export default function RegisterUser({ onToggle }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    role: 'speaker', // Palestrante como padrão
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

    // Validações locais
    if (!formData.nome || !formData.email || !formData.senha) {
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
      // O objeto formData já tem os nomes de chave exatos que o backend espera
      await registerUsuario({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        role: formData.role
      });
      
      alert("Registro realizado com sucesso!");
      setFormData({ 
        nome: '', email: '', role: 'speaker', senha: '', confirmarSenha: ''
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      onToggle(); // Retorna para a tela de login
    } catch (error) {
      setErroGeral(error.message || 'Erro ao registrar usuário.');
      console.error('Erro de registro:', error);
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

      <div className="mb-4">
        <label htmlFor="role" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Como você deseja participar?
        </label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full p-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-amber-600 outline-none transition-all"
        >
          <option value="speaker">Palestrante</option>
          <option value="curator">Curador</option>
          <option value="admin">Administrador do Evento</option>
        </select>
      </div>

      <PasswordField 
        label="Senha" 
        name="senha" 
        value={formData.senha} 
        onChange={handleChange} 
      />
      
      <PasswordField 
        label="Confirmar Senha" 
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
          exit={{ opacity: 0 }}
        >
          {erroSenha || erroGeral}
        </motion.p>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        type="submit"
        disabled={isLoading}
        className={`w-full mt-4 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-600 text-white py-2 px-4 rounded-2xl shadow-lg transition-all duration-300 font-semibold ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isLoading ? 'Cadastrando...' : 'Cadastrar'}
      </motion.button>

      <p className="text-sm mt-4 text-center text-gray-600 dark:text-gray-400">
        Já tem uma conta?{' '}
        <button
          type="button"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            onToggle();
          }}
          className="text-orange-700 hover:underline font-medium"
        >
          Fazer login
        </button>
      </p>
    </FormContainer>
  );
}