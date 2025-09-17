"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  Download,
  X,
  User,
  Users,
  Edit,
  Trash2,
  Search,
  ArrowUpDown,
  Save,
  UserPlus,
  Mail,
  Shield,
  Building,
  CheckCircle,
  XCircle
} from "lucide-react";
import FloatingInput from "@/components/iu/floatingInput";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import Footer from "@/components/footer/footer";
import api from "@/services/api";
import axios from "axios";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/* ---------------- Types ---------------- */
interface Usuario {
  id?: number;
  nombres: string;
  apellidos: string;
  email: string;
  password?: string;
  estado: string;
  rol: string;
  rolId: number;
  comiteNombre: string | null;
  comiteId?: number | null;
  fecha_registro?: string;
  fecha_actualizacion?: string;
}

interface Comite {
  id: number;
  nombre: string;
}

interface FormErrors {
  nombres?: string;
  apellidos?: string;
  email?: string;
  password?: string;
  comiteId?: string;
}

/* ---------------- Main component ---------------- */
function AdminUserCRUD() {
  // Estados principales
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);
  const [comites, setComites] = useState<Comite[]>([]);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Estados del sidebar (siguiendo el patrón del AdminDashboard)
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

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [filterComite, setFilterComite] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [filterRol, setFilterRol] = useState("todos");
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Estados para modales y formularios
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState<Usuario>({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    estado: "activo",
    rol: "Usuario",
    rolId: 2,
    comiteNombre: null,
    comiteId: null
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  

  // Detectar móvil (copiado del AdminDashboard)
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

  // Calcular margen dinámico
  const getMarginLeft = () => {
    if (isMobile) return 'ml-0';
    return sidebarExpanded ? 'ml-64' : 'ml-20';
  };

  // Autenticación inicial
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
      fetchComites();
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Funciones API
  const fetchUsuarios = async (): Promise<void> => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get<Usuario[]>("/usuarios");
      setUsuarios(response.data);
      setUsuariosFiltrados(response.data);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComites = async (): Promise<void> => {
    try {
      const response = await api.get<Comite[]>("/comites");
      setComites(response.data);
    } catch (err) {
      console.error("Error al obtener comités:", err);
    }
  };

  const handleApiError = (err: unknown) => {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }
      setError(err.response?.data?.error || "Error en el servidor");
    } else {
      setError("Error de conexión al servidor");
    }
  };

  // Validación de formulario
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.nombres.trim()) errors.nombres = "El nombre es requerido";
    if (!formData.apellidos.trim()) errors.apellidos = "Los apellidos son requeridos";
    if (!formData.email.trim()) {
      errors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email inválido";
    }
    
    // Solo validar password en creación
    if (!currentUser && (!formData.password || formData.password.length < 6)) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // CRUD Operations
  const createUser = async (): Promise<void> => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");
      
      const userData = {
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        email: formData.email.trim(),
        password: formData.password,
        rolId: formData.rolId,
        estado: formData.estado,
        comiteId: formData.comiteId || null
      };

      await api.post("/usuario", userData);
      setSuccessMessage("Usuario creado exitosamente");
      setShowCreateModal(false);
      resetForm();
      fetchUsuarios();
    } catch (err) {
      console.error("Error al crear usuario:", err);
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (): Promise<void> => {
    if (!currentUser || !validateForm()) return;

    try {
      setLoading(true);
      setError("");
      
      const userData = {
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        email: formData.email.trim(),
        rolId: formData.rolId,
        estado: formData.estado,
        comiteId: formData.comiteId || null
      };

      // Si se proporcionó password, incluirlo
      if (formData.password && formData.password.trim()) {
        (userData as typeof userData & { password: string }).password = formData.password;
      }

      await api.put(`/usuarios/${currentUser.id}`, userData);
      setSuccessMessage("Usuario actualizado exitosamente");
      setShowEditModal(false);
      resetForm();
      fetchUsuarios();
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (): Promise<void> => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError("");
      await api.delete(`/usuarios/${currentUser.id}`);
      setSuccessMessage("Usuario eliminado exitosamente");
      setShowDeleteModal(false);
      resetForm();
      fetchUsuarios();
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  // Funciones de utilidad
  const resetForm = () => {
    setFormData({
      nombres: "",
      apellidos: "",
      email: "",
      password: "",
      estado: "activo",
      rol: "Usuario",
      rolId: 2,
      comiteNombre: null,
      comiteId: null
    });
    setCurrentUser(null);
    setFormErrors({});
  };

  const openEditModal = (usuario: Usuario) => {
    setCurrentUser(usuario);
    setFormData({
      ...usuario,
      password: "",
      comiteId: usuario.comiteId || null
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (usuario: Usuario) => {
    setCurrentUser(usuario);
    setShowDeleteModal(true);
  };

  // Filtrado y ordenamiento
  const filtrarUsuarios = useCallback(() => {
    let filtered = [...usuarios];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(usuario => 
        usuario.nombres.toLowerCase().includes(term) ||
        usuario.apellidos.toLowerCase().includes(term) ||
        usuario.email.toLowerCase().includes(term) ||
        (usuario.comiteNombre && usuario.comiteNombre.toLowerCase().includes(term))
      );
    }

    if (filterComite !== "todos") {
      if (filterComite === "sin-comite") {
        filtered = filtered.filter(usuario => !usuario.comiteNombre);
      } else {
        filtered = filtered.filter(usuario => usuario.comiteNombre === filterComite);
      }
    }

    if (filterEstado !== "todos") {
      filtered = filtered.filter(usuario => usuario.estado === filterEstado);
    }

    if (filterRol !== "todos") {
      filtered = filtered.filter(usuario => usuario.rolId.toString() === filterRol);
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      
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
          aValue = a.id || 0;
          bValue = b.id || 0;
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

  // Exportar a Excel
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
      { header: "Fecha Registro", key: "fecha_registro", width: 15 },
    ];

    usuariosFiltrados.forEach(usuario => {
      worksheet.addRow({
        id: usuario.id,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        email: usuario.email,
        estado: usuario.estado,
        rol: usuario.rol,
        comite: usuario.comiteNombre || "Sin comité",
        fecha_registro: usuario.fecha_registro ? new Date(usuario.fecha_registro).toLocaleDateString("es-PE") : ""
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `usuarios_crud_${new Date().toISOString().split("T")[0]}.xlsx`);
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

  const comitesUnicos = Array.from(new Set(usuarios.map(u => u.comiteNombre).filter(Boolean))) as string[];

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Sidebar fijo */}
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      {/* Header fijo */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <Header />
      </div>

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

      {/* Contenido principal */}
      <div className={`relative z-10 transition-all duration-300 ease-in-out ${getMarginLeft()}`}>
        <div className="p-6 max-w-7xl mx-auto">
          
          {/* Título */}
          <div className="mt-20 mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Gestión de Usuarios
            </h1>
            <p className="text-gray-400">Administra usuarios del sistema</p>
          </div>

          {/* Mensajes */}
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                  {comitesUnicos.map(comite => (
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
                  <option value="todos">Todos</option>
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
                  <option value="todos">Todos</option>
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
              Exportar Excel
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
                            <p className="text-xl mb-2">No hay usuarios</p>
                            <p className="text-sm">
                              {usuarios.length === 0 ? "No se encontraron usuarios registrados" : "No hay usuarios que coincidan con los filtros"}
                            </p>
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
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            usuario.estado === 'activo' 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {usuario.estado === 'activo' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                            {usuario.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            usuario.rolId === 1 
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            <Shield className="w-3 h-3 mr-1" />
                            {usuario.rol}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => openEditModal(usuario)} 
                              className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors" 
                              title="Editar usuario"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => openDeleteModal(usuario)} 
                              className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" 
                              title="Eliminar usuario"
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

      {/* Modal de Crear Usuario */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-4xl bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-cyan-500/20 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-cyan-400">Crear Nuevo Usuario</h2>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              <form onSubmit={(e) => { e.preventDefault(); createUser(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <FloatingInput
                      placeholder="Nombres"
                      id="nombres"
                      name="nombres"
                      type="text"
                      required
                      value={formData.nombres}
                      onChange={(e) => setFormData({...formData, nombres: e.target.value.toUpperCase()})}
                    />
                    {formErrors.nombres && <p className="mt-1 text-red-400 text-sm">{formErrors.nombres}</p>}
                  </div>

                  <div>
                    <FloatingInput
                      placeholder="Apellidos"
                      id="apellidos"
                      name="apellidos"
                      type="text"
                      required
                      value={formData.apellidos}
                      onChange={(e) => setFormData({...formData, apellidos: e.target.value.toUpperCase()})}
                    />
                    {formErrors.apellidos && <p className="mt-1 text-red-400 text-sm">{formErrors.apellidos}</p>}
                  </div>

                  <div>
                    <FloatingInput
                      placeholder="Correo electrónico"
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                    {formErrors.email && <p className="mt-1 text-red-400 text-sm">{formErrors.email}</p>}
                  </div>

                  <div>
                    <FloatingInput
                      placeholder="Contraseña"
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    {formErrors.password && <p className="mt-1 text-red-400 text-sm">{formErrors.password}</p>}
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2 text-gray-300 text-sm font-medium">
                      <Shield className="w-4 h-4 text-cyan-400" />
                      Rol del usuario
                    </div>
                    <select
                      value={formData.rolId}
                      onChange={(e) => {
                        const rolId = parseInt(e.target.value);
                        setFormData({
                          ...formData, 
                          rolId,
                          rol: rolId === 1 ? "Administrador" : "Usuario"
                        });
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-gray-900/70 border border-cyan-500/40 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                    >
                      <option value={2}>Usuario</option>
                      <option value={1}>Administrador</option>
                    </select>
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2 text-gray-300 text-sm font-medium">
                      <CheckCircle className="w-4 h-4 text-cyan-400" />
                      Estado
                    </div>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({...formData, estado: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-900/70 border border-cyan-500/40 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>

                  <div className="relative md:col-span-2">
                    <div className="flex items-center gap-2 mb-2 text-gray-300 text-sm font-medium">
                      <Users className="w-4 h-4 text-cyan-400" />
                      Selecciona el comité
                    </div>
                    <select
                      value={formData.comiteId || ""}
                      onChange={(e) => {
                        const comiteId = e.target.value ? parseInt(e.target.value) : null;
                        const comite = comites.find(c => c.id === comiteId);
                        setFormData({
                          ...formData, 
                          comiteId,
                          comiteNombre: comite?.nombre || null
                        });
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-gray-900/70 border border-cyan-500/40 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                    >
                      <option value="">-- Sin comité --</option>
                      {comites.map(comite => (
                        <option key={comite.id} value={comite.id}>{comite.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-8 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-3 rounded-xl transition-all duration-500 flex items-center gap-2 ${
                      loading 
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed" 
                        : "bg-transparent hover:bg-gradient-to-r hover:from-green-600 hover:to-emerald-600 text-green-400 hover:text-white font-bold border-2 border-green-500/50 transform hover:scale-105 hover:shadow-2xl"
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    {loading ? "Creando..." : "Crear Usuario"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Editar Usuario */}
      {showEditModal && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-4xl bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-cyan-500/20 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Edit className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-cyan-400">Editar Usuario</h2>
                  <p className="text-sm text-gray-400">ID: {currentUser.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              <form onSubmit={(e) => { e.preventDefault(); updateUser(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <FloatingInput
                      placeholder="Nombres"
                      id="nombres-edit"
                      name="nombres"
                      type="text"
                      required
                      value={formData.nombres}
                      onChange={(e) => setFormData({...formData, nombres: e.target.value.toUpperCase()})}
                    />
                    {formErrors.nombres && <p className="mt-1 text-red-400 text-sm">{formErrors.nombres}</p>}
                  </div>

                  <div>
                    <FloatingInput
                      placeholder="Apellidos"
                      id="apellidos-edit"
                      name="apellidos"
                      type="text"
                      required
                      value={formData.apellidos}
                      onChange={(e) => setFormData({...formData, apellidos: e.target.value.toUpperCase()})}
                    />
                    {formErrors.apellidos && <p className="mt-1 text-red-400 text-sm">{formErrors.apellidos}</p>}
                  </div>

                  <div>
                    <FloatingInput
                      placeholder="Correo electrónico"
                      id="email-edit"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                    {formErrors.email && <p className="mt-1 text-red-400 text-sm">{formErrors.email}</p>}
                  </div>

                  <div>
                    <FloatingInput
                      placeholder="Nueva contraseña (opcional)"
                      id="password-edit"
                      name="password"
                      type="password"
                      value={formData.password || ""}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    <p className="mt-1 text-xs text-gray-500">Solo completa si quieres cambiar la contraseña</p>
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2 text-gray-300 text-sm font-medium">
                      <Shield className="w-4 h-4 text-cyan-400" />
                      Rol del usuario
                    </div>
                    <select
                      value={formData.rolId}
                      onChange={(e) => {
                        const rolId = parseInt(e.target.value);
                        setFormData({
                          ...formData, 
                          rolId,
                          rol: rolId === 1 ? "Administrador" : "Usuario"
                        });
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-gray-900/70 border border-cyan-500/40 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                    >
                      <option value={2}>Usuario</option>
                      <option value={1}>Administrador</option>
                    </select>
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2 text-gray-300 text-sm font-medium">
                      <CheckCircle className="w-4 h-4 text-cyan-400" />
                      Estado
                    </div>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({...formData, estado: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-900/70 border border-cyan-500/40 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>

                  <div className="relative md:col-span-2">
                    <div className="flex items-center gap-2 mb-2 text-gray-300 text-sm font-medium">
                      <Users className="w-4 h-4 text-cyan-400" />
                      Selecciona el comité
                    </div>
                    <select
                      value={formData.comiteId || ""}
                      onChange={(e) => {
                        const comiteId = e.target.value ? parseInt(e.target.value) : null;
                        const comite = comites.find(c => c.id === comiteId);
                        setFormData({
                          ...formData, 
                          comiteId,
                          comiteNombre: comite?.nombre || null
                        });
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-gray-900/70 border border-cyan-500/40 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                    >
                      <option value="">-- Sin comité --</option>
                      {comites.map(comite => (
                        <option key={comite.id} value={comite.id}>{comite.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-8 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-3 rounded-xl transition-all duration-500 flex items-center gap-2 ${
                      loading 
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed" 
                        : "bg-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 text-blue-400 hover:text-white font-bold border-2 border-blue-500/50 transform hover:scale-105 hover:shadow-2xl"
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    {loading ? "Actualizando..." : "Actualizar Usuario"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmar Eliminación */}
      {showDeleteModal && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md bg-gray-800 rounded-2xl border border-red-500/30 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-red-400">Eliminar Usuario</h2>
              </div>
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">¿Estás seguro?</h3>
                <p className="text-gray-400 mb-4">
                  Esta acción eliminará permanentemente al usuario:
                </p>
                <div className="bg-gray-700/50 rounded-xl p-4 mb-4">
                  <p className="font-medium text-white">{currentUser.nombres} {currentUser.apellidos}</p>
                  <p className="text-sm text-gray-400">{currentUser.email}</p>
                  <p className="text-sm text-gray-400">{currentUser.comiteNombre || "Sin comité"}</p>
                </div>
                <p className="text-red-400 text-sm">Esta acción no se puede deshacer.</p>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={deleteUser}
                  disabled={loading}
                  className={`px-6 py-3 rounded-xl transition-colors flex items-center gap-2 ${
                    loading 
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed" 
                      : "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800"
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  {loading ? "Eliminando..." : "Eliminar Usuario"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Export wrapper ---------------- */
export default function ProtectedAdminUserCRUD() {
  return (
    <ProtectedRoute allowedRoles={[1]}>
      <AdminUserCRUD />
    </ProtectedRoute>
  );
}