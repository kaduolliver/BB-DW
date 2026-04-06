import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const NotificationPanel = ({ show, onClose, notifications, onRemove }) => {
  return (
    <>
      {/* Painel lateral */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: show ? 0 : '100%' }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed top-0 right-0 h-full w-80 bg-opacity-60 bg-black shadow-lg z-[60]"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-300 bg-black text-white">
          <h2 className="text-lg font-bold">Notificações</h2>
          <button onClick={onClose}>
            <X className="text-white" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-full space-y-4">
          {notifications.length === 0 ? (
            <p className="text-gray-600 text-sm text-center mt-8">Sem notificações no momento.</p>
          ) : (
            <AnimatePresence>
              {notifications.map((notificacao, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.03, boxShadow: '0 0 12px rgba(0,0,0,0.2)' }}
                  className="bg-amber-200 border-4 border-amber-700 rounded-lg p-4 shadow-sm relative cursor-pointer"
                >
                  <button
                    onClick={() => onRemove(index)}
                    className="absolute top-2 right-2 text-amber-600 hover:text-red-600"
                  >
                    <X size={16} className="text-red-700 font-bold" />
                  </button>
                  <h3 className="font-semibold text-amber-800">{notificacao.titulo}</h3>
                  <p className="text-sm text-amber-900">{notificacao.mensagem}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* Fundo escuro clicável */}
      {show && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-[55]"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default NotificationPanel;
