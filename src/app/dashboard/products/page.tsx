"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Card, Button, Input, Modal, Logo, IconButton } from "@/components/ui";
import { Toast } from "@/components/ui/Toast";

interface Product {
  id: string;
  sku: string;
  name: string;
  stock: number;
  minStock: number;
  price: number;
  cost: number;
  imageUrl?: string;
  supplier?: { id: string; name: string };
  categories?: { id: string; name: string }[];
}

interface Supplier {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface ToastData {
  message: string;
  type: "success" | "error" | "info" | "warning";
}

export default function ProductsPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [imageModal, setImageModal] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = user?.role !== "EMPLOYEE";

  const [form, setForm] = useState({
    name: "",
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 0,
    supplierId: "",
    categoryIds: [] as string[],
    imageUrl: "",
  });

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
      return;
    }
    fetchData();
  }, [token, router]);

  useEffect(() => {
    return () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast({ message, type });
    toastTimeout.current = setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    const [productsRes, suppliersRes, categoriesRes] = await Promise.all([
      fetch("/api/products"),
      fetch("/api/suppliers"),
      fetch("/api/categories"),
    ]);
    const [productsData, suppliersData, categoriesData] = await Promise.all([
      productsRes.json(),
      suppliersRes.json(),
      categoriesRes.json(),
    ]);
    setProducts(productsData);
    setSuppliers(suppliersData);
    setCategories(categoriesData);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setForm((prev) => ({ ...prev, imageUrl: data.url }));
        showToast("Imagen subida correctamente", "success");
      } else {
        showToast(data.error || "Error al subir imagen", "error");
      }
    } catch {
      showToast("Error al subir imagen", "error");
    } finally {
      setUploading(false);
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.imageUrl) {
      showToast("La imagen del producto es requerida", "error");
      return;
    }

    const url = selectedProduct ? `/api/products/${selectedProduct.id}` : "/api/products";
    const method = selectedProduct ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      setModalOpen(false);
      setSelectedProduct(null);
      setForm({ name: "", price: 0, cost: 0, stock: 0, minStock: 0, supplierId: "", categoryIds: [], imageUrl: "" });
      fetchData();
      showToast(selectedProduct ? "Producto actualizado" : "Producto creado", "success");
    } else {
      showToast(data.error || "Error al guardar", "error");
    }
  };

  const openQr = async (product: Product) => {
    const res = await fetch(`/api/products/${product.id}/qr`);
    if (res.ok) {
      const data = await res.json();
      setQrCode(data.qrCode);
    }
  };

  const editProduct = (product: Product) => {
    setSelectedProduct(product);
    setForm({
      name: product.name,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      minStock: product.minStock,
      supplierId: product.supplier?.id || "",
      categoryIds: product.categories?.map((c) => c.id) || [],
      imageUrl: product.imageUrl || "",
    });
    setModalOpen(true);
  };

  const toggleCategory = (categoryId: string) => {
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
  };

  const deleteProduct = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteModal.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDeleteModal(null);
        fetchData();
        showToast("Producto eliminado", "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Error al eliminar", "error");
      }
    } catch {
      showToast("Error al eliminar", "error");
    } finally {
      setDeleting(false);
    }
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setForm({ name: "", price: 0, cost: 0, stock: 0, minStock: 0, supplierId: "", categoryIds: [], imageUrl: "" });
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card
          title="Productos"
          actions={
            isAdmin && (
              <Button onClick={resetForm}>+ Nuevo Producto</Button>
            )
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="table-header">
                  <th className="px-4 py-3 text-left text-sm">Imagen</th>
                  <th className="px-4 py-3 text-left text-sm">QR</th>
                  <th className="px-4 py-3 text-left text-sm">SKU</th>
                  <th className="px-4 py-3 text-left text-sm">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm">Categorías</th>
                  <th className="px-4 py-3 text-left text-sm">Stock</th>
                  <th className="px-4 py-3 text-left text-sm">Precio</th>
                  <th className="px-4 py-3 text-left text-sm">Proveedor</th>
                  {isAdmin && <th className="px-4 py-3 text-left text-sm">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      {p.imageUrl ? (
                        <button type="button" onClick={() => setImageModal(p.imageUrl!)} className="focus:outline-none">
                          <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-cover rounded-lg hover:ring-2 hover:ring-indigo-500 transition" />
                        </button>
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                          <i className="material-icons text-slate-400">image</i>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => openQr(p)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition">
                        <i className="material-icons">qr_code</i>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-slate-600">{p.sku}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{p.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.categories?.map((c) => (
                          <span key={c.id} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                            {c.name}
                          </span>
                        ))}
                        {(!p.categories || p.categories.length === 0) && (
                          <span className="text-slate-400 text-xs">Sin categorías</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        p.stock <= p.minStock ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                      }`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">${p.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{p.supplier?.name || "-"}</td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => editProduct(p)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Editar">
                            <i className="material-icons text-lg">edit</i>
                          </button>
                          <button onClick={() => setDeleteModal(p)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition" title="Eliminar">
                            <i className="material-icons text-lg">delete</i>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <p>No hay productos registrados</p>
              </div>
            )}
          </div>
        </Card>
      </main>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setSelectedProduct(null); }} title={selectedProduct ? "Editar Producto" : "Nuevo Producto"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
          
          <div className="flex items-center gap-4">
            {form.imageUrl ? (
              <div className="relative">
                <img src={form.imageUrl} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                <button type="button" onClick={() => setForm((prev) => ({ ...prev, imageUrl: "" }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                  <i className="material-icons text-sm">close</i>
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition disabled:opacity-50">
                {uploading ? (
                  <i className="material-icons text-2xl animate-spin">sync</i>
                ) : (
                  <i className="material-icons text-2xl">add_photo_alternate</i>
                )}
              </button>
            )}
            <div>
              <p className="text-sm font-medium text-slate-700">Imagen del producto</p>
              <p className="text-xs text-slate-400">Haz clic para subir una imagen</p>
            </div>
          </div>

          <Input label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Nombre del producto" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Precio de venta" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} required placeholder="0.00" />
            <Input label="Costo de producción" type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: +e.target.value })} required placeholder="0.00" />
          </div>
          {!selectedProduct && <Input label="Stock Inicial" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} required placeholder="0" />}
          <Input label="Stock Mínimo" type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: +e.target.value })} required placeholder="0" />
          <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
            <option value="">Sin proveedor</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Categorías</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button key={cat.id} type="button" onClick={() => toggleCategory(cat.id)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                  form.categoryIds.includes(cat.id) ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}>
                  {cat.name}
                </button>
              ))}
              {categories.length === 0 && <p className="text-slate-400 text-sm">No hay categorías</p>}
            </div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setModalOpen(false); setSelectedProduct(null); }} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1">{selectedProduct ? "Guardar" : "Crear"}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!qrCode} onClose={() => setQrCode(null)} title="Código QR">
        <div className="text-center">
          {qrCode && <img src={qrCode} alt="QR" className="mx-auto w-48 h-48" />}
          <p className="mt-4 text-sm text-slate-500">Escanea este código para ver el stock del producto</p>
        </div>
      </Modal>

      <Modal open={!!imageModal} onClose={() => setImageModal(null)} title="">
        <div className="flex items-center justify-center">
          {imageModal && <img src={imageModal} alt="Producto" className="max-w-full max-h-[70vh] object-contain rounded-lg" />}
        </div>
      </Modal>

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Eliminar Producto">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="material-icons text-3xl text-red-600">warning</i>
          </div>
          <p className="text-slate-700 mb-2">¿Estás seguro de eliminar este producto?</p>
          <p className="text-slate-500 text-sm mb-6">{deleteModal?.name}</p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeleteModal(null)} className="flex-1">Cancelar</Button>
            <Button onClick={deleteProduct} disabled={deleting} className="flex-1 bg-red-500 hover:bg-red-600">
              {deleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}