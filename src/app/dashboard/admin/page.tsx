"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import React, { useState, useEffect } from 'react';
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import Footer from "@/components/footer/footer";
import { useAuth } from "@/context/authContext";
import { 
  Crown, 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  Calendar,
  Activity,
  TrendingUp,
  Database,
  Bell
} from 'lucide-react';

function AdminDashboard() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Estado del sidebar que se sincroniza con localStorage
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("sidebar-expanded");
      return stored !== "false";
    }
    return true;
  });

  const { user } = useAuth();

  // Detectar si es móvil - solo al montar y resize
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
  }, [mounted]); // Solo al montar

  // Efecto para actualizar la hora
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Efecto de mouse para el fondo animado
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []); // Solo al montar

  // Escuchar cambios en el localStorage para sincronizar el sidebar
  useEffect(() => {
    if (!mounted || isMobile) return;

    const handleStorageChange = () => {
      const stored = localStorage.getItem("sidebar-expanded");
      setSidebarExpanded(stored !== "false");
    };

    // Escuchar cambios en localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // También verificar cambios periódicamente (para cambios en la misma pestaña)
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

  // Calcular el margen izquierdo dinámicamente
  const getMarginLeft = () => {
    if (isMobile) {
      return 'ml-0';
    }
    return sidebarExpanded ? 'ml-64' : 'ml-20';
  };

  // Tarjetas de resumen rápido (datos simulados por ahora)
  const quickStats = [
    {
      title: "Usuarios Activos",
      value: "248",
      change: "+12%",
      icon: <Users className="w-8 h-8" />,
      color: "from-blue-600 to-cyan-600"
    },
    {
      title: "Citas del Día",
      value: "34",
      change: "+8%",
      icon: <Calendar className="w-8 h-8" />,
      color: "from-green-600 to-emerald-600"
    },
    {
      title: "Ingresos del Mes",
      value: "$15,240",
      change: "+23%",
      icon: <TrendingUp className="w-8 h-8" />,
      color: "from-purple-600 to-pink-600"
    },
    {
      title: "Sistemas Activos",
      value: "99.9%",
      change: "Estable",
      icon: <Activity className="w-8 h-8" />,
      color: "from-orange-600 to-red-600"
    }
  ];

  const recentActivities = [
    { action: "Nuevo usuario registrado", user: "Ana García", time: "Hace 5 min" },
    { action: "Cita programada", user: "Carlos López", time: "Hace 12 min" },
    { action: "Pago procesado", user: "María Torres", time: "Hace 20 min" },
    { action: "Tratamiento completado", user: "José Martín", time: "Hace 35 min" },
    { action: "Sistema actualizado", user: "Admin", time: "Hace 1 hora" },
  ];

  if (!mounted) {
    return null;
  }

  console.log('AdminDashboard render - sidebarExpanded:', sidebarExpanded, 'marginClass:', getMarginLeft());

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Sidebar siempre al frente */}
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      {/* Header fijo sin margen - siempre ocupa toda la pantalla */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <Header />
      </div>

      {/* Fondo animado fijo */}
      <div
        className="fixed inset-0 transition-[background] duration-1000 ease-out opacity-30 pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(14,165,233,0.25) 0%, transparent 50%), linear-gradient(135deg, #0f172a 0%, #1e293b 80%, #0f172a 100%)`,
        }}
      />

      {/* Figuras geométricas animadas fijas */}
      <div className="fixed inset-0 opacity-10 pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-72 h-72 border border-cyan-500/40 rotate-45 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-52 h-52 border border-blue-500/40 rotate-12 animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-28 h-28 border-2 border-purple-500/50 rounded-full animate-spin"></div>
      </div>

      {/* Grid técnico fijo */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(14,165,233,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.12) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Contenido principal - ESTE ES EL ÚNICO QUE SE MUEVE */}
      <div className={`relative z-10 transition-all duration-300 ease-in-out ${getMarginLeft()}`}>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Mensaje de bienvenida */}
          <div className="mt-20 mb-8">
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-8 text-center transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-center mb-4">
                <Crown className="w-12 h-12 text-yellow-400" />
              </div>
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Bienvenido, {user?.nombre || 'Administrador'}
              </h1>
              <p className="text-xl text-gray-300 mb-4">
                Panel de Control Administrativo 
              </p>
              <div className="text-sm text-cyan-400">
                {currentTime.toLocaleString('es-PE', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
            </div>
          </div>

          {/* Tarjetas de estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickStats.map((stat, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${stat.color}/20 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`text-white p-3 rounded-xl bg-gradient-to-r ${stat.color}/30`}>
                    {stat.icon}
                  </div>
                  <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                    stat.change.includes('+') 
                      ? 'bg-green-500/20 text-green-400' 
                      : stat.change === 'Estable'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-gray-400 text-sm">{stat.title}</p>
              </div>
            ))}
          </div>

          {/* Sección de accesos rápidos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6" />
                Accesos Rápidos
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl border border-blue-500/30 hover:from-blue-600/30 hover:to-cyan-600/30 transition-all duration-300 group">
                  <Users className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Gestionar Usuarios</span>
                </button>
                <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl border border-green-500/30 hover:from-green-600/30 hover:to-emerald-600/30 transition-all duration-300 group">
                  <BarChart3 className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Ver Estadísticas</span>
                </button>
                <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30 hover:from-purple-600/30 hover:to-pink-600/30 transition-all duration-300 group">
                  <Shield className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Seguridad</span>
                </button>
                <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-xl border border-orange-500/30 hover:from-orange-600/30 hover:to-red-600/30 transition-all duration-300 group">
                  <Database className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Base de Datos</span>
                </button>
              </div>
            </div>

            <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
                <Bell className="w-6 h-6" />
                Actividad Reciente
              </h2>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-4 p-3 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-colors border border-gray-600/30"
                  >
                    <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{activity.action}</p>
                      <p className="text-xs text-gray-400">Por: {activity.user}</p>
                    </div>
                    <span className="text-xs text-cyan-400">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Información del sistema */}
          <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Estado del Sistema
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center mx-auto mb-3">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                </div>
                <h3 className="font-semibold text-white">Servidor Principal</h3>
                <p className="text-green-400 text-sm">Operativo</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center mx-auto mb-3">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                </div>
                <h3 className="font-semibold text-white">Base de Datos</h3>
                <p className="text-green-400 text-sm">Conectado</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-400 flex items-center justify-center mx-auto mb-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
                </div>
                <h3 className="font-semibold text-white">Copias de Seguridad</h3>
                <p className="text-yellow-400 text-sm">Programadas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer también se mueve con el contenido */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Footer />
        </div>
      </div>
    </div>
  );
}

// Exporta el componente envuelto en ProtectedRoute
export default function ProtectedAdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={[1]}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}