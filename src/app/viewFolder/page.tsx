"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  X, 
  FileText, 
  ZoomIn, 
  Users,
  TrendingUp,
  TrendingDown,
  Building2,
  Eye,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';
import Header from "@/components/navbar/headerUser";
import api from "@/services/api";
import Image from "next/image";
import Footer from "@/components/footer/footer";
import axios from "axios";

interface ReporteResponse {
  resumen: {
    total_transacciones: string;
    usuarios_involucrados: string;
    total_ingresos: number;
    total_egresos: number;
    balance: number;
    promedio_ingresos: number;
    promedio_egresos: number;
    transaccion_mayor: number;
    transaccion_menor: number;
  };
  transacciones: TransaccionDetalle[];
  filtros: {
    fecha_inicio: string;
    fecha_fin: string;
    comite_id: string | null;
    usuario_id: string | null;
  };
}

interface ApiError {
  response?: {
    status: number;
    data?: {
      error?: string;
    };
  };
}

interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  estado: string;
  rol: string;
  rolId: number;
  comiteId?: number;
  comiteNombre?: string;
}
interface Comite {
  id: number;
  nombre?: string | null;
  epoca: string;
  estado: string;
  usuarios_activos: number;
  total_transacciones: number;
  ingresos: number;
  egresos: number;
  balance: number;
}


interface TransaccionDetalle {
  id: number;
  fecha: string;
  tipo_de_cuenta: 'Ingreso' | 'Egreso';
  actividad: string;
  codigo: string;
  cantidad: number;
  usuario: string;
  email: string;
  voucher?: string;
}

interface ComiteDetalle {
  comite: Comite;
  transacciones: TransaccionDetalle[];
  resumen: {
    usuario_mas_activo: string;
    transaccion_mayor: number;
    promedio_ingresos: number;
    promedio_egresos: number;
    actividades_frecuentes: Array<{
      actividad: string;
      frecuencia: number;
      monto_total: number;
    }>;
  };
}

