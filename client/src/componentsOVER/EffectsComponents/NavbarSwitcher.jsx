import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import Navbar from '../GlobalComponents/Navbar';
import ClientNavbar from '../ClientComponents/ClientNavBar';
import EmpNavBar from '../EmployeeComponents/EmpNavBar';

const navbarVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
};

const NavbarSwitcher = () => {
    const { usuario } = useAuth();
    const tipoUsuario = usuario?.tipo_usuario;

    const NavbarComponent = tipoUsuario === 'cliente'
        ? ClientNavbar
        : tipoUsuario === 'funcionario'
            ? EmpNavBar
            : Navbar;

    return (
        <header className="w-full fixed top-0 left-0 z-[50]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={tipoUsuario || 'default'}
                    variants={navbarVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.8 }}
                >
                    <NavbarComponent />
                </motion.div>
            </AnimatePresence>
        </header>
    );
};


export default NavbarSwitcher;
