import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";

// GET /api/admin/tourist-destinations
export async function GET() {
    try {
        const destinations = await prisma.touristDestination.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include: { 
                category: true,
            },
        });

        

        return NextResponse.json( destinations);
    } catch (error) {
        console.error("[TOURIST_DESTINATIONS_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
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
            where: {
                name: categoryName
            }
        });

        if (!category) {
            return new NextResponse("Category not found", { status: 404 });
        }

        let thumbnailUrl = null;

        // Handle image upload if file exists
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
            } catch (error) {
                console.error("[THUMBNAIL_UPLOAD_ERROR]", error);
                return new NextResponse("Failed to upload thumbnail", { status: 500 });
            }
        }

        // Create tourist destination
        const destination = await prisma.touristDestination.create({
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
                status: "ACTIVE"
            },
            include: {
                category: true
            }
        });

        return NextResponse.json(destination);
    } catch (error) {
        console.error("[TOURIST_DESTINATIONS_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}



