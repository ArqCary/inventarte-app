"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Card, Button, Input, Table, Modal } from "@/components/ui";

interface Movement {
  id: string;
  type: "ENTRADA" | "SALIDA";
  quantity: number;
  reason: string;
  createdAt: string;
  product: { sku: string; name: string };
  user: { name: string };
}

export default function MovementsPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<{ id: string; sku: string; name: string }[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ type: "ENTRADA" as "ENTRADA" | "SALIDA", quantity: 1, reason: "", productId: "" });

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
      return;
    }
    fetchMovements();
  }, [token, router]);

  const fetchMovements = async () => {
    const [movRes, prodRes] = await Promise.all([
      fetch("/api/movements"),
      fetch("/api/products"),
    ]);
    const [movData, prodData] = await Promise.all([
      movRes.json(),
      prodRes.json(),
    ]);
    setMovements(movData);
    setProducts(prodData.map((p: any) => ({ id: p.id, sku: p.sku, name: p.name })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/movements", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setModalOpen(false);
      setForm({ type: "ENTRADA", quantity: 1, reason: "", productId: "" });
      fetchMovements();
    } else {
      setError(data.error || "Error al registrar");
    }
  };

  const columns = [
    { key: "createdAt", label: "Fecha" },
    { key: "type", label: "Tipo" },
    { key: "quantity", label: "Cantidad" },
    { key: "product", label: "Producto" },
    { key: "reason", label: "Razón" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between">
          <Link href="/dashboard" className="text-blue-600 hover:underline">← Dashboard</Link>
          <span className="font-medium">Movimientos (Kardex)</span>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card title="Movimientos de Stock" actions={<Button onClick={() => setModalOpen(true)}>+ Registrar</Button>}>
          <Table
            columns={columns}
            data={movements.map((m) => ({
              ...m,
              createdAt: new Date(m.createdAt).toLocaleString(),
              product: `${m.product.sku} - ${m.product.name}`,
              type: m.type === "ENTRADA" ? "Entrada" : "Salida",
            }))}
          />
        </Card>
      </main>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Movimiento">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} className="px-3 py-2 border rounded" required>
            <option value="">Seleccionar producto</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>)}
          </select>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "ENTRADA" | "SALIDA" })} className="px-3 py-2 border rounded">
            <option value="ENTRADA">Entrada</option>
            <option value="SALIDA">Salida</option>
          </select>
          <Input label="Cantidad" type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} required />
          <Input label="Razón (opcional)" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Registrar</Button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
      </Modal>
    </div>
  );
}