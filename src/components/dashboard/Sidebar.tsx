"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/authContext";
import {
  Home,
  User,
  Calendar,
  Save,
  FileText,
  HelpCircle,
  LogOut,
  Users,
  X,
  Stethoscope,
  Clock,
  Workflow,
  ChevronLeft,
  ChevronRight,
  BookOpenIcon,
  PieChart,
  Rocket,
  Menu
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

  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sidebar-expanded");
      return stored !== "false";
    }
    return true;
  });
  const [isClient, setIsClient] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();

  const getFilteredMenuItems = (): MenuItem[] => {
    if (!user) return [];

    const allItems: MenuItem[] = [
      { href: "/dashboard/admin", icon: <Home size={18} />, label: "Inicio", group: "Principal" },
      { href: "/dashboard/perfilAdmin", icon: <Users size={18} />, label: "Perfil", group: "Principal"},
      { href: "/dashboard/AllUser", icon: <Calendar size={18} />, label: "Usuarios", group: "Administrativo", roles: [1] },
      { href: "/dashboard/EditUsers", icon: <User size={18} />, label: "CRUD", group: "Administrativo", roles: [1]},
      { href: "/dashboard/register", icon: <FileText size={18} />, label: "Registrar", group: "Administrativo", roles: [1]},
      { href: "/dashboard/comite", icon: <Users size={18} />, label: "Comite", group: "Gestiones", roles: [1] },
      { href: "/dashboard/specialties", icon: <BookOpenIcon size={18} />, label: "Especialidades", group: "Gestiones", roles: [1] },
      { href: "/dashboard/treatments", icon: <Stethoscope size={18} />, label: "Tratamientos", group: "Gestiones", roles: [1] },
      { href: "/dashboard/sendEmail", icon: <MdEmail size={18} />, label: "Correo", group: "Gestiones", roles: [1, 2] },
      { href: "/dashboard/statistics", icon: <PieChart size={18} />, label: "Estadísitcas", group: "Gestiones", roles: [1, 2] },
      { href: "/dashboard/dentists", icon: <User size={18} />, label: "Crear", group: "Configuración odontologo", roles: [1, 2] },
      { href: "/dashboard/designationSpecialties", icon: <Stethoscope size={18} />, label: "Especialidades", group: "Configuración odontologo", roles: [1, 2] },
      { href: "/dashboard/schedules", icon: <Clock size={18} />, label: "Turnos", group: "Configuración odontologo", roles: [1, 2] },
      { href: "/dashboard/nonWorkingDays", icon: <Workflow size={18} />, label: "No laborables", group: "Configuración odontologo", roles: [1, 2] },
      { href: "/dashboard/generateSchedules", icon: <Save size={18} />, label: "Generar horario", group: "Configuración odontologo", roles: [1, 2] },
      { href: "https://wa.me/314113180", icon: <HelpCircle size={18} />, label: "Ayuda", roles: [1, 2, 3, 4] }
    ];

    return allItems.filter((item) => !item.roles || item.roles.includes(user.rolId));
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

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [mounted, setSidebarOpen]);

  useEffect(() => {
    if (isClient && !isMobile) {
      const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
      const shouldBeExpanded = storedSidebarExpanded !== "false";
      setSidebarExpanded(shouldBeExpanded);
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
    logout();
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsHovered(false);
    }
  };

  const handleToggleExpanded = () => {
    const newExpanded = !sidebarExpanded;
    setSidebarExpanded(newExpanded);
    localStorage.setItem("sidebar-expanded", newExpanded.toString());
  };

  if (!pathname || !isClient || !mounted) return null;

  const sidebarWidth = isMobile ? "w-72" : sidebarExpanded || isHovered ? "w-64" : "w-20";

  return (
    <>
      {/* Botón hamburguesa solo en móviles */}
      {isMobile && !sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-cyan-600 text-white shadow-lg hover:bg-cyan-500 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>
      )}

      {isMobile && (
        <div
          className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-300 ${
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebar}
        className={`
          fixed top-0 left-0 h-full bg-gradient-to-b from-gray-900 to-gray-800
          border-r border-cyan-500/20 shadow-2xl z-50 flex flex-col
          transition-all duration-300 ease-in-out
          ${sidebarWidth}
          ${
            isMobile
              ? sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full"
              : "translate-x-0"
          }
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header Sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/30 min-h-[4rem] bg-gradient-to-r from-cyan-900/50 to-blue-900/50">
          <div
            onClick={() => (window.location.href = "/")}
            className="flex items-center space-x-3 flex-1 cursor-pointer"
          >
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-2 rounded-lg shadow-lg flex-shrink-0">
              <Rocket className="text-white" size={24} />
            </div>
            <span
              className={`font-bold text-white text-lg whitespace-nowrap transition-all duration-300 ${
                isMobile || sidebarExpanded || isHovered ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
              }`}
            >
              MASHA-SGF
            </span>
          </div>

          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-cyan-500/20 rounded-lg transition-colors flex-shrink-0 ml-2"
              aria-label="Cerrar menú"
            >
              <X size={20} className="text-cyan-300" />
            </button>
          )}

          {!isMobile && (
            <button
              ref={trigger}
              onClick={handleToggleExpanded}
              className={`p-2 hover:bg-cyan-500/20 rounded-lg transition-all duration-300 flex-shrink-0 ml-2 ${
                sidebarExpanded || isHovered ? "opacity-100" : "opacity-0"
              }`}
              aria-label={sidebarExpanded ? "Contraer menú" : "Expandir menú"}
            >
              {sidebarExpanded ? <ChevronLeft size={16} className="text-cyan-300" /> : <ChevronRight size={16} className="text-cyan-300" />}
            </button>
          )}
        </div>

        {/* Contenido del sidebar */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6 scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent">
          {Object.entries(groupedItems).map(([group, items]) => (
            <div key={group} className="space-y-3">
              {group !== "Otros" && (
                <h3
                  className={`text-xs font-semibold text-cyan-400/80 uppercase tracking-wider px-3 transition-all duration-300 ${
                    isMobile || sidebarExpanded || isHovered ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {group}
                </h3>
              )}
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`group relative flex items-center px-3 py-3 rounded-xl transition-all duration-200 ${
                        isActive(item.href)
                          ? "bg-gradient-to-r from-cyan-600/30 to-blue-600/30 text-white font-medium shadow-lg border border-cyan-500/30"
                          : "text-gray-300 hover:bg-cyan-500/10 hover:text-white border border-transparent"
                      }`}
                      title={!isMobile && !sidebarExpanded && !isHovered ? item.label : undefined}
                    >
                      <div
                        className={`flex-shrink-0 transition-colors ${
                          isActive(item.href) ? "text-cyan-300" : "text-gray-400 group-hover:text-cyan-300"
                        }`}
                      >
                        {item.icon}
                      </div>

                      <span
                        className={`ml-3 text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                          isMobile || sidebarExpanded || isHovered ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Sidebar */}
        <div className="border-t border-cyan-500/30 p-4 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm">
          <button
            onClick={handleLogout}
            className="group relative flex items-center w-full px-3 py-3 rounded-xl text-gray-300 hover:bg-red-500/10 hover:text-red-100 transition-all duration-200 border border-transparent hover:border-red-500/30"
          >
            <LogOut size={18} className="text-gray-400 group-hover:text-red-300 transition-colors" />
            <span
              className={`ml-3 text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                isMobile || sidebarExpanded || isHovered ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
              }`}
            >
              Cerrar sesión
            </span>
          </button>
        </div>
      </div>

      {!isMobile && <div className={`transition-all duration-300 ${sidebarExpanded ? "w-64" : "w-20"}`} />}
    </>
  );
}

export default Sidebar;
