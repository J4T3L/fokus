import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const { id, paymentMethod, amount } = await request.json();

    if (!id || !paymentMethod || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Try to find if this is an Order (by orderNumber or ID)
    let order = await prisma.order.findUnique({
      where: { orderNumber: id },
    });

    if (!order) {
      order = await prisma.order.findUnique({
        where: { id: id },
      });
    }

    if (order) {
      // Update Order to PROCESSING
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PROCESSING" },
      });

      // Create Payment entry
      const payment = await prisma.payment.create({
        data: {
          amount: Number(amount),
          method: paymentMethod,
          status: "CONFIRMED",
          confirmedAt: new Date(),
          orderId: order.id,
        },
      });

      return NextResponse.json({ success: true, type: "order", payment });
    }

    // 2. Try to find if this is a StudioBooking
    let booking = await prisma.studioBooking.findUnique({
      where: { id: id },
    });

    // Try finding by suffix if ID is not direct
    if (!booking && id.startsWith("STB-")) {
      const suffix = id.replace("STB-", "").toLowerCase();
      const bookings = await prisma.studioBooking.findMany();
      booking = bookings.find(b => b.id.slice(-8).toLowerCase() === suffix) || null;
    }

    if (booking) {
      // Update Booking to CONFIRMED
      const updatedBooking = await prisma.studioBooking.update({
        where: { id: booking.id },
        data: { status: "CONFIRMED" },
      });

      return NextResponse.json({ success: true, type: "booking", booking: updatedBooking });
    }

    return NextResponse.json({ error: "Order or booking not found" }, { status: 404 });
  } catch (error) {
    console.error("Payment webhook error:", error);
    return NextResponse.json({ error: "Failed to process payment webhook" }, { status: 500 });
  }
}
