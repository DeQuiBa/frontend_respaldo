"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import React, { useState, useEffect } from 'react';
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import Footer from "@/components/footer/footer";
import { useAuth } from "@/context/authContext";

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Crown, Users, TrendingUp, Activity, DollarSign, RefreshCw, Eye,
  Building2, Clock, ArrowUp, ArrowDown,
  BarChart3
} from 'lucide-react';


function DashboardFinanciero() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Estados para datos de las APIs con interfaces definidas
interface StatsData {
  finanzas: {
    ingresos: number;
    egresos: number;
    balance: number;
    total_ingresos: number;
    transacciones_hoy: number;
    total_transacciones: number;
  };
  usuarios: {
    total: number;
    activos: number;
    nuevos_mes: number;
  };
  comites: {
    total: number;
    activos: number;
    inactivos: number;
  };
}



interface MonthlyData {
  month: string;
  ingresos: number;
  egresos: number;
}


  interface ComiteData {
    comite: string;
    epoca: number;
    usuarios_activos: number;
    total_transacciones: number;
    ingresos: number;
    egresos: number;
    balance: number;
  }

  interface TransactionData {
    id: number;
    fecha: string;
    tipo_de_cuenta: string;
    actividad: string;
    codigo: string;
    cantidad: number;
    usuario: string;
    email: string;
    comite: string;
  }

  const [stats, setStats] = useState<StatsData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [comiteData, setComiteData] = useState<ComiteData[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Estado del sidebar que se sincroniza con localStorage
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("sidebar-expanded");
      return stored !== "false";
    }
    return true;
  });





  // 2. Función para exportar a PD
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

  // Calcular el margen izquierdo dinámicamente
  const getMarginLeft = () => {
    if (isMobile) {
      return 'ml-0';
    }
    return sidebarExpanded ? 'ml-64' : 'ml-20';
  };

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

    const loadDashboardData = async () => {
      setIsLoading(true);
      
      try {
        // Cargar estadísticas generales
        const statsData = await fetchData('/dashboard/stats');
        if (statsData && typeof statsData === 'object') {
          setStats(statsData as StatsData);
        }

        // Cargar datos mensuales
        const monthlyResponse = await fetchData(`/dashboard/ingresos-egresos-mensual?year=${selectedYear}`);
        if (monthlyResponse && Array.isArray(monthlyResponse)) {
          setMonthlyData(monthlyResponse as MonthlyData[]);
        }

        // Cargar datos de comités
        const comiteResponse = await fetchData('/dashboard/distribucion-por-comite');
        if (comiteResponse && Array.isArray(comiteResponse)) {
          setComiteData(comiteResponse as ComiteData[]);
        }

        // Cargar transacciones recientes
        const transactionsResponse = await fetchData('/dashboard/ultimas-transacciones?limit=10');
        if (transactionsResponse && Array.isArray(transactionsResponse)) {
          setRecentTransactions(transactionsResponse as TransactionData[]);
        }

      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [token, selectedYear, fetchData]);

  // Función para formatear números
  const formatCurrency = (value: number | null | undefined): string => {
    if (!value && value !== 0) return 'S/ 0.00';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(value);
  };

const handleRefresh = () => {
  if (!token) return;

  setIsLoading(true);
  setTimeout(async () => {
    const statsData = await fetchData<StatsData>("dashboard/stats");
    if (statsData) setStats(statsData);

    const monthlyResponse = await fetchData<MonthlyData[]>(
      `/dashboard/ingresos-egresos-mensual?year=${selectedYear}`
    );
    if (monthlyResponse) setMonthlyData(monthlyResponse);

    setIsLoading(false);
  }, 1500);
};


  // Tarjetas de estadísticas principales
  // Tarjetas de estadísticas principales
  const getMainStats = () => {
    if (!stats) return [];
    
    return [
      {
        title: "Balance Total",
        value: formatCurrency(stats.finanzas.balance),
        change: stats.finanzas.balance >= 0 ? "+15.3%" : "-8.2%",
        icon: <DollarSign className="w-8 h-8" />,
        color: "from-[#059669] to-[#0d9488]", // ✅ HEX en vez de emerald-600 / teal-600
        positive: stats.finanzas.balance >= 0
      },
      {
        title: "Usuarios Activos",
        value: stats.usuarios.activos.toString(),
        change: `+${stats.usuarios.nuevos_mes} este mes`,
        icon: <Users className="w-8 h-8" />,
        color: "from-[#2563eb] to-[#06b6d4]", // ✅ HEX en vez de blue-600 / cyan-600
        positive: true
      },
      {
        title: "Total Ingresos",
        value: formatCurrency(stats.finanzas.total_ingresos),
        change: "+8.2%",
        icon: <TrendingUp className="w-8 h-8" />,
        color: "from-[#16a34a] to-[#059669]", // ✅ HEX en vez de green-600 / emerald-600
        positive: true
      },
      {
        title: "Transacciones Hoy",
        value: stats.finanzas.transacciones_hoy.toString(),
        change: "Normal",
        icon: <Activity className="w-8 h-8" />,
        color: "from-[#9333ea] to-[#db2777]", // ✅ HEX en vez de purple-600 / pink-600
        positive: null
      }
    ];
  };


  if (!mounted) {
    return null;
  }

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
          {/* Header del Dashboard */}
          <div className="mt-20 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl rounded-xl border border-blue-500/30 p-3">
                  <Crown className="w-8 h-8 text-yellow-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Dashboard Financiero
                  </h1>
                  <p className="text-gray-300">SISGEFI-DK - Bienvenido, {user?.nombre || 'Usuario'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-gray-800/80 border border-cyan-500/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>
                
                <button
                  onClick={handleRefresh}
                  className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-blue-500/30 rounded-lg px-4 py-2 flex items-center gap-2 hover:from-blue-600/30 hover:to-purple-600/30 transition-all duration-300"
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-cyan-400">
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

          {/* Tarjetas de estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {getMainStats().map((stat, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${stat.color}/20 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`text-white p-3 rounded-xl bg-gradient-to-r ${stat.color}/30`}>
                    {stat.icon}
                  </div>
                  <div className="flex items-center gap-1">
                    {stat.positive === true && <ArrowUp className="w-4 h-4 text-green-400" />}
                    {stat.positive === false && <ArrowDown className="w-4 h-4 text-red-400" />}
                    <span className={`text-sm font-semibold ${
                      stat.positive === true ? 'text-green-400' : 
                      stat.positive === false ? 'text-red-400' : 'text-blue-400'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-gray-400 text-sm">{stat.title}</p>
              </div>
            ))}
          </div>

          {/* Gráficos principales */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            {/* Gráfico de Ingresos vs Egresos */}
            <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6" />
                  Ingresos vs Egresos - {selectedYear}
                </h2>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-300">Ingresos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-gray-300">Egresos</span>
                  </div>
                </div>
              </div>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="mes" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar dataKey="ingresos" fill="#10B981" />
                    <Bar dataKey="egresos" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  {isLoading ? 'Cargando...' : 'No hay datos disponibles'}
                </div>
              )}
            </div>

            {/* Gráfico de tendencia del balance */}
            <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  Tendencia del Balance
                </h2>
              </div>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="mes" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="#06B6D4" 
                      fill="url(#colorBalance)" 
                    />
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  {isLoading ? 'Cargando...' : 'No hay datos disponibles'}
                </div>
              )}
            </div>
          </div>

          {/* Sección de análisis por comité y transacciones recientes */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            {/* Distribución por comité */}
            <div className="xl:col-span-2 bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
                <Building2 className="w-6 h-6" />
                Análisis por Comité
              </h2>
              <div className="overflow-x-auto">
                {comiteData.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left py-3 px-2 text-gray-300 font-semibold">Comité</th>
                        <th className="text-right py-3 px-2 text-gray-300 font-semibold">Usuarios</th>
                        <th className="text-right py-3 px-2 text-gray-300 font-semibold">Ingresos</th>
                        <th className="text-right py-3 px-2 text-gray-300 font-semibold">Egresos</th>
                        <th className="text-right py-3 px-2 text-gray-300 font-semibold">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comiteData.map((comite, index) => (
                        <tr key={index} className="hover:bg-gray-700/30 transition-colors">
                          <td className="py-3 px-2">
                            <div className="font-medium text-white">{comite.comite}</div>
                            <div className="text-xs text-gray-400">Época {comite.epoca}</div>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Users className="w-4 h-4 text-blue-400" />
                              <span className="text-blue-400 font-semibold">{comite.usuarios_activos}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right text-green-400 font-semibold">
                            {formatCurrency(comite.ingresos)}
                          </td>
                          <td className="py-3 px-2 text-right text-red-400 font-semibold">
                            {formatCurrency(comite.egresos)}
                          </td>
                          <td className="py-3 px-2 text-right">
                            <span className={`font-semibold ${comite.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {formatCurrency(comite.balance)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-400">
                    {isLoading ? 'Cargando...' : 'No hay datos de comités disponibles'}
                  </div>
                )}
              </div>
            </div>

            {/* Transacciones recientes */}
            <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                  <Clock className="w-6 h-6" />
                  Recientes
                </h2>
                <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  <Eye className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                {recentTransactions.length > 0 ? recentTransactions.map((transaction, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-colors border border-gray-600/30">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      transaction.tipo_de_cuenta === 'Ingreso' ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {transaction.actividad}
                      </p>
                      <p className="text-xs text-gray-400">
                        {transaction.usuario} • {new Date(transaction.fecha).toLocaleDateString('es-PE')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-semibold ${
                        transaction.tipo_de_cuenta === 'Ingreso' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.tipo_de_cuenta === 'Ingreso' ? '+' : '-'}{formatCurrency(transaction.cantidad)}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                    {isLoading ? 'Cargando...' : 'No hay transacciones recientes'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Indicadores de rendimiento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-600/20 backdrop-blur-xl rounded-2xl border border-green-500/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-400">Crecimiento Mensual</h3>
                  <p className="text-2xl font-bold text-white">
                    {(stats?.finanzas?.balance ?? 0) >= 0 ? "+15.3%" : "-8.2%"}
                  </p>
                  <p className="text-sm text-gray-400">vs mes anterior</p>
                </div>
                <div className="bg-green-500/20 p-3 rounded-xl">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600/20 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-400">Total Transacciones</h3>
                  <p className="text-2xl font-bold text-white">
                    {stats?.finanzas?.total_transacciones || 0}
                  </p>
                  <p className="text-sm text-gray-400">Operaciones registradas</p>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-xl">
                  <Activity className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600/20 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-purple-400">Comités Activos</h3>
                  <p className="text-2xl font-bold text-white">
                    {stats?.comites?.activos || 0}
                  </p>
                  <p className="text-sm text-gray-400">En funcionamiento</p>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-xl">
                  <Building2 className="w-8 h-8 text-purple-400" />
                </div>
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
export default function ProtectedDashboardFinanciero() {
  return (
    <ProtectedRoute allowedRoles={[1]}>
      <DashboardFinanciero />
    </ProtectedRoute>
  );
}