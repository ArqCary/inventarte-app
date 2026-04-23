import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        stock: { lte: 10 },
      },
    });

    const alerts = products
      .filter((p) => p.stock <= p.minStock)
      .map((p) => ({
        productId: p.id,
        sku: p.sku,
        name: p.name,
        currentStock: p.stock,
        minStock: p.minStock,
      }));

    return NextResponse.json(alerts);
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}