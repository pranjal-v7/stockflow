import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding StockFlow database...");

  // ── Users (one per role) ──────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@allohealth.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@allohealth.com",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const warehouseMgr = await prisma.user.upsert({
    where: { email: "warehouse@allohealth.com" },
    update: {},
    create: {
      name: "Warehouse Manager",
      email: "warehouse@allohealth.com",
      passwordHash,
      role: Role.WAREHOUSE_MANAGER,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@allohealth.com" },
    update: {},
    create: {
      name: "John Customer",
      email: "customer@allohealth.com",
      passwordHash,
      role: Role.CUSTOMER,
    },
  });

  const deliveryAgent = await prisma.user.upsert({
    where: { email: "delivery@allohealth.com" },
    update: {},
    create: {
      name: "Delivery Agent",
      email: "delivery@allohealth.com",
      passwordHash,
      role: Role.DELIVERY_AGENT,
    },
  });

  console.log("✅ Users created");

  // ── Warehouses ────────────────────────────────────────────────────────────
  const wh1 = await prisma.warehouse.upsert({
    where: { id: "wh-mumbai" },
    update: {},
    create: { id: "wh-mumbai", name: "Mumbai Central", location: "Mumbai, Maharashtra" },
  });

  const wh2 = await prisma.warehouse.upsert({
    where: { id: "wh-delhi" },
    update: {},
    create: { id: "wh-delhi", name: "Delhi North", location: "New Delhi, Delhi" },
  });

  const wh3 = await prisma.warehouse.upsert({
    where: { id: "wh-bangalore" },
    update: {},
    create: { id: "wh-bangalore", name: "Bangalore Hub", location: "Bengaluru, Karnataka" },
  });

  console.log("✅ Warehouses created");

  // ── Products ──────────────────────────────────────────────────────────────
  const products = [
    { sku: "VIT-D3-60", name: "Vitamin D3 (60 caps)", price: 299, category: "Vitamins", description: "High-potency Vitamin D3 supplement for bone health." },
    { sku: "OMEGA-3-90", name: "Omega-3 Fish Oil (90 caps)", price: 499, category: "Supplements", description: "Purified omega-3 fatty acids for heart and brain health." },
    { sku: "MULTIVIT-30", name: "Daily Multivitamin (30 tabs)", price: 199, category: "Vitamins", description: "Complete daily multivitamin for men and women." },
    { sku: "PROBIOTIC-60", name: "Probiotic Complex (60 caps)", price: 699, category: "Gut Health", description: "10 billion CFU probiotic blend for digestive wellness." },
    { sku: "ASHWAG-60", name: "Ashwagandha Extract (60 caps)", price: 399, category: "Adaptogens", description: "Clinically studied KSM-66 Ashwagandha root extract." },
    { sku: "COLLAGEN-30", name: "Collagen Peptides (30 sachets)", price: 899, category: "Skin Health", description: "Marine-sourced collagen for skin, hair and nails." },
    { sku: "ZINC-60", name: "Zinc Picolinate (60 tabs)", price: 249, category: "Minerals", description: "Highly bioavailable zinc for immune support." },
    { sku: "MAGNESIUM-60", name: "Magnesium Glycinate (60 caps)", price: 449, category: "Minerals", description: "Gentle magnesium for sleep, stress and muscle recovery." },
    { sku: "VIT-C-90", name: "Vitamin C 1000mg (90 tabs)", price: 349, category: "Vitamins", description: "Buffered Vitamin C with bioflavonoids for immune support." },
    { sku: "B-COMPLEX-60", name: "B-Complex (60 caps)", price: 299, category: "Vitamins", description: "Full spectrum B vitamins for energy and metabolism." },
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: { ...p, images: [] },
    });

    // Stock in all 3 warehouses
    for (const wh of [wh1, wh2, wh3]) {
      await prisma.stockEntry.upsert({
        where: { productId_warehouseId: { productId: product.id, warehouseId: wh.id } },
        update: {},
        create: {
          productId: product.id,
          warehouseId: wh.id,
          totalUnits: Math.floor(Math.random() * 50) + 20, // 20–70 units
          reservedUnits: 0,
        },
      });
    }
  }

  console.log("✅ Products and stock entries created");
  console.log("\n🎉 Seed complete! Demo credentials:");
  console.log("   Admin:            admin@allohealth.com / password123");
  console.log("   Warehouse Mgr:    warehouse@allohealth.com / password123");
  console.log("   Customer:         customer@allohealth.com / password123");
  console.log("   Delivery Agent:   delivery@allohealth.com / password123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
