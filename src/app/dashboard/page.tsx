"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Logo, Toast } from "@/components/ui";
import { Card, Button } from "@/components/ui";

const navItems = [
  { href: "/dashboard/products", label: "Productos", icon: "inventory_2", roles: ["ADMIN", "MASTER_ADMIN"] },
  { href: "/dashboard/categories", label: "Categorías", icon: "category", roles: ["EMPLOYEE", "ADMIN", "MASTER_ADMIN"] },
  { href: "/dashboard/suppliers", label: "Proveedores", icon: "local_shipping", roles: ["EMPLOYEE", "ADMIN", "MASTER_ADMIN"] },
  { href: "/dashboard/movements", label: "Movimientos", icon: "swap_horiz", roles: ["EMPLOYEE", "ADMIN", "MASTER_ADMIN"] },
  { href: "/dashboard/reports", label: "Reportes", icon: "assessment", roles: ["EMPLOYEE", "ADMIN", "MASTER_ADMIN"] },
];

const adminItems = [
  { href: "/dashboard/users", label: "Usuarios", icon: "people" },
];

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

export default function DashboardPage() {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{message: string; type: "success" | "error"} | null>(null);

  useEffect(() => {
    if (!loading && !token) {
      router.push("/auth/login");
    }
  }, [loading, token, router]);

  useEffect(() => {
    if (token) {
      fetch("/api/products")
        .then((res) => res.json())
        .then(setProducts)
        .catch(() => {});
    }
  }, [token]);

  if (loading || !token) return null;

  const isAdmin = user?.role === "ADMIN" || user?.role === "MASTER_ADMIN";
  const isMasterAdmin = user?.role === "MASTER_ADMIN";
  const roleLabels: Record<string, string> = {
    MASTER_ADMIN: "Administrador",
    ADMIN: "Administrador",
    EMPLOYEE: "Empleado",
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.categories?.some((c) => c.name.toLowerCase().includes(search.toLowerCase())) ||
    p.supplier?.name.toLowerCase().includes(search.toLowerCase())
  );

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
            
            <div className="flex items-center gap-3 relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-700">{user?.name}</p>
                  <p className="text-xs text-slate-500">{roleLabels[user?.role || "EMPLOYEE"]}</p>
                </div>
                <i className="material-icons text-slate-400 text-lg">expand_more</i>
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                  >
                    <i className="material-icons text-lg">person</i>
                    Mi Perfil
                  </Link>
                  <button
                    onClick={() => { setProfileMenuOpen(false); logout(); }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-slate-50 transition"
                  >
                    <i className="material-icons text-lg">logout</i>
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">Gestiona tu inventario desde aquí</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
          {navItems.filter(item => item.roles.includes(user?.role || "EMPLOYEE")).map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="bg-white rounded-xl border border-slate-200 p-6 text-center card-hover cursor-pointer group">
                <div className="text-indigo-500 group-hover:scale-110 transition-transform duration-200 flex justify-center mb-3">
                  <i className="material-icons text-4xl">{item.icon}</i>
                </div>
                <p className="font-medium text-slate-700">{item.label}</p>
              </div>
            </Link>
          ))}
          {isMasterAdmin &&
            adminItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="bg-white rounded-xl border border-slate-200 p-6 text-center card-hover cursor-pointer group">
                  <div className="text-indigo-500 group-hover:scale-110 transition-transform duration-200 flex justify-center mb-3">
                    <i className="material-icons text-4xl">{item.icon}</i>
                  </div>
                  <p className="font-medium text-slate-700">{item.label}</p>
                </div>
              </Link>
            ))}
        </div>

        <div>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold text-slate-800">Buscar Productos</h2>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
            <div className="relative">
              <i className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</i>
              <input
                type="text"
                placeholder="Buscar por nombre, SKU, categoría o proveedor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <i className="material-icons text-4xl mb-2">inventory_2</i>
              <p>{search ? "No se encontraron productos" : "No hay productos registrados"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden card-hover">
                  <div className="h-40 bg-slate-100 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <i className="material-icons text-4xl text-slate-300">inventory_2</i>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-mono text-xs text-slate-400 mb-1">{product.sku}</p>
                    <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.categories?.map((c) => (
                        <span key={c.id} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs">
                          {c.name}
                        </span>
                      ))}
                    </div>
                    <div className="space-y-2 text-sm border-t border-slate-100 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Stock</span>
                        <span className={`font-bold text-lg ${product.stock <= product.minStock ? "text-red-600" : "text-green-600"}`}>
                          {product.stock.toLocaleString()}
                        </span>
                      </div>
                      {product.minStock > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Stock mín.</span>
                          <span className="font-medium text-slate-600">{product.minStock.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Precio de venta</span>
                        <span className="font-semibold text-indigo-600">${product.price.toLocaleString("es-CO", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Costo de producción</span>
                        <span className="font-medium text-slate-600">${product.cost.toLocaleString("es-CO", { minimumFractionDigits: 2 })}</span>
                      </div>
                      {product.supplier && (
                        <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                          <span className="text-slate-500">Proveedor</span>
                          <span className="font-medium text-slate-700 text-right truncate max-w-[120px]">{product.supplier.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}