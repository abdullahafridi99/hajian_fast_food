import React, { createContext, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success', duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -20, transition: { duration: 0.2 } }}
              onClick={() => removeToast(toast.id)}
              className={`p-4 rounded-2xl shadow-premium border cursor-pointer flex items-start space-x-3 text-white text-xs font-bold uppercase tracking-wider ${
                toast.type === 'error'
                  ? 'bg-red-600 border-red-500'
                  : toast.type === 'warning'
                  ? 'bg-yellow-500 border-yellow-400'
                  : 'bg-green-600 border-green-500'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {toast.type === 'error' && <FiAlertCircle className="w-4 h-4 text-white" />}
                {toast.type === 'warning' && <FiAlertCircle className="w-4 h-4 text-white" />}
                {toast.type === 'success' && <FiCheckCircle className="w-4 h-4 text-white" />}
              </div>
              <div className="flex-grow font-extrabold pr-2 lowercase first-letter:uppercase text-[11px] leading-relaxed">
                {toast.message}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
