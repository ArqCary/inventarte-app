"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Card, Button, Input, Logo } from "@/components/ui";

interface ProfileForm {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

export default function ProfilePage() {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [requestingRole, setRequestingRole] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!loading && !token) {
      router.push("/auth/login");
    } else if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    }
  }, [loading, token, user, router]);

  useEffect(() => {
    return () => {
      if (toastTimeout.current) {
        clearTimeout(toastTimeout.current);
      }
    };
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    if (toastTimeout.current) {
      clearTimeout(toastTimeout.current);
    }
    setToast({ message, type });
    toastTimeout.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.newPassword) {
      if (form.newPassword !== form.confirmPassword) {
        setError("Las contraseñas no coinciden");
        return;
      }
      if (form.newPassword.length < 6) {
        setError("La nueva contraseña debe tener al menos 6 caracteres");
        return;
      }
    }

    setSaving(true);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          currentPassword: form.currentPassword,
          newPassword: form.newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Perfil actualizado correctamente");
        setForm((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        showToast("Perfil actualizado correctamente", "success");
      } else {
        setError(data.error || "Error al actualizar");
        showToast(data.error || "Error al actualizar", "error");
      }
    } catch {
      setError("Error de conexión");
      showToast("Error de conexión", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRequestRole = async () => {
    setRequestingRole(true);
    setError("");

    try {
      const res = await fetch("/api/auth/request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Solicitud enviada. Espera a que un Administrador General apruebe tu solicitud.", "success");
        setSuccess("Solicitud enviada correctamente");
      } else {
        setError(data.error || "Error al enviar solicitud");
        showToast(data.error || "Error al enviar solicitud", "error");
      }
    } catch {
      setError("Error de conexión");
      showToast("Error de conexión", "error");
    } finally {
      setRequestingRole(false);
    }
  };

  if (loading || !token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    MASTER_ADMIN: "Administrador General",
    ADMIN: "Administrador",
    EMPLOYEE: "Empleado",
  };

  const isEmployee = user?.role === "EMPLOYEE";
  const hasPendingRequest = (user as any)?.roleChangeRequest === true;

  return (
    <div className="min-h-screen bg-slate-50">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg max-w-sm ${
          toast.type === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"
        }`}>
          <div className="flex items-start gap-3">
            {toast.type === "success" ? (
              <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card title="Mi Perfil">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-semibold text-slate-800">{user?.name}</p>
              <p className="text-slate-500">{user?.email}</p>
              <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user?.role === "MASTER_ADMIN" ? "bg-purple-100 text-purple-700" :
                user?.role === "ADMIN" ? "bg-indigo-100 text-indigo-700" :
                "bg-slate-100 text-slate-600"
              }`}>
                {roleLabels[user?.role || "EMPLOYEE"]}
              </span>
            </div>
          </div>

          {isEmployee && !hasPendingRequest && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">¿Quieres gestionar el inventario?</p>
                  <p className="text-xs text-amber-600 mt-1">Solicita permisos de Administrador para crear, editar y eliminar productos.</p>
                </div>
              </div>
              <button
                onClick={handleRequestRole}
                disabled={requestingRole || hasPendingRequest}
                className="mt-3 w-full px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition disabled:opacity-50"
              >
                {requestingRole ? "Enviando..." : "Solicitar Permisos de Administrador"}
              </button>
            </div>
          )}

          {isEmployee && hasPendingRequest && (
            <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-slate-500 mt-0.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">Solicitud Pendiente</p>
                  <p className="text-xs text-slate-500 mt-1">Ya tienes una solicitud en espera. Un Administrador General debe aprobarla.</p>
                </div>
              </div>
              <div className="mt-3 px-4 py-2 bg-slate-100 text-slate-500 rounded-lg text-sm text-center">
                Solicitud ya enviada - Pendiente de aprobación
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />

            <Input
              label="Email"
              type="email"
              value={form.email}
              disabled
            />
            <p className="text-xs text-slate-400 -mt-3">El email no se puede cambiar</p>

            <div className="border-t border-slate-100 pt-5">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Cambiar Contraseña</h3>
              <p className="text-xs text-slate-400 mb-3">Solo llena estos campos si quieres cambiar tu contraseña</p>
              
              <div className="space-y-4">
                <Input
                  label="Contraseña Actual"
                  type="password"
                  value={form.currentPassword}
                  onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                  placeholder="Ingresa tu contraseña actual"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Nueva Contraseña"
                    type="password"
                    value={form.newPassword}
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <Input
                    label="Confirmar Contraseña"
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Repite la nueva contraseña"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}