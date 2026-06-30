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

    // Try Cloudinary first
    try {
      const cloudinaryUrl = await uploadToCloudinary(buffer, filename);
      if (cloudinaryUrl) {
        return NextResponse.json({
          success: true,
          url: cloudinaryUrl
        });
      }
    } catch (clError) {
      console.error("Cloudinary upload failed, using local fallback:", clError);
    }
    
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    // Create uploads folder if it doesn't exist
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    return NextResponse.json({ 
      success: true, 
      url: `/uploads/${filename}` 
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Gagal mengunggah berkas foto" }, { status: 500 });
  }
}
