"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import { Save, User, Mail, Shield, UserCircle, Edit3, Calendar, Activity, X } from "lucide-react";
import Header from "@/components/navbar/headerUser";

interface UserData {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  rol: string;
  rolId: number;
  comiteId: number | null;
  comiteNombre: string;
  estado: string;
}

interface Comite {
  id: number;
  nombre: string;
  epoca?: number;
}

// Componente Modal para mostrar el mensaje de éxito
const SuccessModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative bg-gray-800 border border-cyan-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* Contenido del modal */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 mb-4">
            <svg className="w-8 h-8 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-2">¡Guardado con éxito!</h3>
          <p className="text-gray-300 mb-6">
            Tu información ha sido actualizada correctamente.
          </p>
          
          <button
            onClick={onClose}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default function PerfilPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [, setComites] = useState<Comite[]>([]); 
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    comiteId: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener datos del usuario
        const { data: userData } = await api.get("/usuarios/me");
        setUser(userData);
        setForm({
          nombres: userData.nombres || "",
          apellidos: userData.apellidos || "",
          comiteId: userData.comiteId?.toString() || "",
        });

        // Obtener lista de comités
        try {
          const { data: comitesData } = await api.get("/comites");
          setComites(comitesData || []);
        } catch (comiteError) {
          console.error("Error cargando comités:", comiteError);
          setComites([]); // Establecer array vacío si falla
        }

      } catch (err: unknown) {
        console.error(err);
        toast.error("Error cargando perfil");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    
    try {
      // Simular delay para mostrar loading
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updateData = {
        nombres: form.nombres,
        apellidos: form.apellidos,
        comiteId: form.comiteId ? parseInt(form.comiteId) : null
      };

      await api.put(`/usuarios/${user.id}`, updateData);
      
      // Mostrar modal de éxito en lugar de toast
      setShowSuccessModal(true);
      
      // Actualizar los datos del usuario localmente
      setUser(prev => prev ? {
        ...prev,
        nombres: form.nombres,
        apellidos: form.apellidos,
        comiteId: form.comiteId ? parseInt(form.comiteId) : null
      } : null);
      
    } catch (err: unknown) {
      console.error(err);
      toast.error("Error actualizando perfil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="flex justify-center items-center min-h-[70vh] text-gray-400">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg">Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="flex justify-center items-center min-h-[70vh] text-red-400">
          <div className="text-center">
            <UserCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <p className="text-lg">No se pudo cargar el perfil</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <Header />
      
      {/* Modal de éxito */}
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
      />
      
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
        <div className="absolute top-1/3 right-1/3 w-16 h-16 border border-green-500/40 rotate-45 animate-pulse"></div>
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
      <div className="relative z-10 p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mt-20 mb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl">
              <User className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Mi Perfil
          </h1>
          <p className="text-gray-400 text-lg">
            Gestiona tu información personal y configuraciones
          </p>
        </div>

        {/* Información rápida del usuario */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6 text-center transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-center mb-3">
              <UserCircle className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">USUARIO</h3>
            <p className="text-sm text-white font-medium">{user.nombres} {user.apellidos}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6 text-center transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-center mb-3">
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-purple-400 mb-2">ROL</h3>
            <p className="text-sm text-white font-medium">{user.rol}</p>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6 text-center transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-center mb-3">
              <Activity className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-green-400 mb-2">ESTADO</h3>
            <p className="text-sm text-white font-medium capitalize">{user.estado}</p>
          </div>
        </div>

        {/* Formulario de edición */}
        <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-8 py-6 border-b border-gray-600">
            <div className="flex items-center gap-3">
              <Edit3 className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-cyan-400">Editar Información</h2>
            </div>
            <p className="text-gray-300 mt-2">Actualiza tus datos personales</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Nombres */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
                <User className="w-4 h-4 inline mr-2" />
                Nombres
              </label>
              <input
                type="text"
                name="nombres"
                value={form.nombres}
                onChange={handleChange}
                placeholder="Ingresa tus nombres"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-1 focus:ring-offset-gray-900 focus:border-transparent transition-all duration-300"
              />
            </div>

            {/* Apellidos */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
                <User className="w-4 h-4 inline mr-2" />
                Apellidos
              </label>
              <input
                type="text"
                name="apellidos"
                value={form.apellidos}
                onChange={handleChange}
                placeholder="Ingresa tus apellidos"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-1 focus:ring-offset-gray-900 focus:border-transparent transition-all duration-300"
              />
            </div>


            {/* Información de solo lectura */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="p-6 bg-gradient-to-br from-gray-700/40 to-gray-600/40 backdrop-blur-sm rounded-xl border border-gray-600/50">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <p className="text-sm font-semibold text-blue-400 uppercase tracking-wide">Correo electrónico</p>
                </div>
                <p className="text-white font-medium text-lg">{user.email}</p>
                <p className="text-xs text-gray-400 mt-1">No se puede modificar</p>
              </div>

              {/* Comité actual */}
              <div className="p-6 bg-gradient-to-br from-gray-700/40 to-gray-600/40 backdrop-blur-sm rounded-xl border border-gray-600/50">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <p className="text-sm font-semibold text-purple-400 uppercase tracking-wide">Comité Actual</p>
                </div>
                <p className="text-white font-medium text-lg">
                  {user.comiteNombre || 'Sin comité asignado'}
                </p>
                <p className="text-xs text-gray-400 mt-1">No se puede modificar</p>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-blue-400">Información del Sistema</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">ID de Usuario:</span>
                  <span className="text-white font-mono ml-2">#{user.id}</span>
                </div>
                <div>
                  <span className="text-gray-400">ID de Rol:</span>
                  <span className="text-white font-mono ml-2">#{user.rolId}</span>
                </div>
              </div>
            </div>

            {/* Botón Guardar */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={saving}
                className={`flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-semibold transition-all duration-300 transform ${
                  saving
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-cyan-500/30 hover:scale-105'
                }`}
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Guardando cambios...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer informativo */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Algunos campos no pueden ser modificados por motivos de seguridad.
            <br />
            Contacta al administrador si necesitas cambios adicionales.
          </p>
        </div>
      </div>
    </div>
  );
}