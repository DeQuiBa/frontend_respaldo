"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: number[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // 👈 esperamos a que AuthProvider termine

    if (!isAuthenticated) {
      router.replace("/login");
    } else if (user && allowedRoles && !allowedRoles.includes(user.rolId)) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, user, allowedRoles, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-white">Cargando...</p>
      </div>
    );
  }

  // 👇 importante: no bloquear si `loading` terminó y hay usuario válido
  return <>{children}</>;
};
