"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  Download,
  Edit,
  Trash2,
  Plus,
  X,
  Search,
  ArrowUpDown,
  Save,
  Calendar,
  CheckCircle,
  XCircle,
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
interface Comite {
  id: number;
  nombre: string;
  epoca: string;
  estado: "activo" | "inactivo";
}

/* ---------------- Main component ---------------- */
function AdminComitesPanel() {
  const [comites, setComites] = useState<Comite[]>([]);
  const [comitesFiltrados, setComitesFiltrados] = useState<Comite[]>([]);
  const [comiteSeleccionado, setComiteSeleccionado] = useState<Comite | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Estados para el formulario
  const [formData, setFormData] = useState({
    nombre: "",
    epoca: "",
    estado: "activo" as "activo" | "inactivo"
  });

  // Estados para el Sidebar (copiado del segundo ejemplo)
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
      fetchComites();
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  }, []);

  const fetchComites = async (): Promise<void> => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get<Comite[]>("/allcomites");
      setComites(response.data);
      setComitesFiltrados(response.data);
    } catch (err) {
      console.error("Error al obtener comités:", err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return;
        }
        setError(err.response?.data?.error || "Error al cargar los comités");
      } else {
        setError("Error de conexión al servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComite = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const response = await api.post("/comites", formData);
      
      setComites(prev => [...prev, response.data.comite]);
      setComitesFiltrados(prev => [...prev, response.data.comite]);
      
      setShowModal(false);
      resetForm();
      setSuccessMessage("Comité creado exitosamente");
    } catch (err) {
      console.error("Error al crear comité:", err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Error al crear el comité");
      } else {
        setError("Error de conexión al servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateComite = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!comiteSeleccionado) return;
    
    try {
      setLoading(true);
      setError("");
      const response = await api.put(`/comites/${comiteSeleccionado.id}`, formData);
      
      setComites(prev => 
        prev.map(comite => 
          comite.id === comiteSeleccionado.id ? response.data.comite : comite
        )
      );
      
      setComitesFiltrados(prev => 
        prev.map(comite => 
          comite.id === comiteSeleccionado.id ? response.data.comite : comite
        )
      );
      
      setShowModal(false);
      resetForm();
      setComiteSeleccionado(null);
      setIsEditing(false);
      setSuccessMessage("Comité actualizado exitosamente");
    } catch (err) {
      console.error("Error al actualizar comité:", err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Error al actualizar el comité");
      } else {
        setError("Error de conexión al servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComite = async (id: number): Promise<void> => {
    if (!confirm("¿Estás seguro de que deseas eliminar este comité?")) return;
    
    try {
      setLoading(true);
      setError("");
      await api.delete(`/comites/${id}`);
      
      setComites(prev => prev.filter(comite => comite.id !== id));
      setComitesFiltrados(prev => prev.filter(comite => comite.id !== id));
      setSuccessMessage("Comité eliminado exitosamente");
    } catch (err) {
      console.error("Error al eliminar comité:", err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Error al eliminar el comité");
      } else {
        setError("Error de conexión al servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (comite: Comite): void => {
    setComiteSeleccionado(comite);
    setFormData({
      nombre: comite.nombre,
      epoca: comite.epoca,
      estado: comite.estado
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const openCreateModal = (): void => {
    resetForm();
    setIsEditing(false);
    setComiteSeleccionado(null);
    setShowModal(true);
  };

  const resetForm = (): void => {
    setFormData({
      nombre: "",
      epoca: "",
      estado: "activo"
    });
  };

  const filtrarComites = useCallback(() => {
    let filtered = [...comites];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(comite => 
        comite.nombre.toLowerCase().includes(term) ||
        comite.epoca.toLowerCase().includes(term)
      );
    }

    // Filtrar por estado
    if (filterEstado !== "todos") {
      filtered = filtered.filter(comite => comite.estado === filterEstado);
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case "nombre":
          aValue = a.nombre;
          bValue = b.nombre;
          break;
        case "epoca":
          aValue = a.epoca;
          bValue = b.epoca;
          break;
        case "estado":
          aValue = a.estado;
          bValue = b.estado;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }
      
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setComitesFiltrados(filtered);
  }, [comites, searchTerm, filterEstado, sortField, sortDirection]);

  useEffect(() => {
    filtrarComites();
  }, [filtrarComites]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const exportToExcel = async () => {
    if (comitesFiltrados.length === 0) {
      setError("No hay comités para exportar");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Comités");
    
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Nombre", key: "nombre", width: 25 },
      { header: "Época", key: "epoca", width: 20 },
      { header: "Estado", key: "estado", width: 15 },
    ];

    comitesFiltrados.forEach(comite => {
      worksheet.addRow({
        id: comite.id,
        nombre: comite.nombre,
        epoca: comite.epoca,
        estado: comite.estado,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `comites_${new Date().toISOString().split("T")[0]}.xlsx`);
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
              Panel de Administración de Comités
            </h1>
            <p className="text-gray-400">Gestiona los comités del sistema</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Nombre, época..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl pl-10 pr-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent" 
                  />
                </div>
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
              
              <div className="flex items-end">
                <button 
                  onClick={openCreateModal}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl w-full justify-center hover:from-blue-700 hover:to-cyan-700 transition-all duration-300"
                >
                  <Plus className="w-4 h-4" /> Nuevo Comité
                </button>
              </div>
            </div>
          </div>

          {/* Estadísticas y acciones */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              Mostrando {comitesFiltrados.length} de {comites.length} comités
            </div>
            <button 
              onClick={exportToExcel} 
              disabled={comitesFiltrados.length === 0 || loading} 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                comitesFiltrados.length > 0 && !loading 
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700" 
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Download className="w-4 h-4" /> 
              Exportar a Excel
            </button>
          </div>

          {/* Tabla de comités */}
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
                    <th className="px-6 py-4 text-left text-cyan-400 cursor-pointer hover:text-cyan-300" onClick={() => handleSort("epoca")}>
                      <div className="flex items-center gap-2">
                        Época {sortField === "epoca" && <ArrowUpDown className="w-4 h-4" />}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-cyan-400 cursor-pointer hover:text-cyan-300" onClick={() => handleSort("estado")}>
                      <div className="flex items-center gap-2">
                        Estado {sortField === "estado" && <ArrowUpDown className="w-4 h-4" />}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-cyan-400">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {comitesFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-4">
                          <Building className="w-16 h-16 text-gray-500" />
                          <div>
                            <p className="text-xl mb-2">No hay comités registrados</p>
                            <p className="text-sm">No se encontraron comités con los filtros aplicados</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    comitesFiltrados.map((comite, index) => (
                      <tr 
                        key={comite.id} 
                        className={`border-b border-gray-700 hover:bg-gray-700/30 transition-colors ${
                          index % 2 === 0 ? "bg-gray-800/20" : "bg-gray-800/40"
                        }`}
                      >
                        <td className="px-6 py-4 text-sm font-mono">{comite.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                              <Building className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-medium">{comite.nombre}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{comite.epoca}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {comite.estado === "activo" ? (
                              <span className="flex items-center gap-2 px-3 py-1 rounded-xl text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                                <CheckCircle className="w-3 h-3" /> Activo
                              </span>
                            ) : (
                              <span className="flex items-center gap-2 px-3 py-1 rounded-xl text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                                <XCircle className="w-3 h-3" /> Inactivo
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => openEditModal(comite)} 
                              className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors" 
                              title="Editar comité"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteComite(comite.id)} 
                              className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" 
                              title="Eliminar comité"
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* Modal para crear/editar comité */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-cyan-500/30 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Building className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-cyan-400">
                  {isEditing ? "Editar Comité" : "Crear Nuevo Comité"}
                </h2>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isEditing ? handleUpdateComite : handleCreateComite} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
                <input 
                  type="text" 
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent" 
                  required
                  placeholder="Ingrese el nombre del comité"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Época</label>
                <input 
                  type="text" 
                  value={formData.epoca}
                  onChange={(e) => setFormData({...formData, epoca: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent" 
                  required
                  placeholder="Ej: 2024-I, 2024-II"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
                <select 
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value as "activo" | "inactivo"})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white rounded-xl border border-gray-600 hover:border-gray-500 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl disabled:opacity-50 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300"
                >
                  <Save className="w-4 h-4" /> {isEditing ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Export wrapper ---------------- */
export default function ProtectedAdminComitesPanel() {
  return (
    <ProtectedRoute allowedRoles={[1]}>
      <AdminComitesPanel />
    </ProtectedRoute>
  );
}