import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileStr = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary with more options
    const result = await cloudinary.uploader.upload(fileStr, {
      folder: "destination-categories",
      resource_type: "auto",
      allowed_formats: ["jpg", "png", "gif", "webp"],
      transformation: [
        { width: 200, height: 200, crop: "fill" }
      ]
    });

    console.log("Cloudinary upload result:", result); // Debug log

    if (!result.secure_url) {
      throw new Error("No secure URL returned from Cloudinary");
    }

    return NextResponse.json({ 
      url: result.secure_url,
      public_id: result.public_id 
    });
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal error", 
      { status: 500 }
    );
  }
} 