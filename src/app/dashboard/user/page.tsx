"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Download, Upload, Calendar, DollarSign, Activity, Hash, Receipt, Calculator, X, Save, FileText, Edit, Trash2, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import Header from "@/components/navbar/headerUser";
import api from "@/services/api";
import Image from "next/image";
import axios from "axios";
import ExcelJS from "exceljs";
import Footer from "@/components/footer/footer";
import { saveAs } from "file-saver";

interface TransactionRow {
  id: number;
  fecha: string;
  tipo_de_cuenta: 'Ingreso' | 'Egreso';
  actividad: string;
  codigo: string;
  cantidad: number;
  voucher?: string; // <- nuevo campo (puede ser null/undefined)
}

interface FormData {
  fecha: string;
  tipo_de_cuenta: 'Ingreso' | 'Egreso';
  actividad: string;
  codigo: string;
  voucher: File | null;
  cantidad: string;
}

interface FormErrors {
  fecha?: string;
  tipo_de_cuenta?: string;
  actividad?: string;
  codigo?: string;
  voucher?: string;
  cantidad?: string;
}

// Componente Lightbox separado
interface LightboxProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  imageTitle?: string;
}

function Lightbox({ isOpen, imageUrl, onClose, imageTitle }: LightboxProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset valores cuando se abre/cierra el lightbox
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  // Manejar teclas de escape y zoom
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          rotate();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  },  [isOpen, onClose]);

  // Prevenir scroll del body cuando el lightbox está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const zoomIn = () => {
    setScale(prev => Math.min(prev * 1.5, 5));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev / 1.5, 0.1));
  };

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const resetImage = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
      <div 
        className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-md flex items-center justify-center"
        onClick={onClose}
      >
      {/* Controles superiores */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-3 bg-gray-800/90 backdrop-blur-md rounded-xl px-6 py-3 border border-gray-600/50">
        <button
          onClick={(e) => { e.stopPropagation(); zoomOut(); }}
          className="p-2 text-white hover:text-cyan-400 hover:bg-gray-700/50 rounded-lg transition-colors"
          title="Alejar (tecla: -)"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        
        <span className="text-white text-sm font-mono min-w-[60px] text-center">
          {Math.round(scale * 100)}%
        </span>
        
        <button
          onClick={(e) => { e.stopPropagation(); zoomIn(); }}
          className="p-2 text-white hover:text-cyan-400 hover:bg-gray-700/50 rounded-lg transition-colors"
          title="Acercar (tecla: +)"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        
        <div className="w-px h-6 bg-gray-600"></div>
        
        <button
          onClick={(e) => { e.stopPropagation(); rotate(); }}
          className="p-2 text-white hover:text-cyan-400 hover:bg-gray-700/50 rounded-lg transition-colors"
          title="Rotar (tecla: R)"
        >
          <RotateCw className="w-5 h-5" />
        </button>
        
        <button
          onClick={(e) => { e.stopPropagation(); resetImage(); }}
          className="px-3 py-1 text-sm text-white hover:text-cyan-400 hover:bg-gray-700/50 rounded-lg transition-colors"
          title="Restablecer vista"
        >
          Reset
        </button>
      </div>

      {/* Botón cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-3 text-white hover:text-red-400 hover:bg-gray-800/50 rounded-full transition-colors"
        title="Cerrar (Esc)"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Título de la imagen */}
      {imageTitle && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-gray-800/90 backdrop-blur-md rounded-lg px-4 py-2 border border-gray-600/50">
          <p className="text-white text-sm font-medium">{imageTitle}</p>
        </div>
      )}

      {/* Contenedor de imagen */}
      <div 
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative transition-transform duration-200 ease-out"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            maxWidth: '90vw',
            maxHeight: '90vh',
          }}
        >
          <Image
            src={imageUrl}
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

      {/* Instrucciones de uso */}
      <div className="absolute bottom-4 right-4 z-10 bg-gray-800/80 backdrop-blur-md rounded-lg px-3 py-2 border border-gray-600/50">
        <p className="text-gray-300 text-xs">
          <span className="text-cyan-400">Esc:</span> Cerrar • 
          <span className="text-cyan-400"> +/-:</span> Zoom • 
          <span className="text-cyan-400"> R:</span> Rotar
        </p>
      </div>
    </div>
  );
}

