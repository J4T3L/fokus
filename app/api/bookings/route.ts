import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { sendBookingNotificationEmail } from "@/app/lib/email";

export async function GET() {
  try {
    const bookings = await prisma.studioBooking.findMany({
      orderBy: { date: "asc" },
      include: {
        user: { select: { name: true } },
        studio: { select: { name: true } },
      }
    });

    const now = new Date();
    const mapped = [];

    for (const b of bookings) {
      const bookingYear = b.date.getFullYear();
      const bookingMonth = b.date.getMonth();
      const bookingDay = b.date.getDate();

      const [startH, startM] = b.startTime.split(":").map(Number);
      const [endH, endM] = b.endTime.split(":").map(Number);

      const startDateTime = new Date(bookingYear, bookingMonth, bookingDay, startH, startM);
      const endDateTime = new Date(bookingYear, bookingMonth, bookingDay, endH, endM);

      let currentStatus = b.status;

      if (currentStatus !== "CANCELLED" && currentStatus !== "COMPLETED") {
        if (now >= endDateTime) {
          currentStatus = "COMPLETED";
        } else if (now >= startDateTime && currentStatus !== "IN_USE") {
          currentStatus = "IN_USE";
        }
      }

      if (currentStatus !== b.status) {
        await prisma.studioBooking.update({
          where: { id: b.id },
          data: { status: currentStatus },
        });
      }

      mapped.push({
        id: b.id,
        user: b.user.name,
        studio: b.studio.name,
        date: b.date.toISOString().split("T")[0],
        startTime: b.startTime,
        endTime: b.endTime,
        duration: b.duration,
        status: currentStatus,
        totalPrice: b.totalPrice,
        notes: b.notes,
      });
    }

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { userId, studioId, date, startTime, endTime, duration, totalPrice, notes } = data;

    if (!userId || !studioId || !date || !startTime || !endTime || !duration || !totalPrice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Double-booking check with 30 minutes cooldown
    const bookingDate = new Date(date);
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await prisma.studioBooking.findMany({
      where: {
        studioId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          notIn: ["CANCELLED"]
        }
      }
    });

    const newStart = timeToMinutes(startTime);
    const newEnd = timeToMinutes(endTime);

    for (const b of existingBookings) {
      const exStart = timeToMinutes(b.startTime);
      const exEnd = timeToMinutes(b.endTime);

      const overlapStart = Math.max(newStart, exStart);
      const overlapEnd = Math.min(newEnd + 30, exEnd + 30);

      if (overlapStart < overlapEnd) {
        let blockEndHours = Math.floor((exEnd + 30) / 60);
        const blockEndMins = (exEnd + 30) % 60;
        if (blockEndHours >= 24) {
          blockEndHours = blockEndHours % 24;
        }
        const blockEndStr = `${blockEndHours < 10 ? "0" : ""}${blockEndHours}:${blockEndMins < 10 ? "0" : ""}${blockEndMins}`;

        return NextResponse.json({
          error: `Studio sudah dipesan pada jam ${b.startTime} - ${b.endTime}. Dengan cooldown 30 menit, slot tidak tersedia hingga jam ${blockEndStr}.`
        }, { status: 400 });
      }
    }

    const created = await prisma.studioBooking.create({
      data: {
        userId,
        studioId,
        date: new Date(date),
        startTime,
        endTime,
        duration,
        totalPrice,
        notes,
        status: "PENDING",
      },
    });

    // Send email notification to user asynchronously
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      });
      if (user?.email) {
        const fullBooking = await prisma.studioBooking.findUnique({
          where: { id: created.id },
          include: {
            studio: { select: { name: true } }
          }
        });
        await sendBookingNotificationEmail(fullBooking, user.email);
      }
    } catch (emailErr) {
      console.error("Failed to send booking email:", emailErr);
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating studio booking:", error);
    return NextResponse.json({ error: "Failed to create studio booking" }, { status: 500 });
  }
}
