"use client";
import { X } from "lucide-react";
import { useState } from "react";

interface EncargadoModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit?: (email: string, password: string) => void;
}

export default function EncargadoModal({
  show,
  onClose,
  onSubmit,
}: EncargadoModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!show) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onSubmit?.(email, password);
      onClose();
    } else {
      alert("Completa los campos.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[9999] backdrop-blur-sm">
      <div
        className={`
          relative bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30
          p-8 rounded-2xl shadow-[0_0_25px_rgba(0,255,255,0.25)]
          w-[95%] sm:w-96 text-center animate-fadeIn
        `}
      >
        {/* Glow decorativo detrás */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-2xl" />

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white hover:scale-110 transition-transform"
        >
          <X size={22} />
        </button>

        {/* Título */}
        <h2 className="text-2xl font-extrabold text-white tracking-wide drop-shadow mb-2">
          ¿ERES UN ENCARGADO?
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Ingresa con tus credenciales para{" "}
          <span className="text-cyan-400 font-semibold">registrar</span>.
        </p>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Correo | ejemplo@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-xl bg-gray-800/70 border border-cyan-500/40 text-white 
              focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-500 
              transition-all"
          />
          <input
            type="password"
            placeholder="Contraseña | °°°°°°°"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 rounded-xl bg-gray-800/70 border border-blue-500/40 text-white 
              focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-500 
              transition-all"
          />

          <button
            type="submit"
            className="bg-gradient-to-r from-cyan-600 to-blue-600 
              text-white font-bold py-3 rounded-xl mt-2
              hover:scale-105 hover:shadow-[0_0_20px_rgba(0,200,255,0.4)] 
              transition-transform"
          >
            Ingresar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 text-sm text-gray-400 hover:text-white hover:underline transition-colors"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}
