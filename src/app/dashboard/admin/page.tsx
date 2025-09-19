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
  Bell,
  DollarSign,
  Building2,
  FileText,
  Zap,
  BookOpen,
  Calculator,
  RefreshCw
} from 'lucide-react';

// Interfaces para los datos de la API
interface StatsData {
  finanzas: {
    total_ingresos: number;
    total_egresos: number;
    balance: number;
    total_transacciones: number;
    transacciones_hoy: number;
  };
  usuarios: {
    total: number;
    activos: number;
    nuevos_mes: number;
    inactivos: number;
  };
  comites: {
    total: number;
    activos: number;
    inactivos: number;
  };
}

interface RecentActivity {
  id: number;
  accion: string;
  tabla: string;
  usuario: string;
  fecha: string;
  datos_anteriores: string;
  datos_nuevos: string;
}

function AdminDashboard() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Estados para datos reales
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Estado del sidebar que se sincroniza con localStorage
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("sidebar-expanded");
      return stored !== "false";
    }
    return true;
  });

  const { user, token } = useAuth();

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
  }, [mounted]);

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
  }, []);

  // Escuchar cambios en el localStorage para sincronizar el sidebar
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

  // Función para hacer peticiones a las APIs
  const fetchData = React.useCallback(
    async <T,>(endpoint: string): Promise<T | null> => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        return (await response.json()) as T;
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return null;
      }
    },
    [token]
  );

  // Cargar datos de las APIs
  useEffect(() => {
    if (!token) return;

    const loadAdminData = async () => {
      setIsLoading(true);
      
      try {
        // Cargar estadísticas generales
        const statsData = await fetchData<StatsData>('/dashboard/stats');
        if (statsData) setStats(statsData);

        // Cargar actividades recientes (usando endpoint de auditoría)
        const activitiesData = await fetchData<RecentActivity[]>('/dashboard/auditoria?limit=5');
        if (activitiesData) setRecentActivities(activitiesData);

      } catch (error) {
        console.error('Error cargando datos admin:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, [token, fetchData]);

  // Función para formatear números
  const formatCurrency = (value: number | null | undefined): string => {
    if (!value && value !== 0) return 'S/ 0.00';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(value);
  };

  const handleRefresh = async () => {
    if (!token) return;
    setIsLoading(true);
    
    // Recargar todos los datos
    const statsData = await fetchData<StatsData>("/dashboard/stats");
    if (statsData) setStats(statsData);

    const activitiesData = await fetchData<RecentActivity[]>('/dashboard/auditoria?limit=5');
    if (activitiesData) setRecentActivities(activitiesData);

    setIsLoading(false);
  };

  // Calcular el margen izquierdo dinámicamente
  const getMarginLeft = () => {
    if (isMobile) {
      return 'ml-0';
    }
    return sidebarExpanded ? 'ml-64' : 'ml-20';
  };

  // Tarjetas de resumen rápido con datos reales
  const quickStats = stats ? [
    {
      title: "Usuarios Registrados",
      value: stats.usuarios.total?.toString() || "0",
      change: `+${stats.usuarios.nuevos_mes} este mes`,
      icon: <Users className="w-8 h-8" />,
      color: "from-blue-600 to-cyan-600"
    },
    {
      title: "Transacciones Hoy",
      value: stats.finanzas.transacciones_hoy?.toString() || "0",
      change: `${stats.finanzas.total_transacciones} total`,
      icon: <Calculator className="w-8 h-8" />,
      color: "from-green-600 to-emerald-600"
    },
    {
      title: "Balance Total",
      value: formatCurrency(stats.finanzas.balance),
      change: stats.finanzas.balance >= 0 ? "+15.3%" : "-8.2%",
      icon: <DollarSign className="w-8 h-8" />,
      color: "from-purple-600 to-pink-600"
    },
    {
      title: "Comités Activos",
      value: stats.comites.activos?.toString() || "0",
      change: `${stats.comites.inactivos} inactivos`,
      icon: <Building2 className="w-8 h-8" />,
      color: "from-orange-600 to-red-600"
    }
  ] : [];

  // Formatear actividades recientes para mostrar
  const formatRecentActivities = () => {
    return recentActivities.map(activity => ({
      action: `${activity.accion} en ${activity.tabla}`,
      user: activity.usuario,
      time: new Date(activity.fecha).toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }));
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Fondo animado fijo */}
      <div className="fixed inset-0 opacity-30 pointer-events-none z-0">
        <div
          className="absolute inset-0 transition-[background] duration-1000 ease-out"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(14,165,233,0.25) 0%, transparent 50%), linear-gradient(135deg, #0f172a 0%, #1e293b 80%, #0f172a 100%)`,
          }}
        />
      </div>

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

      {/* Sidebar siempre al frente */}
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      {/* Header fijo sin margen */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <Header />
      </div>

      {/* Contenido principal con margen dinámico */}
      <div className={`relative z-10 transition-all duration-300 ease-in-out ${getMarginLeft()}`}>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Mensaje de bienvenida */}
          <div className="mt-20 mb-8">
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-8 text-center transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 mx-auto">
                  <Crown className="w-12 h-12 text-yellow-400" />
                  <div>
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      Bienvenido, {user?.nombre || 'Administrador'}
                    </h1>
                    <p className="text-xl text-gray-300 mb-2">
                      Sistema de Gestión Financiera - SISGEFI
                    </p>
                    <p className="text-lg text-gray-400">
                      Panel de Control Administrativo
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRefresh}
                  className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-blue-500/30 rounded-lg px-4 py-2 flex items-center gap-2 hover:from-blue-600/30 hover:to-purple-600/30 transition-all duration-300"
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
              </div>
              <div className="text-sm text-cyan-400 mt-4">
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
                      : stat.change.includes('-')
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-blue-500/20 text-blue-400'
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
                <Zap className="w-6 h-6" />
                Accesos Rápidos
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl border border-blue-500/30 hover:from-blue-600/30 hover:to-cyan-600/30 transition-all duration-300 group">
                  <Users className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Gestionar Usuarios</span>
                </button>
                <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl border border-green-500/30 hover:from-green-600/30 hover:to-emerald-600/30 transition-all duration-300 group">
                  <Building2 className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Administrar Comités</span>
                </button>
                <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30 hover:from-purple-600/30 hover:to-pink-600/30 transition-all duration-300 group">
                  <BarChart3 className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Dashboard Financiero</span>
                </button>
                <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-xl border border-orange-500/30 hover:from-orange-600/30 hover:to-red-600/30 transition-all duration-300 group">
                  <FileText className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Generar Reportes</span>
                </button>
              </div>
            </div>

            <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
                <Bell className="w-6 h-6" />
                Actividad Reciente
              </h2>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  formatRecentActivities().map((activity, index) => (
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
                  ))
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-400">
                    {isLoading ? 'Cargando...' : 'No hay actividades recientes'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información del sistema financiero */}
          <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Estado del Sistema SISGEFI
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center mx-auto mb-3">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                </div>
                <h3 className="font-semibold text-white">Sistema Financiero</h3>
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
                <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center mx-auto mb-3">
                  <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
                </div>
                <h3 className="font-semibold text-white">Respaldos</h3>
                <p className="text-blue-400 text-sm">Automatizados</p>
              </div>
            </div>
          </div>

          {/* Sección de funcionalidades del sistema */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-cyan-600/20 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-cyan-500/20">
                  <Calculator className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Gestión Financiera</h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Control completo de ingresos, egresos y balances de cada comité.
              </p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Registro de transacciones</li>
                <li>• Control de presupuestos</li>
                <li>• Análisis financiero</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-600/20 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Reportes Avanzados</h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Generación automática de reportes financieros detallados.
              </p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Reportes por período</li>
                <li>• Análisis por comité</li>
                <li>• Exportación a Excel</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-600/20 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-purple-500/20">
                  <Settings className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Administración</h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Herramientas completas para la gestión de usuarios y comités.
              </p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Gestión de roles</li>
                <li>• Control de accesos</li>
                <li>• Configuración del sistema</li>
              </ul>
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