import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Token requerido" }, { status: 401 });
    }

    const payload = verifyToken(token);
    await prisma.user.update({
      where: { id: payload.userId },
      data: { roleChangeRequest: true },
    });

    return NextResponse.json({ message: "Solicitud enviada" });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}