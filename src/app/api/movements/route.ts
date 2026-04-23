import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { movementSchema } from "@/lib/validations";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    const movements = await prisma.stockMovement.findMany({
      where: productId ? { productId } : undefined,
      include: {
        product: { select: { sku: true, name: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(movements);
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Token requerido" }, { status: 401 });
    }

    const payload = verifyToken(token);
    const body = await request.json();
    const validated = movementSchema.parse(body);

    const product = await prisma.product.findUnique({
      where: { id: validated.productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const stockBefore = product.stock;
    let stockAfter: number;

    if (validated.type === "ENTRADA") {
      stockAfter = stockBefore + validated.quantity;
    } else {
      stockAfter = stockBefore - validated.quantity;
      if (stockAfter < 0) {
        return NextResponse.json(
          { error: "Stock insuficiente" },
          { status: 400 }
        );
      }
    }

    const movement = await prisma.stockMovement.create({
      data: {
        type: validated.type,
        quantity: validated.quantity,
        reason: validated.reason,
        stockBefore,
        stockAfter,
        productId: validated.productId,
        userId: payload.userId,
      },
    });

    await prisma.product.update({
      where: { id: validated.productId },
      data: { stock: stockAfter },
    });

    return NextResponse.json(movement, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}