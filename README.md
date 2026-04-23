# Traxio Inventory

Sistema de inventariado completo para portafolio.

## Stack
- Next.js 15 (App Router)
- TypeScript
- Prisma + PostgreSQL
- JWT Auth
- QR Code Generation

## Instalación

```bash
# 1. Copiar variables de entorno
cp .env.example .env
# Editar DATABASE_URL

# 2. Instalar dependencias
npm install

# 3. Generar cliente Prisma
npm run db:generate

# 4. Crear base de datos
npm run db:push

# 5. Seed (crea admin)
npm run db:seed

# 6. Ejecutar
npm run dev
```

## Módulos
- **Auth**: Login, registro, roles (Empleado/Admin/Admin Maestro)
- **Catálogo**: CRUD productos, categorías, proveedores
- **QR**: Generación de códigos QR
- **Inventario**: Entradas, salidas, Kardex
- **Alertas**: Stock mínimo, valorización