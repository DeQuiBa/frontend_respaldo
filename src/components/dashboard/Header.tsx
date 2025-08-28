'use client';

import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, User, Menu, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from './themeProvider';
import { useAuth } from '@/context/authContext';
import Link from 'next/link';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  title?: string;
}

const roleNames: Record<number, string> = {
  1: 'Administrador',
  2: 'Recepcionista',
  3: 'Paciente',
  4: 'Odontólogo',
};

export default function Header({ sidebarOpen, setSidebarOpen, title = 'Dashboard' }: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  return (
    <header className="sticky top-0 z-30 header-style backdrop-blur-md border-b">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center">
            <button
              className="text-secondary hover:text-primary lg:hidden mr-4"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Abrir menú"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-primary">{title}</h1>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-full transition-colors"
              aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-secondary" />
              ) : (
                <Sun className="w-4 h-4 text-secondary" />
              )}
            </button>

            <Link
              href="https://wa.me/12345678900"
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-full transition-colors"
              aria-label="Ayuda"
            >
              <HelpCircle className="w-4 h-4 text-secondary" />
            </Link>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>

            {user && (
              <div className="relative" ref={userMenuRef}>
                <button
                  className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg p-2 transition-colors"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="Menú de usuario"
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-gray dark:text-gray">
                      {user.primer_nombre} {user.apellido_paterno}
                    </p>
                    <p className="text-xs font-medium text-gray dark:text-gray">
                      {roleNames[user.rolId] || 'Usuario'}
                    </p>
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.primer_nombre} {user.apellido_paterno}
                      </p>
                      <p className="text-xs text-gray dark:text-gray-100">
                        {roleNames[user.rolId] || 'Usuario'}
                      </p>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/dashboard/home"
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md block"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Inicio
                      </Link>
                      <Link
                        href="/profile"
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md block"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Mi Perfil
                      </Link>
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      <button
                        className="w-full flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
