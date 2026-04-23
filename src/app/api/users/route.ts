import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleUpdateSchema } from "@/lib/validations";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Token requerido" }, { status: 401 });
    }

    verifyToken(token);

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter");

    const where = filter === "requests" 
      ? { roleChangeRequest: true }
      : {};

    const users = await prisma.user.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        roleChangeRequest: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Token requerido" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (payload.role !== "MASTER_ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const body = await request.json();
    const validated = roleUpdateSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: validated.userId },
      data: {
        role: validated.role,
        roleChangeRequest: false,
      },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}