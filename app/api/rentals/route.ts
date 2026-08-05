import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const search = searchParams.get("search")?.toLowerCase() || "";

    // Fetch all orders that include equipment items
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            equipmentId: { not: null },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            avatar: true,
          },
        },
        items: {
          where: {
            equipmentId: { not: null },
          },
          include: {
            equipment: true,
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    const now = new Date();

    const mappedRentals = orders.map((order) => {
      const startDate = order.startDate ? new Date(order.startDate) : order.createdAt;
      const endDate = order.endDate
        ? new Date(order.endDate)
        : new Date(startDate.getTime() + (order.items[0]?.duration || 1) * 86400000);

      // Overdue calculation: active/processing and end date is past
      const isOverdue =
        (order.status === "ACTIVE" || order.status === "PROCESSING") && endDate < now;

      // Calculate days remaining or days overdue
      const diffMs = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt.toISOString(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: order.status, // PENDING | PROCESSING | ACTIVE | COMPLETED | CANCELLED
        totalAmount: order.totalAmount,
        notes: order.notes,
        borrower: {
          id: order.user.id,
          name: order.user.name,
          email: order.user.email,
          phone: order.user.phone || "—",
          address: order.user.address || "—",
          avatar: order.user.avatar,
        },
        items: order.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          duration: item.duration,
          price: item.price,
          subtotal: item.subtotal,
          equipment: item.equipment
            ? {
                id: item.equipment.id,
                name: item.equipment.name,
                brand: item.equipment.brand,
                type: item.equipment.type,
                image: item.equipment.image,
                stock: item.equipment.stock,
                available: item.equipment.available,
              }
            : null,
        })),
        paymentStatus: order.payments[0]?.status || "PENDING",
        paymentMethod: order.payments[0]?.method || "—",
        isOverdue,
        diffDays,
      };
    });

    // Apply filtering if requested
    let filtered = mappedRentals;
    if (statusFilter && statusFilter !== "ALL") {
      if (statusFilter === "OVERDUE") {
        filtered = filtered.filter((r) => r.isOverdue);
      } else {
        filtered = filtered.filter((r) => r.status === statusFilter);
      }
    }

    if (search) {
      filtered = filtered.filter(
        (r) =>
          r.orderNumber.toLowerCase().includes(search) ||
          r.borrower.name.toLowerCase().includes(search) ||
          r.borrower.email.toLowerCase().includes(search) ||
          r.borrower.phone.toLowerCase().includes(search) ||
          r.items.some((i) => i.equipment?.name.toLowerCase().includes(search))
      );
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Error fetching rental monitoring list:", error);
    return NextResponse.json(
      { error: "Failed to fetch rental list" },
      { status: 500 }
    );
  }
}
