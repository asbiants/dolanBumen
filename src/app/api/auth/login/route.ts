import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { z } from "zod";

const prisma = new PrismaClient();
// fungsi untuk mendapatkan get json web token untuk mengatur session
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-for-development";

// validasti untuk form login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

//isi dari metode ini yaitu POST
export async function POST(request: Request) {
  try {
    // Parsing data dari request body berupa json
    const body = await request.json();

    // validasi untuk inputan email dan password sesuai dengan skema atau tidak
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Invalid request data",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Find user berdasarkan email yang diinputkan
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // Validasi untuk mengecek jika akun yang login (emial) harus memiliki role admin/superadmin
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "TOURISM_ADMIN")) {
      return NextResponse.json({ message: "Email atau password salah" }, { status: 401 });
    }

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password || "");
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Email atau password salah" }, { status: 401 });
    }

    // Create JWT payload (don't include sensitive info like password)
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    // Generate JWT token with expiration (7 days)
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    // Create response with token and user data
    const response = NextResponse.json({
      message: "Login berhasil",
      user: payload,
      token: token,
    });

    // Set JWT dengan nama cookies admin-token, untuk mengecek status role
    response.cookies.set({
      name: "admin-token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan saat login" }, { status: 500 });
  }
}
