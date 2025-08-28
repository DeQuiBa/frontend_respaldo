"use client";

import React from 'react';
import { useAuth } from '@/context/authContext';
import { User, Clock, Calendar, Activity } from 'lucide-react';

const roleNames: Record<number, string> = {
  1: 'Administrador',
  2: 'Recepcionista', 
  3: 'Paciente',
  4: 'Odontólogo'
};

const roleDescriptions: Record<number, string> = {
  1: 'Tiene acceso completo al sistema para gestionar usuarios, citas y configuraciones.',
  2: 'Encargado de la gestión de citas, pacientes y atención al cliente.',
  3: 'Puede ver sus citas, historial médico y gestionar su perfil personal.',
  4: 'Profesional dental con acceso a historiales, tratamientos y gestión de pacientes.'
};

const roleColors: Record<number, string> = {
  1: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  2: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  3: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  4: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300'
};

export default function WelcomeMessage() {
  const { user } = useAuth();

  if (!user) return null;

  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  
  const getGreeting = () => {
    if (currentHour < 12) return 'Buenos días';
    if (currentHour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mb-8">
      {/* Mensaje principal de bienvenida */}
      <div className="bg-[var(--card-bg)] border-[var(--card-border)] rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                 {`${getGreeting()}, ${user.primer_nombre} ${user.apellido_paterno}`}
                </h1>
                <p className="text-[var(--text-secondary)]">
                  Bienvenido de vuelta a tu panel de control
                </p>
              </div>
            </div>

            {/* Información del rol */}
            <div className="bg-[var(--main-bg)] rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  Usted es:
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[user.rolId]}`}>
                  {roleNames[user.rolId] || 'Usuario'}
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                {roleDescriptions[user.rolId] || 'Usuario del sistema dental.'}
              </p>
            </div>

            {/* Información adicional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <Calendar className="w-4 h-4" />
                <span>{formatDate()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <Clock className="w-4 h-4" />
                <span>{formatTime()}</span>
              </div>
            </div>
          </div>

          {/* Indicador de estado */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-[var(--text-secondary)]">En línea</span>
          </div>
        </div>
      </div>

      {/* Tarjetas de resumen rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--card-bg)] border-[var(--card-border)] rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Estado del Sistema</p>
              <p className="text-xs text-[var(--text-secondary)]">Operativo</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border-[var(--card-border)] rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Perfil</p>
              <p className="text-xs text-[var(--text-secondary)]">Activo</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border-[var(--card-border)] rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Última Sesión</p>
              <p className="text-xs text-[var(--text-secondary)]">Hoy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}