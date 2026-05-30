import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { Role } from "../../../generated/prisma/client";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let prismaRole: Role | undefined;
    if (data.role) {
      const r = data.role.toUpperCase();
      if (r === "ADMIN" || r === "SUPERUSER" || r === "USER") {
        prismaRole = r as Role;
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : existing.name,
        email: data.email !== undefined ? data.email : existing.email,
        phone: data.phone !== undefined ? data.phone : existing.phone,
        address: data.address !== undefined ? data.address : existing.address,
        role: prismaRole !== undefined ? prismaRole : existing.role,
        avatar: data.avatar !== undefined ? data.avatar : existing.avatar,
        isActive: data.isActive !== undefined ? data.isActive : existing.isActive,
      },
    });

    const { password, ...details } = updated;
    const mapped = {
      ...details,
      role: details.role.toLowerCase(),
      joinedAt: details.createdAt.toISOString().split("T")[0],
    };

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if there are related bookings or orders
    const hasBookings = await prisma.studioBooking.findFirst({
      where: { userId: id },
    });
    const hasOrders = await prisma.order.findFirst({
      where: { userId: id },
    });

    if (hasBookings || hasOrders) {
      await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({ message: "User has active transactions. Marked as inactive instead." });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
