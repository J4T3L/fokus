import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary only if credentials are set
const isCloudinaryConfigured = 
  !!process.env.CLOUDINARY_CLOUD_NAME && 
  !!process.env.CLOUDINARY_API_KEY && 
  !!process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Uploads a file buffer to Cloudinary.
 * Returns the secure URL of the uploaded file, or null if Cloudinary is not configured.
 */
export async function uploadToCloudinary(fileBuffer: Buffer, filename: string): Promise<string | null> {
  if (!isCloudinaryConfigured) {
    console.log("Cloudinary is not configured. Falling back to local storage.");
    return null;
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: "fokus_uploads",
        public_id: filename.replace(/\.[^/.]+$/, ""), // strip extension
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload stream error:", error);
          reject(error);
        } else {
          resolve(result?.secure_url || null);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
}
