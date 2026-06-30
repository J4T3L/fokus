import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { createMidtransTransaction } from "@/app/lib/midtrans";

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // 1. Try to find if this is a direct Order by ID
    let order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    });

    // 2. Try to find if this is a Studio Booking (e.g. STB-XXXXXX)
    if (!order && (orderId.startsWith("STB-") || orderId.length === 25)) {
      let booking = await prisma.studioBooking.findUnique({
        where: { id: orderId },
        include: { user: true, studio: true }
      });

      if (!booking && orderId.startsWith("STB-")) {
        const suffix = orderId.replace("STB-", "").toLowerCase();
        const bookings = await prisma.studioBooking.findMany({
          include: { user: true, studio: true }
        });
        booking = bookings.find(b => b.id.slice(-8).toLowerCase() === suffix) || null;
      }

      if (booking) {
        const result = await createMidtransTransaction({
          orderId: `STB-${booking.id.slice(-8).toUpperCase()}`,
          amount: booking.totalPrice,
          customerName: booking.user.name,
          customerEmail: booking.user.email
        });
        return NextResponse.json(result);
      }
    }

    // 3. Try to find if this is an Order by orderNumber
    if (!order) {
      order = await prisma.order.findUnique({
        where: { orderNumber: orderId },
        include: { user: true }
      });
    }

    if (order) {
      const result = await createMidtransTransaction({
        orderId: order.orderNumber,
        amount: order.totalAmount,
        customerName: order.user.name,
        customerEmail: order.user.email
      });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Order/Booking not found" }, { status: 404 });
  } catch (error: any) {
    console.error("Midtrans token creation failed:", error);
    return NextResponse.json({ error: error.message || "Failed to create payment token" }, { status: 500 });
  }
}
