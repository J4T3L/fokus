import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { BookingStatus } from "../../../generated/prisma/client";

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const { date, startTime, endTime, status, notes, studioId } = data;

    const existing = await prisma.studioBooking.findUnique({
      where: { id },
      include: { studio: true }
    });

    if (!existing) {
      return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
    }

    const finalStudioId = studioId || existing.studioId;
    const finalDate = date ? new Date(date) : existing.date;
    const finalStartTime = startTime || existing.startTime;
    const finalEndTime = endTime || existing.endTime;
    const finalStatus = status || existing.status;
    const finalNotes = notes !== undefined ? notes : existing.notes;

    // Check for double booking if date/time/studio changed
    if (date || startTime || endTime || studioId) {
      const startOfDay = new Date(finalDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(finalDate);
      endOfDay.setHours(23, 59, 59, 999);

      const conflicts = await prisma.studioBooking.findMany({
        where: {
          studioId: finalStudioId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
          id: {
            not: id // Exclude current booking
          },
          status: {
            notIn: ["CANCELLED"]
          }
        }
      });

      const newStart = timeToMinutes(finalStartTime);
      const newEnd = timeToMinutes(finalEndTime);

      for (const b of conflicts) {
        const exStart = timeToMinutes(b.startTime);
        const exEnd = timeToMinutes(b.endTime);

        const overlapStart = Math.max(newStart, exStart);
        const overlapEnd = Math.min(newEnd + 30, exEnd + 30); // 30 minutes cooldown

        if (overlapStart < overlapEnd) {
          let blockEndHours = Math.floor((exEnd + 30) / 60);
          const blockEndMins = (exEnd + 30) % 60;
          if (blockEndHours >= 24) blockEndHours = blockEndHours % 24;
          const blockEndStr = `${blockEndHours < 10 ? "0" : ""}${blockEndHours}:${blockEndMins < 10 ? "0" : ""}${blockEndMins}`;

          return NextResponse.json({
            error: `Studio sudah dipesan pada jam ${b.startTime} - ${b.endTime}. Slot tidak tersedia hingga jam ${blockEndStr} karena jeda cooldown.`
          }, { status: 400 });
        }
      }
    }

    // Recalculate duration & totalPrice if needed
    let finalDuration = existing.duration;
    let finalTotalPrice = existing.totalPrice;

    if (startTime || endTime || studioId) {
      const studio = await prisma.studio.findUnique({
        where: { id: finalStudioId }
      });
      const startMins = timeToMinutes(finalStartTime);
      const endMins = timeToMinutes(finalEndTime);
      finalDuration = Math.ceil((endMins - startMins) / 60);
      if (finalDuration <= 0) {
        return NextResponse.json({ error: "Waktu selesai harus setelah waktu mulai" }, { status: 400 });
      }
      finalTotalPrice = finalDuration * (studio?.pricePerHour || existing.studio.pricePerHour);
    }

    const updated = await prisma.studioBooking.update({
      where: { id },
      data: {
        date: finalDate,
        startTime: finalStartTime,
        endTime: finalEndTime,
        duration: finalDuration,
        totalPrice: finalTotalPrice,
        status: finalStatus as BookingStatus,
        notes: finalNotes,
        studioId: finalStudioId,
      },
      include: {
        user: { select: { name: true } },
        studio: { select: { name: true } }
      }
    });

    return NextResponse.json({
      id: updated.id,
      user: updated.user.name,
      studio: updated.studio.name,
      date: updated.date.toISOString().split("T")[0],
      startTime: updated.startTime,
      endTime: updated.endTime,
      duration: updated.duration,
      status: updated.status,
      totalPrice: updated.totalPrice,
      notes: updated.notes,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json({ error: "Gagal memperbarui pesanan" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.studioBooking.delete({
      where: { id }
    });
    return NextResponse.json({ success: true, message: "Booking berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json({ error: "Gagal menghapus booking" }, { status: 500 });
  }
}
