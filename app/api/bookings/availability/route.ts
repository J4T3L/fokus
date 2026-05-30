import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studioId = searchParams.get("studioId");
    const dateStr = searchParams.get("date");

    if (!studioId) {
      return NextResponse.json({ error: "studioId is required" }, { status: 400 });
    }

    const whereClause: any = {
      studioId,
      status: {
        in: ["PENDING", "CONFIRMED", "IN_USE"], // exclude CANCELLED and COMPLETED for future slot blocking (completed is past anyway)
      },
    };

    if (dateStr) {
      const date = new Date(dateStr);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      whereClause.date = {
        gte: today,
      };
    }

    const bookings = await prisma.studioBooking.findMany({
      where: whereClause,
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        duration: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Failed to fetch availability:", error);
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}
