import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const queryInfo: any = {
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        items: {
          include: {
            equipment: { select: { name: true } },
            service: { select: { name: true } },
          }
        },
      },
    };

    if (userId) {
      queryInfo.where = { userId };
    }

    const orders = (await prisma.order.findMany(queryInfo)) as any[];

    const mappedOrders = orders.map((o) => ({
      id: o.orderNumber,
      dbId: o.id,
      user: o.user.name,
      amount: "Rp " + o.totalAmount.toLocaleString("id-ID"),
      rawAmount: o.totalAmount,
      status: o.status === "PENDING" ? "Menunggu Pembayaran" : 
              o.status === "PROCESSING" ? "Diproses" : 
              o.status === "ACTIVE" ? "Aktif" : 
              o.status === "COMPLETED" ? "Selesai" : 
              o.status === "CANCELLED" ? "Dibatalkan" : "Menunggu",
      date: o.createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      itemStr: o.items.length > 0 
        ? (o.items.length > 1 
            ? `${o.items.length} item dipesan` 
            : o.items[0].equipment 
              ? `Sewa ${o.items[0].equipment.name}` 
              : o.items[0].service 
                ? `Jasa ${o.items[0].service.name}` 
                : "Pesanan Layanan/Sewa") 
        : "Detail",
      userId: o.userId,
      createdAt: o.createdAt,
    }));

    // Retrieve StudioBookings as well to combine in history
    const bookingsQuery: any = {
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        studio: { select: { name: true } },
      },
    };

    if (userId) {
      bookingsQuery.where = { userId };
    }

    const bookings = (await prisma.studioBooking.findMany(bookingsQuery)) as any[];

    const mappedBookings = bookings.map((b) => ({
      id: `STB-${b.id.slice(-8).toUpperCase()}`,
      dbId: b.id,
      user: b.user.name,
      amount: "Rp " + b.totalPrice.toLocaleString("id-ID"),
      rawAmount: b.totalPrice,
      status: b.status === "PENDING" ? "Menunggu Pembayaran" : 
              b.status === "CONFIRMED" ? "Diproses" : 
              b.status === "IN_USE" ? "Aktif" : 
              b.status === "COMPLETED" ? "Selesai" : 
              b.status === "CANCELLED" ? "Dibatalkan" : "Menunggu",
      date: b.date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      itemStr: `Sewa ${b.studio.name} (${b.duration} jam) - ${b.startTime} sd ${b.endTime}`,
      userId: b.userId,
      createdAt: b.createdAt,
    }));

    const combined = [...mappedOrders, ...mappedBookings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(combined);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { userId, items, startDate, endDate, notes, totalAmount } = data;

    if (!userId || !items || !items.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate equipment stock for requested date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      for (const it of items) {
        if (it.equipmentId) {
          const eq = await prisma.equipment.findUnique({
            where: { id: it.equipmentId }
          });

          if (!eq) {
            return NextResponse.json({ error: `Peralatan tidak ditemukan.` }, { status: 404 });
          }

          // Query committed active order items overlap
          const committedItems = await prisma.orderItem.findMany({
            where: {
              equipmentId: it.equipmentId,
              order: {
                status: {
                  notIn: ["CANCELLED", "COMPLETED"]
                },
                startDate: {
                  lte: end
                },
                endDate: {
                  gte: start
                }
              }
            },
            select: {
              quantity: true
            }
          });

          const totalCommitted = committedItems.reduce((sum, item) => sum + item.quantity, 0);
          const availableStock = eq.stock - totalCommitted;

          if (it.quantity > availableStock) {
            return NextResponse.json({
              error: `Stok tidak mencukupi untuk ${eq.name}. Hanya tersedia ${Math.max(0, availableStock)} unit pada tanggal ${startDate} s/d ${endDate} (terpakai ${totalCommitted} dari total ${eq.stock} unit).`
            }, { status: 400 });
          }
        }
      }
    }

    const orderNumber = "ORD-" + Date.now().toString().slice(-6) + Math.floor(10 + Math.random() * 90);

    const created = await prisma.order.create({
      data: {
        orderNumber,
        totalAmount,
        notes,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        userId,
        items: {
          create: items.map((it: any) => ({
            equipmentId: it.equipmentId || null,
            serviceId: it.serviceId || null,
            quantity: it.quantity || 1,
            duration: it.duration || 1,
            price: it.price,
            subtotal: it.price * (it.quantity || 1) * (it.duration || 1),
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
