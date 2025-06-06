import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getConsumerFromToken, getAdminFromToken } from '@/lib/auth';
import { successResponse, unauthorizedResponse, serverErrorResponse, errorResponse, validateRequiredFields } from '@/lib/api-utils';
import { ComplaintStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  // If admin, return all complaints; if consumer, return only their complaints
  const admin = await getAdminFromToken();
  if (admin) {
    try {
      const complaints = await prisma.complaint.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          destination: { select: { id: true, name: true } },
        },
      });
      return successResponse(complaints);
    } catch (error) {
      return serverErrorResponse();
    }
  }
  // If not admin, check consumer
  const consumer = await getConsumerFromToken();
  if (consumer) {
    try {
      const complaints = await prisma.complaint.findMany({
        where: { userId: consumer.id },
        orderBy: { createdAt: 'desc' },
        include: {
          destination: { select: { id: true, name: true } },
        },
      });
      return successResponse(complaints);
    } catch (error) {
      return serverErrorResponse();
    }
  }
  return unauthorizedResponse();
}

export async function POST(req: NextRequest) {
  // Only consumer can create complaint
  const consumer = await getConsumerFromToken();
  if (!consumer) return unauthorizedResponse();
  try {
    const data = await req.json();
    const requiredFields = ["destinationId", "jenis", "narahubung", "deskripsi", "longitude", "latitude"];
    const validationError = validateRequiredFields(data, requiredFields);
    if (validationError) return errorResponse(validationError);
    const destination = await prisma.touristDestination.findUnique({ where: { id: data.destinationId } });
    if (!destination) return errorResponse("Destination not found", 404);
    const complaint = await prisma.complaint.create({
      data: {
        userId: consumer.id,
        destinationId: data.destinationId,
        jenis: data.jenis,
        narahubung: data.narahubung,
        deskripsi: data.deskripsi,
        longitude: data.longitude,
        latitude: data.latitude,
        attachment: data.attachment,
        status: ComplaintStatus.NEW
      },
      include: {
        destination: { select: { id: true, name: true } },
      }
    });
    return successResponse(complaint, "Complaint submitted successfully");
  } catch (error) {
    return serverErrorResponse();
  }
}

export async function PUT(req: NextRequest) {
  // Only admin can update complaint
  const admin = await getAdminFromToken();
  if (!admin) return unauthorizedResponse();
  const { id, status, response } = await req.json();
  if (!id) return errorResponse("ID required");
  try {
    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        status,
        response,
        responseDate: new Date(),
        adminId: admin.id,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json({ pengaduan: updated });
  } catch (error) {
    return NextResponse.json({ error: "Gagal update pengaduan", detail: error instanceof Error ? error.message : error }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  // Only admin can delete complaint
  const admin = await getAdminFromToken();
  if (!admin) return unauthorizedResponse();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return errorResponse("ID required");
  try {
    await prisma.complaint.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus pengaduan", detail: error instanceof Error ? error.message : error }, { status: 500 });
  }
} 