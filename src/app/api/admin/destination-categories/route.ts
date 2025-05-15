import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";

// GET /api/admin/destination-categories
export async function GET() {
  try {
    const categories = await prisma.destinationCategory.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("[DESTINATION_CATEGORIES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// POST /api/admin/destination-categories
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const iconFile = formData.get("icon") as File;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    let iconUrl = null;

    // Handle icon upload if file exists
    if (iconFile && iconFile.size > 0) {
      try {
        // Convert file to base64
        const bytes = await iconFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileStr = `data:${iconFile.type};base64,${buffer.toString('base64')}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(fileStr, {
          folder: "destination-categories",
          resource_type: "auto",
          allowed_formats: ["jpg", "png", "gif", "webp"],
          transformation: [
            { width: 200, height: 200, crop: "fill" }
          ]
        });

        iconUrl = result.secure_url;
      } catch (error) {
        console.error("[ICON_UPLOAD_ERROR]", error);
        return new NextResponse("Failed to upload icon", { status: 500 });
      }
    }

    // Create category with icon URL
    const category = await prisma.destinationCategory.create({
      data: {
        name,
        description,
        icon: iconUrl,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[DESTINATION_CATEGORIES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 