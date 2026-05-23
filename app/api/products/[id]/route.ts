import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/products/[id]
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockEntries: { include: { warehouse: true } },
      },
    });

    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCT_GET]", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// PUT /api/products/[id] — Update product (Admin only)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const data = await req.json();

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price ? parseFloat(data.price) : undefined,
        category: data.category,
        images: data.images,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCT_PUT]", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE /api/products/[id] — Delete product (Admin only)
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("[PRODUCT_DELETE]", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
