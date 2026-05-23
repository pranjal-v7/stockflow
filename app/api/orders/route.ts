import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/orders — List orders (role-filtered)
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const where =
      session.user.role === "CUSTOMER"
        ? { customerId: session.user.id }
        : session.user.role === "DELIVERY_AGENT"
        ? { deliveryAgentId: session.user.id }
        : {}; // Admin + Warehouse see all

    const orders = await prisma.order.findMany({
      where,
      include: {
        reservation: { include: { product: true, warehouse: true } },
        customer: { select: { id: true, name: true, email: true } },
        deliveryAgent: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("[ORDERS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
