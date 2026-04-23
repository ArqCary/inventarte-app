"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Card, Button, Input, Table, Modal } from "@/components/ui";

interface Category {
  id: string;
  name: string;
}

export default function CategoriesPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const isAdmin = user?.role !== "EMPLOYEE";
  const [name, setName] = useState("");

  useEffect(() => {
    if (!token) router.push("/auth/login");
    else fetchCategories();
  }, [token, router]);

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    setCategories(await res.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      setModalOpen(false);
      setName("");
      fetchCategories();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between">
          <Link href="/dashboard" className="text-blue-600 hover:underline">← Dashboard</Link>
          <span className="font-medium">Categorías</span>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card title="Categorías" actions={isAdmin && <Button onClick={() => setModalOpen(true)}>+ Nueva</Button>}>
          <Table columns={[{ key: "name", label: "Nombre" }]} data={categories} />
        </Card>
      </main>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Categoría">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Crear</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}