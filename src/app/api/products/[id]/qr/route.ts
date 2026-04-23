import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        supplier: true,
        categories: { include: { category: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const infoText = `INVENTARTE APP
────────────────
SKU: ${product.sku}
Nombre: ${product.name}
Precio: $${product.price.toFixed(2)}
Costo: $${product.cost.toFixed(2)}
Stock: ${product.stock}
Stock Mín: ${product.minStock}
${product.supplier ? `Proveedor: ${product.supplier.name}` : ""}
${product.categories.length > 0 ? `Categorías: ${product.categories.map(c => c.category.name).join(", ")}` : ""}
────────────────`;

    const QRCode = (await import("qrcode")).default;
    const qrCode = await QRCode.toDataURL(infoText, {
      width: 400,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    return NextResponse.json({ ...product, qrCode });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}