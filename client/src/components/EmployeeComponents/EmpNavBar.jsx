import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Globe, Handshake, ShieldUser, Bell, Landmark, LogOut } from "lucide-react";
import { useAuth } from '../../context/authContext';
import NotificationPanel from "../UserComponents/NotificationPanel";

const EmployeeNavbar = () => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { titulo: "Tarefa atribuída", mensagem: "Você recebeu uma nova tarefa de auditoria." },
    { titulo: "Sistema", mensagem: "Manutenção programada amanhã às 22h." }
  ]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const perfilLink = usuario?.tipo_usuario === 'cliente'
    ? '/user/client'
    : usuario?.tipo_usuario === 'funcionario'
      ? '/user/employee'
      : '/';

  return (
    <>
      <header className="bg-black text-white shadow-ms w-full fixed top-0 left-0 z-[50]">
        <div className="w-full mx-auto px-6 py-6 flex items-center justify-between">
          <Link to="/" className="text-5xl relative left-10" style={{ fontFamily: 'Bodoni FLF' }}> I&L </Link>

          <nav className="space-x-8 hidden md:flex gap-20" style={{ fontFamily: 'Aileron, sans-serif' }}>
            <a className="text-amber-400 flex font-bold items-center gap-2 transition relative top-1">
              <Handshake />
              Olá, {usuario?.cargo ?? 'Funcionário'} {usuario?.nome ? usuario.nome.split(' ').slice(0, 2).join(' ') : 'usuário'}
            </a>

            <Link to="/market" className="group flex relative font-bold gap-2 text-white transition hover:text-amber-400">
              <Landmark />
              <span className="relative top-1">Mercado</span>
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link to={perfilLink} className="group relative flex items-center gap-2 top-1 text-white font-bold transition hover:text-amber-400">
              <ShieldUser className="relative bottom-1" />
              <span>Meu Perfil</span>
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          <div className="relative right-10 flex items-center gap-10" style={{ fontFamily: 'Aileron, sans-serif' }}>
            <button
              onClick={handleLogout}
              className="flex gap-4 px-6 py-2 relative left-4 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-600 text-white font-bold rounded-lg transition"
            >
              <LogOut />
              Sair
            </button>

            <button
              onClick={() => setShowNotifications(true)}
              className="hover:text-amber-400 transition relative left-5"
              title="Notificações"
            >
              <div className="relative">
                <Bell className="size-7" />
                {notifications.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </div>
            </button>

            <button className="hover:text-amber-400 transition relative top-2 left-8" title="Mudar idioma">
              <Globe />
              <p className="text-sm relative right-2">PT-BR</p>
            </button>
          </div>
        </div>
      </header>

      <NotificationPanel
        show={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onRemove={(index) => {
          const newNotifs = [...notifications];
          newNotifs.splice(index, 1);
          setNotifications(newNotifs);
        }}
      />
    </>
  );
};

export default EmployeeNavbar;
