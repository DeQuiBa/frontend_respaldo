"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={[1]}>
      <div className="p-8 text-white">
        <h1 className="text-3xl font-bold mb-4">Panel de Administrador</h1>
        <p>Solo usuarios con rol 1 pueden ver esta página.</p>
      </div>
    </ProtectedRoute>
  );
}
