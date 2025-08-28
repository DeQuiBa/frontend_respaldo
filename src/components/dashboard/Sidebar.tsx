"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname} from "next/navigation";
import { useAuth } from "@/context/authContext"; // ← sin 'hasRole'
import {
  Home,
  User,
  Calendar,
  Save,
  FileText,
  HelpCircle,
  LogOut,
  Hospital,
  Users,
  X,
  Stethoscope,
  Clock,
  Workflow,
  ChevronLeft,
  ChevronRight,
  BookOpenIcon,
  PieChart
} from "lucide-react";
import { MdEmail } from "react-icons/md";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface MenuItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  group?: string;
  roles?: number[];
}

function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const pathname = usePathname();
  const trigger = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLDivElement>(null);

  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth(); // ← usamos logout aquí

  const getFilteredMenuItems = (): MenuItem[] => {
    if (!user) return [];

    const allItems: MenuItem[] = [
      { href: "/dashboard/home", icon: <Home size={18} />, label: "Inicio", group: "Principal" },
      { href: "/dashboard/personalHistory", icon: <Calendar size={18} />, label: "Historial", group: "Paciente", roles: [3] }, //terminado Paciente -- falta botón observaciones
      { href: "/dashboard/findAppointmentAdministrator",  icon: <Calendar size={18} />, label: "Citas", group: "Administrativo", roles: [1, 2] },//terminado Recepcionista y administrador 
      { href: "/dashboard/allPatient", icon: <User size={18} />, label: "Pacientes", group: "Administrativo", roles: [1, 2] }, //Implementado -- traer historial de pacientes -- falta historial
      { href: "/dashboard/MyDentalAppointment", icon: <FileText size={18} />, label: "Citas", group: "Clínico", roles: [4] }, //para odontolgo
      { href: "/dashboard/employees", icon: <Users size={18} />, label: "Roles/Estados", group: "Gestiones", roles: [1] },
      { href: "/dashboard/specialties", icon: <BookOpenIcon size={18} />, label: "Especialidades", group: "Gestiones", roles: [1] },
      { href: "/dashboard/treatments", icon: <Stethoscope size={18} />, label: "Tratamientos", group: "Gestiones", roles: [1] },
      { href: "/dashboard/sendEmail", icon: <MdEmail size={18} />, label: "Correo", group: "Gestiones", roles: [1, 2] },
      { href: "/dashboard/statistics", icon: <PieChart size={18} />, label: "Estadísitcas", group: "Gestiones", roles: [1, 2]},
      { href: "/dashboard/dentists", icon: <User size={18} />, label: "Crear", group: "Configuración odontologo", roles: [1, 2] },
      { href: "/dashboard/designationSpecialties", icon: <Stethoscope size={18} />, label: "Especialidades", group: "Configuración odontologo", roles: [1, 2]},
      { href: "/dashboard/schedules", icon: <Clock size={18} />, label: "Turnos", group: "Configuración odontologo", roles: [1, 2]},
      { href: "/dashboard/nonWorkingDays", icon: <Workflow size={18} />, label: "No laborables", group: "Configuración odontologo", roles: [1, 2]},
      { href: "/dashboard/generateSchedules", icon: <Save size={18} />, label: "Generar horario", group: "Configuración odontologo", roles: [1, 2]},
      { href: "https://wa.me/314113180", icon: <HelpCircle size={18} />, label: "Ayuda", roles: [1, 2, 3, 4] } //completo
    ];

    return allItems.filter(item => !item.roles || item.roles.includes(user.rolId));
  };

  const menuItems = getFilteredMenuItems(); 

  const groupedItems = menuItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const group = item.group || "Otros";
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile && !mounted) {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    setIsClient(true);
    setMounted(true);

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mounted, setSidebarOpen]);

  useEffect(() => {
    if (isClient && !isMobile) {
      const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
      setSidebarExpanded(storedSidebarExpanded !== "false");
    }
  }, [isClient, isMobile]);

  useEffect(() => {
    if (!isClient) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(event.target as Node) || trigger.current.contains(event.target as Node)) return;
      setSidebarOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (!sidebarOpen || event.key !== "Escape") return;
      setSidebarOpen(false);
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [sidebarOpen, setSidebarOpen, isClient]);

  useEffect(() => {
    if (!isClient || isMobile) return;

    const body = document.querySelector("body");
    localStorage.setItem("sidebar-expanded", sidebarExpanded.toString());

    if (sidebarExpanded) {
      body?.classList.add("sidebar-expanded");
    } else {
      body?.classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded, isClient, isMobile]);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile, setSidebarOpen]);

  const isActive = useCallback((href: string) => pathname === href, [pathname]);

  const handleLogout = () => {
    logout(); // 
  };

  if (!pathname || !isClient || !mounted) return null;

  const sidebarWidth = isMobile 
    ? 'w-72' 
    : sidebarExpanded || isHovered 
      ? 'w-64' 
      : 'w-20';

  return (
    <>
      {isMobile && (
        <div
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        ref={sidebar}
        className={`
          fixed top-0 left-0 h-full bg-gradient-to-b from-blue-50 to-white
          border-r border-blue-100 shadow-xl z-50 flex flex-col
          transition-all duration-300 ease-in-out
          ${sidebarWidth}
          ${isMobile 
            ? sidebarOpen 
              ? 'translate-x-0' 
              : '-translate-x-full'
            : 'translate-x-0'
          }
        `}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-100 min-h-[4rem]">
          <div
            onClick={() => (window.location.href = "/")}
            className="flex items-center space-x-3 flex-1 cursor-pointer"
          >
            <div className="bg-white p-2 rounded-lg shadow-sm border border-blue-100 flex-shrink-0">
              <Hospital className="text-blue-600" size={24} />
            </div>
            <span
              className={`font-bold text-blue-800 text-lg whitespace-nowrap transition-all duration-300 ${
                isMobile || sidebarExpanded || isHovered
                  ? "opacity-100 w-auto"
                  : "opacity-0 w-0 overflow-hidden"
              }`}
            >
              DentalPanel
            </span>
          </div>

          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0 ml-2"
              aria-label="Cerrar menú"
            >
              <X size={20} className="text-gray-600" />
            </button>
          )}

          {!isMobile && (
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className={`p-2 hover:bg-blue-100 rounded-lg transition-all duration-300 flex-shrink-0 ml-2 ${
                sidebarExpanded || isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              aria-label={sidebarExpanded ? "Contraer menú" : "Expandir menú"}
            >
              {sidebarExpanded ? (
                <ChevronLeft size={16} className="text-gray-600" />
              ) : (
                <ChevronRight size={16} className="text-gray-600" />
              )}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6">
          {Object.entries(groupedItems).map(([group, items]) => (
            <div key={group} className="space-y-2">
              {group !== "Otros" && (
                <h3 className={`text-xs font-semibold text-blue-500 uppercase tracking-wider px-3 transition-all duration-300 ${
                  isMobile || sidebarExpanded || isHovered 
                    ? 'opacity-100' 
                    : 'opacity-0'
                }`}>
                  {group}
                </h3>
              )}
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`group relative flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${
                        isActive(item.href)
                          ? "bg-blue-100 text-blue-800 font-medium shadow-sm"
                          : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                      }`}
                      title={!isMobile && !sidebarExpanded && !isHovered ? item.label : undefined}
                    >
                      <div className={`flex-shrink-0 transition-colors ${
                        isActive(item.href) ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"
                      }`}>
                        {item.icon}
                      </div>

                      <span className={`ml-3 text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                        isMobile || sidebarExpanded || isHovered 
                          ? 'opacity-100 w-auto' 
                          : 'opacity-0 w-0 overflow-hidden'
                      }`}>
                        {item.label}
                      </span>

                      {!isMobile && !sidebarExpanded && !isHovered && (
                        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                          {item.label}
                          <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-blue-100 p-4">
          <button
            onClick={handleLogout}
            className="group relative flex items-center w-full px-3 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
            title={!isMobile && !sidebarExpanded && !isHovered ? "Cerrar sesión" : undefined}
          >
            <div className="flex-shrink-0">
              <LogOut size={18} className="text-gray-500 group-hover:text-red-600 transition-colors" />
            </div>
            <span className={`ml-3 text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              isMobile || sidebarExpanded || isHovered 
                ? 'opacity-100 w-auto' 
                : 'opacity-0 w-0 overflow-hidden'
            }`}>
              Cerrar sesión
            </span>
            {!isMobile && !sidebarExpanded && !isHovered && (
              <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                Cerrar sesión
                <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            )}
          </button>
        </div>
      </div>

      {!isMobile && (
        <div className={`transition-all duration-300 ${sidebarExpanded ? 'w-64' : 'w-20'}`} />
      )}
    </>
  );
}

export default Sidebar;
