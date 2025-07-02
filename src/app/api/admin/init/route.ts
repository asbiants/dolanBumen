import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();
// Skema Validasi Form inputan pada halaman login admin dengan menggunakan zod
const adminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export async function POST(request: Request) {
  try {
    const body = await request.json();
    //Proses Validasi dari form input dengan menggunakan skema validasi adminSchema
    const validationResult = adminSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Data input tidak sesuai format",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }
    const { email, password } = validationResult.data;
    //inisialisasi super admin pada sistem
    const superAdminCount = await prisma.user.count({
      where: {
        role: "SUPER_ADMIN",
      },
    });
    //inisialisasi apabila terdapat super admin maka tidak dapat membuat akun super admin di halaman init
    if (superAdminCount > 0) {
      return NextResponse.json({ message: "Super Admin Sudah Terdapat Pada Sistem" }, { status: 403 });
    }
    //mengecek apakah email sudah terdaftar atau belum
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      return NextResponse.json({ message: "Email telah digunakan" }, { status: 400 });
    }
    //Hash Password dengan bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    //Membuat super admin di halaman inisialisasi
    const newAdmin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "SUPER_ADMIN",
        name: "Super Admin",
      },
    });
    return NextResponse.json(
      {
        message: "Akun Super Admin Berhasil dibuat!",
        user: {
          id: newAdmin.id,
          email: newAdmin.email,
          role: newAdmin.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Proses Pembuatan Akun Super Admin Gagal", error);
    return NextResponse.json({ message: "Gagal Membuat Akun Super Admin" }, { status: 500 });
  }
}
