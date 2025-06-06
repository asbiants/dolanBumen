import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";
import { getAdminFromToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse, validateRequiredFields } from "@/lib/api-utils";

// GET /api/admin/tourist-destinations
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get("categoryId");

        const destinations = await prisma.touristDestination.findMany({
            where: {
                ...(categoryId && { categoryId }),
            },
            include: {
                category: true,
                reviews: {
                    select: {
                        rating: true,
                    }
                }
            },
        });

        // Calculate average rating for each destination
        const destinationsWithAvgRating = destinations.map(dest => {
            const totalRating = dest.reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
            const averageRating = dest.reviews.length > 0 ? totalRating / dest.reviews.length : 0;
            const { reviews, ...rest } = dest;
            return {
                ...rest,
                averageRating: parseFloat(averageRating.toFixed(1)),
            };
        });

        // Sort destinations by average rating in descending order
        destinationsWithAvgRating.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));

        return successResponse(destinationsWithAvgRating);
    } catch (error) {
        console.error("[TOURIST_DESTINATIONS_GET]", error);
        return serverErrorResponse();
    }
}

export async function POST(req: Request) {
    try {
        const admin = await getAdminFromToken();
        if (!admin) {
            return unauthorizedResponse();
        }

        const formData = await req.formData();
        const data = {
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            address: formData.get("address") as string,
            categoryName: formData.get("categoryName") as string,
            latitude: formData.get("latitude") as string,
            longitude: formData.get("longitude") as string,
            openingTime: formData.get("openingTime") as string,
            closingTime: formData.get("closingTime") as string,
            imageFile: formData.get("thumbnail") as File,
        };

        // Validate required fields
        const requiredFields = ["name", "categoryName"];
        const validationError = validateRequiredFields(data, requiredFields);
        if (validationError) {
            return errorResponse(validationError);
        }

        // Find category by name
        const category = await prisma.destinationCategory.findFirst({
            where: { name: data.categoryName }
        });

        if (!category) {
            return errorResponse("Category not found", 404);
        }

        let thumbnailUrl = null;

        // Handle image upload if file exists
        if (data.imageFile && data.imageFile.size > 0) {
            try {
                const bytes = await data.imageFile.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const fileStr = `data:${data.imageFile.type};base64,${buffer.toString('base64')}`;

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
                return errorResponse("Failed to upload thumbnail", 500);
            }
        }

        // Create tourist destination
        const destination = await prisma.touristDestination.create({
            data: {
                name: data.name,
                description: data.description,
                address: data.address,
                thumbnailUrl,
                categoryId: category.id,
                latitude: data.latitude ? parseFloat(data.latitude) : null,
                longitude: data.longitude ? parseFloat(data.longitude) : null,
                openingTime: data.openingTime ? new Date(`1970-01-01T${data.openingTime}`) : null,
                closingTime: data.closingTime ? new Date(`1970-01-01T${data.closingTime}`) : null,
                status: "ACTIVE"
            },
            include: {
                category: true
            }
        });

        return successResponse(destination, "Tourist destination created successfully");
    } catch (error) {
        console.error("[TOURIST_DESTINATIONS_POST]", error);
        return serverErrorResponse();
    }
}