// Componente principal
function ComitesBalancesPage() {
  // Helper function para verificar si es un error de API
  const isApiError = (error: unknown): error is ApiError => {
    return error instanceof Error && 'response' in error;
  };

  // Helper function para manejar errores de manera segura
  const handleError = (error: unknown, defaultMessage: string): string => {
    if (isApiError(error)) {
      return error.response?.data?.error || defaultMessage;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return defaultMessage;
  };

  // Helper function para verificar si es error 401
  const is401Error = (error: unknown): boolean => {
    return isApiError(error) && error.response?.status === 401;
  };
  const [comites, setComites] = useState<Comite[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Estados del modal
  const [showModal, setShowModal] = useState(false);
  const [selectedComite, setSelectedComite] = useState<ComiteDetalle | null>(null);
  const [loadingModal, setLoadingModal] = useState(false);
  
  // Estados para filtros
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activo' | 'inactivo'>('todos');
  const [ordenarPor, setOrdenarPor] = useState<'nombre' | 'balance' | 'transacciones'>('nombre');


  // Estados para el lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState("");
  const [lightboxImageTitle, setLightboxImageTitle] = useState("");

  // Verificar autenticación
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      window.location.href = '/login';
      return;
    }

    try {
      const user = JSON.parse(userData);
      // Permitir acceso solo a admin (rol 1)
      if (user.rolId !== 1) {
        window.location.href = '/login';
        return;
      }
      setCheckingAuth(false);
      fetchComites();
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }, []);

  const fetchComites = async () => {
    try {
      setError("");
      setIsLoading(true);
      const response = await api.get<Comite[]>('/dashboard/distribucion-por-comite');
      setComites(response.data);
    } catch (err: unknown) {
      console.error('Error al obtener comités:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        setError(err.response?.data?.error || 'Error al cargar los comités');
      } else {
        setError('Error de conexión al servidor');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar detalles de un comité específico
  const fetchComiteDetalle = async (comiteId: number) => {
    try {
      setLoadingModal(true);
      setError("");
      
      // Buscar el comité en la lista actual
      const comite = comites.find(c => c.id === comiteId);
      if (!comite) {
        setError("Comité no encontrado");
        return;
      }

      // Obtener usuarios del comité y sus transacciones
      const [, transaccionesRes] = await Promise.all([
        api.get<Usuario[]>(`/usuarios`),
        api.get<ReporteResponse>(`/dashboard/reporte-periodo?fecha_inicio=2020-01-01&fecha_fin=2030-12-31&comite_id=${comiteId}`)
      ]);

      
      const transacciones: TransaccionDetalle[] = transaccionesRes.data.transacciones || [];
      
      // Calcular resumen
      const usuarioTransacciones = new Map<string, number>();
      const actividadFrecuencia = new Map<string, { frecuencia: number; monto: number }>();
      
      transacciones.forEach(t => {
        // Contar transacciones por usuario
        const count = usuarioTransacciones.get(t.usuario) || 0;
        usuarioTransacciones.set(t.usuario, count + 1);
        
        // Contar actividades
        const actKey = t.actividad;
        const actData = actividadFrecuencia.get(actKey) || { frecuencia: 0, monto: 0 };
        actividadFrecuencia.set(actKey, {
          frecuencia: actData.frecuencia + 1,
          monto: actData.monto + t.cantidad
        });
      });

      const usuario_mas_activo = Array.from(usuarioTransacciones.entries())
        .sort(([,a], [,b]) => b - a)[0]?.[0] || "Ninguno";

      const transaccion_mayor = Math.max(...transacciones.map(t => t.cantidad), 0);
      
      const ingresos = transacciones.filter(t => t.tipo_de_cuenta === 'Ingreso');
      const egresos = transacciones.filter(t => t.tipo_de_cuenta === 'Egreso');
      
      const promedio_ingresos = ingresos.length > 0 
        ? ingresos.reduce((sum, t) => sum + t.cantidad, 0) / ingresos.length 
        : 0;
        
      const promedio_egresos = egresos.length > 0 
        ? egresos.reduce((sum, t) => sum + t.cantidad, 0) / egresos.length 
        : 0;

      const actividades_frecuentes = Array.from(actividadFrecuencia.entries())
        .map(([actividad, data]) => ({
          actividad,
          frecuencia: data.frecuencia,
          monto_total: data.monto
        }))
        .sort((a, b) => b.frecuencia - a.frecuencia)
        .slice(0, 5);

      const comiteDetalle: ComiteDetalle = {
        comite,
        transacciones,
        resumen: {
          usuario_mas_activo,
          transaccion_mayor,
          promedio_ingresos,
          promedio_egresos,
          actividades_frecuentes
        }
      };

      setSelectedComite(comiteDetalle);
      setShowModal(true);

    } catch (err: unknown) {
      console.error('Error al cargar detalles del comité:', err);
      if (is401Error(err)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      setError(handleError(err, 'Error al cargar los detalles del comité'));
    } finally {
      setLoadingModal(false);
    }
  };

  // Abrir lightbox
  const openLightbox = (imageUrl: string, title: string) => {
    setLightboxImageUrl(imageUrl);
    setLightboxImageTitle(title);
    setLightboxOpen(true);
  };

  // Cerrar lightbox
  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImageUrl("");
    setLightboxImageTitle("");
  };

// Filtrar y ordenar comités
const comitesFiltrados = comites
  .filter((comite) => {
    if (filtroEstado === "todos") return true;
    return comite.estado === filtroEstado;
  })
  .sort((a, b) => {
    switch (ordenarPor) {
      case "balance":
        return b.balance - a.balance;
      case "transacciones":
        return b.total_transacciones - a.total_transacciones;
      case "nombre":
      default: {
        const nombreA = a?.nombre ?? "";
        const nombreB = b?.nombre ?? "";
        return nombreA.localeCompare(nombreB);
      }
    }
  });

  // Efecto de mouse
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

  // Cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedComite(null);
  };

  if (checkingAuth) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <Header />
      
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

      {/* Contenido principal */}
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mt-20 mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Balances por Comité
          </h1>
          <p className="text-gray-400">
            Vista detallada de los balances financieros de cada comité
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-500/20 text-red-400 text-sm rounded-xl p-4 border border-red-500/30">
            {error}
          </div>
        )}

        {/* Controles de filtro */}
        <div className="mb-8 bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400">Filtros:</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">Estado:</label>
              <select
                value={filtroEstado}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setFiltroEstado(e.target.value as 'todos' | 'activo' | 'inactivo')
                }
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
              >
                <option value="todos">Todos</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">Ordenar por:</label>
              <select
                value={ordenarPor}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setOrdenarPor(e.target.value as 'nombre' | 'balance' | 'transacciones')
                }
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
              >
                <option value="nombre">Nombre</option>
                <option value="balance">Balance</option>
                <option value="transacciones">Transacciones</option>
              </select>
            </div>
          </div>
        </div>

        {/* Estadísticas generales */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6 text-center">
            <Building2 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-blue-400 mb-1">TOTAL COMITÉS</h3>
            <p className="text-2xl font-bold text-white">{comites.length}</p>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-green-400 mb-1">INGRESOS TOTAL</h3>
            <p className="text-2xl font-bold text-white">
              ${comites.reduce((sum, c) => sum + c.ingresos, 0).toFixed(2)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-600/20 to-pink-600/20 backdrop-blur-xl rounded-2xl border border-red-500/30 p-6 text-center">
            <TrendingDown className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-red-400 mb-1">EGRESOS TOTAL</h3>
            <p className="text-2xl font-bold text-white">
              ${comites.reduce((sum, c) => sum + c.egresos, 0).toFixed(2)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6 text-center">
            <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-purple-400 mb-1">USUARIOS ACTIVOS</h3>
            <p className="text-2xl font-bold text-white">
              {comites.reduce((sum, c) => sum + c.usuarios_activos, 0)}
            </p>
          </div>
        </div>

        {/* Grid de comités */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400">Cargando comités...</p>
            </div>
          </div>
        ) : comitesFiltrados.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl text-gray-400 mb-2">No hay comités disponibles</h3>
            <p className="text-sm text-gray-500">No se encontraron comités con los filtros seleccionados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comitesFiltrados.map((comite) => (
              <div
                key={comite.id}
                className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6 hover:border-cyan-400/50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/10 cursor-pointer"
                onClick={() => fetchComiteDetalle(comite.id)}
              >
                {/* Header de la tarjeta */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1 truncate">
                      {comite.nombre}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">
                        {comite.epoca}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        comite.estado === 'activo' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {comite.estado.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <Eye className="w-5 h-5 text-cyan-400 opacity-60" />
                </div>

                {/* Estadísticas del comité */}
                <div className="space-y-3">
                  {/* Balance */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Balance:</span>
                    <span className={`text-lg font-bold ${
                      comite.balance >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      ${comite.balance.toFixed(2)}
                      {comite.balance >= 0 ? (
                        <ArrowUpRight className="w-4 h-4 inline ml-1" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 inline ml-1" />
                      )}
                    </span>
                  </div>

                  {/* Ingresos */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Ingresos:</span>
                    <span className="text-green-400 font-semibold">
                      ${comite.ingresos.toFixed(2)}
                    </span>
                  </div>

                  {/* Egresos */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Egresos:</span>
                    <span className="text-red-400 font-semibold">
                      ${comite.egresos.toFixed(2)}
                    </span>
                  </div>

                  {/* Usuarios y transacciones */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-400">
                        {comite.usuarios_activos} usuarios
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-gray-400">
                        {comite.total_transacciones} transacciones
                      </span>
                    </div>
                  </div>
                </div>

                {/* Indicador de clic */}
                <div className="mt-4 pt-3 border-t border-gray-700">
                  <p className="text-xs text-cyan-400 text-center">
                    Clic para ver detalles completos
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalles del comité */}
      {showModal && selectedComite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-6xl bg-gray-800/95 backdrop-blur-xl rounded-2xl border border-cyan-500/30 shadow-2xl transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-800/95 backdrop-blur-xl">
              <div>
                <h2 className="text-2xl font-bold text-cyan-400">
                  {selectedComite.comite.nombre}
                </h2>
                <p className="text-gray-400">{selectedComite.comite.epoca}</p>
              </div>
              <button
                onClick={closeModal}
                disabled={loadingModal}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {loadingModal ? (
              <div className="flex justify-center items-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-400">Cargando detalles...</p>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-8">
                {/* Resumen principal */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl border border-green-500/30 p-4 text-center">
                    <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <h4 className="text-sm font-semibold text-green-400 mb-1">INGRESOS</h4>
                    <p className="text-xl font-bold text-white">${selectedComite.comite.ingresos.toFixed(2)}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Promedio: ${selectedComite.resumen.promedio_ingresos.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-red-600/20 to-pink-600/20 rounded-xl border border-red-500/30 p-4 text-center">
                    <TrendingDown className="w-6 h-6 text-red-400 mx-auto mb-2" />
                    <h4 className="text-sm font-semibold text-red-400 mb-1">EGRESOS</h4>
                    <p className="text-xl font-bold text-white">${selectedComite.comite.egresos.toFixed(2)}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Promedio: ${selectedComite.resumen.promedio_egresos.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl border border-blue-500/30 p-4 text-center">
                    <Calculator className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <h4 className="text-sm font-semibold text-blue-400 mb-1">BALANCE</h4>
                    <p className={`text-xl font-bold ${selectedComite.comite.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${selectedComite.comite.balance.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-xl border border-purple-500/30 p-4 text-center">
                    <BarChart3 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <h4 className="text-sm font-semibold text-purple-400 mb-1">TRANSACCIONES</h4>
                    <p className="text-xl font-bold text-white">{selectedComite.comite.total_transacciones}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Mayor: ${selectedComite.resumen.transaccion_mayor.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Usuario más activo */}
                  <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                    <h4 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Usuario más activo
                    </h4>
                    <p className="text-white font-medium">{selectedComite.resumen.usuario_mas_activo}</p>
                  </div>

                  {/* Actividades más frecuentes */}
                  <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                    <h4 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      Actividades frecuentes
                    </h4>
                    <div className="space-y-2">
                      {selectedComite.resumen.actividades_frecuentes.slice(0, 3).map((actividad, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-300 truncate flex-1">{actividad.actividad}</span>
                          <span className="text-xs text-cyan-400 ml-2">{actividad.frecuencia}x</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tabla de transacciones */}
                <div>
                  <h4 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Historial de Transacciones ({selectedComite.transacciones.length})
                  </h4>
                  
                  <div className="bg-gray-700/30 rounded-xl border border-gray-600 overflow-hidden">
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full">
                        <thead className="bg-gray-600/50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-cyan-400 text-sm">Fecha</th>
                            <th className="px-4 py-3 text-left font-semibold text-cyan-400 text-sm">Tipo</th>
                            <th className="px-4 py-3 text-left font-semibold text-cyan-400 text-sm">Actividad</th>
                            <th className="px-4 py-3 text-left font-semibold text-cyan-400 text-sm">Código</th>
                            <th className="px-4 py-3 text-left font-semibold text-cyan-400 text-sm">Cantidad</th>
                            <th className="px-4 py-3 text-left font-semibold text-cyan-400 text-sm">Usuario</th>
                            <th className="px-4 py-3 text-left font-semibold text-cyan-400 text-sm">Voucher</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedComite.transacciones.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                <div className="flex flex-col items-center gap-2">
                                  <FileText className="w-8 h-8 text-gray-500" />
                                  <p>No hay transacciones registradas para este comité</p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            selectedComite.transacciones
                              .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                              .map((transaccion, index) => (
                              <tr
                                key={`${transaccion.id ?? "sin-id"}-${index}`}
                                className={`border-b border-gray-600 hover:bg-gray-600/30 transition-colors ${
                                  index % 2 === 0 ? "bg-gray-700/20" : "bg-gray-700/40"
                                }`}
                              >
                                <td className="px-4 py-3 text-sm">
                                  {new Date(transaccion.fecha).toLocaleDateString("es-PE", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit"
                                  })}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    transaccion.tipo_de_cuenta === 'Ingreso' 
                                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  }`}>
                                    {transaccion.tipo_de_cuenta.toUpperCase()}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm max-w-48">
                                  <div className="truncate" title={transaccion.actividad}>
                                    {transaccion.actividad}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm font-mono text-gray-300">
                                  {transaccion.codigo || '-'}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`font-semibold ${transaccion.tipo_de_cuenta === 'Ingreso' ? 'text-green-400' : 'text-red-400'}`}>
                                    ${transaccion.cantidad.toFixed(2)}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <div className="max-w-32">
                                    <div className="truncate text-gray-300" title={transaccion.usuario}>
                                      {transaccion.usuario}
                                    </div>
                                    <div className="truncate text-xs text-gray-500" title={transaccion.email}>
                                      {transaccion.email}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  {transaccion.voucher ? (
                                    <div 
                                      className="relative w-12 h-12 overflow-hidden group cursor-pointer"
                                      onClick={() => openLightbox(transaccion.voucher!, `${transaccion.actividad} - ${transaccion.fecha}`)}
                                      title="Clic para ver en pantalla completa"
                                    >
                                      <Image
                                        src={transaccion.voucher}
                                        alt="Voucher"
                                        fill
                                        className="object-cover rounded border border-gray-600 transition-all duration-300 group-hover:border-cyan-400"
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
                                        <ZoomIn className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-gray-500 text-xs italic">Sin imagen</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox Component - Reutilizado del componente original */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-md flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Controles superiores */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-3 bg-gray-800/90 backdrop-blur-md rounded-xl px-6 py-3 border border-gray-600/50">
            <span className="text-white text-sm font-medium">Vista de Voucher</span>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 p-3 text-white hover:text-red-400 hover:bg-gray-800/50 rounded-full transition-colors"
            title="Cerrar (Esc)"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Título de la imagen */}
          {lightboxImageTitle && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-gray-800/90 backdrop-blur-md rounded-lg px-4 py-2 border border-gray-600/50">
              <p className="text-white text-sm font-medium">{lightboxImageTitle}</p>
            </div>
          )}

          {/* Contenedor de imagen */}
          <div 
            className="relative w-full h-full flex items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative transition-transform duration-200 ease-out"
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
              }}
            >
              <Image
                src={lightboxImageUrl}
                alt="Voucher ampliado"
                width={800}
                height={600}
                className="object-contain max-w-full max-h-full rounded-lg shadow-2xl"
                style={{ 
                  width: 'auto', 
                  height: 'auto',
                  maxWidth: '90vw',
                  maxHeight: '90vh'
                }}
                unoptimized
                priority
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Footer />
      </div>
    </div>
  );
}

// Exporta el componente envuelto en ProtectedRoute
export default function ProtectedComitesBalancesPage() {
  return (
    <ProtectedRoute allowedRoles={[1]}>
      <ComitesBalancesPage />
    </ProtectedRoute>
  );
} 