import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getConsumerFromToken } from '@/lib/auth';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-utils';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const consumer = await getConsumerFromToken();
    if (!consumer) return unauthorizedResponse();

    const tickets = await prisma.booking_transaction.findMany({
      where: { user_id: consumer.id },
      orderBy: { tanggal: 'desc' },
      include: {
        tourist_destination: { select: { id: true, name: true } },
        pengunjung: true,
      },
    });
    return successResponse(tickets);
  } catch (error) {
    console.error('[CONSUMER_TICKETS_GET]', error);
    return serverErrorResponse();
  }
} 