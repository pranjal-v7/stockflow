import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/metrics — Live metrics for admin dashboard
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [
      activeReservations,
      expiredLast1h,
      totalOrders,
      ordersByStatus,
      stockEntries,
      totalProducts,
      totalWarehouses,
    ] = await Promise.all([
      prisma.reservation.count({ where: { status: "PENDING" } }),
      prisma.reservation.count({
        where: {
          status: "EXPIRED",
          updatedAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
        },
      }),
      prisma.order.count(),
      prisma.order.groupBy({ by: ["status"], _count: { status: true } }),
      prisma.stockEntry.findMany({ include: { product: true, warehouse: true } }),
      prisma.product.count(),
      prisma.warehouse.count(),
    ]);

    const totalUnits = stockEntries.reduce((s, e) => s + e.totalUnits, 0);
    const reservedUnits = stockEntries.reduce((s, e) => s + e.reservedUnits, 0);
    const availableUnits = totalUnits - reservedUnits;

    // Low stock: entries where available < 10
    const lowStockItems = stockEntries
      .filter((e) => e.totalUnits - e.reservedUnits < 10 && e.totalUnits > 0)
      .map((e) => ({
        productName: e.product.name,
        warehouseName: e.warehouse.name,
        available: e.totalUnits - e.reservedUnits,
        total: e.totalUnits,
      }));

    const outOfStockItems = stockEntries.filter((e) => e.totalUnits - e.reservedUnits === 0).length;

    return NextResponse.json({
      activeReservations,
      expiredLast1h,
      totalOrders,
      ordersByStatus: Object.fromEntries(ordersByStatus.map((o) => [o.status, o._count.status])),
      totalProducts,
      totalWarehouses,
      totalUnits,
      reservedUnits,
      availableUnits,
      lowStockItems,
      outOfStockItems,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[ADMIN_METRICS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}
