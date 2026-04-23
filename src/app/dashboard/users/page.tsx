"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Card, Button, Logo } from "@/components/ui";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  roleChangeRequest: boolean;
}

export default function UsersPage() {
  const { token, user: currentUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
      return;
    }
    if (currentUser?.role !== "MASTER_ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchUsers();
  }, [token, currentUser, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const [allUsersRes, requestsRes] = await Promise.all([
        fetch("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/users?filter=requests", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!allUsersRes.ok || !requestsRes.ok) {
        throw new Error("Error al obtener usuarios");
      }

      const allUsersData = await allUsersRes.json();
      const requestsData = await requestsRes.json();

      setUsers(Array.isArray(allUsersData) ? allUsersData : []);
      setRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId: string, role: string) => {
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, role }),
      });

      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  };

  const getRoleLabel = (role: string | undefined): string => {
    if (!role) return "Desconocido";
    const labels: Record<string, string> = {
      MASTER_ADMIN: "Administrador",
      ADMIN: "Administrador",
      EMPLOYEE: "Empleado",
    };
    return labels[role] || role;
  };

  const getInitial = (name: string | null | undefined): string => {
    if (!name || name.length === 0) return "?";
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Logo size="small" />
            </Link>
            <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-700">
              ← Volver
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            {error}
          </div>
        )}

        <Card title="Solicitudes de Cambio de Rol">
          {requests.length > 0 ? (
            <div className="space-y-3">
              {requests.map((u) => (
                <div key={u.id} className="flex justify-between items-center p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-medium">
                      {getInitial(u.name)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">{u.name || "Sin nombre"}</p>
                      <p className="text-sm text-slate-500">{u.email || "Sin email"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" onClick={() => handleRoleUpdate(u.id, "ADMIN")}>Aprobar Admin</Button>
                    <Button variant="secondary" onClick={() => handleRoleUpdate(u.id, "EMPLOYEE")}>Rechazar</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-6">No hay solicitudes pendientes</p>
          )}
        </Card>
        
        <Card title="Todos los Usuarios">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="table-header">
                  <th className="px-4 py-3 text-left text-sm">Usuario</th>
                  <th className="px-4 py-3 text-left text-sm">Email</th>
                  <th className="px-4 py-3 text-left text-sm">Rol</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                          {getInitial(u.name)}
                        </div>
                        <span className="font-medium text-slate-700">{u.name || "Sin nombre"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{u.email || "Sin email"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.role === "MASTER_ADMIN" ? "bg-purple-100 text-purple-700" :
                        u.role === "ADMIN" ? "bg-indigo-100 text-indigo-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {getRoleLabel(u.role)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}