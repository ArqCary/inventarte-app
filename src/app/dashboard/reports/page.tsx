"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Card, Logo, Badge } from "@/components/ui";

interface Alert {
  productId: string;
  sku: string;
  name: string;
  currentStock: number;
  minStock: number;
}

interface Valuation {
  totalInventoryValue: number;
  totalProducts: number;
  totalStock: number;
  totalUnitsValue: number;
}

export default function ReportsPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [valuation, setValuation] = useState<Valuation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) router.push("/auth/login");
    else {
      Promise.all([
        fetch("/api/reports/alerts").then((r) => r.json()),
        fetch("/api/reports/valuation").then((r) => r.json()),
      ]).then(([alertsData, valuationData]) => {
        setAlerts(Array.isArray(alertsData) ? alertsData : []);
        setValuation(valuationData);
        setLoading(false);
      });
    }
  }, [token, router]);

  if (loading || !token) {
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
        <Card title="Valorización del Inventario">
          {valuation ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">Valor de Venta</p>
                <p className="text-2xl font-bold text-slate-800">${valuation.totalInventoryValue.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">Total Productos</p>
                <p className="text-2xl font-bold text-slate-800">{valuation.totalProducts}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">Total Unidades</p>
                <p className="text-2xl font-bold text-slate-800">{valuation.totalStock}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">Costo de Adquisición</p>
                <p className="text-2xl font-bold text-slate-800">${valuation.totalUnitsValue.toFixed(2)}</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-400">Sin datos</p>
          )}
        </Card>

        <Card title="Alertas de Stock Mínimo">
          {alerts.length > 0 ? (
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.054 0 1.918-.616 2.165-1.615l.001-.001c.132-.541.132-1.134 0-1.675l-.001-.001C19.538 10.65 18.674 10 17.576 10H6.424c-1.098 0-1.962.65-2.165 1.615l-.001.001c-.132.541-.132 1.134 0 1.675l.001.001C4.462 14.384 5.326 15 6.424 15z" />
                  </svg>
                  <span className="font-medium">{alerts.length} productos por debajo del stock mínimo</span>
                </div>
              </div>
              {alerts.map((alert) => (
                <div key={alert.productId} className="flex justify-between items-center p-4 bg-white border border-red-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">{alert.name}</p>
                      <p className="text-sm text-slate-500">SKU: {alert.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="danger">
                      {alert.currentStock} / {alert.minStock}
                    </Badge>
                    <p className="text-xs text-red-500 mt-1">
                      Faltan {alert.minStock - alert.currentStock} unidades
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-green-600 font-medium">¡Todo en orden!</p>
              <p className="text-sm text-slate-400 mt-1">No hay productos por debajo del stock mínimo</p>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}