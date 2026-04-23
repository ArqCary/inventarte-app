import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Starting seed...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@inventarte.com" },
    update: {},
    create: {
      email: "admin@inventarte.com",
      password: hashedPassword,
      name: "Administrador",
      role: "MASTER_ADMIN",
    },
  });
  console.log("✅ Created admin user:", admin.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Electrónica" },
      update: {},
      create: { name: "Electrónica" },
    }),
    prisma.category.upsert({
      where: { name: "Ropa" },
      update: {},
      create: { name: "Ropa" },
    }),
    prisma.category.upsert({
      where: { name: "Alimentos" },
      update: {},
      create: { name: "Alimentos" },
    }),
    prisma.category.upsert({
      where: { name: "Hogar" },
      update: {},
      create: { name: "Hogar" },
    }),
    prisma.category.upsert({
      where: { name: "Deportes" },
      update: {},
      create: { name: "Deportes" },
    }),
  ]);
  console.log(`✅ Created ${categories.length} categories`);

  // Create supplier (use findFirst or create if not exists)
  const existingSupplier = await prisma.supplier.findFirst({
    where: { name: "Distribuidores Unidos S.A.S" },
  });
  
  if (!existingSupplier) {
    const supplier = await prisma.supplier.create({
      data: {
        name: "Distribuidores Unidos S.A.S",
        contact: "Juan Pérez",
        email: "contacto@distunidos.com",
        phone: "+57 300 123 4567",
        address: "Calle 123, Bogotá, Colombia",
      },
    });
    console.log("✅ Created supplier:", supplier.name);
  } else {
    console.log("✅ Supplier already exists:", existingSupplier.name);
  }

  console.log("🎉 Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });