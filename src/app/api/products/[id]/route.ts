import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";
import { verifyToken } from "@/lib/auth";

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
        movements: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Token requerido" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (payload.role === "EMPLOYEE") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = productSchema.parse(body);

    if (!validated.imageUrl) {
      return NextResponse.json({ error: "La imagen del producto es requerida" }, { status: 400 });
    }

    await prisma.productCategory.deleteMany({ where: { productId: id } });

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: validated.name,
        description: validated.description,
        price: validated.price,
        cost: validated.cost,
        minStock: validated.minStock,
        supplierId: validated.supplierId || null,
        imageUrl: validated.imageUrl || null,
        categories: validated.categoryIds?.length
          ? {
              create: validated.categoryIds.map((catId) => ({
                category: { connect: { id: catId } },
              })),
            }
          : undefined,
      },
      include: {
        supplier: true,
        categories: { include: { category: true } },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Token requerido" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (payload.role !== "ADMIN" && payload.role !== "MASTER_ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: "Producto eliminado" });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}