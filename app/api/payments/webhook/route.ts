import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { sendOrderNotificationEmail, sendBookingNotificationEmail } from "@/app/lib/email";
import { syncEquipmentStock } from "@/app/lib/equipmentStock";

export async function POST(request: Request) {
  try {
    const { id, paymentMethod, amount, proofImage } = await request.json();

    if (!id || !paymentMethod || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!proofImage && !paymentMethod.toUpperCase().includes("MIDTRANS")) {
      return NextResponse.json({ error: "Wajib mengunggah foto bukti transfer" }, { status: 400 });
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
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { status: "PROCESSING" },
      });

      try {
        await syncEquipmentStock();
      } catch (stockErr) {
        console.error("Failed to sync stock in webhook:", stockErr);
      }

      // Create Payment entry
      const payment = await prisma.payment.create({
        data: {
          amount: Number(amount),
          method: paymentMethod,
          status: "CONFIRMED",
          proofImage: proofImage || null,
          confirmedAt: new Date(),
          orderId: order.id,
        },
      });

      // Send email confirmation
      try {
        const user = await prisma.user.findUnique({
          where: { id: order.userId },
          select: { email: true }
        });
        if (user?.email) {
          const fullOrder = await prisma.order.findUnique({
            where: { id: order.id },
            include: {
              items: {
                include: {
                  equipment: { select: { name: true } },
                  service: { select: { name: true } },
                }
              }
            }
          });
          await sendOrderNotificationEmail(fullOrder, user.email);
        }
      } catch (err) {
        console.error("Webhook email error for order:", err);
      }

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

      // Send email confirmation
      try {
        const user = await prisma.user.findUnique({
          where: { id: booking.userId },
          select: { email: true }
        });
        if (user?.email) {
          const fullBooking = await prisma.studioBooking.findUnique({
            where: { id: booking.id },
            include: {
              studio: { select: { name: true } }
            }
          });
          await sendBookingNotificationEmail(fullBooking, user.email);
        }
      } catch (err) {
        console.error("Webhook email error for booking:", err);
      }

      return NextResponse.json({ success: true, type: "booking", booking: updatedBooking });
    }

    return NextResponse.json({ error: "Order or booking not found" }, { status: 404 });
  } catch (error) {
    console.error("Payment webhook error:", error);
    return NextResponse.json({ error: "Failed to process payment webhook" }, { status: 500 });
  }
}
