import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";

// PUT /api/admin/tourist-destinations/[id]
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  if (!id) {
    return new NextResponse("Destination ID is required", { status: 400 });
  }

  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const address = formData.get("address") as string;
    const categoryName = formData.get("categoryName") as string;
    const latitude = formData.get("latitude") as string;
    const longitude = formData.get("longitude") as string;
    const openingTime = formData.get("openingTime") as string;
    const closingTime = formData.get("closingTime") as string;
    const imageFile = formData.get("thumbnail") as File;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }
    if (!categoryName) {
      return new NextResponse("Category name is required", { status: 400 });
    }

    // Find category by name
    const category = await prisma.destinationCategory.findFirst({
      where: { name: categoryName }
    });
    if (!category) {
      return new NextResponse("Category not found", { status: 404 });
    }

    // Get current destination data
    const currentDestination = await prisma.touristDestination.findUnique({
      where: { id }
    });
    if (!currentDestination) {
      return new NextResponse("Destination not found", { status: 404 });
    }

    let thumbnailUrl = currentDestination.thumbnailUrl;
    // Handle image upload if new file is provided
    if (imageFile && imageFile.size > 0) {
      try {
        // Convert file to base64
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileStr = `data:${imageFile.type};base64,${buffer.toString('base64')}`;
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(fileStr, {
          folder: "tourist-destinations",
          resource_type: "auto",
          allowed_formats: ["jpg", "png", "gif", "webp"],
          transformation: [
            { width: 1200, height: 800, crop: "fill" }
          ]
        });
        thumbnailUrl = result.secure_url;
        // Delete old image from Cloudinary if exists
        if (currentDestination.thumbnailUrl) {
          const publicId = currentDestination.thumbnailUrl.split('/').pop()?.split('.')[0];
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
          }
        }
      } catch (error) {
        console.error("[THUMBNAIL_UPLOAD_ERROR]", error);
        return new NextResponse("Failed to upload thumbnail", { status: 500 });
      }
    }

    // Update destination
    const destination = await prisma.touristDestination.update({
      where: { id },
      data: {
        name,
        description,
        address,
        thumbnailUrl,
        categoryId: category.id,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        openingTime: openingTime ? new Date(`1970-01-01T${openingTime}`) : null,
        closingTime: closingTime ? new Date(`1970-01-01T${closingTime}`) : null,
      },
      include: { category: true }
    });
    return NextResponse.json(destination);
  } catch (error) {
    console.error("[TOURIST_DESTINATIONS_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// DELETE /api/admin/tourist-destinations/[id]
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;

  if (!id) {
    return new NextResponse("Destination ID is required", { status: 400 });
  }
  try {
    // Get destination data before deleting
    const destination = await prisma.touristDestination.findUnique({ where: { id } });
    if (destination?.thumbnailUrl) {
      // Delete image from Cloudinary
      const publicId = destination.thumbnailUrl.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }
    // Delete all related photos
    await prisma.destinationPhoto.deleteMany({ where: { destinationId: id } });
    // Delete all related tickets
    await prisma.ticket.deleteMany({ where: { destinationId: id } });
    // Delete destination from database
    await prisma.touristDestination.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[TOURIST_DESTINATIONS_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// GET /api/admin/tourist-destinations/[id]
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return new NextResponse("Destination ID is required", { status: 400 });
  }
  try {
    const destination = await prisma.touristDestination.findUnique({
      where: { id },
      include: { category: true }
    });
    if (!destination) {
      return new NextResponse("Destination not found", { status: 404 });
    }
    // Tambahkan field weekdayPrice dan weekendPrice dummy (karena tidak ada di DB)
    const response = {
      ...destination,
      weekdayPrice: 10000,
      weekendPrice: 15000,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("[TOURIST_DESTINATIONS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 