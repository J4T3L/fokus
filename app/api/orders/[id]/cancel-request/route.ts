import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reason, bankInfo, whatsapp } = body;

    if (!reason || !bankInfo || !whatsapp) {
      return NextResponse.json(
        { error: "Alasan pembatalan, informasi nomor rekening, dan nomor WhatsApp wajib diisi." },
        { status: 400 }
      );
    }

    // 1. Try to find Order by orderNumber or ID
    let order = await prisma.order.findUnique({
      where: { orderNumber: id },
    });

    if (!order) {
      order = await prisma.order.findUnique({
        where: { id: id },
      });
    }

    if (order) {
      // Parse existing notes or create structured notes
      let notesObj: any = {};
      try {
        if (order.notes && order.notes.startsWith("{")) {
          notesObj = JSON.parse(order.notes);
        } else {
          notesObj = { userNotes: order.notes || "" };
        }
      } catch {
        notesObj = { userNotes: order.notes || "" };
      }

      notesObj.cancelRequest = {
        requestedAt: new Date().toISOString(),
        reason,
        bankInfo,
        whatsapp,
        status: "PENDING_ACC",
      };

      const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
          notes: JSON.stringify(notesObj),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Pengajuan pembatalan berhasil dikirim. Menunggu persetujuan (ACC) Admin.",
        order: updated,
      });
    }

    // 2. Try to find StudioBooking by ID
    let booking = await prisma.studioBooking.findUnique({
      where: { id: id },
    });

    if (!booking && id.startsWith("STB-")) {
      const suffix = id.replace("STB-", "").toLowerCase();
      const bookings = await prisma.studioBooking.findMany();
      booking = bookings.find((b) => b.id.slice(-8).toLowerCase() === suffix) || null;
    }

    if (booking) {
      let notesObj: any = {};
      try {
        if (booking.notes && booking.notes.startsWith("{")) {
          notesObj = JSON.parse(booking.notes);
        } else {
          notesObj = { userNotes: booking.notes || "" };
        }
      } catch {
        notesObj = { userNotes: booking.notes || "" };
      }

      notesObj.cancelRequest = {
        requestedAt: new Date().toISOString(),
        reason,
        bankInfo,
        whatsapp,
        status: "PENDING_ACC",
      };

      const updated = await prisma.studioBooking.update({
        where: { id: booking.id },
        data: {
          notes: JSON.stringify(notesObj),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Pengajuan pembatalan studio berhasil dikirim. Menunggu persetujuan (ACC) Admin.",
        booking: updated,
      });
    }

    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  } catch (error) {
    console.error("Error submitting cancellation request:", error);
    return NextResponse.json(
      { error: "Gagal mengajukan pembatalan pesanan" },
      { status: 500 }
    );
  }
}
