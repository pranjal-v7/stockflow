import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/products — List all products with their stock
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        stockEntries: {
          include: { warehouse: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Compute total available stock per product
    const productsWithStock = products.map((p) => ({
      ...p,
      totalStock: p.stockEntries.reduce((sum, s) => sum + s.totalUnits - s.reservedUnits, 0),
      totalUnits: p.stockEntries.reduce((sum, s) => sum + s.totalUnits, 0),
      reservedUnits: p.stockEntries.reduce((sum, s) => sum + s.reservedUnits, 0),
    }));

    return NextResponse.json(productsWithStock);
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST /api/products — Create a new product (Admin only)
export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, sku, description, price, category, images } = await req.json();

    if (!name || !sku || !price || !category) {
      return NextResponse.json({ error: "Name, SKU, price and category are required" }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) {
      return NextResponse.json({ error: "Product with this SKU already exists" }, { status: 409 });
    }

    const product = await prisma.product.create({
      data: { name, sku, description, price: parseFloat(price), category, images: images || [] },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("[PRODUCTS_POST]", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
