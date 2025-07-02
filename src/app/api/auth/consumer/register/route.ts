import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

// Validation schema form menggunakan zod
const registerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  phoneNumber: z.string().min(1, "Nomor telepon wajib diisi"),
  address: z.string().min(1, "Alamat wajib diisi"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Validasi request data yang diinputkan dengan schema yg dbuat
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Data tidak valid",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }
    const { name, email, password, phoneNumber, address } = validationResult.data;
    // Melakukan cek apakah email sudah digunakan atau belum
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 400 });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Menambahkan data user ke database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phoneNumber,
        address,
        role: "CONSUMER",
      },
    });
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({
      message: "Registrasi berhasil",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan saat registrasi" }, { status: 500 });
  }
}
