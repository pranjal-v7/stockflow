import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/stock — Get all stock entries
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const warehouseId = searchParams.get("warehouseId");
    const productId = searchParams.get("productId");

    const stockEntries = await prisma.stockEntry.findMany({
      where: {
        ...(warehouseId && { warehouseId }),
        ...(productId && { productId }),
      },
      include: {
        product: true,
        warehouse: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    // Add computed availableUnits
    const enriched = stockEntries.map((s) => ({
      ...s,
      availableUnits: s.totalUnits - s.reservedUnits,
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("[STOCK_GET]", error);
    return NextResponse.json({ error: "Failed to fetch stock" }, { status: 500 });
  }
}

// PUT /api/stock — Update stock quantity (Admin or Warehouse Manager)
export async function PUT(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session || !["ADMIN", "WAREHOUSE_MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { productId, warehouseId, totalUnits } = await req.json();

    if (!productId || !warehouseId || totalUnits === undefined) {
      return NextResponse.json({ error: "productId, warehouseId and totalUnits are required" }, { status: 400 });
    }

    const entry = await prisma.stockEntry.upsert({
      where: { productId_warehouseId: { productId, warehouseId } },
      update: { totalUnits: parseInt(totalUnits) },
      create: { productId, warehouseId, totalUnits: parseInt(totalUnits), reservedUnits: 0 },
    });

    return NextResponse.json({ ...entry, availableUnits: entry.totalUnits - entry.reservedUnits });
  } catch (error) {
    console.error("[STOCK_PUT]", error);
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
  }
}
