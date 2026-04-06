import ScreenOverlay from "../components/EffectsComponents/ScreenOverlay";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TitleBar from "../components/EffectsComponents/TitleBar";
import NavbarSwitcher from "../components/EffectsComponents/NavBarSwitcher";
import { useAuth } from '../context/authContext';

const CreditCard = () => {
    const [expandedId, setExpandedId] = useState(null);
    const [selectedId, setSelectedId] = useState(null);

    const { usuario, isLoadingAuth } = useAuth();
    const tipoUsuario = usuario?.tipo_usuario;

    const cards = [
        {
            id: 1,
            title: "Infinity Card",
            image: "/images/Infinity-CreditCard.png",
            description:
                "O Infinity Card é pensado para quem está imerso no universo das criptomoedas.",
            cardDescription:
                "Ele oferece integração direta com carteiras digitais e plataformas blockchain, permitindo transações rápidas, seguras e globais com criptoativos. Com tecnologia de ponta, o Infinity Card traz suporte para stablecoins, conversão automática em tempo real e acesso a benefícios exclusivos no ecossistema Web3 — incluindo cashback em tokens, acesso a eventos do mercado cripto e monitoramento de mercado ao vivo direto pelo aplicativo.",
        },
        {
            id: 2,
            title: "Legacy Card",
            image: "/images/Legacy-CreditCard.png",
            description:
                "O Legacy Card é ideal para quem prefere transações financeiras tradicionais, oferecendo operações seguras e confiáveis.",
            cardDescription:
                "A escolha ideal para compras físicas e online, transferências bancárias, saques em caixas eletrônicos e gestão de finanças do dia a dia. Ele oferece suporte completo aos principais bancos, compatibilidade com carteiras digitais, programa de pontos, atendimento personalizado e benefícios premium — tudo com a solidez das instituições financeiras tradicionais.",
        },
    ];

    function toggleExpand(id) {
        setExpandedId(expandedId === id ? null : id);
    }

    const selectedCard = cards.find((card) => card.id === selectedId);

    if (isLoadingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-white text-xl">Carregando informações do usuário...</p>
            </div>
        );
    }

    return (
        <>
            <ScreenOverlay />

            <section
                className="relative min-h-[100vh] bg-cover bg-fixed bg-center bg-black pt-48 pb-24 animate-fade-in delay-[500ms]"
                style={{ backgroundImage: "url('/images/Legacy-Credit-Card-bg-2.png')" }}
            >
                <NavbarSwitcher />
                <TitleBar title="Seja membro Infinity & Legacy" className="z-30" />
                <div className="flex items-center justify-center w-full p-6">
                    <div className="grid grid-cols-2 gap-6">
                        {cards.map((card) => {
                            const isExpanded = expandedId === card.id;

                            return (
                                <motion.div
                                    layout
                                    layoutId={`card-${card.id}`}
                                    key={card.id}
                                    className="bg-black rounded-xl shadow-md p-4 hover:shadow-xl w-96 cursor-pointer flex flex-col"
                                    onClick={() => toggleExpand(card.id)}
                                    initial={false}
                                    whileHover={{
                                        scale: 1.00,
                                        boxShadow: "0 0 15px 3px rgba(255, 215, 0, 0.6)",
                                        y: -8,
                                    }}
                                    animate={{
                                        maxHeight: isExpanded ? 600 : 320,
                                        overflow: "hidden",
                                    }}
                                    transition={{
                                        scale: { duration: 0.3, ease: "easeOut" },
                                        y: { duration: 0.3, ease: "easeOut" },
                                        boxShadow: { duration: 0.3, ease: "easeOut" },
                                        maxHeight: { duration: 0.7, ease: "easeInOut" },
                                    }}
                                >
                                    <motion.img
                                        layoutId={`image-${card.id}`}
                                        src={card.image}
                                        className="rounded-lg mb-4"
                                        alt={card.title}
                                    />
                                    <motion.h2
                                        layoutId={`title-${card.id}`}
                                        className="text-lg p-6 font-serif font-semibold
             bg-gradient-to-r from-[#e0e0e0] via-white to-[#c0c0c0]
             bg-clip-text text-transparent drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]"
                                    >
                                        {card.title}
                                    </motion.h2>

                                    <motion.p
                                        initial={false}
                                        animate={{
                                            opacity: isExpanded ? 1 : 0,
                                            marginTop: isExpanded ? 12 : 0,
                                            height: isExpanded ? "auto" : 0,
                                        }}
                                        transition={{ duration: 0.3 }}
                                        className="text-gray-300 overflow-hidden px-6 relative bottom-5"
                                    >
                                        {card.description}
                                    </motion.p>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.96 }}
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedId(card.id);
                                        }}
                                        className="relative left-24 w-40 cursor-pointer justify-center items-center bg-gradient-to-r from-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-600 text-white py-2 px-4 rounded-2xl shadow-lg transition-all duration-300 font-semibold mt-4"
                                    >
                                        Detalhes
                                    </motion.button>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                <AnimatePresence>
                    {selectedCard && (
                        <motion.div
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
                            onClick={() => setSelectedId(null)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="bg-black rounded-xl shadow-lg p-6 w-full max-w-md"
                                layoutId={`card-${selectedCard.id}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <motion.img
                                    layoutId={`image-${selectedCard.id}`}
                                    src={selectedCard.image}
                                    className="rounded-lg w-full"
                                    alt={selectedCard.title}
                                />
                                <motion.h2 layoutId={`title-${selectedCard.id}`} className="text-2xl font-bold">
                                    {selectedCard.title}
                                </motion.h2>
                                <p className="text-gray-300 mb-4 text-base">
                                    <strong className="text-white">{selectedCard.title}</strong><br />{selectedCard.cardDescription}
                                </p>
                                <button
                                    onClick={() => setSelectedId(null)}
                                    className="mt-4 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded hover:from-orange-700 hover:to-amber-600 transition"
                                >
                                    Fechar
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </>
    );
};

export default CreditCard;