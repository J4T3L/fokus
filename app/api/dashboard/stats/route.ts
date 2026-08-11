import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    // 1. Calculate Revenue
    const completedOrders = await prisma.order.findMany({
      where: {
        status: {
          in: ["CONFIRMED", "PROCESSING", "ACTIVE", "COMPLETED"],
        },
      },
      select: { totalAmount: true },
    });

    const completedBookings = await prisma.studioBooking.findMany({
      where: {
        status: {
          in: ["CONFIRMED", "IN_USE", "COMPLETED"],
        },
      },
      select: { totalPrice: true },
    });

    const orderRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const bookingRevenue = completedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const revenue = orderRevenue + bookingRevenue;

    // 2. Pending Orders
    const pendingOrdersCount = await prisma.order.count({
      where: { status: "PENDING" },
    });
    const pendingBookingsCount = await prisma.studioBooking.count({
      where: { status: "PENDING" },
    });
    const pendingOrders = pendingOrdersCount + pendingBookingsCount;

    // 3. Active Orders
    const activeOrdersCount = await prisma.order.count({
      where: {
        status: {
          in: ["PROCESSING", "ACTIVE"],
        },
      },
    });
    const activeBookingsCount = await prisma.studioBooking.count({
      where: {
        status: {
          in: ["CONFIRMED", "IN_USE"],
        },
      },
    });
    const activeOrders = activeOrdersCount + activeBookingsCount;

    // 4. New Customers (users with role USER)
    const newCustomers = await prisma.user.count({
      where: { role: "USER" },
    });

    // 5. Active Rentals Preview (Equipment & Studio)
    const activeOrdersList = await prisma.order.findMany({
      where: {
        status: { in: ["PROCESSING", "ACTIVE"] }
      },
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        user: { select: { name: true, phone: true } },
        items: {
          include: {
            equipment: { select: { name: true, brand: true, image: true } }
          }
        }
      }
    });

    const activeBookingsList = await prisma.studioBooking.findMany({
      where: {
        status: { in: ["CONFIRMED", "IN_USE"] }
      },
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        user: { select: { name: true, phone: true } },
        studio: { select: { name: true, image: true } }
      }
    });

    const activeRentalsPreview: any[] = [];

    activeOrdersList.forEach((o) => {
      const itemNames = o.items.map(i => i.equipment?.name).filter(Boolean).join(", ") || "Alat Rental";
      activeRentalsPreview.push({
        id: o.orderNumber,
        category: "Equipment",
        borrower: o.user.name,
        phone: o.user.phone || "—",
        item: itemNames,
        startDate: o.startDate ? o.startDate.toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "—",
        endDate: o.endDate ? o.endDate.toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "—",
        status: o.status === "ACTIVE" ? "Dipinjam" : "Menunggu Pickup",
        amount: o.totalAmount
      });
    });

    activeBookingsList.forEach((b) => {
      activeRentalsPreview.push({
        id: `STB-${b.id.slice(-6).toUpperCase()}`,
        category: "Studio",
        borrower: b.user.name,
        phone: b.user.phone || "—",
        item: `Studio ${b.studio.name}`,
        startDate: b.date.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
        endDate: `${b.startTime} - ${b.endTime}`,
        status: b.status === "IN_USE" ? "Sesi Berlangsung" : "Terjadwal",
        amount: b.totalPrice
      });
    });

    // 6. Recent Payments Preview (with proof image)
    const recentPayments = await prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          include: {
            user: { select: { name: true } }
          }
        }
      }
    });

    const paymentsPreview = recentPayments.map((p) => ({
      id: p.id,
      orderNumber: p.order.orderNumber,
      user: p.order.user.name,
      amount: p.amount,
      method: p.method,
      status: p.status,
      proofImage: p.proofImage,
      date: p.createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    }));

    // 7. System Logs
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    });

    const recentBookings = await prisma.studioBooking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        studio: { select: { name: true } },
      },
    });

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    const logs: { id: string; time: string; action: string; rawDate: Date }[] = [];

    recentOrders.forEach((o) => {
      logs.push({
        id: `log-ord-${o.id}`,
        time: o.createdAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        action: `Pesanan Baru ${o.orderNumber} oleh ${o.user.name} senilai Rp ${o.totalAmount.toLocaleString("id-ID")}`,
        rawDate: o.createdAt,
      });
    });

    recentBookings.forEach((b) => {
      logs.push({
        id: `log-stb-${b.id}`,
        time: b.createdAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        action: `Booking Baru ${b.studio.name} oleh ${b.user.name} (${b.duration} jam)`,
        rawDate: b.createdAt,
      });
    });

    recentUsers.forEach((u) => {
      if (u.role === "USER") {
        logs.push({
          id: `log-usr-${u.id}`,
          time: u.createdAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          action: `Pengguna Baru ${u.name} mendaftar ke Fokus Studio`,
          rawDate: u.createdAt,
        });
      }
    });

    const sortedLogs = logs
      .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime())
      .slice(0, 8)
      .map(({ id, time, action }) => ({ id, time, action }));

    // 8. Monthly Earnings calculation
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const completedOrdersPast6Months = await prisma.order.findMany({
      where: {
        status: { in: ["CONFIRMED", "PROCESSING", "ACTIVE", "COMPLETED"] },
        createdAt: { gte: sixMonthsAgo }
      },
      select: { totalAmount: true, createdAt: true, orderNumber: true, user: { select: { name: true } } }
    });

    const completedBookingsPast6Months = await prisma.studioBooking.findMany({
      where: {
        status: { in: ["CONFIRMED", "IN_USE", "COMPLETED"] },
        createdAt: { gte: sixMonthsAgo }
      },
      select: { totalPrice: true, createdAt: true, id: true, studio: { select: { name: true } }, user: { select: { name: true } } }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const monthlyTracker: { [key: string]: number } = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthlyTracker[key] = 0;
    }

    completedOrdersPast6Months.forEach(o => {
      const m = new Date(o.createdAt);
      const key = `${monthNames[m.getMonth()]} ${m.getFullYear().toString().slice(-2)}`;
      if (monthlyTracker[key] !== undefined) {
        monthlyTracker[key] += o.totalAmount;
      }
    });

    completedBookingsPast6Months.forEach(b => {
      const m = new Date(b.createdAt);
      const key = `${monthNames[m.getMonth()]} ${m.getFullYear().toString().slice(-2)}`;
      if (monthlyTracker[key] !== undefined) {
        monthlyTracker[key] += b.totalPrice;
      }
    });

    const monthlyEarnings = Object.keys(monthlyTracker).map(month => ({
      month,
      amount: monthlyTracker[month]
    }));

    const transactionsList: any[] = [];
    completedOrdersPast6Months.forEach(o => {
      transactionsList.push({
        id: o.orderNumber,
        rawDate: o.createdAt,
        date: o.createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        user: o.user.name,
        type: "Sewa Alat/Jasa",
        amount: o.totalAmount
      });
    });

    completedBookingsPast6Months.forEach(b => {
      transactionsList.push({
        id: `STB-${b.id.slice(-8).toUpperCase()}`,
        rawDate: b.createdAt,
        date: b.createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        user: b.user.name,
        type: `Studio ${b.studio.name}`,
        amount: b.totalPrice
      });
    });

    transactionsList.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

    const stats = {
      revenue,
      pendingOrders,
      activeOrders,
      newCustomers,
      activeRentalsPreview,
      paymentsPreview,
      systemLogs: sortedLogs.length > 0 ? sortedLogs : [
        { id: "log-default", time: "09:00", action: "Sistem Fokus Studio berjalan normal." }
      ],
      monthlyEarnings,
      transactions: transactionsList.map(({ id, date, user, type, amount }) => ({ id, date, user, type, amount }))
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error generating dashboard stats:", error);
    return NextResponse.json({ error: "Failed to generate stats" }, { status: 500 });
  }
}
