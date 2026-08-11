import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { uploadToCloudinary } from "@/app/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan dalam request" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.name) || ".png";
    const filename = uniqueSuffix + ext;

    // 1. Try Cloudinary first (Permanent Cloud Storage for Production)
    try {
      const cloudinaryUrl = await uploadToCloudinary(buffer, filename);
      if (cloudinaryUrl) {
        return NextResponse.json({
          success: true,
          url: cloudinaryUrl
        });
      }
    } catch (clError) {
      console.error("Cloudinary upload failed, checking local/base64 fallback:", clError);
    }

    // 2. Try writing to local disk (For Local Dev / VPS Hosting)
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);

      return NextResponse.json({ 
        success: true, 
        url: `/uploads/${filename}` 
      });
    } catch (fsError) {
      console.warn("Local filesystem is read-only (Serverless hosting), using Base64 Data URL fallback:", fsError);

      // 3. Fallback to Base64 Data URL for Serverless Hosting (Vercel, Netlify, Render)
      const mimeType = file.type || "image/png";
      const base64String = buffer.toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64String}`;

      return NextResponse.json({
        success: true,
        url: dataUrl
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Gagal mengunggah berkas foto" }, { status: 500 });
  }
}
