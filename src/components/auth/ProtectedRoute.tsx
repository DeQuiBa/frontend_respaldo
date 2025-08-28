"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/authContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: number[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/'); 
      } else if (allowedRoles && user && !allowedRoles.includes(user.rolId)) {
        router.replace('/dashboard/home'); 
      }
    }
  }, [loading, isAuthenticated, user, allowedRoles, router]);


  if (loading || !isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.rolId))) {
    return <div className="text-center mt-10">Cargando...</div>; // puedes usar un spinner aquí también
  }

  return <>{children}</>;
};
