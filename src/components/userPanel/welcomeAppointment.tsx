"use client";

import React from 'react';
import { useAuth } from '@/context/authContext';
import { User, Clock, Calendar } from 'lucide-react';

const roleNames: Record<number, string> = {
  3: 'Paciente'
};

const roleDescriptions: Record<number, string> = {
  3: "Gestione sus citas: pendientes, confirmadas o realizadas. Puede cancelar las pendientes (excepto las del mismo día) y revisar observaciones si la cita ya fue realizada."
};

const roleColors: Record<number, string> = {
  3: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
};

export default function WelcomeMessageAppointment() {
  const { user } = useAuth();

  if (!user) return null;

  const currentTime = new Date();
  
  const getGreeting = () => {
    return 'Historial de citas de';
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
                 {`${getGreeting()} ${user.primer_nombre} ${user.apellido_paterno}`}
                </h1>
                <p className="text-[var(--text-secondary)]">
                  Panel para ver tus citas
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

      </div>
  );
}