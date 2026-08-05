import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { OrderStatus, BookingStatus } from "../../../generated/prisma/client";
import { syncEquipmentStock } from "@/app/lib/equipmentStock";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Try to find if this is an Order by orderNumber
    let order = await prisma.order.findUnique({
      where: { orderNumber: id },
      include: {
        user: { select: { name: true, email: true, phone: true, address: true } },
        items: {
          include: {
            equipment: { select: { name: true, brand: true } },
            service: { select: { name: true } },
          },
        },
      },
    });

    // 2. Try to find if this is an Order by ID
    if (!order) {
      order = await prisma.order.findUnique({
        where: { id: id },
        include: {
          user: { select: { name: true, email: true, phone: true, address: true } },
          items: {
            include: {
              equipment: { select: { name: true, brand: true } },
              service: { select: { name: true } },
            },
          },
        },
      });
    }

    if (order) {
      const items = order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        duration: item.duration,
        price: item.price,
        subtotal: item.subtotal,
        name: item.equipment ? item.equipment.name : item.service ? item.service.name : "Item",
        brand: item.equipment ? item.equipment.brand : undefined,
        type: item.equipment ? "equipment" : "service",
      }));

      return NextResponse.json({
        type: "order",
        id: order.orderNumber,
        dbId: order.id,
        createdAt: order.createdAt,
        status: order.status,
        totalAmount: order.totalAmount,
        notes: order.notes,
        startDate: order.startDate,
        endDate: order.endDate,
        user: order.user,
        items,
      });
    }

    // 3. Try to find if this is a StudioBooking by ID
    let booking = await prisma.studioBooking.findUnique({
      where: { id: id },
      include: {
        user: { select: { name: true, email: true, phone: true, address: true } },
        studio: { select: { name: true, pricePerHour: true } },
      },
    });

    // 4. Try to find if this is a StudioBooking by suffix (STB-xxxx)
    if (!booking && id.startsWith("STB-")) {
      const suffix = id.replace("STB-", "").toLowerCase();
      const bookings = await prisma.studioBooking.findMany({
        include: {
          user: { select: { name: true, email: true, phone: true, address: true } },
          studio: { select: { name: true, pricePerHour: true } },
        },
      });
      booking = bookings.find(b => b.id.slice(-8).toLowerCase() === suffix) || null;
    }

    if (booking) {
      const items = [
        {
          id: booking.id,
          quantity: 1,
          duration: booking.duration,
          price: booking.studio.pricePerHour,
          subtotal: booking.totalPrice,
          name: `Sewa ${booking.studio.name} (${booking.startTime} - ${booking.endTime})`,
          type: "studio",
        },
      ];

      return NextResponse.json({
        type: "booking",
        id: `STB-${booking.id.slice(-8).toUpperCase()}`,
        dbId: booking.id,
        createdAt: booking.createdAt,
        status: booking.status,
        totalAmount: booking.totalPrice,
        notes: booking.notes,
        startDate: booking.date,
        endDate: booking.date,
        user: booking.user,
        items,
      });
    }

    return NextResponse.json({ error: "Order or booking not found" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching order/booking:", error);
    return NextResponse.json({ error: "Failed to fetch order/booking details" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    // 1. Try to find if this is an Order by orderNumber
    let order = await prisma.order.findUnique({
      where: { orderNumber: id },
    });

    // 2. Try to find if this is an Order by ID
    if (!order) {
      order = await prisma.order.findUnique({
        where: { id: id },
      });
    }

    if (order) {
      // Map frontend status string to OrderStatus enum
      let prismaStatus: OrderStatus = "PENDING";
      const s = status.toLowerCase();
      if (s.includes("menunggu") || s.includes("pending")) prismaStatus = "PENDING";
      else if (s.includes("diproses") || s.includes("lunas") || s.includes("confirmed") || s.includes("processing")) prismaStatus = "PROCESSING";
      else if (s.includes("aktif") || s.includes("active")) prismaStatus = "ACTIVE";
      else if (s.includes("selesai") || s.includes("completed")) prismaStatus = "COMPLETED";
      else if (s.includes("batal") || s.includes("cancel") || s.includes("dibatalkan")) prismaStatus = "CANCELLED";

      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { status: prismaStatus },
      });

      try {
        await syncEquipmentStock();
      } catch (err) {
        console.error("Failed to sync stock after status update:", err);
      }

      return NextResponse.json(updated);
    }

    // 3. Try to find if this is a StudioBooking by ID
    let booking = await prisma.studioBooking.findUnique({
      where: { id: id },
    });

    // 4. Try to find if this is a StudioBooking by suffix (STB-xxxx)
    if (!booking && id.startsWith("STB-")) {
      const suffix = id.replace("STB-", "").toLowerCase();
      const bookings = await prisma.studioBooking.findMany();
      booking = bookings.find(b => b.id.slice(-8).toLowerCase() === suffix) || null;
    }

    if (booking) {
      // Map frontend status string to BookingStatus enum
      let prismaStatus: BookingStatus = "PENDING";
      const s = status.toLowerCase();
      if (s.includes("menunggu") || s.includes("pending")) prismaStatus = "PENDING";
      else if (s.includes("diproses") || s.includes("lunas") || s.includes("confirmed")) prismaStatus = "CONFIRMED";
      else if (s.includes("aktif") || s.includes("active") || s.includes("use")) prismaStatus = "IN_USE";
      else if (s.includes("selesai") || s.includes("completed")) prismaStatus = "COMPLETED";
      else if (s.includes("batal") || s.includes("cancel") || s.includes("dibatalkan")) prismaStatus = "CANCELLED";

      const updated = await prisma.studioBooking.update({
        where: { id: booking.id },
        data: { status: prismaStatus },
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Order or booking not found" }, { status: 404 });
  } catch (error) {
    console.error("Error updating order/booking status:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
