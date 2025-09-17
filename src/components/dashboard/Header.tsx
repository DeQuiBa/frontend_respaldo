"use client";

import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface UserData {
  id: number;
  nombre: string;
  rol: string;
  rolId: number;
  correo: string;
}

export default function DashboardNavbar() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login");
  };

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-gray-900/70 backdrop-blur-xl border-b border-cyan-500/20 shadow-[0_0_15px_rgba(0,255,255,0.3)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo a la izquierda */}
          <span className="text-lg font-bold text-cyan-400 truncate"></span>

          {/* Menú Desktop */}
          <div className="hidden sm:flex items-center gap-4">
            {user && (
              <span className="text-sm font-semibold text-cyan-400 truncate max-w-[150px]">
                👤 {user.nombre}
              </span>
            )}
            <Link
              href="/dashboard/perfilAdmin"
              className="text-sm font-semibold text-gray-300 hover:text-cyan-300 transition truncate max-w-[100px]"
            >
              Perfil
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all text-white"
            >
              <LogOut size={16} />
              <span className="truncate">Cerrar sesión</span>
            </button>
          </div>

          {/* Botón Menú Hamburguesa Móvil a la derecha */}
          <div className="sm:hidden flex items-center justify-end flex-1">
            <button
              className="p-2 rounded-md text-cyan-400 hover:bg-gray-800 transition ml-auto"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil */}
      <div
        className={`sm:hidden fixed inset-x-0 top-16 bg-gray-900/95 backdrop-blur-md px-4 py-4 border-t border-cyan-500/20 transform transition-transform duration-300 ${
          menuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col space-y-3">
          {user && (
            <span className="text-sm font-semibold text-cyan-400 truncate max-w-full">
              👤 {user.nombre}
            </span>
          )}
          <Link
            href="/dashboard/perfilAdmin"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-300 hover:text-cyan-300 hover:bg-gray-800/60 transition truncate"
          >
            Perfil
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all text-white"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
