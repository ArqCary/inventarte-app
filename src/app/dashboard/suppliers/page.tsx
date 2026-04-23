"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Card, Button, Input, Table, Modal } from "@/components/ui";

interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  website: string;
}

export default function SuppliersPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const isAdmin = user?.role !== "EMPLOYEE";

  const [form, setForm] = useState({ name: "", contact: "", email: "", phone: "", address: "", website: "" });

  useEffect(() => {
    if (!token) router.push("/auth/login");
    else fetchSuppliers();
  }, [token, router]);

  const fetchSuppliers = async () => {
    const res = await fetch("/api/suppliers");
    setSuppliers(await res.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setModalOpen(false);
      setForm({ name: "", contact: "", email: "", phone: "", address: "", website: "" });
      fetchSuppliers();
    } else {
      setError(data.error || "Error al guardar");
    }
  };

  const columns = [{ key: "name", label: "Nombre" }, { key: "contact", label: "Contacto" }, { key: "email", label: "Email" }, { key: "phone", label: "Teléfono" }];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between">
          <Link href="/dashboard" className="text-blue-600 hover:underline">← Dashboard</Link>
          <span className="font-medium">Proveedores</span>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card title="Proveedores" actions={isAdmin && <Button onClick={() => setModalOpen(true)}>+ Nuevo</Button>}>
          <Table columns={columns} data={suppliers} />
        </Card>
      </main>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Proveedor">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Contacto" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Dirección" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Crear</Button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
      </Modal>
    </div>
  );
}