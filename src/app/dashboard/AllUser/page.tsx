"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  Download,
  Eye,
  X,
  User,
  Users,
  FileText,
  ArrowUpDown,
  Search,
  CheckCircle,
  XCircle,
  Mail,
  Building
} from "lucide-react";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import Footer from "@/components/footer/footer";
import api from "@/services/api";
import axios from "axios";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/* ---------------- Types ---------------- */
interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  estado: string;
  rol: string;
  rolId: number;
  comiteNombre: string | null;
}

interface Movimiento {
  id: number;
  fecha: string;
  tipo_de_cuenta: "Ingreso" | "Egreso";
  actividad: string;
  codigo: string | null;
  cantidad: number;
  voucher?: string | null;
}

interface ResumenMontos {
  ingresos: number;
  egresos: number;
  balance: number;
}

/* ---------------- Main component ---------------- */
function AdminUsersPanel() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [resumenMontos, setResumenMontos] = useState<ResumenMontos>({
    ingresos: 0,
    egresos: 0,
    balance: 0,
  });
  const [showMovimientosModal, setShowMovimientosModal] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterComite, setFilterComite] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [filterRol, setFilterRol] = useState("todos");
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Estados para el Sidebar (mejorados según el segundo ejemplo)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("sidebar-expanded");
      return stored !== "false";
    }
    return true;
  });

  // Detectar móvil y configurar sidebar
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

  // Escuchar cambios en localStorage para el sidebar
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

  // Calcular margen dinámico para el contenido
  const getMarginLeft = () => {
    if (isMobile) return 'ml-0';
    return sidebarExpanded ? 'ml-64' : 'ml-20';
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      window.location.href = "/login";
      return;
    }
    try {
      const user = JSON.parse(userData);
      if (user.rolId !== 1) {
        window.location.href = "/login";
        return;
      }
      setCheckingAuth(false);
      fetchUsuarios();
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  }, []);

  const fetchUsuarios = async (): Promise<void> => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get<Usuario[]>("/usuarios");
      setUsuarios(response.data);
      setUsuariosFiltrados(response.data);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return;
        }
        setError(err.response?.data?.error || "Error al cargar los usuarios");
      } else {
        setError("Error de conexión al servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMovimientosUsuario = async (userId: number): Promise<void> => {
    try {
      setLoading(true);
      setError("");
      const [movimientosResponse, resumenResponse] = await Promise.all([
        api.get<Movimiento[]>(`/usuarios/${userId}/montos`),
        api.get<ResumenMontos>(`/usuarios/${userId}/montos/resumen`)
      ]);
      
      setMovimientos(movimientosResponse.data);
      setResumenMontos(resumenResponse.data);
      setShowMovimientosModal(true);
    } catch (err) {
      console.error("Error al obtener movimientos:", err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Error al cargar los movimientos");
      } else {
        setError("Error de conexión al servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  const cambiarRolUsuario = async (userId: number, nuevoRolId: number): Promise<void> => {
    try {
      setLoading(true);
      setError("");
      await api.put(`/usuarios/${userId}/rol`, { rolId: nuevoRolId });
      
      // Actualizar la lista de usuarios
      setUsuarios(prevUsuarios => 
        prevUsuarios.map(usuario => 
          usuario.id === userId 
            ? { ...usuario, rolId: nuevoRolId, rol: nuevoRolId === 1 ? "Administrador" : "Usuario" } 
            : usuario
        )
      );
      
      setUsuariosFiltrados(prevUsuarios => 
        prevUsuarios.map(usuario => 
          usuario.id === userId 
            ? { ...usuario, rolId: nuevoRolId, rol: nuevoRolId === 1 ? "Administrador" : "Usuario" } 
            : usuario
        )
      );
      
      setSuccessMessage("Rol actualizado correctamente");
    } catch (err) {
      console.error("Error al cambiar rol:", err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Error al cambiar el rol");
      } else {
        setError("Error de conexión al servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstadoUsuario = async (userId: number, nuevoEstado: string): Promise<void> => {
    try {
      setLoading(true);
      setError("");
      await api.put(`/usuarios/${userId}/estado`, { estado: nuevoEstado });
      
      // Actualizar la lista de usuarios
      setUsuarios(prevUsuarios => 
        prevUsuarios.map(usuario => 
          usuario.id === userId ? { ...usuario, estado: nuevoEstado } : usuario
        )
      );
      
      setUsuariosFiltrados(prevUsuarios => 
        prevUsuarios.map(usuario => 
          usuario.id === userId ? { ...usuario, estado: nuevoEstado } : usuario
        )
      );
      
      setSuccessMessage("Estado actualizado correctamente");
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Error al cambiar el estado");
      } else {
        setError("Error de conexión al servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  const filtrarUsuarios = useCallback(() => {
    let filtered = [...usuarios];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(usuario => 
        usuario.nombres.toLowerCase().includes(term) ||
        usuario.apellidos.toLowerCase().includes(term) ||
        usuario.email.toLowerCase().includes(term) ||
        (usuario.comiteNombre && usuario.comiteNombre.toLowerCase().includes(term))
      );
    }

    // Filtrar por comité
    if (filterComite !== "todos") {
      if (filterComite === "sin-comite") {
        filtered = filtered.filter(usuario => !usuario.comiteNombre);
      } else {
        filtered = filtered.filter(usuario => usuario.comiteNombre === filterComite);
      }
    }

    // Filtrar por estado
    if (filterEstado !== "todos") {
      filtered = filtered.filter(usuario => usuario.estado === filterEstado);
    }

    // Filtrar por rol
    if (filterRol !== "todos") {
      filtered = filtered.filter(usuario => usuario.rolId.toString() === filterRol);
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case "nombre":
          aValue = `${a.nombres} ${a.apellidos}`;
          bValue = `${b.nombres} ${b.apellidos}`;
          break;
        case "email":
          aValue = a.email;
          bValue = b.email;
          break;
        case "comite":
          aValue = a.comiteNombre || "";
          bValue = b.comiteNombre || "";
          break;
        case "estado":
          aValue = a.estado;
          bValue = b.estado;
          break;
        case "rol":
          aValue = a.rol;
          bValue = b.rol;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }
      
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setUsuariosFiltrados(filtered);
  }, [usuarios, searchTerm, filterComite, filterEstado, filterRol, sortField, sortDirection]);

  useEffect(() => {
    filtrarUsuarios();
  }, [filtrarUsuarios]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const exportToExcel = async () => {
    if (usuariosFiltrados.length === 0) {
      setError("No hay usuarios para exportar");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Usuarios");
    
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Nombres", key: "nombres", width: 20 },
      { header: "Apellidos", key: "apellidos", width: 20 },
      { header: "Email", key: "email", width: 30 },
      { header: "Estado", key: "estado", width: 15 },
      { header: "Rol", key: "rol", width: 15 },
      { header: "Comité", key: "comite", width: 20 },
    ];

    usuariosFiltrados.forEach(usuario => {
      worksheet.addRow({
        id: usuario.id,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        email: usuario.email,
        estado: usuario.estado,
        rol: usuario.rol,
        comite: usuario.comiteNombre || "Sin comité"
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `usuarios_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const exportMovimientosToExcel = async () => {
    if (movimientos.length === 0) {
      setError("No hay movimientos para exportar");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Movimientos");
    
    worksheet.columns = [
      { header: "Fecha", key: "fecha", width: 15 },
      { header: "Tipo", key: "tipo", width: 12 },
      { header: "Actividad", key: "actividad", width: 25 },
      { header: "Código", key: "codigo", width: 15 },
      { header: "Cantidad", key: "cantidad", width: 12 },
    ];

    movimientos.forEach(movimiento => {
      worksheet.addRow({
        fecha: new Date(movimiento.fecha).toLocaleDateString("es-PE"),
        tipo: movimiento.tipo_de_cuenta,
        actividad: movimiento.actividad,
        codigo: movimiento.codigo || "-",
        cantidad: movimiento.cantidad,
      });
    });

    // Agregar resumen
    worksheet.addRow([]);
    if (resumenMontos) {
      worksheet.addRow(["", "", "INGRESOS TOTALES", "", resumenMontos.ingresos]);
      worksheet.addRow(["", "", "EGRESOS", "", resumenMontos.egresos]);
      worksheet.addRow(["", "", "BALANCE", "", resumenMontos.balance]);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `movimientos_${usuarioSeleccionado?.nombres}_${usuarioSeleccionado?.apellidos}_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // Limpiar mensajes después de un tiempo
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (checkingAuth || !mounted) return null;

  const comites = Array.from(new Set(usuarios.map(u => u.comiteNombre).filter(Boolean))) as string[];

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Fondo animado */}
      <div className="fixed inset-0 opacity-30 pointer-events-none z-0">
        <div
          className="absolute inset-0 transition-[background] duration-1000 ease-out"
          style={{
            background: `linear-gradient(135deg, #0f172a 0%, #1e293b 80%, #0f172a 100%)`,
          }}
        />
      </div>

      {/* Grid técnico */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(14,165,233,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.12) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Sidebar fijo */}
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      {/* Header fijo */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <Header />
      </div>

      {/* Contenido principal con margen dinámico */}
      <div className={`relative z-10 transition-all duration-300 ease-in-out ${getMarginLeft()}`}>
        <div className="p-6 max-w-7xl mx-auto">
          
          {/* Título */}
          <div className="mt-20 mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Panel de Administración de Usuarios
            </h1>
            <p className="text-gray-400">Gestiona usuarios y sus movimientos</p>
          </div>

          {/* Mensajes de estado */}
          {error && (
            <div className="mb-6 bg-red-500/20 text-red-400 text-sm rounded-xl p-4 border border-red-500/30 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="mb-6 bg-green-500/20 text-green-400 text-sm rounded-xl p-4 border border-green-500/30 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {successMessage}
            </div>
          )}

          {/* Filtros y búsqueda */}
          <div className="mb-6 bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Nombre, email, comité..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl pl-10 pr-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent" 
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Comité</label>
                <select 
                  value={filterComite} 
                  onChange={(e) => setFilterComite(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="todos">Todos los comités</option>
                  <option value="sin-comite">Sin comité</option>
                  {comites.map(comite => (
                    <option key={comite} value={comite}>{comite}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Estado</label>
                <select 
                  value={filterEstado} 
                  onChange={(e) => setFilterEstado(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Rol</label>
                <select 
                  value={filterRol} 
                  onChange={(e) => setFilterRol(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="todos">Todos los roles</option>
                  <option value="1">Administrador</option>
                  <option value="2">Usuario</option>
                </select>
              </div>
            </div>
          </div>

          {/* Estadísticas y acciones */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
            </div>
            <button 
              onClick={exportToExcel} 
              disabled={usuariosFiltrados.length === 0 || loading} 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                usuariosFiltrados.length > 0 && !loading 
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700" 
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Download className="w-4 h-4" /> 
              Exportar a Excel
            </button>
          </div>

          {/* Tabla de usuarios */}
          <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-700 to-gray-600">
                    <th className="px-6 py-4 text-left text-cyan-400 cursor-pointer hover:text-cyan-300" onClick={() => handleSort("id")}>
                      <div className="flex items-center gap-2">
                        ID {sortField === "id" && <ArrowUpDown className="w-4 h-4" />}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-cyan-400 cursor-pointer hover:text-cyan-300" onClick={() => handleSort("nombre")}>
                      <div className="flex items-center gap-2">
                        Nombre {sortField === "nombre" && <ArrowUpDown className="w-4 h-4" />}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-cyan-400 cursor-pointer hover:text-cyan-300" onClick={() => handleSort("email")}>
                      <div className="flex items-center gap-2">
                        Email {sortField === "email" && <ArrowUpDown className="w-4 h-4" />}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-cyan-400 cursor-pointer hover:text-cyan-300" onClick={() => handleSort("comite")}>
                      <div className="flex items-center gap-2">
                        Comité {sortField === "comite" && <ArrowUpDown className="w-4 h-4" />}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-cyan-400 cursor-pointer hover:text-cyan-300" onClick={() => handleSort("estado")}>
                      <div className="flex items-center gap-2">
                        Estado {sortField === "estado" && <ArrowUpDown className="w-4 h-4" />}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-cyan-400 cursor-pointer hover:text-cyan-300" onClick={() => handleSort("rol")}>
                      <div className="flex items-center gap-2">
                        Rol {sortField === "rol" && <ArrowUpDown className="w-4 h-4" />}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-cyan-400">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-4">
                          <Users className="w-16 h-16 text-gray-500" />
                          <div>
                            <p className="text-xl mb-2">No hay usuarios registrados</p>
                            <p className="text-sm">No se encontraron usuarios con los filtros aplicados</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    usuariosFiltrados.map((usuario, index) => (
                      <tr 
                        key={usuario.id} 
                        className={`border-b border-gray-700 hover:bg-gray-700/30 transition-colors ${
                          index % 2 === 0 ? "bg-gray-800/20" : "bg-gray-800/40"
                        }`}
                      >
                        <td className="px-6 py-4 text-sm font-mono">{usuario.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-medium">{usuario.nombres} {usuario.apellidos}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{usuario.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{usuario.comiteNombre || "Sin comité"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            value={usuario.estado} 
                            onChange={(e) => cambiarEstadoUsuario(usuario.id, e.target.value)}
                            className={`px-3 py-1 rounded-xl text-xs border-0 transition-all ${
                              usuario.estado === 'activo' 
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            }`}
                          >
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            value={usuario.rolId} 
                            onChange={(e) => cambiarRolUsuario(usuario.id, parseInt(e.target.value))}
                            className={`px-3 py-1 rounded-xl text-xs border-0 transition-all ${
                              usuario.rolId === 1 
                                ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' 
                                : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                            }`}
                          >
                            <option value={1}>Administrador</option>
                            <option value={2}>Usuario</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => {
                                setUsuarioSeleccionado(usuario);
                                fetchMovimientosUsuario(usuario.id);
                              }} 
                              className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors" 
                              title="Ver movimientos"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Footer />
        </div>
      </div>

      {/* Modal de movimientos */}
      {showMovimientosModal && usuarioSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-4xl bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-cyan-500/30 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-cyan-400">Movimientos de {usuarioSeleccionado.nombres} {usuarioSeleccionado.apellidos}</h2>
                  <p className="text-sm text-gray-400">{usuarioSeleccionado.email} | {usuarioSeleccionado.comiteNombre || "Sin comité"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={exportMovimientosToExcel} 
                  disabled={movimientos.length === 0} 
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                    movimientos.length > 0 
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700" 
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Download className="w-4 h-4" /> Exportar
                </button>
                <button 
                  onClick={() => setShowMovimientosModal(false)} 
                  className="text-gray-400 p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {resumenMontos && (
              <div className="p-4 bg-gray-700/50 border-b border-gray-600">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-green-400">Ingresos</p>
                    <p className="text-xl font-bold">
                      ${resumenMontos?.ingresos?.toFixed(2) ?? "0.00"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-red-400">Egresos</p>
                    <p className="text-xl font-bold">
                      ${resumenMontos?.egresos?.toFixed(2) ?? "0.00"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-cyan-400">Balance</p>
                    <p className={`text-xl font-bold ${resumenMontos?.balance >= 0 ? "text-green-400" : "text-red-400"}`}>
                      ${resumenMontos?.balance?.toFixed(2) ?? "0.00"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-y-auto flex-grow">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm text-cyan-400">Fecha</th>
                    <th className="px-6 py-3 text-left text-sm text-cyan-400">Tipo</th>
                    <th className="px-6 py-3 text-left text-sm text-cyan-400">Actividad</th>
                    <th className="px-6 py-3 text-left text-sm text-cyan-400">Código</th>
                    <th className="px-6 py-3 text-left text-sm text-cyan-400">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="w-8 h-8 text-gray-500" />
                          <p>No hay movimientos registrados</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    movimientos.map((movimiento, index) => (
                      <tr key={movimiento.id} className={`${index % 2 === 0 ? "bg-gray-800/20" : "bg-gray-800/40"} hover:bg-gray-700/30`}>
                        <td className="px-6 py-4 text-sm">{new Date(movimiento.fecha).toLocaleDateString("es-PE")}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            movimiento.tipo_de_cuenta === "Ingreso" 
                              ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}>
                            {movimiento.tipo_de_cuenta}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">{movimiento.actividad}</td>
                        <td className="px-6 py-4 text-sm font-mono">{movimiento.codigo || "-"}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={movimiento.tipo_de_cuenta === "Ingreso" ? "text-green-400" : "text-red-400"}>
                            ${movimiento.cantidad.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Export wrapper ---------------- */
export default function ProtectedAdminUsersPanel() {
  return (
    <ProtectedRoute allowedRoles={[1]}>
      <AdminUsersPanel />
    </ProtectedRoute>
  );
}