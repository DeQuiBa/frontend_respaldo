"use client";

import { useState, useCallback } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import WelcomeMessage from "@/components/userPanel/welcomeDental";
import { ThemeProvider } from "@/components/dashboard/themeProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthProvider } from "@/context/authContext";
import "@/app/globals.css";
import { useEffect } from "react";

function DashboardContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const memoizedSetSidebarOpen = useCallback((open: boolean) => setSidebarOpen(open), []);
  useEffect(() => {
    const hasReloaded = sessionStorage.getItem("dashboardReloaded");
    
    if (!hasReloaded) {
      sessionStorage.setItem("dashboardReloaded", "true");
      window.location.reload();
    }
  }, []);


  return (
    <div className="flex h-screen bg-[var(--background)] text-[var(--foreground)] overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={memoizedSetSidebarOpen} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={memoizedSetSidebarOpen}
          title="Control Dental"
        />

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[var(--main-bg)]">
          <div className="p-4 lg:p-6">
            {/* Welcome Message */}
            <WelcomeMessage />
            
            {/* Clinic Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Payment Methods */}
              <div className="bg-[var(--card-bg)] border-[var(--card-border)] rounded-lg shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    Medios de Pago
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm text-[var(--text-secondary)]">Efectivo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-sm text-[var(--text-secondary)]">Tarjeta de Débito/Crédito</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span className="text-sm text-[var(--text-secondary)]">Transferencia Bancaria</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span className="text-sm text-[var(--text-secondary)]">Yape / Plin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    <span className="text-sm text-[var(--text-secondary)]">Planes de Financiamiento</span>
                  </div>
                </div>
              </div>

              {/* Promotions */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    Promociones
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="bg-[var(--card-bg)] rounded-lg p-3">
                    <p className="text-sm font-medium text-[var(--text-primary)]">20% OFF Primera Consulta</p>
                    <p className="text-xs text-[var(--text-secondary)]">Para nuevos pacientes</p>
                  </div>
                  <div className="bg-[var(--card-bg)] rounded-lg p-3">
                    <p className="text-sm font-medium text-[var(--text-primary)]">Blanqueamiento + Limpieza</p>
                    <p className="text-xs text-[var(--text-secondary)]">Paquete especial S/. 280</p>
                  </div>
                  <div className="bg-[var(--card-bg)] rounded-lg p-3">
                    <p className="text-sm font-medium text-[var(--text-primary)]">Plan Familiar</p>
                    <p className="text-xs text-[var(--text-secondary)]">15% descuento en tratamientos</p>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="bg-[var(--card-bg)] border-[var(--card-border)] rounded-lg shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    Servicios
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--text-secondary)]">Consulta General</span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">S/. 50</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--text-secondary)]">Limpieza Dental</span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">S/. 80</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--text-secondary)]">Blanqueamiento</span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">S/. 200</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--text-secondary)]">Ortodoncia</span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">Desde S/. 800</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--text-secondary)]">Implantes</span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">Desde S/. 1,200</span>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-[var(--card-bg)] border-[var(--card-border)] rounded-lg shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    Horarios
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">Lunes - Viernes</span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">8:00 AM - 7:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">Sábados</span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">Domingos</span>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">Cerrado</span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--divider)]">
                    <p className="text-xs text-[var(--text-secondary)]">
                      📞 Emergencias 24/7: (01) 234-5678
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-[var(--card-bg)] border-[var(--card-border)] rounded-lg shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    Contacto
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">📍 Dirección</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Av. Principal 123<br />
                      San Vicente de Cañete, Lima
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">📞 Teléfonos</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Fijo: (01) 234-5678<br />
                      Móvil: 987-654-321
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">✉️ Email</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      info@consultoriodental.com
                    </p>
                  </div>
                </div>
              </div>

              {/* Policies */}
              <div className="bg-[var(--card-bg)] border-[var(--card-border)] rounded-lg shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    Políticas
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                    <p className="text-xs font-medium text-yellow-900 dark:text-yellow-200">
                      ⏰ Cancelaciones
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-600">
                      Mínimo 2 horas de anticipación
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3">
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
                      💳 Garantía
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-400">
                      6 meses en tratamientos
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-3">
                    <p className="text-xs font-medium text-green-900 dark:text-green-300">
                      🏥 Bioseguridad
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-900">
                      Protocolos certificados
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
          <div className="min-h-screen">
            <DashboardContent />
          </div>
        </ProtectedRoute>
      </ThemeProvider>
    </AuthProvider>
  );
}