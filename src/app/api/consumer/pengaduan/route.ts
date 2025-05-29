import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { cloudinary } from '@/lib/cloudinary';
import { cookies } from 'next/headers';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-for-development";

async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('consumer-token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    if (decoded.role !== 'CONSUMER') return null;
    return decoded;
  } catch {
    return null;
  }
}

// POST: Buat pengaduan baru
export async function POST(req: NextRequest) {
  // Ambil user dari token
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const form = await req.formData();
  const destinationId = (form.get('destinationId') as string) || undefined;
  const jenis = (form.get('jenis') as string) || '';
  const narahubung = (form.get('narahubung') as string) || '';
  const deskripsi = (form.get('deskripsi') as string) || '';
  const longitude = (form.get('longitude') as string) || '';
  const latitude = (form.get('latitude') as string) || '';
  const file = form.get('file') as File | null;

  let attachment: string | undefined = undefined;
  if (file && typeof file === 'object' && file.size > 0) {
    // Upload ke Cloudinary (seperti destinasi wisata)
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileStr = `data:${file.type};base64,${buffer.toString('base64')}`;
      const result = await cloudinary.uploader.upload(fileStr, {
        folder: "pengaduan",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
        transformation: [
          { width: 800, height: 600, crop: "limit" }
        ]
      });
      attachment = result.secure_url;
    } catch (error) {
      console.error("[PENGADUAN_UPLOAD_ERROR]", error);
      return NextResponse.json({ error: "Gagal upload foto pengaduan" }, { status: 500 });
    }
  }
  const data: any = {
    userId: user.id,
    destinationId,
    jenis,
    narahubung,
    deskripsi,
    longitude,
    latitude,
    attachment,
    status: 'NEW',
    adminId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Validasi field wajib
  if (!data.destinationId || !data.jenis || !data.narahubung || !data.deskripsi) {
    return NextResponse.json({ error: 'Semua field wajib diisi (tempat, jenis, narahubung, deskripsi)' }, { status: 400 });
  }

  try {
    const pengaduan = await prisma.complaint.create({ data });
    return NextResponse.json({ pengaduan });
  } catch (error) {
    console.error('[PENGADUAN_CREATE_ERROR]', error);
    return NextResponse.json({ error: 'Gagal menyimpan pengaduan', detail: error instanceof Error ? error.message : error }, { status: 500 });
  }
}

// GET: List pengaduan milik user
export async function GET(req: NextRequest) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const complaints = await prisma.complaint.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        destination: { select: { name: true } },
      },
    });
    return NextResponse.json({ complaints });
  } catch (error) {
    console.error('[ADMIN_COMPLAINTS_ERROR]', error);
    return NextResponse.json({ error: 'Gagal mengambil data pengaduan', detail: error instanceof Error ? error.message : error }, { status: 500 });
  }
} 