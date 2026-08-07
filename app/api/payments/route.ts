import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        order: { select: { orderNumber: true, user: { select: { name: true } } } }
      }
    });

    const mapped = payments.map((p) => ({
      trxId: "TRX-" + p.id.slice(-8).toUpperCase(),
      orderNumber: p.order?.orderNumber || "—",
      user: p.order?.user?.name || "Pelanggan",
      method: p.method,
      amount: "Rp " + p.amount.toLocaleString("id-ID"),
      proofImage: p.proofImage || null,
      time: p.createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
      status: p.status === "CONFIRMED" ? "Settled" : 
              p.status === "REJECTED" ? "Failed" : 
              p.status === "PENDING" ? "Pending" : p.status,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}
