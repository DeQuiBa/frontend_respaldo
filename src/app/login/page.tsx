"use client";

import FloatingInput from "@/components/iu/floatingInput";
import Button from "@/components/iu/button";
import Image from "next/image";
import "@/app/globals.css";
import Link from "next/link";
import Header from "@/components/navbar/header";
import { useState, useEffect } from "react";
import Footer from "@/components/footer/footer";
import api from "@/services/api";
import { useRouter } from "next/navigation";
import axios from "axios"; // para usar axios.isAxiosError

// 🔹 Tipado de la respuesta del login
interface LoginResponse {
  user: {
    id: number;
    nombre: string;
    rol: string;
    rolId: number;
    correo: string;
  };
  token: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true); // nuevo estado
  const router = useRouter();

  // 🔹 Verificar si el usuario ya está logeado
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        if (user.rolId === 1) {
          router.replace("/dashboard/admin");
          return;
        } else if (user.rolId === 2) {
          router.replace("/dashboard/user");
          return;
        } else {
          router.replace("/login"); // fallback
          return;
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setCheckingAuth(false); // ya verificamos, mostrar login
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      const { user, token } = res.data;

      // Guardar token y usuario
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirigir según rol
      if (user.rolId === 1) {
        router.replace("/dashboard/admin");
      } else if (user.rolId === 2) {
        router.replace("/dashboard/user");
      } else {
        router.replace("/login"); // fallback
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Error en el login");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error desconocido");
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Animación de fondo
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

  // 🔹 Mientras verifica la sesión, no mostrar login
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-xl">Verificando sesión...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden bg-gray-900 text-white">
        {/* Fondo animado */}
        <div
          className="absolute inset-0 transition-[background] duration-1000 ease-out opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(14,165,233,0.25) 0%, transparent 50%), linear-gradient(135deg, #0f172a 0%, #1e293b 80%, #0f172a 100%)`,
          }}
        />

        {/* Figuras geométricas animadas */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 border border-cyan-500/40 rotate-45 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-52 h-52 border border-blue-500/40 rotate-12 animate-bounce"></div>
          <div className="absolute top-1/2 left-1/4 w-28 h-28 border-2 border-purple-500/50 rounded-full animate-spin"></div>
        </div>

        {/* Grid técnico */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(14,165,233,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.12) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Formulario */}
        <div className="relative z-10 flex-1 flex items-center justify-center p-8">
          <div
            className={`w-full max-w-md bg-gray-800/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-cyan-500/20 p-8 sm:p-10 transform transition-all duration-1000 ease-out ${
              isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
            } hover:scale-105 hover:shadow-2xl`}
          >
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <Image
                  src="/images/logo.webp"
                  alt="Logo Clínica Dental"
                  width={200}
                  height={80}
                  className="mx-auto relative z-10 transition-transform duration-500 ease-out hover:scale-110 hover:brightness-125"
                  priority
                />
              </div>
              <h2 className="mt-6 text-3xl font-extrabold tracking-tight">Iniciar Sesión</h2>
              <p className="mt-2 text-gray-400 text-sm">Ingresa tus credenciales para continuar</p>
            </div>

            {/* Mostrar error si existe */}
            {error && (
              <div className="bg-red-500/20 text-red-400 text-sm rounded-md p-2 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <FloatingInput
                placeholder="Correo electrónico"
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FloatingInput
                placeholder="Contraseña"
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="flex items-center justify-between text-sm">
                <Link href="/forgot-password" className="text-cyan-400 hover:text-white transition-colors font-semibold">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full bg-transparent hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 text-cyan-400 hover:text-white font-bold py-3 px-8 rounded-2xl transition-all duration-500 ease-in-out transform hover:scale-105 hover:shadow-2xl border-2 border-cyan-500/50"
              >
                {loading ? "Ingresando..." : "Iniciar sesión"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400">
              ¿No tienes una cuenta?{" "}
              <Link href="/register" className="text-cyan-400 hover:text-white hover:underline transition-colors">
                Regístrate
              </Link>
            </p>
          </div>
        </div>

        {/* Imagen decorativa derecha en escritorio */}
        <div className="hidden lg:flex flex-1 relative">
          <Image
            src="/images/fondo.webp"
            alt="Imagen Clínica"
            fill
            className="object-cover rounded-l-3xl transition-transform duration-500 ease-out hover:scale-105"
            priority
          />
        </div>

        {/* Footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Footer />
        </div>
      </div>
    </>
  );
}
