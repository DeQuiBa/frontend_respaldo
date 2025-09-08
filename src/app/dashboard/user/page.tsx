"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function UserDashboard() {
  return (
    <ProtectedRoute allowedRoles={[2]}>
      <div className="p-8 text-white">
        <h1 className="text-3xl font-bold mb-4">Panel de Usuario</h1>
        <p>Solo usuarios con rol 2 pueden ver esta página.</p>
      </div>
    </ProtectedRoute>
  );
}
