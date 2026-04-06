import { motion } from "framer-motion";

export default function TitleBar({ title, className = "" }) {
    return (
        <div className={`relative w-full h-24 bottom-10 z-20 ${className}`}>
            <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ delay: 1, duration: 2, ease: [0.76, 0, 0.24, 1] }}
                className="absolute inset-0 bg-black origin-left shadow-[0_0_30px_rgba(255,215,0,0.3)]"
            />

            <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center shadow-inner">
                <h1 className="text-white font-serif text-3xl font-semibold text-center">{title}</h1>
            </div>
        </div>
    );
}
