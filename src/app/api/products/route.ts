import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      include: {
        supplier: true,
        categories: { include: { category: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = products.map((p) => ({
      ...p,
      categories: p.categories.map((pc) => pc.category),
    }));

    return NextResponse.json(formatted);
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
    if (payload.role === "EMPLOYEE") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const body = await request.json();
    const validated = productSchema.parse(body);

    if (!validated.imageUrl) {
      return NextResponse.json({ error: "La imagen del producto es requerida" }, { status: 400 });
    }

    const count = await prisma.product.count();
    const sku = `PRD-${String(count + 1).padStart(5, "0")}`;

    const product = await prisma.product.create({
      data: {
        sku,
        name: validated.name,
        description: validated.description,
        price: validated.price,
        cost: validated.cost,
        stock: validated.stock,
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

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}