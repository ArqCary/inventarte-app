"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, Badge } from "@/components/ui";

interface ProductData {
  sku: string;
  name: string;
  stock: number;
  minStock: number;
  qrCode: string;
}

export default function ScanPage() {
  const params = useParams();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const sku = params.sku as string;
    fetch(`/api/products?sku=${sku}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data[0]) {
          const p = data[0];
          fetch(`/api/products/${p.id}/qr`)
            .then((r) => r.json())
            .then(setProduct);
        } else {
          setError("Producto no encontrado");
        }
      })
      .catch(() => setError("Error al cargar"));
  }, [params.sku]);

  if (error) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-600">{error}</p></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center"><p>Cargando...</p></div>;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm text-center">
        <img src={product.qrCode} alt="QR" className="mx-auto mb-4" />
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="text-gray-500">SKU: {product.sku}</p>
        <div className="mt-4">
          <Badge variant={product.stock <= product.minStock ? "danger" : "success"}>
            Stock: {product.stock}
          </Badge>
        </div>
        <p className="mt-4 text-sm text-gray-500">Escanea este código para ver el stock actual</p>
      </Card>
    </div>
  );
}