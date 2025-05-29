import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import * as jwt from 'jsonwebtoken';
import { ComplaintStatus } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-for-development";

async function getAdminFromToken(req: NextRequest) {
  const token = req.cookies.get('admin-token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    if (!["SUPER_ADMIN", "TOURISM_ADMIN"].includes(decoded.role)) return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromToken(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = params;
  const body = await req.json();
  const { status, response } = body;
  if (status && !Object.values(ComplaintStatus).includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }
  const updatedComplaint = await prisma.complaint.update({
    where: { id },
    data: {
      status: status || undefined,
      response: response || undefined,
      responseDate: response ? new Date() : undefined,
      adminId: admin.id,
    },
  });
  return NextResponse.json({ complaint: updatedComplaint });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromToken(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = params;
  try {
    await prisma.complaint.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus pengaduan', detail: error instanceof Error ? error.message : error }, { status: 500 });
  }
} 