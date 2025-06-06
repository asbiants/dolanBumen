import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getConsumerFromToken, getAdminFromToken } from '@/lib/auth';
import { successResponse, unauthorizedResponse, serverErrorResponse, errorResponse, validateRequiredFields } from '@/lib/api-utils';
import { ComplaintStatus } from '@prisma/client';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromToken();
  if (admin) {
    try {
      const complaint = await prisma.complaint.findUnique({
        where: { id: params.id },
        include: {
          user: { select: { name: true, email: true } },
          destination: { select: { id: true, name: true } },
        },
      });
      if (!complaint) return errorResponse("Complaint not found", 404);
      return successResponse(complaint);
    } catch (error) {
      return serverErrorResponse();
    }
  }
  // If not admin, check consumer
  const consumer = await getConsumerFromToken();
  if (consumer) {
    try {
      const complaint = await prisma.complaint.findFirst({
        where: {
          id: params.id,
          userId: consumer.id,
        },
        select: {
          id: true,
          jenis: true,
          deskripsi: true,
          status: true,
          response: true,
          responseDate: true,
          createdAt: true,
          attachment: true,
          destination: { select: { name: true } },
          admin: { select: { name: true } },
        },
      });
      if (!complaint) return errorResponse("Pengaduan tidak ditemukan", 404);
      const complaintWithFileUrl = { ...complaint, fileUrl: complaint.attachment };
      return NextResponse.json({ complaint: complaintWithFileUrl });
    } catch (error) {
      return serverErrorResponse();
    }
  }
  return unauthorizedResponse();
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromToken();
  if (!admin) return unauthorizedResponse();
  try {
    const data = await req.json();
    const requiredFields = ["status", "response"];
    const validationError = validateRequiredFields(data, requiredFields);
    if (validationError) return errorResponse(validationError);
    if (!Object.values(ComplaintStatus).includes(data.status)) return errorResponse("Invalid complaint status");
    const complaint = await prisma.complaint.update({
      where: { id: params.id },
      data: {
        status: data.status,
        response: data.response,
        responseDate: new Date(),
        adminId: admin.id
      },
      include: {
        user: { select: { name: true, email: true } },
        destination: { select: { id: true, name: true } },
      }
    });
    return successResponse(complaint, "Complaint updated successfully");
  } catch (error) {
    return serverErrorResponse();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromToken();
  if (!admin) return unauthorizedResponse();
  try {
    await prisma.complaint.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus pengaduan', detail: error instanceof Error ? error.message : error }, { status: 500 });
  }
} 