import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const destinationId = formData.get("destinationId") as string;
        const caption = formData.get("caption") as string;
        const photoType = formData.get("photoType") as string;
        const imageFile = formData.get("photo") as File;

        if (!destinationId) {
            return new NextResponse("Destination ID is required", { status: 400 });
        }

        if (!imageFile) {
            return new NextResponse("Photo is required", { status: 400 });
        }

        // Check if destination exists
        const destination = await prisma.touristDestination.findUnique({
            where: { id: destinationId }
        });

        if (!destination) {
            return new NextResponse("Destination not found", { status: 404 });
        }

        let filePath = null;

        // Handle image upload
        if (imageFile && imageFile.size > 0) {
            try {
                // Convert file to base64
                const bytes = await imageFile.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const fileStr = `data:${imageFile.type};base64,${buffer.toString('base64')}`;

                // Upload to Cloudinary
                const result = await cloudinary.uploader.upload(fileStr, {
                    folder: "destination-photos",
                    resource_type: "auto",
                    allowed_formats: ["jpg", "png", "gif", "webp"],
                    transformation: [
                        { width: 1200, height: 800, crop: "fill" }
                    ]
                });

                filePath = result.secure_url;
            } catch (error) {
                console.error("[PHOTO_UPLOAD_ERROR]", error);
                return new NextResponse("Failed to upload photo", { status: 500 });
            }
        }

        // Create destination photo
        const photo = await prisma.destinationPhoto.create({
            data: {
                destinationId,
                caption,
                filePath: filePath || '',
                photoType: photoType as "MAIN" | "GALLERY"
            }
        });

        return NextResponse.json(photo);
    } catch (error) {
        console.error("[DESTINATION_PHOTOS_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url); // ambil parameter dari url
        //google.com/api?destinationId=123
        const destinationId = searchParams.get("destinationId"); // ambil destinationId dari url

        if (!destinationId) {
            return new NextResponse("Destination ID is required", { status: 400 });
        }

        const photos = await prisma.destinationPhoto.findMany({
            where: {
                destinationId
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json(photos);
    } catch (error) {
        console.error("[DESTINATION_PHOTOS_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
} 