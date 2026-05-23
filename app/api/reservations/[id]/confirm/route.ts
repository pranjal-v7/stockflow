import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/reservations/[id]/confirm — Confirm reservation after checkout
// Returns 410 Gone if reservation has expired
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const order = await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id },
        include: { product: true, warehouse: true },
      });

      if (!reservation) {
        throw new Error("NOT_FOUND");
      }

      if (reservation.userId !== session.user.id && session.user.role !== "ADMIN") {
        throw new Error("FORBIDDEN");
      }

      if (reservation.status !== "PENDING") {
        throw new Error(`INVALID_STATUS:${reservation.status}`);
      }

      // 410 Gone — reservation window has passed
      if (new Date() > reservation.expiresAt) {
        // Restore reserved units before expiring
        await tx.$executeRaw`
          UPDATE "StockEntry"
          SET "reservedUnits" = GREATEST("reservedUnits" - ${reservation.qty}, 0),
              "updatedAt" = NOW()
          WHERE "productId" = ${reservation.productId}
            AND "warehouseId" = ${reservation.warehouseId}
        `;
        await tx.reservation.update({ where: { id }, data: { status: "EXPIRED" } });
        throw new Error("EXPIRED");
      }

      // Decrement totalUnits (stock is now sold) — reservedUnits stays same
      // Net effect: available = total - reserved decreases by qty permanently
      await tx.$executeRaw`
        UPDATE "StockEntry"
        SET "totalUnits" = GREATEST("totalUnits" - ${reservation.qty}, 0),
            "reservedUnits" = GREATEST("reservedUnits" - ${reservation.qty}, 0),
            "updatedAt" = NOW()
        WHERE "productId" = ${reservation.productId}
          AND "warehouseId" = ${reservation.warehouseId}
      `;

      // Update reservation to CONFIRMED
      await tx.reservation.update({ where: { id }, data: { status: "CONFIRMED" } });

      // Create the Order record
      const newOrder = await tx.order.create({
        data: {
          reservationId: id,
          customerId: session.user.id,
          status: "CONFIRMED",
        },
        include: {
          reservation: { include: { product: true, warehouse: true } },
        },
      });

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";

    if (message === "EXPIRED") return NextResponse.json({ error: "Reservation has expired. Stock has been released." }, { status: 410 });
    if (message === "NOT_FOUND") return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    if (message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (message.startsWith("INVALID_STATUS")) {
      const status = message.split(":")[1];
      return NextResponse.json({ error: `Cannot confirm a ${status} reservation` }, { status: 422 });
    }

    console.error("[CONFIRM_POST]", error);
    return NextResponse.json({ error: "Failed to confirm reservation" }, { status: 500 });
  }
}
