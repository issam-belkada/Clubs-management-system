import { NextResponse } from "next/server";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // ---- FIX: Explicitly type the Promise ----
    const uploadResult: UploadApiResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "nextjs_uploads" }, (error, result) => {
          if (error) reject(error);
          else resolve(result as UploadApiResponse);  // <-- FIXED
        })
        .end(buffer);
    });

    return NextResponse.json({ url: uploadResult.secure_url });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
