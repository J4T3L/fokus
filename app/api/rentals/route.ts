import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const search = searchParams.get("search")?.toLowerCase() || "";

    // 1. Fetch all equipment rental orders
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

      const isOverdue =
        (order.status === "ACTIVE" || order.status === "PROCESSING") && endDate < now;

      const diffMs = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      let parsedNotes: any = null;
      try {
        if (order.notes && order.notes.startsWith("{")) {
          parsedNotes = JSON.parse(order.notes);
        }
      } catch {
        parsedNotes = null;
      }

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        type: "EQUIPMENT",
        createdAt: order.createdAt.toISOString(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: order.status,
        totalAmount: order.totalAmount,
        notes: order.notes,
        cancelRequest: parsedNotes?.cancelRequest || null,
        rescheduleRequest: parsedNotes?.rescheduleRequest || null,
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
        studio: null,
        isOverdue,
        diffDays,
      };
    });

    // 2. Fetch all Studio Bookings for Monitoring Studio
    const studioBookings = await prisma.studioBooking.findMany({
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
        studio: true,
      },
    });

    const mappedStudios = studioBookings.map((sb) => {
      let parsedNotes: any = null;
      try {
        if (sb.notes && sb.notes.startsWith("{")) {
          parsedNotes = JSON.parse(sb.notes);
        }
      } catch {
        parsedNotes = null;
      }

      const bookingDate = new Date(sb.date);
      const isOverdue = (sb.status === "CONFIRMED" || sb.status === "IN_USE") && bookingDate < now;

      return {
        id: sb.id,
        orderNumber: `STB-${sb.id.slice(-8).toUpperCase()}`,
        type: "STUDIO",
        createdAt: sb.createdAt.toISOString(),
        startDate: sb.date.toISOString(),
        endDate: sb.date.toISOString(),
        startTime: sb.startTime,
        endTime: sb.endTime,
        duration: sb.duration,
        status: sb.status === "CONFIRMED" ? "PROCESSING" :
                sb.status === "IN_USE" ? "ACTIVE" :
                sb.status === "COMPLETED" ? "COMPLETED" :
                sb.status === "CANCELLED" ? "CANCELLED" : "PENDING",
        rawStatus: sb.status,
        totalAmount: sb.totalPrice,
        notes: sb.notes,
        cancelRequest: parsedNotes?.cancelRequest || null,
        rescheduleRequest: parsedNotes?.rescheduleRequest || null,
        borrower: {
          id: sb.user.id,
          name: sb.user.name,
          email: sb.user.email,
          phone: sb.user.phone || "—",
          address: sb.user.address || "—",
          avatar: sb.user.avatar,
        },
        studio: {
          id: sb.studio.id,
          name: sb.studio.name,
          capacity: sb.studio.capacity,
          pricePerHour: sb.studio.pricePerHour,
          image: sb.studio.image,
        },
        items: [
          {
            id: sb.id,
            quantity: 1,
            duration: sb.duration,
            price: sb.studio.pricePerHour,
            subtotal: sb.totalPrice,
            equipment: {
              id: sb.studio.id,
              name: `Sewa ${sb.studio.name} (${sb.startTime} - ${sb.endTime})`,
              brand: "Ruang Studio",
              type: "Studio",
              image: sb.studio.image,
              stock: 1,
              available: sb.status === "IN_USE" ? 0 : 1,
            },
          },
        ],
        paymentStatus: sb.status === "CANCELLED" ? "CANCELLED" : "CONFIRMED",
        paymentMethod: "VA / QRIS",
        isOverdue,
        diffDays: 0,
      };
    });

    let combined = [...mappedRentals, ...mappedStudios].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (statusFilter && statusFilter !== "ALL") {
      if (statusFilter === "OVERDUE") {
        combined = combined.filter((r) => r.isOverdue);
      } else {
        combined = combined.filter((r) => r.status === statusFilter);
      }
    }

    if (search) {
      combined = combined.filter(
        (r) =>
          r.orderNumber.toLowerCase().includes(search) ||
          r.borrower.name.toLowerCase().includes(search) ||
          r.borrower.email.toLowerCase().includes(search) ||
          r.borrower.phone.toLowerCase().includes(search) ||
          (r.studio && r.studio.name.toLowerCase().includes(search)) ||
          r.items.some((i) => i.equipment?.name.toLowerCase().includes(search))
      );
    }

    return NextResponse.json(combined);
  } catch (error) {
    console.error("Error fetching rental monitoring list:", error);
    return NextResponse.json(
      { error: "Failed to fetch rental list" },
      { status: 500 }
    );
  }
}
