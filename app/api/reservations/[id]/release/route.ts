import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/reservations/[id]/release — Release a reservation, restore stock
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({ where: { id } });

      if (!reservation) throw new Error("NOT_FOUND");

      if (reservation.userId !== session.user.id && session.user.role !== "ADMIN") {
        throw new Error("FORBIDDEN");
      }

      if (reservation.status !== "PENDING") {
        throw new Error(`INVALID_STATUS:${reservation.status}`);
      }

      // Restore reserved units back to available
      await tx.$executeRaw`
        UPDATE "StockEntry"
        SET "reservedUnits" = GREATEST("reservedUnits" - ${reservation.qty}, 0),
            "updatedAt" = NOW()
        WHERE "productId" = ${reservation.productId}
          AND "warehouseId" = ${reservation.warehouseId}
      `;

      // Mark reservation as RELEASED
      await tx.reservation.update({ where: { id }, data: { status: "RELEASED" } });
    });

    return NextResponse.json({ message: "Reservation released. Stock has been restored." });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";

    if (message === "NOT_FOUND") return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    if (message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (message.startsWith("INVALID_STATUS")) {
      const status = message.split(":")[1];
      return NextResponse.json({ error: `Cannot release a ${status} reservation` }, { status: 422 });
    }

    console.error("[RELEASE_POST]", error);
    return NextResponse.json({ error: "Failed to release reservation" }, { status: 500 });
  }
}
