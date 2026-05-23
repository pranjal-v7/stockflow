import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

// PUT /api/orders/[id]/status — Update order status
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session || !["ADMIN", "WAREHOUSE_MANAGER", "DELIVERY_AGENT"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { status } = await req.json();

    const validStatuses: OrderStatus[] = ["CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        reservation: { include: { product: true, warehouse: true } },
        customer: { select: { name: true, email: true } },
        deliveryAgent: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("[ORDER_STATUS_PUT]", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}
