import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { extraDays } = await request.json();

    const daysToAdd = Number(extraDays || 1);
    if (daysToAdd < 1) {
      return NextResponse.json({ error: "Durasi perpanjangan minimal 1 hari" }, { status: 400 });
    }

    let order = await prisma.order.findUnique({
      where: { orderNumber: id },
      include: {
        items: {
          include: { equipment: true }
        }
      }
    });

    if (!order) {
      order = await prisma.order.findUnique({
        where: { id: id },
        include: {
          items: {
            include: { equipment: true }
          }
        }
      });
    }

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    // Calculate total price for extra days based on daily rates
    let extraCost = 0;
    order.items.forEach((item) => {
      const dailyPrice = item.equipment?.pricePerDay || item.price || 0;
      extraCost += dailyPrice * item.quantity * daysToAdd;
    });

    const currentEndDate = order.endDate ? new Date(order.endDate) : new Date();
    const newEndDate = new Date(currentEndDate.getTime() + daysToAdd * 86400000);

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        endDate: newEndDate,
        extensionFee: order.extensionFee + extraCost,
        feeStatus: "UNPAID",
        status: "ACTIVE"
      }
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil memperpanjang sewa ${daysToAdd} hari. Tagihan perpanjangan: Rp ${extraCost.toLocaleString("id-ID")}`,
      order: updatedOrder,
      extraCost
    });
  } catch (error) {
    console.error("Error extending rental:", error);
    return NextResponse.json({ error: "Gagal memperpanjang sewa" }, { status: 500 });
  }
}
