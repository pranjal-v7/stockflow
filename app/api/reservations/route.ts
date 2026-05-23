import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/reservations — Create a reservation (concurrency-safe)
// Uses SELECT FOR UPDATE via Prisma $transaction to prevent overselling
export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, warehouseId, qty } = await req.json();

    if (!productId || !warehouseId || !qty || qty < 1) {
      return NextResponse.json({ error: "productId, warehouseId, and qty (≥1) are required" }, { status: 400 });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // CRITICAL SECTION: Concurrency-safe reservation using SELECT FOR UPDATE
    // This acquires a row-level lock on StockEntry so concurrent requests
    // cannot both read the same available stock and double-reserve it.
    // ──────────────────────────────────────────────────────────────────────────
    const reservation = await prisma.$transaction(async (tx) => {
      // Lock the StockEntry row for this product+warehouse combination
      const stockEntry = await tx.$queryRaw<
        Array<{ id: string; total_units: number; reserved_units: number }>
      >`
        SELECT id, total_units, reserved_units
        FROM "StockEntry"
        WHERE "productId" = ${productId} AND "warehouseId" = ${warehouseId}
        FOR UPDATE
      `;

      if (!stockEntry || stockEntry.length === 0) {
        throw new Error("STOCK_NOT_FOUND");
      }

      const stock = stockEntry[0];
      const availableUnits = stock.total_units - stock.reserved_units;

      // If not enough units, return 409 Conflict
      if (availableUnits < qty) {
        throw new Error("INSUFFICIENT_STOCK");
      }

      // Atomically increment reservedUnits
      await tx.$executeRaw`
        UPDATE "StockEntry"
        SET "reservedUnits" = "reservedUnits" + ${qty},
            "updatedAt" = NOW()
        WHERE id = ${stock.id}
      `;

      // Create reservation with 15-minute expiry
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      const newReservation = await tx.reservation.create({
        data: {
          userId: session.user.id,
          productId,
          warehouseId,
          qty,
          status: "PENDING",
          expiresAt,
        },
        include: {
          product: true,
          warehouse: true,
        },
      });

      return newReservation;
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message === "INSUFFICIENT_STOCK") {
      // 409 Conflict — another request already took the stock
      return NextResponse.json(
        { error: "Insufficient stock available. Another customer may have just reserved the last units." },
        { status: 409 }
      );
    }

    if (message === "STOCK_NOT_FOUND") {
      return NextResponse.json({ error: "Stock entry not found for this product/warehouse" }, { status: 404 });
    }

    console.error("[RESERVATIONS_POST]", error);
    return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 });
  }
}

// GET /api/reservations — List current user's reservations
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const reservations = await prisma.reservation.findMany({
      where: { userId: session.user.id, status: "PENDING" },
      include: { product: true, warehouse: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error("[RESERVATIONS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 });
  }
}
