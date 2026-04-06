import LogoBar from "../EffectsComponents/LogoBar";
import {
    FaYoutube,
    FaInstagram,
    FaTelegram,
    FaXTwitter,
    FaFacebookF,
    FaTiktok,
    FaReddit,
} from "react-icons/fa6";

const FooterLink = ({ href, children }) => (
    <a href={href} className="hover:text-amber-400 transition">
        {children}
    </a>
);

const Footer = () => {
    return (
        <>
        <LogoBar />
        <footer className="bg-black text-white py-7">
            <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between gap-12">
                {/* Social */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-400 mb-4">Acompanhe:</h3>
                    <div className="flex flex-col text-2xl gap-2">
                        <div className="flex gap-4 pb-2 text-2xl">
                            <FaYoutube className="hover:text-red-600 hover:scale-110 hover:drop-shadow-lg transform transition duration-300 cursor-pointer" />
                            <FaInstagram className="hover:text-pink-500 hover:scale-110 hover:drop-shadow-lg transform transition duration-300 cursor-pointer" />
                            <FaTelegram className="hover:text-cyan-400 hover:scale-110 hover:drop-shadow-lg transform transition duration-300 cursor-pointer" />
                            <FaXTwitter className="hover:text-slate-800 hover:scale-110 hover:drop-shadow-lg transform transition duration-300 cursor-pointer" />
                        </div>
                        <div className="flex gap-4 text-2xl">
                            <FaFacebookF className="hover:text-sky-600 hover:scale-110 hover:drop-shadow-lg transform transition duration-300 cursor-pointer" />
                            <FaTiktok className="hover:scale-110 hover:drop-shadow-lg transform transition duration-300 cursor-pointer" />
                            <FaReddit className="hover:text-orange-600 hover:scale-110 hover:drop-shadow-lg transform transition duration-300 cursor-pointer" />
                        </div>
                    </div>
                </div>

                {/* Sobre nós */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-400 mb-4">Sobre nós</h3>
                    <ul className="space-y-2 text-sm">
                        <li><FooterLink href="/about">Quem Somos</FooterLink></li>
                        <li><FooterLink href="#">Anúncios</FooterLink></li>
                        <li><FooterLink href="#">Jurídico</FooterLink></li>
                        <li><FooterLink href="#">Termos</FooterLink></li>
                        <li><FooterLink href="#">Privacidade</FooterLink></li>
                        <li><FooterLink href="#">Alertas</FooterLink></li>
                        <li><FooterLink href="#">Blog</FooterLink></li>
                        <li><FooterLink href="#">Comunidade</FooterLink></li>
                    </ul>
                </div>

                {/* Criptomoedas */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-400 mb-4">Criptomoedas</h3>
                    <ul className="space-y-2 text-sm">
                        <li><FooterLink href="#">Taxa</FooterLink></li>
                        <li><FooterLink href="#">NFT</FooterLink></li>
                        <li><FooterLink href="#">Cripto</FooterLink></li>
                        <li><FooterLink href="#">Pesquisa</FooterLink></li>
                        <li><FooterLink href="#">Exchange</FooterLink></li>
                        <li><FooterLink href="#">Mercado</FooterLink></li>
                    </ul>
                </div>

                {/* Serviços */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-400 mb-4">Serviços</h3>
                    <ul className="space-y-2 text-sm">
                        <li><FooterLink href="/creditcard">Cartões</FooterLink></li>
                        <li><FooterLink href="#">Gráficos</FooterLink></li>
                        <li><FooterLink href="#">Empréstimo</FooterLink></li>
                        <li><FooterLink href="#">Trading</FooterLink></li>
                        <li><FooterLink href="#">Investimentos</FooterLink></li>
                    </ul>
                </div>

                {/* Suporte */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-400 mb-4">Suporte</h3>
                    <ul className="space-y-2 text-sm">
                        <li><FooterLink href="#">Suporte ao Cliente</FooterLink></li>
                        <li><FooterLink href="#">Central de Suporte</FooterLink></li>
                        <li><FooterLink href="#">Regras</FooterLink></li>
                    </ul>
                </div>
            </div>

            {/* Copyright */}
            <div className="mt-12 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
                Infinity & Legacy Group © 2025 | Todos os direitos reservados.
            </div>
        </footer>
        </>
    );
};

export default Footer;
