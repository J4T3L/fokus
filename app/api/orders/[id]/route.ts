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
            equipment: { select: { name: true, brand: true, image: true } },
            service: { select: { name: true, image: true } },
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
              equipment: { select: { name: true, brand: true, image: true } },
              service: { select: { name: true, image: true } },
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

      let parsedNotes: any = null;
      try {
        if (order.notes && order.notes.startsWith("{")) {
          parsedNotes = JSON.parse(order.notes);
        }
      } catch {
        parsedNotes = null;
      }

      return NextResponse.json({
        type: "order",
        id: order.orderNumber,
        dbId: order.id,
        createdAt: order.createdAt,
        status: order.status,
        totalAmount: order.totalAmount,
        notes: order.notes,
        parsedNotes,
        cancelRequest: parsedNotes?.cancelRequest || null,
        rescheduleRequest: parsedNotes?.rescheduleRequest || null,
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
        studio: { select: { name: true, pricePerHour: true, image: true } },
      },
    });

    // 4. Try to find if this is a StudioBooking by suffix (STB-xxxx)
    if (!booking && id.startsWith("STB-")) {
      const suffix = id.replace("STB-", "").toLowerCase();
      const bookings = await prisma.studioBooking.findMany({
        include: {
          user: { select: { name: true, email: true, phone: true, address: true } },
          studio: { select: { name: true, pricePerHour: true, image: true } },
        },
      });
      booking = bookings.find((b) => b.id.slice(-8).toLowerCase() === suffix) || null;
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

      let parsedNotes: any = null;
      try {
        if (booking.notes && booking.notes.startsWith("{")) {
          parsedNotes = JSON.parse(booking.notes);
        }
      } catch {
        parsedNotes = null;
      }

      return NextResponse.json({
        type: "booking",
        id: `STB-${booking.id.slice(-8).toUpperCase()}`,
        dbId: booking.id,
        createdAt: booking.createdAt,
        status: booking.status,
        totalAmount: booking.totalPrice,
        notes: booking.notes,
        parsedNotes,
        cancelRequest: parsedNotes?.cancelRequest || null,
        rescheduleRequest: parsedNotes?.rescheduleRequest || null,
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
    const { status, action } = body;

    // 1. Try to find if this is an Order by orderNumber or ID
    let order = await prisma.order.findUnique({
      where: { orderNumber: id },
    });

    if (!order) {
      order = await prisma.order.findUnique({
        where: { id: id },
      });
    }

    if (order) {
      let updateData: any = {};
      let parsedNotes: any = {};
      try {
        if (order.notes && order.notes.startsWith("{")) {
          parsedNotes = JSON.parse(order.notes);
        } else {
          parsedNotes = { userNotes: order.notes || "" };
        }
      } catch {
        parsedNotes = { userNotes: order.notes || "" };
      }

      // Handle specific action approvals
      if (action === "ACC_CANCEL") {
        updateData.status = "CANCELLED";
        if (parsedNotes.cancelRequest) {
          parsedNotes.cancelRequest.status = "APPROVED";
          parsedNotes.cancelRequest.approvedAt = new Date().toISOString();
        }
        updateData.notes = JSON.stringify(parsedNotes);
      } else if (action === "REJECT_CANCEL") {
        if (parsedNotes.cancelRequest) {
          parsedNotes.cancelRequest.status = "REJECTED";
          parsedNotes.cancelRequest.rejectedAt = new Date().toISOString();
        }
        updateData.notes = JSON.stringify(parsedNotes);
      } else if (action === "ACC_RESCHEDULE") {
        if (parsedNotes.rescheduleRequest) {
          parsedNotes.rescheduleRequest.status = "APPROVED";
          parsedNotes.rescheduleRequest.approvedAt = new Date().toISOString();
          if (parsedNotes.rescheduleRequest.newStartDate) {
            updateData.startDate = new Date(parsedNotes.rescheduleRequest.newStartDate);
          }
          if (parsedNotes.rescheduleRequest.newEndDate) {
            updateData.endDate = new Date(parsedNotes.rescheduleRequest.newEndDate);
          }
        }
        updateData.notes = JSON.stringify(parsedNotes);
        if (order.status === "PENDING") updateData.status = "PROCESSING";
      } else if (action === "REJECT_RESCHEDULE") {
        if (parsedNotes.rescheduleRequest) {
          parsedNotes.rescheduleRequest.status = "REJECTED";
          parsedNotes.rescheduleRequest.rejectedAt = new Date().toISOString();
        }
        updateData.notes = JSON.stringify(parsedNotes);
      } else if (status) {
        // General status change
        let prismaStatus: OrderStatus = "PENDING";
        const s = status.toLowerCase();
        if (s.includes("menunggu") || s.includes("pending")) prismaStatus = "PENDING";
        else if (s.includes("diproses") || s.includes("lunas") || s.includes("confirmed") || s.includes("processing")) prismaStatus = "PROCESSING";
        else if (s.includes("aktif") || s.includes("active")) prismaStatus = "ACTIVE";
        else if (s.includes("selesai") || s.includes("completed")) prismaStatus = "COMPLETED";
        else if (s.includes("batal") || s.includes("cancel") || s.includes("dibatalkan")) prismaStatus = "CANCELLED";
        updateData.status = prismaStatus;
      }

      const updated = await prisma.order.update({
        where: { id: order.id },
        data: updateData,
      });

      try {
        await syncEquipmentStock();
      } catch (err) {
        console.error("Failed to sync stock after status update:", err);
      }

      return NextResponse.json(updated);
    }

    // 2. Try to find if this is a StudioBooking by ID or suffix
    let booking = await prisma.studioBooking.findUnique({
      where: { id: id },
    });

    if (!booking && id.startsWith("STB-")) {
      const suffix = id.replace("STB-", "").toLowerCase();
      const bookings = await prisma.studioBooking.findMany();
      booking = bookings.find((b) => b.id.slice(-8).toLowerCase() === suffix) || null;
    }

    if (booking) {
      let updateData: any = {};
      let parsedNotes: any = {};
      try {
        if (booking.notes && booking.notes.startsWith("{")) {
          parsedNotes = JSON.parse(booking.notes);
        } else {
          parsedNotes = { userNotes: booking.notes || "" };
        }
      } catch {
        parsedNotes = { userNotes: booking.notes || "" };
      }

      if (action === "ACC_CANCEL") {
        updateData.status = "CANCELLED";
        if (parsedNotes.cancelRequest) {
          parsedNotes.cancelRequest.status = "APPROVED";
          parsedNotes.cancelRequest.approvedAt = new Date().toISOString();
        }
        updateData.notes = JSON.stringify(parsedNotes);
      } else if (action === "REJECT_CANCEL") {
        if (parsedNotes.cancelRequest) {
          parsedNotes.cancelRequest.status = "REJECTED";
          parsedNotes.cancelRequest.rejectedAt = new Date().toISOString();
        }
        updateData.notes = JSON.stringify(parsedNotes);
      } else if (action === "ACC_RESCHEDULE") {
        if (parsedNotes.rescheduleRequest) {
          parsedNotes.rescheduleRequest.status = "APPROVED";
          parsedNotes.rescheduleRequest.approvedAt = new Date().toISOString();
          if (parsedNotes.rescheduleRequest.newDate) {
            updateData.date = new Date(parsedNotes.rescheduleRequest.newDate);
          }
          if (parsedNotes.rescheduleRequest.newStartTime) {
            updateData.startTime = parsedNotes.rescheduleRequest.newStartTime;
          }
          if (parsedNotes.rescheduleRequest.newEndTime) {
            updateData.endTime = parsedNotes.rescheduleRequest.newEndTime;
          }
        }
        updateData.notes = JSON.stringify(parsedNotes);
        if (booking.status === "PENDING") updateData.status = "CONFIRMED";
      } else if (action === "REJECT_RESCHEDULE") {
        if (parsedNotes.rescheduleRequest) {
          parsedNotes.rescheduleRequest.status = "REJECTED";
          parsedNotes.rescheduleRequest.rejectedAt = new Date().toISOString();
        }
        updateData.notes = JSON.stringify(parsedNotes);
      } else if (status) {
        let prismaStatus: BookingStatus = "PENDING";
        const s = status.toLowerCase();
        if (s.includes("menunggu") || s.includes("pending")) prismaStatus = "PENDING";
        else if (s.includes("diproses") || s.includes("lunas") || s.includes("confirmed")) prismaStatus = "CONFIRMED";
        else if (s.includes("aktif") || s.includes("active") || s.includes("use")) prismaStatus = "IN_USE";
        else if (s.includes("selesai") || s.includes("completed")) prismaStatus = "COMPLETED";
        else if (s.includes("batal") || s.includes("cancel") || s.includes("dibatalkan")) prismaStatus = "CANCELLED";
        updateData.status = prismaStatus;
      }

      const updated = await prisma.studioBooking.update({
        where: { id: booking.id },
        data: updateData,
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Order or booking not found" }, { status: 404 });
  } catch (error) {
    console.error("Error updating order/booking status:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
