"use client";

import Link from "next/link";
import Image from "next/image";
import { LogOut } from "lucide-react";
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
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
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
        <div className="grid grid-cols-3 items-center h-16">
          {/* Logo */}
          <div className="flex justify-start">
            <Link
              href="/"
              className="flex items-center gap-3 group hover:scale-105 transition-transform"
            >
              <div className="relative w-10 h-10">
                <Image
                  src="/images/logo.webp"
                  alt="Logo Clínica Dental"
                  fill
                  className="rounded-lg object-contain drop-shadow-[0_0_12px_rgba(0,255,255,0.6)]"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-cyan-400 group-hover:text-cyan-300 tracking-wider">
                  SISGEFI-DK
                </span>
                <span className="text-xs text-gray-400 hidden sm:block">
                  Dashboard
                </span>
              </div>
            </Link>
          </div>

          {/* Centro (opcional links internos del dashboard) */}
          <nav className="hidden lg:flex items-center justify-center">
            <div className="flex items-center space-x-8">
              <Link
                href="/dashboard/home"
                className={`text-sm font-semibold transition-all duration-300 ${
                  pathname?.startsWith("/dashboard/home")
                    ? "text-cyan-400"
                    : "text-gray-300 hover:text-cyan-300"
                }`}
              >
                Inicio
              </Link>
              <Link
                href="/dashboard/perfil"
                className={`text-sm font-semibold transition-all duration-300 ${
                  pathname?.startsWith("/dashboard/perfil")
                    ? "text-cyan-400"
                    : "text-gray-300 hover:text-cyan-300"
                }`}
              >
                Perfil
              </Link>
            </div>
          </nav>

          {/* Usuario y Logout */}
          <div className="flex justify-end items-center gap-4">
            {user && (
              <span className="text-sm font-semibold text-cyan-400">
                👤 {user.nombre}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all text-white"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