function IncomeExpenseTracker() {
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionRow | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Estados para el lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState("");
  const [lightboxImageTitle, setLightboxImageTitle] = useState("");
  
  const [formData, setFormData] = useState<FormData>({
    fecha: new Date().toISOString().split('T')[0],
    tipo_de_cuenta: 'Ingreso',
    actividad: '',
    codigo: '',
    voucher: null,
    cantidad: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Función para abrir el lightbox
  const openLightbox = (imageUrl: string, transaction: TransactionRow) => {
    setLightboxImageUrl(imageUrl);
    setLightboxImageTitle(`${transaction.actividad} - ${transaction.fecha}`);
    setLightboxOpen(true);
  };

  // Función para cerrar el lightbox
  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImageUrl("");
    setLightboxImageTitle("");
  };

  // Verificar autenticación al montar
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      window.location.href = '/login';
      return;
    }

    try {
      const user = JSON.parse(userData);
      if (user.rolId !== 2) {
        window.location.href = '/login';
        return;
      }
      setCheckingAuth(false);
      fetchTransactions();
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }, []);

  // Cargar transacciones con manejo de errores mejorado
  const fetchTransactions = async () => {
    try {
      setError("");
      const response = await api.get<TransactionRow[]>('/montos');
      setTransactions(response.data);
    } catch (err: unknown) {
      console.error('Error al obtener transacciones:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        setError(err.response?.data?.error || 'Error al cargar las transacciones');
      } else {
        setError('Error de conexión al servidor');
      }
    }
  };

  // Nuevo estado para la URL de previsualización
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Función para manejar carga de archivos con preview
  const handleFileUpload = (file: File | null) => {
    if (file) {
      // Validar que sea imagen
      const validTypes = ['image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setError("Solo se permiten imágenes PNG, JPG o GIF");
        return;
      }

      handleInputChange('voucher', file);

      // Crear URL temporal para previsualización
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      handleInputChange('voucher', null);
      setPreviewUrl(null);
    }
  };

  // Función para abrir modal
  const openModal = (transaction?: TransactionRow) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        fecha: transaction.fecha,
        tipo_de_cuenta: transaction.tipo_de_cuenta,
        actividad: transaction.actividad,
        codigo: transaction.codigo || '',
        voucher: null,
        cantidad: transaction.cantidad.toString()
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        tipo_de_cuenta: 'Ingreso',
        actividad: '',
        codigo: '',
        voucher: null,
        cantidad: ''
      });
    }
    setShowModal(true);
    setErrors({});
    setError("");
  };

  // Función para cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setEditingTransaction(null);
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      tipo_de_cuenta: 'Ingreso',
      actividad: '',
      codigo: '',
      voucher: null,
      cantidad: ''
    });
    setErrors({});
    setError("");
  };

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fecha) newErrors.fecha = 'La fecha es requerida';
    if (!formData.tipo_de_cuenta) newErrors.tipo_de_cuenta = 'El tipo de transacción es requerido';
    if (!formData.actividad.trim()) newErrors.actividad = 'La actividad es requerida';
    if (!formData.codigo.trim()) newErrors.codigo = 'El código es requerido';
    if (!formData.voucher) newErrors.voucher = 'El voucher es obligatorio';
    if (!formData.cantidad || parseFloat(formData.cantidad) <= 0) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para guardar o actualizar transacción
  const saveTransaction = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError("");
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fecha', formData.fecha);
      formDataToSend.append('tipo_de_cuenta', formData.tipo_de_cuenta);
      formDataToSend.append('actividad', formData.actividad.trim());
      formDataToSend.append('codigo', formData.codigo.trim());
      formDataToSend.append('cantidad', formData.cantidad);
      
      if (formData.voucher) {
        formDataToSend.append('voucher', formData.voucher);
      }

      if (editingTransaction) {
        // Actualizar transacción existente
        await api.put(`/montos/${editingTransaction.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Crear nueva transacción
        await api.post('/montos', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      await fetchTransactions();
      closeModal();

    } catch (err: unknown) {
      console.error('Error al guardar transacción:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        setError(err.response?.data?.error || 'Error al guardar la transacción');
      } else {
        setError('Error de conexión al servidor');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Función para eliminar transacción
  const deleteTransaction = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
      return;
    }

    try {
      setError("");
      await api.delete(`/montos/${id}`);
      await fetchTransactions();
    } catch (err: unknown) {
      console.error('Error al eliminar transacción:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        setError(err.response?.data?.error || 'Error al eliminar la transacción');
      } else {
        setError('Error de conexión al servidor');
      }
    }
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (field: keyof FormData, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Calcular totales (forzar a número)
  const ingresosTotales = transactions
    .filter(t => t.tipo_de_cuenta === 'Ingreso')
    .reduce((sum, t) => sum + Number(t.cantidad || 0), 0);

  const egresosTotales = transactions
    .filter(t => t.tipo_de_cuenta === 'Egreso')
    .reduce((sum, t) => sum + Number(t.cantidad || 0), 0);

  const diferencia = ingresosTotales - egresosTotales;

  // Exportar a Excel
  const exportToExcel = async () => {
    if (transactions.length === 0) {
      setError("No hay datos para exportar");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Transacciones");

    // Cabeceras
    worksheet.columns = [
      { header: "Fecha", key: "fecha", width: 15 },
      { header: "Tipo", key: "tipo_de_cuenta", width: 12 },
      { header: "Actividad", key: "actividad", width: 25 },
      { header: "Código", key: "codigo", width: 15 },
      { header: "Cantidad", key: "cantidad", width: 12 },
      { header: "Voucher", key: "voucher", width: 30 },
    ];

    let totalIngresos = 0;
    let totalEgresos = 0;

    // Filas + imágenes
    for (const t of transactions) {
      if (!t.fecha && !t.tipo_de_cuenta && !t.actividad && !t.codigo && !t.cantidad) {
        continue;
      }

      const row = worksheet.addRow({
        fecha: t.fecha ? t.fecha.split("T")[0] : "",
        tipo_de_cuenta: t.tipo_de_cuenta || "",
        actividad: t.actividad || "",
        codigo: t.codigo || "",
        cantidad: t.cantidad || "",
      });

      // Acumular totales
      const cantidad = Number(t.cantidad) || 0;
      if (t.tipo_de_cuenta?.toLowerCase() === "ingreso") {
        totalIngresos += cantidad;
      } else if (t.tipo_de_cuenta?.toLowerCase() === "egreso") {
        totalEgresos += cantidad;
      }

      if (t.voucher) {
        try {
          const res = await fetch(t.voucher);
          const blob = await res.blob();
          const buffer = await blob.arrayBuffer();

          const imageId = workbook.addImage({
            buffer: buffer,
            extension: "png", // o "jpeg"
          });

          worksheet.addImage(imageId, {
            tl: { col: 5, row: row.number - 1 },
            ext: { width: 100, height: 60 },
          });
        } catch (err) {
          console.error("No se pudo cargar voucher:", err);
        }
      }
    }

    // Línea vacía de separación
    worksheet.addRow([]);

    // Resumen
    const diferencia = totalIngresos - totalEgresos;
    worksheet.addRow(["", "", "INGRESOS TOTALES", "", "", totalIngresos]);
    worksheet.addRow(["", "", "EGRESOS", "", "", totalEgresos]);
    worksheet.addRow(["", "", "DIFERENCIA", "", "", diferencia]);

    // Negrita al resumen
    const last3 = worksheet.lastRow!.number;
    [last3 - 2, last3 - 1, last3].forEach((rowNum) => {
      worksheet.getRow(rowNum).font = { bold: true };
    });

    // Generar archivo y descargar
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer]),
      `control_financiero_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };


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

  // Early return si está verificando autenticación
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
            Control de Ingresos y Egresos
          </h1>
          <p className="text-gray-400">
            Gestiona tus transacciones de manera eficiente
          </p>
        </div>

        {/* Mostrar error general si existe */}
        {error && (
          <div className="mb-6 bg-red-500/20 text-red-400 text-sm rounded-xl p-4 border border-red-500/30">
            {error}
          </div>
        )}

        {/* Botones superiores */}
        <div className="mb-6 flex flex-wrap gap-4 justify-between items-center">
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
          >
            <Plus className="w-5 h-5" />
            AGREGAR TRANSACCIÓN
          </button>
          
          <button
            onClick={exportToExcel}
            disabled={transactions.length === 0}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold ${
              transactions.length > 0 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Download className="w-5 h-5" />
            Exportar a Excel
          </button>
        </div>

        {/* Tabla */}
        <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-700 to-gray-600 border-b border-gray-600">
                  <th className="px-6 py-4 text-left font-semibold text-cyan-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Fecha
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-cyan-400">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Tipo
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-cyan-400">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Actividad
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-cyan-400">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Código
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-cyan-400">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4" />
                      Cantidad
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-cyan-400">
                    Acciones
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-cyan-400">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4" />
                      Voucher
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-4">
                        <FileText className="w-12 h-12 text-gray-500" />
                        <div>
                          <p className="text-xl mb-2">No hay transacciones registradas</p>
                          <p className="text-sm">Haz clic en AGREGAR TRANSACCIÓN para comenzar</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction, index) => (
                    <tr key={transaction.id} className={`border-b border-gray-700 hover:bg-gray-700/30 transition-colors ${index % 2 === 0 ? 'bg-gray-800/20' : 'bg-gray-800/40'}`}>
                      <td className="px-6 py-4 text-sm">
                        {new Date(transaction.fecha).toLocaleDateString("es-PE", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit"
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          transaction.tipo_de_cuenta === 'Ingreso' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {transaction.tipo_de_cuenta.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{transaction.actividad}</td>
                      <td className="px-6 py-4 text-sm font-mono">{transaction.codigo || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${transaction.tipo_de_cuenta === 'Ingreso' ? 'text-green-400' : 'text-red-400'}`}>
                          ${transaction.cantidad.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openModal(transaction)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTransaction(transaction.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {transaction.voucher ? (
                          <div 
                            className="relative w-16 h-16 overflow-hidden group cursor-pointer"
                            onClick={() => openLightbox(transaction.voucher!, transaction)}
                            title="Clic para ver en pantalla completa"
                          >
                            <Image
                              src={transaction.voucher}
                              alt="Voucher"
                              fill
                              className="object-cover rounded-lg border border-gray-600 transition-all duration-300 group-hover:border-cyan-400 group-hover:shadow-lg group-hover:shadow-cyan-500/20"
                            />
                            {/* Overlay con icono de zoom */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
                              <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Sin imagen</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumen */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6 text-center transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-center mb-3">
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-green-400 mb-2">INGRESOS TOTALES</h3>
            <p className="text-3xl font-bold text-white">${ingresosTotales.toFixed(2)}</p>
          </div>

          <div className="bg-gradient-to-br from-red-600/20 to-pink-600/20 backdrop-blur-xl rounded-2xl border border-red-500/30 p-6 text-center transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-center mb-3">
              <DollarSign className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-red-400 mb-2">EGRESOS</h3>
            <p className="text-3xl font-bold text-white">${egresosTotales.toFixed(2)}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6 text-center transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-center mb-3">
              <Calculator className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-blue-400 mb-2">DIFERENCIA</h3>
            <p className={`text-3xl font-bold ${diferencia >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${diferencia.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-cyan-500/30 shadow-2xl transform transition-all duration-300 scale-100">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-cyan-400">
                {editingTransaction ? 'Editar Transacción' : 'Nueva Transacción'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <div className="p-6 space-y-4">
              {/* Mostrar error del formulario si existe */}
              {error && (
                <div className="bg-red-500/20 text-red-400 text-sm rounded-md p-2 mb-4">
                  {error}
                </div>
              )}

              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Fecha
                </label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => handleInputChange('fecha', e.target.value)}
                  className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${
                    errors.fecha ? 'border-red-500 focus:border-red-400' : 'border-gray-600 focus:border-cyan-400'
                  }`}
                />
                {errors.fecha && <p className="text-red-400 text-xs mt-1">{errors.fecha}</p>}
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Tipo de Transacción
                </label>
                <select
                  value={formData.tipo_de_cuenta}
                  onChange={(e) => handleInputChange('tipo_de_cuenta', e.target.value as 'Ingreso' | 'Egreso')}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
                >
                  <option value="Ingreso">Ingreso</option>
                  <option value="Egreso">Egreso</option>
                </select>
              </div>

              {/* Actividad */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Activity className="w-4 h-4 inline mr-2" />
                  Actividad / Descripción
                </label>
                <input
                  type="text"
                  value={formData.actividad}
                  onChange={(e) => handleInputChange('actividad', e.target.value)}
                  placeholder="Describe la actividad o concepto"
                  className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${
                    errors.actividad ? 'border-red-500 focus:border-red-400' : 'border-gray-600 focus:border-cyan-400'
                  }`}
                />
                {errors.actividad && <p className="text-red-400 text-xs mt-1">{errors.actividad}</p>}
              </div>

              {/* Código */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Hash className="w-4 h-4 inline mr-2" />
                  Código de Referencia (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => handleInputChange('codigo', e.target.value)}
                  placeholder="Código único o referencia"
                  className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors font-mono ${
                    errors.codigo ? 'border-red-500 focus:border-red-400' : 'border-gray-600 focus:border-cyan-400'
                  }`}
                />
                {errors.codigo && <p className="text-red-400 text-xs mt-1">{errors.codigo}</p>}
              </div>

              {/* Voucher */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Receipt className="w-4 h-4 inline mr-2" />
                  Voucher / Comprobante (jpeg, jpg) <span className="text-red-400">*</span>
                </label>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
                      accept="image/jpeg,image/jpg"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      type="button"
                      className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      {formData.voucher ? 'Cambiar archivo' : 'Seleccionar archivo'}
                    </button>
                    {formData.voucher && (
                      <span className="text-sm text-green-400 truncate flex-1">
                        {formData.voucher.name}
                      </span>
                    )}
                  </div>

                  {errors.voucher && <p className="text-red-400 text-xs mt-1">{errors.voucher}</p>}

                  {previewUrl && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-400 mb-1">Vista previa:</p>
                      <div className="relative w-full h-60">
                        <Image
                          src={previewUrl}
                          alt="Vista previa del voucher"
                          fill
                          className="object-contain rounded-lg border border-gray-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cantidad */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calculator className="w-4 h-4 inline mr-2" />
                  Cantidad (Monto)
                </label>
                <input
                  type="number"
                  value={formData.cantidad}
                  onChange={(e) => handleInputChange('cantidad', e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${
                    errors.cantidad ? 'border-red-500 focus:border-red-400' : 'border-gray-600 focus:border-cyan-400'
                  }`}
                />
                {errors.cantidad && <p className="text-red-400 text-xs mt-1">{errors.cantidad}</p>}
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
              <button
                onClick={closeModal}
                disabled={isLoading}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveTransaction}
                disabled={isLoading}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  isLoading
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white transform hover:scale-105'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    {editingTransaction ? 'Actualizando...' : 'Guardando...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editingTransaction ? 'Actualizar Transacción' : 'Guardar Transacción'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
      )}

      {/* Lightbox Component */}
      <Lightbox
        isOpen={lightboxOpen}
        imageUrl={lightboxImageUrl}
        imageTitle={lightboxImageTitle}
        onClose={closeLightbox}
      />
      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Footer />
      </div>
    </div>
  );
}

// Exporta el componente envuelto en ProtectedRoute
export default function ProtectedIncomeExpenseTracker() {
  return (
    <ProtectedRoute allowedRoles={[2]}>
      <IncomeExpenseTracker />
    </ProtectedRoute>
  );
}