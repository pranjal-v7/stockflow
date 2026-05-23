import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/orders/[id]/assign-agent — Assign delivery agent to order
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session || !["ADMIN", "WAREHOUSE_MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { deliveryAgentId } = await req.json();

    if (!deliveryAgentId) {
      return NextResponse.json({ error: "deliveryAgentId is required" }, { status: 400 });
    }

    // Verify the agent exists and has the right role
    const agent = await prisma.user.findUnique({ where: { id: deliveryAgentId } });
    if (!agent || agent.role !== "DELIVERY_AGENT") {
      return NextResponse.json({ error: "Invalid delivery agent" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { deliveryAgentId, status: "SHIPPED" },
      include: {
        reservation: { include: { product: true, warehouse: true } },
        deliveryAgent: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("[ASSIGN_AGENT_PUT]", error);
    return NextResponse.json({ error: "Failed to assign delivery agent" }, { status: 500 });
  }
}
