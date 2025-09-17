"use client";

import React, { useState, useEffect } from "react";
import "@/app/globals.css";
import FloatingInput from "@/components/iu/floatingInput";
import Button from "@/components/iu/button";
import { User, Users } from "lucide-react";
import Image from "next/image";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import Footer from "@/components/footer/footer";
import api from "@/services/api";
import Modal from "@/components/modal/okandfailModal";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function Register() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Estado del sidebar sincronizado con localStorage
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("sidebar-expanded");
      return stored !== "false";
    }
    return true;
  });

  // --- Modal ---
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // --- Estados para comités ---
  const [comites, setComites] = useState<{ id: number; nombre: string }[]>([]);
  const [selectedComite, setSelectedComite] = useState<{ id: number; nombre: string } | null>(null);

  // --- Estados para formulario ---
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    fk_rol: 2,
  });
  const [errorEmail, setErrorEmail] = useState("");

  // Detectar si es móvil y ajustar sidebar
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile && !mounted) {
        setSidebarOpen(true);
      }
    };
    checkMobile();
    setMounted(true);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mounted]);

  // Sincronizar sidebarExpanded con cambios de localStorage
  useEffect(() => {
    if (!mounted || isMobile) return;

    const handleStorageChange = () => {
      const stored = localStorage.getItem("sidebar-expanded");
      setSidebarExpanded(stored !== "false");
    };

    window.addEventListener('storage', handleStorageChange);

    const interval = setInterval(() => {
      const stored = localStorage.getItem("sidebar-expanded");
      const shouldBeExpanded = stored !== "false";
      setSidebarExpanded(current => current !== shouldBeExpanded ? shouldBeExpanded : current);
    }, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [mounted, isMobile]);

  // Traer comités desde API
useEffect(() => {
  const fetchComites = async () => {
    try {
      const res = await api.get("/comites"); // Ruta correcta
      // Asegúrate de que res.data es un array
      setComites(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando comités:", err);
      setComites([]); // fallback seguro
    }
  };
  fetchComites();
}, []);


  // Animación de fondo
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 200);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Validación de correo
  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Calcular el margen izquierdo dinámicamente
  const getMarginLeft = () => {
    if (isMobile) return 'ml-0';
    return sidebarExpanded ? 'ml-64' : 'ml-20';
  };

  // --- Enviar formulario ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarEmail(formData.email)) {
      setErrorEmail("Coloque un correo válido");
      return;
    }
    setErrorEmail("");

    if (!selectedComite) {
      setModalMessage("Debe seleccionar un comité ❌");
      setShowModal(true);
      return;
    }

    try {
      await api.post("/register", {
        ...formData,
        fk_comite: selectedComite.id,
      });

      setModalMessage("Usuario registrado con éxito ✅");
      setShowModal(true);

      setTimeout(() => window.location.reload(), 2000);
    } catch (err: unknown) {
      setModalMessage("Error al registrar usuario ❌");
      setShowModal(true);
      console.error("Error registrando usuario:", err);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <Header />
      </div>

      {/* Fondo animado */}
      <div
        className="fixed inset-0 transition-[background] duration-1000 ease-out opacity-30 pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(14,165,233,0.25) 0%, transparent 50%), linear-gradient(135deg, #0f172a 0%, #1e293b 80%, #0f172a 100%)`,
        }}
      />

      {/* Figuras geométricas */}
      <div className="fixed inset-0 opacity-10 pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-72 h-72 border border-cyan-500/40 rotate-45 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-52 h-52 border border-blue-500/40 rotate-12 animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-28 h-28 border-2 border-purple-500/50 rounded-full animate-spin"></div>
      </div>

      {/* Contenido principal */}
      <div className={`relative z-10 transition-all top-15 duration-300 ease-in-out ${getMarginLeft()} flex justify-center`}>
        <main className="pt-16 w-full max-w-4xl">
          <section className="relative px-4 sm:px-6 lg:px-8 flex justify-center">
            <div
              className={`w-full px-8 py-12 sm:py-16 md:py-20 bg-gray-800/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-cyan-500/20 transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              {/* Logo y título */}
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                  <Image
                    src="/images/logo.webp"
                    alt="Logo"
                    width={220}
                    height={80}
                    className="mx-auto relative z-10 transition-transform duration-500 hover:scale-110 hover:drop-shadow-2xl"
                    priority
                  />
                </div>
                <h1 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                  REGISTRAR
                </h1>
                <p className="mt-2 text-gray-400 text-sm sm:text-base">
                  Crea la cuenta para el{" "}
                  <span className="text-cyan-400 font-semibold">sistema financiero</span>.
                </p>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FloatingInput
                  placeholder="Nombre"
                  id="firstName"
                  name="nombres"
                  type="text"
                  required
                  value={formData.nombres}
                  onChange={(e) => setFormData({ ...formData, nombres: e.target.value.toUpperCase() })}
                />
                <FloatingInput
                  placeholder="Apellidos"
                  id="lastName"
                  name="apellidos"
                  type="text"
                  required
                  value={formData.apellidos}
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value.toUpperCase() })}
                />

                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <FloatingInput
                      placeholder="Correo electrónico"
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    {errorEmail && <p className="mt-1 text-red-500 text-sm">{errorEmail}</p>}
                  </div>
                  <FloatingInput
                    placeholder="Contraseña"
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                {/* Select comité */}
                <div className="relative col-span-1 md:col-span-2">
                  <div className="flex items-center gap-2 mb-2 text-gray-300 text-sm font-medium">
                    <Users className="w-4 h-4 text-cyan-400" />
                    Selecciona tu comité
                  </div>
<select
  required
  value={selectedComite?.id || ""}
  onChange={(e) => {
    const comite = comites.find((c) => c.id === Number(e.target.value));
    setSelectedComite(comite || null);
  }}
  className="w-full px-4 py-3 rounded-xl bg-gray-900/70 border border-cyan-500/40 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
>
  <option value="">-- Selecciona un comité --</option>
  {comites?.map((c) => (
    <option key={c.id} value={c.id}>
      {c.nombre}
    </option>
  ))}
</select>

                </div>

                <div className="pt-4 col-span-1 md:col-span-2">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-transparent hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 text-cyan-400 hover:text-white font-bold py-3 px-8 rounded-2xl transition-all duration-500 transform hover:scale-105 hover:shadow-2xl border-2 border-cyan-500/50"
                  >
                    Registrar <User className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </form>

            </div>
          </section>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Footer />
          </div>
        </main>

        {/* Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={modalMessage.includes("éxito") ? "Éxito" : "Error"}
          message={modalMessage}
          success={modalMessage.includes("éxito")}
        />
      </div>
    </div>
  );
}

// Exporta el componente envuelto en ProtectedRoute
export default function ProtectedRegister() {
  return (
    <ProtectedRoute allowedRoles={[1]}>
      <Register />
    </ProtectedRoute>
  );
}
