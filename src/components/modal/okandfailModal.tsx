"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  success?: boolean;
}

export default function Modal({ isOpen, onClose, title, message, success = true }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`bg-gray-900 text-white rounded-2xl p-6 w-full max-w-md shadow-2xl border 
              ${success ? "border-green-500" : "border-red-500"}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2
                className={`text-lg font-bold ${
                  success ? "text-green-400" : "text-red-400"
                }`}
              >
                {title}
              </h2>
              <button onClick={onClose} className="hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mensaje */}
            <p className="text-gray-300">{message}</p>

            {/* Botón */}
            <div className="mt-6 text-right">
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  success
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
