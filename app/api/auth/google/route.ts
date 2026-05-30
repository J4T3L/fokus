import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@/app/context/AuthContext";

export async function POST(request: Request) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json(
        { success: false, message: "Token kredensial Google tidak ditemukan" },
        { status: 400 }
      );
    }

    // Verifikasi token via Google API tokeninfo
    const tokenVerificationUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`;
    const verifyRes = await fetch(tokenVerificationUrl);

    if (!verifyRes.ok) {
      const errText = await verifyRes.text();
      console.error("Google token verification failed:", errText);
      return NextResponse.json(
        { success: false, message: "Token Google tidak valid atau kedaluwarsa" },
        { status: 400 }
      );
    }

    const payload = await verifyRes.json();

    // Pastikan email telah terverifikasi oleh Google
    if (payload.email_verified !== "true" && payload.email_verified !== true) {
      return NextResponse.json(
        { success: false, message: "Email Google Anda belum terverifikasi" },
        { status: 400 }
      );
    }

    // Validasi Client ID jika dikonfigurasi di env
    const expectedAud = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (
      expectedAud &&
      expectedAud !== "your-google-client-id.apps.googleusercontent.com" &&
      payload.aud !== expectedAud
    ) {
      console.error("Audience mismatch:", payload.aud, "expected:", expectedAud);
      return NextResponse.json(
        { success: false, message: "Keamanan Otorisasi Gagal (Client ID mismatch)" },
        { status: 400 }
      );
    }

    const email = payload.email;
    const name = payload.name || payload.given_name || email.split("@")[0];
    const picture = payload.picture || null;

    // Cari user di database
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Buat password acak dengan entropy tinggi untuk keamanan
      const randomPassword = await bcrypt.hash(
        Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
        10
      );

      user = await prisma.user.create({
        data: {
          name,
          email,
          password: randomPassword,
          avatar: picture,
          role: "USER", // Default role
        },
      });
    } else {
      // Jika user sudah ada tetapi belum memiliki foto profil, pasang foto profil Google-nya
      if (!user.avatar && picture) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatar: picture },
        });
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase() as Role,
        phone: user.phone || undefined,
        address: user.address || undefined,
        avatar: user.avatar || undefined,
        joinedAt: user.createdAt.toISOString().split("T")[0],
      },
    });
  } catch (error) {
    console.error("Google Auth Backend Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem saat memproses login Google" },
      { status: 500 }
    );
  }
}
