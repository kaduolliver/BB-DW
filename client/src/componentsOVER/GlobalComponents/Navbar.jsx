import { Link } from "react-router-dom";
import { FaLock, FaGlobe } from "react-icons/fa";

const Navbar = () => {
  return (
    <header className="bg-black text-white shadow-ms w-full top-0 left-0 z-[50]">
      <div className="w-full mx-auto px-6 py-6 flex items-center justify-between">
        {/* Logo à esquerda */}
        <Link to="/" className="text-5xl relative left-10" style={{ fontFamily: 'Bodoni FLF' }}> I&L </Link>

        {/* Navegação central */}
        <nav className="space-x-8 hidden md:flex gap-20" style={{ fontFamily: 'Aileron, sans-serif' }}>
          <Link to="/market" className="group relative text-lg text-white transition hover:text-amber-400">
            <span>Mercado</span>
            <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>

          {/* <Link to="/investimentos" className="group relative text-lg text-white transition hover:text-amber-400">
            <span>Investimentos</span>
            <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 transition-all duration-300 group-hover:w-full"></span>
          </Link> */}

          <Link to="/creditcard" className="group relative text-lg text-white transition hover:text-amber-400">
            <span>Cartões</span>
            <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>

          <Link to="/about" className="group relative text-lg text-white transition hover:text-amber-400">
            <span>Quem somos?</span>
            <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </nav>



        {/* Lado direito */}
        <div className="relative right-10 flex items-center gap-14" style={{ fontFamily: 'Aileron, sans-serif' }}>
          <Link
            to="/login"
            className="hover:text-amber-400 flex font-bold items-center gap-2 transition relative top-1"
          >
            <FaLock />
            Acessar Conta
          </Link>
          <button className="hover:text-amber-400 transition relative top-1 left-5" title="Mudar idioma">
            <FaGlobe />
            <p className="text-sm relative right-3">PT-BR</p>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;