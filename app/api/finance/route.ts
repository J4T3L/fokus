import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    // 1. Fetch all Payments / Confirmed Orders for Rental Income (Persewaan Murni)
    const confirmedOrders = await prisma.order.findMany({
      where: {
        status: {
          in: ["CONFIRMED", "PROCESSING", "ACTIVE", "OVERDUE", "COMPLETED"],
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: { include: { equipment: true } },
        payments: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    const confirmedBookings = await prisma.studioBooking.findMany({
      where: {
        status: {
          in: ["CONFIRMED", "IN_USE", "COMPLETED"],
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        studio: { select: { name: true } },
      },
    });

    // Calculate Pure Rental Income
    const rentalOrderIncome = confirmedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const bookingIncome = confirmedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const totalRentalIncome = rentalOrderIncome + bookingIncome;

    // 2. Calculate Penalty & Damage/Loss Revenue (Laporan Denda & Kerusakan)
    const penaltyOrders = await prisma.order.findMany({
      where: {
        OR: [
          { lateFee: { gt: 0 } },
          { extensionFee: { gt: 0 } },
          { damageFee: { gt: 0 } },
          { lossFee: { gt: 0 } },
        ]
      },
      orderBy: { updatedAt: "desc" },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: { include: { equipment: true } }
      }
    });

    const penaltyList: any[] = [];
    let totalPenaltyIncome = 0;

    penaltyOrders.forEach((o) => {
      const feeSum = (o.lateFee || 0) + (o.extensionFee || 0) + (o.damageFee || 0) + (o.lossFee || 0);
      totalPenaltyIncome += feeSum;

      const itemNames = o.items.map(i => i.equipment?.name).filter(Boolean).join(", ") || "Alat Rental";

      penaltyList.push({
        id: `FEE-${o.id.slice(-8).toUpperCase()}`,
        trxId: o.orderNumber,
        category: "PENALTY_DAMAGE",
        user: o.user.name,
        userPhone: o.user.phone || "—",
        item: itemNames,
        lateFee: o.lateFee || 0,
        extensionFee: o.extensionFee || 0,
        damageFee: o.damageFee || 0,
        lossFee: o.lossFee || 0,
        totalFee: feeSum,
        conditionStatus: o.conditionStatus || "NORMAL",
        damageNotes: o.damageNotes || "—",
        feeStatus: o.feeStatus || "UNPAID",
        date: o.updatedAt.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        rawDate: o.updatedAt,
      });
    });

    // 3. Canceled Orders / Bookings for Refunds
    const canceledOrders = await prisma.order.findMany({
      where: { status: "CANCELLED" },
      orderBy: { updatedAt: "desc" },
      include: { user: { select: { name: true, email: true, phone: true } } },
    });

    const canceledBookings = await prisma.studioBooking.findMany({
      where: { status: "CANCELLED" },
      orderBy: { updatedAt: "desc" },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        studio: { select: { name: true } },
      },
    });

    const refundList: any[] = [];

    canceledOrders.forEach((o) => {
      let parsedNotes: any = null;
      try {
        if (o.notes && o.notes.startsWith("{")) {
          parsedNotes = JSON.parse(o.notes);
        }
      } catch {
        parsedNotes = null;
      }

      const cancelReq = parsedNotes?.cancelRequest;

      refundList.push({
        id: `REF-${o.id.slice(-8).toUpperCase()}`,
        trxId: o.orderNumber,
        category: "REFUND",
        type: "Sewa Alat/Jasa",
        user: o.user.name,
        userPhone: o.user.phone || cancelReq?.whatsapp || "—",
        amount: o.totalAmount,
        reason: cancelReq?.reason || "Pembatalan pesanan disetujui admin",
        bankInfo: cancelReq?.bankInfo || "Pembatalan Manual / Cash",
        whatsapp: cancelReq?.whatsapp || o.user.phone || "—",
        date: o.updatedAt.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        rawDate: o.updatedAt,
        status: "REFUNDED",
      });
    });

    canceledBookings.forEach((b) => {
      let parsedNotes: any = null;
      try {
        if (b.notes && b.notes.startsWith("{")) {
          parsedNotes = JSON.parse(b.notes);
        }
      } catch {
        parsedNotes = null;
      }

      const cancelReq = parsedNotes?.cancelRequest;

      refundList.push({
        id: `REF-STB-${b.id.slice(-6).toUpperCase()}`,
        trxId: `STB-${b.id.slice(-8).toUpperCase()}`,
        category: "REFUND",
        type: `Studio ${b.studio.name}`,
        user: b.user.name,
        userPhone: b.user.phone || cancelReq?.whatsapp || "—",
        amount: b.totalPrice,
        reason: cancelReq?.reason || "Pembatalan studio disetujui admin",
        bankInfo: cancelReq?.bankInfo || "Pembatalan Manual / Cash",
        whatsapp: cancelReq?.whatsapp || b.user.phone || "—",
        date: b.updatedAt.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        rawDate: b.updatedAt,
        status: "REFUNDED",
      });
    });

    const totalRefunds = refundList.reduce((sum, r) => sum + r.amount, 0);
    const grandTotalIncome = totalRentalIncome + totalPenaltyIncome;
    const netRevenue = grandTotalIncome - totalRefunds;

    // 4. Map Rental Income Items for Main Ledger
    const incomeList: any[] = [];

    confirmedOrders.forEach((o) => {
      incomeList.push({
        id: `INC-${o.id.slice(-8).toUpperCase()}`,
        trxId: o.orderNumber,
        category: "INCOME",
        type: "Sewa Alat/Jasa",
        user: o.user.name,
        userPhone: o.user.phone || "—",
        amount: o.totalAmount,
        reason: "Pembayaran Lunas Sewa",
        method: o.payments[0]?.method || "Transfer / Gateway",
        date: o.createdAt.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        rawDate: o.createdAt,
        status: "SETTLED",
      });
    });

    confirmedBookings.forEach((b) => {
      incomeList.push({
        id: `INC-STB-${b.id.slice(-6).toUpperCase()}`,
        trxId: `STB-${b.id.slice(-8).toUpperCase()}`,
        category: "INCOME",
        type: `Studio ${b.studio.name}`,
        user: b.user.name,
        userPhone: b.user.phone || "—",
        amount: b.totalPrice,
        reason: "Pembayaran Booking Studio",
        method: "Virtual Account / QRIS",
        date: b.createdAt.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        rawDate: b.createdAt,
        status: "SETTLED",
      });
    });

    const rentalTransactions = [...incomeList, ...refundList].sort(
      (a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime()
    );

    return NextResponse.json({
      summary: {
        totalRentalIncome,
        totalPenaltyIncome,
        grandTotalIncome,
        totalRefunds,
        netRevenue,
        refundCount: refundList.length,
        rentalCount: incomeList.length,
        penaltyCount: penaltyList.length,
      },
      transactions: rentalTransactions.map(({ rawDate, ...rest }) => rest),
      penaltyTransactions: penaltyList.map(({ rawDate, ...rest }) => rest),
    });
  } catch (error) {
    console.error("Error generating finance data:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data monitoring keuangan" },
      { status: 500 }
    );
  }
}
