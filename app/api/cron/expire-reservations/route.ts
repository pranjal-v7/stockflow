import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/cron/expire-reservations
 *
 * Called by Vercel Cron every 1 minute (configured in vercel.json).
 * Finds all PENDING reservations past their expiresAt and:
 *  1. Sets their status to EXPIRED
 *  2. Restores reservedUnits in StockEntry so stock becomes available again
 */
export async function GET(req: Request) {
  // Verify request is from Vercel Cron (basic security)
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find all expired PENDING reservations
    const expiredReservations = await prisma.reservation.findMany({
      where: {
        status: "PENDING",
        expiresAt: { lt: new Date() },
      },
    });

    if (expiredReservations.length === 0) {
      return NextResponse.json({ expired: 0, message: "No expired reservations found" });
    }

    let expiredCount = 0;

    for (const reservation of expiredReservations) {
      await prisma.$transaction(async (tx) => {
        // Restore reserved units — make stock available again
        await tx.$executeRaw`
          UPDATE "StockEntry"
          SET "reservedUnits" = GREATEST("reservedUnits" - ${reservation.qty}, 0),
              "updatedAt" = NOW()
          WHERE "productId" = ${reservation.productId}
            AND "warehouseId" = ${reservation.warehouseId}
        `;

        // Mark reservation as EXPIRED
        await tx.reservation.update({
          where: { id: reservation.id },
          data: { status: "EXPIRED" },
        });
      });
      expiredCount++;
    }

    console.log(`[CRON] Expired ${expiredCount} reservations, stock restored`);
    return NextResponse.json({
      expired: expiredCount,
      message: `Successfully expired ${expiredCount} reservation(s) and restored stock`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON_EXPIRE]", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
