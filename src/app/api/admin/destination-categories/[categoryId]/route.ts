import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

// GET /api/admin/destination-categories/[categoryId]
export async function GET(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  const { categoryId } = params;

  if (!categoryId) {
    return new NextResponse("Category ID is required", { status: 400 });
  }

  try {
    const category = await prisma.destinationCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return new NextResponse("Category not found", { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("[DESTINATION_CATEGORY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PUT /api/admin/destination-categories/[categoryId]
export async function PUT(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  const { categoryId } = params;

  if (!categoryId) {
    return new NextResponse("Category ID is required", { status: 400 });
  }

  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const iconFile = formData.get("icon") as File;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const currentCategory = await prisma.destinationCategory.findUnique({
      where: { id: categoryId },
    });

    if (!currentCategory) {
      return new NextResponse("Category not found", { status: 404 });
    }

    let iconUrl = currentCategory.icon;

    if (iconFile && iconFile.size > 0) {
      try {
        const bytes = await iconFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileStr = `data:${iconFile.type};base64,${buffer.toString(
          "base64"
        )}`;

        const result = await cloudinary.uploader.upload(fileStr, {
          folder: "destination-categories",
          resource_type: "auto",
          allowed_formats: ["jpg", "png", "gif", "webp"],
          transformation: [{ width: 200, height: 200, crop: "fill" }],
        });

        iconUrl = result.secure_url;

        if (currentCategory.icon) {
          const parts = currentCategory.icon.split("/");
          const publicIdWithExt = parts[parts.length - 1];
          const publicId = publicIdWithExt.split(".")[0];
          await cloudinary.uploader.destroy(
            `destination-categories/${publicId}`
          );
        }
      } catch (error) {
        console.error("[ICON_UPLOAD_ERROR]", error);
        return new NextResponse("Failed to upload icon", { status: 500 });
      }
    }

    const category = await prisma.destinationCategory.update({
      where: { id: categoryId },
      data: { name, description, icon: iconUrl },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[DESTINATION_CATEGORY_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// DELETE /api/admin/destination-categories/[categoryId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  const { categoryId } = params;

  if (!categoryId) {
    return new NextResponse("Category ID is required", { status: 400 });
  }

  try {
    const category = await prisma.destinationCategory.findUnique({
      where: { id: categoryId },
    });

    if (category?.icon) {
      const parts = category.icon.split("/");
      const publicIdWithExt = parts[parts.length - 1];
      const publicId = publicIdWithExt.split(".")[0];
      await cloudinary.uploader.destroy(`destination-categories/${publicId}`);
    }

    // Get all tourist destinations in this category
    const destinations = await prisma.touristDestination.findMany({
      where: { categoryId: categoryId },
      select: { id: true, thumbnailUrl: true }
    });

    // Delete all related data for each destination
    for (const destination of destinations) {
      // Delete thumbnail from Cloudinary if exists
      if (destination.thumbnailUrl) {
        const publicId = destination.thumbnailUrl.split('/').pop()?.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      // Delete all related pengunjung records first
      await prisma.pengunjung.deleteMany({ where: { destinasi_wisata_id: destination.id } });
      
      // Delete all related booking transactions
      await prisma.booking_transaction.deleteMany({ where: { destinasi_wisata_id: destination.id } });
      
      // Delete all related photos
      await prisma.destinationPhoto.deleteMany({ where: { destinationId: destination.id } });
      
      // Delete all related tickets
      await prisma.ticket.deleteMany({ where: { destinationId: destination.id } });
      
      // Delete all related complaints
      await prisma.complaint.deleteMany({ where: { destinationId: destination.id } });
      
      // Delete all related reviews
      await prisma.destinationReview.deleteMany({ where: { destinationId: destination.id } });
    }

    // Delete all tourist destinations in this category
    await prisma.touristDestination.deleteMany({
      where: { categoryId: categoryId },
    });

    // Delete the category
    await prisma.destinationCategory.delete({
      where: { id: categoryId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DESTINATION_CATEGORY_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
