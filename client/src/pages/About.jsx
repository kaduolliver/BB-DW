import ScreenOverlay from "../components/EffectsComponents/ScreenOverlay";
import AnimatedCounter from "../components/EffectsComponents/AnimatedCounter";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import InitialsBar from "../components/EffectsComponents/InitialsBar";
import Navbar from "../components/GlobalComponents/Navbar";


export default function Home() {
    const linesRef = useRef(null);
    const isInView = useInView(linesRef, { once: true, margin: "-100px" });

    return (
        <>
            <ScreenOverlay />
            <Navbar />
            <div
                className="pt-20 min-h-screen bg-cover bg-center bg-black flex items-center justify-center animate-fade-in delay-[500ms]"
                style={{ backgroundImage: "url('/images/bg-img.jpg')" }}>
                <div class="relative right-80 animate-fade-in-up">
                    <img src="/images/I&L-logo.webp" alt="logo" className="w-56 h-auto"></img>
                    <h1 className="text-8xl text-white font-bold text-left pb-6" style={{ fontFamily: 'Bodoni FLF' }}>Infinity & <br />Legacy Group</h1>
                    <h1 className="text-xl text-[#9b9b9b] font-bold text-left typing-effect" style={{ fontFamily: 'Aileron, sans-serif' }}>"Investindo no amanhã, honrando o ontem."</h1>
                </div>
            </div>
            <InitialsBar />
            <div className="pt-20 bg-cover bg-center bg-black animate-fade-in delay-[500ms] min-h-screen"
                style={{ backgroundImage: "url('/images/building-bg-about.jpg')" }}>
                <div className="flex flex-col items-center justify-center text-center p-10">
                    <div className="bg-black p-12 rounded-2xl">
                        <div className="text-3xl relative font-bold right-[540px] bottom- text-amber-500"><p>*</p></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center text-white">
                            <div>
                                <AnimatedCounter target={1200} suffix="M" />
                                <p className="mt-2 text-lg font-bold">Ativos sob gestão (AUM)</p>
                            </div>
                            <div>
                                <AnimatedCounter target={47.3} suffix="M" />
                                <p className="mt-2 text-lg font-bold">Volume diário de transações (Infinity)</p>
                            </div>
                            <div>
                                <AnimatedCounter target={320} suffix="M" />
                                <p className="mt-2 text-lg font-bold">Volume mensal de transações (Legacy)</p>
                            </div>
                        </div>
                        <div className="text-base relative top-8 text-amber-500"><p>* Valores fictícios.</p></div>
                    </div>
                </div>
                <div className="relative z-10 flex min-h-screen">
                    <div className="bg-gradient-to-t from-black via-gray-900 to-transparent flex flex-col justify-center pl-16">
                        <div className="text-2xl relative space-y-2 justify-center text-center bottom-56">
                            <div ref={linesRef} className="relative space-y-2"></div>
                            {/* Linha 1 */}
                            <div className="relative inline-block">
                                <motion.div
                                    initial={{ scaleX: 0 }}
                                    animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                                    transition={{ duration: 1, delay: 0.3, ease: [0.42, 0, 0.58, 1] }}
                                    className="absolute inset-0 bg-white rounded shadow-sm origin-top z-0"
                                />
                                <span className="relative z-10 text-black p-1 inline-block">
                                    Na Infinity & Legacy Group, unimos o melhor do futuro financeiro com a solidez do presente. Somos uma
                                </span>
                            </div>

                            {/* Linha 2 */}
                            <div className="relative inline-block">
                                <motion.div
                                    initial={{ scaleX: 0 }}
                                    animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                                    transition={{ duration: 1, delay: 0.8, ease: [0.42, 0, 0.58, 1] }}
                                    className="absolute inset-0 bg-white rounded shadow-sm origin-top z-0"
                                />
                                <span className="relative z-10 text-black p-1 inline-block">
                                    empresa tecnológica e financeira que nasceu com um propósito claro: transformar a experiência bancária
                                </span>
                            </div>

                            <div className="relative inline-block">
                                <motion.div
                                    initial={{ scaleX: 0 }}
                                    animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                                    transition={{ duration: 1, delay: 1, ease: [0.42, 0, 0.58, 1] }}
                                    className="absolute inset-0 bg-white rounded shadow-sm origin-top z-0"
                                />
                                <span className="relative z-10 text-black p-1 inline-block">
                                    tradicional e o acesso ao mercado de criptomoedas em algo moderno, seguro e acessível para todos.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}