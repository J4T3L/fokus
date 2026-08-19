import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { paymentMethod, proofImage } = await request.json();

    let order = await prisma.order.findUnique({
      where: { orderNumber: id }
    });

    if (!order) {
      order = await prisma.order.findUnique({
        where: { id: id }
      });
    }

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    const totalFee = (order.lateFee || 0) + (order.extensionFee || 0) + (order.damageFee || 0) + (order.lossFee || 0);

    if (totalFee === 0) {
      return NextResponse.json({ error: "Tidak ada denda atau biaya tambahan yang perlu dibayar." }, { status: 400 });
    }

    // Record Payment
    await prisma.payment.create({
      data: {
        amount: totalFee,
        method: paymentMethod || "TRANSFER",
        status: "CONFIRMED",
        proofImage: proofImage || null,
        confirmedAt: new Date(),
        orderId: order.id
      }
    });

    // Update Fee status
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        feeStatus: "PAID",
        totalAmount: order.totalAmount + totalFee
      }
    });

    return NextResponse.json({
      success: true,
      message: "Pembayaran denda / biaya perpanjangan berhasil dikonfirmasi.",
      order: updatedOrder
    });
  } catch (error) {
    console.error("Error paying fee:", error);
    return NextResponse.json({ error: "Gagal memproses pembayaran denda" }, { status: 500 });
  }
}
