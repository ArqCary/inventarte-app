import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: { price: true, cost: true, stock: true },
    });

    const totalInventoryValue = products.reduce(
      (sum, p) => sum + p.price * p.stock,
      0
    );

    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const totalUnitsValue = products.reduce((sum, p) => sum + p.cost * p.stock, 0);

    return NextResponse.json({
      totalInventoryValue,
      totalProducts,
      totalStock,
      totalUnitsValue,
    });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}