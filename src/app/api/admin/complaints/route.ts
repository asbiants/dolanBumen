import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-for-development";

async function getAdminFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    if (!["SUPER_ADMIN", "TOURISM_ADMIN"].includes(decoded.role)) return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function GET() {
  const admin = await getAdminFromToken();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const complaints = await prisma.complaint.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      destination: { select: { name: true } },
    },
  });
  return NextResponse.json({ complaints });
}

export async function PUT(req: NextRequest) {
  const admin = await getAdminFromToken();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status, response } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
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
  const admin = await getAdminFromToken();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  try {
    await prisma.complaint.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus pengaduan", detail: error instanceof Error ? error.message : error }, { status: 500 });
  }
} 