import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/warehouses — List all warehouses
export async function GET() {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        stockEntries: {
          include: { product: true },
        },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(warehouses);
  } catch (error) {
    console.error("[WAREHOUSES_GET]", error);
    return NextResponse.json({ error: "Failed to fetch warehouses" }, { status: 500 });
  }
}

// POST /api/warehouses — Create warehouse (Admin only)
export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session || !["ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, location } = await req.json();
    if (!name || !location) {
      return NextResponse.json({ error: "Name and location are required" }, { status: 400 });
    }

    const warehouse = await prisma.warehouse.create({ data: { name, location } });
    return NextResponse.json(warehouse, { status: 201 });
  } catch (error) {
    console.error("[WAREHOUSES_POST]", error);
    return NextResponse.json({ error: "Failed to create warehouse" }, { status: 500 });
  }
}
