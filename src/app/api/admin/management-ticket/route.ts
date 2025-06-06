import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { successResponse, serverErrorResponse, unauthorizedResponse } from '@/lib/api-utils';
import { getAdminFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromToken();
    if (!admin) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const kode = searchParams.get('kode');
    const destinasi = searchParams.get('destinasi');

    const bookings = await prisma.booking_transaction.findMany({
      where: {
        ...(kode ? { booking_trx_id: kode } : {}),
        ...(destinasi ? { destinasi_wisata_id: destinasi } : {})
      },
      orderBy: { tanggal: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        tourist_destination: { select: { id: true, name: true } },
        pengunjung: true,
      },
    });
    return successResponse(bookings);
  } catch (error) {
    console.error('[ADMIN_MANAGEMENT_TICKET_GET]', error);
    return serverErrorResponse();
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getAdminFromToken();
    if (!admin) return unauthorizedResponse();
    const body = await req.json();
    const { id, is_paid } = body;
    if (!id || typeof is_paid !== 'boolean') {
      return serverErrorResponse('ID dan is_paid wajib diisi');
    }
    const updated = await prisma.booking_transaction.update({
      where: { id: Number(id) },
      data: { is_paid },
    });
    return successResponse(updated, 'Status tiket berhasil diupdate');
  } catch (error) {
    console.error('[ADMIN_MANAGEMENT_TICKET_PATCH]', error);
    return serverErrorResponse();
  }
} 