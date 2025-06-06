import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";

// PUT /api/admin/destination-categories/[categoryId]
export async function PUT(
  request: Request,
  { params }: { params: { categoryId: string } }
) {
  const categoryId = params.categoryId;
  
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

    // Get current category data
    const currentCategory = await prisma.destinationCategory.findUnique({
      where: { id: categoryId }
    });

    if (!currentCategory) {
      return new NextResponse("Category not found", { status: 404 });
    }

    let iconUrl = currentCategory.icon;

    // Handle icon upload if new file is provided
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

        // Delete old image from Cloudinary if exists
        if (currentCategory.icon) {
          const publicId = currentCategory.icon.split('/').pop()?.split('.')[0];
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
          }
        }
      } catch (error) {
        console.error("[ICON_UPLOAD_ERROR]", error);
        return new NextResponse("Failed to upload icon", { status: 500 });
      }
    }

    // Update category with new data
    const category = await prisma.destinationCategory.update({
      where: {
        id: categoryId,
      },
      data: {
        name,
        description,
        icon: iconUrl,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[DESTINATION_CATEGORY_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// DELETE /api/admin/destination-categories/[categoryId]
export async function DELETE(
  request: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const categoryId = params.categoryId;
    
    if (!categoryId) {
      return new NextResponse("Category ID is required", { status: 400 });
    }
    // Get category data before deleting
    const category = await prisma.destinationCategory.findUnique({
      where: { id: categoryId }
    });

    if (category?.icon) {
      // Delete image from Cloudinary
      const publicId = category.icon.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // Delete category from database
    await prisma.destinationCategory.delete({
      where: {
        id: categoryId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DESTINATION_CATEGORY_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
    req: Request,
    { params }: { params: { categoryId: string } }
) {
    try {
        const { categoryId } = params;

        if (!categoryId) {
            return new NextResponse("Category ID is required", { status: 400 });
        }

        const category = await prisma.destinationCategory.findUnique({
            where: {
                id: categoryId,
            },
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