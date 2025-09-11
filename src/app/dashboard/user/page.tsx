"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import React, { useState, useRef } from 'react';
import { Plus, Download, Upload, Calendar, DollarSign, Activity, Hash, Receipt, Calculator, X, Save, FileText } from 'lucide-react';
import Header from "@/components/navbar/headerUser";

interface TransactionRow {
  id: string;
  fecha: string;
  tipo: 'ingreso' | 'egreso';
  actividad: string;
  codigo: string;
  voucher: File | null;
  cantidad: number;
}

interface FormData {
  fecha: string;
  tipo: 'ingreso' | 'egreso';
  actividad: string;
  codigo: string;
  voucher: File | null;
  cantidad: string;
}

function IncomeExpenseTracker() {
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    fecha: new Date().toISOString().split('T')[0],
    tipo: 'ingreso',
    actividad: '',
    codigo: '',
    voucher: null,
    cantidad: ''
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Función para abrir modal
  const openModal = () => {
    setShowModal(true);
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      tipo: 'ingreso',
      actividad: '',
      codigo: '',
      voucher: null,
      cantidad: ''
    });
    setErrors({});
  };

  // Función para cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      tipo: 'ingreso',
      actividad: '',
      codigo: '',
      voucher: null,
      cantidad: ''
    });
    setErrors({});
  };

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.fecha) newErrors.fecha = 'La fecha es requerida';
    if (!formData.actividad.trim()) newErrors.actividad = 'La actividad es requerida';
    if (!formData.codigo.trim()) newErrors.codigo = 'El código es requerido';
    if (!formData.cantidad || parseFloat(formData.cantidad) <= 0) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para guardar transacción
  const saveTransaction = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simular carga
    await new Promise(resolve => setTimeout(resolve, 800));

    const newTransaction: TransactionRow = {
      id: Date.now().toString(),
      fecha: formData.fecha,
      tipo: formData.tipo,
      actividad: formData.actividad.trim(),
      codigo: formData.codigo.trim(),
      voucher: formData.voucher,
      cantidad: parseFloat(formData.cantidad)
    };

    setTransactions([...transactions, newTransaction]);
    setIsLoading(false);
    closeModal();
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (field: keyof FormData, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Función para manejar carga de archivos
  const handleFileUpload = (file: File | null) => {
    handleInputChange('voucher', file);
  };

  // Calcular totales
  const ingresosTotales = transactions
    .filter(t => t.tipo === 'ingreso')
    .reduce((sum, t) => sum + (t.cantidad || 0), 0);
  
  const egresosTotales = transactions
    .filter(t => t.tipo === 'egreso')
    .reduce((sum, t) => sum + (t.cantidad || 0), 0);
  
  const diferencia = ingresosTotales - egresosTotales;

  // Exportar a Excel
  const exportToExcel = () => {
    if (transactions.length === 0) {
      alert('No hay datos para exportar');
      return;
    }
    
    const csvContent = [
      ['Fecha', 'Tipo', 'Actividad', 'Código', 'Voucher', 'Cantidad'],
      ...transactions.map(t => [
        t.fecha,
        t.tipo.toUpperCase(),
        t.actividad,
        t.codigo,
        t.voucher ? t.voucher.name : 'Sin archivo',
        t.cantidad
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `control_financiero_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Efecto de mouse
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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


        {/* Botones superiores */}
        <div className="mb-6 flex flex-wrap gap-4 justify-between items-center">
          <button
            onClick={openModal}
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
                      <Receipt className="w-4 h-4" />
                      Voucher
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-cyan-400">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4" />
                      Cantidad
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
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
                      <td className="px-6 py-4 text-sm">{transaction.fecha}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          transaction.tipo === 'ingreso' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {transaction.tipo.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{transaction.actividad}</td>
                      <td className="px-6 py-4 text-sm font-mono">{transaction.codigo}</td>
                      <td className="px-6 py-4">
                        {transaction.voucher ? (
                          <div className="flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-green-400" />
                            <span className="text-xs text-green-400 truncate max-w-32">
                              {transaction.voucher.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">Sin archivo</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${transaction.tipo === 'ingreso' ? 'text-green-400' : 'text-red-400'}`}>
                          ${transaction.cantidad.toFixed(2)}
                        </span>
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
              <h2 className="text-2xl font-bold text-cyan-400">Nueva Transacción</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <div className="p-6 space-y-4">
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
                  value={formData.tipo}
                  onChange={(e) => handleInputChange('tipo', e.target.value as 'ingreso' | 'egreso')}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
                >
                  <option value="ingreso">💰 Ingreso</option>
                  <option value="egreso">💸 Egreso</option>
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
                  Código de Referencia
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
                  Voucher / Comprobante (Opcional)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
                    accept="image/*,.pdf"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    {formData.voucher ? 'Cambiar archivo' : 'Seleccionar archivo'}
                  </button>
                  {formData.voucher && (
                    <span className="text-sm text-green-400 truncate flex-1">
                      📄 {formData.voucher.name}
                    </span>
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
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Transacción
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
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