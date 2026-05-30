import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isVisible: true },
      include: {
        user: { select: { name: true, role: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, text, rating } = await request.json();

    if (!userId || !text || rating === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const created = await prisma.testimonial.create({
      data: {
        userId,
        text,
        rating: Number(rating),
        isVisible: true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 });
  }
}
