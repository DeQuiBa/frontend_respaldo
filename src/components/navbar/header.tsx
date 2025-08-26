"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, UserCheck, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import EncargadoModal from "@/components/modal/registrarModal";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen || showRegisterModal ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen, showRegisterModal]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [{ href: "/", label: "Inicio" }];

  const isActiveLink = (href: string) => {
    if (!pathname) return false;
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  };

  const handleRegisterSubmit = (email: string, password: string) => {
    alert(`Registrado con éxito: ${email} con clave: ${password}`);
  };

  return (
    <>
      {/* Header */}
      <header
        className={`fixed w-full top-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-gray-900/70 backdrop-blur-xl border-b border-cyan-500/20 shadow-[0_0_15px_rgba(0,255,255,0.3)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-3 items-center h-16">
            {/* Logo */}
            <div className="flex justify-start col-span-1">
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
                    Pantalla Principal
                  </span>
                </div>
              </Link>
            </div>

            {/* Links Desktop */}
            <nav className="hidden lg:flex items-center justify-center col-span-1">
              <div className="flex items-center space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative text-sm font-semibold tracking-wide transition-all duration-300 ${
                      isActiveLink(link.href)
                        ? "text-cyan-400"
                        : "text-gray-300 hover:text-cyan-300"
                    }`}
                  >
                    {link.label}
                    {isActiveLink(link.href) && (
                      <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-cyan-400 rounded-full" />
                    )}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Botones derecha */}
            <div className="flex justify-end col-span-1">
              <div className="hidden lg:flex items-center space-x-3">
                <Link
                  href="/login"
                  className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-blue-500 hover:to-cyan-400 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-[0_0_12px_rgba(0,255,255,0.4)] transition-all"
                >
                  <UserCheck size={16} />
                  Logearse
                </Link>
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="flex items-center gap-2 border border-cyan-400 text-cyan-400 hover:bg-cyan-500 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                >
                  <UserPlus size={16} />
                  Registrar
                </button>
              </div>

              {/* Botón menú móvil */}
              <button
                onClick={toggleMenu}
                className="lg:hidden p-2 ml-2 text-cyan-400 hover:text-white hover:bg-cyan-500/10 rounded-lg transition-all relative z-50"
                aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        <div
          className={`lg:hidden transition-all duration-500 ease-in-out overflow-hidden z-40 relative ${
            isMenuOpen ? "max-h-screen opacity-100 bg-gray-900/90 backdrop-blur-lg" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="px-6 py-6 flex flex-col items-center gap-4 text-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`w-full block text-lg font-semibold tracking-wide rounded-lg py-3 transition-colors ${
                  isActiveLink(link.href)
                    ? "text-cyan-400"
                    : "text-gray-300 hover:text-cyan-300"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="w-full flex flex-col items-center gap-3 pt-6 border-t border-cyan-500/20">
              <Link
                href="/login"
                className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-blue-400 hover:to-cyan-400 text-white px-5 py-3 rounded-xl font-semibold shadow-[0_0_12px_rgba(0,255,255,0.4)]"
              >
                <UserCheck size={18} />
                Logearse
              </Link>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="w-full flex justify-center items-center gap-2 border border-cyan-400 text-cyan-400 hover:bg-cyan-500 hover:text-white px-5 py-3 rounded-xl font-semibold transition-all"
              >
                <UserPlus size={18} />
                Registrar
              </button>
            </div>
          </nav>
        </div>


        {/* Fondo oscuro detrás del menú */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={toggleMenu}
          />
        )}
      </header>

      {/* Modal */}
      <EncargadoModal
        show={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSubmit={handleRegisterSubmit}
      />
    </>
  );
}
