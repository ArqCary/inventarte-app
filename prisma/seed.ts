import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@inventarte.app" },
    update: {},
    create: {
      email: "admin@inventarte.app",
      password,
      name: "Admin Maestro",
      role: "MASTER_ADMIN",
    },
  });

  console.log("Seed completado: admin@inventarte.app / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });